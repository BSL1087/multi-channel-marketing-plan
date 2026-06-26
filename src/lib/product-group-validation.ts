import { z } from "zod";

/**
 * Shared name rules for product groups (PROJ-11).
 * Mirrors the channel rules (PROJ-3); used by the server actions and the client
 * form so validation stays in sync. `.trim()` transforms the value, so
 * leading/trailing spaces are ignored.
 */
export const productGroupNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Bitte einen Namen eingeben." })
  .max(60, { message: "Der Name darf höchstens 60 Zeichen haben." });

// The duplicate check is entity-agnostic ({ id, name }); reuse it instead of
// duplicating the logic. Re-exported here so product-group code has one import.
export { isDuplicateName, type ChannelLike as NamedRecord } from "@/lib/channel-validation";
