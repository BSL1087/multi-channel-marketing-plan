import { test, expect } from "@playwright/test";

/**
 * PROJ-13 — Entwurf & Freigabe
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 * Die eingeloggten Abläufe (zwei Speicher-Wege, Status-Kennzeichen und -Filter,
 * Übernehmen/Zurücksetzen, Entwürfe nicht im Kalender) sind durch
 * Komponenten-Unit-Tests (`src/components/action-form-dialog.test.tsx`),
 * funktionale DB-Checks und Code-Review abgedeckt — siehe QA-Ergebnisse in der
 * Spec. Playwright läuft lokal nicht (Projektnotiz); dieser Test ist für CI
 * vorgesehen.
 */

test.describe("PROJ-13: Entwurf & Freigabe — Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer von der Aktions-Verwaltung zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing/aktionen");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("leitet nicht eingeloggte Nutzer vom Jahreskalender zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("leitet nicht eingeloggte Nutzer vom Monats-Zoom zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing?month=3");
    await expect(page).toHaveURL(/\/login/);
  });
});
