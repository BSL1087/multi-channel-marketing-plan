import { describe, expect, it } from "vitest";

import {
  actionTitleSchema,
  discountValueSchema,
  commentSchema,
  actionSchema,
} from "@/lib/action-validation";

const BRAND = "123e4567-e89b-12d3-a456-426614174000";
const CHANNEL = "223e4567-e89b-12d3-a456-426614174001";

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Sommer-Sale",
    marketplaceId: CHANNEL,
    brandId: BRAND,
    startDate: "2026-03-01",
    endDate: "2026-03-05",
    discountValue: "20%",
    comment: "",
    ...overrides,
  };
}

describe("field schemas", () => {
  it("trims the title and accepts up to 80 chars", () => {
    const r = actionTitleSchema.safeParse("  Sale  ");
    expect(r.success && r.data).toBe("Sale");
    expect(actionTitleSchema.safeParse("x".repeat(80)).success).toBe(true);
  });

  it("rejects empty title and titles over 80 chars", () => {
    expect(actionTitleSchema.safeParse("   ").success).toBe(false);
    expect(actionTitleSchema.safeParse("x".repeat(81)).success).toBe(false);
  });

  it("requires a discount value (max 50)", () => {
    expect(discountValueSchema.safeParse("").success).toBe(false);
    expect(discountValueSchema.safeParse("y".repeat(51)).success).toBe(false);
    expect(discountValueSchema.safeParse("10€").success).toBe(true);
  });

  it("allows an empty comment but rejects over 500 chars", () => {
    expect(commentSchema.safeParse("").success).toBe(true);
    expect(commentSchema.safeParse("z".repeat(501)).success).toBe(false);
  });
});

describe("actionSchema", () => {
  it("accepts a fully valid action", () => {
    expect(actionSchema.safeParse(validInput()).success).toBe(true);
  });

  it("accepts a single-day action (start = end)", () => {
    expect(
      actionSchema.safeParse(
        validInput({ startDate: "2026-03-01", endDate: "2026-03-01" }),
      ).success,
    ).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const r = actionSchema.safeParse(
      validInput({ startDate: "2026-03-05", endDate: "2026-03-01" }),
    );
    expect(r.success).toBe(false);
  });

  it("rejects a missing/invalid channel or brand", () => {
    expect(actionSchema.safeParse(validInput({ marketplaceId: "" })).success).toBe(
      false,
    );
    expect(actionSchema.safeParse(validInput({ brandId: "nope" })).success).toBe(
      false,
    );
  });

  it("rejects a malformed date", () => {
    expect(
      actionSchema.safeParse(validInput({ startDate: "01.03.2026" })).success,
    ).toBe(false);
  });
});
