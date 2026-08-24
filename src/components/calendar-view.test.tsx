import { fireEvent, render, screen, within } from "@testing-library/react";
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

// PROJ-6 revision 2026-08-24: drafts share the year view, marked by hatching.
const brands = [
  { id: "b1", name: "Dooky", color: "#1e3a8a", product_group_name: "Familie" },
  { id: "b2", name: "RPM", color: "#ef4444", product_group_name: "Fitness" },
];

function action(
  id: string,
  brand: (typeof brands)[number],
  status: "draft" | "confirmed",
) {
  return {
    id,
    title: status === "draft" ? "Sparfuchswoche" : "Summer Sale",
    marketplace_id: "5",
    start_date: "2026-06-01",
    end_date: "2026-06-14",
    comment: null,
    marketplace_name: "Amazon",
    brands: [{ ...brand, discount_value: "20%" }],
    status,
    confirmed_at: null,
    confirmed_by_email: null,
  };
}

function renderWithDrafts() {
  return render(
    <CalendarView
      year={2026}
      channels={channels}
      actions={[
        action("a1", brands[1], "confirmed"),
        action("a2", brands[0], "draft"),
      ]}
      brands={brands}
    />,
  );
}

const bar = (name: RegExp) => screen.getByRole("button", { name });

describe("CalendarView drafts (PROJ-6 revision 2026-08-24)", () => {
  it("draws drafts hatched and committed actions solid", () => {
    renderWithDrafts();

    const draft = bar(/Sparfuchswoche/);
    const committed = bar(/Summer Sale/);

    // Colour still says which brand; only the texture differs.
    expect(draft).toHaveAttribute("data-draft", "true");
    expect(draft.style.backgroundColor).toBe("rgb(30, 58, 138)");
    expect(draft.style.backgroundImage).toContain("repeating-linear-gradient");

    expect(committed).not.toHaveAttribute("data-draft");
    expect(committed.style.backgroundImage).toBe("");
  });

  it("marks the draft in its accessible name", () => {
    renderWithDrafts();
    expect(bar(/Sparfuchswoche/)).toHaveAccessibleName(
      "Sparfuchswoche (Dooky) — Entwurf",
    );
  });

  it("offers a draft filter with its count, on by default", () => {
    renderWithDrafts();
    const filter = screen.getByLabelText(/^Entwürfe/);
    expect(filter).toBeChecked();
    expect(within(filter.closest("div")!).getByText("(1)")).toBeInTheDocument();
  });

  it("hides the draft bars — and the texture key — when switched off", () => {
    renderWithDrafts();
    expect(screen.getByText(/schraffiert = Entwurf/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/^Entwürfe/));

    expect(screen.queryByRole("button", { name: /Sparfuchswoche/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Summer Sale/ })).toBeDefined();
    expect(screen.queryByText(/schraffiert = Entwurf/)).toBeNull();
  });

  it("explains an empty grid caused by hidden drafts instead of looking empty", () => {
    render(
      <CalendarView
        year={2026}
        channels={channels}
        actions={[action("a2", brands[0], "draft")]}
        brands={brands}
      />,
    );

    fireEvent.click(screen.getByLabelText(/^Entwürfe/));

    expect(screen.getByText(/1 Entwurf ist/)).toBeInTheDocument();
  });

  it("keeps no draft controls when there is nothing to hide", () => {
    renderCalendar();
    expect(screen.queryByLabelText(/^Entwürfe/)).toBeNull();
  });
});
