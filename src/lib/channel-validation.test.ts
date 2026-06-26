import { describe, expect, it } from "vitest";

import {
  channelNameSchema,
  isDuplicateName,
  type ChannelLike,
} from "@/lib/channel-validation";

describe("channelNameSchema", () => {
  it("accepts a normal name and trims surrounding whitespace", () => {
    const result = channelNameSchema.safeParse("  Amazon  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Amazon");
    }
  });

  it("accepts a name with exactly 60 characters", () => {
    const result = channelNameSchema.safeParse("x".repeat(60));
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(channelNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    expect(channelNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    expect(channelNameSchema.safeParse("x".repeat(61)).success).toBe(false);
  });
});

describe("isDuplicateName", () => {
  const channels: ChannelLike[] = [
    { id: "1", name: "Amazon" },
    { id: "2", name: "Otto" },
  ];

  it("detects an exact duplicate", () => {
    expect(isDuplicateName(channels, "Amazon")).toBe(true);
  });

  it("detects a duplicate ignoring case and surrounding whitespace", () => {
    expect(isDuplicateName(channels, "  amazon ")).toBe(true);
  });

  it("allows a genuinely new name", () => {
    expect(isDuplicateName(channels, "Kaufland")).toBe(false);
  });

  it("does not flag a channel as a duplicate of itself when renaming", () => {
    // Renaming "Amazon" (id 1) but keeping the same name must be allowed.
    expect(isDuplicateName(channels, "Amazon", "1")).toBe(false);
  });

  it("still flags a clash with a different channel while renaming", () => {
    // Renaming "Amazon" (id 1) to "Otto" must clash with id 2.
    expect(isDuplicateName(channels, "Otto", "1")).toBe(true);
  });
});
