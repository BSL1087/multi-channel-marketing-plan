import { test, expect } from "@playwright/test";

/**
 * PROJ-11 — Produktgruppen verwalten
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 * Die eingeloggten CRUD-Abläufe (Anlegen/Umbenennen/Löschen, Duplikat-/
 * Längen-Validierung, Lösch-Sperre) sind durch Unit-Tests, Code-Review,
 * DB-Verifikation (Backend) und manuellen Smoke-Test abgedeckt — siehe
 * QA-Ergebnisse in der Spec. Playwright läuft in der lokalen Umgebung nicht
 * (siehe Projektnotiz), dieser Test ist für CL/CI vorgesehen.
 */

test.describe("PROJ-11: Produktgruppen — Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer zur Login-Seite", async ({ page }) => {
    await page.goto("/tools/multi-channel-marketing/produktgruppen");
    await expect(page).toHaveURL(/\/login$/);
  });
});
