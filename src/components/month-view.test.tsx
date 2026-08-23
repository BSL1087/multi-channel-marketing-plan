import { render } from "@testing-library/react";
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
