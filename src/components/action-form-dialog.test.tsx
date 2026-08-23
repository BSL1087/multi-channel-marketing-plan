import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createAction = vi.fn(async () => ({ ok: true as const }));
const updateAction = vi.fn(async () => ({ ok: true as const }));
const findActionConflicts = vi.fn(async () => ({
  ok: true as const,
  conflicts: [],
}));
const deleteAction = vi.fn(async () => ({ ok: true as const }));

// Server actions can't run in jsdom — stub the whole module.
vi.mock("@/app/tools/multi-channel-marketing/aktionen/actions", () => ({
  createAction: (...args: unknown[]) => createAction(...(args as [])),
  updateAction: (...args: unknown[]) => updateAction(...(args as [])),
  findActionConflicts: (...args: unknown[]) =>
    findActionConflicts(...(args as [])),
  deleteAction: (...args: unknown[]) => deleteAction(...(args as [])),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

import { ActionFormDialog } from "@/components/action-form-dialog";

const channels = [
  { id: "223e4567-e89b-12d3-a456-426614174001", name: "Amazon", type: "marketplace" as const },
];

const brands = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Dooky",
    product_group_name: "Familie",
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    name: "Tega",
    product_group_name: "Familie",
  },
];

function renderDialog() {
  return render(
    <ActionFormDialog
      open
      onOpenChange={() => {}}
      action={null}
      brands={brands}
      channels={channels}
    />,
  );
}

/** The per-brand discount input, addressed by its accessible label. */
function discountInput(brandName: string): HTMLInputElement {
  return screen.getByLabelText(`Rabattwert für ${brandName}`) as HTMLInputElement;
}

function checkbox(brandName: string): HTMLElement {
  // Each row is "checkbox + name" inside one label.
  return screen.getByRole("checkbox", { name: brandName });
}

describe("ActionFormDialog — Rabattwert je Marke (PROJ-12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gives every brand its own discount input and no shared discount field", () => {
    renderDialog();
    expect(discountInput("Dooky")).toBeDefined();
    expect(discountInput("Tega")).toBeDefined();
    // The old single "Rabattwert" form row must be gone.
    expect(screen.queryByLabelText("Rabattwert")).toBeNull();
  });

  it("checks a brand automatically when its discount is typed", async () => {
    renderDialog();

    expect(checkbox("Dooky")).toHaveProperty("dataset.state", "unchecked");
    fireEvent.change(discountInput("Dooky"), { target: { value: "20%" } });

    await waitFor(() =>
      expect(checkbox("Dooky")).toHaveProperty("dataset.state", "checked"),
    );
  });

  it("keeps a typed value visible after the brand is unchecked", async () => {
    renderDialog();

    fireEvent.change(discountInput("Dooky"), { target: { value: "20%" } });
    fireEvent.click(checkbox("Dooky"));

    await waitFor(() =>
      expect(checkbox("Dooky")).toHaveProperty("dataset.state", "unchecked"),
    );
    expect(discountInput("Dooky").value).toBe("20%");
  });

  it("applies the bulk value to selected brands only", async () => {
    renderDialog();

    fireEvent.click(checkbox("Dooky"));
    fireEvent.change(
      screen.getByLabelText("Rabattwert für alle gewählten Marken"),
      { target: { value: "15%" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Für alle gewählten übernehmen" }),
    );

    await waitFor(() => expect(discountInput("Dooky").value).toBe("15%"));
    // Tega was never selected, so it stays empty.
    expect(discountInput("Tega").value).toBe("");
  });

  it("refuses to save when a selected brand has no discount value", async () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Titel"), { target: { value: "Sommer-Sale" } });
    fireEvent.click(checkbox("Dooky"));
    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() =>
      expect(
        screen.getByText("1 gewählte Marke ohne Rabattwert."),
      ).toBeDefined(),
    );
    expect(createAction).not.toHaveBeenCalled();
  });

  it("prefills each brand's own value when editing", () => {
    render(
      <ActionFormDialog
        open
        onOpenChange={() => {}}
        action={{
          id: "aaa",
          title: "Sommer-Sale",
          marketplace_id: channels[0].id,
          start_date: "2026-03-01",
          end_date: "2026-03-05",
          comment: null,
          marketplace_name: "Amazon",
          brands: [
            { id: brands[0].id, name: brands[0].name, color: "#ff0000", discount_value: "20%" },
            { id: brands[1].id, name: brands[1].name, color: "#00ff00", discount_value: "10€" },
          ],
        }}
        brands={brands}
        channels={channels}
      />,
    );

    expect(discountInput("Dooky").value).toBe("20%");
    expect(discountInput("Tega").value).toBe("10€");
  });
});
