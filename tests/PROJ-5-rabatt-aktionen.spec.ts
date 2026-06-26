import { test, expect } from "@playwright/test";

/**
 * PROJ-5 — Rabatt-Aktionen anlegen & bearbeiten
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 * Die eingeloggten CRUD-Abläufe (Anlegen mit Kanal/Marke/Zeitraum, Ende≥Start,
 * Bearbeiten, Löschen, Cascade-Warnung bei Marke/Kanal) sind durch Unit-Tests,
 * Code-Review, DB-Verifikation (Backend) und manuellen Smoke-Test abgedeckt —
 * siehe QA-Ergebnisse in der Spec. Playwright läuft lokal nicht (Projektnotiz);
 * dieser Test ist für CI vorgesehen.
 */

test.describe("PROJ-5: Rabatt-Aktionen — Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer zur Login-Seite", async ({ page }) => {
    await page.goto("/tools/multi-channel-marketing/aktionen");
    await expect(page).toHaveURL(/\/login$/);
  });
});
