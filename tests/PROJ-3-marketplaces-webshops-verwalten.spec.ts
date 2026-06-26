import { test, expect } from "@playwright/test";

/**
 * PROJ-3 — Marketplaces & Webshops verwalten
 * E2E-Regressionstests für die NICHT-eingeloggten Abläufe (Route-Schutz).
 * Eingeloggte Abläufe (Liste, Anlegen, Umbenennen, Löschen, Validierung,
 * Duplikat-Sperre) sind durch manuellen Browser-Test + DB-/RLS-Checks und
 * Unit-Tests abgedeckt (siehe Spec, QA-Ergebnisse).
 */

test.describe("PROJ-3: Route-Schutz Kanal-Verwaltung", () => {
  test("leitet nicht eingeloggte Nutzer von der Kanal-Verwaltung zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing/kanaele");
    await expect(page).toHaveURL(/\/login$/);
  });
});
