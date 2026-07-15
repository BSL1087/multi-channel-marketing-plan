# PROJ-9: Aktivitätsprotokoll (wer hat was gemacht)

## Status: In Progress
**Created:** 2026-07-01
**Last Updated:** 2026-07-02

## Dependencies
- Requires: PROJ-2 (Login / Team-Zugang) — für die Identität des handelnden Nutzers (E-Mail) und die Zugriffsprüfung
- Hängt ein in: PROJ-3 (Kanäle), PROJ-4 (Marken), PROJ-5 (Rabatt-Aktionen), PROJ-11 (Produktgruppen) — jede Anlege-/Änderungs-/Löschaktion dieser Entitäten erzeugt einen Protokoll-Eintrag

## Übersicht
Ein append-only Aktivitätsprotokoll, das festhält, welcher Nutzer wann welches Objekt angelegt, geändert oder gelöscht hat. Die Ansicht ist bewusst **nur für benedikt@agonsworld.com** sichtbar (an die E-Mail gebunden, kein Rollen-/Admin-Konzept). Ziel: Nachvollziehbarkeit im gemeinsam genutzten Team-Tool — „wer hat was gemacht".

## User Stories
- Als Inhaber des Accounts benedikt@agonsworld.com möchte ich eine chronologische Liste aller Änderungen im Tool sehen, damit ich nachvollziehen kann, wer was verändert hat.
- Als Inhaber möchte ich pro Eintrag erkennen, wer (E-Mail), wann (Datum/Uhrzeit), welche Art von Änderung (angelegt/geändert/gelöscht) an welchem Objekt (Typ + Name) vorgenommen hat, damit ich mir schnell ein Bild machen kann.
- Als Inhaber möchte ich das Protokoll nach Objekttyp, Nutzer und Aktionstyp filtern können, damit ich gezielt eine bestimmte Änderung wiederfinde.
- Als Inhaber möchte ich, dass Lösch-Einträge auch dann lesbar bleiben, wenn das Objekt bereits gelöscht ist, damit die Historie vollständig bleibt.
- Als anderer Team-Nutzer (nicht benedikt@agonsworld.com) sehe ich weder einen Menüpunkt noch die Protokoll-Seite, damit die Ansicht für mich schlicht nicht existiert.

## Out of Scope
- **Feld-Diffs (alt→neu)** — bewusst ausgeschlossen; ein Eintrag ist eine Zusammenfassung, keine feldweise Änderungshistorie. Kann später als Erweiterung nachgezogen werden.
- **Rollen-/Rechtesystem** — es wird kein Admin-Status und kein Rollenmodell eingeführt. Der Zugriff ist allein an die E-Mail benedikt@agonsworld.com gebunden. Ein echtes Rollenkonzept ist ein separates, späteres Feature.
- **Sichtbarkeit für andere Nutzer** — kein „jeder sieht seine eigenen Aktivitäten", keine Team-weite Ansicht. Nur der eine Account.
- **Löschen/Leeren des Protokolls** — nicht vorgesehen; das Protokoll ist append-only und unveränderlich.
- **Export (CSV/PDF)** — nicht Teil dieses Features.
- **Login-/Logout-Ereignisse** — protokolliert werden nur inhaltliche Änderungen an Entitäten, keine Auth-Events.
- **Wiederherstellen (Undo/Restore)** — das Protokoll zeigt Historie, bietet aber kein Zurücksetzen gelöschter/geänderter Objekte.
- **Retention/Archivierung** — keine automatische Löschung oder Archivierung; alle Einträge bleiben unbegrenzt erhalten (Archivierung ggf. später).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ein Nutzer legt eine Rabatt-Aktion, Marke, einen Kanal oder eine Produktgruppe an, wenn der Vorgang erfolgreich gespeichert wird, dann wird ein Protokoll-Eintrag mit Aktionstyp „angelegt", Objekttyp, Objektname, handelndem Nutzer (E-Mail) und Zeitstempel erzeugt.
- [ ] Angenommen ein Nutzer ändert ein bestehendes Objekt, wenn die Änderung gespeichert wird, dann wird ein Protokoll-Eintrag mit Aktionstyp „geändert" erzeugt.
- [ ] Angenommen ein Nutzer löscht ein Objekt, wenn der Löschvorgang erfolgreich ist, dann wird ein Protokoll-Eintrag mit Aktionstyp „gelöscht" erzeugt, wobei der Objektname als Text-Snapshot erhalten bleibt.
- [ ] Angenommen ich bin als benedikt@agonsworld.com eingeloggt, wenn ich die App öffne, dann sehe ich einen Menüpunkt „Aktivitätsprotokoll".
- [ ] Angenommen ich bin als anderer Nutzer eingeloggt, wenn ich die App öffne, dann sehe ich keinen Menüpunkt „Aktivitätsprotokoll".
- [ ] Angenommen ich bin als anderer Nutzer eingeloggt, wenn ich die Protokoll-URL direkt aufrufe, dann wird mir der Zugriff verweigert (keine Einträge sichtbar / Weiterleitung).
- [ ] Angenommen ich bin als benedikt@agonsworld.com auf der Protokoll-Seite, wenn die Seite lädt, dann sehe ich die Einträge chronologisch mit dem neuesten zuerst.
- [ ] Angenommen es existieren Einträge verschiedener Objekttypen, wenn ich nach einem Objekttyp (Aktion/Marke/Kanal/Produktgruppe) filtere, dann werden nur Einträge dieses Typs angezeigt.
- [ ] Angenommen es existieren Einträge mehrerer Nutzer, wenn ich nach einem Nutzer filtere, dann werden nur dessen Einträge angezeigt.
- [ ] Angenommen es existieren Einträge verschiedener Aktionstypen, wenn ich nach einem Aktionstyp (angelegt/geändert/gelöscht) filtere, dann werden nur passende Einträge angezeigt.
- [ ] Angenommen ein Objekt, das in einem älteren Eintrag genannt ist, wurde inzwischen gelöscht, wenn ich diesen Eintrag ansehe, dann ist der Objektname weiterhin als Text lesbar.
- [ ] Angenommen es existieren noch keine Protokoll-Einträge, wenn ich die Seite öffne, dann sehe ich einen aussagekräftigen Empty State statt einer leeren Liste.
- [ ] Angenommen ein Protokoll-Eintrag existiert, wenn irgendein Nutzer versucht, ihn zu bearbeiten oder zu löschen, dann ist das nicht möglich (append-only).

## Edge Cases
- **Gelöschtes referenziertes Objekt:** Objektname wird als Text-Snapshot mitgespeichert, damit der Eintrag lesbar bleibt (siehe AC).
- **Fehlgeschlagene Aktion:** Schlägt das Speichern/Löschen des Objekts fehl, darf KEIN Protokoll-Eintrag entstehen (kein „Phantom"-Eintrag für nicht durchgeführte Änderungen).
- **Viele Einträge:** Bei wachsender Anzahl muss die Liste paginiert oder virtuell geladen werden, damit die Seite performant bleibt (siehe Technical Requirements).
- **Gleichzeitige Aktionen zweier Nutzer:** Beide Aktionen erzeugen je einen eigenen Eintrag; Reihenfolge ergibt sich aus dem Zeitstempel.
- **Nutzer ohne Anzeigename:** Als „Wer" wird die E-Mail-Adresse angezeigt (das Tool hat keine separaten Anzeigenamen).
- **Zugriff durch Nicht-Berechtigten:** Sowohl die UI (kein Menüpunkt) als auch der Datenzugriff (Server/RLS) müssen den Zugriff verhindern — nicht nur die Menü-Sichtbarkeit.
- **Änderung ohne echte Wertänderung:** Wird ein Bearbeiten-Dialog gespeichert, ohne dass sich etwas geändert hat, sollte idealerweise kein „geändert"-Eintrag entstehen (offene Frage, siehe unten).

## Technical Requirements (optional)
- Zugriffsschutz auf Server-Ebene (nicht nur UI): Nur benedikt@agonsworld.com darf Einträge lesen — abgesichert per RLS/Server-Check, nicht nur durch das Ausblenden des Menüpunkts.
- Liste paginiert (z.B. seitenweise oder Infinite Scroll), neueste zuerst.
- Protokollierung darf den auslösenden Vorgang (Anlegen/Ändern/Löschen) nicht blockieren oder spürbar verlangsamen.
- Append-only: keine Update-/Delete-Pfade auf Protokoll-Einträgen.

## Open Questions
- [ ] Soll ein „Bearbeiten"-Vorgang ohne tatsächliche Wertänderung einen Eintrag erzeugen oder unterdrückt werden? (Empfehlung: unterdrücken, wenn technisch einfach erkennbar; final in /architecture klären)
- [ ] Sollen später Anzeigenamen statt E-Mail für „Wer" möglich sein? (aktuell: E-Mail)
- [ ] Zeitzone/Format der Zeitstempel-Anzeige (Empfehlung: lokale Zeit, Format TT.MM.JJJJ, HH:MM)
- [ ] Kaskaden-Löschungen: Löscht man einen Kanal oder eine Marke, entfernt die DB verknüpfte Rabatt-Aktionen automatisch mit. Mit Triggern wird jede mitgelöschte Aktion ein eigener Eintrag (vollständig, aber bei großen Löschungen viele Einträge). Beibehalten oder gruppieren/unterdrücken? (Empfehlung: vorerst beibehalten — vollständige Historie)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Alle Entitäten protokollieren (Aktionen, Marken, Kanäle, Produktgruppen) | Vollständiger Überblick über Team-Änderungen; passt zum Ziel zentraler, koordinierter Planung | 2026-07-01 |
| Zusammenfassung pro Eintrag statt Feld-Diffs | Gut lesbar und deutlich einfacher umzusetzen; Diffs bei Bedarf später | 2026-07-01 |
| Ansicht nur für benedikt@agonsworld.com, an E-Mail gebunden, kein Admin-/Rollenstatus | Kein Rollensystem im MVP; pragmatische Einschränkung ohne Rechte-Umbau | 2026-07-01 |
| Andere Nutzer sehen weder Menüpunkt noch Seite (Zugriff serverseitig verweigert) | Klare, unmissverständliche Einschränkung; UI-Ausblenden allein reicht nicht | 2026-07-01 |
| Eigene Seite mit Menüpunkt (nur im berechtigten Account) | Leicht auffindbar, klar vom Rest getrennt | 2026-07-01 |
| Filter nach Objekttyp, Nutzer und Aktionstyp; chronologisch neueste zuerst | Deckt die häufigen Fragen „was ist neu" und „wer hat X geändert" ab | 2026-07-01 |
| Objektname als Text-Snapshot speichern | Lösch-Einträge bleiben lesbar, auch wenn das Objekt weg ist | 2026-07-01 |
| Append-only, unveränderlich, unbegrenzte Aufbewahrung | Verlässliche, manipulationssichere Historie | 2026-07-01 |
| „Wer" wird als E-Mail angezeigt | Tool hat laut PRD keine separaten Anzeigenamen | 2026-07-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Tabelle `activity_log` in Supabase/Postgres | Zentrale, dauerhafte Historie; gleiche DB wie der Rest des Tools | 2026-07-02 |
| Befüllung per Datenbank-Trigger statt im Anwendungscode | Kann bei künftigen Features nicht vergessen werden; erfasst auch Kaskaden-Löschungen; bestehende Server-Actions bleiben unverändert; append-only auf DB-Ebene | 2026-07-02 |
| Nutzer-E-Mail UND Objektname als Text-Snapshot in jeder Zeile | Einträge bleiben lesbar, auch wenn Objekt/Nutzer später entfernt werden | 2026-07-02 |
| Zugriff dreifach abgesichert: Menü-Sichtbarkeit + Seiten-Check + RLS-Regel | UI-Ausblenden allein ist keine Sicherheit; RLS ist die eigentliche Grenze | 2026-07-02 |
| Berechtigung an feste E-Mail (benedikt@agonsworld.com) gebunden, kein Rollen-/Admin-Flag | Kein Rollensystem im MVP; pragmatisch. Nachteil: Änderung der Person erfordert Migration (RLS) + Code-Konstante | 2026-07-02 |
| „Bearbeiten ohne echte Wertänderung" im Trigger unterdrücken | Vermeidet Rausch-Einträge ohne inhaltliche Änderung (klärt Open Question) | 2026-07-02 |
| Filter & Blättern über URL-Parameter (Server-Seite), Filterleiste als Client-Element | Konsistent mit dem bestehenden Kalender-Muster; teilbar/lesbar; server-seitige Begrenzung | 2026-07-02 |
| Keine neuen Pakete | shadcn/ui (Table, Select, Badge, Pagination) und Supabase-Anbindung reichen aus | 2026-07-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Erstellt:** 2026-07-02

### Kurzfassung
Eine neue Protokoll-Tabelle sammelt automatisch jede Anlege-/Änder-/Lösch-Aktion an den vier
Entitäten (Kanäle, Produktgruppen, Marken, Rabatt-Aktionen). Das Befüllen übernimmt die
Datenbank selbst per **Trigger** — nichts muss im Anwendungscode nachgezogen werden. Eine neue,
schreibgeschützte Seite zeigt die Einträge nur dem Account **benedikt@agonsworld.com**;
abgesichert doppelt (Menü ausgeblendet + Datenbank-Regel + Seiten-Check).

### A) Komponenten-Struktur (was gebaut wird)
```
Dashboard-Startseite (/)
└── Neue Karte "Aktivitätsprotokoll"      ← nur sichtbar für benedikt@agonsworld.com

Neue Seite: /tools/multi-channel-marketing/aktivitaet   (Server-Seite, nur Lesen)
├── Zugriffs-Check (E-Mail) → sonst Weiterleitung
├── Kopfzeile + "Zurück zum Dashboard"
├── Filterleiste (kleines Client-Element, ändert die URL)
│   ├── Filter: Objekttyp (Aktion / Marke / Kanal / Produktgruppe)
│   ├── Filter: Nutzer
│   └── Filter: Aktionstyp (angelegt / geändert / gelöscht)
├── Protokoll-Liste (neueste zuerst)
│   └── je Eintrag: Nutzer-E-Mail · Zeitpunkt · Aktionstyp-Badge · Objekttyp · Objektname
├── Empty State (wenn keine/keine passenden Einträge)
└── Seiten-Blätterung (Pagination, z.B. 50 pro Seite)
```
Alle Bausteine nutzen bereits installierte shadcn/ui-Komponenten (Table/Card, Select, Badge,
Pagination) — **keine neuen Pakete nötig**.

### B) Datenmodell (in Klartext)
Eine neue Tabelle **`activity_log`**. Jeder Eintrag speichert:
- Eindeutige ID
- Handelnder Nutzer: Referenz auf den Auth-Nutzer **und** dessen E-Mail als Text-Schnappschuss
  (damit der Eintrag lesbar bleibt, auch wenn ein Nutzer später entfernt würde)
- Aktionstyp: „angelegt" / „geändert" / „gelöscht"
- Objekttyp: „Rabatt-Aktion" / „Marke" / „Kanal" / „Produktgruppe"
- Objekt-Referenz (ID; bei gelöschten Objekten leer)
- Objektname als **Text-Schnappschuss** (überlebt das Löschen des Objekts)
- Zeitpunkt (Zeitstempel)

Speicherort: **Supabase (Postgres)** — dieselbe Datenbank wie der Rest des Tools.
Die Tabelle ist **append-only**: Es gibt keinen Weg (weder UI noch Regel), Einträge zu ändern
oder zu löschen.

### C) Wie Einträge entstehen (Automatik statt Handarbeit)
Die Datenbank bekommt an den vier Tabellen (Kanäle, Produktgruppen, Marken, Rabatt-Aktionen)
je einen **Trigger**. Bei jedem Anlegen/Ändern/Löschen schreibt der Trigger automatisch einen
Protokoll-Eintrag — inklusive des handelnden Nutzers (aus der laufenden Sitzung) und des
Objektnamens. Vorteile: kann bei künftigen Features nicht vergessen werden, erfasst auch
kaskadierte Löschungen, und der Anwendungscode der bestehenden Actions bleibt unangetastet.
Ein „Bearbeiten ohne echte Wertänderung" wird im Trigger unterdrückt (nur echte Änderungen
werden protokolliert).

### D) Zugriffsschutz (dreifach abgesichert)
1. **Menü:** Die neue Dashboard-Karte wird nur gerendert, wenn die E-Mail des eingeloggten
   Nutzers die Berechtigte ist.
2. **Seite:** Die Protokoll-Seite prüft die E-Mail serverseitig und leitet andernfalls weiter
   (wie die bestehenden Seiten den Login prüfen).
3. **Datenbank (RLS):** Eine Lese-Regel auf `activity_log` gibt Zeilen ausschließlich frei,
   wenn die E-Mail des Anfragenden die Berechtigte ist. Das ist die eigentliche
   Sicherheitsgrenze — selbst ein direkter Datenzugriff liefert anderen Nutzern nichts.
   Schreiben/Ändern/Löschen ist für alle normalen Nutzer per Regel gesperrt (nur der Trigger
   schreibt).

### E) Filter & Blättern
Die Filter funktionieren wie beim Kalender über die **URL** (z.B. `?typ=marke&aktion=geloescht`).
Die Server-Seite liest diese Parameter, fragt die passenden Zeilen ab (neueste zuerst,
seitenweise begrenzt) und zeigt sie an. Die Filterleiste ist ein kleines Client-Element, das
nur die URL aktualisiert.

### F) Abhängigkeiten (neue Pakete)
Keine. Alles baut auf vorhandenen shadcn/ui-Komponenten und der bestehenden Supabase-Anbindung auf.

### Technische Deviation von der Spec
Keine. Alle Spec-Entscheidungen (nur benedikt@agonsworld.com, append-only, Text-Snapshot,
Filter nach Typ/Nutzer/Aktion, E-Mail als „Wer") sind eins zu eins abgebildet.

## Frontend-Implementierung (2026-07-02)
Umgesetzt (UI-Schicht; Datenanbindung folgt in /backend):
- **Neue Seite** `src/app/tools/multi-channel-marketing/aktivitaet/page.tsx` (Server-Komponente):
  Auth-Check + E-Mail-Gate (nur ACTIVITY_LOG_EMAIL, sonst Weiterleitung zu `/`), liest Filter
  aus der URL, fragt `activity_log` mit Filtern + Pagination ab.
- **Gemeinsame Konstanten/Typen** `src/lib/activity-log.ts`: `ACTIVITY_LOG_EMAIL`,
  `PAGE_SIZE = 50`, Entitäts-/Aktionstypen + deutsche Labels, `ActivityEntry`-Typ,
  Query-/Badge-Helfer.
- **Filterleiste** `src/components/activity-log-filters.tsx` (Client): Selects für Objekttyp,
  Aktionstyp, Nutzer; Filter liegen in der URL; „Filter zurücksetzen"; Filterwechsel setzt auf
  Seite 1 zurück.
- **Liste** `src/components/activity-log-list.tsx` (präsentational): Tabelle
  Zeitpunkt · Aktion (farbiges Badge) · Objekttyp · Objekt · Nutzer; Empty States (mit/ohne
  aktive Filter).
- **Pagination**: Zurück/Weiter über URL-Parameter, „Seite X von Y".
- **Dashboard-Karte** in `src/app/page.tsx`: nur sichtbar, wenn `user.email === ACTIVITY_LOG_EMAIL`.

Hinweise / Deviation:
- Die Seite ist gegen eine **noch fehlende Tabelle** robust: schlägt die Abfrage fehl (Tabelle
  existiert noch nicht), zeigt sie den Empty State statt eines Fehlers. Nach /backend läuft sie
  ohne Codeänderung mit echten Daten.
- Der Nutzer-Filter listet nur E-Mails, die tatsächlich im Log vorkommen.
- Verifiziert mit `npx tsc --noEmit` und `npm run build` (beides grün). `npm run lint` ist im
  Template defekt (siehe Projekt-Memory) und wurde bewusst nicht genutzt.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
