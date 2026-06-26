"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  brandNameSchema,
  brandColorSchema,
  productGroupIdSchema,
  isDuplicateBrandInGroup,
} from "@/lib/brand-validation";

const PATH = "/tools/multi-channel-marketing/marken";

export type Brand = {
  id: string;
  name: string;
  color: string;
  product_group_id: string;
  product_group_name: string;
};

export type BrandActionResult =
  | { ok: true }
  | { ok: false; message: string; duplicate?: boolean };

export type BrandDeleteResult = { ok: true } | { ok: false; message: string };

export type BrandInput = {
  name: string;
  color: string;
  productGroupId: string;
};

const DUPLICATE_MESSAGE =
  "Es gibt in dieser Produktgruppe bereits eine Marke mit diesem Namen.";

function validate(
  input: BrandInput,
):
  | { ok: true; name: string; color: string; productGroupId: string }
  | { ok: false; message: string } {
  const name = brandNameSchema.safeParse(input.name);
  if (!name.success) return { ok: false, message: name.error.issues[0].message };

  const color = brandColorSchema.safeParse(input.color);
  if (!color.success)
    return { ok: false, message: color.error.issues[0].message };

  const group = productGroupIdSchema.safeParse(input.productGroupId);
  if (!group.success)
    return { ok: false, message: "Bitte eine Produktgruppe auswählen." };

  return {
    ok: true,
    name: name.data,
    color: color.data,
    productGroupId: group.data,
  };
}

export async function createBrand(
  input: BrandInput,
): Promise<BrandActionResult> {
  const parsed = validate(input);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { data: existing, error: loadError } = await supabase
    .from("brands")
    .select("id, name, product_group_id");
  if (loadError) {
    return { ok: false, message: "Marken konnten nicht geladen werden." };
  }
  if (
    existing &&
    isDuplicateBrandInGroup(existing, parsed.name, parsed.productGroupId)
  ) {
    return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
  }

  const { error } = await supabase.from("brands").insert({
    name: parsed.name,
    color: parsed.color,
    product_group_id: parsed.productGroupId,
  });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
    }
    return { ok: false, message: "Marke konnte nicht angelegt werden." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function updateBrand(
  id: string,
  input: BrandInput,
): Promise<BrandActionResult> {
  const parsed = validate(input);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { data: existing, error: loadError } = await supabase
    .from("brands")
    .select("id, name, product_group_id");
  if (loadError) {
    return { ok: false, message: "Marken konnten nicht geladen werden." };
  }
  if (
    existing &&
    isDuplicateBrandInGroup(existing, parsed.name, parsed.productGroupId, id)
  ) {
    return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
  }

  const { data: updated, error } = await supabase
    .from("brands")
    .update({
      name: parsed.name,
      color: parsed.color,
      product_group_id: parsed.productGroupId,
    })
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
    }
    return { ok: false, message: "Marke konnte nicht gespeichert werden." };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, message: "Diese Marke existiert nicht mehr." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<BrandDeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Nicht eingeloggt." };

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) {
    return { ok: false, message: "Marke konnte nicht gelöscht werden." };
  }

  revalidatePath(PATH);
  return { ok: true };
}
