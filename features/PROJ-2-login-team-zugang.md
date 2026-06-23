# PROJ-2: Login / Team-Zugang

## Status: Planned
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — für Auth, Profile (Anzeigename) und Session-Middleware

## User Stories
- Als **Team-Mitglied** möchte ich mich mit E-Mail und Passwort einloggen, damit ich Zugang zum Tool erhalte.
- Als **Team-Mitglied** möchte ich nach dem Login auf einem Dashboard landen, das mich begrüßt und mir die verfügbaren Tools zeigt, damit ich weiß, wo ich bin und wie es weitergeht.
- Als **Team-Mitglied** möchte ich mich ausloggen können, damit niemand an meinem Gerät auf das Tool zugreift.
- Als **Team-Mitglied** möchte ich mein Passwort selbst ändern können, damit ich das vom Admin vergebene Passwort durch ein eigenes ersetzen kann.
- Als **nicht eingeloggte Person** möchte ich auf geschützten Seiten automatisch zur Login-Seite geleitet werden, damit klar ist, dass ich mich erst anmelden muss.

## Out of Scope
- **„Passwort vergessen"-Selbstbedienung** (per E-Mail-Reset) — Passwort-Reset macht der Admin im Dashboard
- **Account-Anlage / Einladung neuer Nutzer** — bleibt beim Admin im Supabase-Dashboard (PROJ-1)
- **Weitere Kalender im Dashboard** (Social Media, Offline-Events) — Zukunfts-Feature, eigener Spec später
- **Der eigentliche Jahreskalender** hinter der Kachel → PROJ-6 (hier nur Platzhalter-Seite)
- **Benutzerrollen / Rechte** — alle gleichberechtigt (MVP)
- **Erzwungene Passwortänderung beim ersten Login** — Änderung ist freiwillig
- **Bearbeiten des Anzeigenamens durch den Nutzer** — Anzeigename setzt der Admin (kann später ergänzt werden)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Login
- [ ] Angenommen ein gültiger Account existiert, wenn der Nutzer korrekte E-Mail und Passwort eingibt und „Login" klickt, dann wird er eingeloggt und zum Dashboard weitergeleitet.
- [ ] Angenommen falsche Anmeldedaten, wenn der Nutzer „Login" klickt, dann erscheint eine generische Fehlermeldung („E-Mail oder Passwort ist falsch") und die E-Mail-Eingabe bleibt erhalten.
- [ ] Angenommen ein leeres Formular, wenn der Nutzer „Login" klickt, dann wird für E-Mail und Passwort je eine Validierungsmeldung angezeigt.
- [ ] Angenommen die Verbindung schlägt fehl, wenn der Nutzer „Login" klickt, dann erscheint eine Fehlermeldung und die Eingaben bleiben erhalten.

### Geschützte Seiten & Navigation
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er eine geschützte Seite (Dashboard, Tool) aufruft, dann wird er zur Login-Seite weitergeleitet.
- [ ] Angenommen der Nutzer **ist** eingeloggt, wenn er die Login-Seite aufruft, dann wird er zum Dashboard weitergeleitet.
- [ ] Angenommen der Nutzer ist eingeloggt, wenn das Dashboard lädt, dann sieht er das Firmenlogo, „Eingeloggt als [Anzeigename]", die Kachel „Multi-Channel-Marketing" und einen Logout-Button.
- [ ] Angenommen der Nutzer ist auf dem Dashboard, wenn er auf die Kachel „Multi-Channel-Marketing" klickt, dann gelangt er auf die Platzhalter-Seite („Jahreskalender — kommt in Kürze").

### Logout
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er „Logout" klickt, dann wird die Sitzung beendet und er landet auf der Login-Seite.
- [ ] Angenommen der Nutzer hat sich ausgeloggt, wenn er danach „zurück" im Browser drückt, dann erhält er keinen Zugriff auf geschützte Inhalte (Weiterleitung zur Login-Seite).

### Passwort ändern
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er im Dashboard „Passwort ändern" öffnet, ein neues Passwort + Bestätigung eingibt und speichert, dann wird das Passwort aktualisiert und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen die beiden Passwortfelder stimmen nicht überein, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird nichts geändert.
- [ ] Angenommen das neue Passwort ist zu kurz (< 6 Zeichen), wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung.

## Edge Cases
- **Bereits eingeloggt + Login-Seite direkt aufgerufen** → automatische Weiterleitung zum Dashboard.
- **Sitzung läuft ab, während Nutzer aktiv ist** → beim nächsten geschützten Zugriff Weiterleitung zur Login-Seite.
- **Logout in einem Tab** → andere offene Tabs verlieren beim nächsten Zugriff ebenfalls den Zugang.
- **Mehrfaches schnelles Klicken auf „Login"** → keine Doppel-Anmeldung; Button wird während der Anfrage deaktiviert.
- **Passwort ändern auf neues Passwort = altes Passwort** → wird akzeptiert (kein Fehler, da unkritisch).

## Technical Requirements
- Security: Geschützte Seiten serverseitig absichern (nicht nur clientseitig ausblenden).
- Security: Generische Login-Fehlermeldung (keine Auskunft, ob die E-Mail existiert).
- UX: Login-Button während laufender Anfrage deaktiviert (Ladezustand).
- Assets: Firmenlogo wird benötigt (vom Nutzer bereitzustellen, Ablage unter `public/`).

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- _Keine offenen Fragen._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Dashboard als Hub mit Tool-Kacheln | Erweiterbar um weitere Kalender (Social Media, Offline-Events) später | 2026-06-23 |
| Kachel führt auf Platzhalter statt Kalender | Kalender ist PROJ-6; macht PROJ-2 eigenständig testbar | 2026-06-23 |
| Kein „Passwort vergessen" (nur Admin-Reset) | Passt zum admin-verwalteten Zugangsmodell; hält Login schlank | 2026-06-23 |
| Passwortänderung freiwillig, kein Zwang | Tool hat vorerst keine heiklen Daten; einfacher umzusetzen | 2026-06-23 |
| Passwort ändern ohne Eingabe des alten Passworts | Nutzer ist bereits authentifiziert; geringe Sensibilität, einfachere UX | 2026-06-23 |
| Login-Seite zeigt Firmenlogo | Branding ab dem ersten Bildschirm | 2026-06-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Route-Schutz serverseitig in der Middleware/Proxy | Erfüllt Sicherheitsanforderung (nicht nur clientseitig); nutzt PROJ-1-Session-Middleware weiter | 2026-06-23 |
| Login/Logout/Passwort ändern als Client-Aktionen über Supabase-Browser-Client | Entspricht Auth-Best-Practices (Redirect via `window.location.href`, Session-Prüfung vor Weiterleitung) | 2026-06-23 |
| Formulare mit react-hook-form + Zod | Bereits vorhanden; saubere Validierung (Pflichtfelder, Passwort-Match, Mindestlänge) | 2026-06-23 |
| shadcn/ui-Komponenten (Card, Input, Label, Button, Dialog, Form) | Bereits installiert; keine Eigenbauten | 2026-06-23 |
| Rückmeldungen via „sonner"-Toasts | Erfolgs-/Fehlermeldungen; bereits installiert | 2026-06-23 |
| Platzhalter-Route `/tools/multi-channel-marketing` | Erweiterbar für künftige Tools/Kalender; PROJ-6 ersetzt nur den Inhalt | 2026-06-23 |
| `middleware.ts` → `proxy.ts` umbenennen | Behebt BUG-2 aus PROJ-1-QA (Next.js-16-Konvention) | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-2 baut die erste sichtbare UI auf dem PROJ-1-Fundament auf: Login-Seite, geschütztes Dashboard (Hub), Platzhalter-Tool-Seite, Logout und freiwillige Passwortänderung. Kein neues Datenbankschema — nur Auth-Sitzung und der Anzeigename aus `profiles`.

### Seiten- & Komponenten-Struktur
```
/login  (öffentlich)
└── Login-Karte
    ├── Firmenlogo (agon's world)
    ├── E-Mail-Feld
    ├── Passwort-Feld
    ├── Fehlermeldung (falsche Daten / Verbindungsfehler)
    └── Login-Button (Ladezustand, während Anfrage deaktiviert)

/  (Dashboard — geschützt)
├── Kopfzeile: Firmenlogo + "Eingeloggt als [Anzeigename]"
├── Tool-Bereich: Kachel "Multi-Channel-Marketing" → /tools/multi-channel-marketing
└── Konto-Bereich: "Passwort ändern" (Dialog) + Logout-Button

/tools/multi-channel-marketing  (Platzhalter — geschützt)
└── "Jahreskalender — kommt in Kürze"  (wird in PROJ-6 ersetzt)

Route-Schutz (Middleware/Proxy aus PROJ-1):
├── nicht eingeloggt + geschützte Seite → /login
└── eingeloggt + /login → Dashboard
```

### Datenmodell
Keine neuen Tabellen. Genutzt wird:
- Anmeldung/Sitzung über Supabase Auth (`auth.users`)
- Anzeigename für die Begrüßung aus `profiles.display_name`
- Passwortänderung aktualisiert das Passwort des eingeloggten Nutzers in Supabase Auth

### Auth-Flüsse
- **Login:** Client-Formular → `signInWithPassword` → Session-Prüfung → Redirect zum Dashboard
- **Logout:** Client `signOut` → Redirect zur Login-Seite
- **Passwort ändern:** Dialog → `updateUser` (neues Passwort) → Erfolgs-Toast
- **Schutz:** Middleware/Proxy prüft Session serverseitig und leitet entsprechend um

### Benötigte Pakete
Keine neuen. Vorhanden: `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner` und die nötigen shadcn/ui-Komponenten.

### Assets
- Firmenlogo unter `public/agonsworld-logo-white-background.jpg` (vorhanden)
- Abgeleitetes Farbschema: dunkles Waldgrün + Salbeigrün als Akzentfarben

## Implementation Notes (Frontend)
**Stand:** 2026-06-23

**Theme:**
- `src/app/globals.css`: Primärfarbe auf Waldgrün (`158 38% 27%`), Sekundär/Akzent/Border auf Salbeigrün-Töne umgestellt (aus Logo abgeleitet). Light-Theme.
- `src/app/layout.tsx`: sonner-`Toaster` eingebunden, Metadaten + `lang="de"`.

**Seiten:**
- `src/app/login/page.tsx`: öffentliche Login-Seite (Logo + Karte). Server-seitige Weiterleitung zum Dashboard, falls bereits eingeloggt.
- `src/app/page.tsx`: Dashboard (Server Component) — liest Nutzer + `profiles.display_name`, zeigt Kopfzeile „Eingeloggt als [Anzeigename]", MCM-Kachel, Konto-Bereich. Defense-in-depth-Redirect bei fehlendem Nutzer.
- `src/app/tools/multi-channel-marketing/page.tsx`: geschützte Platzhalter-Seite („Jahreskalender — kommt in Kürze") mit Zurück-Link.

**Komponenten (Client):**
- `src/components/login-form.tsx`: react-hook-form + Zod; `signInWithPassword`; generische Fehlermeldung; Button mit Ladezustand; Redirect via `window.location.href`.
- `src/components/logout-button.tsx`: `signOut` + Redirect zur Login-Seite.
- `src/components/change-password-dialog.tsx`: Dialog mit neuem Passwort + Bestätigung (Zod: min. 6 Zeichen, Übereinstimmung); `updateUser`; Erfolgs-/Fehler-Toast.

**Route-Schutz (Next.js 16 „proxy"):**
- `src/proxy.ts` + `src/lib/supabase/proxy.ts`: Session-Refresh + serverseitige Weiterleitungen (nicht eingeloggt → `/login`; eingeloggt + `/login` → `/`).
- Alte `src/middleware.ts` / `src/lib/supabase/middleware.ts` entfernt → **behebt BUG-2 aus PROJ-1-QA** (keine Deprecation-Warnung mehr im Build).

**Verifikation:** `npm run build` erfolgreich (Exit 0). Alle shadcn-Komponenten waren vorhanden, keine neuen Pakete installiert.

**Kein separater `/backend`-Schritt nötig:** Authentifizierung, Profile und RLS stammen aus PROJ-1; Login/Logout/Passwortänderung laufen direkt über das Supabase-SDK, Route-Schutz über die Proxy. Es gibt keine eigenen API-Routen/Tabellen zu bauen.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
