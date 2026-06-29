import { describe, it, expect } from "vitest";

import {
  DAY_WIDTH,
  daysInMonth,
  monthName,
  monthDays,
  monthBarGeometry,
  layoutMonthChannel,
  resolveMonth,
} from "./month-layout";

describe("daysInMonth", () => {
  it("handles 30/31-day months", () => {
    expect(daysInMonth(2026, 0)).toBe(31); // Januar
    expect(daysInMonth(2026, 3)).toBe(30); // April
  });

  it("handles February in common and leap years", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2024, 1)).toBe(29);
  });
});

describe("monthName", () => {
  it("returns the German month name (0-based)", () => {
    expect(monthName(1)).toBe("Februar");
    expect(monthName(11)).toBe("Dezember");
  });
});

describe("monthDays", () => {
  it("labels weekdays and flags weekends", () => {
    // 1 Feb 2026 is a Sunday.
    const days = monthDays(2026, 1, new Date("2026-06-29T00:00:00Z"));
    expect(days).toHaveLength(28);
    expect(days[0]).toMatchObject({ day: 1, weekday: "So", isWeekend: true });
    expect(days[1]).toMatchObject({ day: 2, weekday: "Mo", isWeekend: false });
    expect(days[6]).toMatchObject({ day: 7, weekday: "Sa", isWeekend: true });
  });

  it("marks today only within the current month", () => {
    const today = new Date("2026-02-15T12:00:00Z");
    const feb = monthDays(2026, 1, today);
    expect(feb.find((d) => d.day === 15)?.isToday).toBe(true);
    expect(feb.filter((d) => d.isToday)).toHaveLength(1);

    const march = monthDays(2026, 2, today);
    expect(march.some((d) => d.isToday)).toBe(false);
  });
});

describe("monthBarGeometry", () => {
  const Y = 2026;
  const M = 1; // February (28 days)

  it("returns null for actions outside the month", () => {
    expect(
      monthBarGeometry(
        { id: "a", start_date: "2026-03-01", end_date: "2026-03-05" },
        Y,
        M,
      ),
    ).toBeNull();
  });

  it("computes day-accurate geometry inside the month", () => {
    const g = monthBarGeometry(
      { id: "a", start_date: "2026-02-03", end_date: "2026-02-05" },
      Y,
      M,
    );
    expect(g).not.toBeNull();
    expect(g).toMatchObject({
      leftPx: 2 * DAY_WIDTH, // day 3 → index 2
      widthPx: 3 * DAY_WIDTH, // 3,4,5 inclusive
      startIdx: 2,
      endIdx: 4,
      clippedStart: false,
      clippedEnd: false,
    });
  });

  it("clips and flags actions spilling over both month edges", () => {
    const g = monthBarGeometry(
      { id: "a", start_date: "2026-01-20", end_date: "2026-03-10" },
      Y,
      M,
    );
    expect(g).toMatchObject({
      leftPx: 0,
      widthPx: 28 * DAY_WIDTH,
      clippedStart: true,
      clippedEnd: true,
    });
  });

  it("counts a single shared day as overlap", () => {
    const g = monthBarGeometry(
      { id: "a", start_date: "2026-01-10", end_date: "2026-02-01" },
      Y,
      M,
    );
    expect(g).toMatchObject({ leftPx: 0, widthPx: DAY_WIDTH, clippedStart: true });
  });
});

describe("layoutMonthChannel", () => {
  it("stacks overlapping actions onto separate lanes", () => {
    const items = [
      { id: "a", start_date: "2026-02-01", end_date: "2026-02-10" },
      { id: "b", start_date: "2026-02-05", end_date: "2026-02-15" },
    ];
    const layout = layoutMonthChannel(items, 2026, 1);
    expect(layout.lanes).toBe(2);
    const laneOf = (id: string) =>
      layout.items.find((i) => i.item.id === id)?.lane;
    expect(laneOf("a")).toBe(0);
    expect(laneOf("b")).toBe(1);
  });

  it("keeps non-overlapping actions on one lane", () => {
    const items = [
      { id: "a", start_date: "2026-02-01", end_date: "2026-02-05" },
      { id: "b", start_date: "2026-02-10", end_date: "2026-02-15" },
    ];
    const layout = layoutMonthChannel(items, 2026, 1);
    expect(layout.lanes).toBe(1);
  });

  it("lets the same group reuse its lane", () => {
    // Two non-overlapping bars of brand X plus an overlapping bar of brand Y.
    const items = [
      { id: "x1", start_date: "2026-02-01", end_date: "2026-02-05", brand: "X" },
      { id: "y1", start_date: "2026-02-03", end_date: "2026-02-12", brand: "Y" },
      { id: "x2", start_date: "2026-02-08", end_date: "2026-02-12", brand: "X" },
    ];
    const layout = layoutMonthChannel(items, 2026, 1, (i) => i.brand);
    const laneOf = (id: string) =>
      layout.items.find((i) => i.item.id === id)?.lane;
    expect(laneOf("x1")).toBe(laneOf("x2")); // brand X stays on one track
  });
});

describe("resolveMonth", () => {
  const today = new Date("2026-06-29T00:00:00Z");

  it("maps a valid 1-based param to a 0-based index", () => {
    expect(resolveMonth("2", today)).toBe(1);
    expect(resolveMonth("12", today)).toBe(11);
  });

  it("falls back to the current month for missing/invalid values", () => {
    expect(resolveMonth(undefined, today)).toBe(5); // June
    expect(resolveMonth("", today)).toBe(5);
    expect(resolveMonth("13", today)).toBe(5);
    expect(resolveMonth("abc", today)).toBe(5);
  });
});
