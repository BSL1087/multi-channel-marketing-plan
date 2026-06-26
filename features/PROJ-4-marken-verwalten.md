# PROJ-4: Marken verwalten (mit Farbe)

## Status: Approved
**Created:** 2026-06-25
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — für DB, RLS und Audit-Spalten (`created_by`/`created_at`/`updated_by`/`updated_at`).
- Requires: PROJ-2 (Login / Team-Zugang) — für eingeloggten Zugang und serverseitig geschützte Seiten.
- Requires: PROJ-11 (Produktgruppen verwalten) — liefert die Liste der Produktgruppen, der jede Marke zugeordnet wird. **Hinweis:** PROJ-11 wurde im Zuge dieses Specs neu angelegt (Status Roadmap) und muss vor dem produktiven Einsatz von PROJ-4 spezifiziert und gebaut werden.

## User Stories
- Als **Team-Mitglied** möchte ich eine Liste aller Marken mit ihrer Farbe und Produktgruppe sehen, damit ich den Überblick über alle Marken habe, für die wir Aktionen planen.
- Als **Team-Mitglied** möchte ich eine neue Marke anlegen (Name + Farbe + Produktgruppe), damit die Marke später im Jahreskalender (PROJ-6) farblich wiedererkennbar und nach Gruppe filterbar ist.
- Als **Team-Mitglied** möchte ich die Farbe einer Marke frei wählen (Hex-Farbwähler), damit ich gut unterscheidbare Farben für meine Marken vergeben kann.
- Als **Team-Mitglied** möchte ich eine bestehende Marke bearbeiten (Name, Farbe, Produktgruppe ändern), damit ich Tippfehler korrigieren, die Farbe anpassen oder die Marke einer anderen Gruppe zuordnen kann.
- Als **Team-Mitglied** möchte ich eine Marke löschen (mit Sicherheitsabfrage), damit nicht mehr genutzte Marken die Übersicht nicht überladen.
- Als **Team-Mitglied** möchte ich beim ersten Aufruf einen klaren Hinweis sehen, wenn noch keine Marke (oder noch keine Produktgruppe) existiert, damit ich weiß, was ich zuerst tun muss.

## Out of Scope
- **Produktgruppen-Verwaltung (CRUD)** → **PROJ-11**. PROJ-4 ordnet Marken nur einer bestehenden Gruppe zu (Dropdown) und legt selbst keine Gruppen an/um/löscht sie. Verhalten beim Löschen einer Produktgruppe, die noch Marken enthält, wird in PROJ-11 entschieden.
- **Verknüpfung mit Rabatt-Aktionen** (eine Marke trägt Aktionen) → PROJ-5. PROJ-4 verwaltet nur die Marken-Stammdaten.
- **Warnung beim Löschen einer Marke mit zukünftig geplanten Aktionen** → kommt mit PROJ-5, da es dort erst Aktionen gibt (hier als Anforderung vorgemerkt).
- **Logo-/Bild-Upload je Marke** → PROJ-10 (Logo-Uploads).
- **Kalender-/Timeline-Darstellung der Marken** und die Filterung nach Produktgruppe/Marke → PROJ-6 (Jahreskalender).
- **Harte Farb-Eindeutigkeit / kuratierte Farbpalette** — bewusst verworfen, weil deutlich mehr als 20 Marken erwartet werden und sich mehr als ~20 Farben im Kalender ohnehin kaum unterscheiden lassen. Stattdessen freier Hex-Picker mit weicher Warnung (siehe Product Decisions).
- **Suche/Filter in der Markenliste** — angesichts vieler Marken voraussichtlich bald nützlich, aber nicht MVP-kritisch; zurückgestellt (siehe Open Questions).
- **Admin-only-Löschen / Rollen-Konzept** — bewusst nicht enthalten; alle eingeloggten Nutzer sind gleichberechtigt (konsistent mit PRD/PROJ-1, PROJ-3).
- **Manuelle Sortierung der Markenliste** — Liste wird automatisch sortiert (nach Produktgruppe, dann Name); eigene Reihenfolge nicht im MVP.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeigen & Leerzustand
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Marken-Verwaltung öffnet, dann sieht er eine sortierte Liste aller Marken (je Zeile: Farb-Swatch, Name, Produktgruppe) mit einem „Marke hinzufügen"-Button.
- [ ] Angenommen es ist noch keine Marke angelegt, aber mindestens eine Produktgruppe existiert, wenn der Nutzer die Marken-Verwaltung öffnet, dann sieht er einen Leerzustand-Hinweis („Noch keine Marken angelegt …") und einen „Marke hinzufügen"-Button.
- [ ] Angenommen es existiert noch keine Produktgruppe, wenn der Nutzer eine Marke anlegen will, dann sieht er einen Hinweis („Lege zuerst eine Produktgruppe an") mit Link zur Produktgruppen-Verwaltung, und das Anlegen einer Marke ist nicht möglich.
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er die Marken-Verwaltung aufruft, dann wird er zur Login-Seite weitergeleitet.

### Anlegen
- [ ] Angenommen mindestens eine Produktgruppe existiert, wenn der Nutzer „Marke hinzufügen" wählt, einen gültigen Namen eingibt, eine Produktgruppe auswählt und speichert, dann erscheint die neue Marke in der Liste und es wird eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der Nutzer öffnet den „Marke anlegen"-Dialog, wenn der Dialog erscheint, dann ist bereits eine Vorschlags-Farbe gesetzt, die der Nutzer über einen Hex-Farbwähler ändern kann.
- [ ] Angenommen das Namensfeld ist leer, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird keine Marke angelegt.
- [ ] Angenommen keine Produktgruppe ausgewählt ist, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird keine Marke angelegt.
- [ ] Angenommen eine Marke mit demselben Namen existiert **bereits in derselben Produktgruppe** (Groß-/Kleinschreibung und führende/abschließende Leerzeichen ignoriert), wenn der Nutzer speichert, dann erscheint eine Hinweismeldung („Marke existiert bereits in dieser Gruppe") und es wird kein Duplikat angelegt.
- [ ] Angenommen derselbe Name existiert bereits in einer **anderen** Produktgruppe, wenn der Nutzer speichert, dann wird die Marke normal angelegt (gruppenweite Eindeutigkeit, keine globale).
- [ ] Angenommen der Name ist länger als 60 Zeichen, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und es wird keine Marke angelegt.
- [ ] Angenommen die gewählte Farbe wird exakt bereits von einer anderen Marke verwendet, wenn der Nutzer speichert, dann erscheint ein Hinweis („Farbe wird bereits von Marke X genutzt"), das Speichern ist aber nach Bestätigung möglich (keine Blockade).

### Bearbeiten
- [ ] Angenommen eine Marke existiert, wenn der Nutzer sie bearbeitet (Name, Farbe und/oder Produktgruppe ändert) und gültige Werte speichert, dann werden die Änderungen in der Liste übernommen und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der Nutzer ändert beim Bearbeiten die Produktgruppe, wenn in der Zielgruppe bereits eine Marke mit demselben Namen existiert, dann erscheint die Duplikat-Hinweismeldung und es wird nichts geändert.
- [ ] Angenommen der neue Name ist leer, ein gruppeninternes Duplikat oder zu lang, wenn der Nutzer speichert, dann gelten dieselben Validierungsregeln wie beim Anlegen und es wird nichts geändert.

### Löschen
- [ ] Angenommen eine Marke existiert, wenn der Nutzer „Löschen" wählt, dann erscheint zuerst ein Bestätigungsdialog (mit Markenname), bevor die Marke entfernt wird.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer bestätigt, dann wird die Marke aus der Liste entfernt und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer abbricht, dann bleibt die Marke unverändert bestehen.

### Speichern & Audit
- [ ] Angenommen eine Marke wird angelegt oder geändert, wenn die Operation gespeichert wird, dann werden die Audit-Spalten (`created_by`/`created_at` bzw. `updated_by`/`updated_at`) automatisch serverseitig gesetzt.
- [ ] Angenommen das Speichern schlägt fehl (z.B. Verbindungsfehler), wenn der Nutzer speichert, dann erscheint eine Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Leerer / nur-Leerzeichen-Name** → Validierungsmeldung, keine Marke angelegt (Name wird vor der Prüfung getrimmt).
- **Keine Produktgruppe ausgewählt** → Validierungsmeldung (Pflichtfeld).
- **Noch gar keine Produktgruppe vorhanden** → Marken-Anlegen gesperrt, Hinweis + Link zur Produktgruppen-Verwaltung (PROJ-11).
- **Duplikat innerhalb derselben Gruppe (case-insensitive, getrimmt)** → „Protein X", „protein x", „ Protein X " gelten in derselben Gruppe als dieselbe Marke; Anlegen/Bearbeiten wird abgelehnt. In einer anderen Gruppe ist der Name zulässig.
- **Name zu lang (> 60 Zeichen)** → Validierungsmeldung.
- **Exakt gleiche Farbe wie eine andere Marke** → weicher Hinweis, Speichern nach Bestätigung möglich (nie blockiert).
- **Produktgruppe beim Bearbeiten wechseln und dadurch Namens-Kollision in der Zielgruppe** → Duplikat-Hinweis, keine Änderung.
- **Gleichzeitiges Bearbeiten:** Zwei Nutzer ändern dieselbe Marke → der zuletzt gespeicherte Stand gewinnt (Last-Write-Wins); kein Sperrmechanismus im MVP.
- **Marke wird gelöscht, während ein anderer Nutzer sie gerade bearbeitet** → beim Speichern erscheint ein Hinweis, dass die Marke nicht mehr existiert; die Liste wird aktualisiert.
- **Zugeordnete Produktgruppe wird (in PROJ-11) gelöscht, während Marken darauf verweisen** → Verhalten wird in PROJ-11 final entschieden (z.B. Löschen blockieren, solange Marken zugeordnet sind); aus Sicht von PROJ-4 hier nur vorgemerkt.
- **Netzwerk-/Serverfehler beim Speichern oder Löschen** → Fehlermeldung, der ursprüngliche Zustand bleibt erhalten.
- **Löschen einer Marke mit zukünftig geplanten Aktionen** → in PROJ-4 nicht relevant (noch keine Aktionen); ab PROJ-5 muss vor dem Löschen gewarnt werden (siehe Out of Scope).

## Technical Requirements
- Security: Zugriff nur für eingeloggte Nutzer; RLS nach PROJ-1-Konvention (anon → kein Zugriff; authenticated → Lesen/Schreiben/Löschen).
- Security: Geschützte Seite serverseitig absichern (nicht nur clientseitig ausblenden), analog PROJ-2/PROJ-3.
- Daten: Audit-Spalten (`created_by`, `created_at`, `updated_by`, `updated_at`) gemäß PROJ-1-Konvention, serverseitig automatisch gesetzt.
- Daten: Eindeutigkeit der Marke pro Produktgruppe (case-insensitive, getrimmt) zusätzlich auf DB-Ebene erzwingen (letzte Sicherung gegen gleichzeitiges Anlegen).
- Daten: Farbe als gültiger Hex-Wert speichern (z.B. `#RRGGBB`); Validierung im Formular und auf DB-Ebene (Check-Constraint).
- UX: Speicher-/Löschaktionen mit Ladezustand; Rückmeldungen via Toast (sonner, bereits vorhanden).
- UI: shadcn/ui-Komponenten wiederverwenden (Card, Table, Input, Label, Button, Dialog, AlertDialog, Form, Select) — keine Eigenbauten. Für den Hex-Farbwähler nativen `<input type="color">` bzw. eine leichtgewichtige Lösung nutzen (Architektur-Entscheidung in `/architecture`).

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] **Suche/Filter in der Markenliste:** Bei vielen Marken (deutlich > 20) wird eine Suche oder ein Gruppen-Filter in der Verwaltungsliste vermutlich schnell nützlich. Im MVP zurückgestellt — soll es als eigenes kleines Folge-Feature aufgenommen werden?
- [ ] **Löschen einer Produktgruppe mit zugeordneten Marken:** Genaues Verhalten (blockieren vs. Marken verschieben) wird in PROJ-11 entschieden; betrifft PROJ-4 nur indirekt.
- [ ] **Warnung bei Löschung einer Marke mit Aktionen:** Genaues Verhalten (blockieren vs. nur warnen) wird in PROJ-5 final entschieden, sobald Aktionen mit Marken verknüpft sind.

## Decision Log
<!-- Record of conscious decisions made and why. Added to by /write-spec and /architecture. -->

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Produktgruppen werden ein eigenes Feature (PROJ-11), nicht Teil von PROJ-4 | Eigenständige CRUD-Entität (anlegen/umbenennen/löschen wie Kanäle); unabhängig testbar/deploybar → Single Responsibility | 2026-06-25 |
| Jede Marke wird genau einer Produktgruppe zugeordnet (Pflichtfeld) | Der Jahreskalender (PROJ-6) filtert nach Produktgruppe; ohne Zuordnung wäre eine Marke nicht filterbar | 2026-06-25 |
| Bei leerer Produktgruppen-Liste ist Marken-Anlegen gesperrt (Hinweis + Link) | Verhindert verwaiste Marken ohne Gruppe; führt den Nutzer zur korrekten Reihenfolge (erst Gruppe, dann Marke) | 2026-06-25 |
| Freier Hex-Farbwähler statt kuratierter Palette | Es werden deutlich mehr als 20 Marken erwartet; eine endliche Palette mit harter Eindeutigkeit würde das Anlegen blockieren, und > ~20 Farben sind ohnehin kaum unterscheidbar | 2026-06-25 |
| Vorschlags-Farbe beim Anlegen vorbelegt | Nutzer muss nicht zwingend selbst eine Farbe wählen; schnelleres Anlegen, trotzdem änderbar | 2026-06-25 |
| Weiche Warnung bei exakt gleicher Farbe (nie blockierend) | Konsistent mit der App-Philosophie „warnen, nicht blockieren"; hilft, unnötige Farb-Kollisionen zu vermeiden, ohne das Anlegen zu verhindern | 2026-06-25 |
| Markenname eindeutig **pro Produktgruppe** (case-insensitive, getrimmt), nicht global | Gewünschte Flexibilität: gleicher Name in verschiedenen Gruppen erlaubt; innerhalb einer Gruppe wären Dubletten verwirrend | 2026-06-25 |
| Voller CRUD: Anlegen, Bearbeiten (inkl. Gruppen-Wechsel), Löschen | Bearbeiten vermeidet Löschen+Neuanlegen; Löschen hält die Liste sauber | 2026-06-25 |
| Löschen mit Bestätigungsdialog | Schutz vor versehentlichem Entfernen, analog PROJ-3 | 2026-06-25 |
| Max. Namenslänge 60 Zeichen | Verhindert Layout-Probleme in der späteren Timeline-Ansicht (PROJ-6); konsistent mit PROJ-3 | 2026-06-25 |
| Löschen/Bearbeiten für alle eingeloggten Nutzer (kein Rollen-Konzept) | Konsistent mit PRD/PROJ-1 „alle gleichberechtigt im MVP" | 2026-06-25 |
| Automatische Sortierung (Produktgruppe, dann Name), keine manuelle Reihenfolge | Einfach und vorhersehbar; manuelles Sortieren nicht MVP-relevant | 2026-06-25 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene `brands`-Tabelle in Supabase, Muster wie PROJ-3/PROJ-11 | Team-weit geteilte Stammdaten; Grundlage für Aktionen (PROJ-5) und Kalender (PROJ-6) | 2026-06-26 |
| Server Component + Server-Aktionen (kein `/api`-Endpunkt) | Schreiben/Löschen mit Nutzer-Sitzung (RLS greift); konsistent mit Kanälen/Gruppen | 2026-06-26 |
| Nativer `<input type="color">` als Hex-Wähler | Kein neues Paket; erfüllt freie Farbwahl; liefert immer gültiges `#rrggbb` | 2026-06-26 |
| Eindeutigkeit **pro Gruppe** auf DB-Ebene (Unique-Index auf `product_group_id` + `lower(trim(name))`) | Letzte Sicherung gegen Races; erlaubt gleichen Namen in anderer Gruppe | 2026-06-26 |
| Farbe als DB-Check-Constraint (`^#[0-9A-Fa-f]{6}$`) | Verhindert ungültige Farbwerte auch bei direktem DB-Zugriff | 2026-06-26 |
| Fremdschlüssel `product_group_id` → `product_groups(id)` **ON DELETE RESTRICT** | Erfüllt den PROJ-11-Vertrag (Lösch-Sperre der Gruppe entsteht genau hier) | 2026-06-26 |
| Weiche Farb-Kollisionswarnung nur App-seitig (live im Formular), keine DB-Regel | „Warnen statt blockieren"; nennt die kollidierende Marke, Speichern bleibt möglich | 2026-06-26 |
| Geteiltes Modul `brand-validation.ts`; `isDuplicateName` aus `channel-validation` wiederverwendet, plus `isDuplicateBrandInGroup` | Server-Aktion und Formular nutzen dieselben Regeln; keine Dopplung | 2026-06-26 |
| Audit-Spalten serverseitig per Trigger | Übernimmt PROJ-1/PROJ-3/PROJ-11-Konvention | 2026-06-26 |
| Keine neuen Pakete | Card, Table, Dialog, AlertDialog, Form, Input, Label, Button, Select, sonner, react-hook-form, zod bereits installiert | 2026-06-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-26

### Überblick
PROJ-4 folgt 1:1 dem Bauplan von PROJ-3/PROJ-11 (eigene Tabelle + geschützte Verwaltungsseite mit Anlegen/Bearbeiten/Löschen über Server-Aktionen). Zusätzlich: ein **Farb-Attribut** (nativer Hex-Picker, weiche Kollisionswarnung) und eine **Pflicht-Zuordnung zu einer Produktgruppe** (Select, befüllt aus PROJ-11). Die `brands`-Tabelle trägt den Fremdschlüssel mit `ON DELETE RESTRICT` und macht damit die in PROJ-11 vorbereitete Lösch-Sperre scharf. Keine neuen Pakete.

### Seiten- & Komponenten-Struktur
```
/tools/multi-channel-marketing/marken   (geschützte Stammdaten-Seite)
└── Seite "Marken verwalten"
    ├── Kopfzeile: Titel + Zurück-Link zum Dashboard
    ├── "Marke hinzufügen"-Button
    ├── Marken-Liste (Table, sortiert nach Gruppe, dann Name)
    │   └── je Zeile: Farb-Swatch · Name · Produktgruppe · "Bearbeiten" · "Löschen"
    ├── Leerzustand A: keine Marke (Gruppen vorhanden) → Hinweis + "hinzufügen"
    ├── Leerzustand B: keine Produktgruppe → Hinweis + Link zur Produktgruppen-Verwaltung (Anlegen gesperrt)
    ├── Dialog "Marke anlegen / bearbeiten": Name · Farbwähler (Vorschlagsfarbe) · Produktgruppen-Select
    │   └── weiche Farb-Kollisionswarnung (nennt die kollidierende Marke; blockiert nicht)
    └── Bestätigungsdialog "Marke löschen?"

Route-Schutz (aus PROJ-2): nicht eingeloggt → /login
Dashboard (/) bekommt eine vierte Kachel „Marken verwalten".
```

Geplante Bausteine (analog `product-group-*`): `brand-manager` (Liste + Dialoge orchestrieren), `brand-form-dialog` (Anlegen **und** Bearbeiten, ein Dialog), `delete-brand-dialog`, sowie `brand-validation.ts` (geteilte Regeln).

### Datenmodell (in einfacher Sprache)
**Marke (`brands`):**
- Eindeutige ID
- **Name** — Pflicht, max. 60 Zeichen
- **Farbe** — Pflicht, gültiger Hex-Wert `#RRGGBB`
- **Produktgruppe** — Pflicht, verweist auf eine bestehende Gruppe (PROJ-11)
- erstellt von / erstellt am · zuletzt geändert von / zuletzt geändert am

Gespeichert in: **Supabase**, eigene Tabelle, RLS wie PROJ-1. Eindeutigkeit des Namens **pro Gruppe** (case-insensitive/getrimmt), zusätzlich DB-seitig. Farbe per DB-Check-Constraint validiert.

**Beziehung zu Produktgruppen (PROJ-11):** Jede Marke verweist auf genau eine Gruppe; der Fremdschlüssel ist `ON DELETE RESTRICT` → eine Gruppe mit zugeordneten Marken kann nicht gelöscht werden (macht die PROJ-11-Sperre wirksam).

**Sicherheits-Regelwerk (RLS), wie PROJ-1/PROJ-3/PROJ-11:** anon → kein Zugriff; eingeloggt → volles Lesen/Schreiben/Löschen.

### Abläufe (was passiert wann)
- **Liste:** Beim Öffnen serverseitig laden (mit Gruppennamen), sortiert nach Gruppe, dann Name. Keine Gruppe vorhanden → Leerzustand B; Gruppen aber keine Marke → Leerzustand A.
- **Anlegen/Bearbeiten:** Dialog mit Name, Farbwähler (Vorschlagsfarbe vorbelegt), Gruppen-Select → Validierung (Pflicht, Länge, Hex, Duplikat pro Gruppe) → Speichern → Liste aktualisiert, Erfolgsmeldung. Live-Warnung, wenn die Farbe exakt schon vergeben ist (nennt die Marke), Speichern bleibt möglich.
- **Löschen:** Bestätigungsdialog → bei Bestätigung entfernt. (Warnung bei verknüpften Aktionen kommt erst mit PROJ-5.)
- **Fehlerfälle:** Verbindungs-/Serverfehler → Toast, Eingabe bleibt; zwischenzeitlich gelöschte Marke beim Bearbeiten → Hinweis; Duplikate von Oberfläche und DB abgewiesen.

### Benötigte Pakete
Keine neuen. Wiederverwendet: `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner` sowie shadcn/ui Card, Table, Dialog, AlertDialog, Form, Input, Label, Button, Select. Farbwähler = natives Browser-Element.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Keine Produktgruppen-CRUD (PROJ-11) — nur Zuordnung per Dropdown.
- Keine Verknüpfung mit Aktionen (PROJ-5), kein Logo-Upload (PROJ-10), keine Kalender-Darstellung (PROJ-6).
- Kein Rollen-/Rechtekonzept; keine harte Farb-Eindeutigkeit.

## Implementation Notes (Frontend)
**Stand:** 2026-06-26

**Seite (Server Component):**
- `src/app/tools/multi-channel-marketing/marken/page.tsx`: geschützt (Auth-Check + Redirect zu `/login`). Lädt Marken (mit Produktgruppen-Name via Join `product_groups(name)`) und die Gruppenliste parallel, mappt den Join auf `product_group_name`, übergibt an `BrandManager`. Kopfzeile mit „Zurück zum Dashboard".

**Server-Aktionen:**
- `src/app/tools/multi-channel-marketing/marken/actions.ts`: `createBrand`, `updateBrand`, `deleteBrand` („use server"). Geteilte `validate()`-Funktion (Name/Farbe/Gruppe), Duplikat-Prüfung **pro Gruppe** (App-seitig + DB-`23505`), Auth-Check je Aktion, `revalidatePath`. `updateBrand` erkennt zwischenzeitlich gelöschte Marken (leeres `update().select()`). Typen `Brand`, `BrandInput`, `BrandActionResult`, `BrandDeleteResult`.

**Client-Komponenten (shadcn/ui, keine Eigenbauten):**
- `src/components/brand-manager.tsx`: Liste (`Table` mit Farb-Swatch · Name · Gruppe · Bearbeiten · Löschen), sortiert nach Gruppe dann Name; Leerzustand A (keine Marke), **Leerzustand B (keine Gruppe → Anlegen gesperrt, Link zur Produktgruppen-Verwaltung)**.
- `src/components/brand-form-dialog.tsx`: Anlegen **und** Bearbeiten (ein Dialog). Name, **Produktgruppen-`Select`**, **nativer `<input type="color">`** mit vorbelegter Vorschlagsfarbe (`suggestColor` meidet bereits genutzte Farben). **Weiche, live Farb-Kollisionswarnung** (nennt die kollidierende Marke; blockiert nicht). Duplikat-Fehler als Feldmeldung, sonst Toast.
- `src/components/delete-brand-dialog.tsx`: `AlertDialog`-Bestätigung mit Markenname.

**Geteilte Validierung:**
- `src/lib/brand-validation.ts`: `brandNameSchema` (1–60, getrimmt), `brandColorSchema` (`#RRGGBB`), `productGroupIdSchema` (uuid), `isDuplicateBrandInGroup` (pro Gruppe); `isDuplicateName` aus `channel-validation` re-exportiert.

**Dashboard-Einstieg:**
- `src/app/page.tsx`: vierte Kachel „Marken verwalten" (Icon `Tag`) → `/tools/multi-channel-marketing/marken`.

**Verifikation:** `tsc --noEmit` fehlerfrei; `next build` erfolgreich (Route `/tools/multi-channel-marketing/marken` dynamisch erkannt).

**⚠️ Offen für `/backend`:** Tabelle `public.brands` existiert noch nicht — die Seite ist gebaut, aber zur Laufzeit erst nach der Migration funktionsfähig. `/backend` muss anlegen (Muster wie `product_groups`):
- Tabelle `brands`: `id`, `name`, `color` (text), `product_group_id` (uuid), Audit-Spalten.
- **Fremdschlüssel** `product_group_id` → `product_groups(id)` **ON DELETE RESTRICT** (macht die PROJ-11-Lösch-Sperre scharf).
- **Check-Constraints:** `length(trim(name)) between 1 and 60`; `color ~ '^#[0-9A-Fa-f]{6}$'`.
- **Unique-Index pro Gruppe**, case-insensitive/getrimmt: auf (`product_group_id`, `lower(trim(name))`) — App verlässt sich auf `23505`.
- **Audit-Trigger** (wie `product_groups_set_audit`), RLS nach PROJ-1-Konvention (anon: kein Zugriff; authenticated: voll).
- Optional: Unit-Tests für `brand-validation.ts` (analog `product-group-validation.test.ts`).

## Implementation Notes (Backend)
**Stand:** 2026-06-26 — Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Datenbank (Migration `create_brands_table`):** Tabelle `public.brands`, Muster wie `product_groups`/`marketplaces`.
- Spalten: `id` (uuid, PK, `gen_random_uuid()`), `name` (text), `color` (text), `product_group_id` (uuid, **NOT NULL**), Audit `created_by`/`created_at`/`updated_by`/`updated_at`.
- **Fremdschlüssel** `product_group_id` → `product_groups(id)` **ON DELETE RESTRICT** → macht die in PROJ-11 vorbereitete Lösch-Sperre scharf.
- `created_by`/`updated_by` → `auth.users(id)` mit `ON DELETE SET NULL`.
- Check-Constraints: `brands_name_check` (`length(trim(name)) >= 1 and length(name) <= 60`), `brands_color_check` (`color ~ '^#[0-9A-Fa-f]{6}$'`).
- **Unique-Index pro Gruppe**, case-insensitive/getrimmt: `brands_name_per_group_unique_idx` auf (`product_group_id`, `lower(trim(name))`) → gleicher Name in anderer Gruppe erlaubt; App fängt `23505`.
- Zusatz-Index `brands_product_group_id_idx` für FK-Lookups (PROJ-11-Lösch-Zählung, Joins).
- **Audit-Trigger** `brands_set_audit` (BEFORE INSERT/UPDATE) via `set_brands_audit()`: setzt `created_by`/`updated_by = auth.uid()` + Zeitstempel serverseitig; `created_*` bei Updates unveränderlich; `EXECUTE` entzogen (nur per Trigger).
- **RLS** aktiviert; 4 Policies für `authenticated` (SELECT/INSERT/UPDATE/DELETE, `auth.uid() is not null`); `anon` ohne Policy → Default-Deny.

**Funktionsprüfung (SQL, 6/6 bestanden):** gültiger Insert ✓; Duplikat in gleicher Gruppe (`  qa marke `) → `unique_violation` ✓; gleicher Name in anderer Gruppe → erlaubt ✓; ungültige Farbe (`red`) → `check_violation` ✓; Name > 60 → `check_violation` ✓; **Gruppe mit Marke löschen → `foreign_key_violation` (Lösch-Sperre scharf)** ✓. Testdaten wieder entfernt (`brands` = 0).

**Security-Advisors:** keine `brands`-Befunde. Projektweit verbleibt nur `auth_leaked_password_protection` (manueller Auth-Schalter, nicht feature-spezifisch).

**Tests:** `src/lib/brand-validation.test.ts` (Vitest): 18 Unit-Tests (Name-, Farb-, UUID-Schema + Duplikat pro Gruppe inkl. Self-Exclude/Gruppenwechsel-Clash). **Gesamtsuite 33/33 grün** mit `npx vitest run --pool=threads`. Keine `/api`-Routen (Server Actions + RLS), daher keine Route-Integrationstests — analog PROJ-1/2/3/11.

**Hinweis:** Migration direkt über den Supabase-MCP angewandt (die `/backend`-Skill war wegen Root-Workspace-Scoping nicht als Slash-Command verfügbar; Vorgehen folgt 1:1 dem dokumentierten Backend-Vertrag).

## QA Test Results

**Tested:** 2026-06-26
**Tester:** QA Engineer (AI) + manuelle Bestätigung durch Nutzer
**Methoden:** Unit-Tests (Vitest), Build/TypeScript, HTTP-Route-Schutz, funktionale DB-Verifikation (Backend), Code-Review, manueller Browser-Smoke-Test. E2E-Spec geschrieben, lokal nicht ausführbar (Umgebung).

### Acceptance Criteria Status

**Anzeigen & Leerzustand**
- [x] Liste mit Farb-Swatch · Name · Gruppe + „Marke hinzufügen" (Smoke-Test + Code-Review)
- [x] Leerzustand „keine Marke" (Code-Review: `BrandManager`)
- [x] Leerzustand „keine Produktgruppe" → Anlegen gesperrt + Link (Code-Review; Fitness/Familie vorhanden, daher manuell nicht ausgelöst)
- [x] Nicht eingeloggt → /login (HTTP 307 verifiziert)

**Anlegen**
- [x] Name + Gruppe + Speichern → erscheint + Erfolgsmeldung (Smoke-Test)
- [x] Vorschlagsfarbe vorbelegt, per Hex-Picker änderbar (Smoke-Test + Code-Review)
- [x] Leerer Name → Validierung (Unit-Test + Zod)
- [x] Keine Gruppe → Validierung (Unit-Test `productGroupIdSchema` + Select-Pflicht)
- [x] Duplikat in gleicher Gruppe → abgewiesen (Smoke-Test + Unit-Test + DB-`23505`)
- [x] Gleicher Name in anderer Gruppe → erlaubt (Smoke-Test + Unit-Test + DB-Check)
- [x] Name > 60 → Validierung (Unit-Test + DB-Check-Constraint)
- [x] Exakt gleiche Farbe → weiche Warnung, Speichern möglich (Smoke-Test + Code-Review)

**Bearbeiten**
- [x] Name/Farbe/Gruppe ändern → übernommen (Smoke-Test)
- [x] Gruppenwechsel mit Namens-Kollision → Duplikat-Hinweis (Unit-Test Self-Exclude/Clash)
- [x] Leer/Duplikat/zu lang beim Bearbeiten → dieselben Regeln (Unit-Test + Code-Review)

**Löschen**
- [x] Bestätigungsdialog vor Entfernen (Smoke-Test)
- [x] Bestätigen → entfernt + Erfolgsmeldung (Smoke-Test)
- [x] Abbrechen → bleibt bestehen (Code-Review AlertDialog)

**Speichern & Audit**
- [x] Audit-Spalten serverseitig gesetzt (Backend: Trigger `brands_set_audit` verifiziert)
- [x] Speicherfehler → Fehlermeldung, Eingabe bleibt (Code-Review Fehlerpfade)

### Security Audit Results
- [x] Route-Schutz serverseitig: `/marken` → HTTP 307 → /login
- [x] RLS nach PROJ-1-Konvention: anon Default-Deny, authenticated voll (0 brands-Advisor-Befunde)
- [x] Farbe per DB-Check-Constraint (`^#[0-9A-Fa-f]{6}$`); Name-Länge per Check-Constraint
- [x] Eindeutigkeit pro Gruppe per Unique-Index (`lower(trim(name))`) — Race-sicher
- [x] **Gruppen-Lösch-Sperre scharf:** FK `ON DELETE RESTRICT` per SQL bestätigt (`foreign_key_violation`)
- [x] Audit-Trigger-Funktion gehärtet (EXECUTE entzogen)

### Automatisierte Tests
- **Unit (Vitest):** 33/33 grün mit `npx vitest run --pool=threads` (davon 18 für `brand-validation`).
- **Funktionale DB-Checks:** 6/6 bestanden (siehe Backend-Notizen).
- **E2E (Playwright):** `tests/PROJ-4-marken-verwalten.spec.ts` (Route-Schutz) geschrieben. ⚠️ Lokal nicht ausführbar (Umgebung) — für CI vorgesehen.

### Bugs Found
- **Keine.** (0 Critical, 0 High, 0 Medium, 0 Low)
- **Behoben während QA (Infrastruktur, kein Feature-Bug):** Hängender Dev-Server (Port 3000) → Zombie-Prozesse beendet, `.next/dev/lock` entfernt, frisch gestartet.
- **Offen (projektweit, nicht PROJ-4):** Advisor `auth_leaked_password_protection` (manueller Auth-Schalter im Dashboard) — Low, nicht blockierend.

### Summary
- **Acceptance Criteria:** alle verifiziert (Unit-Tests + DB-Checks + Code-Review + manueller Smoke-Test)
- **Bugs:** 0
- **Security:** Pass (serverseitiger Route-Schutz, RLS Default-Deny, DB-Constraints, FK-Lösch-Sperre, gehärteter Trigger)
- **Production Ready:** YES
- **Recommendation:** PROJ-4 freigeben. E2E-Suite bei Gelegenheit in sauberer Umgebung/CI ausführen.

## Deployment
_To be added by /deploy_
