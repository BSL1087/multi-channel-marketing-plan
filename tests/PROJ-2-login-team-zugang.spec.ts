import { test, expect } from "@playwright/test";

/**
 * PROJ-2 — Login / Team-Zugang
 * E2E-Regressionstests für die NICHT-eingeloggten Abläufe.
 * Eingeloggte Abläufe (Dashboard, Logout, Passwort ändern) sind durch
 * manuellen Test + HTTP-/Sicherheitschecks abgedeckt (siehe Spec, QA-Ergebnisse).
 */

test.describe("PROJ-2: Route-Schutz", () => {
  test("leitet nicht eingeloggte Nutzer vom Dashboard zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("leitet nicht eingeloggte Nutzer von der Tool-Seite zur Login-Seite", async ({
    page,
  }) => {
    await page.goto("/tools/multi-channel-marketing");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("PROJ-2: Login-Seite", () => {
  test("zeigt Logo, Formularfelder und Login-Button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByAltText("agon's world")).toBeVisible();
    await expect(page.getByLabel("E-Mail")).toBeVisible();
    await expect(page.getByLabel("Passwort")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("zeigt Validierungsfehler bei leerem Formular", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Bitte E-Mail eingeben.")).toBeVisible();
    await expect(page.getByText("Bitte Passwort eingeben.")).toBeVisible();
    // Bleibt auf der Login-Seite (keine Weiterleitung)
    await expect(page).toHaveURL(/\/login$/);
  });

  test("zeigt generische Fehlermeldung bei falschen Anmeldedaten", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("E-Mail").fill("kein-konto@example.com");
    await page.getByLabel("Passwort").fill("definitiv-falsch-123");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByText("E-Mail oder Passwort ist falsch.")
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
