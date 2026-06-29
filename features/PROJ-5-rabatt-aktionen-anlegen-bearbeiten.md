# PROJ-5: Rabatt-Aktionen anlegen & bearbeiten

## Status: Approved
**Created:** 2026-06-26
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — DB, RLS, Audit-Spalten.
- Requires: PROJ-2 (Login / Team-Zugang) — eingeloggter Zugang, serverseitig geschützte Seite.
- Requires: PROJ-3 (Marketplaces & Webshops) — Kanal-Auswahl je Aktion.
- Requires: PROJ-4 (Marken verwalten) — Marken-Auswahl je Aktion (mit Farbe für die Liste).

## User Stories
- Als **Team-Mitglied** möchte ich eine Rabatt-Aktion anlegen (Titel, Kanal, Marke, Zeitraum, Rabattwert, optional Kommentar), damit geplante Aktionen zentral erfasst sind.
- Als **Team-Mitglied** möchte ich alle Aktionen in einer Liste sehen (chronologisch nach Startdatum), damit ich den Überblick behalte, bevor der Kalender (PROJ-6) kommt.
- Als **Team-Mitglied** möchte ich eine Aktion bearbeiten, damit ich Zeitraum, Rabattwert oder Zuordnung korrigieren kann.
- Als **Team-Mitglied** möchte ich eine Aktion löschen (mit Bestätigung), damit veraltete Einträge verschwinden.
- Als **Team-Mitglied** möchte ich beim Löschen einer Marke/eines Kanals gewarnt werden, wenn daran Aktionen hängen, damit ich weiß, dass diese mitgelöscht werden.

## Out of Scope
- **Kalender-/Timeline-Darstellung** der Aktionen → PROJ-6.
- **Kannibalisierungs-Warnung** bei zeitlicher Überschneidung derselben Marke → PROJ-7.
- **Aktion direkt im Kalender anlegen** (Klick/Drag) → PROJ-6.
- **Filter/Suche** in der Aktionsliste (nach Kanal/Marke/Jahr) — zurückgestellt (siehe Open Questions).
- **Wiederkehrende Aktionen / Serien** — nicht im MVP.
- **Strukturierter Rabattwert** (Prozent vs. Betrag als eigene Felder) — bewusst Freitext.
- **Produkt-Auswahl als eigene Entität** — produktspezifische Hinweise nur als Freitext-Kommentar (PRD-Entscheidung).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeigen & Leerzustand
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Aktions-Verwaltung öffnet, dann sieht er eine chronologisch (nach Startdatum) sortierte Liste aller Aktionen (je Zeile: Titel, Marke mit Farb-Swatch, Kanal, Zeitraum, Rabattwert) und einen „Aktion hinzufügen"-Button.
- [ ] Angenommen es ist noch keine Aktion angelegt, wenn der Nutzer die Verwaltung öffnet, dann sieht er einen Leerzustand-Hinweis und einen „Aktion hinzufügen"-Button.
- [ ] Angenommen es existiert noch keine Marke **oder** kein Kanal, wenn der Nutzer eine Aktion anlegen will, dann sieht er einen Hinweis (mit Link zur Marken- bzw. Kanal-Verwaltung) und das Anlegen ist nicht möglich.
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er die Aktions-Verwaltung aufruft, dann wird er zur Login-Seite weitergeleitet.

### Anlegen / Bearbeiten
- [ ] Angenommen Marken und Kanäle existieren, wenn der Nutzer „Aktion hinzufügen" wählt, alle Pflichtfelder (Titel, Kanal, Marke, Start, Ende, Rabattwert) gültig ausfüllt und speichert, dann erscheint die Aktion in der Liste und es wird eine Erfolgsmeldung angezeigt.
- [ ] Angenommen ein Pflichtfeld fehlt, wenn der Nutzer speichert, dann wird je fehlendem Feld eine Validierungsmeldung angezeigt und nichts gespeichert.
- [ ] Angenommen das Enddatum liegt vor dem Startdatum, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und nichts wird gespeichert.
- [ ] Angenommen Start = Ende, wenn der Nutzer speichert, dann wird die eintägige Aktion akzeptiert.
- [ ] Angenommen eine Aktion existiert, wenn der Nutzer sie bearbeitet (beliebige Felder ändert) und gültig speichert, dann werden die Änderungen übernommen und eine Erfolgsmeldung angezeigt.

### Löschen (inkl. Auswirkung auf Marke/Kanal)
- [ ] Angenommen eine Aktion existiert, wenn der Nutzer „Löschen" wählt, dann erscheint ein Bestätigungsdialog (mit Titel), bevor die Aktion entfernt wird.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer abbricht, dann bleibt die Aktion unverändert bestehen.
- [ ] Angenommen eine Marke/ein Kanal hat zugeordnete Aktionen, wenn der Nutzer die Marke/den Kanal löschen will, dann erscheint eine Warnung mit der **Anzahl** der betroffenen Aktionen und dem Hinweis, dass diese mitgelöscht werden; erst nach Bestätigung werden Marke/Kanal **und** ihre Aktionen entfernt.

### Speichern & Audit
- [ ] Angenommen eine Aktion wird angelegt oder geändert, wenn gespeichert wird, dann werden die Audit-Spalten (`created_by`/`created_at` bzw. `updated_by`/`updated_at`) automatisch serverseitig gesetzt.
- [ ] Angenommen das Speichern schlägt fehl (z.B. Verbindungsfehler), wenn der Nutzer speichert, dann erscheint eine Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Leere / nur-Leerzeichen-Pflichtfelder** → Validierung, nichts gespeichert (Titel/Rabattwert werden getrimmt).
- **Enddatum vor Startdatum** → Validierungsmeldung (zusätzlich DB-Check-Constraint).
- **Eintägige Aktion (Start = Ende)** → erlaubt.
- **Jahresübergreifender Zeitraum (28.12.–03.01.)** → erlaubt; Darstellung übernimmt PROJ-6.
- **Marke/Kanal wird gelöscht, während Aktionen darauf verweisen** → Warnung mit Anzahl, Mitlöschen erst nach Bestätigung (DB: ON DELETE CASCADE).
- **Aktion wird gelöscht, während ein anderer Nutzer sie bearbeitet** → beim Speichern Hinweis „existiert nicht mehr", Liste wird aktualisiert.
- **Gleichzeitiges Bearbeiten derselben Aktion** → Last-Write-Wins (kein Sperrmechanismus im MVP).
- **Mehrere überlappende Aktionen derselben Marke** → in PROJ-5 erlaubt; die Warnung dazu kommt in PROJ-7.
- **Netzwerk-/Serverfehler beim Speichern/Löschen** → Fehlermeldung, ursprünglicher Zustand bleibt erhalten.

## Technical Requirements
- Security: Zugriff nur für eingeloggte Nutzer; RLS nach PROJ-1-Konvention (anon → kein Zugriff; authenticated → Lesen/Schreiben/Löschen); Seite serverseitig absichern.
- Daten: Audit-Spalten (`created_by`, `created_at`, `updated_by`, `updated_at`) serverseitig per Trigger.
- Daten: `end_date >= start_date` als DB-Check-Constraint (zusätzlich zur Formular-Validierung).
- Daten: Fremdschlüssel zu Marke und Kanal mit **ON DELETE CASCADE** (Mitlöschen). Die App zeigt vor dem Löschen einer Marke/eines Kanals die Anzahl betroffener Aktionen als Warnung.
- UI: shadcn/ui-Komponenten wiederverwenden (Card, Table, Input, Label, Button, Dialog, AlertDialog, Form, Select); Datumsauswahl über geeignete Komponente — Architektur-Entscheidung in `/architecture`.

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] **Filter/Suche in der Aktionsliste** (nach Kanal/Marke/Jahr) — bei vielen Aktionen voraussichtlich nützlich, aber nicht MVP-kritisch. Eigenes Folge-Feature?
- [ ] **Konsistenz Lösch-Verhalten:** Produktgruppen-Löschen ist hart blockiert (PROJ-11), Marken/Kanäle werden künftig „warnen + cascade" (PROJ-5). Später vereinheitlichen?
- [ ] **Maximale Feldlängen** (Titel, Rabattwert, Kommentar) final in `/architecture` festlegen (Vorschlag: Titel ≤ 80, Rabattwert ≤ 50, Kommentar ≤ 500).

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Verwaltungsseite (Liste + Formular) statt nur Kalender | PROJ-6 existiert noch nicht; macht PROJ-5 eigenständig nutzbar/testbar | 2026-06-26 |
| Pflicht: Titel, Kanal, Marke, Start, Ende, Rabattwert; Kommentar optional | Titel als lesbares Label; Kanal/Marke/Zeitraum sind der Kern; Rabattwert essenziell | 2026-06-26 |
| Rabattwert als Freitext | Mal Prozent, mal Betrag — flexibel (PRD-Entscheidung) | 2026-06-26 |
| Enddatum ≥ Startdatum; eintägig & jahresübergreifend erlaubt | Reale Planungsfälle; Validierung schützt vor Tippfehlern | 2026-06-26 |
| Löschen von Marke/Kanal mit Aktionen: Warnung + Bestätigung → Mitlöschen (Cascade) | „Warnen statt blockieren"-Philosophie; konkrete Anzahl-Warnung schützt vor Versehen | 2026-06-26 |
| Lösch-Dialoge von PROJ-3/PROJ-4 um Anzahl-Warnung ergänzen | Nutzer sieht beim Löschen von Kanal/Marke die Folgen für Aktionen | 2026-06-26 |
| Keine Eindeutigkeit/Überschneidungssperre für Aktionen | Überschneidungen sind erlaubt; davor warnt PROJ-7 | 2026-06-26 |
| Chronologische Sortierung (Startdatum), keine manuelle Reihenfolge | Einfach und vorhersehbar; Filter/Sortierung später | 2026-06-26 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene `discount_actions`-Tabelle, Muster wie bisher | Konsistenz; Grundlage für Kalender (PROJ-6) und Warnung (PROJ-7) | 2026-06-26 |
| Server Component + Server-Aktionen (kein `/api`) | Läuft mit Nutzer-Sitzung (RLS greift); konsistent | 2026-06-26 |
| Natives `<input type="date">` für Start/Ende | Kein neues Paket (kein react-day-picker); gültige Werte, Browser-Lokalisierung | 2026-06-26 |
| FK zu Marke und Kanal mit **ON DELETE CASCADE** | Setzt „Mitlöschen nach Warnung" um; keine verwaisten Aktionen | 2026-06-26 |
| `end_date >= start_date` als DB-Check-Constraint | Schutz auch bei direktem DB-Zugriff | 2026-06-26 |
| Feldlängen: Titel ≤ 80, Rabattwert ≤ 50, Kommentar ≤ 500 (DB-Checks) | Verhindert Layout-Probleme im Kalender; klare Grenzen | 2026-06-26 |
| Keine Eindeutigkeits-/Überschneidungssperre | Überschneidungen erlaubt; davor warnt PROJ-7 | 2026-06-26 |
| Anzahl-Warnung in PROJ-3/PROJ-4-Lösch-Dialogen (Vorzählung der Aktionen) | App zählt betroffene Aktionen vor dem Cascade-Löschen | 2026-06-26 |
| Geteiltes `action-validation.ts` (Zod: Felder + Datumsregel) | Server-Aktion und Formular nutzen dieselben Regeln | 2026-06-26 |
| Audit-Trigger + RLS wie PROJ-1/3/4/11 | Konsistente Sicherheits-/Audit-Konvention | 2026-06-26 |
| Keine neuen Pakete | Alles (inkl. Select) bereits installiert; Datum nativ | 2026-06-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-26

### Überblick
PROJ-5 folgt dem etablierten Bauplan (eigene Tabelle + geschützte Verwaltungsseite mit Anlegen/Bearbeiten/Löschen über Server-Aktionen). Neu: zwei Auswahl-Felder (Kanal, Marke per Select), zwei Datumsfelder (nativ) mit Regel „Ende ≥ Start", und eine **Cascade-Beziehung** zu Marke/Kanal. Querschnittlich werden die Lösch-Dialoge von PROJ-3/PROJ-4 um eine **Anzahl-Warnung** ergänzt. Keine neuen Pakete.

### Seiten- & Komponenten-Struktur
```
/tools/multi-channel-marketing/aktionen   (geschützte Seite)
└── Seite "Rabatt-Aktionen verwalten"
    ├── Kopfzeile: Titel + Zurück-Link
    ├── "Aktion hinzufügen"-Button
    ├── Aktions-Liste (Table, sortiert nach Startdatum)
    │   └── Titel · Marke (Swatch+Name) · Kanal · Zeitraum · Rabattwert · Bearbeiten · Löschen
    ├── Leerzustand A: keine Aktion
    ├── Leerzustand B: keine Marke ODER kein Kanal → Hinweis + Links (Anlegen gesperrt)
    ├── Dialog "Aktion anlegen / bearbeiten":
    │   Titel · Kanal (Select) · Marke (Select) · Start (date) · Ende (date) · Rabattwert · Kommentar
    └── Bestätigungsdialog "Aktion löschen?"

Querschnitt:
├── PROJ-3 delete-channel-dialog: zeigt „X Aktionen werden mitgelöscht"
└── PROJ-4 delete-brand-dialog: zeigt „X Aktionen werden mitgelöscht"

Dashboard (/): fünfte Kachel „Rabatt-Aktionen".
```

Bausteine (analog bisher): `action-manager` (Liste + Dialoge), `action-form-dialog` (Anlegen & Bearbeiten), `delete-action-dialog`, `action-validation.ts`. Zusätzlich Zähl-Server-Aktionen für die Lösch-Warnungen bei Marke/Kanal.

### Datenmodell (in einfacher Sprache)
**Rabatt-Aktion (`discount_actions`):**
- Eindeutige ID
- Titel (Pflicht, ≤ 80) · Rabattwert (Pflicht, Freitext ≤ 50) · Kommentar (optional, ≤ 500)
- Kanal (Pflicht, Verweis auf Marketplace) · Marke (Pflicht, Verweis auf Marke)
- Startdatum / Enddatum (Pflicht, Ende ≥ Start)
- erstellt von/am · zuletzt geändert von/am

Gespeichert in: **Supabase**, eigene Tabelle, RLS wie PROJ-1. Kanal- und Marken-Verweis mit **ON DELETE CASCADE**. Keine Eindeutigkeits-/Überschneidungssperre.

### Abläufe (was passiert wann)
- **Liste:** serverseitig laden (mit Marken-/Kanalnamen + Markenfarbe), nach Startdatum sortiert. Keine Marke/kein Kanal → Leerzustand B; sonst keine Aktion → Leerzustand A.
- **Anlegen/Bearbeiten:** Dialog → Validierung (Pflichtfelder, Längen, Ende ≥ Start) → Speichern → Liste aktualisiert, Toast.
- **Löschen Aktion:** Bestätigung → entfernt.
- **Löschen Marke/Kanal:** App zählt zugeordnete Aktionen → Warnung mit Anzahl → nach Bestätigung Cascade-Löschen.

### Benötigte Pakete
Keine neuen. Wiederverwendet: `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, shadcn/ui (Card, Table, Dialog, AlertDialog, Form, Input, Label, Button, Select). Datum = natives Browser-Element.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Keine Kalender-/Timeline-Darstellung (PROJ-6), keine Überschneidungs-Warnung (PROJ-7).
- Kein Anlegen direkt im Kalender, keine Filter/Suche, keine Serien-Aktionen.

## Implementation Notes (Frontend)
**Stand:** 2026-06-26

**Seite (Server Component):**
- `src/app/tools/multi-channel-marketing/aktionen/page.tsx`: geschützt (Auth-Check + Redirect). Lädt Aktionen (mit Join `marketplaces(name)` + `brands(name,color)`, sortiert nach `start_date`), Marken- und Kanalliste parallel; mappt Joins auf `marketplace_name`/`brand_name`/`brand_color`; übergibt an `ActionManager`.

**Server-Aktionen:** `src/app/tools/multi-channel-marketing/aktionen/actions.ts`
- `createAction`, `updateAction`, `deleteAction` (Zod-Validierung via `actionSchema`, Auth-Check, `revalidatePath`; `updateAction` erkennt zwischenzeitlich gelöschte Aktionen).
- `countActionsForBrand` / `countActionsForChannel`: zählen referenzierende Aktionen für die Lösch-Warnung; **graceful** (jeder Fehler inkl. fehlender Tabelle 42P01 → 0), solange `discount_actions` noch nicht existiert.

**Client-Komponenten (shadcn/ui, keine Eigenbauten):**
- `src/components/action-manager.tsx`: Liste (`Table`: Titel · Marke mit Farb-Swatch · Kanal · Zeitraum · Rabatt), Datumsformat `DD.MM.YYYY` (eintägig = ein Datum); Leerzustand A (keine Aktion) und **Leerzustand B (keine Marke ODER kein Kanal → Anlegen gesperrt, Links zu Kanal/Marke)**.
- `src/components/action-form-dialog.tsx`: Anlegen & Bearbeiten (ein Dialog). Titel, Kanal-`Select`, Marken-`Select`, **native `<input type="date">`** für Start/Ende, Rabattwert, Kommentar (`Textarea`). react-hook-form + Zod inkl. Cross-Field-Regel Ende ≥ Start.
- `src/components/delete-action-dialog.tsx`: `AlertDialog`-Bestätigung mit Titel.

**Querschnitt (Anzahl-Warnung):**
- `src/components/delete-brand-dialog.tsx` und `src/components/delete-channel-dialog.tsx`: holen beim Öffnen die Anzahl betroffener Aktionen und zeigen eine Warnung („… hat X Rabatt-Aktionen, werden mitgelöscht …"). Bis `discount_actions` existiert, ist die Anzahl 0 (kein Hinweis).

**Geteilte Validierung:** `src/lib/action-validation.ts` (`actionSchema`: Titel ≤ 80, Rabattwert ≤ 50, Kommentar ≤ 500, UUID für Kanal/Marke, ISO-Datum, Ende ≥ Start).

**Dashboard-Einstieg:** `src/app/page.tsx`: fünfte Kachel „Rabatt-Aktionen" (Icon `BadgePercent`).

**Verifikation:** `tsc --noEmit` fehlerfrei; `next build` erfolgreich (Route `/tools/multi-channel-marketing/aktionen`).

**⚠️ Offen für `/backend`:** Tabelle `public.discount_actions` existiert noch nicht — Seite gebaut, zur Laufzeit erst nach Migration funktionsfähig. `/backend` muss anlegen:
- `discount_actions`: `id`, `title`, `marketplace_id` (uuid), `brand_id` (uuid), `start_date` (date), `end_date` (date), `discount_value` (text), `comment` (text, nullable), Audit-Spalten.
- **Fremdschlüssel** `marketplace_id` → `marketplaces(id)` **ON DELETE CASCADE** und `brand_id` → `brands(id)` **ON DELETE CASCADE** (Mitlöschen).
- **Check-Constraints:** `length(trim(title)) between 1 and 80`; `length(trim(discount_value)) between 1 and 50`; `comment` ≤ 500; `end_date >= start_date`.
- Indizes auf `marketplace_id`, `brand_id`, `start_date`.
- **Audit-Trigger** (wie `set_product_groups_audit`), RLS nach PROJ-1-Konvention (anon kein Zugriff; authenticated voll).
- Optional: Unit-Tests für `action-validation.ts`.

## Implementation Notes (Backend)
**Stand:** 2026-06-26 — Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Datenbank (Migration `create_discount_actions_table`):** Tabelle `public.discount_actions`, Muster wie bisher.
- Spalten: `id` (uuid PK), `title`, `marketplace_id` (uuid NOT NULL), `brand_id` (uuid NOT NULL), `start_date`/`end_date` (date), `discount_value` (text), `comment` (text, nullable), Audit-Spalten.
- **Fremdschlüssel** `marketplace_id` → `marketplaces(id)` **ON DELETE CASCADE** und `brand_id` → `brands(id)` **ON DELETE CASCADE** → Marke/Kanal löschen entfernt deren Aktionen mit.
- `created_by`/`updated_by` → `auth.users(id)` `ON DELETE SET NULL`.
- Check-Constraints: Titel 1–80, Rabattwert 1–50, Kommentar ≤ 500, `end_date >= start_date`.
- Indizes auf `marketplace_id`, `brand_id`, `start_date`.
- **Audit-Trigger** `discount_actions_set_audit` (BEFORE INSERT/UPDATE); `EXECUTE` entzogen (nur per Trigger).
- **RLS** aktiviert; 4 Policies für `authenticated`; `anon` → Default-Deny.

**Funktionsprüfung (SQL, 7/7 bestanden):** gültiger Insert ✓; eintägig (Start=Ende) ✓; Ende<Start → `check_violation` ✓; Titel>80 → `check` ✓; Rabattwert>50 → `check` ✓; **Marke löschen → Aktionen weg (Cascade, remaining=0)** ✓; **Kanal löschen → Aktionen weg (Cascade, remaining=0)** ✓. Testdaten entfernt (`discount_actions` = 0; die 2 vorhandenen Marken sind echte Nutzer-Einträge, unangetastet).

**Security-Advisors:** keine `discount_actions`-Befunde. Projektweit verbleibt nur `auth_leaked_password_protection` (manueller Auth-Schalter).

**Tests:** `src/lib/action-validation.test.ts` (Vitest): 9 Tests (Feld-Schemata + `actionSchema` inkl. Ende≥Start, eintägig, UUID/Datums-Validierung). **Gesamtsuite 42/42 grün** mit `npx vitest run --pool=threads`. Keine `/api`-Routen (Server Actions + RLS), daher keine Route-Integrationstests.

**Hinweis:** Migration direkt über den Supabase-MCP angewandt (die `/backend`-Slash-Skill ist im Root-Workspace nicht verfügbar; Vorgehen folgt dem dokumentierten Backend-Vertrag).

## QA Test Results

**Tested:** 2026-06-26
**Tester:** QA Engineer (AI) + manuelle Bestätigung durch Nutzer
**Methoden:** Unit-Tests (Vitest), Build/TypeScript, HTTP-Route-Schutz, funktionale DB-Verifikation (Backend), Code-Review, manueller Browser-Smoke-Test. E2E-Spec geschrieben, lokal nicht ausführbar (Umgebung).

### Acceptance Criteria Status
- [x] Liste chronologisch (Titel, Marke+Swatch, Kanal, Zeitraum, Rabatt) + „Aktion hinzufügen" (Smoke-Test)
- [x] Leerzustand „keine Aktion" (Code-Review)
- [x] Leerzustand „keine Marke ODER kein Kanal" → Anlegen gesperrt + Links (Code-Review)
- [x] Nicht eingeloggt → /login (HTTP 307)
- [x] Anlegen mit Pflichtfeldern → erscheint + Erfolgsmeldung (Smoke-Test)
- [x] Fehlende Pflichtfelder → Validierung (Unit-Test + Zod)
- [x] Ende vor Start → Validierung (Smoke-Test + Unit-Test + DB-Check)
- [x] Eintägig (Start=Ende) → akzeptiert (Unit-Test + DB-Check)
- [x] Bearbeiten → übernommen (Smoke-Test)
- [x] Aktion löschen → Bestätigungsdialog → entfernt (Smoke-Test)
- [x] Marke/Kanal mit Aktionen löschen → Warnung mit Anzahl → Mitlöschen nach Bestätigung (Smoke-Test + DB-Cascade verifiziert)
- [x] Audit-Spalten serverseitig (Backend-Trigger verifiziert)
- [x] Speicherfehler → Fehlermeldung, Eingabe bleibt (Code-Review)

### Security Audit Results
- [x] Route-Schutz serverseitig: `/aktionen` → HTTP 307 → /login
- [x] RLS nach PROJ-1-Konvention (anon Default-Deny, authenticated voll); 0 feature-spezifische Advisor-Befunde
- [x] DB-Check-Constraints (Titel/Wert/Kommentar-Länge, Ende≥Start)
- [x] FK ON DELETE CASCADE auf Marke und Kanal per SQL bestätigt (beide Pfade)
- [x] Audit-Trigger-Funktion gehärtet (EXECUTE entzogen)

### Automatisierte Tests
- **Unit (Vitest):** 42/42 grün mit `npx vitest run --pool=threads` (davon 9 für `action-validation`).
- **Funktionale DB-Checks:** 7/7 bestanden (siehe Backend-Notizen).
- **E2E (Playwright):** `tests/PROJ-5-rabatt-aktionen.spec.ts` (Route-Schutz) geschrieben; lokal nicht ausführbar (Umgebung), für CI vorgesehen.

### Bugs Found
- **Keine.** (0 Critical, 0 High, 0 Medium, 0 Low)
- **Offen (projektweit, nicht PROJ-5):** Advisor `auth_leaked_password_protection` (manueller Auth-Schalter) — Low, nicht blockierend.

### Summary
- **Acceptance Criteria:** alle verifiziert (Unit-Tests + DB-Checks + Code-Review + manueller Smoke-Test)
- **Bugs:** 0
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** PROJ-5 freigeben. Kannibalisierungs-Warnung (vom Nutzer gewünscht) ist als **PROJ-7** eingeplant. E2E-Suite bei Gelegenheit in CI ausführen.

## Update: Mehrere Marken je Aktion (Mehrfachauswahl)
**Stand:** 2026-06-28 — Nutzer-Wunsch: Eine Aktion betrifft oft mehrere Marken; statt sie je Marke einzeln anzulegen, gibt es jetzt eine Mehrfachauswahl (Checkboxen).

### Was sich geändert hat
- **Datenmodell:** Aus der 1:1-Beziehung (`discount_actions.brand_id`) wurde eine **n:m-Beziehung** über die neue Zwischentabelle **`discount_action_brands`** (`action_id`, `brand_id`, beide FK **ON DELETE CASCADE**, zusammengesetzter PK). Die alte Spalte `brand_id` wurde entfernt; die 6 bestehenden Aktionen wurden verlustfrei migriert (je 1 Marke → 1 Junction-Zeile).
- **Integritäts-Regel:** Eine Aktion muss **immer ≥ 1 Marke** haben. DB-Trigger `discount_action_brands_cleanup` löscht eine Aktion automatisch, sobald ihre **letzte** Marken-Zuordnung entfernt wird. Hat sie noch andere Marken, bleibt sie bestehen.
- **Formular (`action-form-dialog.tsx`):** Marken-`Select` → **Checkbox-Mehrfachauswahl** (scrollbare Liste, „mindestens eine Marke"-Validierung). Beim Bearbeiten sind die zugeordneten Marken vorausgewählt.
- **Liste (`action-manager.tsx`):** Spalte „Marke" → „Marken"; zeigt alle Marken der Aktion mit Farb-Swatch.
- **Kalender (`calendar-view.tsx`):** Eine Aktion wird als **ein Balken je Marke** dargestellt (jede Marke behält ihre Farbspur) — Voraussetzung für die per-Marke-Überschneidungslogik (PROJ-7). Tooltip listet alle Marken.
- **Marke löschen (`delete-brand-dialog.tsx`):** Warnung unterscheidet jetzt zwischen Aktionen, die **nur** diese Marke haben (werden mitgelöscht) und Aktionen, die **mit ihren anderen Marken erhalten** bleiben. Neue Server-Funktion `getBrandDeletionImpact` (ersetzt `countActionsForBrand`).
- **Validierung (`action-validation.ts`):** `brandId` (UUID) → `brandIds` (`string[]`, min 1).
- **Server-Aktionen (`actions.ts`):** `createAction`/`updateAction` schreiben/synchronisieren die Junction-Zeilen. `updateAction` nutzt **Upsert-dann-Prune** (neue Zuordnungen zuerst, dann entfernte löschen), damit die Aktion nie kurzzeitig 0 Marken hat und der Cleanup-Trigger sie nicht beim Bearbeiten löscht.

### Verifikation
- `tsc --noEmit` fehlerfrei; `next build` erfolgreich.
- Unit-Tests **44/44** grün (inkl. 2 neue für Mehrfach-Marken in `action-validation.test.ts`).
- DB-Trigger per SQL (Transaktion + Rollback) bestätigt: Aktion mit 2 Marken überlebt das Entfernen **einer** Marke, wird beim Entfernen der **letzten** Marke automatisch gelöscht. Bestandsdaten unverändert (6 Aktionen / 6 Zuordnungen).
- Security-Advisors: keine offenen Befunde für die neue Tabelle (RLS nach PROJ-1-Konvention `auth.uid() IS NOT NULL`); projektweit verbleibt nur `auth_leaked_password_protection`.

### Migrationen
- `discount_actions_multi_brand` (Zwischentabelle + Datenmigration + RLS + Spalte `brand_id` entfernen)
- `discount_action_delete_when_no_brands` (Cleanup-Trigger)
- `discount_action_brands_align_rls` (RLS-Ausdruck an Projekt-Konvention angeglichen)

## Deployment
_To be added by /deploy_
