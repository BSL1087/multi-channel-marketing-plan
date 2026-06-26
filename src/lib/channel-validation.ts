import { z } from "zod";

/**
 * Shared name rules for marketplaces/channels (PROJ-3).
 * Used by the server actions and the client form so validation stays in sync.
 * `.trim()` transforms the value, so leading/trailing spaces are ignored.
 */
export const channelNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Bitte einen Namen eingeben." })
  .max(60, { message: "Der Name darf höchstens 60 Zeichen haben." });

export type ChannelLike = { id: string; name: string };

/**
 * Case-insensitive, whitespace-insensitive duplicate check.
 * `excludeId` skips the channel being renamed (its own name is not a clash).
 */
export function isDuplicateName(
  channels: ChannelLike[],
  name: string,
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return channels.some(
    (c) => c.id !== excludeId && c.name.trim().toLowerCase() === normalized,
  );
}
