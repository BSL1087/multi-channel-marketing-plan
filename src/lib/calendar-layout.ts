/**
 * Pure layout helpers for the year calendar (PROJ-6).
 * Bars are positioned by their day-of-year fraction so widths stay proportional
 * and cross-year actions are clipped to the displayed year.
 */

const MONTH_LABELS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

export type CalendarItem = {
  id: string;
  start_date: string;
  end_date: string;
};

export type LaidOutItem<T> = {
  item: T;
  leftPct: number;
  widthPct: number;
  lane: number;
};

export type ChannelLayout<T> = {
  lanes: number;
  items: LaidOutItem<T>[];
};

function utcDays(year: number): number {
  return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
}

/** 0-based day index within `year` (Jan 1 = 0). Can be negative or beyond the year. */
function dayIndex(iso: string, year: number): number {
  const [y, m, d] = iso.split("-").map(Number);
  return (Date.UTC(y, m - 1, d) - Date.UTC(year, 0, 1)) / 86_400_000;
}

/**
 * Bar geometry (percent of the year) for an action, clipped to `year`.
 * Returns null when the action does not overlap the year at all.
 */
export function barGeometry(
  item: CalendarItem,
  year: number,
): { leftPct: number; widthPct: number; startIdx: number; endIdx: number } | null {
  const days = utcDays(year);
  const rawStart = dayIndex(item.start_date, year);
  const rawEnd = dayIndex(item.end_date, year);
  if (rawEnd < 0 || rawStart > days - 1) return null; // outside the year

  const startIdx = Math.max(rawStart, 0);
  const endIdx = Math.min(rawEnd, days - 1);
  const leftPct = (startIdx / days) * 100;
  const widthPct = ((endIdx - startIdx + 1) / days) * 100;
  return { leftPct, widthPct, startIdx, endIdx };
}

/**
 * Lays out one channel's actions: assigns each a lane via greedy interval
 * partitioning (sorted by start) so overlapping bars never collide.
 */
export function layoutChannel<T extends CalendarItem>(
  items: T[],
  year: number,
): ChannelLayout<T> {
  const geo = items
    .map((item) => ({ item, g: barGeometry(item, year) }))
    .filter((x): x is { item: T; g: NonNullable<ReturnType<typeof barGeometry>> } => x.g !== null)
    .sort((a, b) => a.g.startIdx - b.g.startIdx || a.g.endIdx - b.g.endIdx);

  const laneEnds: number[] = []; // last endIdx per lane
  const result: LaidOutItem<T>[] = [];

  for (const { item, g } of geo) {
    let lane = laneEnds.findIndex((end) => end < g.startIdx);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(g.endIdx);
    } else {
      laneEnds[lane] = g.endIdx;
    }
    result.push({ item, leftPct: g.leftPct, widthPct: g.widthPct, lane });
  }

  return { lanes: Math.max(laneEnds.length, 1), items: result };
}

/** Proportional month columns for the axis (label + position + width in %). */
export function monthColumns(
  year: number,
): { label: string; leftPct: number; widthPct: number }[] {
  const days = utcDays(year);
  const cols: { label: string; leftPct: number; widthPct: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const start = (Date.UTC(year, m, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
    const len = (Date.UTC(year, m + 1, 1) - Date.UTC(year, m, 1)) / 86_400_000;
    cols.push({
      label: MONTH_LABELS[m],
      leftPct: (start / days) * 100,
      widthPct: (len / days) * 100,
    });
  }
  return cols;
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
