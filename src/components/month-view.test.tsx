import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MonthView } from "@/components/month-view";

// The month view only uses the router for month navigation.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const channels = [
  { id: "1", name: "WS-Prfrm", type: "webshop" as const },
  { id: "2", name: "Otto", type: "marketplace" as const },
  { id: "3", name: "Sport Müller", type: "retailer" as const },
  { id: "4", name: "Amazon", type: "marketplace" as const },
];

describe("MonthView channel rows", () => {
  it("groups the rows by category in the same order as the year view", () => {
    const { container } = render(
      <MonthView
        year={2026}
        month={0}
        channels={channels}
        actions={[]}
        brands={[]}
      />,
    );
    const grid = container.querySelector(".overflow-x-auto > div");
    const lines = [...(grid?.children ?? [])]
      .map((el) => el.textContent?.trim() ?? "")
      // Drop the day axis (its label cell reads "Kanal", then the day numbers).
      .filter((text) => !text.startsWith("Kanal"));

    expect(lines).toEqual([
      "Marketplaces(2)",
      "Amazon",
      "Otto",
      "Eigene Webshops(1)",
      "WS-Prfrm",
      "Händler(1)",
      "Sport Müller",
    ]);
  });
});

// PROJ-6 revision 2026-08-24: the month view marks drafts the same way, but
// has no switch of its own — it has no filter row.
describe("MonthView drafts", () => {
  const brands = [
    { id: "b1", name: "Dooky", color: "#1e3a8a", product_group_name: "Familie" },
  ];
  const draft = {
    id: "a1",
    title: "Sparfuchswoche",
    marketplace_id: "4",
    start_date: "2026-01-05",
    end_date: "2026-01-12",
    comment: null,
    marketplace_name: "Amazon",
    brands: [{ ...brands[0], discount_value: "20%" }],
    status: "draft" as const,
    confirmed_at: null,
    confirmed_by_email: null,
  };

  it("hatches draft bars and explains the texture in the legend", () => {
    render(
      <MonthView
        year={2026}
        month={0}
        channels={channels}
        actions={[draft]}
        brands={brands}
      />,
    );

    const bar = screen.getByRole("button", { name: /Sparfuchswoche/ });
    expect(bar).toHaveAttribute("data-draft", "true");
    expect(bar.style.backgroundColor).toBe("rgb(30, 58, 138)");
    expect(bar.style.backgroundImage).toContain("repeating-linear-gradient");
    expect(screen.getByText(/schraffiert = Entwurf/)).toBeInTheDocument();
  });
});
