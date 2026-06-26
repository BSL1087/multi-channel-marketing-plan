import { z } from "zod";

/**
 * Shared name + color rules for brands (PROJ-4).
 * Mirrors the channel/product-group rules; used by the server actions and the
 * client form so validation stays in sync. `.trim()` transforms the value, so
 * leading/trailing spaces are ignored.
 */
export const brandNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Bitte einen Namen eingeben." })
  .max(60, { message: "Der Name darf höchstens 60 Zeichen haben." });

export const brandColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Bitte eine gültige Farbe wählen (#RRGGBB).",
  });

export const productGroupIdSchema = z
  .string()
  .uuid({ message: "Bitte eine Produktgruppe auswählen." });

// The plain name-duplicate check is entity-agnostic; reuse it instead of
// duplicating the logic.
export { isDuplicateName, type ChannelLike as NamedRecord } from "@/lib/channel-validation";

export type BrandLike = {
  id: string;
  name: string;
  product_group_id: string;
};

/**
 * Brand names are unique PER product group (case-insensitive, trimmed) — the
 * same name is allowed in a different group. `excludeId` skips the brand being
 * edited (its own name is not a clash).
 */
export function isDuplicateBrandInGroup(
  brands: BrandLike[],
  name: string,
  productGroupId: string,
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return brands.some(
    (b) =>
      b.id !== excludeId &&
      b.product_group_id === productGroupId &&
      b.name.trim().toLowerCase() === normalized,
  );
}
