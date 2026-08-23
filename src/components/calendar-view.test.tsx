import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarView } from "@/components/calendar-view";

// The calendar only uses the router for year/month navigation.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const channels = [
  { id: "1", name: "WS-Prfrm", type: "webshop" as const },
  { id: "2", name: "Otto", type: "marketplace" as const },
  { id: "3", name: "Sport Müller", type: "retailer" as const },
  { id: "4", name: "WS-Assault Fitness", type: "webshop" as const },
  { id: "5", name: "Amazon", type: "marketplace" as const },
];

function renderCalendar() {
  return render(
    <CalendarView year={2026} channels={channels} actions={[]} brands={[]} />,
  );
}

describe("CalendarView channel rows", () => {
  it("renders one calendar with the categories as sections, in display order", () => {
    const { container } = renderCalendar();
    // The category headers and the channel rows are siblings inside the single
    // calendar grid, so reading it top to bottom gives the rendered order.
    const grid = container.querySelector(".overflow-x-auto > div");
    const lines = [...(grid?.children ?? [])]
      .map((el) => el.textContent?.trim() ?? "")
      // Drop the month axis (first row) — it lists all twelve months.
      .filter((text) => !text.startsWith("Kanal"));

    expect(lines).toEqual([
      "Marketplaces(2)",
      "Amazon",
      "Otto",
      "Eigene Webshops(2)",
      "WS-Assault Fitness",
      "WS-Prfrm",
      "Händler(1)",
      "Sport Müller",
    ]);
  });

  it("colours the category headers, leaving the channel rows untinted", () => {
    const { container } = renderCalendar();
    const grid = container.querySelector(".overflow-x-auto > div");
    const rows = [...(grid?.children ?? [])];

    // The header carries the separation between categories …
    const header = rows.find((el) => el.textContent?.startsWith("Händler"));
    expect(header?.className).toContain("bg-amber-100/80");

    const marketplaceHeader = rows.find((el) =>
      el.textContent?.startsWith("Marketplaces"),
    );
    expect(marketplaceHeader?.className).toContain("bg-sky-100/80");

    // … while channel rows stay neutral. A tint light enough not to disturb the
    // action bars is only perceptible in warm hues, so amber rows looked tinted
    // and sky/emerald ones looked white — inconsistent despite identical rules.
    const label = rows
      .find((el) => el.textContent?.trim() === "Sport Müller")
      ?.firstElementChild;
    expect(label?.className).not.toMatch(/bg-(amber|sky|emerald)-50/);
  });

  it("offers one filter checkbox per category with its channel count", () => {
    renderCalendar();
    for (const [label, count] of [
      ["Marketplaces", 2],
      ["Eigene Webshops", 2],
      ["Händler", 1],
    ] as const) {
      const filter = screen.getByLabelText(new RegExp(`^${label}`));
      expect(filter).toBeChecked();
      expect(
        within(filter.closest("div")!).getByText(`(${count})`),
      ).toBeInTheDocument();
    }
  });
});
