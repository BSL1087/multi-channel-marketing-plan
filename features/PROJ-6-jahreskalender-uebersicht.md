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
- [ ] **Filter** (Produktgruppe/Marke; Marketplace vs. eigener Webshop) als Folge-Feature — der Webshop-Filter braucht ein **Typ-Feld am Kanal** (PROJ-3 erweitern).
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
