"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { actionSchema } from "@/lib/action-validation";

const PATH = "/tools/multi-channel-marketing/aktionen";
/** The calendar shows only confirmed actions, so a status change affects it too. */
const CALENDAR_PATH = "/tools/multi-channel-marketing";

export type ActionBrand = {
  id: string;
  name: string;
  color: string;
  /** This brand's own discount value within the action (PROJ-12). */
  discount_value: string;
};

/**
 * Draft = planned, not yet booked in the marketplace, invisible in the
 * calendar. Confirmed = really booked, part of the binding year view (PROJ-13).
 */
export type ActionStatus = "draft" | "confirmed";

export type DiscountAction = {
  id: string;
  title: string;
  marketplace_id: string;
  start_date: string;
  end_date: string;
  comment: string | null;
  marketplace_name: string;
  /** One or more brands involved in this action, each with its own value. */
  brands: ActionBrand[];
  status: ActionStatus;
  /** Set only while confirmed: when it was committed and by whom. */
  confirmed_at: string | null;
  /** Snapshot of the confirmer's email, taken when the action was committed. */
  confirmed_by_email: string | null;
};

/** One selected brand plus the discount value entered for it. */
export type ActionBrandInput = {
  brandId: string;
  discountValue: string;
};

export type ActionInput = {
  title: string;
  marketplaceId: string;
  brands: ActionBrandInput[];
  startDate: string;
  endDate: string;
  comment?: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

function validate(input: ActionInput) {
  return actionSchema.safeParse({
    title: input.title,
    marketplaceId: input.marketplaceId,
    brands: input.brands,
    startDate: input.startDate,
    endDate: input.endDate,
    comment: input.comment ?? "",
  });
}

function toRow(input: ActionInput) {
  const comment = (input.comment ?? "").trim();
  return {
    title: input.title.trim(),
    marketplace_id: input.marketplaceId,
    start_date: input.startDate,
    end_date: input.endDate,
    comment: comment.length > 0 ? comment : null,
  };
}

/**
 * De-duplicates the selected brands (a brand can only be linked once per
 * action). If the same brand appears twice, the last entry wins — the form
 * cannot produce that, but a direct server call could.
 */
function uniqueBrands(input: ActionInput): ActionBrandInput[] {
  const byId = new Map<string, ActionBrandInput>();
  for (const brand of input.brands) {
    byId.set(brand.brandId, {
      brandId: brand.brandId,
      discountValue: brand.discountValue.trim(),
    });
  }
  return [...byId.values()];
}

/** Normalises a PostgREST embedded relation that may come back as object or array. */
function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Creates an action in the given state. `status` is deliberately a separate
 * argument rather than a form field: it is chosen by which save button was
 * pressed, not typed by the user.
 */
export async function createAction(
  input: ActionInput,
  status: ActionStatus = "confirmed",
): Promise<ActionResult> {
  const parsed = validate(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  if (status !== "draft" && status !== "confirmed") {
    return { ok: false, message: "Ungültiger Status." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { data: created, error } = await supabase
    .from("discount_actions")
    .insert({
      ...toRow(input),
      status,
      // A brand-new action is only "confirmed by" someone if it goes straight
      // into the calendar; a draft carries no approval.
      confirmed_by: status === "confirmed" ? user.id : null,
      confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
      confirmed_by_email: status === "confirmed" ? (user.email ?? null) : null,
    })
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, message: "Aktion konnte nicht angelegt werden." };
  }

  const links = uniqueBrands(input).map((brand) => ({
    action_id: created.id,
    brand_id: brand.brandId,
    discount_value: brand.discountValue,
  }));
  const { error: linkError } = await supabase
    .from("discount_action_brands")
    .insert(links);
  if (linkError) {
    // Roll back the orphaned action so we never persist one without brands.
    await supabase.from("discount_actions").delete().eq("id", created.id);
    return { ok: false, message: "Aktion konnte nicht angelegt werden." };
  }

  revalidatePath(PATH);
  revalidatePath(CALENDAR_PATH);
  return { ok: true };
}

export async function updateAction(
  id: string,
  input: ActionInput,
): Promise<ActionResult> {
  const parsed = validate(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { data: updated, error } = await supabase
    .from("discount_actions")
    .update(toRow(input))
    .eq("id", id)
    .select("id");
  if (error) {
    return { ok: false, message: "Aktion konnte nicht gespeichert werden." };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, message: "Diese Aktion existiert nicht mehr." };
  }

  // Sync the brand assignments. Write the new set first, THEN remove links no
  // longer selected. Doing it in this order guarantees the action never
  // momentarily has zero brands — otherwise the "delete action when no brands"
  // trigger would remove it during an edit.
  // `ignoreDuplicates: false` is required since PROJ-12: an existing link must
  // be UPDATED when only its discount value changed, not silently skipped.
  const brands = uniqueBrands(input);
  const { error: upsertError } = await supabase
    .from("discount_action_brands")
    .upsert(
      brands.map((brand) => ({
        action_id: id,
        brand_id: brand.brandId,
        discount_value: brand.discountValue,
      })),
      { onConflict: "action_id,brand_id", ignoreDuplicates: false },
    );
  if (upsertError) {
    return { ok: false, message: "Aktion konnte nicht gespeichert werden." };
  }
  const { error: pruneError } = await supabase
    .from("discount_action_brands")
    .delete()
    .eq("action_id", id)
    .not("brand_id", "in", `(${brands.map((b) => b.brandId).join(",")})`);
  if (pruneError) {
    return { ok: false, message: "Aktion konnte nicht gespeichert werden." };
  }

  revalidatePath(PATH);
  revalidatePath(CALENDAR_PATH);
  return { ok: true };
}

/**
 * Moves an action between draft and calendar (PROJ-13). Deliberately separate
 * from `updateAction`: committing an action is a statement about reality, not
 * a side effect of fixing a typo. Only status columns are written, so it never
 * overwrites someone else's concurrent content edit.
 */
export async function setActionStatus(
  id: string,
  status: ActionStatus,
): Promise<ActionResult> {
  if (status !== "draft" && status !== "confirmed") {
    return { ok: false, message: "Ungültiger Status." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { data: updated, error } = await supabase
    .from("discount_actions")
    .update({
      status,
      // Going back to draft clears the approval — otherwise the record would
      // still claim someone signed off on it.
      confirmed_by: status === "confirmed" ? user.id : null,
      confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
      confirmed_by_email: status === "confirmed" ? (user.email ?? null) : null,
    })
    .eq("id", id)
    .select("id");
  if (error) {
    return { ok: false, message: "Status konnte nicht geändert werden." };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, message: "Diese Aktion existiert nicht mehr." };
  }

  revalidatePath(PATH);
  revalidatePath(CALENDAR_PATH);
  return { ok: true };
}

/** One existing action that overlaps the action being saved on a shared brand. */
export type ActionConflict = {
  /** The shared brand that triggered the conflict. */
  brandId: string;
  brandName: string;
  /** The pre-existing (conflicting) action. */
  actionId: string;
  actionTitle: string;
  channelName: string;
  startDate: string;
  endDate: string;
  /** Same channel → double-discount risk; different channel → cannibalisation. */
  sameChannel: boolean;
  /** Drafts are flagged in the warning: planned, not actually booked (PROJ-13). */
  status: ActionStatus;
};

export type ConflictInput = {
  marketplaceId: string;
  brandIds: string[];
  startDate: string;
  endDate: string;
  /** The action being edited, excluded from its own conflict check. */
  excludeId?: string;
};

export type ConflictCheck =
  | { ok: true; conflicts: ActionConflict[] }
  // The check failed technically — the caller must not block the user (PROJ-7).
  | { ok: false };

type ConflictRow = {
  brand_id: string;
  brands: { name: string } | { name: string }[] | null;
  discount_actions:
    | {
        id: string;
        title: string;
        marketplace_id: string;
        start_date: string;
        end_date: string;
        status: ActionStatus;
        marketplaces: { name: string } | { name: string }[] | null;
      }
    | {
        id: string;
        title: string;
        marketplace_id: string;
        start_date: string;
        end_date: string;
        status: ActionStatus;
        marketplaces: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

/**
 * Finds existing actions that overlap the given period and share at least one
 * brand with the action being saved (PROJ-7). Pure read; never writes. Two
 * intervals overlap when `existing.start <= new.end AND existing.end >= new.start`
 * (one shared day counts). The action being edited is excluded via `excludeId`.
 * Returns `{ ok: false }` on any technical error so the caller can save in doubt
 * rather than block the user.
 */
export async function findActionConflicts(
  input: ConflictInput,
): Promise<ConflictCheck> {
  const brandIds = [...new Set(input.brandIds)];
  if (brandIds.length === 0) return { ok: true, conflicts: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data, error } = await supabase
    .from("discount_action_brands")
    .select(
      "brand_id, brands(name), discount_actions!inner(id, title, marketplace_id, start_date, end_date, status, marketplaces(name))",
    )
    .in("brand_id", brandIds)
    .lte("discount_actions.start_date", input.endDate)
    .gte("discount_actions.end_date", input.startDate)
    .returns<ConflictRow[]>();
  if (error || !data) return { ok: false };

  const conflicts: ActionConflict[] = [];
  for (const row of data) {
    const existing = one(row.discount_actions);
    if (!existing) continue;
    // An action never conflicts with itself.
    if (existing.id === input.excludeId) continue;

    conflicts.push({
      brandId: row.brand_id,
      brandName: one(row.brands)?.name ?? "—",
      actionId: existing.id,
      actionTitle: existing.title,
      channelName: one(existing.marketplaces)?.name ?? "—",
      startDate: existing.start_date,
      endDate: existing.end_date,
      sameChannel: existing.marketplace_id === input.marketplaceId,
      status: existing.status,
    });
  }

  // Stable, readable order: same-channel (double discount) first, then by brand.
  conflicts.sort((a, b) => {
    if (a.sameChannel !== b.sameChannel) return a.sameChannel ? -1 : 1;
    return a.brandName.localeCompare(b.brandName, "de");
  });

  return { ok: true, conflicts };
}

export async function deleteAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { error } = await supabase.from("discount_actions").delete().eq("id", id);
  if (error) {
    return { ok: false, message: "Aktion konnte nicht gelöscht werden." };
  }

  revalidatePath(PATH);
  revalidatePath(CALENDAR_PATH);
  return { ok: true };
}

export type BrandDeletionImpact = {
  /** Actions that reference this brand at all. */
  total: number;
  /** Actions that have ONLY this brand and will be deleted entirely. */
  removed: number;
};

/**
 * Reports what happens to discount actions when a brand is deleted. With
 * multi-brand actions, deleting a brand removes only its assignment; an action
 * is deleted entirely only if this was its last remaining brand. Returns zeroes
 * on any error (e.g. the junction table not existing yet).
 */
export async function getBrandDeletionImpact(
  brandId: string,
): Promise<BrandDeletionImpact> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("discount_action_brands")
    .select("action_id")
    .eq("brand_id", brandId);
  if (error || !data || data.length === 0) {
    return { total: 0, removed: 0 };
  }

  const actionIds = data.map((row) => row.action_id);

  // How many brands each affected action has → those with exactly one (this
  // brand) get cascade-deleted; the rest survive with their other brands.
  const { data: links, error: linksError } = await supabase
    .from("discount_action_brands")
    .select("action_id")
    .in("action_id", actionIds);
  if (linksError || !links) {
    return { total: actionIds.length, removed: 0 };
  }

  const brandCountByAction = new Map<string, number>();
  for (const link of links) {
    brandCountByAction.set(
      link.action_id,
      (brandCountByAction.get(link.action_id) ?? 0) + 1,
    );
  }
  const removed = actionIds.filter(
    (id) => (brandCountByAction.get(id) ?? 0) <= 1,
  ).length;

  return { total: actionIds.length, removed };
}

/** Counts actions referencing a channel. Returns 0 if the table doesn't exist yet. */
export async function countActionsForChannel(
  marketplaceId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("discount_actions")
    .select("id", { count: "exact", head: true })
    .eq("marketplace_id", marketplaceId);
  // 42P01 = undefined_table (discount_actions not created yet) -> treat as 0.
  if (error) return 0;
  return count ?? 0;
}
