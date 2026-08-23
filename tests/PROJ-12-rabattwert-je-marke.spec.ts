import { test, expect } from "@playwright/test";

/**
 * PROJ-12 — Rabattwert je Marke
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 * Die eingeloggten Abläufe (Feld je Marke, Auto-Anhaken beim Tippen, Sammelwert,
 * Pflichtwert je gewählter Marke, Vorbefüllung beim Bearbeiten) sind durch
 * Komponenten-Unit-Tests (`src/components/action-form-dialog.test.tsx`),
 * Schema-Tests und DB-Verifikation abgedeckt — siehe QA-Ergebnisse in der Spec.
 * Playwright läuft lokal nicht (Projektnotiz); dieser Test ist für CI vorgesehen.
 */

test.describe("PROJ-12: Rabattwert je Marke — Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer von der Aktionsseite zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing/aktionen");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("leitet nicht eingeloggte Nutzer vom Kalender zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing");
    await expect(page).toHaveURL(/\/login$/);
  });
});
