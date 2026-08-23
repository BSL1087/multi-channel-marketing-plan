# PROJ-12: Rabattwert je Marke

## Status: Deployed
**Created:** 2026-08-23
**Last Updated:** 2026-08-23

## Dependencies
- Requires: PROJ-5 (Rabatt-Aktionen) — Aktionen, Formular-Dialog und die n:m-Zwischentabelle `discount_action_brands`, die hier um den Rabattwert erweitert wird.
- Requires: PROJ-4 (Marken verwalten) — Markenliste mit Farbe für den Picker.
- Requires: PROJ-11 (Produktgruppen) — Gruppierung der Marken im Picker bleibt erhalten.
- Betrifft: PROJ-6 (Jahreskalender) und PROJ-8 (Monats-Zoom) — die Balken zeigen künftig den Rabattwert **der jeweiligen Marke**.
- Kein Einfluss auf PROJ-7 (Kannibalisierungs-Warnung): die Überschneidungslogik arbeitet über Marke + Zeitraum, nicht über den Wert.

## Problemstellung
Seit dem Multi-Brand-Update von PROJ-5 (2026-06-28) kann eine Aktion mehrere Marken haben, der Rabattwert hängt aber weiterhin an der **Aktion** (`discount_actions.discount_value`). Damit gilt zwangsläufig ein Wert für alle Marken. Real ist der Wert eine Eigenschaft der **Marke innerhalb der Aktion** — z.B. „Amazon Sommer-Sale: Dooky 20 %, Tega 15 %". Wer heute unterschiedliche Rabatte braucht, muss dieselbe Aktion mehrfach anlegen; das bläht Liste und Kalender auf und macht die Zusammengehörigkeit unsichtbar.

## User Stories
- Als **Abteilungsleiter** möchte ich für jede Marke einer Aktion einen eigenen Rabattwert eintragen, damit ich eine Kampagne mit markenspezifischen Konditionen als **eine** Aktion planen kann.
- Als **Team-Mitglied** möchte ich einen Wert einmal eintragen und auf alle gewählten Marken übernehmen, damit der Normalfall „überall dasselbe" nicht zu Mehrarbeit wird.
- Als **Team-Mitglied** möchte ich den Rabattwert direkt hinter der Marke eintragen, damit Auswahl und Wert an einer Stelle passieren und das Formular nicht länger wird.
- Als **Team-Mitglied** möchte ich in Liste, Kalender und Tooltip sehen, welche Marke welchen Rabatt hat, damit die Werte auch nach dem Speichern nachvollziehbar sind.
- Als **Team-Mitglied** möchte ich beim Bearbeiten einer Aktion die bestehenden Werte vorbefüllt sehen, damit ich nur die Abweichung ändern muss.
- Als **Team-Mitglied** möchte ich, dass meine bestehenden Aktionen unverändert weiterlaufen, damit durch die Umstellung nichts verloren geht.

## Out of Scope
- **Strukturierter Rabattwert** (Prozent vs. Betrag als getrennte Felder) — bleibt bewusst Freitext (PRD-Entscheidung aus PROJ-5, hier unverändert).
- **Entwurfs-/Freigabe-Status** → PROJ-13.
- **Rabatt je Produkt** innerhalb einer Marke — produktspezifische Hinweise bleiben Freitext im Kommentar.
- **Massenbearbeitung** mehrerer Aktionen gleichzeitig.
- **Historie/Änderungsprotokoll** der Rabattwerte → PROJ-9 (Aktivitätsprotokoll).
- **Filter/Suche nach Rabattwert** in der Aktionsliste.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Formular — Auswahl & Eingabe
- [ ] Angenommen der Nutzer öffnet „Aktion hinzufügen", wenn er die Markenliste sieht, dann steht hinter jeder Marke ein eigenes Rabatt-Eingabefeld; die Gruppierung nach Produktgruppe und die zweispaltige Darstellung bleiben erhalten.
- [ ] Angenommen eine Marke ist nicht angehakt, wenn der Nutzer die Liste betrachtet, dann ist ihr Rabattfeld sichtbar, aber gedimmt/inaktiv dargestellt (kein Layout-Sprung beim An- und Abhaken).
- [ ] Angenommen eine Marke ist nicht angehakt, wenn der Nutzer in ihr Rabattfeld tippt, dann wird die Marke automatisch angehakt.
- [ ] Angenommen eine angehakte Marke hat einen Wert, wenn der Nutzer den Haken entfernt, dann bleibt der eingetragene Wert im Feld sichtbar (falls versehentlich), wird aber **nicht** gespeichert.
- [ ] Angenommen mehrere Marken sind gewählt, wenn der Nutzer im Sammel-Feld einen Wert einträgt und „für alle übernehmen" wählt, dann wird dieser Wert in die Rabattfelder **aller aktuell gewählten** Marken geschrieben und kann danach einzeln überschrieben werden.
- [ ] Angenommen die separate Formularzeile „Rabattwert" existierte bisher, wenn der Nutzer das Formular öffnet, dann ist sie entfallen.

### Validierung
- [ ] Angenommen mindestens eine gewählte Marke hat keinen (oder einen nur aus Leerzeichen bestehenden) Rabattwert, wenn der Nutzer speichert, dann wird nicht gespeichert, die betroffenen Felder werden markiert und **eine** zusammenfassende Meldung unter der Markenliste angezeigt (z.B. „3 gewählte Marken ohne Rabattwert").
- [ ] Angenommen keine Marke ist gewählt, wenn der Nutzer speichert, dann erscheint wie bisher „Bitte mindestens eine Marke auswählen." und nichts wird gespeichert.
- [ ] Angenommen ein Rabattwert ist länger als 50 Zeichen, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung am betroffenen Feld und nichts wird gespeichert.
- [ ] Angenommen ein Rabattwert enthält führende/abschließende Leerzeichen, wenn gespeichert wird, dann wird der Wert getrimmt gespeichert.

### Speichern & Bearbeiten
- [ ] Angenommen alle Pflichtangaben sind gültig, wenn der Nutzer speichert, dann wird je gewählter Marke eine Zuordnung **mit ihrem eigenen Rabattwert** gespeichert und eine Erfolgsmeldung angezeigt.
- [ ] Angenommen eine Aktion mit markenspezifischen Werten existiert, wenn der Nutzer sie bearbeitet, dann sind alle Marken vorausgewählt und ihre jeweiligen Werte vorbefüllt.
- [ ] Angenommen der Nutzer ändert beim Bearbeiten nur den Wert einer einzelnen Marke, wenn er speichert, dann bleiben die übrigen Marken und Werte unverändert.
- [ ] Angenommen der Nutzer fügt beim Bearbeiten eine Marke hinzu und entfernt eine andere, wenn er speichert, dann bleibt die Aktion durchgehend bestehen (kein zwischenzeitliches Löschen durch den Cleanup-Trigger aus PROJ-5).

### Anzeige (Liste, Kalender, Tooltip)
- [ ] Angenommen eine Aktion hat mehrere Marken mit unterschiedlichen Werten, wenn der Nutzer die Aktionsliste sieht, dann wird je Marke der Farb-Swatch, der Markenname **und ihr Rabattwert** angezeigt; die bisherige Spalte „Rabattwert" entfällt.
- [ ] Angenommen eine Aktion wird im Jahreskalender dargestellt (ein Balken je Marke), wenn der Nutzer einen Balken betrachtet, dann zeigt der Balken bzw. sein Tooltip den Rabattwert **dieser** Marke.
- [ ] Angenommen ein Balken ist zu schmal für Text, wenn der Nutzer ihn überfährt, dann steht der markenspezifische Wert im Tooltip.
- [ ] Angenommen der Nutzer öffnet den Monats-Zoom (PROJ-8), wenn er eine Aktion sieht, dann gilt dieselbe markenspezifische Darstellung.

### Bestandsdaten (Migration)
- [ ] Angenommen es existieren Aktionen mit einem Wert auf Aktionsebene, wenn die Umstellung ausgeführt wurde, dann hat jede bestehende Marken-Zuordnung genau diesen bisherigen Wert übernommen und keine Zuordnung hat einen leeren Wert.
- [ ] Angenommen die Umstellung ist erfolgt, wenn ein Nutzer eine Bestandsaktion öffnet, dann sieht er dieselben Werte wie vorher — nur jetzt je Marke editierbar.

### Audit
- [ ] Angenommen eine Aktion wird angelegt oder geändert, wenn gespeichert wird, dann werden die Audit-Spalten auf `discount_actions` wie bisher serverseitig gesetzt (auch wenn nur ein markenspezifischer Wert geändert wurde).

## Edge Cases
- **Marke abgewählt, Wert bleibt im Feld** → wird nicht gespeichert; beim erneuten Anhaken vor dem Schließen des Dialogs ist der Wert wieder da.
- **Alle Marken abgewählt** → Validierung „mindestens eine Marke" greift vor dem Speichern; der DB-Cleanup-Trigger aus PROJ-5 bleibt als zweite Absicherung bestehen.
- **Sammel-Feld überschreibt Einzelwerte** → bewusst: „für alle übernehmen" überschreibt auch bereits gefüllte Felder. Der Klick ist explizit, kein Automatismus beim Tippen.
- **Sehr langer Markenname** → Name wird abgeschnitten (mit vollem Namen als `title`), damit das Rabattfeld nicht gequetscht wird. Referenz: längste Marke aktuell „Wolverson Fitness" (17 Zeichen); die Dialogbreite ist so gewählt, dass auch längere Namen plus Feld passen.
- **Sehr langer Rabattwert (bis 50 Zeichen Freitext, z.B. „10 € ab 2 Stück, sonst 5 %")** → Feld scrollt horizontal; volle Anzeige in Liste/Tooltip.
- **Unterschiedliche Werte je Marke** → es wird **keine** Spanne berechnet (Freitext lässt sich nicht zuverlässig vergleichen); jede Marke zeigt ihren eigenen Wert. Der Kalender stellt ohnehin einen Balken je Marke dar.
- **Marke wird gelöscht, während eine Aktion sie referenziert** → unverändert: Cascade; hat die Aktion keine weitere Marke, wird sie durch den Cleanup-Trigger entfernt (PROJ-5-Verhalten bleibt).
- **Gleichzeitiges Bearbeiten derselben Aktion** → Last-Write-Wins wie bisher; die Marken-Zuordnungen werden komplett auf den gesendeten Stand synchronisiert (Upsert-dann-Prune).
- **Netzwerk-/Serverfehler beim Speichern** → Fehlermeldung, alle Eingaben inkl. markenspezifischer Werte bleiben erhalten.
- **Schmaler Viewport** → Markenliste fällt auf eine Spalte; Marke und Rabattfeld bleiben in einer Zeile.

## Technical Requirements
- Daten: Neue Spalte `discount_value` auf `discount_action_brands` (Text, NOT NULL, Check `length(trim(...)) between 1 and 50`) — der Wert gehört zur Zuordnung, nicht zur Aktion.
- Daten: Datenmigration — bisherigen `discount_actions.discount_value` in **jede** zugehörige Junction-Zeile kopieren, danach die Spalte `discount_actions.discount_value` entfernen. Verlustfrei, analog zum Multi-Brand-Umbau.
- Daten: Cleanup-Trigger (`discount_action_brands_cleanup`) und beide `ON DELETE CASCADE`-Beziehungen bleiben unverändert.
- Server: `createAction`/`updateAction` schreiben Zuordnungen inkl. Wert; `updateAction` behält das **Upsert-dann-Prune**-Vorgehen (sonst löscht der Cleanup-Trigger die Aktion beim Bearbeiten).
- Validierung: In `action-validation.ts` wird `brandIds: string[]` zu einer Liste von Paaren (Marken-ID + Rabattwert, min. 1 Eintrag); Wert-Regeln = bisheriges `discountValueSchema`. Formular und Server nutzen weiterhin dasselbe Schema.
- Sicherheit: RLS/Policies der Junction-Tabelle unverändert (PROJ-1-Konvention); keine neuen Rollen.
- UI: Dialogbreite von `sm:max-w-lg` (512 px) auf `sm:max-w-2xl` (672 px). Grund: bei 512 px bleiben je Spalte nur ~82 px für das Eingabefeld (Spalte 221 px − Checkbox 16 − Abstand 8 − längster Markenname ~115), abzüglich Innenabstand ~56 px Textbreite — zu wenig für Freitextwerte. Bei 672 px sind es ~162 px.
- UI: shadcn/ui wiederverwenden (Input, Checkbox, Label, Button, Tooltip) — keine Eigenbauten.
- UI: Gewonnene Höhe — die separate Formularzeile „Rabattwert" entfällt; das Formular wird breiter statt höher.
- Tests: Unit-Tests für das erweiterte Schema (Wert je Marke, fehlender Wert, Länge, Trim) ergänzen; bestehende 44 Tests grün halten.

## Open Questions
- [x] Sollen Titel und Kanal bei der neuen Breite nebeneinander stehen? → **Ja**, nebeneinander (`/architecture`, 2026-08-23).
- [x] Soll das Sammel-Feld vorbefüllt sein? → **Nein**, startet immer leer (`/architecture`, 2026-08-23).
- [x] Braucht die Aktionsliste eine Verdichtung bei vielen Marken? → **Nein**, alle Marken werden ausgeschrieben (`/architecture`, 2026-08-23).
- [ ] Soll das Rabattfeld einer ungehakten Marke per Tastatur erreichbar bleiben (Tab-Reihenfolge) oder übersprungen werden? Barrierefreiheits-Detail, in `/frontend` zu klären.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Rabattwert wandert von der Aktion auf die Marken-Zuordnung | Der Wert ist fachlich eine Eigenschaft der Marke innerhalb der Aktion; die n:m-Tabelle existiert seit dem Multi-Brand-Update bereits | 2026-08-23 |
| Eingabe inline hinter der Marke statt separater Werte-Liste | Auswahl und Wert an einer Stelle; die separate Zeile „Rabattwert" entfällt → Formular wird kürzer statt länger | 2026-08-23 |
| Dialog auf `max-w-2xl` verbreitern | Bei 512 px bleiben nur ~56 px Textbreite fürs Feld — zu wenig für Freitextwerte bis 50 Zeichen | 2026-08-23 |
| Sammel-Feld „für alle übernehmen" bleibt erhalten | Häufigster Fall ist ein einheitlicher Wert; ohne Schnellweg wäre der Normalfall bei 12 Marken zwölfmal Tippen | 2026-08-23 |
| Tippen in ein Rabattfeld hakt die Marke automatisch an | Wer einen Wert einträgt, meint offensichtlich „diese Marke auch" — ein Schritt statt zwei | 2026-08-23 |
| Felder ungehakter Marken bleiben sichtbar (gedimmt) | Verhindert Layout-Sprünge beim An-/Abhaken in einer langen Liste | 2026-08-23 |
| Ein Sammel-Fehlerhinweis statt Fehlertext je Zeile | Mehrere Einzelmeldungen würden die Markenliste auseinanderreißen; roter Rahmen markiert die Felder | 2026-08-23 |
| Keine Spannen-Anzeige („15–20 %") | Rabattwert ist Freitext und nicht zuverlässig vergleichbar; der Kalender zeigt ohnehin einen Balken je Marke, also den echten Wert | 2026-08-23 |
| Rabattwert bleibt Freitext (≤ 50 Zeichen) | PRD-Entscheidung aus PROJ-5 unverändert: mal Prozent, mal Betrag | 2026-08-23 |
| Bestandswert wird auf alle Marken der Aktion kopiert | Verlustfreie Migration; Nutzer sehen nach der Umstellung exakt dieselben Werte | 2026-08-23 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Wert als Spalte an `discount_action_brands` statt eigener Tabelle | Der Wert ist genau eine Eigenschaft der bestehenden n:m-Verbindung; eine dritte Tabelle wäre reiner Overhead | 2026-08-23 |
| Spalte NOT NULL mit Check 1–50 Zeichen (wie bisher `discount_value`) | Gleiche Regel wie vorher, nur an anderer Stelle — keine neuen Grenzwerte, keine „halb gefüllten" Zuordnungen | 2026-08-23 |
| Dreistufige Migration (nullable → backfill → NOT NULL + alte Spalte droppen) | Ein direkter NOT-NULL-Zusatz würde an den 6 Bestandsaktionen scheitern; Backfill vor Verschärfung ist der verlustfreie Weg | 2026-08-23 |
| Kein Rückfallwert auf Aktionsebene (kein „Default + Override") | Zweistufige Semantik macht gespeicherte Werte mehrdeutig; der Sammel-Knopf liefert denselben Komfort mit eindeutigen Daten | 2026-08-23 |
| `updateAction` behält Upsert-dann-Prune | Der Cleanup-Trigger aus PROJ-5 löscht eine Aktion, sobald sie kurzzeitig 0 Marken hat — die Reihenfolge ist Pflicht, nicht Stilfrage | 2026-08-23 |
| Zod-Schema: `brandIds: string[]` → Liste aus Paaren (Marke + Wert), min. 1 | Formular und Server behalten dieselbe Quelle der Wahrheit; die Pflichtwert-Regel gilt damit auch bei direktem Server-Aufruf | 2026-08-23 |
| Wert wird im bestehenden Join mitgeladen (keine zusätzliche Abfrage) | Liste und Kalender holen Marken ohnehin über die Verbindungstabelle | 2026-08-23 |
| Backend **vor** Frontend umsetzen | Umkehrung der üblichen Reihenfolge: ohne die Spalte kann das Formular nicht speichern (bei PROJ-5 lief das Frontend gegen eine noch nicht existierende Tabelle) | 2026-08-23 |
| Titel und Kanal rücken nebeneinander | Nutzt die neue Breite; kompensiert die Höhe der Markenliste, Formular bleibt ohne Scrollen bedienbar | 2026-08-23 |
| Sammel-Feld startet immer leer | Ein vorbefüllter „häufigster Wert" wäre Raterei und würde beim Klick echte Einzelwerte überschreiben | 2026-08-23 |
| Aktionsliste schreibt alle Marken mit Wert aus (keine „+n"-Verdichtung) | Bei aktuell 12 Marken im System ist die Zeile beherrschbar; Verdichtung würde genau die Information verstecken, für die das Feature gebaut wird | 2026-08-23 |
| Keine neuen Pakete, keine neuen Komponenten | Bestehender Dialog, Input und Checkbox reichen; Konvention „shadcn/ui first" | 2026-08-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-08-23

### Überblick
PROJ-12 fügt **keine neue Tabelle** hinzu. Der Rabattwert zieht von der Aktion auf die bereits bestehende Verbindung zwischen Aktion und Marke um — die Tabelle, die seit dem Multi-Brand-Update von PROJ-5 speichert, welche Marken zu einer Aktion gehören. Damit gehört zu jeder Verbindung künftig auch ihr eigener Wert.

Für den Nutzer ändert sich an drei Stellen etwas: **Formular** (Wert wird direkt hinter der Marke eingetragen), **Aktionsliste** (Wert steht am Marken-Eintrag statt in einer eigenen Spalte) und **Kalender/Monats-Zoom** (jeder Balken zeigt den Wert seiner Marke). Alles andere — Anlegen, Bearbeiten, Löschen, Konfliktwarnung, Rechte — bleibt unverändert.

### Seiten- & Komponenten-Struktur
```
/tools/multi-channel-marketing/aktionen   (unverändert geschützt)
└── Aktions-Verwaltung
    ├── Aktions-Liste
    │   └── je Zeile: Titel · Kanal · Zeitraum · Marken MIT Wert · Bearbeiten · Löschen
    │        (bisherige Spalte "Rabattwert" entfällt)
    └── Dialog "Aktion anlegen / bearbeiten"      [breiter: 672 statt 512 px]
        ├── Titel            |  Kanal             ← neu nebeneinander
        ├── Marken-Auswahl (scrollbar, nach Produktgruppe gruppiert)
        │   └── je Marke: Haken · Name · Rabattfeld      ← neu inline
        ├── Sammelzeile: "Wert für alle gewählten Marken übernehmen"
        ├── Sammel-Fehlerhinweis ("3 gewählte Marken ohne Rabattwert")
        ├── Startdatum       |  Enddatum
        └── Kommentar

Mitbetroffen (nur Anzeige):
├── Jahreskalender (PROJ-6): Balken/Tooltip zeigt den Wert DIESER Marke
└── Monats-Zoom (PROJ-8): dieselbe Darstellung
```

Es entstehen **keine neuen Komponenten**. Geändert werden der bestehende Formular-Dialog, die Aktions-Liste und die beiden Kalender-Ansichten. Innerhalb des Formulars kommt eine kleine wiederverwendbare Markenzeile (Haken + Name + Wert) hinzu, damit die Liste nicht unübersichtlich wird.

### Datenmodell (in einfacher Sprache)
**Verbindung Aktion ↔ Marke** (bestehend, wird erweitert):
- Welche Aktion
- Welche Marke
- **Neu: Rabattwert dieser Marke** (Pflicht, Freitext, 1–50 Zeichen)

**Aktion** (bestehend, wird verkleinert):
- Titel · Kanal · Startdatum · Enddatum · Kommentar · Wer/wann angelegt und geändert
- **Entfällt: der bisherige eine Rabattwert der Aktion**

Regeln, die unverändert bleiben: Eine Aktion hat immer mindestens eine Marke; verliert sie ihre letzte Marke, wird sie automatisch entfernt. Wird eine Marke oder ein Kanal gelöscht, verschwinden die zugehörigen Verbindungen mit.

### Umstellung der Bestandsdaten (dreistufig, in einer Migration)
1. Neues Wertfeld an der Verbindung anlegen — zunächst optional, damit nichts bricht.
2. Für jede bestehende Verbindung den bisherigen Wert **ihrer Aktion** eintragen. Danach hat jede Verbindung genau den Wert, den der Nutzer vorher gesehen hat.
3. Feld auf Pflicht setzen (mit Längenregel) und den alten Wert an der Aktion entfernen.

Diese Reihenfolge ist wichtig: Erst wenn Schritt 2 nachweislich alle Verbindungen gefüllt hat, darf Schritt 3 laufen. Nach der Migration muss geprüft werden, dass **keine** Verbindung ohne Wert existiert. Betroffen sind aktuell 6 Aktionen bei 12 Marken — ein überschaubarer, verlustfreier Umzug, genau wie beim Multi-Brand-Update.

### Abläufe (was passiert wann)
- **Anlegen:** Nutzer hakt Marken an (oder tippt direkt in ein Rabattfeld, was die Marke anhakt) → optional Sammelwert übernehmen → Speichern prüft: mindestens eine Marke, **jede gewählte Marke hat einen Wert**, Datumsregel → speichern → je gewählter Marke eine Verbindung mit ihrem Wert.
- **Bearbeiten:** Alle bisherigen Marken sind angehakt und ihre Werte vorbefüllt. Beim Speichern werden die Verbindungen auf den neuen Stand gebracht — erst die neuen/geänderten schreiben, dann die entfernten löschen. Diese Reihenfolge verhindert, dass die Aktion für einen Moment ohne Marke dasteht und automatisch gelöscht wird.
- **Anzeigen:** Liste und Kalender laden den Wert zusammen mit der Marke aus derselben Verbindung — keine zusätzliche Abfrage.
- **Konfliktwarnung (PROJ-7):** unverändert. Sie prüft Marke und Zeitraum, nicht den Wert.

### Warum so (für Nicht-Techniker)
- **Warum nicht einfach mehrere Aktionen anlegen?** Weil dann im Kalender fünf Einträge stehen, die eigentlich eine Kampagne sind — und beim Verschieben des Zeitraums fünfmal geändert werden müssten.
- **Warum wird der Dialog breiter statt höher?** Weil das Rabattfeld sonst nur etwa 56 Pixel Textbreite hätte. Werte wie „10 € ab 2 Stück" wären unlesbar. Mit 672 px sind es ~162 px — und die Zeile „Rabattwert" fällt weg, das Formular passt so ohne Scrollen auf den Bildschirm.
- **Warum bleibt der Wert Freitext?** Weil die Werte real gemischt sind (Prozent, Euro, Staffeln). Eine Aufteilung in „Zahl + Einheit" würde heute funktionierende Einträge unmöglich machen. Folge davon: Es lässt sich keine Spanne („15–20 %") berechnen — braucht es aber auch nicht, weil jede Marke im Kalender ihren eigenen Balken hat.
- **Warum Pflichtwert je Marke statt Rückfallwert?** Ein „Standardwert der Aktion, den einzelne Marken überschreiben" klingt bequem, führt aber zu Einträgen, bei denen unklar ist, ob 20 % bewusst gesetzt oder nur geerbt wurden. Der Sammel-Knopf schreibt den Wert **sichtbar** in alle Felder — gleiche Bequemlichkeit, aber jeder gespeicherte Wert ist eine bewusste Angabe.
- **Warum keine neue Tabelle?** Die Verbindung Aktion↔Marke existiert bereits. Der Wert ist genau eine Eigenschaft dieser Verbindung — er gehört dorthin und nirgendwo anders.

### Benötigte Pakete
Keine neuen. Wiederverwendet werden die bereits installierten Bausteine für Dialog, Eingabefeld, Checkbox, Tooltip und Formular-Validierung.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Keinen Entwurfs-/Freigabe-Status (→ PROJ-13) und keine Änderung an der Konfliktwarnung (PROJ-7).
- Keine Umstellung des Rabattwerts auf ein strukturiertes Feld (Prozent/Betrag getrennt).
- Keine Rabatte unterhalb der Marke (Produktebene) und keine Massenbearbeitung mehrerer Aktionen.
- Keine Änderung an Rechten, Anmeldung oder Datenschutz-Regeln — es kommt kein neuer Datentyp hinzu, nur ein Feld an einer bestehenden Verbindung.

### Reihenfolge der Umsetzung
Frontend und Backend hängen hier eng zusammen, weil das Formular ohne das neue Feld nicht speichern kann. Empfehlung: **Backend zuerst** (Migration inkl. Bestandsdaten), dann Frontend. Das ist die Umkehrung der üblichen Reihenfolge und sollte beim Handoff ausdrücklich erwähnt werden — sonst baut das Frontend gegen ein Feld, das es noch nicht gibt (so wie bei PROJ-5 geschehen).

## Implementation Notes (Backend)
**Stand:** 2026-08-23 — Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Migration `discount_value_per_brand_phase1` (bewusst rein additiv):**
1. `discount_action_brands.discount_value` als nullable Text angelegt.
2. Backfill: jede Zuordnung hat den Wert ihrer Aktion übernommen.
3. Abbruchprüfung im DO-Block — wäre eine Zuordnung ohne Wert geblieben, hätte die Migration mit Fehler abgebrochen (statt halb angewendet zu werden).
4. `SET NOT NULL` + `discount_action_brands_value_check` (1–50 Zeichen, getrimmt) — dieselbe Regel wie zuvor auf Aktionsebene.
5. `discount_actions.discount_value` auf **nullable** gesetzt, aber **nicht gelöscht**.

**Warum zweiphasig (Abweichung vom Tech Design):** Die App läuft live auf Vercel. Ein `DROP COLUMN` in derselben Migration hätte bedeutet, dass der noch deployte alte Code eine nicht mehr existierende Spalte liest → Laufzeitfehler bis zum nächsten Deploy. Die alte Spalte bleibt deshalb vorerst bestehen; neuer Code füllt sie nicht mehr (deshalb `DROP NOT NULL`).

**Migration `discount_value_per_brand_legacy_bridge` (Nachtrag, nötig):** Phase 1 allein war doch nicht rückwärtskompatibel — der **aktuell deployte** Code legt Zuordnungen *ohne* Rabattwert an, und die Spalte ist jetzt NOT NULL. Jede Aktion, die zwischen Migration und Deploy über die Live-Seite angelegt worden wäre, hätte einen Fehler geworfen. Behoben durch einen BEFORE-INSERT-Trigger `discount_action_brands_legacy_value`, der einen fehlenden Wert aus dem (alten) Aktionswert übernimmt. `EXECUTE` entzogen, `search_path` leer — wie beim Audit-Trigger. Verifiziert (Transaktion + Rollback): alter Insert-Pfad ohne Wert → Zuordnung erhält den Aktionswert (`15%`).

**⚠️ Offen — Phase 2 (nach Deploy + QA), drei Schritte:**
1. `drop trigger discount_action_brands_legacy_value on public.discount_action_brands;`
2. `drop function public.discount_action_brands_legacy_value();`
3. `alter table public.discount_actions drop column discount_value;`

Erst ausführen, wenn die neue Version live und geprüft ist. Bis dahin bleibt die alte Spalte bestehen (neue Aktionen haben dort NULL).

**Datenstand vor/nach Migration:** 11 Aktionen, 32 Zuordnungen — nach dem Backfill 32/32 mit Wert, 0 leer, 11/11 Aktionen abgedeckt. Keine Bestandsdaten verändert außer dem Backfill.

**Funktionsprüfung (SQL, Transaktion mit Rollback, 7/7 bestanden):** Aktion ohne Aktionswert anlegbar ✓; zwei Marken mit unterschiedlichen Werten ✓; Einzelwert änderbar ✓; leerer Wert → `check_violation` ✓; Wert > 50 Zeichen → `check_violation` ✓; Entfernen **einer** von zwei Marken lässt die Aktion bestehen ✓; Entfernen der **letzten** Marke löscht die Aktion (Cleanup-Trigger unverändert) ✓. Nach Rollback unveränderter Stand (11 Aktionen / 32 Zuordnungen, keine Testreste).

**Server-Aktionen (`aktionen/actions.ts`):**
- `ActionBrand` trägt jetzt `discount_value`; `DiscountAction.discount_value` entfällt. `ActionInput.brandIds` → `ActionInput.brands` (Paare aus Marke + Wert).
- `uniqueBrandIds` → `uniqueBrands` (dedupliziert je Marke, trimmt den Wert; bei Dubletten gewinnt der letzte Eintrag).
- `createAction` schreibt die Werte in die Junction-Zeilen; Rollback der Aktion bei Fehler bleibt.
- `updateAction`: Upsert-dann-Prune bleibt, **aber `ignoreDuplicates` von `true` auf `false` geändert** — sonst würde eine bestehende Zuordnung übersprungen und ein geänderter Rabattwert nie gespeichert. Das ist der eine Punkt, an dem der bisherige Code stillschweigend falsch geworden wäre.
- `findActionConflicts`, `deleteAction`, `getBrandDeletionImpact`, `countActionsForChannel`: unverändert.

**Datenladen:** beide Seiten (`aktionen/page.tsx` und die Kalenderseite `multi-channel-marketing/page.tsx`) selektieren `discount_action_brands(discount_value, brands(...))` und hängen den Wert an die jeweilige Marke — keine zusätzliche Abfrage.

**Sicherheit:** RLS und Policies unverändert (die Spalte hängt an einer bestehenden Tabelle). Security-Advisors: keine neuen Befunde; projektweit verbleibt nur `auth_leaked_password_protection` (manueller Auth-Schalter, wie bisher).

**Tests:** `action-validation.test.ts` auf das neue Schema umgestellt und um 3 Fälle erweitert (unterschiedliche Werte je Marke, gewählte Marke ohne Wert, Wert > 50 / Trim). **Gesamtsuite 87/87 grün** (`npx vitest run --pool=threads`). `tsc --noEmit` fehlerfrei, `next build` erfolgreich.

## Implementation Notes (Frontend)
**Stand:** 2026-08-23 — im selben Zug wie das Backend umgesetzt, weil die Schema-Umstellung (`brandIds` → `brands`) das Formular zwangsläufig mitzieht: eine Zwischenlösung hätte weggeworfenen Code bedeutet.

- **`action-form-dialog.tsx`:** Dialog auf `sm:max-w-2xl`; Titel und Kanal nebeneinander; das eigenständige Feld „Rabattwert" entfernt. Die Markenliste ist jetzt `Marken & Rabatt`: je Zeile Checkbox + Name (mit `truncate` + `title`) + `Input` (h-8, w-28). Ungehakte Marken zeigen ihr Feld gedimmt (`opacity-50`); **Tippen hakt die Marke automatisch an**. Getippte Werte liegen in einem lokalen `draftValues`-State, damit Abhaken den Wert nicht löscht — der Formularwert enthält nur die gehakten Marken. Darunter Sammelfeld + „Für alle gewählten übernehmen". Fehlende Werte: roter Rahmen am Feld (`aria-invalid`) plus **eine** Sammelmeldung, erst nach dem ersten Absenden.
- **`action-manager.tsx`:** Spalte „Rabatt" entfernt; Spalte „Marken" heißt jetzt „Marken & Rabatt" und zeigt je Marke Swatch, Name und ihren Wert.
- **`calendar-view.tsx` / `month-view.tsx`:** Balkenbeschriftung und Tooltip zeigen `item.brand.discount_value` statt des Aktionswerts — pro Balken also der Wert genau dieser Marke.
- **Keine neuen Pakete, keine neuen Komponenten** (Input/Checkbox/Button aus shadcn/ui wiederverwendet).

## QA Test Results

**Tested:** 2026-08-23
**Tester:** QA Engineer (AI)
**Methoden:** Komponenten-Unit-Tests (Vitest + Testing Library), Schema-Unit-Tests, TypeScript/Build, HTTP-Route-Schutz gegen den laufenden Dev-Server, PostgREST-Prüfung mit anon-Key (Red Team), funktionale DB-Verifikation (Transaktion + Rollback), Code-Review. E2E-Spec geschrieben, lokal nicht ausführbar (Playwright-Browser fehlen, Projektnotiz) — für CI vorgesehen.

### Acceptance Criteria Status

**Formular — Auswahl & Eingabe**
- [x] Eigenes Rabattfeld hinter jeder Marke, Gruppierung + zwei Spalten erhalten — Unit-Test + Code-Review
- [x] Feld ungehakter Marken sichtbar, gedimmt, kein Layout-Sprung — Code-Review (`opacity-50`, Feld immer gerendert)
- [x] Tippen hakt die Marke automatisch an — Unit-Test
- [x] Wert bleibt nach dem Abhaken sichtbar, wird aber nicht gespeichert — Unit-Test (`draftValues` bleibt, Formularwert nicht)
- [x] Sammelwert wirkt auf alle gewählten Marken, danach einzeln überschreibbar — Unit-Test (ungewählte Marke bleibt leer)
- [x] Separate Zeile „Rabattwert" entfallen — Unit-Test (`queryByLabelText("Rabattwert")` ist null)

**Validierung**
- [x] Gewählte Marke ohne Wert → kein Speichern, Felder markiert, **eine** Sammelmeldung — Unit-Test (Meldung sichtbar, `createAction` nicht aufgerufen)
- [x] Keine Marke gewählt → „Bitte mindestens eine Marke auswählen." — Schema-Unit-Test + `FormMessage`
- [x] Wert > 50 Zeichen → abgelehnt — Schema-Unit-Test + DB-Check-Constraint. **Hinweis:** im Formular ist das Feld auf `maxLength=50` begrenzt, der Fall wird also verhindert statt gemeldet; Schema und DB fangen den programmatischen Weg ab.
- [x] Führende/abschließende Leerzeichen werden getrimmt — Schema-Unit-Test (`"  20%  "` → `"20%"`) + `uniqueBrands` trimmt serverseitig

**Speichern & Bearbeiten**
- [x] Je gewählter Marke eine Zuordnung mit eigenem Wert — DB-Verifikation (zwei Marken, zwei verschiedene Werte)
- [x] Beim Bearbeiten sind Marken vorausgewählt und Werte vorbefüllt — Unit-Test
- [x] Nur einen Wert ändern lässt die übrigen unverändert — DB-Verifikation (Upsert-Semantik, zweiter Wert blieb `15%`)
- [x] Marke hinzufügen + andere entfernen in einem Vorgang → Aktion bleibt bestehen — DB-Verifikation (Upsert-dann-Prune, Aktion lebt, Werte `30%` + `5 EUR`)

**Anzeige**
- [x] Aktionsliste zeigt je Marke Swatch, Name und Wert; Spalte „Rabatt" entfällt — Code-Review (Spalten-Header und Zellen zählen weiterhin überein)
- [x] Kalenderbalken/Tooltip zeigen den Wert **dieser** Marke — Code-Review (`item.brand.discount_value` in beiden Ansichten)
- [x] Schmaler Balken → Wert im Tooltip — Code-Review (unveränderte Tooltip-Struktur)
- [x] Monats-Zoom identisch — Code-Review
- [x] Keine Layout-Regression in den Kalendern — bestehende Unit-Tests von `calendar-view` und `month-view` weiterhin grün

**Bestandsdaten**
- [x] Jede Zuordnung hat den bisherigen Wert übernommen, keine leer — SQL: 32/32 mit Wert, 0 leer, 11/11 Aktionen abgedeckt
- [x] Bestandsaktion zeigt dieselben Werte wie vorher — folgt aus dem Backfill (identischer Wert je Marke)

**Audit**
- [x] Audit-Spalten werden serverseitig gesetzt — DB-Verifikation: ein manipuliertes `updated_at` (Jahr 2000) wird vom Trigger überschrieben

### Security Audit Results (Red Team)
- [x] Route-Schutz serverseitig: `/aktionen`, `/tools/multi-channel-marketing` und `/marken` → **HTTP 307 → /login** gegen den laufenden Dev-Server geprüft
- [x] `anon` SELECT auf `discount_action_brands` → `[]` (Default-Deny greift auch für die neue Spalte). Gegenprobe mit erfundener Spalte → HTTP 400, die 200-Antwort ist also aussagekräftig
- [x] `anon` INSERT auf `discount_action_brands` → **abgelehnt** (`42501`, RLS-Verstoß)
- [x] `anon` UPDATE aller Zeilen → HTTP 204 mit **0 betroffenen Zeilen**; anschließende Kontrolle: 32 Zuordnungen unverändert, 0 manipulierte Werte
- [x] Audit-Spalten nicht fälschbar (Trigger überschreibt Client-Werte)
- [x] Keine Injektionsfläche über die Marken-IDs: `updateAction` validiert per Zod (UUID) **vor** dem Bau der Prune-Abfrage
- [x] Trigger-Funktion `discount_action_brands_legacy_value` gehärtet: `EXECUTE` entzogen, leerer `search_path`
- [x] Security-Advisors: keine neuen Befunde; projektweit verbleibt nur `auth_leaked_password_protection` (manueller Auth-Schalter, unverändert)

### Automatisierte Tests
- **Unit (Vitest): 93/93 grün** (`npx vitest run --pool=threads`), davon **6 neue** in `src/components/action-form-dialog.test.tsx` und **4 neue/geänderte** in `action-validation.test.ts`.
- **Test-Setup ergänzt:** `src/test/setup.ts` enthält jetzt Stubs für `ResizeObserver` und die Pointer-Capture-APIs — ohne die stürzen Radix-Komponenten (Select/Dialog) unter jsdom ab. Ohne diese Ergänzung wären Komponententests für Dialoge generell nicht möglich gewesen.
- **TypeScript:** `tsc --noEmit` fehlerfrei. **Build:** `next build` erfolgreich.
- **Funktionale DB-Checks:** 7/7 + 4/4 (zweiter Durchlauf) bestanden, alles per Rollback zurückgenommen; Datenstand danach unverändert (11 Aktionen / 32 Zuordnungen, keine Testreste).
- **E2E (Playwright):** `tests/PROJ-12-rabattwert-je-marke.spec.ts` geschrieben (Route-Schutz Aktionsseite + Kalender). **Nicht ausgeführt** — die Browser-Binaries fehlen auf dieser Maschine (`npx playwright install chromium` nötig, ~300 MB). Dieselbe Zusicherung ist per HTTP bereits verifiziert.

### Bugs Found
- **Keine.** (0 Critical, 0 High, 0 Medium, 0 Low)

**Bewusste Abweichungen / offene Punkte (keine Bugs):**
1. **Zweiphasige Migration:** `discount_actions.discount_value` existiert noch (nullable) und wird von neuem Code nicht mehr gefüllt — neue Aktionen haben dort NULL. Phase 2 (Trigger + Funktion + Spalte löschen) erst **nach** dem Deploy ausführen; die drei Schritte stehen in den Backend-Notizen.
2. **Übergangs-Trigger aktiv:** `discount_action_brands_legacy_value` hält den aktuell deployten alten Code lauffähig. Muss in Phase 2 mit weg, sonst bleibt eine stille Fallback-Regel im Schema.
3. **Nicht im Browser getestet:** angemeldete Abläufe wurden nicht in der echten Oberfläche durchgeklickt (kein Test-Login vorhanden). Abgedeckt sind sie durch Komponenten-Unit-Tests und DB-Verifikation; ein manueller Smoke-Test durch den Nutzer nach dem Deploy wird empfohlen — insbesondere Anlegen mit unterschiedlichen Werten, Bearbeiten eines einzelnen Werts und die Kalender-Tooltips.
4. **Tab-Reihenfolge** der Felder ungehakter Marken bleibt offen (siehe Open Questions) — Barrierefreiheits-Detail, kein Funktionsfehler.

### Regression
- Bestehende Unit-Tests aller Vorgänger-Features (PROJ-2 bis PROJ-11) unverändert grün (87 vorher → 93 jetzt, keine umgeschriebenen Zusicherungen außer den bewusst angepassten Schema-Tests).
- PROJ-7 (Kannibalisierungs-Warnung): Prüfpfad unverändert; das Formular übergibt weiterhin reine Marken-IDs an `findActionConflicts`.
- PROJ-4 (Marken löschen): `getBrandDeletionImpact` unverändert, Cascade- und Cleanup-Verhalten per SQL erneut bestätigt.

### Summary
- **Acceptance Criteria:** 21 von 21 verifiziert (Unit-Tests + DB-Checks + HTTP-Prüfung + Code-Review)
- **Bugs:** 0 (0 Critical, 0 High, 0 Medium, 0 Low)
- **Security:** Pass
- **Production Ready:** YES — mit der Auflage, Phase 2 der Migration **nach** dem Deploy nachzuziehen
- **Recommendation:** PROJ-12 freigeben und deployen. Direkt nach dem Deploy: kurzer manueller Smoke-Test, danach Phase 2 (Trigger, Funktion, alte Spalte entfernen). Anschließend PROJ-13 (Entwurf & Freigabe).

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-08-23
**Production URL:** https://multi-channel-marketing.vercel.app
**Commits:** `edf4681` (feat PROJ-12), `85d2e9d` (docs PROJ-13)
**Git Tag:** `v1.1.0-PROJ-12`

### Pre-Deployment-Checks
| Check | Ergebnis |
|---|---|
| `npm run build` | ✅ erfolgreich |
| `tsc --noEmit` | ✅ fehlerfrei |
| Unit-Tests | ✅ 93/93 |
| QA | ✅ Approved, 0 Bugs |
| Migrationen angewendet | ✅ Phase 1 + Übergangs-Trigger |
| Secrets | ✅ `.env.local` gitignored, alle Variablen in `.env.local.example` |
| `npm run lint` | ⚠️ im Projekt defekt (Next.js 16 hat `next lint` entfernt) — ersetzt durch Build + `tsc` |

### Deploy-Ablauf
Push auf `main` → GitHub-Anbindung löst den Vercel-Production-Deploy aus. GitHub-Deployment `6052601743` meldet **success**.

### Post-Deployment-Verifikation (HTTP gegen Produktion)
- `/login` → **200**
- `/tools/multi-channel-marketing/aktionen` → **307** → `/login` (Route-Schutz greift in Produktion)
- `/tools/multi-channel-marketing` → **307** → `/login`
- `/api/keep-alive` → **200** (bestätigt zugleich die DB-Verbindung)

### ✅ Erledigt: Phase 2 der Migration (2026-08-23, nach dem PROJ-13-Deploy)
Ausgeführt als Migration `discount_value_per_brand_phase2`, zusammen mit dem PROJ-13-Deploy. Zu diesem Zeitpunkt war die einzige praktisch relevante Rollback-Stufe bereits die PROJ-12-Version selbst, die ohne die alte Spalte auskommt:

```sql
drop trigger discount_action_brands_legacy_value on public.discount_action_brands;
drop function public.discount_action_brands_legacy_value();
alter table public.discount_actions drop column discount_value;
```

Kontrolle danach: alte Spalte weg, Trigger weg, Funktion weg, 32/32 Marken-Zuordnungen mit Rabattwert.
