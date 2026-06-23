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

## Implementation Notes (Backend)
**Stand:** 2026-06-23 — implementiert gegen Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Datenbank (über Supabase-Migrations):**
- Migration `create_profiles_table`: Tabelle `public.profiles` (`id` → `auth.users` mit `ON DELETE CASCADE`, `display_name`, `created_at`), RLS aktiviert.
  - RLS-Policies: alle Authentifizierten dürfen **alle** Profile lesen (für „wer hat was gemacht"); INSERT/UPDATE nur auf das **eigene** Profil (`auth.uid() = id`).
  - Trigger `on_auth_user_created` → Funktion `handle_new_user()` legt automatisch ein Profil an (Anzeigename aus `raw_user_meta_data.display_name`, Fallback E-Mail).
- Migration `restrict_handle_new_user_execute`: `EXECUTE` auf `handle_new_user()` von `public`/`anon`/`authenticated` entzogen (Funktion nur per Trigger nutzbar). Behebt 2 Security-Advisor-Warnungen.
- Security-Advisors nach Migration: **0 Befunde**.

**App-Anbindung:**
- `@supabase/ssr` installiert.
- `src/lib/supabase/client.ts` (Browser), `src/lib/supabase/server.ts` (Server/Route Handler), `src/lib/supabase/middleware.ts` + `src/middleware.ts` (Session-Refresh bei jedem Request).
- Alter Platzhalter `src/lib/supabase.ts` entfernt.
- `.env.local` mit Projekt-URL und Publishable Key angelegt (gitignored).
- `npx tsc --noEmit`: fehlerfrei.

**Abweichung von der Spec:** Profil-Schreibzugriff auf das eigene Profil beschränkt (statt „Vollzugriff für alle"), da das Bearbeiten fremder Anzeigenamen nicht sinnvoll ist. Lesen bleibt für alle Authentifizierten offen. Künftige Arbeitsbereich-Tabellen (Marketplaces/Marken/Aktionen) erhalten weiterhin vollen Schreibzugriff für alle Authentifizierten.

**⚠️ Manueller Schritt (nicht per API/MCP möglich):** Öffentliches Sign-up im Supabase-Dashboard deaktivieren — **Authentication → Sign In / Providers → Email → „Allow new users to sign up" deaktivieren**. Erst danach ist garantiert, dass nur der Admin Accounts anlegen kann (AC: „öffentliche Registrierung deaktiviert").

**Hinweis zu Tests:** PROJ-1 enthält keine API-Routen (Login-UI/-Flows folgen in PROJ-2), daher keine Route-Integrationstests. Verifikation erfolgt im `/qa`-Schritt gegen die Akzeptanzkriterien.

## QA Test Results

**Tested:** 2026-06-23
**Tester:** QA Engineer (AI)
**Scope:** Infrastruktur-Feature ohne UI — geprüft wurden Konfiguration, App-Integrität (Build) und Sicherheitsverhalten live gegen die Supabase-API (Projekt `grtqmrnjjsucskdeghrr`). UI-/Session-abhängige Kriterien sind zu PROJ-2 (Login-Oberfläche) verschoben.

### Acceptance Criteria Status

#### AC-1: Verbindung über Umgebungsvariablen
- [x] `npm run build` lädt `.env.local` und kompiliert erfolgreich; Middleware verbindet sich mit Supabase

#### AC-2: Login erzeugt gültige Sitzung
- [~] Admin-Account `benedikt@agonsworld.com` existiert und ist bestätigt (login-fähig). Vollständiger Login-Flow benötigt UI → Test in PROJ-2

#### AC-3: Öffentliche Registrierung deaktiviert
- [x] POST `/auth/v1/signup` → HTTP 422, kein Nutzer angelegt (nach Fix, siehe BUG-1)

#### AC-4: Admin-Account + Profil mit Anzeigename
- [x] Account angelegt, Profil per Trigger automatisch erstellt, Anzeigename „Benedikt" gesetzt und abrufbar

#### AC-5: Nicht eingeloggt → kein Datenzugriff (RLS)
- [x] anon SELECT auf `profiles` → leeres Ergebnis (trotz vorhandenem Profil)
- [x] anon INSERT auf `profiles` → HTTP 401, „new row violates row-level security policy"

#### AC-6: Eingeloggt → Vollzugriff auf gemeinsamen Arbeitsbereich
- [~] RLS-Policies für `authenticated` sind definiert; Laufzeit-Test mit echter Session → PROJ-2

#### AC-7: Audit-Spalten werden automatisch gesetzt
- [n/a] Noch keine Arbeitsbereich-Tabellen vorhanden (Audit-Spalten sind Konvention für PROJ-3/4/5) → dort zu testen

#### AC-8: Account gelöscht → Profil entfernt (Cascade)
- [x] FK-Löschverhalten = CASCADE bestätigt; Test-Nutzer gelöscht → zugehöriges Profil ebenfalls entfernt, 0 Waisen-Profile

### Edge Cases Status

#### EC-1: Account ohne Profil → Fallback auf E-Mail
- [x] Bei Account-Anlage ohne Metadaten setzte der Trigger die E-Mail als Anzeigenamen (vor manueller Änderung auf „Benedikt")

#### EC-2: Direkter API-Zugriff ohne Token → RLS verweigert
- [x] Bestätigt über anon SELECT/INSERT (AC-5)

#### EC-3: Falsche Anmeldedaten / Abgelaufene Sitzung
- [~] Login-UI-Verhalten → Test in PROJ-2

#### EC-4: Fehlende Umgebungsvariablen → klarer Konfigurationsfehler
- [ ] Nicht getestet (würde laufende Umgebung beschädigen) — als Hinweis für PROJ-2 vermerkt

### Security Audit Results
- [x] Authentifizierung: kein Datenzugriff ohne Login (anon default-deny)
- [x] Autorisierung: anon kann weder lesen noch schreiben
- [x] Trigger-Funktion `handle_new_user()` gehärtet (EXECUTE entzogen) → Security-Advisors: **0 Befunde**
- [x] Secrets: nur Publishable Key in `.env.local` (öffentlich unbedenklich); `.env.local` und `.mcp.json` gitignored; keine Service-Keys im Repo
- [x] Öffentliches Sign-up nach Fix gesperrt (BUG-1)

### Bugs Found

#### BUG-1: Öffentliches Sign-up war aktiv (während QA behoben)
- **Severity:** Critical
- **Steps to Reproduce:**
  1. POST `/auth/v1/signup` mit beliebiger gültiger E-Mail + Passwort
  2. Erwartet: Ablehnung (kein Account)
  3. Tatsächlich (vorher): HTTP 200, Account wurde angelegt → jeder hätte sich registrieren können
- **Status:** ✅ BEHOBEN — Sign-up im Dashboard deaktiviert, Re-Test ergibt HTTP 422 ohne Account. Test-Nutzer wurden bereinigt.
- **Priority:** Fix before deployment (erledigt)

#### BUG-2: `middleware.ts` nutzt veraltete Next.js-16-Konvention
- **Severity:** Low
- **Detail:** Build-Warnung „The 'middleware' file convention is deprecated. Please use 'proxy' instead." Funktioniert aktuell (Route „Proxy (Middleware)" aktiv), sollte aber zu `src/proxy.ts` umbenannt werden.
- **Priority:** Fix in next sprint

#### BUG-3: `npm run lint` schlägt fehl
- **Severity:** Low
- **Detail:** `next lint` wurde in Next.js 16 entfernt; das `lint`-Script im Template ist dadurch defekt. Bestehendes Template-Problem, nicht durch PROJ-1 verursacht. TypeScript-Check (`tsc --noEmit`) und Build laufen fehlerfrei. Empfehlung: ESLint-CLI-Migration.
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 5/8 voll bestanden, 2 verschoben auf PROJ-2 (UI/Session nötig), 1 n/a (noch keine Tabellen)
- **Bugs Found:** 3 total (1 Critical [behoben], 0 High, 0 Medium, 2 Low)
- **Security:** Pass (nach Behebung von BUG-1; 0 Advisor-Befunde)
- **Production Ready:** YES (keine offenen Critical/High-Bugs)
- **Recommendation:** PROJ-1 freigeben. BUG-2/BUG-3 als Low in PROJ-2 mit erledigen. Session-/Login-Kriterien (AC-2, AC-6, EC-1/3) verbindlich in PROJ-2 testen.

## Deployment
_To be added by /deploy_
