# PROJ-11: Produktgruppen verwalten

## Status: Approved
**Created:** 2026-06-25
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — für DB, RLS und Audit-Spalten (`created_by`/`created_at`/`updated_by`/`updated_at`).
- Requires: PROJ-2 (Login / Team-Zugang) — für eingeloggten Zugang und serverseitig geschützte Seiten.
- Soft-Kopplung zu PROJ-4 (Marken verwalten): Marken verweisen auf Produktgruppen. Die „Löschen blockieren, solange Marken zugeordnet sind"-Regel setzt die Marken-Tabelle aus PROJ-4 voraus. Solange PROJ-4 noch nicht existiert, hat keine Gruppe Marken → Löschen ist immer möglich. PROJ-11 kann also vor PROJ-4 gebaut werden; die Lösch-Sperre wird erst mit PROJ-4 wirksam.

## User Stories
- Als **Team-Mitglied** möchte ich eine Liste aller Produktgruppen (z.B. Fitness, Familie) sehen, damit ich weiß, nach welchen Gruppen Marken organisiert und der Kalender (PROJ-6) gefiltert werden kann.
- Als **Team-Mitglied** möchte ich eine neue Produktgruppe mit individuellem Namen anlegen, damit ich Marken nach unseren Produktbereichen strukturieren kann.
- Als **Team-Mitglied** möchte ich eine bestehende Produktgruppe umbenennen, damit ich Tippfehler korrigieren oder Bezeichnungen anpassen kann, ohne sie neu anzulegen.
- Als **Team-Mitglied** möchte ich eine Produktgruppe löschen (mit Sicherheitsabfrage), damit nicht mehr genutzte Gruppen die Übersicht nicht überladen.
- Als **Team-Mitglied** möchte ich am Löschen gehindert werden, wenn der Gruppe noch Marken zugeordnet sind, damit keine Marken ohne Gruppe zurückbleiben.
- Als **Team-Mitglied** möchte ich beim ersten Aufruf die vordefinierten Startgruppen (Fitness, Familie) vorfinden, damit ich sofort loslegen kann.

## Out of Scope
- **Marken-Verwaltung** (Marken anlegen/zuordnen) → PROJ-4. PROJ-11 verwaltet nur die Gruppen selbst.
- **Verschieben von Marken zwischen Gruppen** beim Löschen — bewusst nicht gewählt; stattdessen wird das Löschen blockiert, solange Marken zugeordnet sind (siehe Product Decisions). Das Umhängen einzelner Marken erfolgt in der Marken-Verwaltung (PROJ-4).
- **Kaskadierendes Löschen** (Gruppe löschen entfernt Marken) — bewusst verworfen wegen Datenverlust-Risiko.
- **Kalender-/Filter-Darstellung nach Produktgruppe** → PROJ-6 (Jahreskalender). PROJ-11 liefert nur die Stammdaten.
- **Farbe / Icon je Produktgruppe** — Farbe gehört zur Marke (PROJ-4), nicht zur Gruppe; nicht im MVP.
- **Manuelle Sortierung der Gruppenliste** — Liste ist alphabetisch sortiert; eigene Reihenfolge nicht im MVP.
- **Admin-only-Löschen / Rollen-Konzept** — bewusst nicht enthalten; alle eingeloggten Nutzer sind gleichberechtigt (konsistent mit PRD/PROJ-1, PROJ-3).
- **Logo-/Bild-Upload je Gruppe** — nicht vorgesehen.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeigen & Leerzustand
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Produktgruppen-Verwaltung öffnet, dann sieht er eine alphabetisch sortierte Liste aller Gruppen mit einem „Gruppe hinzufügen"-Button.
- [ ] Angenommen das System ist frisch aufgesetzt, wenn der Nutzer die Produktgruppen-Verwaltung zum ersten Mal öffnet, dann sind die Startgruppen „Fitness" und „Familie" bereits vorhanden.
- [ ] Angenommen alle Gruppen wurden gelöscht, wenn der Nutzer die Verwaltung öffnet, dann sieht er einen Leerzustand-Hinweis („Noch keine Produktgruppen angelegt …") und einen „Gruppe hinzufügen"-Button.
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er die Produktgruppen-Verwaltung aufruft, dann wird er zur Login-Seite weitergeleitet.

### Anlegen
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er „Gruppe hinzufügen" wählt, einen gültigen Namen eingibt und speichert, dann erscheint die neue Gruppe in der Liste und es wird eine Erfolgsmeldung angezeigt.
- [ ] Angenommen das Namensfeld ist leer, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird keine Gruppe angelegt.
- [ ] Angenommen eine Gruppe mit demselben Namen existiert bereits (Groß-/Kleinschreibung und führende/abschließende Leerzeichen ignoriert), wenn der Nutzer speichert, dann erscheint eine Hinweismeldung („Gruppe existiert bereits") und es wird kein Duplikat angelegt.
- [ ] Angenommen der Name ist länger als 60 Zeichen, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird keine Gruppe angelegt.

### Umbenennen
- [ ] Angenommen eine Gruppe existiert, wenn der Nutzer sie umbenennt und einen gültigen neuen Namen speichert, dann wird der Name in der Liste aktualisiert und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der neue Name ist leer, ein Duplikat oder zu lang, wenn der Nutzer speichert, dann gelten dieselben Validierungsregeln wie beim Anlegen und es wird nichts geändert.

### Löschen
- [ ] Angenommen eine Gruppe ohne zugeordnete Marken existiert, wenn der Nutzer „Löschen" wählt, dann erscheint zuerst ein Bestätigungsdialog (mit Gruppenname), bevor die Gruppe entfernt wird.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer bestätigt, dann wird die Gruppe aus der Liste entfernt und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer abbricht, dann bleibt die Gruppe unverändert bestehen.
- [ ] Angenommen einer Gruppe sind noch Marken zugeordnet, wenn der Nutzer sie löschen will, dann wird das Löschen verhindert und ein Hinweis angezeigt („Gruppe enthält noch X Marken — bitte zuerst verschieben oder löschen").

### Speichern & Audit
- [ ] Angenommen eine Gruppe wird angelegt oder geändert, wenn die Operation gespeichert wird, dann werden die Audit-Spalten (`created_by`/`created_at` bzw. `updated_by`/`updated_at`) automatisch serverseitig gesetzt.
- [ ] Angenommen das Speichern schlägt fehl (z.B. Verbindungsfehler), wenn der Nutzer speichert, dann erscheint eine Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Leerer / nur-Leerzeichen-Name** → Validierungsmeldung, keine Gruppe angelegt (Name wird vor der Prüfung getrimmt).
- **Duplikat (case-insensitive, getrimmt)** → „Fitness", „fitness", „ Fitness " gelten als dieselbe Gruppe; Anlegen/Umbenennen wird abgelehnt.
- **Name zu lang (> 60 Zeichen)** → Validierungsmeldung.
- **Löschen einer Gruppe mit zugeordneten Marken** → blockiert, Hinweis mit Anzahl; Gruppe bleibt bestehen (greift erst mit PROJ-4).
- **Gruppe wird gelöscht, während ein anderer Nutzer ihr gerade eine Marke zuordnet (PROJ-4)** → die Lösch-Prüfung zählt zum Zeitpunkt des Löschens; ist die Zählung 0, wird gelöscht; die DB-Beziehung verhindert ein Verwaisen (Fremdschlüssel). Detail-Verhalten wird mit PROJ-4 final.
- **Gleichzeitiges Bearbeiten:** Zwei Nutzer ändern dieselbe Gruppe → der zuletzt gespeicherte Stand gewinnt (Last-Write-Wins); kein Sperrmechanismus im MVP.
- **Gruppe wird gelöscht, während ein anderer Nutzer sie gerade umbenennt** → beim Speichern erscheint ein Hinweis, dass die Gruppe nicht mehr existiert; die Liste wird aktualisiert.
- **Netzwerk-/Serverfehler beim Speichern oder Löschen** → Fehlermeldung, der ursprüngliche Zustand bleibt erhalten.
- **Letzte verbleibende Gruppe löschen** → erlaubt (sofern keine Marken zugeordnet); danach kann in PROJ-4 keine Marke mehr angelegt werden, bis wieder eine Gruppe existiert (dort als Leerzustand abgefangen).

## Technical Requirements
- Security: Zugriff nur für eingeloggte Nutzer; RLS nach PROJ-1-Konvention (anon → kein Zugriff; authenticated → Lesen/Schreiben/Löschen).
- Security: Geschützte Seite serverseitig absichern (nicht nur clientseitig ausblenden), analog PROJ-2/PROJ-3.
- Daten: Audit-Spalten (`created_by`, `created_at`, `updated_by`, `updated_at`) gemäß PROJ-1-Konvention, serverseitig automatisch gesetzt.
- Daten: Eindeutigkeit des Gruppennamens (case-insensitive, getrimmt) zusätzlich auf DB-Ebene erzwingen (letzte Sicherung gegen gleichzeitiges Anlegen).
- Daten: Referenzielle Integrität zu Marken (PROJ-4) — Fremdschlüssel verhindert das Löschen einer Gruppe mit zugeordneten Marken (DB-seitige Absicherung der Lösch-Sperre); App zeigt vorab einen verständlichen Hinweis.
- Daten: Startgruppen „Fitness" und „Familie" werden initial bereitgestellt (Seed).
- UX: Speicher-/Löschaktionen mit Ladezustand; Rückmeldungen via Toast (sonner, bereits vorhanden).
- UI: shadcn/ui-Komponenten wiederverwenden (Card, Table, Input, Label, Button, Dialog, AlertDialog, Form) — keine Eigenbauten.

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] **Detailverhalten der Lösch-Sperre bei Race-Condition mit PROJ-4** (gleichzeitiges Zuordnen einer Marke während des Löschens) wird gemeinsam mit der PROJ-4-Umsetzung final festgezurrt.

## Decision Log
<!-- Record of conscious decisions made and why. Added to by /write-spec and /architecture. -->

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Produktgruppen als eigenes Feature (getrennt von Marken PROJ-4) | Eigenständige CRUD-Entität, unabhängig testbar/deploybar → Single Responsibility | 2026-06-25 |
| Löschen blockieren, solange Marken zugeordnet sind | Sicherste Variante; verhindert verwaiste/ungruppierte Marken und ungewollten Datenverlust (Kaskade verworfen) | 2026-06-25 |
| Kein Verschieben von Marken beim Gruppen-Löschen | Umhängen erfolgt gezielt in der Marken-Verwaltung (PROJ-4); hält PROJ-11 schlank | 2026-06-25 |
| Startgruppen „Fitness" und „Familie" vorbefüllt | Laut PRD von Anfang an vorgesehen; Nutzer kann sofort Marken zuordnen | 2026-06-25 |
| Voller CRUD: Anlegen, Umbenennen, Löschen | Umbenennen vermeidet Löschen+Neuanlegen; Löschen hält die Liste sauber | 2026-06-25 |
| Löschen mit Bestätigungsdialog | Schutz vor versehentlichem Entfernen, analog PROJ-3 | 2026-06-25 |
| Keine Duplikate (case-insensitive, getrimmt) | Gruppen dienen als eindeutige Filter-Kategorie; doppelte Namen wären nicht unterscheidbar | 2026-06-25 |
| Max. Namenslänge 60 Zeichen | Konsistent mit Kanälen (PROJ-3) und Marken (PROJ-4); verhindert Layout-Probleme in Dropdowns/Kalender | 2026-06-25 |
| Keine Farbe an der Gruppe | Farbe ist ein Marken-Attribut (PROJ-4); Gruppe ist nur Kategorie | 2026-06-25 |
| Löschen/Bearbeiten für alle eingeloggten Nutzer (kein Rollen-Konzept) | Konsistent mit PRD/PROJ-1 „alle gleichberechtigt im MVP" | 2026-06-25 |
| Alphabetische Sortierung, keine manuelle Reihenfolge | Einfach und vorhersehbar; manuelles Sortieren nicht MVP-relevant | 2026-06-25 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Datenbank-Tabelle in Supabase (kein localStorage) | Gruppen müssen team-weit geteilt sein und sind Grundlage für Marken (PROJ-4) und Kalender-Filter (PROJ-6); lokale Speicherung scheidet aus. Identisches Muster wie Kanäle (PROJ-3) | 2026-06-25 |
| Wiederverwendung des PROJ-3-Bauplans (Server Component + Server-Aktionen, kein eigener `/api`-Endpunkt) | Schreiben/Löschen laufen mit der Nutzer-Sitzung (RLS greift), Liste lädt serverseitig und aktualisiert sich nach jeder Änderung; weniger Code, konsistent mit Kanälen | 2026-06-25 |
| Eindeutigkeit zusätzlich auf DB-Ebene (case-insensitive, getrimmt) | App-Prüfung allein verhindert keine Duplikate bei gleichzeitigem Anlegen; die DB ist die letzte Sicherung (analog `marketplaces`) | 2026-06-25 |
| Audit-Spalten serverseitig per Trigger setzen | Erfüllt das Audit-AC, ohne dass die Oberfläche Nutzer-Infos mitschickt; übernimmt die PROJ-1/PROJ-3-Konvention | 2026-06-25 |
| RLS wie PROJ-1/PROJ-3: authenticated = voll lesen/schreiben, anon = kein Zugriff | Konsistent mit „gemeinsamer Arbeitsbereich, alle gleichberechtigt" | 2026-06-25 |
| Lösch-Sperre als Fremdschlüssel (ON DELETE RESTRICT) auf der **Marken**-Tabelle, ergänzt um eine freundliche App-Vorprüfung | DB-Restrict ist die harte Garantie gegen verwaiste Marken; die App zählt vorab und zeigt eine verständliche Meldung statt eines rohen DB-Fehlers. Der Fremdschlüssel entsteht erst mit PROJ-4 (dort liegt die Marken-Tabelle) | 2026-06-25 |
| Startgruppen „Fitness"/„Familie" per Seed-Migration | Reproduzierbar und versioniert; beim Seed ist kein eingeloggter Nutzer aktiv, daher `created_by`/`updated_by` für Seed-Zeilen nullable (Trigger muss Seed ohne `auth.uid()` zulassen) | 2026-06-25 |
| Geteiltes Validierungsmodul (Name: getrimmt, 1–60, Duplikat-Check) | Server-Aktion und Formular nutzen dieselben Regeln, damit sie nicht auseinanderlaufen — wie `channel-validation.ts` bei PROJ-3 | 2026-06-25 |
| Keine neuen Pakete | Card, Table, Dialog, AlertDialog, Form, Input, Label, Button, sonner, react-hook-form, zod sind bereits installiert | 2026-06-25 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-25

### Überblick
PROJ-11 ist eine reine Stammdaten-Verwaltung und folgt 1:1 dem bereits erprobten Bauplan von PROJ-3 (Kanäle): eine eigene Datenbank-Tabelle plus eine geschützte Verwaltungsseite mit Anlegen, Umbenennen und Löschen. Der einzige inhaltliche Unterschied: Beim Löschen wird geprüft, ob der Gruppe noch Marken zugeordnet sind — wenn ja, wird das Löschen verhindert. Es werden keine neuen Pakete benötigt; das Feature nutzt das vorhandene Fundament (Auth, Sitzung, RLS, serverseitiger Routenschutz, Audit-Trigger).

### Seiten- & Komponenten-Struktur
```
/tools/multi-channel-marketing/produktgruppen   (geschützte Stammdaten-Seite)
└── Seite "Produktgruppen verwalten"
    ├── Kopfzeile: Titel + Zurück-Link zum Dashboard
    ├── "Gruppe hinzufügen"-Button (öffnet Dialog)
    ├── Gruppen-Liste (alphabetisch sortiert)
    │   └── je Zeile: Name · "Umbenennen" · "Löschen"
    ├── Leerzustand (wenn keine Gruppe existiert)
    │   └── Hinweistext + "Gruppe hinzufügen"-Button
    ├── Dialog "Gruppe anlegen / umbenennen" (Formular: Namensfeld + Validierung)
    └── Bestätigungsdialog "Gruppe löschen?"
        └── falls noch Marken zugeordnet: stattdessen Hinweis mit Anzahl (kein Löschen)

Route-Schutz (aus PROJ-2 übernommen):
└── nicht eingeloggt → Weiterleitung zu /login

Dashboard (/) bekommt eine dritte Kachel „Produktgruppen verwalten" als Einstieg.
```

Geplante Bausteine (analog zu den `channel-*`-Komponenten aus PROJ-3): eine Manager-Komponente (Liste + Dialoge orchestrieren), ein gemeinsamer Formular-Dialog (Anlegen **und** Umbenennen), ein Lösch-Bestätigungsdialog sowie ein geteiltes Validierungsmodul.

### Datenmodell (in einfacher Sprache)
**Produktgruppe:**
- Eindeutige ID
- **Name** — Pflichtfeld, max. 60 Zeichen, eindeutig (Groß-/Kleinschreibung und Randleerzeichen werden beim Vergleich ignoriert)
- erstellt von / erstellt am
- zuletzt geändert von / zuletzt geändert am

Gespeichert in: **Supabase-Datenbank**, eigene Tabelle, durch RLS geschützt. Vorbefüllt mit „Fitness" und „Familie".

**Beziehung zu Marken (PROJ-4):** Jede Marke verweist auf genau eine Produktgruppe. Diese Verknüpfung wird auf der Marken-Tabelle angelegt (kommt mit PROJ-4) und so eingestellt, dass die Datenbank das Löschen einer Gruppe ablehnt, solange noch Marken darauf verweisen.

**Sicherheits-Regelwerk (RLS), wie PROJ-1/PROJ-3:**
- Nicht eingeloggt → gar kein Zugriff
- Eingeloggt → volles Lesen und Schreiben (Anlegen, Umbenennen, Löschen)

### Abläufe (was passiert wann)
- **Liste anzeigen:** Beim Öffnen werden die Gruppen serverseitig geladen und alphabetisch angezeigt; sind keine vorhanden, erscheint der Leerzustand.
- **Anlegen / Umbenennen:** Dialog mit Namensfeld → Validierung (Pflicht, Länge, kein Duplikat) → Speichern → Liste aktualisiert sich, Erfolgsmeldung.
- **Löschen:** Zuerst prüft die App, ob der Gruppe Marken zugeordnet sind. Sind welche zugeordnet → Hinweis mit Anzahl, kein Löschen. Sind keine zugeordnet → Bestätigungsdialog → bei Bestätigung wird die Gruppe entfernt.
- **Fehlerfälle:** Verbindungs-/Serverfehler → Fehlermeldung per Toast, Eingabe bleibt erhalten; Duplikate werden von Oberfläche und Datenbank abgewiesen.

### Sequenzierung mit PROJ-4 (wichtig)
PROJ-11 kann **vor** PROJ-4 gebaut werden. Die harte DB-Sperre gegen das Löschen einer Gruppe mit Marken ist Teil der Marken-Tabelle und entsteht daher erst mit PROJ-4. Solange PROJ-4 nicht existiert, gibt es keine Marken → die App-Vorprüfung meldet immer „0 zugeordnete Marken" und das Löschen ist erlaubt. Sobald PROJ-4 gebaut wird, greift die vollständige Sperre (App-Hinweis + DB-Restrict).

### Benötigte Pakete
Keine neuen. Vorhanden und wiederverwendet: `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner` sowie die shadcn/ui-Komponenten Card, Table, Dialog, AlertDialog, Form, Input, Label, Button.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Keine Marken-Verwaltung (PROJ-4) — nur die Gruppen selbst.
- Kein Verschieben/Kaskadieren von Marken beim Löschen — Löschen wird stattdessen blockiert.
- Kein Rollen-/Rechtekonzept — alle eingeloggten Nutzer dürfen alles.
- Keine Farbe/Logos an der Gruppe.

## Implementation Notes (Frontend)
**Stand:** 2026-06-25

**Seite (Server Component):**
- `src/app/tools/multi-channel-marketing/produktgruppen/page.tsx`: geschützte Verwaltungsseite (Server-Auth-Check + Redirect zu `/login`, Defense in depth). Lädt die Gruppen serverseitig (`select id, name`, alphabetisch) und übergibt sie an `ProductGroupManager`. Kopfzeile mit „Zurück zum Dashboard".

**Server-Aktionen (Datenebene-Schnittstelle):**
- `src/app/tools/multi-channel-marketing/produktgruppen/actions.ts`: `createProductGroup`, `renameProductGroup`, `deleteProductGroup` (alle „use server"). Zod-Validierung (Pflicht, getrimmt, max. 60), Duplikat-Prüfung App-seitig (case-insensitive/getrimmt) **plus** Abfangen des DB-Unique-Fehlers `23505`. Auth-Check je Aktion. `revalidatePath` aktualisiert die Liste. `renameProductGroup` erkennt zwischenzeitlich gelöschte Gruppen (leeres `update().select()` → Hinweis). Exportiert die Typen `ProductGroup`, `ProductGroupActionResult`, `ProductGroupDeleteResult`.
- **Lösch-Sperre:** `deleteProductGroup` zählt vor dem Löschen Marken in `brands` (`product_group_id`). Da die `brands`-Tabelle erst mit PROJ-4 kommt, wird ein `undefined_table`-Fehler (42P01) toleriert (= „noch keine Marken", Gruppe löschbar). Zusätzlich wird der Fremdschlüssel-Fehler `23503` als „Gruppe enthält noch Marken" abgefangen (harte Garantie, sobald PROJ-4 existiert).

**Client-Komponenten (shadcn/ui, keine Eigenbauten):**
- `src/components/product-group-manager.tsx`: orchestriert Liste (`Table`), „Gruppe hinzufügen"-Button, Leerzustand (`Tags`-Icon) und die beiden Dialoge; hält Bearbeiten-/Lösch-Zustand.
- `src/components/product-group-form-dialog.tsx`: Anlegen **und** Umbenennen (ein Dialog, vorbefüllt bei Edit). react-hook-form + Zod; Duplikat-Fehler als Feldmeldung, sonstige Fehler als Toast; Ladezustand am Button.
- `src/components/delete-product-group-dialog.tsx`: `AlertDialog`-Bestätigung mit Gruppenname; blockiertes Löschen (Marken zugeordnet) erscheint als Toast-Hinweis, Gruppe bleibt bestehen.

**Geteilte Validierung:**
- `src/lib/product-group-validation.ts`: `productGroupNameSchema` (Zod: getrimmt, 1–60); die generische `isDuplicateName`-Funktion wird aus `channel-validation.ts` wiederverwendet (entity-agnostisch `{ id, name }`), kein dupliziertes Dedup.

**Dashboard-Einstieg:**
- `src/app/page.tsx`: dritte Kachel „Produktgruppen verwalten" (Icon `Tags`) → `/tools/multi-channel-marketing/produktgruppen`.

**Verifikation:** `tsc --noEmit` fehlerfrei; `next build` erfolgreich (Route `/tools/multi-channel-marketing/produktgruppen` als dynamisch erkannt).

**⚠️ Offen für `/backend`:** Tabelle `public.product_groups` existiert noch nicht. `/backend` muss anlegen (analog `marketplaces` aus PROJ-3):
- Tabelle `product_groups` (`id`, `name`, Audit-Spalten `created_by`/`created_at`/`updated_by`/`updated_at`).
- **Unique-Index case-insensitive + getrimmt** auf den Namen (z.B. `lower(trim(name))`) — App verlässt sich darauf (Fehlercode `23505`).
- **Audit-Trigger** zum automatischen Setzen der Audit-Spalten. **Wichtig:** Seed der Startgruppen „Fitness"/„Familie" läuft ohne `auth.uid()` → `created_by`/`updated_by` müssen für Seed-Zeilen nullable sein bzw. der Trigger muss den Seed zulassen.
- **Seed** „Fitness" und „Familie".
- **RLS** nach PROJ-1-Konvention (anon: kein Zugriff; authenticated: voll lesen/schreiben/löschen).
- **Vertrags-Hinweis für PROJ-4:** Die Marken-Tabelle sollte `brands` heißen mit Spalte `product_group_id` und einem Fremdschlüssel **ON DELETE RESTRICT** auf `product_groups(id)` — darauf baut die Lösch-Sperre (App-Vorprüfung zählt `brands`, DB sichert via `23503`). Falls PROJ-4 andere Namen wählt, muss die Vorprüfung in `deleteProductGroup` angepasst werden.
Bis dahin ist die Seite gebaut, aber zur Laufzeit noch nicht funktionsfähig (kein Tabellenzugriff).

## Implementation Notes (Backend)
**Stand:** 2026-06-25 — Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Datenbank (Migration `create_product_groups_table`):** Tabelle `public.product_groups`, 1:1 nach dem `marketplaces`-Muster (PROJ-3).
- Spalten: `id` (uuid, PK, `gen_random_uuid()`), `name` (text), Audit `created_by`/`created_at`/`updated_by`/`updated_at`.
- `created_by`/`updated_by` → `auth.users(id)` mit `ON DELETE SET NULL`.
- Check-Constraint `product_groups_name_check`: `length(trim(name)) >= 1 and length(name) <= 60`.
- **Unique-Index** `product_groups_name_unique_idx` auf `lower(trim(name))` → Duplikate case-insensitive/getrimmt ausgeschlossen (App fängt `23505`).
- **Audit-Trigger** `product_groups_set_audit` (BEFORE INSERT/UPDATE) via `set_product_groups_audit()`: erzwingt `created_by`/`updated_by = auth.uid()` + Zeitstempel serverseitig; `created_*` bei Updates unveränderlich; `EXECUTE` auf die Funktion entzogen (nur per Trigger, analog PROJ-1).
- **RLS** aktiviert; 4 Policies für Rolle `authenticated` (SELECT/INSERT/UPDATE/DELETE) mit `auth.uid() is not null`. `anon` ohne Policy → Default-Deny (von Anfang an „getightet", keine `always-true`-Advisor-Warnung).
- **Seed** „Fitness" + „Familie" im selben Migrationsschritt, **idempotent** (`where not exists` über `lower(trim(name))`). Da beim Seed keine Sitzung aktiv ist, ist `auth.uid()` null → `created_by`/`updated_by` der Seed-Zeilen sind null (Spalten nullable, kein Sonderfall nötig).

**Lösch-Sperre (Vertrag mit PROJ-4):** Der harte Fremdschlüssel `ON DELETE RESTRICT` liegt auf der künftigen `brands`-Tabelle (`product_group_id` → `product_groups(id)`) und entsteht mit PROJ-4. `deleteProductGroup` zählt vorab `brands` (graceful, solange die Tabelle fehlt) und fängt zusätzlich `23503` ab. Keine Änderung an `product_groups` nötig, wenn PROJ-4 den Vertrag einhält.

**Validierung/Tests:**
- `src/lib/product-group-validation.ts`: `productGroupNameSchema` (getrimmt, 1–60); `isDuplicateName` aus `channel-validation.ts` wiederverwendet (entity-agnostisch).
- `src/lib/product-group-validation.test.ts` (Vitest): 10 Unit-Tests (Schema + Duplikat inkl. Self-Exclude/Clash beim Umbenennen). **Gesamtsuite 20/20 grün.**
- Keine `/api`-Routen (Feature läuft über Server Actions + RLS), daher keine Route-Integrationstests — analog PROJ-1/2/3.

**DB-Funktionsprüfung (SQL):** Seed mit 2 Zeilen vorhanden; Duplikat (`  fitness `), leerer Name und 61 Zeichen werden **alle** abgewiesen (Zeilenzahl bleibt 2). Security-Advisors nach Migration: **0 PROJ-11-Befunde** (verbleibt projektweit nur `auth_leaked_password_protection`, manueller Auth-Schalter, nicht PROJ-11-spezifisch).

**⚠️ Umgebungs-/CI-Hinweis (kein Code-Bug):** `npm test` (Vitest Default-Pool `forks`) bricht in dieser lokalen Umgebung mit „Failed to start forks worker / Timeout waiting for worker to respond" ab — **betrifft auch die bestehenden PROJ-3-Tests**, ist also nicht durch PROJ-11 verursacht. Mit `npx vitest run --pool=threads` laufen **20/20 grün**. Empfehlung für `/qa`/CI: Pool auf `threads` setzen (oder Ursache des Fork-Spawns in dieser Umgebung klären).

## QA Test Results

**Tested:** 2026-06-26
**Tester:** QA Engineer (AI) + manuelle Bestätigung durch Nutzer
**Methoden:** Unit-Tests (Vitest), Build/TypeScript, HTTP-Verhaltens-/Sicherheitschecks, Code-Review der Server-Aktionen, DB-Verifikation (aus Backend-Schritt), manueller Browser-Smoke-Test. Automatisierte E2E-Tests sind geschrieben, lokal aber nicht ausführbar (Umgebung, siehe Hinweis).

### Acceptance Criteria Status

**Anzeigen & Leerzustand**
- [x] Liste alphabetisch + „Gruppe hinzufügen" (manueller Smoke-Test + Code-Review)
- [x] Startgruppen „Fitness"/„Familie" vorhanden (manuell bestätigt + DB-Seed verifiziert)
- [x] Leerzustand-Hinweis (Code-Review: `ProductGroupManager` Empty-State mit `Tags`-Icon)
- [x] Nicht eingeloggt → /login (HTTP 307 verifiziert)

**Anlegen**
- [x] Gültiger Name → erscheint in Liste + Erfolgsmeldung (manuell bestätigt)
- [x] Leerer Name → Validierungsmeldung (Unit-Test + Zod-Schema)
- [x] Duplikat (case-insensitive/getrimmt) → abgewiesen (manuell „fitness" bestätigt + Unit-Test + DB-`23505`)
- [x] Name > 60 Zeichen → Validierungsmeldung (Unit-Test + DB-Check-Constraint)

**Umbenennen**
- [x] Gültiger neuer Name → aktualisiert + Erfolgsmeldung (manuell bestätigt)
- [x] Leer/Duplikat/zu lang → dieselben Regeln, keine Änderung (Unit-Test inkl. Self-Exclude)

**Löschen**
- [x] Gruppe ohne Marken → Bestätigungsdialog vor Entfernen (manuell bestätigt)
- [x] Bestätigen → entfernt + Erfolgsmeldung (manuell bestätigt)
- [x] Abbrechen → bleibt bestehen (Code-Review: AlertDialog)
- [x] Gruppe mit zugeordneten Marken → Löschen blockiert mit Hinweis (Code-Review: Vorzählung `brands` + FK-`23503`; greift voll mit PROJ-4)

**Speichern & Audit**
- [x] Audit-Spalten serverseitig gesetzt (Backend: Trigger `product_groups_set_audit` verifiziert)
- [x] Speicherfehler → Fehlermeldung, Eingabe bleibt (Code-Review: Fehlerpfade in Aktionen + Form-Toast)

### Security Audit Results
- [x] Route-Schutz serverseitig: produktgruppen → HTTP 307 → /login (nicht nur clientseitig)
- [x] RLS nach PROJ-1-Konvention: anon Default-Deny, authenticated voll (Backend verifiziert, 0 Advisor-Befunde)
- [x] Eindeutigkeit auf DB-Ebene (Unique-Index `lower(trim(name))`) als letzte Sicherung gegen Races
- [x] Audit-Trigger-Funktion gehärtet (EXECUTE entzogen, nur per Trigger)

### Automatisierte Tests
- **Unit (Vitest):** 20/20 grün mit `npx vitest run --pool=threads` (Default-Pool `forks` hängt in dieser Umgebung — Umgebungsproblem, kein Code-Bug).
- **E2E (Playwright):** `tests/PROJ-11-produktgruppen-verwalten.spec.ts` (Route-Schutz) geschrieben. ⚠️ Lokal nicht ausführbar (Bundled-Chromium-Install hängt; System-Chrome erreicht localhost nicht — Umgebungsproblem). Für CI vorgesehen.

### Bugs Found
- **Keine.** (0 Critical, 0 High, 0 Medium, 0 Low)
- **Behoben während QA (Infrastruktur, kein Feature-Bug):** Hängender Dev-Server aus früherer Sitzung blockierte Port 3000 + veralteter `.next/dev/lock` → Zombie-Prozesse beendet, Lock entfernt, Server frisch gestartet.

### Summary
- **Acceptance Criteria:** 16/16 verifiziert (Unit-Tests + Code-Review + DB-Verifikation + manueller Smoke-Test)
- **Bugs:** 0
- **Security:** Pass (serverseitiger Route-Schutz, RLS Default-Deny, DB-Unique, gehärteter Trigger)
- **Production Ready:** YES
- **Recommendation:** PROJ-11 freigeben. E2E-Suite bei Gelegenheit in sauberer Umgebung/CI ausführen. Lösch-Sperre wird mit PROJ-4 (brands-Tabelle + FK ON DELETE RESTRICT) vollständig wirksam.

## Deployment
_To be added by /deploy_
