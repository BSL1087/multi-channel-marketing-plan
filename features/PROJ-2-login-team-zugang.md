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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
