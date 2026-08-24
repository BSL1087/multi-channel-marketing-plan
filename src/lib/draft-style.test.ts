import { describe, expect, it } from "vitest";

import { barFill, draftStripes, DRAFT_SWATCH } from "@/lib/draft-style";

describe("draft bar styling (PROJ-6 revision 2026-08-24)", () => {
  it("leaves committed bars a plain brand-coloured fill", () => {
    expect(barFill("#ef4444", false)).toEqual({ backgroundColor: "#ef4444" });
  });

  it("keeps the brand colour on drafts and only adds hatching", () => {
    const style = barFill("#ef4444", true);
    expect(style.backgroundColor).toBe("#ef4444");
    expect(style.backgroundImage).toContain("repeating-linear-gradient");
  });

  it("uses dark ink on light brand colours and light ink on dark ones", () => {
    // Without this the hatching would vanish on pale brand colours.
    expect(draftStripes("#fde047")).toContain("rgba(17,24,39");
    expect(draftStripes("#1e3a8a")).toContain("rgba(255,255,255");
  });

  it("offers a neutral hatched swatch for legend and filter", () => {
    expect(DRAFT_SWATCH.backgroundImage).toContain("repeating-linear-gradient");
  });
});
