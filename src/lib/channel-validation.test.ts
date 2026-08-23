import { describe, expect, it } from "vitest";

import {
  channelNameSchema,
  channelTypeSchema,
  countChannelsByType,
  groupChannelsByType,
  isDuplicateName,
  sortChannels,
  type ChannelLike,
  type ChannelType,
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

describe("channelTypeSchema", () => {
  it("accepts all three categories", () => {
    for (const type of ["marketplace", "webshop", "retailer"]) {
      expect(channelTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("rejects an unknown category", () => {
    expect(channelTypeSchema.safeParse("shop").success).toBe(false);
  });
});

type TestChannel = { id: string; name: string; type: ChannelType };

const mixed: TestChannel[] = [
  { id: "1", name: "WS-Prfrm", type: "webshop" },
  { id: "2", name: "Otto", type: "marketplace" },
  { id: "3", name: "Sport Müller", type: "retailer" },
  { id: "4", name: "WS-Assault Fitness", type: "webshop" },
  { id: "5", name: "Amazon", type: "marketplace" },
  { id: "6", name: "Intersport", type: "retailer" },
];

describe("sortChannels", () => {
  it("orders by category first, then alphabetically inside the category", () => {
    expect(sortChannels(mixed).map((c) => c.name)).toEqual([
      "Amazon",
      "Otto",
      "WS-Assault Fitness",
      "WS-Prfrm",
      "Intersport",
      "Sport Müller",
    ]);
  });

  it("sorts by name only, so a prefix does not pull a channel out of its category", () => {
    // "WS-…" sorts after "Amazon" alphabetically but is a webshop, so it must
    // still land in the webshop block — the name prefix is irrelevant.
    const sorted = sortChannels([
      { id: "1", name: "WS-Assault Fitness", type: "webshop" },
      { id: "2", name: "Zalando", type: "marketplace" },
    ]);
    expect(sorted.map((c) => c.name)).toEqual(["Zalando", "WS-Assault Fitness"]);
  });

  it("ignores case and sorts umlauts the German way", () => {
    const sorted = sortChannels([
      { id: "1", name: "Zeta", type: "retailer" },
      { id: "2", name: "über", type: "retailer" },
      { id: "3", name: "Alpha", type: "retailer" },
    ]);
    expect(sorted.map((c) => c.name)).toEqual(["Alpha", "über", "Zeta"]);
  });

  it("does not mutate the input array", () => {
    const input = mixed.slice();
    sortChannels(input);
    expect(input).toEqual(mixed);
  });
});

describe("groupChannelsByType", () => {
  it("returns the categories in display order with sorted members", () => {
    const groups = groupChannelsByType(mixed);
    expect(groups.map((g) => g.type)).toEqual([
      "marketplace",
      "webshop",
      "retailer",
    ]);
    expect(groups.map((g) => g.label)).toEqual([
      "Marketplaces",
      "Eigene Webshops",
      "Händler",
    ]);
    expect(groups[2].items.map((c) => c.name)).toEqual([
      "Intersport",
      "Sport Müller",
    ]);
  });

  it("drops categories without channels", () => {
    const groups = groupChannelsByType([
      { id: "1", name: "Amazon", type: "marketplace" as ChannelType },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("marketplace");
  });

  it("returns nothing for an empty list", () => {
    expect(groupChannelsByType([])).toEqual([]);
  });
});

describe("countChannelsByType", () => {
  it("counts every category, including empty ones", () => {
    expect(countChannelsByType(mixed)).toEqual({
      marketplace: 2,
      webshop: 2,
      retailer: 2,
    });
    expect(countChannelsByType([])).toEqual({
      marketplace: 0,
      webshop: 0,
      retailer: 0,
    });
  });
});
