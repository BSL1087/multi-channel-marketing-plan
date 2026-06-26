# PROJ-5: Rabatt-Aktionen anlegen & bearbeiten

## Status: Planned
**Created:** 2026-06-26
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — DB, RLS, Audit-Spalten.
- Requires: PROJ-2 (Login / Team-Zugang) — eingeloggter Zugang, serverseitig geschützte Seite.
- Requires: PROJ-3 (Marketplaces & Webshops) — Kanal-Auswahl je Aktion.
- Requires: PROJ-4 (Marken verwalten) — Marken-Auswahl je Aktion (mit Farbe für die Liste).

## User Stories
- Als **Team-Mitglied** möchte ich eine Rabatt-Aktion anlegen (Titel, Kanal, Marke, Zeitraum, Rabattwert, optional Kommentar), damit geplante Aktionen zentral erfasst sind.
- Als **Team-Mitglied** möchte ich alle Aktionen in einer Liste sehen (chronologisch nach Startdatum), damit ich den Überblick behalte, bevor der Kalender (PROJ-6) kommt.
- Als **Team-Mitglied** möchte ich eine Aktion bearbeiten, damit ich Zeitraum, Rabattwert oder Zuordnung korrigieren kann.
- Als **Team-Mitglied** möchte ich eine Aktion löschen (mit Bestätigung), damit veraltete Einträge verschwinden.
- Als **Team-Mitglied** möchte ich beim Löschen einer Marke/eines Kanals gewarnt werden, wenn daran Aktionen hängen, damit ich weiß, dass diese mitgelöscht werden.

## Out of Scope
- **Kalender-/Timeline-Darstellung** der Aktionen → PROJ-6.
- **Kannibalisierungs-Warnung** bei zeitlicher Überschneidung derselben Marke → PROJ-7.
- **Aktion direkt im Kalender anlegen** (Klick/Drag) → PROJ-6.
- **Filter/Suche** in der Aktionsliste (nach Kanal/Marke/Jahr) — zurückgestellt (siehe Open Questions).
- **Wiederkehrende Aktionen / Serien** — nicht im MVP.
- **Strukturierter Rabattwert** (Prozent vs. Betrag als eigene Felder) — bewusst Freitext.
- **Produkt-Auswahl als eigene Entität** — produktspezifische Hinweise nur als Freitext-Kommentar (PRD-Entscheidung).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeigen & Leerzustand
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Aktions-Verwaltung öffnet, dann sieht er eine chronologisch (nach Startdatum) sortierte Liste aller Aktionen (je Zeile: Titel, Marke mit Farb-Swatch, Kanal, Zeitraum, Rabattwert) und einen „Aktion hinzufügen"-Button.
- [ ] Angenommen es ist noch keine Aktion angelegt, wenn der Nutzer die Verwaltung öffnet, dann sieht er einen Leerzustand-Hinweis und einen „Aktion hinzufügen"-Button.
- [ ] Angenommen es existiert noch keine Marke **oder** kein Kanal, wenn der Nutzer eine Aktion anlegen will, dann sieht er einen Hinweis (mit Link zur Marken- bzw. Kanal-Verwaltung) und das Anlegen ist nicht möglich.
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er die Aktions-Verwaltung aufruft, dann wird er zur Login-Seite weitergeleitet.

### Anlegen / Bearbeiten
- [ ] Angenommen Marken und Kanäle existieren, wenn der Nutzer „Aktion hinzufügen" wählt, alle Pflichtfelder (Titel, Kanal, Marke, Start, Ende, Rabattwert) gültig ausfüllt und speichert, dann erscheint die Aktion in der Liste und es wird eine Erfolgsmeldung angezeigt.
- [ ] Angenommen ein Pflichtfeld fehlt, wenn der Nutzer speichert, dann wird je fehlendem Feld eine Validierungsmeldung angezeigt und nichts gespeichert.
- [ ] Angenommen das Enddatum liegt vor dem Startdatum, wenn der Nutzer speichert, dann erscheint eine Validierungsmeldung und nichts wird gespeichert.
- [ ] Angenommen Start = Ende, wenn der Nutzer speichert, dann wird die eintägige Aktion akzeptiert.
- [ ] Angenommen eine Aktion existiert, wenn der Nutzer sie bearbeitet (beliebige Felder ändert) und gültig speichert, dann werden die Änderungen übernommen und eine Erfolgsmeldung angezeigt.

### Löschen (inkl. Auswirkung auf Marke/Kanal)
- [ ] Angenommen eine Aktion existiert, wenn der Nutzer „Löschen" wählt, dann erscheint ein Bestätigungsdialog (mit Titel), bevor die Aktion entfernt wird.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn der Nutzer abbricht, dann bleibt die Aktion unverändert bestehen.
- [ ] Angenommen eine Marke/ein Kanal hat zugeordnete Aktionen, wenn der Nutzer die Marke/den Kanal löschen will, dann erscheint eine Warnung mit der **Anzahl** der betroffenen Aktionen und dem Hinweis, dass diese mitgelöscht werden; erst nach Bestätigung werden Marke/Kanal **und** ihre Aktionen entfernt.

### Speichern & Audit
- [ ] Angenommen eine Aktion wird angelegt oder geändert, wenn gespeichert wird, dann werden die Audit-Spalten (`created_by`/`created_at` bzw. `updated_by`/`updated_at`) automatisch serverseitig gesetzt.
- [ ] Angenommen das Speichern schlägt fehl (z.B. Verbindungsfehler), wenn der Nutzer speichert, dann erscheint eine Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Leere / nur-Leerzeichen-Pflichtfelder** → Validierung, nichts gespeichert (Titel/Rabattwert werden getrimmt).
- **Enddatum vor Startdatum** → Validierungsmeldung (zusätzlich DB-Check-Constraint).
- **Eintägige Aktion (Start = Ende)** → erlaubt.
- **Jahresübergreifender Zeitraum (28.12.–03.01.)** → erlaubt; Darstellung übernimmt PROJ-6.
- **Marke/Kanal wird gelöscht, während Aktionen darauf verweisen** → Warnung mit Anzahl, Mitlöschen erst nach Bestätigung (DB: ON DELETE CASCADE).
- **Aktion wird gelöscht, während ein anderer Nutzer sie bearbeitet** → beim Speichern Hinweis „existiert nicht mehr", Liste wird aktualisiert.
- **Gleichzeitiges Bearbeiten derselben Aktion** → Last-Write-Wins (kein Sperrmechanismus im MVP).
- **Mehrere überlappende Aktionen derselben Marke** → in PROJ-5 erlaubt; die Warnung dazu kommt in PROJ-7.
- **Netzwerk-/Serverfehler beim Speichern/Löschen** → Fehlermeldung, ursprünglicher Zustand bleibt erhalten.

## Technical Requirements
- Security: Zugriff nur für eingeloggte Nutzer; RLS nach PROJ-1-Konvention (anon → kein Zugriff; authenticated → Lesen/Schreiben/Löschen); Seite serverseitig absichern.
- Daten: Audit-Spalten (`created_by`, `created_at`, `updated_by`, `updated_at`) serverseitig per Trigger.
- Daten: `end_date >= start_date` als DB-Check-Constraint (zusätzlich zur Formular-Validierung).
- Daten: Fremdschlüssel zu Marke und Kanal mit **ON DELETE CASCADE** (Mitlöschen). Die App zeigt vor dem Löschen einer Marke/eines Kanals die Anzahl betroffener Aktionen als Warnung.
- UI: shadcn/ui-Komponenten wiederverwenden (Card, Table, Input, Label, Button, Dialog, AlertDialog, Form, Select); Datumsauswahl über geeignete Komponente — Architektur-Entscheidung in `/architecture`.

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] **Filter/Suche in der Aktionsliste** (nach Kanal/Marke/Jahr) — bei vielen Aktionen voraussichtlich nützlich, aber nicht MVP-kritisch. Eigenes Folge-Feature?
- [ ] **Konsistenz Lösch-Verhalten:** Produktgruppen-Löschen ist hart blockiert (PROJ-11), Marken/Kanäle werden künftig „warnen + cascade" (PROJ-5). Später vereinheitlichen?
- [ ] **Maximale Feldlängen** (Titel, Rabattwert, Kommentar) final in `/architecture` festlegen (Vorschlag: Titel ≤ 80, Rabattwert ≤ 50, Kommentar ≤ 500).

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Verwaltungsseite (Liste + Formular) statt nur Kalender | PROJ-6 existiert noch nicht; macht PROJ-5 eigenständig nutzbar/testbar | 2026-06-26 |
| Pflicht: Titel, Kanal, Marke, Start, Ende, Rabattwert; Kommentar optional | Titel als lesbares Label; Kanal/Marke/Zeitraum sind der Kern; Rabattwert essenziell | 2026-06-26 |
| Rabattwert als Freitext | Mal Prozent, mal Betrag — flexibel (PRD-Entscheidung) | 2026-06-26 |
| Enddatum ≥ Startdatum; eintägig & jahresübergreifend erlaubt | Reale Planungsfälle; Validierung schützt vor Tippfehlern | 2026-06-26 |
| Löschen von Marke/Kanal mit Aktionen: Warnung + Bestätigung → Mitlöschen (Cascade) | „Warnen statt blockieren"-Philosophie; konkrete Anzahl-Warnung schützt vor Versehen | 2026-06-26 |
| Lösch-Dialoge von PROJ-3/PROJ-4 um Anzahl-Warnung ergänzen | Nutzer sieht beim Löschen von Kanal/Marke die Folgen für Aktionen | 2026-06-26 |
| Keine Eindeutigkeit/Überschneidungssperre für Aktionen | Überschneidungen sind erlaubt; davor warnt PROJ-7 | 2026-06-26 |
| Chronologische Sortierung (Startdatum), keine manuelle Reihenfolge | Einfach und vorhersehbar; Filter/Sortierung später | 2026-06-26 |

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
