# PROJ-7: Kannibalisierungs-Warnung

## Status: Planned
**Created:** 2026-06-26
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — DB/RLS.
- Requires: PROJ-2 (Login / Team-Zugang) — eingeloggter Zugang, serverseitige Prüfung.
- Requires: PROJ-5 (Rabatt-Aktionen, inkl. Mehrmarken-Verknüpfung `discount_action_brands`) — die zu prüfenden Aktionen und Marken.
- Wirkt in allen Anlege-/Bearbeiten-Dialogen für Aktionen (Aktions-Liste und Kalender PROJ-6, da derselbe Dialog/Speicherweg).

## User Stories
- Als **Team-Mitglied** möchte ich beim Speichern einer Aktion gewarnt werden, wenn dieselbe Marke im überlappenden Zeitraum bereits rabattiert ist, damit ich Kannibalisierung bzw. doppelte Rabatte bewusst vermeiden oder zulassen kann.
- Als **Team-Mitglied** möchte ich die konkreten Konflikte sehen (Marke, Kanal, Zeitraum) — getrennt nach „anderer Kanal" und „gleicher Kanal" — damit ich fundiert entscheide.
- Als **Marketplace-Manager** möchte ich bei einer zweiten überlappenden Aktion derselben Marke auf demselben Kanal gewarnt werden, damit ich vor der Freigabe doppelte/stapelnde Rabatte prüfe.
- Als **Team-Mitglied** möchte ich „Trotzdem speichern" oder „Abbrechen" wählen, damit ich nicht blockiert werde, aber bewusst handle.

## Out of Scope
- **Blockieren** der Aktion — es wird nur gewarnt.
- **Dauerhafte visuelle Markierung** der Konflikte im Kalender (Icon/Hervorhebung) → späteres Folge-Feature.
- **Warnung wegen ähnlicher (nicht identischer) Marken / gleicher Produktgruppe** — nur exakt dieselbe Marke zählt.
- **Rückwirkende Prüfung / Report aller bestehenden Konflikte** — die Prüfung erfolgt nur beim Speichern der gerade bearbeiteten Aktion.
- **Berücksichtigung der Rabatthöhe** (z. B. Summe der Prozente) — der Rabattwert ist Freitext; es wird nur auf Überschneidung geprüft, nicht gerechnet.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen dieselbe Marke ist im überlappenden Zeitraum auf einem **anderen** Kanal rabattiert, wenn der Nutzer speichert, dann erscheint ein Warn-Dialog mit einem **Kannibalisierungs**-Hinweis (Marke + anderer Kanal + dessen Zeitraum).
- [ ] Angenommen dieselbe Marke ist im überlappenden Zeitraum auf **demselben** Kanal in einer **anderen** Aktion rabattiert, wenn der Nutzer speichert, dann erscheint ein **Doppelrabatt**-Hinweis (Marke + Kanal + Zeitraum) mit dem Vermerk, die Aktion vor Freigabe zu prüfen.
- [ ] Angenommen es liegen **beide** Konfliktarten vor, wenn der Nutzer speichert, dann werden sie gemeinsam aufgelistet, klar getrennt nach „gleicher Kanal" und „anderer Kanal".
- [ ] Angenommen es gibt keinen Marken-Überschneidungs-Konflikt, wenn der Nutzer speichert, dann wird ohne zusätzlichen Dialog gespeichert.
- [ ] Angenommen die Aktion hat **mehrere** Marken, wenn mehrere davon überlappen, dann listet der Dialog alle betroffenen Marken mit ihrem jeweiligen Konflikt (Kanal + Zeitraum).
- [ ] Angenommen der Nutzer **bearbeitet** eine Aktion, wenn geprüft wird, dann wird die Aktion selbst nicht als Konflikt mit sich gewertet.
- [ ] Angenommen der Warn-Dialog ist offen, wenn der Nutzer „Trotzdem speichern" wählt, dann wird die Aktion gespeichert.
- [ ] Angenommen der Warn-Dialog ist offen, wenn der Nutzer „Abbrechen" wählt, dann wird **nicht** gespeichert und das Formular bleibt mit den Eingaben offen (Zeitraum/Marke anpassbar).
- [ ] Angenommen die Konfliktprüfung schlägt technisch fehl (z. B. Verbindungsfehler), wenn der Nutzer speichert, dann wird er nicht dauerhaft blockiert (verständliche Meldung; im Zweifel kann gespeichert werden).

## Edge Cases
- **Überlappung = mindestens ein gemeinsamer Tag** (auch 1 Tag zählt).
- **Jahresübergreifende Zeiträume** → Überschneidung wird datumsbasiert korrekt erkannt.
- **Mehrere Konflikte** (mehrere Kanäle/Aktionen) → alle werden aufgelistet, gruppiert nach gleicher/anderer Kanal.
- **Aktion mit mehreren Marken**, von denen nur eine kollidiert → nur diese Marke wird gemeldet.
- **Gleiche Marke, gleicher Kanal, mehrere überlappende Aktionen** → Doppelrabatt-Hinweis je betroffener Aktion.
- **Bearbeiten ohne relevante Änderung** → Prüfung läuft erneut; bestehender Konflikt wird erneut angezeigt.
- **Gleichzeitiges Anlegen durch zwei Nutzer** → Prüfung nutzt den Stand zum Speicherzeitpunkt; keine Sperre (Last-Write-Wins).

## Technical Requirements
- Security: nur eingeloggt; Konfliktprüfung **serverseitig** (verlässlich, unabhängig vom Client).
- Konsistenz: greift überall, wo Aktionen gespeichert werden (Liste und Kalender) — derselbe Speicher-/Warn-Mechanismus.
- Daten: nutzt die Mehrmarken-Verknüpfung (`discount_action_brands`) zur Ermittlung gemeinsamer Marken.

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] Soll die Warnung später auch dauerhaft im Kalender markiert werden (Icon/Hervorhebung)? (Folge-Feature)
- [ ] **PROJ-6-Kalender auf Mehrmarken-Modell nachziehen** (lädt Marke noch im Einzel-Modell) — nötig für korrekte Anzeige und für das Anlegen mit Warnung direkt aus dem Kalender.

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Warnung bei überlappender gleicher Marke **kanalübergreifend (Kannibalisierung) UND auf demselben Kanal (Doppelrabatt-Risiko)** | Kanalübergreifend konkurrieren Ads; gleicher Kanal birgt Gefahr stapelnder Rabatte (z. B. 20 % + 15 %) — beides soll der Manager vor Freigabe prüfen | 2026-06-26 |
| Warnen statt blockieren (mit Konfliktliste, getrennt nach gleicher/anderer Kanal) | Nutzer entscheidet bewusst; deckt sich mit der App-Philosophie | 2026-06-26 |
| Prüfung beim Anlegen **und** Bearbeiten, Selbst-Ausschluss | Konsistenter Schutz ohne Fehlalarm gegen die eigene Aktion | 2026-06-26 |
| Mehrmarken: Prüfung je Marke (gemeinsame Marke zählt) | Aktionen können mehrere Marken haben; jede kann kollidieren | 2026-06-26 |
| Nur Save-Time-Dialog, keine dauerhafte Kalender-Markierung (MVP) | Fokus; deckt den Kernwunsch ab | 2026-06-26 |
| Keine Berücksichtigung der Rabatthöhe | Rabattwert ist Freitext; nur Überschneidung wird geprüft, nicht gerechnet | 2026-06-26 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Serverseitige Konflikt-Prüf-Aktion (`findActionConflicts`) getrennt vom Speichern | Verlässliche Prüfung mit Nutzer-Sitzung/RLS; eine Abfrage; wiederverwendbar in Liste & Kalender | 2026-06-26 |
| Zwei-Schritt-Flow im Formular: erst prüfen → ggf. warnen → dann speichern | „Warnen statt blockieren"; `createAction`/`updateAction` bleiben unverändert (kein Force-Flag nötig) | 2026-06-26 |
| Überschneidung per DB-Abfrage: `existing.start_date <= neu.end AND existing.end_date >= neu.start` und **gemeinsame Marke** über `discount_action_brands`; Selbst-Ausschluss per `action_id` | Standard-Intervallüberlappung; nutzt die Mehrmarken-Verknüpfung | 2026-06-26 |
| Ergebnis je Konflikt: Marke + Kanal + Zeitraum + Flag „gleicher/anderer Kanal" | Dialog kann nach Doppelrabatt (gleicher Kanal) und Kannibalisierung (anderer Kanal) gruppieren | 2026-06-26 |
| Neuer `ConflictWarningDialog` (AlertDialog), wiederverwendet im bestehenden `ActionFormDialog` | Greift automatisch in Liste **und** Kalender (gleicher Dialog) | 2026-06-26 |
| Bei Prüf-Fehler nicht blockieren (im Zweifel speicherbar) | Eine technische Störung soll die Arbeit nicht verhindern | 2026-06-26 |
| Keine neuen Pakete, kein neues Schema | AlertDialog vorhanden; nur Lese-Abfrage auf bestehende Tabellen | 2026-06-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-26

### Überblick
PROJ-7 fügt **keine** neuen Daten hinzu — es prüft beim Speichern einer Aktion, ob eine **gleiche Marke** in einem **überlappenden Zeitraum** bereits in einer anderen Aktion rabattiert ist, und zeigt bei Treffern einen nicht-blockierenden Warn-Dialog. Die Prüfung läuft serverseitig über die bestehenden Tabellen (`discount_actions`, `discount_action_brands`, `marketplaces`, `brands`). Da der bestehende `ActionFormDialog` aus PROJ-5 sowohl in der Aktions-Liste als auch im Kalender (PROJ-6) genutzt wird, wirkt die Warnung überall automatisch.

### Ablauf (Zwei-Schritt beim Speichern)
```
ActionFormDialog (Speichern geklickt)
├── 1. Formular validieren (wie bisher)
├── 2. findActionConflicts(kanal, zeitraum, markenIds, excludeId?)   [Server]
│      → Liste der Konflikte (Marke · Kanal · Zeitraum · gleicher/anderer Kanal)
├── 3a. keine Konflikte → direkt speichern (createAction/updateAction)
└── 3b. Konflikte → ConflictWarningDialog öffnen
        ├── Gruppe „Gleicher Kanal — Doppelrabatt-Risiko": Marke · Kanal · Zeitraum
        ├── Gruppe „Anderer Kanal — Kannibalisierung": Marke · Kanal · Zeitraum
        ├── „Trotzdem speichern" → speichern → onSuccess
        └── „Abbrechen" → zurück zum Formular (Eingaben bleiben)
```

### Konflikt-Erkennung (in einfacher Sprache)
Eine andere Aktion ist ein Konflikt, wenn **alle** zutreffen:
- sie ist **nicht** die gerade bearbeitete Aktion (Selbst-Ausschluss),
- ihr Zeitraum **überschneidet** sich mit dem neuen (mind. ein gemeinsamer Tag),
- sie teilt **mindestens eine Marke** mit der neuen Aktion.

Pro Treffer wird festgehalten: betroffene **Marke**, **Kanal** + **Zeitraum** der bestehenden Aktion, und ob es **derselbe** Kanal (→ Doppelrabatt) oder ein **anderer** Kanal (→ Kannibalisierung) ist.

### Komponenten/Bausteine
- **`findActionConflicts`** — neue Server-Aktion (`use server`) in der Aktionen-Logik; eine Abfrage über die Verknüpfungstabelle mit Überlappungs- und Marken-Filter; liefert die Konfliktliste.
- **`ConflictWarningDialog`** — neue Client-Komponente (shadcn `AlertDialog`), zeigt die zwei Gruppen und „Trotzdem speichern"/„Abbrechen".
- **`ActionFormDialog`** (aus PROJ-5) — Submit-Handler wird um den Prüf-Schritt erweitert (prüfen → ggf. warnen → speichern). `createAction`/`updateAction` bleiben unverändert.

### Datenmodell
Keine Änderung. Genutzt: `discount_actions` (Zeitraum, Kanal), `discount_action_brands` (Marken je Aktion), `marketplaces` (Kanalname), `brands` (Markenname). RLS wie bisher.

### Benötigte Pakete
Keine neuen.

### Hinweis / Abhängigkeit
Der **Jahreskalender (PROJ-6)** lädt die Marke noch im alten Einzel-Modell und muss auf die Mehrmarken-Verknüpfung nachgezogen werden, damit Aktionen dort korrekt erscheinen und die Warnung beim Anlegen aus dem Kalender sinnvoll greift (siehe Open Questions). Das ist unabhängig von der PROJ-7-Logik, aber für die durchgängige Nutzung relevant.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
