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

  it("tints header and channel rows in every category, header a step stronger", () => {
    const { container } = renderCalendar();
    const grid = container.querySelector(".overflow-x-auto > div");
    const rows = [...(grid?.children ?? [])];

    const header = (name: string) =>
      rows.find((el) => el.textContent?.startsWith(name))?.className ?? "";
    const channelRow = (name: string) =>
      rows.find((el) => el.textContent?.trim().startsWith(name))?.className ??
      "";

    // Every category is tinted — no category may end up looking colourless.
    expect(header("Marketplaces")).toContain("bg-sky-200/80");
    expect(header("Eigene Webshops")).toContain("bg-emerald-200/80");
    expect(header("Händler")).toContain("bg-amber-100/90");

    expect(channelRow("Amazon")).toContain("bg-sky-100/25");
    expect(channelRow("WS-Assault Fitness")).toContain("bg-emerald-100/20");
    expect(channelRow("Sport Müller")).toContain("bg-amber-100/20");
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
