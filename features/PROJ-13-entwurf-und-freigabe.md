# PROJ-13: Entwurf & Freigabe (Aktions-Status)

## Status: Planned
**Created:** 2026-08-23
**Last Updated:** 2026-08-23

## Dependencies
- Requires: PROJ-5 (Rabatt-Aktionen) — Aktionen, Formular-Dialog, Aktionsliste.
- Requires: PROJ-6 (Jahreskalender) — Entwürfe werden dort unterscheidbar dargestellt und ausblendbar.
- Requires: PROJ-7 (Kannibalisierungs-Warnung) — die Konfliktprüfung berücksichtigt Entwürfe und läuft zusätzlich beim Freigeben.
- Betrifft: PROJ-8 (Monats-Zoom) — gleiche Entwurfs-Darstellung wie im Jahreskalender.
- Empfohlen danach: PROJ-12 (Rabattwert je Marke) sollte **vorher** gebaut sein — beide Features fassen denselben Formular-Dialog an.
- **Kein** Rollen-/Rechtesystem erforderlich (siehe Product Decisions).

## Problemstellung
Heute landet jede gespeicherte Aktion sofort im Jahreskalender und gilt damit als verbindlich geplant. Der reale Ablauf ist aber zweistufig: Ein Abteilungsleiter (z.B. Fitness) plant eine Aktion mit markenspezifischen Rabatten vor, der Marketplace-Manager legt sie anschließend im jeweiligen Marketplace (z.B. Amazon) tatsächlich an — und **erst danach** ist sie verbindlich. Ohne Zwischenzustand ist im Kalender nicht unterscheidbar, was geplant und was real eingebucht ist.

## User Stories
- Als **Abteilungsleiter** möchte ich eine Aktion als Entwurf speichern, damit ich sie vorbereiten kann, ohne dass sie schon als verbindliche Kalender-Aktion gilt.
- Als **Marketplace-Manager** möchte ich alle offenen Entwürfe sehen, damit ich weiß, was ich im Marketplace anzulegen habe.
- Als **Marketplace-Manager** möchte ich einen Entwurf nach erfolgreichem Anlegen im Marketplace in den Kalender übernehmen, damit die Jahresübersicht nur real gebuchte Aktionen als verbindlich zeigt.
- Als **Team-Mitglied** möchte ich Entwürfe im Kalender optisch klar von verbindlichen Aktionen unterscheiden können, damit ich die Planung sehe, ohne sie zu verwechseln.
- Als **Team-Mitglied** möchte ich Entwürfe ausblenden können, damit ich eine aufgeräumte Jahresübersicht der verbindlichen Aktionen bekomme.
- Als **Team-Mitglied** möchte ich beim Planen vor Überschneidungen gewarnt werden, **auch wenn** die andere Aktion nur ein Entwurf ist, damit keine Doppelplanung entsteht.
- Als **Team-Mitglied** möchte ich eine bereits übernommene Aktion zurück auf Entwurf setzen können, damit ich reagieren kann, wenn der Marketplace die Aktion doch ablehnt.
- Als **Team-Mitglied** möchte ich sehen, wer eine Aktion wann in den Kalender übernommen hat, damit der Freigabeschritt nachvollziehbar ist.

## Out of Scope
- **Rollen- und Rechtesystem** (wer darf freigeben) — bewusst nicht; siehe Product Decisions.
- **Freigabe je Marke** statt je Aktion — Status gilt zunächst für die gesamte Aktion.
- **Benachrichtigungen** (E-Mail/Push „neuer Entwurf liegt vor") — nicht im Umfang.
- **Kommentar-/Rückfrage-Funktion** zwischen Planer und Marketplace-Manager.
- **Dritter Status „Abgelehnt/Verworfen"** — vorerst nur Entwurf und Im Kalender.
- **Vollständiges Änderungsprotokoll** → PROJ-9 (Aktivitätsprotokoll).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anlegen mit Status
- [ ] Angenommen der Nutzer legt eine neue Aktion an, wenn das Formular gültig ist, dann stehen zwei Speicher-Optionen zur Verfügung: „Als Entwurf speichern" (sekundär) und „In Kalender übernehmen" (primär).
- [ ] Angenommen der Nutzer wählt „Als Entwurf speichern", wenn gespeichert wird, dann erhält die Aktion den Status **Entwurf** und erscheint als Entwurf in Liste und Kalender.
- [ ] Angenommen der Nutzer wählt „In Kalender übernehmen", wenn gespeichert wird, dann erhält die Aktion den Status **Im Kalender** und wird wie bisher als verbindliche Aktion dargestellt.
- [ ] Angenommen eine bestehende Aktion wird bearbeitet, wenn der Nutzer speichert, dann bleibt ihr bisheriger Status unverändert (Statuswechsel erfolgt über eine eigene Aktion, nicht als Nebeneffekt des Speicherns).

### Freigeben & Zurücksetzen
- [ ] Angenommen ein Entwurf existiert, wenn der Nutzer in Liste oder Kalender „In Kalender übernehmen" wählt, dann erscheint eine Bestätigung mit Titel, Kanal und Zeitraum, und nach Bestätigung wechselt der Status auf **Im Kalender**.
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
- [ ] Angenommen ein Entwurf liegt im dargestellten Zeitraum, wenn der Nutzer den Jahreskalender öffnet, dann wird der Balken **optisch klar unterscheidbar** dargestellt (schraffiert bzw. nur umrandet statt gefüllt) und behält die Markenfarbe.
- [ ] Angenommen Entwürfe werden dargestellt, wenn der Nutzer die Legende betrachtet, dann erklärt sie die Entwurfs-Darstellung.
- [ ] Angenommen der Nutzer will eine aufgeräumte Übersicht, wenn er den Schalter „Entwürfe anzeigen" deaktiviert, dann verschwinden alle Entwürfe aus der Darstellung; die Einstellung bleibt beim nächsten Aufruf erhalten.
- [ ] Angenommen der Schalter ist deaktiviert, wenn eine neue Aktion als Entwurf gespeichert wird, dann erscheint ein Hinweis (Toast), dass sie als Entwurf gespeichert wurde und aktuell ausgeblendet ist.
- [ ] Angenommen der Nutzer öffnet den Monats-Zoom (PROJ-8), wenn Entwürfe im Monat liegen, dann gilt dieselbe Darstellung und derselbe Schalter-Zustand.

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
- **Alle Aktionen sind Entwürfe und der Schalter ist aus** → der Kalender zeigt einen Leerzustand mit Hinweis „X Entwürfe ausgeblendet" und Schnellzugriff zum Einblenden.
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
- UI: Kalender-Balken für Entwürfe über CSS-Muster (Schraffur/Outline) auf Basis der Markenfarbe — kein zusätzlicher Farbkanal, damit die Markenzuordnung erkennbar bleibt; Muster muss auch bei sehr schmalen Balken unterscheidbar sein.
- UI: Schalter „Entwürfe anzeigen" (shadcn `Switch` oder `Toggle`), Standard **an**, Zustand pro Nutzer im `localStorage` gemerkt; Kalender und Monats-Zoom teilen sich den Zustand.
- UI: shadcn/ui wiederverwenden (Badge, Switch/Toggle, AlertDialog, Select für den Filter) — keine Eigenbauten.
- Tests: Unit-Tests für Statuswechsel-Regeln (Setzen/Zurücksetzen, `confirmed_*`-Konsistenz) und für die Kalender-Filterung nach Status.

## Open Questions
- [ ] Soll der Schalter „Entwürfe anzeigen" standardmäßig **an** (empfohlen, siehe Product Decisions) oder aus sein?
- [ ] Braucht es später einen dritten Status „Abgelehnt" (Marketplace hat die Aktion nicht angenommen), oder reicht „Zurück auf Entwurf" plus Kommentar?
- [ ] Soll die Freigabe je Marke möglich sein, wenn ein Marketplace-Manager nur einen Teil der Marken einbuchen konnte?
- [ ] Soll beim Anlegen der Standard-Button „Als Entwurf speichern" oder „In Kalender übernehmen" sein (aktuell vorgesehen: Übernehmen als primärer Button, Entwurf als sekundärer)?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Zwei Status: Entwurf / Im Kalender | Bildet den realen Zwei-Schritt-Ablauf ab (planen → im Marketplace anlegen → verbindlich), ohne einen Workflow-Baukasten zu bauen | 2026-08-23 |
| **Kein** Rollensystem | Das Projekt hat heute keins (PROJ-2 = gemeinsamer Team-Zugang). Für ein kleines Team genügt „wer hat übernommen" via `confirmed_by`; Rollen wären Overhead und eine eigene Baustelle | 2026-08-23 |
| Entwürfe erscheinen im Kalender, aber schraffiert/umrandet | Vollständig unsichtbare Entwürfe hebeln die Kannibalisierungs-Warnung aus: ein Fitness-Entwurf, den Familie nicht sieht, führt genau zur Doppelplanung, die der Kalender verhindern soll | 2026-08-23 |
| Schalter „Entwürfe anzeigen", Standard an, Zustand gemerkt | Verbindliche Jahresübersicht auf einen Klick, ohne dass Planung dauerhaft im Blindflug passiert | 2026-08-23 |
| Konfliktprüfung berücksichtigt Entwürfe, kennzeichnet sie aber | Frühzeitige Warnung, ohne dass ein Entwurf wie eine gebuchte Aktion wirkt | 2026-08-23 |
| Status gilt je Aktion, nicht je Marke | Deutlich einfacher (ein Klick statt n); Teil-Freigabe erst nachziehen, wenn sie sich im Alltag als nötig zeigt | 2026-08-23 |
| Statuswechsel als eigene Aktion, nicht als Nebeneffekt des Speicherns | Verhindert versehentliche Freigabe beim Korrigieren eines Tippfehlers | 2026-08-23 |
| „Zurück auf Entwurf" ist möglich (mit Bestätigung) | Marketplaces lehnen Aktionen ab oder Termine verschieben sich — der Weg muss in beide Richtungen gehen | 2026-08-23 |
| Bestandsaktionen werden „Im Kalender" | Sie galten bisher als verbindlich; alles andere würde den Kalender rückwirkend entwerten | 2026-08-23 |
| Übernehmen bleibt trotz Konflikten möglich | Konsistent mit der „warnen statt blockieren"-Philosophie aus PROJ-7 | 2026-08-23 |

### Technical Decisions
<!-- Added by /architecture -->

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## Implementation Notes (Frontend)
_To be added by /frontend_

## Implementation Notes (Backend)
_To be added by /backend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
