import { describe, expect, it } from "vitest";

import {
  productGroupNameSchema,
  isDuplicateName,
  type NamedRecord,
} from "@/lib/product-group-validation";

describe("productGroupNameSchema", () => {
  it("accepts a normal name and trims surrounding whitespace", () => {
    const result = productGroupNameSchema.safeParse("  Fitness  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Fitness");
    }
  });

  it("accepts a name with exactly 60 characters", () => {
    const result = productGroupNameSchema.safeParse("x".repeat(60));
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(productGroupNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    expect(productGroupNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    expect(productGroupNameSchema.safeParse("x".repeat(61)).success).toBe(false);
  });
});

describe("isDuplicateName (product groups)", () => {
  const groups: NamedRecord[] = [
    { id: "1", name: "Fitness" },
    { id: "2", name: "Familie" },
  ];

  it("detects an exact duplicate", () => {
    expect(isDuplicateName(groups, "Fitness")).toBe(true);
  });

  it("detects a duplicate ignoring case and surrounding whitespace", () => {
    expect(isDuplicateName(groups, "  fitness ")).toBe(true);
  });

  it("allows a genuinely new name", () => {
    expect(isDuplicateName(groups, "Beauty")).toBe(false);
  });

  it("does not flag a group as a duplicate of itself when renaming", () => {
    expect(isDuplicateName(groups, "Fitness", "1")).toBe(false);
  });

  it("still flags a clash with a different group while renaming", () => {
    expect(isDuplicateName(groups, "Familie", "1")).toBe(true);
  });
});
