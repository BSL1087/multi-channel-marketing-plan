import { describe, expect, it } from "vitest";

import {
  brandNameSchema,
  brandColorSchema,
  productGroupIdSchema,
  isDuplicateBrandInGroup,
  type BrandLike,
} from "@/lib/brand-validation";

describe("brandNameSchema", () => {
  it("accepts a normal name and trims surrounding whitespace", () => {
    const result = brandNameSchema.safeParse("  Protein One  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("Protein One");
  });

  it("accepts a name with exactly 60 characters", () => {
    expect(brandNameSchema.safeParse("x".repeat(60)).success).toBe(true);
  });

  it("rejects empty and whitespace-only names", () => {
    expect(brandNameSchema.safeParse("").success).toBe(false);
    expect(brandNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    expect(brandNameSchema.safeParse("x".repeat(61)).success).toBe(false);
  });
});

describe("brandColorSchema", () => {
  it("accepts a valid 6-digit hex color", () => {
    expect(brandColorSchema.safeParse("#1a2b3c").success).toBe(true);
    expect(brandColorSchema.safeParse("#ABCDEF").success).toBe(true);
  });

  it("rejects non-hex, short, or unprefixed values", () => {
    expect(brandColorSchema.safeParse("red").success).toBe(false);
    expect(brandColorSchema.safeParse("#fff").success).toBe(false);
    expect(brandColorSchema.safeParse("1a2b3c").success).toBe(false);
    expect(brandColorSchema.safeParse("#12345g").success).toBe(false);
  });
});

describe("productGroupIdSchema", () => {
  it("accepts a uuid", () => {
    expect(
      productGroupIdSchema.safeParse("123e4567-e89b-12d3-a456-426614174000")
        .success,
    ).toBe(true);
  });

  it("rejects an empty or non-uuid value", () => {
    expect(productGroupIdSchema.safeParse("").success).toBe(false);
    expect(productGroupIdSchema.safeParse("not-a-uuid").success).toBe(false);
  });
});

describe("isDuplicateBrandInGroup", () => {
  const brands: BrandLike[] = [
    { id: "1", name: "Protein One", product_group_id: "g-fitness" },
    { id: "2", name: "Snack Bar", product_group_id: "g-fitness" },
    { id: "3", name: "Protein One", product_group_id: "g-family" },
  ];

  it("detects a duplicate within the same group (case/space-insensitive)", () => {
    expect(
      isDuplicateBrandInGroup(brands, "  protein one ", "g-fitness"),
    ).toBe(true);
  });

  it("allows the same name in a different group", () => {
    expect(isDuplicateBrandInGroup(brands, "Snack Bar", "g-family")).toBe(false);
  });

  it("allows a genuinely new name in the group", () => {
    expect(isDuplicateBrandInGroup(brands, "Vitamin C", "g-fitness")).toBe(
      false,
    );
  });

  it("does not flag a brand as a duplicate of itself when editing", () => {
    expect(
      isDuplicateBrandInGroup(brands, "Protein One", "g-fitness", "1"),
    ).toBe(false);
  });

  it("flags a clash when moving a brand into a group that already has the name", () => {
    // Editing brand 3 (family) and moving it to fitness where "Protein One" exists.
    expect(
      isDuplicateBrandInGroup(brands, "Protein One", "g-fitness", "3"),
    ).toBe(true);
  });
});
