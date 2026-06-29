/**
 * Pure layout helpers for the MONTH view (PROJ-8).
 *
 * Mirrors `calendar-layout.ts` (the year view) but scoped to a single month at a
 * readable day width, so bars can carry labels. Geometry is in plain pixels (the
 * month track has a fixed width = days × DAY_WIDTH and scrolls horizontally),
 * which keeps the day grid exact. The greedy lane-stacking principle is the same
 * as the year view: overlapping actions on a channel stack onto sub-lanes, and a
 * brand prefers a lane it already occupies so its bars line up.
 */

export { isLightColor, formatDate } from "./calendar-layout";

/** Readable pixels per day (year view uses 2px; the month zoom is much wider). */
export const DAY_WIDTH = 28;

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export type MonthCalendarItem = {
  id: string;
  start_date: string;
  end_date: string;
};

export type MonthDay = {
  /** Day of month, 1-based. */
  day: number;
  /** Mo–So. */
  weekday: string;
  isWeekend: boolean;
  isToday: boolean;
  leftPx: number;
};

export type LaidOutMonthItem<T> = {
  item: T;
  leftPx: number;
  widthPx: number;
  lane: number;
  /** The action starts before the 1st of this month (bar clipped on the left). */
  clippedStart: boolean;
  /** The action ends after the last of this month (bar clipped on the right). */
  clippedEnd: boolean;
};

export type MonthChannelLayout<T> = {
  lanes: number;
  items: LaidOutMonthItem<T>[];
};

/** Number of days in a given month (monthIndex is 0-based: Jan = 0). */
export function daysInMonth(year: number, monthIndex: number): number {
  return (
    (Date.UTC(year, monthIndex + 1, 1) - Date.UTC(year, monthIndex, 1)) /
    86_400_000
  );
}

/** Full German month name (monthIndex 0-based). */
export function monthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] ?? "";
}

/** Total pixel width of the month track. */
export function monthTrackWidth(year: number, monthIndex: number): number {
  return daysInMonth(year, monthIndex) * DAY_WIDTH;
}

/**
 * Builds the day axis for the month. `today` is injectable for testing; defaults
 * to the current date. A day is "today" only when year + month + day all match.
 */
export function monthDays(
  year: number,
  monthIndex: number,
  today: Date = new Date(),
): MonthDay[] {
  const n = daysInMonth(year, monthIndex);
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === monthIndex;
  const days: MonthDay[] = [];
  for (let d = 1; d <= n; d++) {
    const dow = new Date(Date.UTC(year, monthIndex, d)).getUTCDay(); // 0=Sun..6=Sat
    const mondayBased = (dow + 6) % 7; // 0=Mon..6=Sun
    days.push({
      day: d,
      weekday: WEEKDAY_LABELS[mondayBased],
      isWeekend: dow === 0 || dow === 6,
      isToday: isCurrentMonth && today.getDate() === d,
      leftPx: (d - 1) * DAY_WIDTH,
    });
  }
  return days;
}

/**
 * Day-accurate bar geometry within the month, in pixels. Returns null when the
 * action does not overlap the month. `clippedStart/End` flag actions that extend
 * beyond the month edges so the UI can mark them as continuing.
 */
export function monthBarGeometry(
  item: MonthCalendarItem,
  year: number,
  monthIndex: number,
): {
  leftPx: number;
  widthPx: number;
  startIdx: number;
  endIdx: number;
  clippedStart: boolean;
  clippedEnd: boolean;
} | null {
  const [sy, sm, sd] = item.start_date.split("-").map(Number);
  const [ey, em, ed] = item.end_date.split("-").map(Number);
  const startT = Date.UTC(sy, sm - 1, sd);
  const endT = Date.UTC(ey, em - 1, ed);

  const n = daysInMonth(year, monthIndex);
  const monthStart = Date.UTC(year, monthIndex, 1);
  const monthEnd = Date.UTC(year, monthIndex, n);
  if (endT < monthStart || startT > monthEnd) return null;

  const clippedStart = startT < monthStart;
  const clippedEnd = endT > monthEnd;
  const startDay = clippedStart ? 1 : sd;
  const endDay = clippedEnd ? n : ed;

  const leftPx = (startDay - 1) * DAY_WIDTH;
  const widthPx = (endDay - startDay + 1) * DAY_WIDTH;
  return {
    leftPx,
    widthPx,
    startIdx: startDay - 1,
    endIdx: endDay - 1,
    clippedStart,
    clippedEnd,
  };
}

/**
 * Lays out one channel's actions into stacked sub-lanes for the month via greedy
 * interval partitioning (sorted by start). `getGroup` (e.g. brand id) lets the
 * same group reuse a lane it last held, so a brand's non-overlapping bars align.
 * Same principle as the year view's `layoutChannel`, scoped to the month.
 */
export function layoutMonthChannel<T extends MonthCalendarItem>(
  items: T[],
  year: number,
  monthIndex: number,
  getGroup?: (item: T) => string,
): MonthChannelLayout<T> {
  const geo = items
    .map((item) => ({ item, g: monthBarGeometry(item, year, monthIndex) }))
    .filter(
      (x): x is { item: T; g: NonNullable<ReturnType<typeof monthBarGeometry>> } =>
        x.g !== null,
    )
    .sort((a, b) => a.g.startIdx - b.g.startIdx || a.g.endIdx - b.g.endIdx);

  const lanes: { end: number; group?: string }[] = [];
  const result: LaidOutMonthItem<T>[] = [];

  for (const { item, g } of geo) {
    const group = getGroup?.(item);
    let lane =
      group !== undefined
        ? lanes.findIndex((l) => l.end < g.startIdx && l.group === group)
        : -1;
    if (lane === -1) lane = lanes.findIndex((l) => l.end < g.startIdx);

    if (lane === -1) {
      lane = lanes.length;
      lanes.push({ end: g.endIdx, group });
    } else {
      lanes[lane] = { end: g.endIdx, group };
    }
    result.push({
      item,
      leftPx: g.leftPx,
      widthPx: g.widthPx,
      lane,
      clippedStart: g.clippedStart,
      clippedEnd: g.clippedEnd,
    });
  }

  return { lanes: Math.max(lanes.length, 1), items: result };
}

/**
 * Resolves a raw `month` URL param (1-based "1".."12") to a 0-based month index.
 * Falls back to the current month for missing/invalid values (per AC).
 */
export function resolveMonth(
  raw: string | undefined,
  today: Date = new Date(),
): number {
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n - 1;
  return today.getMonth();
}
