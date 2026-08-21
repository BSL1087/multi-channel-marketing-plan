import { describe, it, expect } from "vitest";

import { layoutChannel, layoutChannelCollapsible } from "./calendar-layout";

type Item = { id: string; start_date: string; end_date: string; brand: string };

/** n items sharing a time range, each on its own brand → n stacked lanes. */
function stack(prefix: string, from: string, to: string, n: number): Item[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}${i}`,
    start_date: from,
    end_date: to,
    brand: `${prefix}-brand-${i}`,
  }));
}

const byBrand = (i: Item) => i.brand;
const TODAY = "2026-08-21";

describe("layoutChannelCollapsible", () => {
  it("leaves a row untouched when it fits the base height", () => {
    const items = stack("p", "2026-05-01", "2026-05-20", 3);
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: TODAY,
      getGroup: byBrand,
    });

    expect(row.lanes).toBe(3);
    expect(row.toggleLane).toBeNull();
    expect(row.past).toEqual([]);
    expect(row.layout.items).toHaveLength(3);
  });

  it("folds past bars away and shrinks a tall row to the toggle lane", () => {
    const items = stack("p", "2026-06-01", "2026-06-20", 6);
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: TODAY,
      getGroup: byBrand,
    });

    expect(layoutChannel(items, 2026, byBrand).lanes).toBe(6);
    expect(row.lanes).toBe(1); // nothing left to draw — just the toggle
    expect(row.toggleLane).toBe(0);
    expect(row.past).toHaveLength(6);
    expect(row.layout.items).toEqual([]);
  });

  it("keeps running and upcoming bars visible above the toggle", () => {
    const items = [
      ...stack("p", "2026-06-01", "2026-06-20", 4), // done
      ...stack("f", "2026-09-01", "2026-09-20", 2), // upcoming
    ];
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: TODAY,
      getGroup: byBrand,
    });

    expect(row.lanes).toBe(3); // 2 upcoming lanes + toggle lane
    expect(row.toggleLane).toBe(2);
    expect(row.layout.items.map((i) => i.item.id)).toEqual(["f0", "f1"]);
  });

  it("does not fold when the toggle lane would not save height", () => {
    const items = [
      ...stack("p", "2026-06-01", "2026-06-20", 1), // one past lane
      ...stack("f", "2026-09-01", "2026-09-20", 4), // four upcoming lanes
    ];
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: TODAY,
      getGroup: byBrand,
    });

    // The lone June bar shares a lane with a September one, so folding it away
    // would swap one lane for the toggle lane and win nothing.
    expect(row.toggleLane).toBeNull();
    expect(row.lanes).toBe(4);
    expect(row.layout.items).toHaveLength(5);
  });

  it("shows everything again when expanded, plus the toggle lane", () => {
    const items = stack("p", "2026-06-01", "2026-06-20", 6);
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: TODAY,
      expanded: true,
      getGroup: byBrand,
    });

    expect(row.lanes).toBe(7);
    expect(row.toggleLane).toBe(6);
    expect(row.layout.items).toHaveLength(6);
    expect(row.past).toHaveLength(6);
  });

  it("never folds without a cutoff (past years stay fully expanded)", () => {
    const items = stack("p", "2026-06-01", "2026-06-20", 6);
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: null,
      getGroup: byBrand,
    });

    expect(row.toggleLane).toBeNull();
    expect(row.lanes).toBe(6);
  });

  it("anchors the toggle at the earliest folded bar", () => {
    const items = [
      ...stack("a", "2026-03-01", "2026-03-10", 2),
      ...stack("b", "2026-06-01", "2026-06-20", 4),
    ];
    const row = layoutChannelCollapsible(items, 2026, {
      cutoff: TODAY,
      getGroup: byBrand,
    });

    const march = layoutChannel(items, 2026, byBrand).items.find(
      (i) => i.item.id === "a0",
    );
    expect(row.anchorPx).toBe(march?.leftPx);
  });
});
