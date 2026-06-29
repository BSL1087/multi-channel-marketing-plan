# PROJ-8: Monats-Zoom / Tagesansicht

## Status: Approved
**Created:** 2026-06-29
**Last Updated:** 2026-06-29

## Dependencies
- Requires: PROJ-6 (Jahreskalender-Übersicht) — liefert die Kalender-Darstellung, das Layout (`calendar-layout.ts`), die Kanal-Zeilen und den Einstiegspunkt (Klick auf Monatskopf).
- Requires: PROJ-5 (Rabatt-Aktionen) — der geteilte `ActionFormDialog` (Anlegen/Bearbeiten) und `DeleteActionDialog`, die in der Monatsansicht wiederverwendet werden.
- Profitiert von: PROJ-7 (Kannibalisierungs-Warnung) — greift automatisch, da derselbe `ActionFormDialog` genutzt wird.

## User Stories
- Als **Team-Mitglied** möchte ich von der Jahresansicht in einen einzelnen Monat zoomen, damit ich Aktionen tag-genau und lesbar (mit Titel/Marke) sehe, statt nur schmale, unbeschriftete Balken.
- Als **Team-Mitglied** möchte ich im Monat vor- und zurückblättern (inkl. Jahreswechsel), damit ich angrenzende Zeiträume schnell prüfe.
- Als **Team-Mitglied** möchte ich erkennen, an welchem Wochentag eine Aktion startet/endet und wo „heute" liegt, damit ich z. B. Wochenend-Starts und die aktuelle Lage einschätzen kann.
- Als **Marketplace-Manager** möchte ich direkt aus der Monatsansicht eine Aktion anlegen, bearbeiten oder löschen, damit ich nicht die Ansicht wechseln muss.
- Als **Team-Mitglied** möchte ich die aktuelle Ansicht (Jahr/Monat) per URL teilen bzw. mit dem Browser-Zurück navigieren, damit ich gezielt auf einen Monat verlinken kann.

## Out of Scope
- **Filterung nach Produktgruppe/Marke** — bewusst ausgelagert in ein eigenes Feature (gilt dann für Jahr *und* Monat). Siehe PRD-Entscheidung 2026-06-24; neues Feature (z. B. PROJ-12).
- **Echte Einzel-Tagesansicht** (ein Datum → reine Liste aller an dem Tag aktiven Aktionen) — verworfen; „Tagesansicht" meint hier das lesbare Tagesraster innerhalb des Monats.
- **Wochen-/KW-Ansicht** und **Kalenderwochen-Nummern** — nicht im MVP.
- **Drag & Drop / Resize** von Aktionen direkt im Kalender — Änderungen laufen weiter über den Dialog.
- **Dauerhafte Konflikt-Markierung** im Kalender (Icon/Hervorhebung) — eigenes Folge-Feature (vgl. PROJ-7 Out of Scope).
- **Druck-/Export-Ansicht** des Monats.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen der Nutzer ist in der Jahresansicht, wenn er auf eine Monatsüberschrift (z. B. „Feb") klickt, dann öffnet sich die Monatsansicht dieses Monats.
- [ ] Angenommen der Nutzer ist in der Monatsansicht, wenn die Ansicht geladen ist, dann zeigt die Achse jeden Tag des Monats mit Tageszahl (1–n) und Wochentag (Mo–So); Wochenenden sind dezent hinterlegt und der heutige Tag (falls im Monat) ist markiert.
- [ ] Angenommen es gibt Aktionen im angezeigten Monat, wenn die Ansicht geladen ist, dann erscheinen sie als **beschriftete** Balken (Titel + Markenpunkt; Rabattwert im Balken wenn Platz, sonst im Tooltip), je Kanal in einer Zeile und bei Überlappung gestapelt — wie in der Jahresansicht.
- [ ] Angenommen eine Aktion reicht über den Monatsrand hinaus, wenn sie dargestellt wird, dann wird der Balken am Monatsrand abgeschnitten und als „läuft weiter" kenntlich gemacht (z. B. abgeflachte Kante/Pfeil).
- [ ] Angenommen der Nutzer ist in der Monatsansicht, wenn er auf „nächster/voriger Monat" klickt, dann wechselt die Ansicht entsprechend; nach Dezember folgt Januar des Folgejahres (und umgekehrt).
- [ ] Angenommen der Nutzer ist in der Monatsansicht, wenn er „Zurück zur Jahresansicht" wählt, dann landet er in der Jahresansicht des passenden Jahres.
- [ ] Angenommen der Nutzer fährt über einen Balken, wenn der Tooltip erscheint, dann zeigt er die Details der Aktion (Titel, Marke(n), Kanal, Zeitraum, Rabattwert) — wie in der Jahresansicht.
- [ ] Angenommen der Nutzer klickt einen Balken an, wenn der Dialog öffnet, dann kann er die Aktion bearbeiten oder löschen (geteilter `ActionFormDialog` inkl. „Aktion löschen"); nach Speichern/Löschen aktualisiert sich die Monatsansicht.
- [ ] Angenommen der Nutzer ist in der Monatsansicht, wenn er „Aktion hinzufügen" wählt, dann öffnet sich der Anlegen-Dialog mit auf den angezeigten Monat vorbelegten Datumsfeldern.
- [ ] Angenommen im angezeigten Monat gibt es keine Aktionen, wenn die Ansicht geladen ist, dann wird das leere Tagesraster mit einem Hinweis („Keine Aktionen im [Monat Jahr]") angezeigt und „Aktion hinzufügen" bleibt möglich.
- [ ] Angenommen die URL enthält Jahr und Monat (`?year=YYYY&month=MM`), wenn die Seite geladen wird, dann zeigt sie genau diesen Monat; der Browser-Zurück-Button führt zur vorherigen Ansicht.
- [ ] Angenommen die URL enthält einen ungültigen Monat (z. B. `month=13` oder leer), wenn die Seite geladen wird, dann wird auf einen sinnvollen Standard zurückgefallen (aktueller Monat) statt eines Fehlers.

## Edge Cases
- **Monatsrand-Überlauf:** Aktionen, die vor dem 1. beginnen oder nach dem Monatsende enden, werden am Rand abgeschnitten und als fortlaufend markiert (keine falschen Start-/Endkanten).
- **Schaltjahr/Februar:** Tageszahl pro Monat wird korrekt berechnet (28/29/30/31 Tage).
- **Jahresübergang beim Blättern:** Dez → Jan (+1 Jahr), Jan → Dez (−1 Jahr).
- **Ungültige/fehlende URL-Parameter:** `month` außerhalb 1–12 oder `year` außerhalb des erlaubten Bereichs → Fallback auf aktuellen Monat/Jahr (analog `resolveYear` in PROJ-6).
- **Viele überlappende Aktionen auf einem Kanal:** Zeilenhöhe wächst über zusätzliche Lanes (wie Jahresansicht), bleibt lesbar.
- **Kein Kanal angelegt:** gleicher Leer-Hinweis wie in der Jahresansicht (zuerst Kanal anlegen).
- **Sehr lange Titel:** werden im Balken abgeschnitten (Ellipsis); vollständiger Titel im Tooltip.
- **Mobile/schmaler Viewport:** Monat ist auf Tagesauflösung breit → horizontales Scrollen (wie Jahresansicht), Kanal-Label bleibt lesbar.
- **Konflikt beim Anlegen aus dem Monat:** PROJ-7-Warnung greift automatisch (geteilter Dialog).

## Technical Requirements (optional)
- Security: nur eingeloggt; Route-Schutz wie übrige Tool-Seiten (Proxy + serverseitige Prüfung).
- Konsistenz: Wiederverwendung der bestehenden Layout-Logik (`calendar-layout.ts`) und der geteilten Dialoge (`ActionFormDialog`, `DeleteActionDialog`); keine Duplizierung der Aktions-Logik.
- Performance: Monatsansicht lädt nur die für den Monat relevanten Aktionen (überlappend mit dem Monatszeitraum).
- Browser: Chrome, Firefox, Safari; responsive (375/768/1440).

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [x] ~~„Aktion hinzufügen" aus dem Monat — Datum vorbelegen?~~ → Entschieden (Architecture 2026-06-29): **1. des angezeigten Monats** (siehe Technical Decisions).
- [ ] Eigenes Filter-Feature (Produktgruppe/Marke) für Jahr + Monat als nächstes anlegen? (separate Spec)

## Decision Log
<!-- Record of conscious decisions made and why. Added to by /write-spec and /architecture. -->

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Monatsansicht mit lesbarem **Tagesraster** statt separater Einzel-Tagesansicht | Deckt den Kernwunsch (Detail/Lesbarkeit) ab; eine Ansicht statt zwei → weniger Komplexität | 2026-06-29 |
| Einstieg per **Klick auf Monatskopf** in der Jahresansicht + Vor/Zurück + „Zurück zur Jahresansicht" | Nahtloser Zoom-Flow Jahr→Monat ohne separaten Umschalter | 2026-06-29 |
| Ansicht über **URL-Parameter** `?year=YYYY&month=MM` | Teilbar, Browser-Zurück funktioniert, konsistent mit bestehender `?year`-Logik | 2026-06-29 |
| Balken **beschriftet** + volle Interaktion (Hover/Bearbeiten/Löschen/Hinzufügen), Wiederverwendung der geteilten Dialoge | Mehr Platz im Monat nutzbar; kein Ansichtswechsel zum Bearbeiten; PROJ-7-Warnung greift automatisch | 2026-06-29 |
| Tages-Achse mit **Tageszahl + Wochentag + Heute-Marker + Wochenend-Schattierung** (keine KW) | Gute Orientierung ohne Überladung; KW nur bei Bedarf später | 2026-06-29 |
| Monatsrand-Überläufe **abschneiden + als fortlaufend markieren** | Ehrliche Darstellung ohne falsche Start-/Endkanten | 2026-06-29 |
| **Filterung** (Produktgruppe/Marke) **out of scope** → eigenes Feature | Betrifft Jahr *und* Monat; Single Responsibility, Konsistenz | 2026-06-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Reine Frontend-Erweiterung — kein neues Schema, keine neuen Pakete | Monatsansicht nutzt bestehende Daten/Logik/Dialoge; nur eine zusätzliche Darstellung | 2026-06-29 |
| Gleiche Route, gesteuert per URL-Param `?month=MM` (kein neuer Pfad) | Nahtloser Zoom, teilbare Links, Browser-Zurück; minimale Struktur; konsistent mit bestehender `?year`-Logik | 2026-06-29 |
| Neue Client-Komponente `MonthView` parallel zu `CalendarView` | Klar getrennte Verantwortung; Jahresansicht bleibt unverändert/stabil | 2026-06-29 |
| Eigene **reine** Monats-Layout-Helfer; Wiederverwendung nur des Lane-Stapel-Prinzips | Jahres-Helfer (`calendar-layout.ts`) unangetastet; beide getrennt unit-testbar | 2026-06-29 |
| Serverseitiges Laden nur der mit dem Monat überlappenden Aktionen | Performance + Konsistenz mit Jahres-Lademuster | 2026-06-29 |
| Geteilte `ActionFormDialog`/`DeleteActionDialog` wiederverwenden | Bearbeiten/Löschen/Anlegen + PROJ-7-Warnung ohne Duplizierung | 2026-06-29 |
| „Aktion hinzufügen" aus dem Monat: Datumsfelder auf den **1. des angezeigten Monats** vorbelegen | Schließt Open Question; vermeidet Anlegen außerhalb des sichtbaren Monats (z. B. bei Zukunfts-/Vergangenheitsmonaten) | 2026-06-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-29

### Überblick
PROJ-8 ist eine **reine Frontend-Erweiterung** des bestehenden Kalenders — **keine** neue Datenhaltung, **kein** neues Schema, **keine** neuen Pakete. Die Monatsansicht nutzt dieselben Daten und dieselbe serverseitige Datenladung wie die Jahresansicht (PROJ-6) sowie die geteilten Dialoge aus PROJ-5 (`ActionFormDialog`, `DeleteActionDialog`). Dadurch greift die Kannibalisierungs-Warnung (PROJ-7) in der Monatsansicht automatisch mit.

### Routing & Einstieg
- **Gleiche Seite** wie der Jahreskalender (`/tools/multi-channel-marketing`), gesteuert über URL-Parameter:
  - ohne `month` → **Jahresansicht** (wie bisher),
  - mit `?year=YYYY&month=MM` → **Monatsansicht**.
- Die **Monatsüberschriften** der Jahresansicht werden zu Links auf den jeweiligen Monat (Klick-Einstieg).
- Ungültiger/fehlender `month` → Fallback auf den **aktuellen Monat** (analog zur bestehenden `resolveYear`-Logik für das Jahr).
- Teilbar & Browser-Zurück funktionieren, weil der Zustand komplett in der URL liegt.

### Komponenten-Struktur (Übersicht)
```
Kalender-Seite (Server)  — lädt Aktionen/Marken/Kanäle
├── month-Parameter vorhanden?
│   ├── NEIN → CalendarView (Jahr, bestehend)
│   │           └── Monatsköpfe sind jetzt anklickbare Links → ?month=MM
│   └── JA  → MonthView (NEU, Client)
│            ├── Toolbar:  ‹ Monat ›  ·  „Zurück zur Jahresansicht"  ·  „Aktion hinzufügen"
│            ├── Tages-Achse:  Tageszahl + Wochentag · Wochenende schattiert · Heute markiert
│            ├── Kanal-Zeilen
│            │    └── beschriftete Balken (Titel + Markenpunkt + Rabatt)
│            │         ├── am Monatsrand abgeschnitten + „läuft weiter"-Markierung
│            │         ├── Hover → Tooltip (Details)
│            │         └── Klick → Bearbeiten-Dialog (inkl. Löschen)
│            ├── Empty State:  „Keine Aktionen im [Monat Jahr]"
│            └── ActionFormDialog + DeleteActionDialog  (wiederverwendet)
```

### Datenmodell
**Keine Änderung.** Gelesen wie in der Jahresansicht: `discount_actions` (Zeitraum, Kanal), `discount_action_brands` (Marken je Aktion), `marketplaces` (Kanalname), `brands` (Name, Farbe, Produktgruppe). Einziger Unterschied: Es werden nur Aktionen geladen, die sich mit dem **Monatszeitraum** überschneiden (statt mit dem ganzen Jahr). RLS wie bisher.

### Layout-Logik
- Neue, **reine** Hilfsfunktionen für die **Monats-Skala** (lesbare Tagesbreite; Tag→Pixel; Wochentag/Wochenende/Heute; Balken auf den Monat zuschneiden inkl. Überlauf-Markierung).
- **Wiederverwendung des bestehenden Stapel-Prinzips** (greedy Lane-Zuteilung, gleiche Marke bevorzugt dieselbe Lane) aus `calendar-layout.ts` — dieselbe Logik, nur monatsskaliert. Die Jahres-Helfer bleiben unangetastet.

### Tech-Entscheidungen (für PM)
- **Gleiche Route + URL-Parameter** statt neuer Seite → nahtloser Zoom, teilbare Links, Browser-Zurück; minimaler Struktur-Overhead.
- **Serverseitiges Laden pro Monat** (nur überlappende Aktionen) → schnell und konsistent mit der Jahresansicht.
- **Geteilte Dialoge wiederverwenden** → Bearbeiten/Löschen/Anlegen und die PROJ-7-Warnung gibt es „gratis", keine Duplizierung der Aktions-Logik.
- **Eigene Monats-Layout-Helfer** statt die Jahres-Helfer umzubiegen → Jahresansicht bleibt stabil, beide sind getrennt und als reine Funktionen unit-testbar (wie bei PROJ-6).

### Benötigte Pakete
**Keine neuen.** Datumsberechnungen mit nativem `Date`/UTC wie in PROJ-6.

### Hinweis / Abhängigkeit
Die in PROJ-6 schon vorhandene Datenladung (Aktionen + Marken inkl. Produktgruppe/Farbe + Kanäle) ist die Vorlage; für den Monat wird derselbe Lade-/Mapping-Weg mit Monats-Zeitraum verwendet.

## Implementation Notes (Frontend)
**Stand:** 2026-06-29

Umgesetzt gemäß Tech Design — reine Frontend-Erweiterung, kein neues Schema, keine neuen Pakete.

- **`src/lib/month-layout.ts`** (neu, reine Funktionen): `daysInMonth`, `monthName`, `monthTrackWidth`, `monthDays` (Tag + Wochentag + Wochenende + Heute-Marker, `today` injizierbar), `monthBarGeometry` (tag-genaue Pixel + `clippedStart/clippedEnd` für Monatsrand-Überläufe), `layoutMonthChannel` (greedy Lane-Stapelung, gleiche Marke bevorzugt Spur — gleiches Prinzip wie Jahr, monatsskaliert), `resolveMonth` (1-basiert→0-basiert, Fallback aktueller Monat). Jahres-Helfer (`calendar-layout.ts`) unangetastet; `isLightColor`/`formatDate` werden von dort wiederverwendet.
- **`src/lib/month-layout.test.ts`** (neu): 14 Unit-Tests (Schaltjahr, Wochentage/WE/Heute, Geometrie inkl. beidseitigem Clip & 1-Tag-Überlappung, Lane-Stapelung & Spur-Wiederverwendung, `resolveMonth`-Fallbacks).
- **`src/components/month-view.tsx`** (neu, Client): Toolbar (‹ Monat › mit Jahreswechsel, „Zur Jahresansicht", „Aktion hinzufügen"), Tages-Achse (Tag + Wochentag, WE-Schattierung, Heute-Hervorhebung), Kanal-Zeilen mit **beschrifteten** Balken (Titel + Rabatt wenn Platz), Überlauf-Balken mit `‹`/`›` und ohne Eckrundung an der Schnittkante, Hover-Tooltip (wie Jahr), Klick → geteilter `ActionFormDialog` (inkl. Löschen), Legende nach Produktgruppe, Empty-State.
  - **Layout (Feedback 2026-06-29):** **Prozent-basiert** wie die Jahresansicht — der Tagesraster füllt die volle verfügbare Breite (Tage als gleich breite `flex-1`-Spalten mit Mindestbreite, horizontaler Scroll erst bei schmalen Screens). **Zeilenhöhe:** Basis trägt **2 Lanes** ohne zu wachsen; erst ab der **3. überlappenden Aktion** kommt pro Lane Höhe hinzu (fixe Balkenhöhe, kein Stretch).
- **`page.tsx`** (Kalender-Route): verzweigt per URL — `?month` vorhanden → `MonthView`, sonst `CalendarView`. Lädt Aktionen nur für den jeweiligen Zeitraum (Monat bzw. Jahr). Überschrift neutralisiert („Kalender").
- **`calendar-view.tsx`**: Monatsköpfe sind jetzt anklickbare Buttons → `?year=…&month=MM`.
- **`action-form-dialog.tsx`**: optionale Props `defaultStartDate`/`defaultEndDate` — beim Anlegen aus dem Monat auf den **1. des angezeigten Monats** vorbelegt. PROJ-7-Warnung greift automatisch (geteilter Dialog).
- Verifikation: `tsc --noEmit` clean, `npm test` **58/58** grün.

## QA Test Results

**Tested:** 2026-06-29
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Methodik:** Code-Review + statische Typprüfung (`tsc`) + Unit-Suite (`vitest`, inkl. 14 neuer `month-layout`-Tests). Browser-/E2E-Lauf lokal nicht möglich (Projektnotiz: Playwright instabil, localhost-Probe hängt) → Route-Schutz-E2E für CI hinterlegt; UI-Smoke durch Nutzer.

### Akzeptanzkriterien (Code-Review-Bewertung)
- [x] **AC-1** Klick auf Monatskopf → Monatsansicht (`calendar-view` Buttons → `?month`, `page.tsx` rendert `MonthView`).
- [x] **AC-2** Tages-Achse mit Tag + Wochentag, Wochenende schattiert, Heute markiert (`monthDays` + Achsen-Render).
- [x] **AC-3** Beschriftete Balken je Kanal, bei Überlappung gestapelt (`layoutMonthChannel`).
- [x] **AC-4** Monatsrand-Überläufe abgeschnitten + „läuft weiter" (Clip-Flags + `‹`/`›` + entfernte Eckrundung).
- [x] **AC-5** Vor/voriger Monat inkl. Jahreswechsel (Dez→Jan +1, Jan→Dez −1).
- [x] **AC-6** „Zur Jahresansicht" (Link auf `?year=YYYY`).
- [x] **AC-7** Hover-Tooltip mit Details (wie Jahresansicht).
- [x] **AC-8** Klick → Bearbeiten/Löschen (geteilter `ActionFormDialog`), Refresh via `router.refresh`.
- [x] **AC-9** „Aktion hinzufügen" mit auf den **1. des Monats** vorbelegten Datumsfeldern (`defaultStartDate/EndDate`).
- [x] **AC-10** Leerer Monat: Achse + Kanal-Zeilen + Hinweis; „Aktion hinzufügen" bleibt möglich.
- [x] **AC-11** URL `?year&month` zeigt genau diesen Monat; Browser-Zurück funktioniert (URL-getriebene Server-Komponente).
- [x] **AC-12** Ungültiger/leerer `month` → Fallback aktueller Monat (`resolveMonth`, unit-getestet).

### Edge Cases (Code-Review + Unit-Tests)
- [x] Monatsrand-Überlauf beidseitig (unit-getestet).
- [x] Schaltjahr/Februar 28/29 Tage (unit-getestet).
- [x] Jahresübergang beim Blättern.
- [x] Ungültige/fehlende URL-Parameter → Fallback (unit-getestet).
- [x] Viele Überlappungen: Zeilenhöhe wächst ab der 3. Lane.
- [x] Kein Kanal angelegt → Leer-Hinweis.
- [x] Lange Titel → Ellipsis im Balken, voller Titel im Tooltip.
- [x] Mobile/schmal → Mindest-Tagesbreite + horizontaler Scroll.
- [x] Konflikt beim Anlegen aus dem Monat → PROJ-7-Warnung greift (geteilter Dialog).

### Security Audit (Red Team, Code-Ebene)
- [x] **Authentifizierung:** Monatsansicht teilt die geschützte Route; Seite prüft `getUser()` + Proxy-Schutz. Nicht eingeloggt → Redirect `/login`.
- [x] **Autorisierung/RLS:** nur Lesen bestehender Tabellen über die Nutzer-Session; keine neuen Schreibpfade (Anlegen/Bearbeiten/Löschen via bestehende, RLS-geschützte Server-Aktionen).
- [x] **Injection:** URL-Parameter `year`/`month` werden über `Number`-Parsing/Whitelist (`resolveYear`/`resolveMonth`) gehärtet; Datumsgrenzen serverseitig fest formatiert; keine String-Konkatenation in Queries.
- [x] **XSS:** alle dynamischen Inhalte (Titel/Marke/Kanal/Rabatt) als React-Text → auto-escaped.

### Bugs Found

#### BUG-1 (Low): Relativer `href` beim „Zur Jahresansicht"-Link  ✅ VERIFIZIERT 2026-06-29 (kein Bug)
- **Severity:** Low
- **Beschreibung:** Der Zurück-Link nutzt `<Link href={\`?year=${year}\`}>` (query-relativ). Manueller Smoke (Nutzer) bestätigt: führt korrekt in die Jahresansicht, `month`-Param wird nicht mitgeschleppt. **Kein Bug.**

### Regression
- [x] Unit-Suite grün: **58/58** (44 bestehend + 14 neu), keine bestehenden Tests gebrochen.
- [x] `tsc --noEmit` clean.
- [x] Geteilte Komponenten (`ActionFormDialog`/`DeleteActionDialog`) unverändert in der Logik (nur additive Default-Date-Props) → PROJ-5/6/7 nicht beeinträchtigt.

### Manuelle Smoke-Checkliste (vor Approved)
1. Jahr → Klick auf Monatskopf → Monat öffnet sich; Raster füllt volle Breite.
2. ‹ / › blättern (auch Dez→Jan) · „Zur Jahresansicht" führt zurück (BUG-1).
3. Achse: Wochentage, Wochenende grau, Heute markiert (aktueller Monat).
4. Überlauf-Aktion (vor 1./nach Monatsende) → Balken abgeschnitten + Pfeil.
5. Balken-Klick → Bearbeiten/Löschen; „Aktion hinzufügen" → Datum = 1. des Monats.
6. Kanal mit 1–2 Überlappungen kompakt; 3+ → Zeile höher.

### Summary
- **Acceptance Criteria:** 12/12 erfüllt.
- **Bugs Found:** 1 (Low) → **verifiziert, kein Bug**.
- **Security:** Pass (keine Findings auf Code-Ebene).
- **Verifikation:** `tsc` clean, `vitest` 58/58 grün, manueller UI-Smoke (volle Breite, Navigation, Achse, Überlauf, Bearbeiten/Löschen/Anlegen, Zeilenhöhe) durch Nutzer bestätigt.
- **Production Ready:** **YES** — keine offenen Critical/High-Bugs.
- **Recommendation:** **Deploy** → `/deploy`. Kein Backend nötig.

## Deployment
_To be added by /deploy_
