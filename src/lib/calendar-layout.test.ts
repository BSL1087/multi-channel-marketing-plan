import { describe, it, expect } from "vitest";

import { layoutChannelCollapsible } from "./calendar-layout";

/** One bar = one brand of one action, mirroring the calendar's segments. */
type Seg = {
  id: string;
  start_date: string;
  end_date: string;
  action: string;
  brand: string;
};

/** An action with `brands` brands — each brand becomes its own bar. */
function action(
  name: string,
  from: string,
  to: string,
  brands: string[],
): Seg[] {
  return brands.map((brand) => ({
    id: `${name}:${brand}`,
    start_date: from,
    end_date: to,
    action: name,
    brand,
  }));
}

const opts = {
  today: "2026-08-21",
  getGroup: (s: Seg) => s.brand,
  getActionId: (s: Seg) => s.action,
  getSortKey: (s: Seg) => s.brand,
};

const SIX = ["Dooky", "Fit Kidz", "Haakaa", "Prfrm", "RPM", "Wolverson"];

describe("layoutChannelCollapsible", () => {
  it("keeps a past action complete when its brands fit the base height", () => {
    const items = action("kampagne", "2026-05-14", "2026-05-17", [
      "Prfrm",
      "RPM",
      "Wolverson",
    ]);
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.lanes).toBe(3);
    expect(row.chips).toEqual([]);
    expect(row.items).toHaveLength(3);
  });

  it("truncates a past action with too many brands to 2 bars plus a toggle", () => {
    const items = action("sparfuchs", "2026-06-04", "2026-06-10", SIX);
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.items.map((i) => i.item.brand)).toEqual(["Dooky", "Fit Kidz"]);
    expect(row.chips).toHaveLength(1);
    expect(row.chips[0].actionId).toBe("sparfuchs");
    expect(row.chips[0].lane).toBe(2); // the third lane holds the toggle
    expect(row.lanes).toBe(3); // standard height
  });

  it("never truncates the action running today, however many brands", () => {
    // Starts before and ends after today, so it is the one currently running.
    const items = action("summer-sale", "2026-07-09", "2026-08-23", [
      ...SIX,
      "Tega",
    ]);
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.chips).toEqual([]);
    expect(row.items).toHaveLength(7);
    expect(row.lanes).toBe(7);
  });

  it("keeps the row at base height when a small and a big past action share it", () => {
    // The real Kaufland row: May fits, June is truncated, both stay visible.
    const items = [
      ...action("angebot", "2026-05-01", "2026-05-06", ["Happy Hands"]),
      ...action("kampagne", "2026-05-14", "2026-05-17", [
        "Prfrm",
        "RPM",
        "Wolverson",
      ]),
      ...action("sparfuchs", "2026-06-04", "2026-06-10", SIX),
      ...action("steelstorm", "2026-08-15", "2026-08-31", ["Steelstorm"]),
    ];
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.lanes).toBe(3);
    expect(row.chips).toHaveLength(1);
    // May keeps all three brands, June keeps two, August is untouched.
    const shown = row.items.filter((i) => i.item.action === "kampagne");
    expect(shown).toHaveLength(3);
    expect(
      row.items.filter((i) => i.item.action === "sparfuchs"),
    ).toHaveLength(2);
    expect(
      row.items.filter((i) => i.item.action === "steelstorm"),
    ).toHaveLength(1);
  });

  it("puts every brand back when the row is expanded, toggle included", () => {
    const items = action("sparfuchs", "2026-06-04", "2026-06-10", SIX);
    const row = layoutChannelCollapsible(items, 2026, {
      ...opts,
      expanded: true,
    });

    expect(row.items).toHaveLength(6);
    expect(row.chips).toHaveLength(1);
    expect(row.lanes).toBe(7); // 6 brands + the "weniger anzeigen" lane
  });

  it("truncates nothing without a reference date", () => {
    const items = action("sparfuchs", "2026-06-04", "2026-06-10", SIX);
    const row = layoutChannelCollapsible(items, 2026, {
      ...opts,
      today: null,
    });

    expect(row.chips).toEqual([]);
    expect(row.items).toHaveLength(6);
    expect(row.lanes).toBe(6);
  });

  it("anchors the toggle at its own action, not at the row start", () => {
    const items = [
      ...action("maerz", "2026-03-01", "2026-03-10", ["Happy Hands"]),
      ...action("sparfuchs", "2026-06-04", "2026-06-10", SIX),
    ];
    const row = layoutChannelCollapsible(items, 2026, opts);

    const juneBar = row.items.find((i) => i.item.action === "sparfuchs");
    expect(row.chips[0].leftPx).toBe(juneBar?.leftPx);
  });

  it("truncates a planned action too — only what runs today stays open", () => {
    // October, months away from today: it occupies the slot but nobody is
    // watching it right now, so it must not inflate the row.
    const items = action("prime-days", "2026-10-01", "2026-10-31", SIX);
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.items.map((i) => i.item.brand)).toEqual(["Dooky", "Fit Kidz"]);
    expect(row.chips).toHaveLength(1);
    expect(row.chips[0].actionId).toBe("prime-days");
    expect(row.lanes).toBe(3); // standard height
  });

  it("keeps a planned action complete when its brands fit anyway", () => {
    const items = action("prime-days", "2026-10-01", "2026-10-31", [
      "Prfrm",
      "RPM",
      "Wolverson",
    ]);
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.chips).toEqual([]);
    expect(row.items).toHaveLength(3);
  });

  it("expands a planned action again when the row is unfolded", () => {
    const items = action("prime-days", "2026-10-01", "2026-10-31", SIX);
    const row = layoutChannelCollapsible(items, 2026, {
      ...opts,
      expanded: true,
    });

    expect(row.items).toHaveLength(6);
    expect(row.chips).toHaveLength(1);
  });

  it("truncates past and planned actions side by side, running one untouched", () => {
    const items = [
      ...action("sparfuchs", "2026-06-04", "2026-06-10", SIX), // past
      ...action("summer", "2026-08-15", "2026-08-31", [...SIX, "Tega"]), // running
      ...action("prime-days", "2026-10-01", "2026-10-31", SIX), // planned
    ];
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.chips.map((c) => c.actionId).sort()).toEqual([
      "prime-days",
      "sparfuchs",
    ]);
    expect(
      row.items.filter((i) => i.item.action === "summer"),
    ).toHaveLength(7);
  });

  it("gives two truncated actions their own toggle", () => {
    const items = [
      ...action("a", "2026-02-02", "2026-02-08", SIX),
      ...action("b", "2026-06-04", "2026-06-10", SIX),
    ];
    const row = layoutChannelCollapsible(items, 2026, opts);

    expect(row.chips.map((c) => c.actionId).sort()).toEqual(["a", "b"]);
    expect(row.lanes).toBe(3);
  });
});
