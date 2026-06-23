# PROJ-1: Supabase-Infrastruktur (Fundament, Auth & Sicherheit)

## Status: Planned
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Keine (Fundament-Feature — alle anderen Features bauen darauf auf)

## User Stories
- Als **Admin** möchte ich Team-Accounts zentral anlegen können, damit nur ein ausgewählter Kreis Zugriff auf das Tool hat.
- Als **Team-Mitglied** möchte ich mich mit E-Mail und Passwort einloggen, damit ich auf den gemeinsamen Arbeitsbereich zugreifen kann.
- Als **Team-Mitglied** möchte ich, dass alle eingeloggten Kollegen dieselben Daten sehen, damit wir gemeinsam an einem zentralen Plan arbeiten.
- Als **Admin** möchte ich, dass bei jedem Datensatz gespeichert wird, wer ihn erstellt/geändert hat und wann, damit später nachvollziehbar ist, wer was gemacht hat.
- Als **Sicherheitsverantwortlicher** möchte ich, dass nicht-eingeloggte Personen keinerlei Zugriff auf Daten haben, damit die Planungsdaten geschützt sind.

## Out of Scope
- **Login-/Logout-Oberfläche** (Login-Formular, Passwort-Reset-UI, geschützte Seiten) → PROJ-2
- **Datentabellen einzelner Entitäten** (Marketplaces → PROJ-3, Marken → PROJ-4, Rabatt-Aktionen → PROJ-5) — werden mit ihrem jeweiligen Feature angelegt
- **Vollständiges Aktivitätsprotokoll** (eigene Log-Tabelle + Admin-Ansicht) → PROJ-9. PROJ-1 legt nur die Audit-Spalten (`created_by`, `updated_by`, Zeitstempel) als Grundlage.
- **Benutzerrollen / Rechteverwaltung** (alle gleichberechtigt im MVP)
- **Öffentliche Registrierung** (bewusst deaktiviert — nur Admin legt Accounts an)
- **Logo-/Datei-Uploads** (Supabase Storage) → PROJ-10

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen das Supabase-Projekt ist eingerichtet, wenn die App startet, dann verbindet sie sich erfolgreich über die Umgebungsvariablen (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) mit Supabase.
- [ ] Angenommen ein gültiger Account existiert, wenn sich ein Nutzer mit korrekter E-Mail und Passwort authentifiziert, dann wird eine gültige Sitzung erstellt.
- [ ] Angenommen die öffentliche Registrierung ist deaktiviert, wenn jemand versucht sich selbst zu registrieren, dann wird kein Account erstellt.
- [ ] Angenommen der Admin legt im Supabase-Dashboard einen Account an, wenn dazu ein Profil mit Anzeigename angelegt wird, dann ist dieser Account einsatzbereit und der Anzeigename abrufbar.
- [ ] Angenommen ein Nutzer ist **nicht** eingeloggt, wenn er versucht Daten zu lesen oder zu schreiben, dann verweigert die Datenbank (RLS) den Zugriff.
- [ ] Angenommen ein Nutzer **ist** eingeloggt, wenn er auf Daten des gemeinsamen Arbeitsbereichs zugreift, dann hat er volle Lese- und Schreibrechte.
- [ ] Angenommen ein Datensatz wird erstellt oder geändert, wenn die Operation gespeichert wird, dann werden `created_by`/`updated_by` (Nutzer) und die Zeitstempel automatisch gesetzt.
- [ ] Angenommen ein Nutzer-Account wird gelöscht, wenn auf das zugehörige Profil zugegriffen wird, dann ist auch das Profil entfernt (kein verwaister Datensatz).

## Edge Cases
- **Falsche Anmeldedaten:** Login mit falschem Passwort → keine Sitzung, generische Fehlermeldung (keine Auskunft ob E-Mail existiert).
- **Account ohne Profil:** Ein Account existiert in Auth, aber das Profil fehlt → der Anzeigename fällt auf die E-Mail zurück.
- **Abgelaufene Sitzung:** Token läuft ab, während der Nutzer arbeitet → der Nutzer wird zum erneuten Login geleitet (UI-Verhalten in PROJ-2 verfeinert).
- **Fehlende Umgebungsvariablen:** App startet ohne gesetzte Supabase-Variablen → klarer Konfigurationsfehler statt stillem Absturz.
- **Direkter API-Zugriff ohne Token:** Jemand ruft die Supabase-API ohne gültiges Token auf → RLS verweigert jeden Zugriff.

## Technical Requirements
- Security: Row Level Security auf **allen** Tabellen aktiviert; Default-Deny für nicht-authentifizierte Zugriffe.
- Security: Öffentliche Registrierung (Sign-up) in Supabase Auth deaktiviert.
- Auth-Methode: E-Mail + Passwort.

## Open Questions
- [ ] Soll für abgelaufene Sitzungen eine automatische Token-Erneuerung (Refresh) aktiv sein, oder ein direkter Logout? (Detailentscheidung in PROJ-2)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Invite-only, kein öffentliches Sign-up | Internes Tool für ausgewählten Kreis; Fremdregistrierung unerwünscht | 2026-06-23 |
| Gemeinsamer Arbeitsbereich (alle sehen/bearbeiten alles) | Zentrales Team-Planungstool; keine privaten Datensätze nötig | 2026-06-23 |
| Anzeigename in separater Profil-Tabelle | Lesbares „wer hat was gemacht" statt E-Mail; Grundlage für PROJ-9 | 2026-06-23 |
| Audit-Spalten (`created_by`/`updated_by` + Zeitstempel) von Anfang an | Ermöglicht Aktivitätsprotokoll (PROJ-9) ohne spätere Migration | 2026-06-23 |
| PROJ-1 nur Fundament, Entitäts-Tabellen pro Feature | Schlank, eigenständig testbar/deploybar; saubere Single Responsibility | 2026-06-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase Auth mit E-Mail/Passwort, öffentliches Sign-up deaktiviert | Erfüllt „nur Admin legt Accounts an" ohne eigenen Code | 2026-06-23 |
| Admin vergibt Erst-Passwort direkt (kein E-Mail-/Invite-Flow); Accounts werden bestätigt angelegt | Wunsch des Kunden; kein E-Mail-Versand nötig, einfachster Weg für kleinen Kreis | 2026-06-23 |
| Separate Profil-Tabelle (`profiles`) statt Namen im Auth-Account | Supabase trennt geschützte Login-Daten von App-Daten; Anzeigename gehört in eigene Tabelle | 2026-06-23 |
| Automatischer Trigger erstellt Profil bei neuem Account | Verhindert Accounts ohne Profil (kein verwaister Zustand) | 2026-06-23 |
| Audit-Spalten (`created_by`, `created_at`, `updated_by`, `updated_at`) als Standard für alle künftigen Tabellen | Ermöglicht Aktivitätsprotokoll (PROJ-9) ohne spätere Migration | 2026-06-23 |
| Schema-Änderungen über Supabase-Migrations (MCP) | Versioniert & nachvollziehbar, passt zum Git-Workflow | 2026-06-23 |
| Ein zentraler Supabase-Client + `@supabase/ssr` für Next.js | Sichere Sitzungsverwaltung über Server- & Client-Komponenten; eine wiederverwendbare Verbindung | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-1 ist ein Fundament-Feature: Es liefert die Supabase-Verbindung, die Auth-Konfiguration, eine Profil-Tabelle und das durchgängige Sicherheitsmodell (RLS). Sichtbare UI (Login-Seite) folgt in PROJ-2. Das Supabase-Projekt „Multi-Channel-Marketing" (Region eu-central-1, Postgres 17) existiert bereits und ist aktiv; das `public`-Schema ist noch leer.

### Komponenten-Struktur
```
App-Fundament
├── Supabase-Verbindung (zentraler Client für die ganze App)
├── Auth-Konfiguration (E-Mail/Passwort, Sign-up deaktiviert, Admin vergibt Passwort)
├── Profil-Tabelle (Anzeigename je Account)
├── Automatische Profil-Erstellung (Trigger bei neuem Account)
└── Sicherheits-Regelwerk (RLS-Konvention für alle künftigen Tabellen)
```

### Datenmodell (in einfacher Sprache)

**Profil** — ergänzt jeden Login-Account um menschenlesbare Infos:
- Verknüpfung zum Login-Account (1:1)
- Anzeigename (z.B. „Max Mustermann")
- Erstellt-Zeitstempel
- Wird automatisch gelöscht, wenn der zugehörige Account gelöscht wird

**Audit-Konvention** — Vorlage für ALLE späteren Tabellen (Marketplaces, Marken, Aktionen):
- erstellt von (welcher Nutzer) / erstellt am (Zeitstempel)
- zuletzt geändert von (welcher Nutzer) / zuletzt geändert am (Zeitstempel)

**Sicherheits-Regelwerk (RLS):**
- Nicht eingeloggt → gar kein Zugriff
- Eingeloggt → voller Lese-/Schreibzugriff auf den gemeinsamen Arbeitsbereich

### Auth-Konfiguration
- Methode: E-Mail + Passwort
- Öffentliches Sign-up: **deaktiviert**
- Erst-Passwort: Admin vergibt es direkt im Supabase-Dashboard; Accounts werden bestätigt angelegt (kein E-Mail-/Invite-Flow)

### Benötigte Pakete
- `@supabase/supabase-js` — bereits installiert (offizieller Supabase-Client)
- `@supabase/ssr` — sichere Sitzungsverwaltung in Next.js (Server- & Client-Komponenten)

### Umgebungsvariablen
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
