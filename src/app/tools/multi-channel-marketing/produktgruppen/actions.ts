"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  productGroupNameSchema,
  isDuplicateName,
} from "@/lib/product-group-validation";

const PATH = "/tools/multi-channel-marketing/produktgruppen";

export type ProductGroup = { id: string; name: string };

export type ProductGroupActionResult =
  | { ok: true }
  | { ok: false; message: string; duplicate?: boolean };

export type ProductGroupDeleteResult =
  | { ok: true }
  | { ok: false; message: string; blocked?: boolean };

const DUPLICATE_MESSAGE = "Es gibt bereits eine Produktgruppe mit diesem Namen.";

export async function createProductGroup(
  rawName: string,
): Promise<ProductGroupActionResult> {
  const parsed = productGroupNameSchema.safeParse(rawName);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  const name = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Nicht eingeloggt." };
  }

  const { data: existing, error: loadError } = await supabase
    .from("product_groups")
    .select("id, name");
  if (loadError) {
    return { ok: false, message: "Produktgruppen konnten nicht geladen werden." };
  }
  if (existing && isDuplicateName(existing, name)) {
    return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
  }

  const { error } = await supabase.from("product_groups").insert({ name });
  if (error) {
    // 23505 = unique_violation — last line of defence against a race.
    if (error.code === "23505") {
      return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
    }
    return { ok: false, message: "Produktgruppe konnte nicht angelegt werden." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function renameProductGroup(
  id: string,
  rawName: string,
): Promise<ProductGroupActionResult> {
  const parsed = productGroupNameSchema.safeParse(rawName);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  const name = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Nicht eingeloggt." };
  }

  const { data: existing, error: loadError } = await supabase
    .from("product_groups")
    .select("id, name");
  if (loadError) {
    return { ok: false, message: "Produktgruppen konnten nicht geladen werden." };
  }
  if (existing && isDuplicateName(existing, name, id)) {
    return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
  }

  const { data: updated, error } = await supabase
    .from("product_groups")
    .update({ name })
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
    }
    return { ok: false, message: "Produktgruppe konnte nicht umbenannt werden." };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, message: "Diese Produktgruppe existiert nicht mehr." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteProductGroup(
  id: string,
): Promise<ProductGroupDeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Nicht eingeloggt." };
  }

  // Pre-check: block deletion while brands still reference this group (PROJ-4).
  // The brands table arrives with PROJ-4 — until then this query reports an
  // "undefined_table" error (42P01), which we treat as "no brands yet" so the
  // group is freely deletable. Once PROJ-4 exists, the count drives a friendly
  // message; the DB foreign key (ON DELETE RESTRICT) is the hard guarantee.
  const { count, error: countError } = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true })
    .eq("product_group_id", id);
  if (!countError && count && count > 0) {
    return {
      ok: false,
      blocked: true,
      message: `Diese Gruppe enthält noch ${count} ${
        count === 1 ? "Marke" : "Marken"
      } — bitte zuerst verschieben oder löschen.`,
    };
  }

  const { error } = await supabase
    .from("product_groups")
    .delete()
    .eq("id", id);
  if (error) {
    // 23503 = foreign_key_violation — brands still reference this group.
    if (error.code === "23503") {
      return {
        ok: false,
        blocked: true,
        message:
          "Diese Gruppe enthält noch Marken — bitte zuerst verschieben oder löschen.",
      };
    }
    return { ok: false, message: "Produktgruppe konnte nicht gelöscht werden." };
  }

  revalidatePath(PATH);
  return { ok: true };
}
