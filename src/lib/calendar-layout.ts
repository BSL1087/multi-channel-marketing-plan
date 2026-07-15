/**
 * Pure layout helpers for the year calendar (PROJ-6).
 *
 * Fixed, day-accurate pixel axis:
 *  - One day = DAY_WIDTH px.
 *  - Every month column has the same width MONTH_WIDTH px. A month's days
 *    (daysInMonth × DAY_WIDTH) are centered inside the column; the leftover
 *    pixels are split evenly left and right.
 *  - Bars are day-accurate: their width follows the action's date range.
 *
 * Overlap handling: every action is ONE continuous left-to-right bar. When
 * actions in the same channel overlap in time, the later one stacks compactly
 * onto a sub-lane below.
 */

const MONTH_LABELS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

/** Pixels per day. */
export const DAY_WIDTH = 2;
/** Uniform width of one month column, in pixels (days are centered within). */
export const MONTH_WIDTH = 64;
/** Total width of the 12-month track, in pixels. */
export const TRACK_WIDTH = MONTH_WIDTH * 12;

export type CalendarItem = {
  id: string;
  start_date: string;
  end_date: string;
};

export type LaidOutItem<T> = {
  item: T;
  leftPx: number;
  widthPx: number;
  lane: number; // sub-lane index within the channel row (0 = top)
};

export type ChannelLayout<T> = {
  lanes: number;
  items: LaidOutItem<T>[];
};

function daysInMonth(year: number, monthIndex: number): number {
  return (
    (Date.UTC(year, monthIndex + 1, 1) - Date.UTC(year, monthIndex, 1)) /
    86_400_000
  );
}

/** Left padding that centers a month's days within its fixed column. */
function monthPad(year: number, monthIndex: number): number {
  return (MONTH_WIDTH - daysInMonth(year, monthIndex) * DAY_WIDTH) / 2;
}

/** 0-based day index within `year` (Jan 1 = 0) — used for overlap detection. */
function dayIndex(iso: string, year: number): number {
  const [y, m, d] = iso.split("-").map(Number);
  return (Date.UTC(y, m - 1, d) - Date.UTC(year, 0, 1)) / 86_400_000;
}

/** Clamp a date to the displayed year, returning its month index + day. */
function clampToYear(iso: string, year: number): { m: number; d: number } {
  const [y, mo, da] = iso.split("-").map(Number);
  const t = Date.UTC(y, mo - 1, da);
  if (t < Date.UTC(year, 0, 1)) return { m: 0, d: 1 };
  if (t > Date.UTC(year, 11, 31)) return { m: 11, d: 31 };
  return { m: mo - 1, d: da };
}

/** Pixel x of the LEFT edge of a given day (centered month grid). */
function dayLeftPx(year: number, m: number, d: number): number {
  return m * MONTH_WIDTH + monthPad(year, m) + (d - 1) * DAY_WIDTH;
}

/**
 * Day-accurate bar geometry in pixels, clipped to `year`.
 * Returns null when the action does not overlap the year at all.
 */
export function barGeometry(
  item: CalendarItem,
  year: number,
): { leftPx: number; widthPx: number; startIdx: number; endIdx: number } | null {
  const [sy, sm, sd] = item.start_date.split("-").map(Number);
  const [ey, em, ed] = item.end_date.split("-").map(Number);
  const startT = Date.UTC(sy, sm - 1, sd);
  const endT = Date.UTC(ey, em - 1, ed);
  if (endT < Date.UTC(year, 0, 1) || startT > Date.UTC(year, 11, 31)) {
    return null;
  }

  const s = clampToYear(item.start_date, year);
  const e = clampToYear(item.end_date, year);
  const leftPx = dayLeftPx(year, s.m, s.d);
  const rightPx = dayLeftPx(year, e.m, e.d) + DAY_WIDTH; // include the end day
  const days = daysInYear(year);
  return {
    leftPx,
    widthPx: Math.max(rightPx - leftPx, DAY_WIDTH),
    startIdx: Math.max(dayIndex(item.start_date, year), 0),
    endIdx: Math.min(dayIndex(item.end_date, year), days - 1),
  };
}

function daysInYear(year: number): number {
  return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
}

/**
 * Lays out one channel's actions as continuous bars, assigning each a sub-lane
 * via greedy interval partitioning (sorted by start) so overlapping bars stack.
 *
 * `getGroup` (e.g. the brand id) lets the same group prefer the same lane: among
 * free lanes, one that last held the same group is reused first, so a brand's
 * non-overlapping actions line up on one horizontal track.
 */
export function layoutChannel<T extends CalendarItem>(
  items: T[],
  year: number,
  getGroup?: (item: T) => string,
): ChannelLayout<T> {
  const geo = items
    .map((item) => ({ item, g: barGeometry(item, year) }))
    .filter((x): x is { item: T; g: NonNullable<ReturnType<typeof barGeometry>> } => x.g !== null)
    .sort((a, b) => a.g.startIdx - b.g.startIdx || a.g.endIdx - b.g.endIdx);

  const lanes: { end: number; group?: string }[] = [];
  const result: LaidOutItem<T>[] = [];

  for (const { item, g } of geo) {
    const group = getGroup?.(item);
    // Prefer a free lane that last held the same group, then any free lane.
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
    result.push({ item, leftPx: g.leftPx, widthPx: g.widthPx, lane });
  }

  return { lanes: Math.max(lanes.length, 1), items: result };
}

/**
 * Pixel x of the CENTRE of a given ISO date within `year`, or null when the
 * date falls outside the displayed year. Used for the "today" marker line.
 */
export function datePx(iso: string, year: number): number | null {
  const [y, mo, da] = iso.split("-").map(Number);
  if (!y || !mo || !da) return null;
  const t = Date.UTC(y, mo - 1, da);
  if (t < Date.UTC(year, 0, 1) || t > Date.UTC(year, 11, 31)) return null;
  return dayLeftPx(year, mo - 1, da) + DAY_WIDTH / 2;
}

/** Fixed-width month columns for the axis (label + pixel position + width). */
export function monthColumns(): { label: string; leftPx: number; widthPx: number }[] {
  return MONTH_LABELS.map((label, m) => ({
    label,
    leftPx: m * MONTH_WIDTH,
    widthPx: MONTH_WIDTH,
  }));
}

/** True when a hex colour is light enough to need dark text on top. */
export function isLightColor(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  // Perceived brightness (ITU-R BT.601).
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/** Formats an ISO date as DD.MM.YYYY. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}
