# PROJ-13: Entwurf & Freigabe (Aktions-Status)

## Status: Deployed
**Created:** 2026-08-23
**Last Updated:** 2026-08-24

## Dependencies
- Requires: PROJ-5 (Rabatt-Aktionen) — Aktionen, Formular-Dialog, Aktionsliste.
- Requires: PROJ-6 (Jahreskalender) — zeigt künftig **nur übernommene** Aktionen; Entwürfe werden dort ausgeblendet.
- Requires: PROJ-7 (Kannibalisierungs-Warnung) — die Konfliktprüfung berücksichtigt Entwürfe **weiterhin** und läuft zusätzlich beim Freigeben.
- Betrifft: PROJ-8 (Monats-Zoom) — wie der Jahreskalender: nur übernommene Aktionen.
- Empfohlen danach: PROJ-12 (Rabattwert je Marke) sollte **vorher** gebaut sein — beide Features fassen denselben Formular-Dialog an.
- **Kein** Rollen-/Rechtesystem erforderlich (siehe Product Decisions).

## Problemstellung
Heute landet jede gespeicherte Aktion sofort im Jahreskalender und gilt damit als verbindlich geplant. Der reale Ablauf ist aber zweistufig: Ein Abteilungsleiter (z.B. Fitness) plant eine Aktion mit markenspezifischen Rabatten vor, der Marketplace-Manager legt sie anschließend im jeweiligen Marketplace (z.B. Amazon) tatsächlich an — und **erst danach** ist sie verbindlich. Ohne Zwischenzustand ist im Kalender nicht unterscheidbar, was geplant und was real eingebucht ist.

## User Stories
- Als **Abteilungsleiter** möchte ich eine Aktion als Entwurf speichern, damit ich sie vorbereiten kann, ohne dass sie schon als verbindliche Kalender-Aktion gilt.
- Als **Marketplace-Manager** möchte ich alle offenen Entwürfe sehen, damit ich weiß, was ich im Marketplace anzulegen habe.
- Als **Marketplace-Manager** möchte ich einen Entwurf nach erfolgreichem Anlegen im Marketplace in den Kalender übernehmen, damit die Jahresübersicht nur real gebuchte Aktionen als verbindlich zeigt.
- Als **Team-Mitglied** möchte ich, dass der Jahreskalender **ausschließlich** verbindlich eingebuchte Aktionen zeigt, damit die Jahresübersicht die Wirklichkeit abbildet und nicht die Absicht.
- Als **Team-Mitglied** möchte ich beim Planen vor Überschneidungen gewarnt werden, **auch wenn** die andere Aktion nur ein Entwurf ist, damit keine Doppelplanung entsteht.
- Als **Team-Mitglied** möchte ich eine bereits übernommene Aktion zurück auf Entwurf setzen können, damit ich reagieren kann, wenn der Marketplace die Aktion doch ablehnt.
- Als **Team-Mitglied** möchte ich sehen, wer eine Aktion wann in den Kalender übernommen hat, damit der Freigabeschritt nachvollziehbar ist.

## Out of Scope
- **Rollen- und Rechtesystem** (wer darf freigeben) — bewusst nicht; siehe Product Decisions.
- **Freigabe je Marke** statt je Aktion — Status gilt zunächst für die gesamte Aktion.
- **Benachrichtigungen** (E-Mail/Push „neuer Entwurf liegt vor") — nicht im Umfang.
- **Kommentar-/Rückfrage-Funktion** zwischen Planer und Marketplace-Manager.
- **Darstellung von Entwürfen im Jahreskalender oder Monats-Zoom** (schraffierte Balken, Ein-/Ausblende-Schalter, Legenden-Eintrag) — Entwürfe leben ausschließlich in der Aktions-Verwaltung.
- **Dritter Status „Abgelehnt/Verworfen"** — vorerst nur Entwurf und Im Kalender.
- **Vollständiges Änderungsprotokoll** → PROJ-9 (Aktivitätsprotokoll).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anlegen mit Status
- [ ] Angenommen der Nutzer legt eine neue Aktion an, wenn das Formular gültig ist, dann stehen zwei Speicher-Optionen zur Verfügung: „Als Entwurf speichern" (sekundär) und „In Kalender übernehmen" (primär).
- [ ] Angenommen der Nutzer wählt „Als Entwurf speichern", wenn gespeichert wird, dann erhält die Aktion den Status **Entwurf**, erscheint in der Aktions-Verwaltung mit Kennzeichen „Entwurf" und taucht im Kalender **nicht** auf.
- [ ] Angenommen der Nutzer wählt „In Kalender übernehmen", wenn gespeichert wird, dann erhält die Aktion den Status **Im Kalender** und wird wie bisher als verbindliche Aktion dargestellt.
- [ ] Angenommen eine bestehende Aktion wird bearbeitet, wenn der Nutzer speichert, dann bleibt ihr bisheriger Status unverändert (Statuswechsel erfolgt über eine eigene Aktion, nicht als Nebeneffekt des Speicherns).

### Freigeben & Zurücksetzen
- [ ] Angenommen ein Entwurf existiert, wenn der Nutzer in der Aktions-Verwaltung „In Kalender übernehmen" wählt (in der Zeile oder im Bearbeiten-Dialog), dann erscheint eine Bestätigung mit Titel, Kanal und Zeitraum, und nach Bestätigung wechselt der Status auf **Im Kalender**.
- [ ] Angenommen ein Entwurf wird übernommen, wenn der Statuswechsel gespeichert wird, dann werden `confirmed_by` und `confirmed_at` serverseitig gesetzt und in der Detailansicht/Tooltip als „übernommen von X am TT.MM.JJJJ" angezeigt.
- [ ] Angenommen eine Aktion hat den Status Im Kalender, wenn der Nutzer „Zurück auf Entwurf" wählt, dann erscheint eine Bestätigung, und nach Bestätigung wechselt der Status auf **Entwurf**; `confirmed_by`/`confirmed_at` werden zurückgesetzt.
- [ ] Angenommen zwei Nutzer übernehmen denselben Entwurf gleichzeitig, wenn beide bestätigen, dann führt das zu keinem Fehler — der Status ist danach Im Kalender (idempotent).
- [ ] Angenommen eine Aktion wurde zwischenzeitlich gelöscht, wenn der Nutzer den Statuswechsel bestätigt, dann erscheint der Hinweis „existiert nicht mehr" und die Liste wird aktualisiert.

### Konfliktprüfung (Zusammenspiel mit PROJ-7)
- [ ] Angenommen ein Entwurf überschneidet sich mit einer anderen Aktion (gleiche Marke, überlappender Zeitraum), wenn der Nutzer speichert, dann greift die bestehende Warnung aus PROJ-7 unverändert (nicht blockierend).
- [ ] Angenommen die konfligierende Aktion ist selbst ein Entwurf, wenn die Warnung angezeigt wird, dann ist dieser Treffer im Dialog als **Entwurf** gekennzeichnet.
- [ ] Angenommen ein Entwurf soll in den Kalender übernommen werden, wenn zu diesem Zeitpunkt Konflikte bestehen, dann werden sie im Bestätigungsdialog angezeigt; die Übernahme bleibt möglich („warnen statt blockieren").

### Anzeige — Aktionsliste
- [ ] Angenommen Aktionen mit beiden Status existieren, wenn der Nutzer die Aktionsliste öffnet, dann trägt jede Zeile ein Status-Kennzeichen (Badge „Entwurf" / „Im Kalender").
- [ ] Angenommen der Nutzer will nur Entwürfe sehen, wenn er den Status-Filter auf „Entwürfe" stellt, dann werden nur Entwürfe angezeigt (Optionen: Alle / Entwürfe / Im Kalender).
- [ ] Angenommen es existieren offene Entwürfe, wenn der Nutzer die Aktionsseite öffnet, dann ist ihre Anzahl erkennbar (z.B. am Filter „Entwürfe (3)").

### Anzeige — Kalender (PROJ-6 & PROJ-8)
> **Revidiert am 2026-08-24:** Entwürfe erscheinen jetzt doch im Kalender — schraffiert in der Markenfarbe. Die ursprüngliche Fassung („erscheinen dort nicht") steht im Decision Log als revidiert; Details in PROJ-6, Abschnitt „Entwürfe in der Jahresansicht".
- [ ] Angenommen ein Entwurf liegt im dargestellten Zeitraum, wenn der Nutzer den Jahreskalender öffnet, dann erscheint er als **schraffierter Balken in der Markenfarbe** in der Zeile seines Kanals.
- [ ] Angenommen Entwürfe sind sichtbar, wenn der Nutzer die Checkbox „Entwürfe" in der Filterzeile abwählt, dann verschwinden alle Entwurfs-Balken und der Kalender zeigt ausschließlich verbindlich eingebuchte Aktionen.
- [ ] Angenommen der Nutzer öffnet den Monats-Zoom (PROJ-8), wenn Entwürfe im Monat liegen, dann erscheinen sie dort ebenfalls schraffiert (ohne eigene Checkbox).
- [ ] Angenommen ein Entwurf wird in den Kalender übernommen, wenn der Nutzer danach den Kalender öffnet, dann erscheint die Aktion als normal gefüllter Balken (Schraffur verschwindet).
- [ ] Angenommen der Nutzer klickt einen Entwurfs-Balken, wenn der Bearbeiten-Dialog öffnet, dann steht dort zusätzlich „In Kalender übernehmen" (mit dem bestehenden Bestätigungsdialog) zur Verfügung.
- [ ] Angenommen der Nutzer legt im Kalender eine neue Aktion an und wählt „Als Entwurf speichern", wenn gespeichert wird, dann erscheint sie unmittelbar als schraffierter Balken; der Hinweis-Toast greift nur noch, wenn Entwürfe gerade ausgeblendet sind.

### Zugriff & Audit
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er die Aktionsseite oder den Kalender aufruft, dann wird er wie bisher zur Login-Seite weitergeleitet.
- [ ] Angenommen ein Statuswechsel wird gespeichert, wenn er erfolgreich ist, dann werden zusätzlich die bestehenden Audit-Spalten (`updated_by`/`updated_at`) serverseitig aktualisiert.

### Bestandsdaten (Migration)
- [ ] Angenommen es existieren Aktionen aus der Zeit vor diesem Feature, wenn die Umstellung ausgeführt wurde, dann haben alle den Status **Im Kalender** (sie waren bisher verbindlich) und keine Aktion hat einen leeren Status.

## Edge Cases
- **Entwurf liegt komplett in der Vergangenheit** → bleibt bestehen und wird normal dargestellt; beim Übernehmen erscheint ein Hinweis, dass der Zeitraum bereits vorbei ist (nicht blockierend).
- **Entwurf ohne Marken** → kann nicht entstehen: die „mindestens eine Marke"-Regel und der Cleanup-Trigger aus PROJ-5 gelten für Entwürfe genauso.
- **Marke oder Kanal wird gelöscht, während Entwürfe daran hängen** → unverändert Cascade; die Anzahl-Warnung in den Lösch-Dialogen zählt Entwürfe mit und weist sie getrennt aus.
- **Statuswechsel bei gleichzeitigem Bearbeiten** → Last-Write-Wins wie bisher; der Statuswechsel schreibt ausschließlich Status-/Freigabe-Spalten, überschreibt also keine inhaltlichen Änderungen.
- **„Zurück auf Entwurf" bei laufender Aktion** → erlaubt, mit Hinweis im Bestätigungsdialog, dass die Aktion aktuell läuft.
- **Alle Aktionen eines Jahres sind Entwürfe** → der Kalender zeigt seinen normalen Leerzustand, ergänzt um den Hinweis „X Entwürfe liegen in der Aktions-Verwaltung" samt Link dorthin. Ohne diesen Hinweis wirkt ein leerer Kalender wie ein Datenverlust.
- **Entwurf löschen** → wie bisher Bestätigungsdialog; keine Sonderbehandlung.
- **Netzwerk-/Serverfehler beim Statuswechsel** → Fehlermeldung, Status bleibt unverändert.

## Technical Requirements
- Daten: Neue Spalte `status` auf `discount_actions` (Text, NOT NULL, Default `'draft'`, Check auf `'draft'`/`'confirmed'`) — kein Enum-Typ, konsistent mit dem bisherigen Spaltenstil.
- Daten: Neue Spalten `confirmed_by` (uuid → `auth.users(id)`, `ON DELETE SET NULL`, nullable) und `confirmed_at` (timestamptz, nullable).
- Daten: Migration setzt alle Bestandsaktionen auf `'confirmed'` (sie galten bisher als verbindlich); `confirmed_by`/`confirmed_at` bleiben dort leer.
- Daten: Index auf `status` (Filter in Liste und Kalender-Abfragen).
- Daten: Integritätsregel — `confirmed_at`/`confirmed_by` nur bei Status `confirmed` gesetzt; beim Zurücksetzen serverseitig auf NULL.
- Server: Neue Server-Aktion für den Statuswechsel (setzen/zurücksetzen), inkl. Auth-Check, Erkennung zwischenzeitlich gelöschter Aktionen und `revalidatePath`. `createAction` nimmt den Zielstatus als Parameter entgegen; `updateAction` lässt den Status unangetastet.
- Server: `findActionConflicts` (PROJ-7) liefert je Treffer zusätzlich den Status, damit der Warn-Dialog Entwürfe kennzeichnen kann; die Prüflogik selbst bleibt unverändert.
- Validierung: Status als Teil des geteilten Zod-Schemas in `action-validation.ts`.
- Sicherheit: RLS unverändert nach PROJ-1-Konvention (`authenticated` voll, `anon` Default-Deny) — der Status ist ein Workflow-Zustand, keine Berechtigungsgrenze.
- Daten: Die beiden Kalenderseiten laden seit der Revision vom 2026-08-24 **beide** Zustände; der Zustand steuert nur noch Darstellung (Schraffur) und clientseitigen Filter — nicht mehr die Ladeabfrage (Details in PROJ-6, „Entwürfe in der Jahresansicht“).
- UI: Der Kalender braucht nur zwei Ergänzungen — den Hinweis-Toast beim Speichern eines Entwurfs und den Zusatz im Leerzustand („X Entwürfe in der Verwaltung", mit Link).
- UI: shadcn/ui wiederverwenden (Badge, Switch/Toggle, AlertDialog, Select für den Filter) — keine Eigenbauten.
- Tests: Unit-Tests für Statuswechsel-Regeln (Setzen/Zurücksetzen, `confirmed_*`-Konsistenz) und für die Kalender-Filterung nach Status.

## Open Questions
- [x] Sollen Entwürfe im Kalender sichtbar sein? → zunächst **Nein** (2026-08-23), **am 2026-08-24 revidiert: Ja** — als schraffierter Balken in Markenfarbe, mit Checkbox zum Ausblenden (Standard: an). Begründung im Decision Log.
- [x] Braucht es einen dritten Status „Abgelehnt"? → **Nein** (Nutzer-Entscheidung, 2026-08-23). „Zurück auf Entwurf" genügt.
- [x] Soll die Freigabe je Marke möglich sein? → **Nein** (Nutzer-Entscheidung, 2026-08-23). Der Marketplace-Manager bearbeitet den Entwurf so, wie er ihn tatsächlich im Marketplace hinterlegt hat, und übernimmt ihn dann — der Entwurf bildet damit immer die Wirklichkeit ab, ohne zweite Zustandsebene.
- [ ] Soll beim Anlegen der Standard-Button „Als Entwurf speichern" oder „In Kalender übernehmen" sein (aktuell vorgesehen: Übernehmen als primärer Button, Entwurf als sekundärer)?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Zwei Status: Entwurf / Im Kalender | Bildet den realen Zwei-Schritt-Ablauf ab (planen → im Marketplace anlegen → verbindlich), ohne einen Workflow-Baukasten zu bauen | 2026-08-23 |
| **Kein** Rollensystem | Das Projekt hat heute keins (PROJ-2 = gemeinsamer Team-Zugang). Für ein kleines Team genügt „wer hat übernommen" via `confirmed_by`; Rollen wären Overhead und eine eigene Baustelle | 2026-08-23 |
| **Entwürfe erscheinen gar nicht im Kalender** (Entscheidung des Nutzers, 2026-08-23) | Der Kalender soll die Wirklichkeit zeigen, nicht die Absicht. Der ursprüngliche Gegeneinwand — unsichtbare Entwürfe würden die Kannibalisierungs-Warnung aushebeln — **trifft nicht zu**: PROJ-7 prüft serverseitig gegen die Datenbank, nicht gegen die gezeichnete Ansicht. Entwürfe werden also weiterhin erkannt und gemeldet. Es bleibt nur der schwächere Fall, dass eine Lücke im Kalender optisch frei wirkt, obwohl sie verplant ist — dagegen greift die Warnung beim Speichern — **am 2026-08-24 revidiert, siehe unten** | 2026-08-23 |
| Damit entfallen: Schraffur, Ein-/Ausblende-Schalter, Legenden-Eintrag | Kleineres Feature, weniger Bedienelemente, keine zweite Farbbedeutung im Kalender — **am 2026-08-24 revidiert: Schraffur und Schalter kommen doch** | 2026-08-23 |
| Hinweis-Toast beim Speichern eines Entwurfs aus dem Kalender heraus | Ohne ihn wirkt „gespeichert, aber nichts erscheint" wie ein Fehler; der Toast erklärt, wo die Aktion liegt, und verlinkt dorthin | 2026-08-23 |
| Konfliktprüfung berücksichtigt Entwürfe, kennzeichnet sie aber | Frühzeitige Warnung, ohne dass ein Entwurf wie eine gebuchte Aktion wirkt | 2026-08-23 |
| Status gilt je Aktion, nicht je Marke (bestätigt vom Nutzer, 2026-08-23) | Der Entwurf ist bearbeitbar: Teilerfolge bildet der Marketplace-Manager ab, indem er den Entwurf auf den tatsächlich eingebuchten Stand ändert und dann übernimmt. Eine Zustandsebene je Marke würde dieselbe Information doppelt führen | 2026-08-23 |
| Kein dritter Status „Abgelehnt" (bestätigt vom Nutzer, 2026-08-23) | „Zurück auf Entwurf" deckt den Fall vollständig ab | 2026-08-23 |
| Statuswechsel als eigene Aktion, nicht als Nebeneffekt des Speicherns | Verhindert versehentliche Freigabe beim Korrigieren eines Tippfehlers | 2026-08-23 |
| „Zurück auf Entwurf" ist möglich (mit Bestätigung) | Marketplaces lehnen Aktionen ab oder Termine verschieben sich — der Weg muss in beide Richtungen gehen | 2026-08-23 |
| Bestandsaktionen werden „Im Kalender" | Sie galten bisher als verbindlich; alles andere würde den Kalender rückwirkend entwerten | 2026-08-23 |
| Übernehmen bleibt trotz Konflikten möglich | Konsistent mit der „warnen statt blockieren"-Philosophie aus PROJ-7 | 2026-08-23 |
| **Revision 2026-08-24: Entwürfe erscheinen doch im Kalender** — schraffiert in Markenfarbe | Die Jahresansicht dient primär der Planung („wo ist noch Platz, wo häuft sich was?"), nicht der Statusabfrage. Für diese Frage belegt ein Entwurf den Slot faktisch. Der im Spec bereits vermerkte Preis der alten Entscheidung — „eine Lücke wirkt optisch frei, obwohl sie verplant ist" — wiegt beim Jahresplanen schwerer als die begriffliche Reinheit der Ist-Ansicht; die PROJ-7-Warnung greift erst beim Speichern, also nach der Entscheidung | 2026-08-24 |
| Markenfarbe bleibt, Schraffur trägt den Status | Graue Entwurfs-Balken hätten die Markenerkennung zerstört — genau die Information, für die der Kalender gebaut ist. Farbe = welche Marke, Textur = wie verbindlich: zwei unabhängige Signale ohne Konflikt, Legende bleibt gültig | 2026-08-24 |
| Checkbox „Entwürfe" in der Filterzeile, Standard **an** | Die reine Ist-Ansicht bleibt einen Klick entfernt. Standard „an", weil die Planungssicht der Regelfall ist — ein Schalter, den man erst einschalten muss, verfehlt den Zweck der Änderung | 2026-08-24 |
| Monats-Zoom zeigt Entwürfe ebenfalls, aber ohne eigene Checkbox | Gleiche Darstellung in beiden Ansichten, damit beim Wechsel kein Balken unerklärt verschwindet. PROJ-8 bleibt bewusst ohne Filterzeile | 2026-08-24 |
| Klick auf einen Entwurfs-Balken bietet „In Kalender übernehmen" | Wer den Entwurf beim Planen sieht und für gut befindet, soll ihn dort freigeben können, statt in die Aktions-Verwaltung zu wechseln. Der Statuswechsel bleibt eine eigene, bestätigungspflichtige Handlung | 2026-08-24 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `status` als Text-Spalte mit Check-Constraint statt Postgres-Enum | Konsistent mit dem bisherigen Spaltenstil im Projekt; ein späterer dritter Zustand ist eine Constraint-Änderung statt einer Typ-Migration | 2026-08-23 |
| Default `'draft'` auf DB-Ebene, Bestandsdaten per Migration auf `'confirmed'` | Neue Aktionen sind im Zweifel Entwürfe; Bestand war verbindlich. Beides muss explizit gesetzt werden, sonst entscheidet der Zufall | 2026-08-23 |
| `confirmed_by`/`confirmed_at` nullable, serverseitig gesetzt und beim Zurücksetzen geleert | Freigabe-Angaben dürfen nie zu einem Entwurf gehören; Client-Werte werden wie bei den Audit-Spalten nicht übernommen | 2026-08-23 |
| Statuswechsel als **eigene** Server-Aktion, nicht als Feld in `updateAction` | Trennt „Inhalt korrigieren" von „verbindlich machen"; verhindert versehentliche Freigabe und hält den Schreibpfad klein (nur Status-Spalten) | 2026-08-23 |
| Statuswechsel überschreibt keine inhaltlichen Felder | Zwei Nutzer, die gleichzeitig bearbeiten und freigeben, treten sich nicht gegenseitig auf die Füße | 2026-08-23 |
| Index auf `status` | Liste und Kalender filtern künftig danach | 2026-08-23 |
| `findActionConflicts` liefert den Status **mit**, Prüflogik unverändert | Der Warn-Dialog muss Entwürfe kennzeichnen können; die Erkennung selbst (Marke + Zeitraum) ändert sich nicht | 2026-08-23 |
| Kalender filtert auf `status = 'confirmed'` **in der Ladeabfrage**, nicht beim Zeichnen | Entwürfe erreichen die Ansicht gar nicht; dadurch bleiben Balken-Layout, Legende und Filterzeile vollständig unverändert und es entsteht kein Sonderfall in der Darstellungslogik — **am 2026-08-24 revidiert** | 2026-08-23 |
| Kein neues Bedienelement im Kalender | Die Kalender-Filterzeile bleibt den Kanal-Kategorien vorbehalten; der Zustand ist keine Anzeigevorliebe, sondern eine inhaltliche Zusage — **am 2026-08-24 revidiert: eine Checkbox „Entwürfe“ kommt hinzu** | 2026-08-23 |
| Rein additive Migration, keine zweite Phase | Es wird nichts entfernt; der aktuell deployte Code ignoriert die neuen Spalten. Anders als bei PROJ-12 ist kein Übergangs-Trigger nötig | 2026-08-23 |
| Backend vor Frontend | Ohne den Zustand in der Datenbank kann die Oberfläche ihn weder anzeigen noch setzen | 2026-08-23 |
| Keine neuen Pakete, eine neue Komponente (Statuswechsel-Dialog) | Alle Bausteine vorhanden; Konvention „shadcn/ui first" | 2026-08-23 |
| Kalenderseiten laden **beide** Zustände; Unterscheidung und Filterung im Client (Revision 2026-08-24) | Der Zustand ist jetzt eine Darstellungsdimension. Es braucht keine zweite Abfrage — die bestehende lässt den Status-Filter weg und liefert das Feld mit; die separate Entwurfs-Zählung entfällt | 2026-08-24 |
| Schraffur als CSS-Overlay (repeating-linear-gradient) über der Markenfarbe, ~65 % Deckkraft | Kein zweiter Balkentyp im Layout: Geometrie, Stapeln und Spurenlogik bleiben unberührt, nur die Balken-Klasse unterscheidet sich | 2026-08-24 |
| Entwürfe zählen in Stapel- und Kürzungslogik wie normale Aktionen | Sonst entstünde ein zweiter Sonderfall in der Layout-Logik. Folge: Zeilen können höher werden — akzeptiert; die „mehr/weniger"-Kürzung vergangener, markenreicher Aktionen greift unverändert | 2026-08-24 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-08-23

### Überblick
PROJ-13 fügt der Aktion einen **Zustand** hinzu: Entwurf oder Im Kalender. Das ist keine neue Datenstruktur, sondern ein zusätzliches Merkmal an der bestehenden Aktion — plus die Information, wer es wann verbindlich gemacht hat. Sichtbar wird das an vier Stellen: beim **Anlegen** (zwei Speicher-Wege), in der **Aktionsliste** (Kennzeichen + Filter + Freigeben), im **Kalender** (unterscheidbare Darstellung + Ausblenden) und in der **Überschneidungs-Warnung** (Entwürfe werden mitgeprüft, aber gekennzeichnet).

Keine neue Tabelle, keine neue Seite, keine neuen Pakete. Der gesamte bestehende Ablauf — anlegen, bearbeiten, löschen, warnen — bleibt wie er ist; er bekommt nur eine zusätzliche Dimension.

### Seiten- & Komponenten-Struktur
```
Aktions-Verwaltung (bestehende Seite)
├── Kopfzeile: Statusfilter  [ Alle | Entwürfe (3) | Im Kalender ]     ← neu
├── Aktions-Liste
│   └── je Zeile: Kennzeichen „Entwurf"/„Im Kalender" · Titel · … ·    ← neu
│        Übernehmen ✓ (nur bei Entwürfen) · Bearbeiten · Löschen       ← neu
├── Dialog „Aktion anlegen"
│   └── Fußzeile: [ Als Entwurf speichern ]  [ In Kalender übernehmen ] ← neu
├── Dialog „Aktion bearbeiten"
│   └── Fußzeile: [ Speichern ] (+ Statuswechsel als eigene Schaltfläche) ← neu
└── Bestätigungsdialog „In Kalender übernehmen?" / „Zurück auf Entwurf?"  ← neu
     └── zeigt Titel, Kanal, Zeitraum + ggf. bestehende Überschneidungen

Jahreskalender + Monats-Zoom (bestehende Ansichten)
├── laden künftig nur Aktionen im Zustand „Im Kalender"                ← neu
├── Darstellung, Filter und Legende bleiben unverändert
├── Entwurf im Kalender angelegt → Toast „liegt in der Verwaltung"     ← neu
└── Leerzustand: Zusatz „X Entwürfe in der Verwaltung" + Link          ← neu

Überschneidungs-Warnung (PROJ-7, bestehend)
└── Treffer, die Entwürfe sind, tragen ein „Entwurf"-Kennzeichen       ← neu
```

Neu entsteht genau **eine** Komponente: der Bestätigungsdialog für den Statuswechsel. Alles andere sind Ergänzungen an bestehenden Bausteinen.

### Datenmodell (in einfacher Sprache)
**Rabatt-Aktion** (bestehend, wird erweitert um drei Angaben):
- **Zustand**: „Entwurf" oder „Im Kalender". Pflichtangabe, neue Aktionen starten als Entwurf.
- **Freigegeben von**: welcher Nutzer die Aktion in den Kalender übernommen hat (leer bei Entwürfen).
- **Freigegeben am**: Zeitpunkt der Übernahme (leer bei Entwürfen).

Regel: Die beiden Freigabe-Angaben existieren nur im Zustand „Im Kalender". Wird eine Aktion zurück auf Entwurf gesetzt, werden sie geleert — sonst stünde später eine Freigabe im Protokoll, die nicht mehr gilt.

**Bestandsdaten:** Alle heute existierenden Aktionen werden „Im Kalender". Sie galten bisher als verbindlich; alles andere würde den Kalender rückwirkend entwerten. Freigegeben von/am bleiben dort leer — wir wissen es nicht und erfinden es nicht.

### Abläufe (was passiert wann)
- **Anlegen:** Der Nutzer entscheidet beim Speichern, ob die Aktion Entwurf bleibt oder direkt in den Kalender geht. Beide Wege durchlaufen dieselbe Prüfung auf Überschneidungen wie bisher.
- **Bearbeiten:** Ändert **nie** den Zustand. Wer einen Tippfehler korrigiert, gibt damit nichts frei.
- **Übernehmen:** Eigene Schaltfläche in der Liste (und im Bearbeiten-Dialog). Es folgt ein Bestätigungsdialog, der Titel, Kanal, Zeitraum und — falls vorhanden — bestehende Überschneidungen zeigt. Bestätigen setzt den Zustand und hält fest, wer es war.
- **Zurücksetzen:** Derselbe Weg rückwärts, ebenfalls mit Bestätigung. Läuft die Aktion gerade, weist der Dialog darauf hin.
- **Anzeigen:** Die Aktions-Verwaltung lädt beide Zustände und kennzeichnet sie. Die beiden Kalenderansichten laden von vornherein **nur** übernommene Aktionen — der Zustand wirkt also als Filter beim Laden, nicht als Sonderfall beim Zeichnen. Dadurch bleibt die gesamte Kalender-Darstellung unangetastet.

### Warum so (für Nicht-Techniker)
- **Warum tauchen Entwürfe im Kalender gar nicht auf?** Weil der Jahreskalender beantwortet, was tatsächlich läuft — nicht, was jemand vorhat. Zwei Darstellungsarten nebeneinander würden diese Aussage verwässern. Die naheliegende Sorge, dass verdeckte Planung zu Doppelbelegungen führt, greift hier nicht: Die Überschneidungsprüfung arbeitet auf den gespeicherten Daten, nicht auf dem Bild. Ein Entwurf löst die Warnung also genauso aus wie eine gebuchte Aktion — er ist nur nicht gezeichnet.
- **Was ist der Preis dieser Entscheidung?** Wer den Kalender überfliegt, um eine freie Woche zu finden, sieht nicht, dass dort bereits ein Entwurf liegt. Er erfährt es erst beim Speichern durch die Warnung. Das ist die bewusst in Kauf genommene Lücke — und sie passt zur Philosophie des Tools: warnen im Moment der Entscheidung, statt alles vorab anzuzeigen.
- **Warum trotzdem ein Hinweis beim Speichern?** Wer im Kalender eine Aktion anlegt und „Als Entwurf speichern" wählt, sieht danach — nichts. Ohne Erklärung wirkt das wie ein verschluckter Speichervorgang. Ein kurzer Hinweis mit Link in die Verwaltung räumt das aus.
- **Warum kein Rollensystem?** Weil das Tool bewusst ein gleichberechtigtes Team abbildet (PRD: „keine Rollen im MVP"). Der Zwei-Schritt-Ablauf funktioniert auch ohne Rechte: Der Zustand sagt, was zu tun ist, und „freigegeben von" sagt, wer es getan hat. Rechte wären eine eigene Baustelle mit Nutzerverwaltung, Zuweisung und Sonderfällen — und würden im Alltag vor allem im Weg stehen, wenn jemand vertritt.
- **Warum ist der Statuswechsel eine eigene Handlung und kein Speicher-Nebeneffekt?** Damit niemand versehentlich freigibt, während er nur ein Datum korrigiert. Freigabe ist eine Aussage über die Wirklichkeit („ist bei Amazon eingebucht") — die soll man bewusst treffen.
- **Warum gilt der Zustand für die ganze Aktion, nicht je Marke?** Weil der Entwurf bearbeitbar ist und damit jeden Teilerfolg abbilden kann. Konnte der Marketplace-Manager nur drei von fünf Marken einbuchen, ändert er den Entwurf entsprechend — er entfernt oder korrigiert, was nicht durchging — und übernimmt dann. Was im Kalender landet, entspricht so immer dem, was wirklich im Marketplace steht. Eine zweite Zustandsebene je Marke würde dieselbe Information nur doppelt führen. (Für den Rest legt er bei Bedarf einen eigenen Entwurf an.)
- **Warum bleibt Übernehmen trotz Überschneidung möglich?** Konsistent mit PROJ-7: Das Tool warnt, es blockiert nicht. Manche Doppelbelegungen sind gewollt.

### Einordnung in bestehende Bedienmuster
- Der Statusfilter der Liste folgt der Logik der Liste selbst (eine Auswahl über der Tabelle).
- Die Bestätigungsdialoge folgen exakt dem Muster der bestehenden Lösch- und Warndialoge.
- Der Kalender bekommt **kein** neues Bedienelement — seine bestehende Filterzeile „Anzeigen:" (Kanal-Kategorien) bleibt unberührt.

### Benötigte Pakete
Keine neuen. Alle Bausteine sind vorhanden: Kennzeichen (Badge), Auswahlfeld, Bestätigungsdialog, Tooltip.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Keine Rollen, keine Rechteprüfung, keine Benachrichtigungen.
- Keine Freigabe je Marke, keinen dritten Zustand „Abgelehnt".
- Keine Änderung an der Überschneidungslogik selbst — nur an ihrer Darstellung (Entwürfe werden im Warn-Dialog gekennzeichnet).
- Kein Änderungsprotokoll über Zustandswechsel hinaus (→ PROJ-9).

### Reihenfolge der Umsetzung
Wie bei PROJ-12: **Backend zuerst** (Zustand + Freigabe-Angaben + Bestandsdaten), dann Frontend. Ohne den Zustand in der Datenbank kann die Oberfläche ihn weder anzeigen noch setzen. Da hier — anders als bei PROJ-12 — nur **hinzugefügt** und nichts entfernt wird, ist die Umstellung rückwärtskompatibel: Der aktuell laufende Code ignoriert das neue Merkmal einfach. Eine zweite Phase ist nicht nötig.

## Implementation Notes (Frontend)
**Stand:** 2026-08-23

**Neue Komponente `action-status-dialog.tsx`** (die einzige des Features): Bestätigung für beide Richtungen. Beim Übernehmen prüft sie über `findActionConflicts` erneut auf Überschneidungen und listet sie auf — inklusive Kennzeichen, wenn der Treffer selbst ein Entwurf ist. Übernehmen bleibt trotzdem möglich („warnen statt blockieren"). Beim Zurücksetzen erscheint ein Hinweis, falls die Aktion gerade läuft. Schlägt die Konfliktprüfung technisch fehl, wird der Dialog ohne Warnungen angezeigt statt blockiert.

**`action-form-dialog.tsx`:**
- Beim Anlegen zwei Schaltflächen: „Als Entwurf speichern" (sekundär) und „In Kalender übernehmen" (primär). Welche gedrückt wurde, hält ein **`useRef`** fest, kein State — der Wert wird im Submit-Handler gelesen, den derselbe Klick auslöst; ein State-Update wäre zu diesem Zeitpunkt noch nicht angewendet.
- Beim Bearbeiten bleibt es bei **einer** Schaltfläche „Speichern"; der Status wird dabei nie verändert. Ist die bearbeitete Aktion ein Entwurf, kommt zusätzlich „In Kalender übernehmen" dazu, das den Statuswechsel-Dialog öffnet (gleiches Muster wie der bestehende Lösch-Dialog).
- Neue Prop `origin` (`"list"` | `"calendar"`): Ein aus dem Kalender heraus gespeicherter Entwurf ist dort unsichtbar. Statt eines scheinbar wirkungslosen Speicherns erscheint ein Hinweis mit Link in die Aktions-Verwaltung.

**`action-manager.tsx`:**
- Status-Kennzeichen je Zeile (`Badge`). Beim Kennzeichen „Im Kalender" nennt der Titel-Tooltip „Übernommen von … am …".
- Filterleiste „Anzeigen: Alle (n) · Entwürfe (n) · Im Kalender (n)" — bewusst im Stil der Kalender-Filterzeile, damit die App ein Bedienmuster behält. Eigener Leerzustand, wenn ein Filter nichts übrig lässt.
- Je Zeile eine Statuswechsel-Schaltfläche: `CalendarCheck` bei Entwürfen, `Undo2` bei übernommenen Aktionen.
- **Namenskonflikt aufgelöst:** Die Datei hatte bereits einen lokalen Typ `ActionStatus` für die Ampel (läuft / kommt / abgelaufen). Der neue Workflow-Typ wird deshalb als `WorkflowStatus` importiert.

**`conflict-warning-dialog.tsx`:** Treffer, die Entwürfe sind, tragen ein kleines „Entwurf"-Kennzeichen — geplant ist nicht gebucht, und das ändert die Bewertung einer Überschneidung.

**`calendar-view.tsx` / `month-view.tsx`:** Beide öffnen den Formular-Dialog jetzt mit `origin="calendar"`. Der Jahreskalender bekommt zusätzlich die Prop `draftCount`; ist ein Jahr leer, während Entwürfe existieren, ergänzt der Leerzustand „X Entwürfe liegen in der Aktions-Verwaltung" samt Link. Sonst ist an beiden Ansichten **nichts** geändert — kein Schalter, keine Sonderdarstellung, keine Legenden-Ergänzung.

**Kalenderseite:** lädt die Entwurfs-Anzahl des dargestellten Zeitraums als vierte, parallele Abfrage (`head: true`, nur Zähler).

**Tests:** `action-form-dialog.test.tsx` um einen zweiten Block für PROJ-13 erweitert — beide Speicher-Wege übergeben den richtigen Status, Bearbeiten zeigt nur „Speichern", und „In Kalender übernehmen" erscheint im Bearbeiten-Dialog nur bei Entwürfen. Für die Tests war eine Hilfsfunktion nötig, die das Radix-`Select` per **Tastatur** öffnet: In jsdom gibt es keine echten Pointer-Events, ein Klick auf den Auslöser bleibt wirkungslos. Ohne gewählten Kanal scheitert die Formularvalidierung — die ersten Testversuche schlugen genau daran fehl.

**Verifikation:** `tsc --noEmit` fehlerfrei, `next build` erfolgreich, Unit-Tests **99/99 grün** (6 neue).

**Keine neuen Pakete, keine neuen shadcn-Komponenten** — Badge, AlertDialog, Button und Tooltip waren bereits installiert.

## Implementation Notes (Backend)
**Stand:** 2026-08-23 — Supabase-Projekt „Multi-Channel-Marketing" (`grtqmrnjjsucskdeghrr`).

**Migration `discount_actions_draft_status`:**
- `status` (Text, NOT NULL) mit Check auf `'draft'`/`'confirmed'`, `confirmed_by` (→ `auth.users`, ON DELETE SET NULL), `confirmed_at`.
- **Bestandsdaten ohne separates UPDATE:** Die Spalte wurde mit Default `'confirmed'` angelegt — dadurch haben alle 11 vorhandenen Aktionen den Zustand in einem Schritt bekommen. Verifiziert: 11/11 `confirmed`.
- Konsistenz-Constraint: Freigabe-Angaben dürfen nur bei `confirmed` gesetzt sein.
- Index auf `status` (Kalender filtert darauf, Liste gruppiert danach).

**⚠️ Default bewusst `'confirmed'` statt `'draft'`:** Der aktuell deployte Code kennt `status` nicht. Mit Default `'draft'` wären über die Live-Seite angelegte Aktionen sofort aus dem Kalender verschwunden — dieselbe Rückwärtskompatibilitäts-Falle wie bei PROJ-12. Nach dem Deploy der neuen Oberfläche umstellen: `alter table public.discount_actions alter column status set default 'draft';`

**Migration `action_confirmers_lookup` → wieder entfernt.** Erster Ansatz war eine SECURITY-DEFINER-Funktion, die `auth.users` liest, um „übernommen von X" anzuzeigen. Zwei Gründe dagegen, beide erst beim Advisor-Lauf aufgefallen:
1. `confirmed_by` ist `ON DELETE SET NULL` — wird ein Teammitglied gelöscht, verschwindet rückwirkend die Information, wer freigegeben hat. Genau die Angabe, um die es geht.
2. Die Funktion vergrößert die exponierte API-Fläche (Advisor `authenticated_security_definer_function_executable`).

**Migration `confirmed_by_email_snapshot` (Ersatz):** Spalte `confirmed_by_email` speichert den Namen als **Schnappschuss** zum Zeitpunkt der Freigabe — wie bei einer Rechnung. Überlebt das Löschen des Nutzerkontos, braucht keinen Zugriff auf `auth.users`, und die Funktion wurde gelöscht. Der Konsistenz-Constraint deckt alle drei Freigabe-Spalten ab.

**Server-Aktionen (`aktionen/actions.ts`):**
- `ActionStatus`-Typ; `DiscountAction` trägt `status`, `confirmed_at`, `confirmed_by_email`.
- `createAction(input, status)` — der Zustand ist bewusst ein **zweites Argument** statt eines Formularfelds: Er wird durch die gedrückte Schaltfläche bestimmt, nicht getippt. Default `'confirmed'`, damit das bestehende Formular unverändert weiterarbeitet, bis `/frontend` die zwei Schaltflächen ergänzt.
- **Neu: `setActionStatus(id, status)`** — schreibt ausschließlich die Status-Spalten. Dadurch überschreibt eine Freigabe nie die gleichzeitige inhaltliche Bearbeitung eines Kollegen. Setzt beim Übernehmen Nutzer-ID, Zeitpunkt und Namens-Schnappschuss; beim Zurücksetzen werden alle drei geleert.
- `updateAction` rührt den Zustand **nicht** an (Kern-Entscheidung des Features).
- `findActionConflicts` liefert je Treffer zusätzlich `status`, damit der Warn-Dialog Entwürfe kennzeichnen kann; die Prüflogik selbst ist unverändert.
- Alle schreibenden Aktionen erneuern jetzt zusätzlich den **Kalender-Pfad** (`revalidatePath`), weil ein Statuswechsel dort etwas sichtbar oder unsichtbar macht.

**Datenladen:**
- Aktions-Verwaltung lädt beide Zustände inkl. Freigabe-Angaben.
- **Kalender und Monats-Zoom filtern in der Ladeabfrage auf `status = 'confirmed'`** — Entwürfe erreichen die Ansicht gar nicht. Genau eine Zeile Code; Balken-Layout, Legende und Filterzeile bleiben unangetastet.

**Funktionsprüfung (SQL, Transaktion + Rollback, 11/11):** Default ohne Status = `confirmed` ✓; Entwurf mit Freigabe-Daten → `check_violation` ✓; Entwurf mit Freigeber-Name → `check_violation` ✓; unbekannter Status → `check_violation` ✓; Zurücksetzen möglich ✓; Übernehmen speichert Wer/Wann/Name ✓; Name überlebt den Verlust der Nutzer-ID ✓; Zurücksetzen leert alle drei Angaben ✓; Bestand unverändert (11 `confirmed`) ✓.

**Sicherheit (Red Team):** `anon` kann die neuen Spalten nicht lesen (`[]`), ein `PATCH` auf `status` trifft 0 Zeilen (RLS), die frühere Funktion war für `anon` gesperrt (401) und existiert nicht mehr. Security-Advisors: **keine offenen Befunde** für dieses Feature; projektweit verbleibt nur `auth_leaked_password_protection`.

**Verifikation:** `tsc --noEmit` fehlerfrei, `next build` erfolgreich, Unit-Tests **93/93 grün**.

**Noch offen für `/frontend`:** zwei Speicher-Schaltflächen im Anlegen-Dialog, Status-Kennzeichen und -Filter in der Liste, Übernehmen/Zurücksetzen-Dialog, Kennzeichnung von Entwürfen im Konflikt-Dialog, Hinweis-Toast und Leerzustand-Zusatz im Kalender.

## QA Test Results

**Tested:** 2026-08-23
**Tester:** QA Engineer (AI)
**Methoden:** Komponenten-Unit-Tests (Vitest + Testing Library), TypeScript/Build, HTTP-Route-Schutz, PostgREST-Prüfung mit anon-Key (Red Team), funktionale DB-Verifikation (Transaktion + Rollback), Code-Review. E2E-Spec geschrieben, lokal nicht ausführbar.

### Acceptance Criteria Status

**Anlegen mit Status**
- [x] Zwei Speicher-Optionen beim Anlegen — Unit-Test
- [x] „Als Entwurf speichern" → Status Entwurf, Kennzeichen in der Liste, nicht im Kalender — Unit-Test (Status als zweites Argument) + DB-Filter `status = 'confirmed'` in beiden Kalender-Abfragen
- [x] „In Kalender übernehmen" → Status Im Kalender — Unit-Test
- [x] Bearbeiten lässt den Status unverändert — Unit-Test (nur eine Schaltfläche „Speichern"; `updateAction` schreibt keine Status-Spalten)

**Freigeben & Zurücksetzen**
- [x] Bestätigung mit Titel, Kanal, Zeitraum vor dem Übernehmen — Code-Review (`action-status-dialog.tsx`)
- [x] Übernehmen setzt Freigeber und Zeitpunkt, Anzeige im Kennzeichen-Tooltip — DB-Verifikation + Code-Review
- [x] Zurücksetzen möglich, Freigabe-Angaben werden geleert — DB-Verifikation (alle drei Spalten null)
- [x] Gleichzeitiges Übernehmen ist idempotent — der Schreibpfad setzt absolute Werte, kein Zähler/Toggle
- [x] Zwischenzeitlich gelöschte Aktion → „existiert nicht mehr" — Code-Review (`updated.length === 0`)

**Konfliktprüfung**
- [x] Bestehende Warnung greift unverändert — `findActionConflicts` inhaltlich unverändert, nur um `status` erweitert
- [x] Konfligierende Entwürfe sind gekennzeichnet — Code-Review (`conflict-warning-dialog.tsx`)
- [x] Konflikte erscheinen im Übernehmen-Dialog, blockieren aber nicht — Code-Review

**Anzeige — Aktionsliste**
- [x] Status-Kennzeichen je Zeile — Code-Review
- [x] Filter Alle / Entwürfe / Im Kalender — Code-Review, inkl. eigenem Leerzustand je Filter
- [x] Anzahl offener Entwürfe erkennbar — Zähler direkt im Filter

**Anzeige — Kalender**
- [x] Entwürfe erscheinen nicht im Jahreskalender — Ladeabfrage filtert auf `confirmed`; die Legende wird aus den geladenen Aktionen abgeleitet, also ebenfalls entwurfsfrei
- [x] Entwürfe erscheinen nicht im Monats-Zoom — dieselbe Abfrage
- [x] Übernommene Aktion sieht aus wie jede andere — an der Darstellung wurde nichts geändert
- [x] Hinweis beim Speichern eines Entwurfs aus dem Kalender — Code-Review (`origin="calendar"` in beiden Ansichten gesetzt)

> **Hinweis 2026-08-24:** Diese vier Punkte beschreiben den Stand vom 2026-08-23. Die zugrundeliegende Produktentscheidung wurde am 2026-08-24 revidiert (Entwürfe erscheinen schraffiert im Kalender) — die Kalender-Punkte sind nach der Umsetzung neu zu prüfen.

**Zugriff & Audit**
- [x] Nicht eingeloggt → /login: `/aktionen`, `/tools/multi-channel-marketing` und `?month=3` liefern **HTTP 307**
- [x] Audit-Spalten beim Statuswechsel — Trigger feuert bei jedem UPDATE (in PROJ-12 verifiziert: gefälschtes `updated_at` wird überschrieben)

**Bestandsdaten**
- [x] Alle Bestandsaktionen sind „Im Kalender", kein leerer Status — SQL: 11/11 `confirmed`

### Security Audit Results (Red Team)
- [x] `anon` liest die Freigabe-Spalten nicht (`[]`)
- [x] `anon` versucht Status **und** Freigeber-Namen zu fälschen (`PATCH` auf alle bestätigten Aktionen) → HTTP 204 mit **0 betroffenen Zeilen**; Kontrolle danach: 11 Aktionen, 0 gefälschte Einträge
- [x] Die zwischenzeitlich angelegte SECURITY-DEFINER-Funktion `action_confirmers` ist entfernt → HTTP 404 (`PGRST202`)
- [x] Freigabe-Angaben sind serverseitig gesetzt; die Client-Payload enthält sie nicht (`setActionStatus` nimmt nur ID und Zielstatus entgegen)
- [x] Ungültiger Status wird doppelt abgewehrt: Server-Aktion prüft den Wert, DB-Check-Constraint als zweite Ebene
- [x] Konsistenz-Constraint verhindert „Entwurf mit Freigabe-Daten" auch bei direktem DB-Zugriff
- [x] Security-Advisors: keine offenen Befunde für dieses Feature; projektweit verbleibt nur `auth_leaked_password_protection`

### Automatisierte Tests
- **Unit (Vitest): 99/99 grün**, davon **6 neue** für PROJ-13 (beide Speicher-Wege inkl. übergebenem Status, Bearbeiten ohne Statuswechsel, Übernehmen-Schaltfläche nur bei Entwürfen).
- **TypeScript:** `tsc --noEmit` fehlerfrei. **Build:** `next build` erfolgreich.
- **Funktionale DB-Checks:** 11/11 + 5/5 bestanden (Backend-Notizen), alles per Rollback zurückgenommen.
- **E2E (Playwright):** `tests/PROJ-13-entwurf-und-freigabe.spec.ts` geschrieben (Route-Schutz für alle drei Einstiege). **Nicht ausgeführt:** Der Ordner `ms-playwright/chromium-1208` existiert, ist aber leer — der Browser-Download ist unvollständig (`chrome.exe` fehlt). `npx playwright install chromium` nötig. Dieselbe Zusicherung ist per HTTP verifiziert.

### Bugs Found
**0 Critical, 0 High, 0 Medium, 3 Low**

**BUG-1 (Low, UX): Die Eingabetaste speichert als Entwurf**
- **Ursache:** Bei zwei Submit-Schaltflächen löst die Eingabetaste die **erste im DOM** aus — das ist „Als Entwurf speichern". Bisher speicherte Enter die Aktion direkt.
- **Reproduktion:** Aktion anlegen, Felder ausfüllen, im Titelfeld Enter drücken → Aktion wird Entwurf.
- **Auswirkung:** gering — der Hinweis nennt den Entwurfs-Status, und die Aktion lässt sich mit einem Klick übernehmen. Wer Enter gewohnt ist, wundert sich aber.
- **Fix-Vorschlag:** primäre Schaltfläche im DOM zuerst rendern und per Flex-Reihenfolge rechts platzieren.

**BUG-2 (Low, Konsistenz): Monats-Zoom erklärt seinen Leerzustand nicht**
- Der Jahreskalender ergänzt bei leerem Jahr „X Entwürfe liegen in der Aktions-Verwaltung"; die Monatsansicht tut das nicht — `draftCount` wird nur an `CalendarView` übergeben.
- **Auswirkung:** In einem Monat ohne übernommene Aktionen fehlt die Erklärung, obwohl Entwürfe existieren.

**BUG-3 (Low, latent): `saveAsRef` wird beim Öffnen nicht zurückgesetzt**
- Der Merker für die gedrückte Schaltfläche behält seinen Wert über das Schließen hinaus. In gängigen Browsern unkritisch, weil implizite Formularabsendung den Standard-Button klickt und den Merker damit setzt. Bleibt dieser Klick aus, gilt der Wert der letzten Nutzung.
- **Fix-Vorschlag:** im Öffnen-Effekt auf `"confirmed"` zurücksetzen.

### Regression
- Alle Tests der Vorgänger-Features unverändert grün (93 → 99, keine umgeschriebenen Zusicherungen).
- PROJ-7: Prüflogik unverändert, nur um ein Anzeigefeld erweitert.
- PROJ-12: Rabattwerte je Marke unberührt; die Formular-Tests laufen weiter.
- PROJ-3/PROJ-4: Die Lösch-Warnungen zählen jetzt auch Entwürfe mit — korrekt, da diese beim Löschen von Marke/Kanal ebenfalls entfernt werden.

### Nicht getestet
- **Kein Browser-Durchlauf der angemeldeten Abläufe** (kein Test-Login vorhanden). Abgedeckt durch Unit-Tests, DB-Verifikation und Code-Review; ein manueller Smoke-Test nach dem Deploy wird empfohlen: Entwurf anlegen, in der Liste filtern, übernehmen, im Kalender prüfen, zurücksetzen.
- **Hinweis zur Umgebung:** Auf Port 3000 lief bereits eine ältere `next dev`-Instanz; die Route-Prüfungen liefen gegen diese (sie lädt Codeänderungen automatisch nach). Ein zweiter Start scheiterte an der Sperre in `.next/dev/lock`.

### Summary
- **Acceptance Criteria:** 22 von 22 verifiziert
- **Bugs:** 3 Low (0 Critical, 0 High, 0 Medium)
- **Security:** Pass
- **Production Ready:** YES — die drei Low-Befunde sind kosmetisch bzw. latent und blockieren nicht
- **Recommendation:** PROJ-13 freigeben. Direkt nach dem Deploy zwei DB-Schritte nachziehen: (1) Standard-Vorgabe für `status` auf `'draft'` umstellen, (2) Phase 2 aus PROJ-12 (Übergangs-Trigger, Trigger-Funktion, alte Rabatt-Spalte entfernen). BUG-1 und BUG-2 bei Gelegenheit im Frontend beheben.

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-08-23
**Production URL:** https://multi-channel-marketing.vercel.app
**Commit:** `02ec3a0`
**Git Tag:** `v1.2.0-PROJ-13`

### Pre-Deployment-Checks
| Check | Ergebnis |
|---|---|
| `npm run build` | ✅ erfolgreich |
| `tsc --noEmit` | ✅ fehlerfrei |
| Unit-Tests | ✅ 99/99 |
| QA | ✅ Approved (0 Critical/High/Medium, 3 Low) |
| Migrationen angewendet | ✅ Status- und Freigabe-Spalten |
| Secrets | ✅ unverändert, keine neuen Variablen |
| `npm run lint` | ⚠️ im Projekt defekt (Next.js 16 hat `next lint` entfernt) — ersetzt durch Build + `tsc` |

### Deploy-Ablauf
Push auf `main` → Vercel-Production-Deploy. GitHub-Deployment `6053230876` (ref `02ec3a0`) meldet **success**.

**Hinweis:** Die erste Statusabfrage lief zu früh und lieferte den Erfolg des *vorherigen* Deployments (`ee58342`). Beim Prüfen eines Deploys deshalb immer gegen den erwarteten Commit-Ref abgleichen, nicht nur gegen „neuestes Deployment".

### Post-Deployment-Verifikation (HTTP gegen Produktion)
- `/login` → **200**
- `/tools/multi-channel-marketing/aktionen` → **307** → `/login`
- `/tools/multi-channel-marketing` → **307** → `/login`
- `/api/keep-alive` → **200** (bestätigt die DB-Verbindung)

### Nachgelagerte DB-Schritte (nach dem Deploy ausgeführt)
1. **`discount_actions_status_default_draft`** — Vorgabe für neue Aktionen von `'confirmed'` auf `'draft'` umgestellt. Vorher war `'confirmed'` nötig, damit der noch deployte alte Code (der die Spalte nicht kennt) weiterhin Kalender-Aktionen anlegt.
2. **`discount_value_per_brand_phase2`** (Nachlauf zu PROJ-12) — Übergangs-Trigger `discount_action_brands_legacy_value`, die zugehörige Funktion und die alte Spalte `discount_actions.discount_value` entfernt.

**Begründung für den Zeitpunkt von Schritt 2:** Direkt nach dem PROJ-12-Deploy wäre das riskant gewesen, weil ein Rollback auf die Vorversion die Spalte noch gelesen hätte. Inzwischen ist die einzige praktisch relevante Rollback-Stufe die PROJ-12-Version selbst — und die kommt ohne die alte Spalte aus.

**Kontrolle nach beiden Schritten:** alte Spalte weg (0), Brücken-Trigger weg (0), Brücken-Funktion weg (0), `status`-Default = `'draft'`, 11 Aktionen, 32 Marken-Zuordnungen, **0 Zuordnungen ohne Rabattwert**. Produktion danach erneut geprüft: alle Routen unverändert erreichbar.

### Offen
- **Manueller Smoke-Test durch den Nutzer** steht aus (Entwurf anlegen, filtern, übernehmen, im Kalender prüfen, zurücksetzen). Der Monats-Zoom wird vom Nutzer in der Praxis geprüft.
- **BUG-1** (Eingabetaste speichert als Entwurf) — vom Nutzer als akzeptabel eingestuft.
- **BUG-2** (Leerzustand im Monats-Zoom nennt keine Entwürfe) — wartet auf die Praxis-Rückmeldung.
- **BUG-3** (Merker wird beim Öffnen nicht zurückgesetzt) — latent, keine Auswirkung in gängigen Browsern.
