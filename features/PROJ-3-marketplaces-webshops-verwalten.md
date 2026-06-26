# PROJ-3: Marketplaces & Webshops verwalten

## Status: Approved
**Created:** 2026-06-24
**Last Updated:** 2026-06-24

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — für DB, RLS, Audit-Spalten (`created_by`/`updated_by` + Zeitstempel)
- Requires: PROJ-2 (Login / Team-Zugang) — für eingeloggten Zugang und geschützte Seiten

## User Stories
- Als **Team-Mitglied** möchte ich eine Liste aller unserer Vertriebskanäle (Marketplaces & eigene Webshops) sehen, damit ich den Überblick über die Kanäle habe, auf denen wir Aktionen planen.
- Als **Team-Mitglied** möchte ich über einen Button einen neuen Kanal mit individuellem Namen anlegen (z.B. Amazon, Otto, Kaufland, eigener Webshop), damit ich später eine eigene Timeline pro Kanal bekomme.
- Als **Team-Mitglied** möchte ich einen bestehenden Kanal umbenennen, damit ich Tippfehler korrigieren oder Bezeichnungen anpassen kann, ohne ihn neu anlegen zu müssen.
- Als **Team-Mitglied** möchte ich einen Kanal löschen (mit Sicherheitsabfrage), damit nicht mehr genutzte Kanäle die Übersicht nicht überladen.
- Als **Team-Mitglied** möchte ich beim ersten Aufruf einen klaren Hinweis sehen, wenn noch kein Kanal existiert, damit ich weiß, dass ich zuerst Kanäle anlegen muss.

## Out of Scope
- **Kategorie / Plattform-Typ-Feld** (Marketplace vs. Webshop) — bewusst weggelassen und am 2026-06-24 erneut geprüft & zurückgestellt. Die Übersichtlichkeit des Jahreskalenders (PROJ-6) wird primär über einen Filter nach **Produktgruppe/Marke** gelöst (Produktgruppe an den Marken, PROJ-4), nicht über einen Kanal-Typ. Ein Plattform-Typ kann bei Bedarf später günstig nachgerüstet werden.
- **Logo-/Bild-Upload je Kanal** → PROJ-10 (Logo-Uploads)
- **Admin-only-Löschen / Rollen-Konzept** — bewusst nicht in PROJ-3 (siehe Decision Log & Open Questions). Würde ein App-weites Rollenmodell erfordern (eigenes künftiges Feature).
- **Verknüpfung mit Rabatt-Aktionen** (ein Kanal trägt Aktionen) → PROJ-5. PROJ-3 verwaltet nur die Kanäle selbst.
- **Warnung beim Löschen eines Kanals mit zukünftigen Aktionen** → kommt mit PROJ-5, da es dort erst Aktionen gibt (hier als Anforderung vorgemerkt).
- **Sortieren per Hand / eigene Reihenfolge** — Liste ist alphabetisch sortiert; manuelle Reihenfolge nicht im MVP.
- **Timeline-/Kalenderdarstellung der Kanäle** → PROJ-6 (Jahreskalender)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeigen & Leerzustand
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Kanal-Verwaltung öffnet, dann sieht er eine alphabetisch sortierte Liste aller vorhandenen Kanäle mit einem „Kanal hinzufügen"-Button.
- [ ] Angenommen es ist noch kein Kanal angelegt, wenn der Nutzer die Kanal-Verwaltung öffnet, dann sieht er einen Leerzustand-Hinweis („Noch keine Kanäle angelegt …") und einen „Kanal hinzufügen"-Button.
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er die Kanal-Verwaltung aufruft, dann wird er zur Login-Seite weitergeleitet.

### Anlegen
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er „Kanal hinzufügen" wählt, einen gültigen Namen eingibt und speichert, dann erscheint der neue Kanal in der Liste und es wird eine Erfolgsmeldung angezeigt.
- [ ] Angenommen das Namensfeld ist leer, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird kein Kanal angelegt.
- [ ] Angenommen ein Kanal mit demselben Namen existiert bereits (Groß-/Kleinschreibung und führende/abschließende Leerzeichen ignoriert), wenn der Nutzer speichert, dann erscheint eine Hinweismeldung („Kanal existiert bereits") und es wird kein Duplikat angelegt.
- [ ] Angenommen der Name ist länger als 60 Zeichen, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird kein Kanal angelegt.

### Umbenennen
- [ ] Angenommen ein Kanal existiert, wenn der Nutzer ihn umbenennt und einen gültigen neuen Namen speichert, dann wird der Name in der Liste aktualisiert und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der neue Name ist leer, ein Duplikat oder zu lang, wenn der Nutzer speichert, dann gelten dieselben Validierungsregeln wie beim Anlegen und es wird nichts geändert.

### Löschen
- [ ] Angenommen ein Kanal existiert, wenn der Nutzer „Löschen" wählt, dann erscheint zuerst ein Bestätigungsdialog, bevor der Kanal entfernt wird.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer bestätigt, dann wird der Kanal aus der Liste entfernt und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer abbricht, dann bleibt der Kanal unverändert bestehen.

### Speichern & Audit
- [ ] Angenommen ein Kanal wird angelegt oder geändert, wenn die Operation gespeichert wird, dann werden die Audit-Spalten (`created_by`/`created_at` bzw. `updated_by`/`updated_at`) automatisch gesetzt.
- [ ] Angenommen das Speichern schlägt fehl (z.B. Verbindungsfehler), wenn der Nutzer speichert, dann erscheint eine Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Leerer / nur-Leerzeichen-Name** → Validierungsmeldung, kein Kanal angelegt (Name wird vor der Prüfung getrimmt).
- **Duplikat (case-insensitive, getrimmt)** → „Amazon", „amazon", „ Amazon " gelten als derselbe Kanal; Anlegen/Umbenennen wird abgelehnt.
- **Name zu lang (> 60 Zeichen)** → Validierungsmeldung.
- **Gleichzeitiges Bearbeiten:** Zwei Nutzer ändern denselben Kanal → der zuletzt gespeicherte Stand gewinnt (Last-Write-Wins); kein Sperrmechanismus im MVP.
- **Kanal wird gelöscht, während ein anderer Nutzer ihn gerade bearbeitet** → beim Speichern erscheint ein Hinweis, dass der Kanal nicht mehr existiert; die Liste wird aktualisiert.
- **Netzwerk-/Serverfehler beim Speichern oder Löschen** → Fehlermeldung, der ursprüngliche Zustand bleibt erhalten.
- **Löschen eines Kanals mit zukünftig geplanten Aktionen** → in PROJ-3 nicht relevant (noch keine Aktionen); ab PROJ-5 muss vor dem Löschen gewarnt werden (siehe Out of Scope / Open Questions).

## Technical Requirements
- Security: Zugriff nur für eingeloggte Nutzer; RLS nach PROJ-1-Konvention (nicht eingeloggt → kein Zugriff; eingeloggt → Lesen/Schreiben).
- Security: Geschützte Seite serverseitig absichern (nicht nur clientseitig ausblenden), analog PROJ-2.
- Daten: Audit-Spalten (`created_by`, `created_at`, `updated_by`, `updated_at`) gemäß PROJ-1-Konvention.
- UX: Speicher-/Löschaktionen mit Ladezustand; Rückmeldungen via Toast (sonner, bereits vorhanden).
- UI: shadcn/ui-Komponenten wiederverwenden (Card, Input, Button, Dialog, AlertDialog, Form) — keine Eigenbauten.

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] **Admin-Rolle:** Der Wunsch „Löschen nur für Admin, Anlegen/Umbenennen für alle" wurde auf später verschoben, weil PRD/PROJ-1 „keine Rollen im MVP" festlegen. Soll eine App-weite Admin-Rolle als eigenes Feature aufgenommen werden (betrifft auch Marken, Aktionen löschen etc.)?
- [ ] **Warnung bei Löschung mit Aktionen:** Genaues Verhalten (blockieren vs. nur warnen) wird in PROJ-5 final entschieden, sobald Aktionen mit Kanälen verknüpft sind.

## Decision Log
<!-- Record of conscious decisions made and why. Added to by /write-spec and /architecture. -->

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Flache Kanal-Liste, kein Typ-/Kategorie-Feld | Für Kernziel (Kannibalisierung über Kanäle) irrelevant, ob Marketplace oder Webshop; hält MVP schlank | 2026-06-24 |
| Voller CRUD: Anlegen, Umbenennen, Löschen | Umbenennen vermeidet Löschen+Neuanlegen bei Tippfehlern; Löschen hält Liste sauber | 2026-06-24 |
| Löschen mit Bestätigungsdialog | Schutz vor versehentlichem Entfernen | 2026-06-24 |
| Keine Duplikate (case-insensitive, getrimmt) | Jeder Kanal bekommt später eine eigene Timeline; doppelte Namen wären nicht unterscheidbar | 2026-06-24 |
| Max. Namenslänge 60 Zeichen | Verhindert Layout-Probleme in der späteren Timeline-Ansicht (PROJ-6) | 2026-06-24 |
| Löschen für alle eingeloggten Nutzer (kein Rollen-Konzept) | Konsistent mit PRD/PROJ-1 „alle gleichberechtigt im MVP"; Admin-Rolle ggf. als eigenes Feature | 2026-06-24 |
| Alphabetische Sortierung, keine manuelle Reihenfolge | Einfach und vorhersehbar; manuelles Sortieren nicht MVP-relevant | 2026-06-24 |
| Gemeinsamer Stammdaten-/Verwaltungsbereich vorgesehen, in PROJ-3 nur Kanäle | Erweiterbar um Marken (PROJ-4), ohne in PROJ-3 mehr zu bauen als nötig | 2026-06-24 |
| Plattform-Typ (Marketplace/Webshop) am Kanal zurückgestellt | Filter-Bedarf im Kalender (PROJ-6) wird über Produktgruppe an den Marken (PROJ-4) gelöst; Kanal-Typ nicht nötig, später nachrüstbar | 2026-06-24 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Datenbank-Tabelle in Supabase (kein localStorage) | Kanäle müssen team-weit geteilt sein und sind Grundlage für Aktionen (PROJ-5); lokale Speicherung scheidet aus | 2026-06-24 |
| Eindeutigkeit zusätzlich auf Datenbank-Ebene erzwingen (case-insensitive, getrimmt) | App-Prüfung allein verhindert keine Duplikate bei gleichzeitigem Anlegen; die DB ist die letzte Sicherung | 2026-06-24 |
| Audit-Spalten automatisch beim Speichern setzen (DB-seitig) | Erfüllt das Audit-AC, ohne dass die Oberfläche Nutzer-Infos mitschicken muss; erste Umsetzung der PROJ-1-Audit-Konvention für PROJ-4/5 | 2026-06-24 |
| RLS wie PROJ-1: eingeloggt = voll lesen/schreiben, anon = kein Zugriff | Konsistent mit „gemeinsamer Arbeitsbereich, alle gleichberechtigt" | 2026-06-24 |
| Liste serverseitig laden (Server Component), Schreiben/Löschen über Server-Aktionen | Sicher (RLS greift mit der Nutzer-Sitzung), schnell, und die Liste aktualisiert sich nach jeder Änderung automatisch | 2026-06-24 |
| Verwaltung als neue geschützte Route im MCM-Bereich, Schutz serverseitig | Übernimmt das Schutzmuster aus PROJ-2 (Server-Check + Proxy); Stammdaten getrennt vom künftigen Kalender | 2026-06-24 |
| Wiederverwendung vorhandener shadcn/ui-Komponenten, keine neuen Pakete | Card, Table, Dialog, AlertDialog, Form, Input, Button, sonner sind bereits installiert | 2026-06-24 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-3 ist das erste Feature mit eigener Daten-Entität. Es legt eine Tabelle für Vertriebskanäle (Marketplaces & Webshops) an und baut darauf eine geschützte Verwaltungsseite mit Anlegen, Umbenennen und Löschen. Damit wird auch die in PROJ-1 definierte Audit-Konvention zum ersten Mal real umgesetzt — als Vorlage für Marken (PROJ-4) und Aktionen (PROJ-5). Es nutzt das bestehende Fundament (Auth, Sitzung, RLS, Proxy-Schutz) und benötigt keine neuen Pakete.

### Seiten- & Komponenten-Struktur
```
/tools/multi-channel-marketing/...  (Verwaltungs-/Stammdatenbereich — geschützt)
└── Seite "Kanäle verwalten"
    ├── Kopfzeile: Titel + Zurück-Link zum Dashboard
    ├── "Kanal hinzufügen"-Button (öffnet Dialog)
    ├── Kanal-Liste (alphabetisch sortiert)
    │   └── je Zeile: Name · "Umbenennen" · "Löschen"
    ├── Leerzustand (wenn noch kein Kanal existiert)
    │   └── Hinweistext + "Kanal hinzufügen"-Button
    ├── Dialog "Kanal anlegen / umbenennen" (Formular: Namensfeld + Validierung)
    └── Bestätigungsdialog "Kanal löschen?" (Abbrechen / Löschen)

Route-Schutz (aus PROJ-2 übernommen):
└── nicht eingeloggt → Weiterleitung zu /login
```

Das Dashboard (`/`) bekommt einen Einstieg in diesen Verwaltungsbereich (z.B. Link/Kachel „Kanäle verwalten"), damit die Seite auffindbar ist.

### Datenmodell (in einfacher Sprache)

**Kanal** (Marketplace oder eigener Webshop):
- Eindeutige ID
- **Name** — Pflichtfeld, max. 60 Zeichen, eindeutig (Groß-/Kleinschreibung und Leerzeichen am Rand werden beim Vergleich ignoriert)
- erstellt von / erstellt am
- zuletzt geändert von / zuletzt geändert am

Gespeichert in: **Supabase-Datenbank**, eigene Tabelle, durch RLS geschützt.

**Sicherheits-Regelwerk (RLS), wie in PROJ-1:**
- Nicht eingeloggt → gar kein Zugriff
- Eingeloggt → volles Lesen und Schreiben (Anlegen, Umbenennen, Löschen)

### Abläufe (was passiert wann)
- **Liste anzeigen:** Beim Öffnen der Seite werden die Kanäle serverseitig geladen und alphabetisch angezeigt; sind keine vorhanden, erscheint der Leerzustand.
- **Anlegen:** Dialog mit Namensfeld → Validierung (Pflicht, Länge, kein Duplikat) → Speichern → Liste aktualisiert sich, Erfolgsmeldung.
- **Umbenennen:** Derselbe Dialog vorbefüllt mit dem aktuellen Namen → gleiche Validierung → Speichern.
- **Löschen:** Bestätigungsdialog → bei Bestätigung wird der Kanal entfernt, Liste aktualisiert sich.
- **Fehlerfälle:** Verbindungs-/Serverfehler → Fehlermeldung per Toast, Eingabe bleibt erhalten; Duplikat wird sowohl von der Oberfläche als auch von der Datenbank abgewiesen.

### Eindeutigkeit & Audit (warum doppelt abgesichert)
- **Duplikate** werden zweifach verhindert: die Oberfläche prüft vor dem Speichern, und die Datenbank lehnt ein Duplikat endgültig ab (falls zwei Personen gleichzeitig denselben Namen anlegen). Der Vergleich ignoriert Groß-/Kleinschreibung und Randleerzeichen.
- **Audit-Spalten** werden automatisch beim Speichern gesetzt (welcher Nutzer, welcher Zeitpunkt) — die Oberfläche muss das nicht selbst mitschicken. Das ist die erste reale Umsetzung der PROJ-1-Konvention und wird für PROJ-4/PROJ-5 wiederverwendet.

### Benötigte Pakete
Keine neuen. Vorhanden und wiederverwendet: `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner` sowie die shadcn/ui-Komponenten Card, Table, Dialog, AlertDialog, Form, Input, Label, Button.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Keine Verknüpfung zu Aktionen (PROJ-5) — die Lösch-Warnung bei zukünftigen Aktionen kommt erst dort.
- Kein Rollen-/Rechtekonzept — alle eingeloggten Nutzer dürfen alles (siehe Open Questions).
- Keine Logos/Bilder (PROJ-10).

## Implementation Notes (Frontend)
**Stand:** 2026-06-24

**Seite (Server Component):**
- `src/app/tools/multi-channel-marketing/kanaele/page.tsx`: geschützte Verwaltungsseite (Server-Auth-Check + Redirect, Defense in depth). Lädt die Kanäle serverseitig (`select id, name`, alphabetisch) und übergibt sie an `ChannelManager`. Kopfzeile mit „Zurück zum Dashboard".

**Server-Aktionen (Datenebene-Schnittstelle):**
- `src/app/tools/multi-channel-marketing/kanaele/actions.ts`: `createChannel`, `renameChannel`, `deleteChannel` (alle „use server"). Zod-Validierung (Pflicht, getrimmt, max. 60). Duplikat-Prüfung App-seitig (case-insensitive, getrimmt) **plus** Abfangen des DB-Unique-Fehlers `23505` als letzte Sicherung. Auth-Check je Aktion. `revalidatePath` aktualisiert die Liste nach jeder Änderung. `renameChannel` erkennt zwischenzeitlich gelöschte Kanäle (leeres `update().select()` → Hinweis). Exportiert den `Channel`-Typ.

**Client-Komponenten (shadcn/ui, keine Eigenbauten):**
- `src/components/channel-manager.tsx`: orchestriert Liste (`Table`), „Kanal hinzufügen"-Button, Leerzustand und die beiden Dialoge; hält den Bearbeiten-/Lösch-Zustand.
- `src/components/channel-form-dialog.tsx`: Anlegen **und** Umbenennen (ein Dialog, vorbefüllt bei Edit). react-hook-form + Zod; Duplikat-Fehler erscheint als Feldmeldung, sonstige Fehler als Toast; Ladezustand am Button.
- `src/components/delete-channel-dialog.tsx`: `AlertDialog`-Bestätigung mit Kanalnamen; destruktiver Lösch-Button mit Ladezustand; Erfolgs-/Fehler-Toast.

**Dashboard-Einstieg:**
- `src/app/page.tsx`: zweite Kachel „Kanäle verwalten" (Icon `Store`) → `/tools/multi-channel-marketing/kanaele`.

**Abweichung von der Spec:** Die Verwaltung liegt direkt unter `/tools/multi-channel-marketing/kanaele` und ist über eine eigene Dashboard-Kachel erreichbar (nicht über die Platzhalter-Kalenderseite), damit der Einstieg stabil bleibt, wenn PROJ-6 den Kalender ergänzt.

**Verifikation:** `tsc --noEmit` fehlerfrei; `next build` erfolgreich (Route `/tools/multi-channel-marketing/kanaele` als dynamisch erkannt, keine Deprecation-Warnungen).

**⚠️ Offen für `/backend`:** Die Tabelle `public.marketplaces` existiert noch nicht. `/backend` muss anlegen:
- Tabelle `marketplaces` (`id`, `name`, Audit-Spalten `created_by`/`created_at`/`updated_by`/`updated_at`).
- **Unique-Index case-insensitive + getrimmt** auf den Namen (z.B. auf `lower(trim(name))`) — die App verlässt sich darauf als letzte Duplikat-Sicherung (Fehlercode `23505`).
- **Automatisches Setzen der Audit-Spalten** (Default `auth.uid()` / Trigger) — die UI sendet bewusst nur `name`.
- **RLS** nach PROJ-1-Konvention (anon: kein Zugriff; authenticated: voll lesen/schreiben/löschen).
Bis dahin ist die Seite gebaut, aber zur Laufzeit noch nicht funktionsfähig (kein Tabellenzugriff).

## Implementation Notes (Backend)
**Stand:** 2026-06-24 — Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Datenbank (über Supabase-Migrations):**
- Migration `create_marketplaces_table`: Tabelle `public.marketplaces`
  - Spalten: `id` (uuid, PK), `name` (text), Audit `created_by`/`created_at`/`updated_by`/`updated_at`.
  - `created_by`/`updated_by` → `auth.users(id)` mit `ON DELETE SET NULL` (gelöschter Nutzer macht den Kanal nicht kaputt).
  - Check-Constraint: `length(trim(name)) >= 1 and length(name) <= 60` (DB-seitige Pflicht/Längenprüfung).
  - **Unique-Index** `marketplaces_name_unique_idx` auf `lower(trim(name))` → Duplikate case-insensitive und ohne Randleerzeichen ausgeschlossen (letzte Sicherung; App fängt Fehlercode `23505`).
  - **Audit-Trigger** `set_marketplaces_audit` (BEFORE INSERT/UPDATE): erzwingt `created_by`/`updated_by = auth.uid()` und die Zeitstempel serverseitig; Client-Eingaben für Audit werden ignoriert, `created_*` bei Updates unveränderlich. `EXECUTE` auf die Funktion entzogen (nur per Trigger nutzbar, analog PROJ-1).
  - RLS aktiviert.
- Migration `tighten_marketplaces_rls_policies`: 4 Policies für Rolle `authenticated` (SELECT/INSERT/UPDATE/DELETE) mit `auth.uid() is not null` statt pauschal `true`. `anon` hat keine Policy → kein Zugriff (Default-Deny). Behebt die Advisor-Warnung `rls_policy_always_true`.

**Validierungs-/Duplikat-Logik (geteilt, testbar):**
- `src/lib/channel-validation.ts`: `channelNameSchema` (Zod: getrimmt, 1–60) und `isDuplicateName()` — **gemeinsam genutzt** von der Server-Aktion und dem Client-Formular (`channel-form-dialog.tsx`), damit die Regeln nicht auseinanderlaufen.
- Server-Aktionen (`kanaele/actions.ts`) nutzen jetzt dieses Modul (kein dupliziertes Schema mehr).

**Tests:**
- `src/lib/channel-validation.test.ts` (Vitest): 10 Unit-Tests für Namens-Validierung (leer, Whitespace, 60/61 Zeichen, Trim) und Duplikat-Erkennung (case-insensitive, Self-Exclude beim Umbenennen, Clash beim Umbenennen). **Alle grün.**
- Keine `/api`-Routen vorhanden (Feature läuft über Server Actions + RLS), daher keine Route-Integrationstests — analog PROJ-1/PROJ-2.

**Sicherheits-/Funktionsprüfung:**
- DB-Funktionstest (SQL): gültiger Kanal anlegbar; Duplikat (`  amazon `), leerer Name und 61 Zeichen werden **alle** abgewiesen; Testdaten entfernt (0 Zeilen).
- Security-Advisors nach Migrationen: **0 PROJ-3-Befunde**. Verbleibt projektweit nur `auth_leaked_password_protection` (manueller Auth-Dashboard-Schalter, nicht durch PROJ-3 verursacht) — Empfehlung: bei Gelegenheit aktivieren.
- `tsc --noEmit` fehlerfrei; `next build` erfolgreich (Route `/tools/multi-channel-marketing/kanaele` dynamisch).

**Build-Hinweis (Umgebung, kein Code-Bug):** `next build` muss auf Windows mit **großem** Laufwerksbuchstaben (`C:\…`) aufgerufen werden. Mit klein geschriebenem `c:\…` lädt Next sein `workUnitAsyncStorage`-Modul doppelt (Pfad-Casing-Duplikat) → Invariant-Fehler beim Prerendern von `/_global-error`/`/_not-found`. Mit korrektem Pfad bzw. relativem Aufruf (`npm run build`) baut alles sauber.

## QA Test Results

**Tested:** 2026-06-24
**Tester:** QA Engineer (AI) + manuelle Bestätigung durch Nutzer
**Methoden:** Manueller Browser-Test (vom Nutzer bestätigt: „Es klappt alles"), Live-DB-/RLS-Checks gegen Supabase (`grtqmrnjjsucskdeghrr`), HTTP-Route-Checks, Unit-Tests (Vitest), Code-Review. E2E-Spec geschrieben, lokal nicht ausführbar (Umgebung, siehe unten).

### Acceptance Criteria Status

**Anzeigen & Leerzustand**
- [x] Liste alphabetisch + „Kanal hinzufügen"-Button — manuell bestätigt; DB liefert saubere alphabetische (case-insensitive) Reihenfolge der 13 echten Kanäle.
- [x] Leerzustand bei 0 Kanälen — Code-Review (Leerzustand-Block); beim Erststart vor Dateneingabe sichtbar.
- [x] Nicht eingeloggt → `/login` — HTTP **307** für `/tools/multi-channel-marketing/kanaele` verifiziert.

**Anlegen**
- [x] Gültiger Kanal anlegen → erscheint in Liste + Erfolgsmeldung — manuell bestätigt (13 Kanäle live angelegt).
- [x] Leerer Name → Validierungsmeldung, kein Kanal — Zod (`channelNameSchema`) + Unit-Test + DB-Check-Constraint.
- [x] Duplikat (case-insensitive, getrimmt) → Hinweis, kein Duplikat — App-Prüfung (`isDuplicateName`, Unit-Test) **und** DB-Unique-Index (`23505`) verifiziert.
- [x] Name > 60 Zeichen → Validierungsmeldung — Zod + `maxLength={60}` + DB-Check (alle drei verifiziert).

**Umbenennen**
- [x] Gültig umbenennen → Liste aktualisiert + Erfolgsmeldung — live bestätigt (`prfrm Shop (DE)`: `updated_at` ≠ `created_at`, `created_*` unverändert).
- [x] Ungültiger neuer Name (leer/Duplikat/zu lang) → gleiche Validierung — geteiltes Schema + Unit-Tests (Self-Exclude beim Umbenennen getestet).

**Löschen**
- [x] Bestätigungsdialog vor dem Löschen — `AlertDialog`, manuell bestätigt.
- [x] Bestätigen → entfernt + Erfolgsmeldung — manuell bestätigt.
- [x] Abbrechen → Kanal bleibt — Code-Review (kein Aufruf bei Cancel).

**Speichern & Audit**
- [x] Audit-Spalten automatisch gesetzt — live verifiziert: alle 13 Kanäle mit `created_by`/`updated_by` = Nutzer-UID; Trigger erzwingt Werte serverseitig (Client-Eingabe wird ignoriert), `created_*` bei Update unveränderlich.
- [x] Speicherfehler → Fehlermeldung, Eingabe bleibt — Code-Review (try/catch in Server-Aktion/Dialog, Toast, Dialog bleibt offen).

### Edge Cases Status
- [x] Leerer / nur-Leerzeichen-Name → abgewiesen (Zod `.trim().min(1)` + DB-Check).
- [x] Duplikat case-insensitive/getrimmt → abgewiesen (App + DB).
- [x] Name > 60 → abgewiesen (3-fach).
- [x] Gleichzeitiges Bearbeiten = Last-Write-Wins — Code-Review (kein Sperrmechanismus, wie spezifiziert).
- [x] Löschen während Bearbeitung → „Dieser Kanal existiert nicht mehr." — Code-Review (`update().select()` leer → Hinweis).
- [x] Netzwerk-/Serverfehler → Fehlermeldung, Zustand bleibt — Code-Review.
- [n/a] Löschen eines Kanals mit zukünftigen Aktionen → noch keine Aktionen (PROJ-5).

### Security Audit Results (Red Team)
- [x] **RLS anon-Lesen:** `GET /rest/v1/marketplaces` mit anon-Key → HTTP 200, Body `[]` (alle 13 Zeilen verborgen).
- [x] **RLS anon-Schreiben:** `POST /rest/v1/marketplaces` mit anon-Key → HTTP **401** (`42501`, „new row violates row-level security policy").
- [x] **Route-Schutz serverseitig:** Kanal-Verwaltung liefert unangemeldet 307 → `/login` (nicht nur clientseitig ausgeblendet); Server-Aktionen prüfen zusätzlich `getUser()` (Defense in depth).
- [x] **Secrets:** Nur Publishable/Anon-Key im Client/`.env.local` (öffentlich unbedenklich); kein Service-Key im Repo.
- [x] **XSS:** Kanalnamen werden via React-Textbindung gerendert (kein `dangerouslySetInnerHTML`) → automatische Maskierung; Sonderzeichen werden als Text gespeichert.
- [x] **SQL-Injection:** Zugriffe ausschließlich über den parametrisierten Supabase-Client + RLS.
- [x] **Security-Advisors:** 0 PROJ-3-Befunde (RLS-„always true"-Warnung in `tighten_marketplaces_rls_policies` behoben).

### Automatisierte Tests
- **Unit (Vitest):** `src/lib/channel-validation.test.ts` — **10/10 grün** (Namens-Validierung + Duplikat-Erkennung inkl. Self-Exclude/Clash beim Umbenennen).
- **E2E (Playwright):** `tests/PROJ-3-marketplaces-webshops-verwalten.spec.ts` (Route-Schutz unangemeldet) geschrieben.
  - ⚠️ **Lokal nicht ausführbar (Umgebung, kein App-Fehler):** Playwright-Browser nicht installiert, Download hängt in dieser Umgebung; zudem localhost-Proxy-Problem (siehe PROJ-2-QA). Für saubere/CI-Umgebung vorgesehen (`npx playwright install`).

### Regression
- [x] PROJ-2-Route-Schutz weiterhin intakt (`/`, `/login` antworten korrekt; Dashboard nur additiv um zweite Kachel erweitert).
- [x] `tsc --noEmit` fehlerfrei; `next build` erfolgreich.

### Bugs Found

#### BUG-4: `npm test` schlägt fehl — Vitest sammelt Playwright-Specs auf
- **Severity:** Medium
- **Detail:** `vitest.config.ts` setzt kein `include`/`exclude`. Vitest matcht damit auch `tests/*.spec.ts` (Playwright-E2E) und bricht ab („Playwright Test did not expect test.describe() to be called here"). Die **Unit-Tests selbst sind alle grün** (10/10), aber `npm test` endet mit Exit 1 → CI-Gate rot.
- **Steps to Reproduce:** `npm test` ausführen → vitest scheitert an `tests/PROJ-2-...spec.ts`.
- **Empfehlung (Fix gehört zu /frontend oder /backend):** In `vitest.config.ts` `test.exclude: ['tests/**', ...configDefaults.exclude]` setzen oder `include: ['src/**/*.test.{ts,tsx}']`. Pre-existing latent seit PROJ-2 (erste `.spec.ts`), erst mit den PROJ-3-Unit-Tests sichtbar geworden.
- **Priority:** Fix before deployment (CI-Gate).
- **Status:** ✅ **BEHOBEN** (2026-06-25) — `vitest.config.ts` um `include: ['src/**/*.test.{ts,tsx}']` ergänzt; `npm test` jetzt grün (10/10, Exit 0), Playwright-Specs werden nicht mehr eingesammelt.

#### Offene Hinweise (nicht durch PROJ-3 verursacht)
- **BUG-3 (Low, aus PROJ-1):** `npm run lint` defekt (`next lint` in Next 16 entfernt) — unverändert offen.
- **Auth-Advisor (Low, projektweit):** „Leaked Password Protection" deaktiviert — manueller Dashboard-Schalter (Authentication → Sign In / Providers / Attack Protection), empfohlen zu aktivieren; nicht PROJ-3-spezifisch.

### Summary
- **Acceptance Criteria:** 15/15 verifiziert (manuell + Live-DB/RLS + HTTP + Unit-Tests + Code-Review).
- **Bugs:** 1 neu (0 Critical, 0 High, 1 Medium [BUG-4 — ✅ behoben], 0 Low); 2 offene Fremd-Hinweise (Low).
- **Security:** Pass (RLS anon default-deny verifiziert, serverseitiger Route-Schutz, keine Secret-Leaks, XSS-sicher, 0 Advisor-Befunde).
- **Automatisierte E2E:** geschrieben, lokal nicht ausführbar (Umgebung) — für CI bereit.
- **Production Ready:** **YES** (keine offenen Critical/High-Bugs). BUG-4 (Medium, CI) sollte vor dem Deploy behoben werden — Ein-Zeilen-Fix in `vitest.config.ts`.
- **Recommendation:** PROJ-3 freigeben. BUG-4 vor `/deploy` mit einem kleinen `/frontend`- bzw. `/backend`-Schritt erledigen; E2E-Suite bei Gelegenheit in CI ausführen.

## Deployment
_To be added by /deploy_

## Deployment
_To be added by /deploy_
