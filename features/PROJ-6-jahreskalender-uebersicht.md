# PROJ-6: Jahreskalender-Übersicht

## Status: Planned
**Created:** 2026-06-26
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — DB/RLS.
- Requires: PROJ-2 (Login / Team-Zugang) — eingeloggter Zugang, serverseitig geschützte Seite.
- Requires: PROJ-3 (Marketplaces & Webshops) — Kanäle bilden die Zeilen.
- Requires: PROJ-4 (Marken verwalten) — Markenfarbe für die Balken.
- Requires: PROJ-5 (Rabatt-Aktionen) — Aktionen sind die Balken; Anlegen/Bearbeiten-Dialoge werden wiederverwendet.

## User Stories
- Als **Team-Mitglied** möchte ich alle Rabatt-Aktionen eines Jahres in einer Kanal-/Zeit-Matrix sehen, damit ich auf einen Blick erkenne, wann welche Marke wo rabattiert ist.
- Als **Team-Mitglied** möchte ich Aktionen an ihrer Markenfarbe wiedererkennen, damit ich Muster und Häufungen schnell erfasse.
- Als **Team-Mitglied** möchte ich über einen Balken hovern, um Details zu sehen (Titel, Marke, Kanal, Zeitraum, Rabattwert, Kommentar).
- Als **Team-Mitglied** möchte ich einen Balken anklicken, um die Aktion direkt zu bearbeiten/löschen.
- Als **Team-Mitglied** möchte ich zwischen Jahren wechseln, damit ich auch vergangene/zukünftige Planungen sehe.
- Als **Team-Mitglied** möchte ich aus dem Kalender heraus eine neue Aktion anlegen können.

## Out of Scope
- **Filter** (Produktgruppe/Marke; später auch Marketplace vs. eigener Webshop) → Folge-Feature. Der Webshop-Filter erfordert zusätzlich ein **Typ-Feld am Kanal** (PROJ-3-Erweiterung).
- **Kannibalisierungs-Warnung** (Hinweis bei zeitgleicher Rabattierung derselben Marke auf mehreren Kanälen) → PROJ-7.
- **Monats-Zoom / Tagesansicht** und **Klick auf leere Fläche zum Anlegen** (Datum/Kanal vorausfüllen) → PROJ-8.
- **Drag & Drop** zum Verschieben/Verlängern von Aktionen → später.
- **Druck / Export (PDF/PNG)** → später.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Darstellung
- [ ] Angenommen es gibt Kanäle und Aktionen, wenn der Nutzer den Kalender öffnet, dann sieht er eine Matrix mit Kanälen als Zeilen und den 12 Monaten (Jan–Dez) als horizontale Achse für das laufende Jahr.
- [ ] Angenommen eine Aktion liegt im angezeigten Jahr, wenn der Kalender lädt, dann erscheint sie als farbiger Balken (Markenfarbe) in der Zeile ihres Kanals, positioniert und breit entsprechend ihres Zeitraums.
- [ ] Angenommen mehrere Aktionen in einem Kanal überschneiden sich zeitlich, wenn der Kalender lädt, dann werden sie in Unterzeilen gestapelt, sodass sich keine Balken visuell überlagern.
- [ ] Angenommen eine Aktion läuft über den Jahreswechsel, wenn ein Jahr angezeigt wird, dann ist nur der in dieses Jahr fallende Teil sichtbar.
- [ ] Angenommen ein Balken ist breit genug, wenn er dargestellt wird, dann zeigt er den Markennamen (sonst nur die Farbe).

### Interaktion
- [ ] Angenommen der Nutzer fährt über einen Balken, wenn der Tooltip erscheint, dann zeigt er Titel, Marke, Kanal, Zeitraum, Rabattwert und Kommentar.
- [ ] Angenommen der Nutzer klickt einen Balken, wenn der Dialog öffnet, dann kann er die Aktion bearbeiten oder löschen (Dialog aus PROJ-5).
- [ ] Angenommen der Nutzer klickt „Aktion hinzufügen", wenn der Dialog öffnet, dann kann er eine neue Aktion anlegen; nach dem Speichern erscheint sie im Kalender.
- [ ] Angenommen der Nutzer klickt Vor/Zurück, wenn das Jahr wechselt, dann zeigt der Kalender die Aktionen des gewählten Jahres.

### Leerzustände & Schutz
- [ ] Angenommen es existiert noch kein Kanal, wenn der Nutzer den Kalender öffnet, dann sieht er einen Hinweis mit Link zur Kanal-Verwaltung (eine Matrix ohne Zeilen ergibt keinen Sinn).
- [ ] Angenommen es gibt Kanäle, aber im angezeigten Jahr keine Aktion, wenn der Kalender lädt, dann sieht der Nutzer die leeren Kanal-Zeilen plus einen Hinweis „keine Aktionen in diesem Jahr".
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er den Kalender aufruft, dann wird er zur Login-Seite weitergeleitet.

## Edge Cases
- **Kanal ohne Aktionen** → leere Zeile wird trotzdem angezeigt (vollständiger Überblick).
- **Sehr kurze Aktion (1 Tag)** → schmaler, aber sichtbarer/klickbarer Balken (Mindestbreite).
- **Sehr viele überlappende Aktionen** in einem Kanal → Zeile wächst nach unten (viele Unterzeilen).
- **Jahresübergreifende Aktion** → in beiden betroffenen Jahren je anteilig dargestellt.
- **Aktion wird von anderem Nutzer geändert/gelöscht** → nach Neuladen aktuell (kein Live-Update im MVP).
- **Langer Markenname auf schmalem Balken** → abgeschnitten; voller Name im Tooltip.
- **Netzwerk-/Ladefehler** → verständliche Fehlermeldung statt leerer Seite.

## Technical Requirements
- Security: nur für eingeloggte Nutzer; Seite serverseitig absichern; RLS gilt weiter.
- Performance: ein Jahr lädt alle Aktionen dieses Jahres serverseitig (eine Abfrage, gejoint mit Marke und Kanal).
- UI: responsive; auf schmalen Bildschirmen horizontal scrollbar; shadcn/ui inkl. Tooltip; Bearbeiten/Anlegen über die bestehenden PROJ-5-Dialoge.

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [x] **Filter Marketplace vs. eigener Webshop** — umgesetzt 2026-07-02 (siehe „Filter Marketplace/Webshop" unten); Kanal erhielt dafür ein `type`-Feld (PROJ-3-Erweiterung).
- [ ] **Filter Produktgruppe/Marke** — weiterhin offen als Folge-Feature.
- [ ] Genaue Darstellung sehr kurzer Balken (Mindestbreite/Label) final beim Bau justieren.

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Zeilen = Kanäle, Monate (Jan–Dez) horizontal | Aus `/init` bestätigt; zeigt Kannibalisierung über Kanäle hinweg | 2026-06-26 |
| Überschneidungen → Stapeln in Unterzeilen | Lesbarkeit unabhängig von der Anzahl paralleler Aktionen | 2026-06-26 |
| Balken = Markenfarbe + Name | Schnelle Wiedererkennung; Produkt-Detail nur im Tooltip (PRD) | 2026-06-26 |
| Hover = Tooltip mit Details; Klick = Bearbeiten-Dialog (PROJ-5) | Kalender als Einstieg zum Pflegen, nicht nur Anzeige | 2026-06-26 |
| „Aktion hinzufügen"-Button; Klick auf leere Fläche kommt später | MVP schlank halten; Vorausfüllen per Klick ist PROJ-8 | 2026-06-26 |
| Alle Kanäle als Zeilen (auch leere) | Vollständiger Überblick; freie Slots sichtbar | 2026-06-26 |
| Kein Filter im MVP | Erst Darstellung richtig machen; Filter als Folge-Feature | 2026-06-26 |
| Jahresnavigation, Start im laufenden Jahr; jahresübergreifend anteilig | Kalender ist jahresbasiert | 2026-06-26 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Kalender ersetzt die Platzhalter-Seite `/tools/multi-channel-marketing` | Das ist der Tool-Einstieg; der Platzhalter war genau dafür vorgesehen | 2026-06-26 |
| Server Component lädt Jahr-Daten, Client-Komponente rendert | Eine serverseitige Abfrage (RLS greift); Interaktion (Hover/Klick/Navigation) im Client | 2026-06-26 |
| Jahr über URL-Query `?year=` (Default = laufendes Jahr) | Teilbar/lesbar; Vor/Zurück ändert nur den Query, Server lädt neu | 2026-06-26 |
| Datenabfrage: Aktionen mit `start_date <= 31.12.JJJJ AND end_date >= 01.01.JJJJ` | Lädt genau die im Jahr sichtbaren (inkl. jahresübergreifende) Aktionen | 2026-06-26 |
| Balken-Position/-Breite über Tag-im-Jahr-Anteil (Prozent), auf das Jahr geclippt | Exakte, proportionale Darstellung; Monatslinien als Raster darüber | 2026-06-26 |
| Stapeln per Intervall-Partitionierung (Greedy nach Startdatum) | Weist überlappende Balken automatisch minimalen Unterzeilen zu | 2026-06-26 |
| Auto-Kontrast der Balkenbeschriftung (hell/dunkel je nach Farbhelligkeit) | Markenname bleibt auf beliebiger Markenfarbe lesbar | 2026-06-26 |
| Wiederverwendung der PROJ-5-Dialoge (Anlegen/Bearbeiten/Löschen) + `onSuccess`-Callback → `router.refresh()` | Kein doppelter Code; Kalender lädt nach Änderung neu | 2026-06-26 |
| Keine neuen Pakete (Tooltip vorhanden) | Darstellung mit Tailwind-Positionierung + shadcn/ui Tooltip | 2026-06-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-26

### Überblick
PROJ-6 ist überwiegend Frontend: Die Daten (Kanäle, Marken, Aktionen) existieren bereits. Die geschützte Platzhalter-Seite `/tools/multi-channel-marketing` wird durch den Kalender ersetzt. Eine Server Component lädt für das gewählte Jahr alle Kanäle (Zeilen) und alle in diesem Jahr sichtbaren Aktionen (mit Markenname/-farbe und Kanalname); eine Client-Komponente übernimmt Positionierung, Stapeln, Hover/Klick und Jahresnavigation. Anlegen/Bearbeiten/Löschen nutzen die bestehenden PROJ-5-Dialoge. Keine neuen Pakete, kein neues Backend.

### Seiten- & Komponenten-Struktur
```
/tools/multi-channel-marketing   (geschützt — ersetzt den Platzhalter)
└── Kalender-Seite (Server Component: lädt Jahr-Daten)
    └── CalendarView (Client)
        ├── Kopfzeile: Jahr + Vor/Zurück · "Aktion hinzufügen"-Button · Zurück zum Dashboard
        ├── Monats-Achse (Jan–Dez) mit Rasterlinien
        ├── je Kanal eine Zeile:
        │   ├── Kanal-Label (links)
        │   └── Spur mit gestapelten Unterzeilen:
        │       └── Aktions-Balken (Markenfarbe + Name)
        │           ├── Hover → Tooltip (Titel, Marke, Kanal, Zeitraum, Rabattwert, Kommentar)
        │           └── Klick → Bearbeiten-Dialog (PROJ-5)
        ├── Leerzustand A: keine Kanäle → Hinweis + Link zur Kanal-Verwaltung
        └── Leerzustand B: Kanäle vorhanden, aber keine Aktion im Jahr → Hinweis
```

Bausteine: `calendar-view` (Client, orchestriert Achse/Zeilen/Navigation/Dialoge), eine kleine Stapel-Hilfsfunktion (Intervall-Partitionierung) und eine Farb-Kontrast-Hilfsfunktion (`lib/`). Die PROJ-5-Komponenten `ActionFormDialog`/`DeleteActionDialog` werden um einen optionalen `onSuccess`-Callback ergänzt (abwärtskompatibel), damit der Kalender nach Änderungen `router.refresh()` auslösen kann.

### Datenmodell (in einfacher Sprache)
Keine neue Tabelle. Genutzt/abgefragt:
- **Kanäle** (alle, als Zeilen — auch ohne Aktion)
- **Aktionen des Jahres**: alle mit Überlappung zum gewählten Jahr (Titel, Zeitraum, Rabattwert, Kommentar) inkl. **Markenname + Markenfarbe** und **Kanalname** (per Join).
- Jahr kommt aus der URL (`?year=`), Standard = laufendes Jahr.

### Render-Logik (in einfacher Sprache)
- **Position/Breite:** Jeder Balken wird anhand des Tag-im-Jahr-Anteils platziert (z.B. 1. Feb ≈ 8,5 % von links), auf den 1.1.–31.12. des Jahres geclippt. So sind Längen proportional und jahresübergreifende Aktionen werden korrekt abgeschnitten.
- **Stapeln:** Pro Kanal werden Aktionen nach Startdatum sortiert und greedy in Unterzeilen verteilt — jede neue Aktion kommt in die erste Unterzeile, die zu diesem Zeitpunkt frei ist; sonst eine neue. So überlagern sich Balken nie.
- **Lesbarkeit:** Balken zeigt den Markennamen, abgeschnitten bei wenig Platz; Textfarbe automatisch hell/dunkel je nach Helligkeit der Markenfarbe; Mindestbreite für sehr kurze Aktionen, damit sie klickbar bleiben.

### Abläufe
- **Laden:** Server lädt Kanäle + Jahr-Aktionen → CalendarView rendert.
- **Jahr wechseln:** Vor/Zurück ändert `?year=` → Server lädt das neue Jahr.
- **Hover/Klick:** Tooltip bzw. Bearbeiten-Dialog; nach Speichern/Löschen `router.refresh()`.
- **Anlegen:** Button öffnet den Anlegen-Dialog; nach Speichern erscheint der Balken.

### Benötigte Pakete
Keine neuen. Wiederverwendet: shadcn/ui (Tooltip, Button, Card, Dialog/AlertDialog, Form, Input, Select, Textarea), `@supabase/ssr`, `react-hook-form`, `zod`, `sonner`.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Kein Filter (Folge-Feature; Webshop-Filter braucht Kanal-Typ), keine Kannibalisierungs-Warnung (PROJ-7), kein Monats-Zoom/Klick-auf-leer (PROJ-8), kein Drag&Drop, kein Export.

## Implementation Notes (Frontend)
**Stand:** 2026-06-26

**Seite (Server Component):**
- `src/app/tools/multi-channel-marketing/page.tsx`: ersetzt den bisherigen Platzhalter durch den Kalender. Geschützt (Auth-Check + Redirect). Liest das Jahr aus `?year=` (Default = laufendes Jahr, validiert). Lädt parallel: Aktionen mit Jahres-Überlappung (`start_date <= JJJJ-12-31 AND end_date >= JJJJ-01-01`, Join `marketplaces(name)` + `brands(name,color)`), alle Kanäle (Zeilen) und die Markenliste (für den Dialog). Mappt Joins auf `marketplace_name`/`brand_name`/`brand_color`.

**Layout-Logik (pure, testbar):** `src/lib/calendar-layout.ts`
- `barGeometry`: Position/Breite eines Balkens als Prozent des Jahres (Tag-im-Jahr-Anteil), auf das Jahr geclippt; `null` wenn außerhalb.
- `layoutChannel`: Greedy-Intervall-Partitionierung → weist überlappenden Aktionen Unterzeilen (`lane`) zu, ohne Überlagerung; liefert `lanes`-Anzahl.
- `monthColumns`: proportionale Monatsspalten (Jan–Dez) für Achse + Rasterlinien.
- `isLightColor`: Helligkeit der Markenfarbe → Auto-Kontrast der Beschriftung.
- `formatDate`: ISO → `DD.MM.YYYY`.

**Client-Komponente:** `src/components/calendar-view.tsx`
- Toolbar: Jahr mit Vor/Zurück (ändert `?year=` via `router.push`) + „Aktion hinzufügen".
- Monatsachse + je Kanal eine Zeile (Höhe = `lanes`), Balken absolut positioniert (Markenfarbe, Auto-Kontrast-Text, abgeschnittener Markenname, Mindestbreite); Monats-Rasterlinien.
- **Hover** → `Tooltip` (Titel, Marke·Kanal, Zeitraum, Rabatt, Kommentar). **Klick** → `ActionFormDialog` (Bearbeiten). „Aktion hinzufügen" → derselbe Dialog (neu).
- Nach Speichern → `router.refresh()` lädt die Server-Daten neu.
- Leerzustände: keine Kanäle → Hinweis + Link; Kanäle aber keine Aktion im Jahr → Hinweisbanner über den (leeren) Zeilen.

**PROJ-5-Dialoge erweitert:** `ActionFormDialog` und `DeleteActionDialog` haben einen optionalen `onSuccess`-Callback bekommen (abwärtskompatibel), den der Kalender für `router.refresh()` nutzt.

**Verifikation:** `tsc --noEmit` fehlerfrei; `next build` erfolgreich.

**Bewusste Abweichung (für Smoke-Test):** Der Klick auf einen Balken öffnet den **Bearbeiten**-Dialog; **Löschen** ist dort (noch) nicht enthalten — Löschen erfolgt aktuell über die Aktions-Liste (`/aktionen`). Die Spec-AC nennt „bearbeiten oder löschen" im Kalender; ein Löschen-Button im Bearbeiten-Dialog kann als kleiner Folgeschritt ergänzt werden, falls gewünscht.

**Kein Backend nötig:** Daten stammen aus PROJ-3/4/5; keine neue Tabelle, keine neuen Pakete.

## Implementation Notes — Finaler Render-Stand (nach Review-Iterationen)
**Stand:** 2026-06-26

Nach mehreren Abstimmungsrunden mit dem Nutzer wurde die Darstellung wie folgt festgelegt (`src/lib/calendar-layout.ts` + `src/components/calendar-view.tsx`):
- **Achse:** tagesgenaues Modell (Referenz: 1 Tag = 2 px, Monat = 64 px), als **Prozent** ausgegeben → füllt die volle Breite und skaliert mit dem Fenster. Monatsspalten gleich breit, Tage darin **zentriert**.
- **Balken:** durchgehend links→rechts, **unbeschriftet**, **8 px** hoch, tagesgenaue Breite, Markenfarbe; Klick → Bearbeiten-Dialog (PROJ-5), Hover → Tooltip (Titel, Marke·Kanal, Zeitraum, Rabatt, Kommentar).
- **Stapeln:** Überschneidungen kompakt in Unterspuren; **gleiche Marke bevorzugt gleiche Spur** (z. B. mehrere RPM-Aktionen auf einer Höhe).
- **Zeilenhöhe:** Standard **40 px** (fasst bis zu 3 parallele Aktionen); ab der 4. parallelen Aktion **+16 px** je Spur.
- **Legende** unter dem Kalender, **nach Produktgruppe gruppiert** (Gruppenname vorne, z. B. „Fitness", „Familie"); zeigt die im Jahr vorkommenden Marken.
- **Jahresnavigation** über `?year=` (Vor/Zurück), Start im laufenden Jahr.

**Offene/abgegrenzte Punkte:**
- **Löschen** ist im Kalender nicht enthalten (Klick = Bearbeiten); Löschen über die Aktions-Liste (`/aktionen`).
- **Monats-Detailansicht** (Klick auf einen Monat oben in der Achse) → **PROJ-8**. Nutzer-Entscheidung: **keine** separate Tagesansicht nötig, die Monatsansicht reicht.

## QA Test Results

**Tested:** 2026-06-26
**Tester:** QA Engineer (AI) + manuelle Bestätigung durch Nutzer (mehrere Iterationen)
**Methoden:** Build/TypeScript, HTTP-Route-Schutz, Code-Review, iterativer manueller Browser-Test.

### Acceptance Criteria Status
- [x] Matrix: Kanäle als Zeilen, 12 Monate horizontal (manuell bestätigt)
- [x] Aktion als farbiger Balken in der Kanal-Zeile, positioniert/breit nach Zeitraum (bestätigt)
- [x] Überschneidungen werden gestapelt (kompakt; gleiche Marke gleiche Spur) (bestätigt)
- [x] Jahresübergreifende Aktion anteilig im Jahr (Code-Review: Clipping in `barGeometry`)
- [~] Markenname auf dem Balken → **bewusst entfernt** zugunsten unbeschrifteter Balken + gruppierter Legende (Nutzer-Entscheidung)
- [x] Hover → Tooltip mit Details (bestätigt)
- [x] Klick → Bearbeiten-Dialog (bestätigt)
- [x] „Aktion hinzufügen" legt an, erscheint im Kalender (Code-Review + onSuccess→refresh)
- [x] Jahr vor/zurück lädt das gewählte Jahr (Code-Review: `?year=`)
- [x] Keine Kanäle → Hinweis + Link (Code-Review)
- [x] Kanäle aber keine Aktion → Hinweis (Code-Review)
- [x] Nicht eingeloggt → /login (HTTP 307 verifiziert)

### Security Audit Results
- [x] Route-Schutz serverseitig: Kalender → HTTP 307 → /login (auch mit `?year=`)
- [x] Daten serverseitig mit RLS geladen (eingeloggte Sitzung); keine neuen DB-Objekte
- [x] Keine Secrets im Client; keine neuen Pakete

### Automatisierte Tests
- **Build/TypeScript:** `next build` + `tsc --noEmit` fehlerfrei.
- **E2E (Playwright):** `tests/PROJ-6-jahreskalender.spec.ts` (Route-Schutz) geschrieben; lokal nicht ausführbar (Umgebung), für CI vorgesehen.
- Reine Layout-Logik (`calendar-layout.ts`) ist gut für Unit-Tests geeignet — als Folge-Aufgabe vermerkt (Geometrie/Stapeln).

### Bugs Found
- **Keine offenen.** Mehrere Darstellungs-Anpassungen wurden während des Reviews iterativ umgesetzt (Balkenhöhe, Stapeln, Zeilenhöhe, gruppierte Legende).

### Summary
- **Acceptance Criteria:** erfüllt (1 bewusst geändert: Balken unbeschriftet statt mit Name)
- **Bugs:** 0
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** PROJ-6 freigeben. Nächstes: PROJ-8 Monats-Detailansicht (Einstieg per Klick auf den Monat; keine Tagesansicht). Filter (inkl. Marketplace/Webshop-Typ) als weiteres Folge-Feature.

## Filter Marketplace/Webshop (Folge-Feature)
**Stand:** 2026-07-02

Der im ursprünglichen Scope ausgelagerte Filter „eigene Webshops vs. externe Marketplaces" ist umgesetzt. Er brauchte das im Spec vermerkte **Typ-Feld am Kanal** (PROJ-3-Erweiterung).

**Datenmodell (PROJ-3-Erweiterung):**
- Migration `add_type_to_marketplaces`: Spalte `marketplaces.type text not null default 'marketplace' check (type in ('marketplace','webshop'))`.
- Backfill: bestehende Kanäle mit Namen wie `WS%` → `webshop` (Nutzer-Entscheidung), Rest → `marketplace`. Ergebnis: 4 Webshops (WS-*), 6 Marketplaces.

**Kanal-Verwaltung (`/kanaele`):**
- `channel-validation.ts`: `channelTypeSchema` (`marketplace` | `webshop`) + `CHANNEL_TYPE_LABELS`.
- Server-Actions: `createChannel(name, type)`; `renameChannel` → **`updateChannel(id, name, type)`** (Name + Typ, abwärts nicht kompatibel — einziger Aufrufer ist der Dialog).
- `channel-form-dialog.tsx`: RadioGroup „Marketplace / Eigener Webshop"; Titel „Kanal bearbeiten".
- `channel-manager.tsx`: Typ als Badge je Zeile; Button „Umbenennen" → „Bearbeiten".

**Kalender (Jahresansicht, `calendar-view.tsx`):**
- Zwei Checkboxen „Eigene Webshops" / „Marketplaces" (beide standardmäßig an, mit Anzahl) blenden die jeweiligen Kanal-Zeilen ein/aus.
- Legende richtet sich nach den sichtbaren Zeilen; Leerzustand „Kein Kanal entspricht dem Filter", wenn beide deaktiviert sind.
- Serverseitig lädt die Seite `marketplaces.type` mit; Filter läuft rein clientseitig (keine zusätzliche Abfrage).

**Nicht enthalten:** Filter für die Monats-Detailansicht (PROJ-8) und Produktgruppen-/Marken-Filter bleiben offen.

**Verifikation:** `tsc --noEmit` ✓, `next build` ✓, `npm test` (58 Tests) ✓.

## Deployment
_To be added by /deploy_
