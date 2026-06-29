"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { actionSchema } from "@/lib/action-validation";

const PATH = "/tools/multi-channel-marketing/aktionen";

export type ActionBrand = {
  id: string;
  name: string;
  color: string;
};

export type DiscountAction = {
  id: string;
  title: string;
  marketplace_id: string;
  start_date: string;
  end_date: string;
  discount_value: string;
  comment: string | null;
  marketplace_name: string;
  /** One or more brands involved in this action (PROJ-5 multi-brand). */
  brands: ActionBrand[];
};

export type ActionInput = {
  title: string;
  marketplaceId: string;
  brandIds: string[];
  startDate: string;
  endDate: string;
  discountValue: string;
  comment?: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

function validate(input: ActionInput) {
  return actionSchema.safeParse({
    title: input.title,
    marketplaceId: input.marketplaceId,
    brandIds: input.brandIds,
    startDate: input.startDate,
    endDate: input.endDate,
    discountValue: input.discountValue,
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
    discount_value: input.discountValue.trim(),
    comment: comment.length > 0 ? comment : null,
  };
}

/** De-duplicates the selected brand ids (a brand can only be linked once). */
function uniqueBrandIds(input: ActionInput): string[] {
  return [...new Set(input.brandIds)];
}

/** Normalises a PostgREST embedded relation that may come back as object or array. */
function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function createAction(input: ActionInput): Promise<ActionResult> {
  const parsed = validate(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { data: created, error } = await supabase
    .from("discount_actions")
    .insert(toRow(input))
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, message: "Aktion konnte nicht angelegt werden." };
  }

  const links = uniqueBrandIds(input).map((brandId) => ({
    action_id: created.id,
    brand_id: brandId,
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

  // Sync the brand assignments. Add the new set first (upsert ignores links
  // that already exist), THEN remove links no longer selected. Doing it in this
  // order guarantees the action never momentarily has zero brands — otherwise
  // the "delete action when no brands" trigger would remove it during an edit.
  const brandIds = uniqueBrandIds(input);
  const { error: upsertError } = await supabase
    .from("discount_action_brands")
    .upsert(
      brandIds.map((brandId) => ({ action_id: id, brand_id: brandId })),
      { onConflict: "action_id,brand_id", ignoreDuplicates: true },
    );
  if (upsertError) {
    return { ok: false, message: "Aktion konnte nicht gespeichert werden." };
  }
  const { error: pruneError } = await supabase
    .from("discount_action_brands")
    .delete()
    .eq("action_id", id)
    .not("brand_id", "in", `(${brandIds.join(",")})`);
  if (pruneError) {
    return { ok: false, message: "Aktion konnte nicht gespeichert werden." };
  }

  revalidatePath(PATH);
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
        marketplaces: { name: string } | { name: string }[] | null;
      }
    | {
        id: string;
        title: string;
        marketplace_id: string;
        start_date: string;
        end_date: string;
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
      "brand_id, brands(name), discount_actions!inner(id, title, marketplace_id, start_date, end_date, marketplaces(name))",
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
