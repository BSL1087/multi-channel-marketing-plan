"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  channelNameSchema,
  channelTypeSchema,
  isDuplicateName,
  type ChannelType,
} from "@/lib/channel-validation";

const PATH = "/tools/multi-channel-marketing/kanaele";

export type Channel = { id: string; name: string; type: ChannelType };

export type ChannelActionResult =
  | { ok: true }
  | { ok: false; message: string; duplicate?: boolean };

const DUPLICATE_MESSAGE = "Es gibt bereits einen Kanal mit diesem Namen.";

export async function createChannel(
  rawName: string,
  rawType: string,
): Promise<ChannelActionResult> {
  const parsed = channelNameSchema.safeParse(rawName);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  const name = parsed.data;

  const parsedType = channelTypeSchema.safeParse(rawType);
  if (!parsedType.success) {
    return { ok: false, message: parsedType.error.issues[0].message };
  }
  const type = parsedType.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Nicht eingeloggt." };
  }

  const { data: existing, error: loadError } = await supabase
    .from("marketplaces")
    .select("id, name");
  if (loadError) {
    return { ok: false, message: "Kanäle konnten nicht geladen werden." };
  }
  if (existing && isDuplicateName(existing, name)) {
    return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
  }

  const { error } = await supabase.from("marketplaces").insert({ name, type });
  if (error) {
    // 23505 = unique_violation — last line of defence against a race.
    if (error.code === "23505") {
      return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
    }
    return { ok: false, message: "Kanal konnte nicht angelegt werden." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function updateChannel(
  id: string,
  rawName: string,
  rawType: string,
): Promise<ChannelActionResult> {
  const parsed = channelNameSchema.safeParse(rawName);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  const name = parsed.data;

  const parsedType = channelTypeSchema.safeParse(rawType);
  if (!parsedType.success) {
    return { ok: false, message: parsedType.error.issues[0].message };
  }
  const type = parsedType.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Nicht eingeloggt." };
  }

  const { data: existing, error: loadError } = await supabase
    .from("marketplaces")
    .select("id, name");
  if (loadError) {
    return { ok: false, message: "Kanäle konnten nicht geladen werden." };
  }
  if (existing && isDuplicateName(existing, name, id)) {
    return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
  }

  const { data: updated, error } = await supabase
    .from("marketplaces")
    .update({ name, type })
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: DUPLICATE_MESSAGE, duplicate: true };
    }
    return { ok: false, message: "Kanal konnte nicht gespeichert werden." };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, message: "Dieser Kanal existiert nicht mehr." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteChannel(id: string): Promise<ChannelActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Nicht eingeloggt." };
  }

  const { error } = await supabase.from("marketplaces").delete().eq("id", id);
  if (error) {
    return { ok: false, message: "Kanal konnte nicht gelöscht werden." };
  }

  revalidatePath(PATH);
  return { ok: true };
}
