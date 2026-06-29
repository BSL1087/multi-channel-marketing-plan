import { test, expect } from "@playwright/test";

/**
 * PROJ-8 — Monats-Zoom / Tagesansicht
 * E2E-Regressionstest für den NICHT-eingeloggten Ablauf (Route-Schutz).
 *
 * Die Monatsansicht teilt sich die Route mit dem Jahreskalender und wird über
 * den URL-Parameter `?month=MM` aktiviert. Die eingeloggten Abläufe (Tagesraster,
 * beschriftete/gestapelte Balken, Monatsrand-Überläufe, Vor/Zurück inkl.
 * Jahreswechsel, Bearbeiten/Löschen, Anlegen mit Monats-Vorbelegung) sind durch
 * Unit-Tests (`month-layout`), Code-Review und manuellen Smoke-Test abgedeckt —
 * siehe QA-Ergebnisse in der Spec. Playwright läuft lokal nicht (Projektnotiz);
 * dieser Test ist für CI vorgesehen.
 */

test.describe("PROJ-8: Monats-Zoom — Route-Schutz", () => {
  test("Monatsansicht leitet nicht eingeloggte Nutzer zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing?year=2026&month=2");
    await expect(page).toHaveURL(/\/login$/);
  });
});
