import { test, expect } from "@playwright/test";

/**
 * PROJ-6 — Jahreskalender-Übersicht
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 * Die eingeloggten Abläufe (Darstellung, Stapeln, Tooltip, Bearbeiten, Jahres-
 * navigation, Legende) sind durch Code-Review und manuellen Smoke-Test
 * abgedeckt — siehe QA-Ergebnisse in der Spec. Playwright läuft lokal nicht
 * (Projektnotiz); dieser Test ist für CI vorgesehen.
 */

test.describe("PROJ-6: Jahreskalender — Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer zur Login-Seite", async ({ page }) => {
    await page.goto("/tools/multi-channel-marketing");
    await expect(page).toHaveURL(/\/login$/);
  });
});
