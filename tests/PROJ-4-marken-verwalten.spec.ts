import { test, expect } from "@playwright/test";

/**
 * PROJ-4 — Marken verwalten
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 * Die eingeloggten CRUD-Abläufe (Anlegen mit Farbe/Gruppe, Duplikat pro Gruppe,
 * Bearbeiten, Löschen, Leerzustände) sind durch Unit-Tests, Code-Review,
 * DB-Verifikation (Backend) und manuellen Smoke-Test abgedeckt — siehe
 * QA-Ergebnisse in der Spec. Playwright läuft in der lokalen Umgebung nicht
 * (siehe Projektnotiz); dieser Test ist für CI vorgesehen.
 */

test.describe("PROJ-4: Marken — Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer zur Login-Seite", async ({ page }) => {
    await page.goto("/tools/multi-channel-marketing/marken");
    await expect(page).toHaveURL(/\/login$/);
  });
});
