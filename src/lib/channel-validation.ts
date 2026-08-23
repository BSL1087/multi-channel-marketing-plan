import { z } from "zod";

/**
 * Shared name rules for marketplaces/channels (PROJ-3).
 * Used by the server actions and the client form so validation stays in sync.
 * `.trim()` transforms the value, so leading/trailing spaces are ignored.
 */
export const channelNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Bitte einen Namen eingeben." })
  .max(60, { message: "Der Name darf höchstens 60 Zeichen haben." });

/**
 * Channel type (PROJ-3 extension): external marketplace, own webshop or
 * retailer. The array order is also the display order used everywhere —
 * calendars, lists and dropdowns group by it (see `sortChannels`).
 * Mirrors the `marketplaces_type_check` constraint in the database.
 */
export const CHANNEL_TYPES = ["marketplace", "webshop", "retailer"] as const;
export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const channelTypeSchema = z.enum(CHANNEL_TYPES, {
  message: "Bitte einen Kanal-Typ wählen.",
});

/** Human-readable German labels for each channel type (singular). */
export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  marketplace: "Marketplace",
  webshop: "Eigener Webshop",
  retailer: "Händler",
};

/** Plural labels — used for group headers and filter checkboxes. */
export const CHANNEL_TYPE_LABELS_PLURAL: Record<ChannelType, string> = {
  marketplace: "Marketplaces",
  webshop: "Eigene Webshops",
  retailer: "Händler",
};

/**
 * Tailwind classes per category, so a channel is recognisable by colour in the
 * year view, the month view and the channel list. One hue per category:
 * marketplace = blau, webshop = grün, händler = orange.
 */
/**
 * Category colours for the calendars.
 *
 * `header` marks the start of a category, `row` tints the channel rows below it.
 * The three hues are deliberately NOT set to the same Tailwind step: at these
 * light levels a warm hue reads far stronger than a cool one, so identical
 * values made amber look tinted while sky and emerald looked white. The steps
 * below are chosen for comparable *perceived* strength — sky and emerald sit one
 * step higher than amber, and the header always stays one step above its rows so
 * the category start remains recognisable.
 */
export const CHANNEL_TYPE_STYLES: Record<
  ChannelType,
  {
    /** Group header row inside a calendar. */
    header: string;
    /** Channel rows belonging to that group. */
    row: string;
    /** Badge in the channel list. */
    badge: string;
    /** Small colour square (filter, legend). */
    swatch: string;
  }
> = {
  marketplace: {
    header: "bg-sky-200/80 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200",
    row: "bg-sky-100/60 dark:bg-sky-950/30",
    badge:
      "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
    swatch: "bg-sky-400",
  },
  webshop: {
    header:
      "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200",
    row: "bg-emerald-100/60 dark:bg-emerald-950/30",
    badge:
      "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    swatch: "bg-emerald-400",
  },
  retailer: {
    // One step lighter than the others: yellow reads strongest at equal steps.
    header:
      "bg-amber-100/90 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200",
    row: "bg-amber-50 dark:bg-amber-950/30",
    badge:
      "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
    swatch: "bg-amber-400",
  },
};

export type ChannelLike = { id: string; name: string };

/** A channel as far as ordering/grouping cares: a name and a category. */
export type SortableChannel = { name: string; type: ChannelType };

const TYPE_RANK: Record<ChannelType, number> = CHANNEL_TYPES.reduce(
  (acc, type, index) => {
    acc[type] = index;
    return acc;
  },
  {} as Record<ChannelType, number>,
);

/**
 * Order channels by category first (marketplace → webshop → händler), then
 * alphabetically inside the category. Independent of the name, so prefixes
 * like "WS-" are no longer needed to keep a category together.
 */
export function compareChannels(a: SortableChannel, b: SortableChannel): number {
  const byType = (TYPE_RANK[a.type] ?? CHANNEL_TYPES.length) -
    (TYPE_RANK[b.type] ?? CHANNEL_TYPES.length);
  if (byType !== 0) return byType;
  return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
}

/** Non-mutating `compareChannels` sort. */
export function sortChannels<T extends SortableChannel>(channels: T[]): T[] {
  return channels.slice().sort(compareChannels);
}

/**
 * Sorted channels split into their categories. Empty categories are dropped,
 * so a calendar only renders headers it actually has rows for.
 */
export function groupChannelsByType<T extends SortableChannel>(
  channels: T[],
): { type: ChannelType; label: string; items: T[] }[] {
  return CHANNEL_TYPES.map((type) => ({
    type,
    label: CHANNEL_TYPE_LABELS_PLURAL[type],
    items: sortChannels(channels.filter((c) => c.type === type)),
  })).filter((group) => group.items.length > 0);
}

/** How many channels exist per category — drives the filter counts. */
export function countChannelsByType(
  channels: SortableChannel[],
): Record<ChannelType, number> {
  const counts = CHANNEL_TYPES.reduce(
    (acc, type) => {
      acc[type] = 0;
      return acc;
    },
    {} as Record<ChannelType, number>,
  );
  for (const c of channels) {
    if (c.type in counts) counts[c.type]++;
  }
  return counts;
}

/**
 * Case-insensitive, whitespace-insensitive duplicate check.
 * `excludeId` skips the channel being renamed (its own name is not a clash).
 */
export function isDuplicateName(
  channels: ChannelLike[],
  name: string,
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return channels.some(
    (c) => c.id !== excludeId && c.name.trim().toLowerCase() === normalized,
  );
}
