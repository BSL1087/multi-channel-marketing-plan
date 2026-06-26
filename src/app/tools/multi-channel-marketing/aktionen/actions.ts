"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { actionSchema } from "@/lib/action-validation";

const PATH = "/tools/multi-channel-marketing/aktionen";

export type DiscountAction = {
  id: string;
  title: string;
  marketplace_id: string;
  brand_id: string;
  start_date: string;
  end_date: string;
  discount_value: string;
  comment: string | null;
  marketplace_name: string;
  brand_name: string;
  brand_color: string;
};

export type ActionInput = {
  title: string;
  marketplaceId: string;
  brandId: string;
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
    brandId: input.brandId,
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
    brand_id: input.brandId,
    start_date: input.startDate,
    end_date: input.endDate,
    discount_value: input.discountValue.trim(),
    comment: comment.length > 0 ? comment : null,
  };
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

  const { error } = await supabase.from("discount_actions").insert(toRow(input));
  if (error) {
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

  revalidatePath(PATH);
  return { ok: true };
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

/** Counts actions referencing a brand. Returns 0 if the table doesn't exist yet. */
export async function countActionsForBrand(brandId: string): Promise<number> {
  return countActionsBy("brand_id", brandId);
}

/** Counts actions referencing a channel. Returns 0 if the table doesn't exist yet. */
export async function countActionsForChannel(
  marketplaceId: string,
): Promise<number> {
  return countActionsBy("marketplace_id", marketplaceId);
}

async function countActionsBy(
  column: "brand_id" | "marketplace_id",
  value: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("discount_actions")
    .select("id", { count: "exact", head: true })
    .eq(column, value);
  // 42P01 = undefined_table (discount_actions not created yet) -> treat as 0.
  if (error) return 0;
  return count ?? 0;
}
