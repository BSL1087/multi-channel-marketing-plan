import { test, expect } from "@playwright/test";

/**
 * PROJ-7 — Kannibalisierungs-Warnung
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 *
 * Die eigentliche Warn-Logik (Konflikt-Erkennung serverseitig, Zwei-Schritt-
 * Speichern, "Trotzdem speichern"/"Abbrechen", Gruppierung gleicher/anderer
 * Kanal, Selbst-Ausschluss beim Bearbeiten) ist durch Code-Review und manuellen
 * Smoke-Test abgedeckt — siehe QA-Ergebnisse in der Spec. Der Warn-Dialog wird
 * vom geteilten ActionFormDialog ausgelöst und greift damit in Aktions-Liste
 * UND Kalender. Playwright läuft lokal nicht zuverlässig (Projektnotiz); dieser
 * Test ist für CI vorgesehen und sichert den Zugriffsschutz beider Einstiege ab.
 */

test.describe("PROJ-7: Kannibalisierungs-Warnung — Route-Schutz", () => {
  test("Aktions-Liste leitet nicht eingeloggte Nutzer zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing/aktionen");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Kalender leitet nicht eingeloggte Nutzer zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing");
    await expect(page).toHaveURL(/\/login$/);
  });
});
