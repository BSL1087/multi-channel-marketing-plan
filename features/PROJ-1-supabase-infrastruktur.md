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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
