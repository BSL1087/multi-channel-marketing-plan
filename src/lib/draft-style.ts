import type { CSSProperties } from "react";

import { isLightColor } from "@/lib/calendar-layout";

/**
 * Drafts share both calendars with committed actions since 2026-08-24
 * (revision of the PROJ-13 decision, see PROJ-6 "Entwürfe in der
 * Jahresansicht"). Colour keeps answering *which brand*, texture answers *how
 * binding*: a draft is hatched, never grey — greying it out would destroy the
 * brand recognition the calendar exists for.
 *
 * The stripe ink follows the brand colour's brightness, so the hatching stays
 * visible on a pale yellow just as much as on a dark blue.
 */
export function draftStripes(color: string): string {
  const ink = isLightColor(color)
    ? "rgba(17,24,39,0.45)" // dark ink on light brand colours
    : "rgba(255,255,255,0.75)"; // light ink on dark brand colours
  return `repeating-linear-gradient(45deg, ${ink} 0 2px, rgba(0,0,0,0) 2px 5px)`;
}

/** Fill for one bar: solid while committed, hatched while a draft. */
export function barFill(color: string, isDraft: boolean): CSSProperties {
  return isDraft
    ? { backgroundColor: color, backgroundImage: draftStripes(color) }
    : { backgroundColor: color };
}

/** Neutral hatched swatch for the legend key and the filter checkbox. */
export const DRAFT_SWATCH: CSSProperties = {
  backgroundColor: "#94a3b8", // slate-400 — stands for "any brand colour"
  backgroundImage: draftStripes("#94a3b8"),
};
