# PROJ-7: Kannibalisierungs-Warnung

## Status: Approved
**Created:** 2026-06-26
**Last Updated:** 2026-06-28

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

## Implementation Notes (Frontend)
**Stand:** 2026-06-28

Umgesetzt gemäß Tech Design — kein neues Schema, keine neuen Pakete.

- **`findActionConflicts`** (Server-Aktion, `src/app/tools/multi-channel-marketing/aktionen/actions.ts`): liest über `discount_action_brands` mit `!inner`-Join auf `discount_actions` (+ `brands`, `marketplaces`). Überlappungsfilter `start_date <= neu.end AND end_date >= neu.start`, Markenfilter via `.in("brand_id", …)`, Selbst-Ausschluss per `excludeId` in JS. Liefert je Treffer Marke + Kanal + Zeitraum + `sameChannel`-Flag; sortiert (gleicher Kanal zuerst). Bei technischem Fehler → `{ ok: false }` (Aufrufer blockiert nicht).
- **`ConflictWarningDialog`** (`src/components/conflict-warning-dialog.tsx`): shadcn `AlertDialog`, zwei Gruppen „Gleicher Kanal — Doppelrabatt-Risiko" und „Anderer Kanal — Kannibalisierung". Buttons „Trotzdem speichern" / „Abbrechen" (bewusst einfache Buttons statt `AlertDialogAction/Cancel`, damit das Schließen vom Speicher-Ergebnis abhängt, nicht vom Radix-Auto-Close).
- **`ActionFormDialog`** (`src/components/action-form-dialog.tsx`): Zwei-Schritt-Submit — erst `findActionConflicts`, bei Treffern Warn-Dialog (Eingaben bleiben über `pending` erhalten), sonst direkt speichern. `createAction`/`updateAction` unverändert. Bei Prüf-Fehler wird direkt gespeichert (nicht blockiert). Wirkt automatisch in Aktions-Liste **und** Kalender (geteilter Dialog).
- **PROJ-6 Mehrmarken**: Kalender lädt bereits über `action.brands` (Mehrmarken-Modell) — die in den Open Questions vermerkte Nachzieharbeit ist damit hinfällig.
- Verifikation: `tsc --noEmit` ohne Fehler, `npm test` 44/44 grün. (`npm run lint` projektweit defekt — siehe Projektnotiz.)

## QA Test Results

**Tested:** 2026-06-28
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Methodik:** Code-Review + statische Typprüfung (`tsc`) + Unit-Suite (`vitest`). Browser-/E2E-Lauf lokal nicht möglich (Projektnotiz: Playwright lokal instabil, kein Smoke gegen laufende App) → Route-Schutz-E2E für CI hinterlegt.

### Akzeptanzkriterien (Code-Review-Bewertung)

#### AC-1: Anderer Kanal → Kannibalisierungs-Hinweis
- [x] `findActionConflicts` findet überlappende Aktionen gleicher Marke mit `marketplace_id ≠ neu` → `sameChannel=false` → Gruppe „Anderer Kanal — Kannibalisierung" (Marke · Kanal · Zeitraum).

#### AC-2: Gleicher Kanal → Doppelrabatt-Hinweis
- [x] `marketplace_id === neu` → `sameChannel=true` → Gruppe „Gleicher Kanal — Doppelrabatt-Risiko" mit Hinweis, vor Freigabe zu prüfen.

#### AC-3: Beide Konfliktarten gemeinsam, getrennt gruppiert
- [x] Dialog rendert beide Sektionen unabhängig (`filter(sameChannel)` / `filter(!sameChannel)`).

#### AC-4: Kein Konflikt → speichern ohne Dialog
- [x] `onSubmit`: `conflicts.length === 0` → direkter `save()`, kein Dialog.

#### AC-5: Mehrmarken-Aktion → alle betroffenen Marken gelistet
- [x] `.in("brand_id", brandIds)` liefert je überlappender (Aktion×Marke)-Verknüpfung einen Eintrag; alle werden gelistet (Key `actionId:brandId`).

#### AC-6: Bearbeiten → Selbst-Ausschluss
- [x] `excludeId = action.id` wird herausgefiltert; eigene Aktion zählt nicht.

#### AC-7: „Trotzdem speichern" → speichert
- [x] `confirmSaveDespiteConflicts()` → `save(pending)` mit den unveränderten Eingaben.

#### AC-8: „Abbrechen" → nicht gespeichert, Formular bleibt mit Eingaben
- [x] `cancelConflict()` schließt nur den Warn-Dialog; Formular-Dialog + RHF-State bleiben erhalten.

#### AC-9: Prüf-Fehler → nicht dauerhaft blockiert
- [x] `findActionConflicts` liefert `{ ok: false }` bei Fehler → `onSubmit` fällt auf direkten `save()` durch (im Zweifel speicherbar).
- [x] **Verständliche Meldung** ergänzt (BUG-2 behoben 2026-06-28): Warn-Toast „Überschneidungen konnten nicht geprüft werden. Die Aktion wird ohne Prüfung gespeichert."

### Edge Cases (Code-Review-Bewertung)
- [x] **EC-1 Überlappung ≥ 1 Tag:** SQL `start_date ≤ end AND end_date ≥ start` ist inklusiv → 1 gemeinsamer Tag zählt.
- [x] **EC-2 Jahresübergreifend:** ISO-Datums-Stringvergleich = chronologisch korrekt.
- [x] **EC-3 Mehrere Konflikte:** alle gelistet, nach gleicher/anderer Kanal gruppiert; Sortierung gleicher Kanal zuerst, dann Marke.
- [x] **EC-4 Mehrmarken, nur eine kollidiert:** nur die kollidierende Marken-Verknüpfung trifft den `.in`+Overlap-Filter.
- [x] **EC-5 Gleiche Marke/Kanal, mehrere überlappende Aktionen:** je bestehender Aktion ein Eintrag.
- [x] **EC-6 Bearbeiten ohne relevante Änderung:** Prüfung läuft erneut, bestehender Fremd-Konflikt erscheint wieder.
- [x] **EC-7 Gleichzeitiges Anlegen:** Stand zum Speicherzeitpunkt, keine Sperre (Last-Write-Wins) — entspricht Spec.

### Security Audit (Red Team, Code-Ebene)
- [x] **Authentifizierung:** `findActionConflicts` prüft `getUser()`; Seite + Proxy schützen Route. Nicht eingeloggt → kein Datenleck (gibt `{ok:false}` zurück).
- [x] **Autorisierung/RLS:** nur Lese-Abfrage über bestehende Tabellen; RLS aus PROJ-1 greift (Team-weit geteilte Daten lt. PRD). Keine neuen Schreibpfade.
- [x] **Injection:** `brandIds` über parametrisiertes `.in()`, Datums-/ID-Filter über supabase-js-Parameter — keine String-Konkatenation in der PROJ-7-Abfrage.
- [x] **XSS:** Konfliktdaten (Marke/Kanal/Titel) werden als React-Text gerendert → auto-escaped.
- [x] **Datenexposition:** Dialog zeigt nur team-weit sichtbare Aktionsdaten (Titel/Kanal/Zeitraum) — akzeptabel im geteilten Mehrbenutzer-Modell.

### Bugs Found

#### BUG-1: Produktions-Build gebrochen — `tsc`/`next build` schlägt fehl  ✅ BEHOBEN 2026-06-28
- **Severity:** Critical (deployment-blockierend)
- **Fix:** `aktionen/page.tsx` übergibt jetzt `brandOptions` an `ActionManager`; `ActionManager`s `brands`-Prop ist auf `BrandOption[]` (inkl. `product_group_name`) angehoben. Verifiziert: `tsc --noEmit` clean, `vitest` 44/44 grün.
- **Steps to Reproduce:**
  1. `npx tsc --noEmit` (bzw. `npm run build`)
  2. Erwartet: keine Fehler
  3. Tatsächlich: `src/components/action-manager.tsx(189,9): error TS2322: Type 'Option[]' is not assignable to type 'BrandOption[]'. Property 'product_group_name' is missing …`
- **Root Cause:** Unvollständiger Marken-Gruppierungs-Refactor im Marken-Picker (**nicht** PROJ-7-Logik). `ActionFormDialog` erwartet jetzt `brands: BrandOption[]` mit `product_group_name`; `aktionen/page.tsx` baut zwar `brandOptions` (Zeile 86–90), übergibt aber an `ActionManager` weiterhin das rohe `brands` (Zeile 116), und `ActionManager` typisiert seinen `brands`-Prop noch als `Option[]` und reicht ihn an den Dialog weiter (Zeile 189).
- **Fix-Hinweis (für `/frontend`):** in `aktionen/page.tsx` `brandOptions` statt `brands` übergeben **und** `ActionManager`s `brands`-Prop-Typ auf `BrandOption[]` (inkl. `product_group_name`) anheben. Betrifft auch PROJ-5/PROJ-6, da derselbe Dialog geteilt wird.
- **Priority:** Fix before deployment

#### BUG-2: Bei fehlgeschlagener Konfliktprüfung keine Hinweis-Meldung  ✅ BEHOBEN 2026-06-28
- **Severity:** Low
- **Fix:** `onSubmit` zeigt bei `{ok:false}` einen Warn-Toast, bevor ohne Prüfung gespeichert wird. AC-9 damit vollständig erfüllt.
- **Steps to Reproduce:**
  1. Konfliktprüfung schlägt technisch fehl (z. B. DB-Fehler) → `findActionConflicts` gibt `{ok:false}` zurück
  2. Erwartet (AC-9): „verständliche Meldung", dass die Prüfung übersprungen wurde
  3. Tatsächlich: es wird kommentarlos gespeichert (nur normaler Speicher-Toast)
- **Priority:** Fix in next sprint (Verhalten ist nicht-blockierend und damit Spec-konform; nur die Meldung fehlt)

#### BUG-3 (Risiko, nicht verifiziert): Gestapelte Modals (Dialog + AlertDialog)
- **Severity:** Medium (unbestätigt — manuelle Verifikation nötig)
- **Beschreibung:** Der Warn-`AlertDialog` öffnet über dem bereits offenen Formular-`Dialog` (beide Radix-modal). Stacking funktioniert in shadcn i.d.R., aber Fokus-Trap/`pointer-events` können in Einzelfällen dazu führen, dass Buttons nicht klickbar sind oder die Seite nach dem Schließen gesperrt bleibt.
- **Status:** ✅ Manuell verifiziert am 2026-06-28 (Nutzer): Warn-Dialog stapelt korrekt; „Abbrechen" behält Eingaben & Formular bedienbar; „Trotzdem speichern" funktioniert; keine eingefrorene Seite. **Kein Bug.**

### Regression
- [x] Unit-Suite grün: **44/44** (`vitest run`), keine bestehenden Tests gebrochen.
- [ ] **BUG-1 ist eine feature-übergreifende Regression:** der Build-Bruch betrifft den geteilten `ActionFormDialog`/`ActionManager` und damit auch PROJ-5 (Aktionen) und PROJ-6 (Kalender).

### Summary
- **Acceptance Criteria:** **9/9 erfüllt**.
- **Bugs Found:** 3 → **alle erledigt am 2026-06-28** (BUG-1 Critical fixed, BUG-2 Low fixed, BUG-3 Medium manuell verifiziert = kein Bug).
- **Security:** Pass (keine Findings auf Code-Ebene).
- **Verifikation:** `tsc --noEmit` clean, `vitest` 44/44 grün, manueller Browser-Smoke (gestapelte Dialoge, Abbrechen/Trotzdem speichern) durch Nutzer bestätigt.
- **Production Ready:** **YES** — keine offenen Critical/High-Bugs.
- **Recommendation:** **Deploy** → `/deploy`.

### Manuelle Rest-Prüfung (BUG-3) — Checkliste
1. Eingeloggt eine Aktion anlegen, die eine bestehende Marke im überlappenden Zeitraum trifft → Warn-Dialog erscheint über dem Formular.
2. **Abbrechen** → Warn-Dialog schließt, Formular bleibt offen, alle Eingaben (Zeitraum/Marke) erhalten, Felder bedienbar.
3. **Trotzdem speichern** → speichert, beide Dialoge schließen, Seite/Liste/Kalender wieder bedienbar (kein „eingefrorener" Klick).
4. Gegenprobe ohne Konflikt → speichert direkt ohne Warn-Dialog.

## Deployment
_To be added by /deploy_
