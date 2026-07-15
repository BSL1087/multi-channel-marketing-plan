# PROJ-10: Logo-Uploads für Marken & Marketplaces

## Status: Planned
**Created:** 2026-06-29
**Last Updated:** 2026-06-29

## Dependencies
- Requires: PROJ-1 (Supabase-Infrastruktur) — für DB, RLS, Audit-Spalten und **Supabase Storage** (Logo-Dateien).
- Requires: PROJ-2 (Login / Team-Zugang) — eingeloggter Zugang, serverseitig geschützte Seiten; Hochladen/Entfernen nur für eingeloggte Nutzer.
- Requires: PROJ-3 (Marketplaces & Webshops verwalten) — Kanal-Entität + Verwaltungsseite/-Dialog, die um ein Logo erweitert werden.
- Requires: PROJ-4 (Marken verwalten) — Marken-Entität + Verwaltungsseite/-Dialog, die um ein Logo erweitert werden; Markenfarbe dient als Fallback-Hintergrund.
- Requires: PROJ-6 (Jahreskalender-Übersicht) — PROJ-10 ergänzt die bestehende Kalender-Ansicht **additiv** um Logo-Anzeige (Kanal-Logo im Zeilenkopf, Marken-Logo im Tooltip).

## User Stories
- Als **Team-Mitglied** möchte ich beim Anlegen oder Bearbeiten einer **Marke** ein Logo (PNG) hochladen, damit die Marke überall visuell wiedererkennbar ist.
- Als **Team-Mitglied** möchte ich beim Anlegen oder Bearbeiten eines **Kanals** (Marketplace/Webshop) ein Logo hochladen, damit ich Kanäle schneller am Bild erkenne.
- Als **Team-Mitglied** möchte ich ein bestehendes Logo **ersetzen oder entfernen**, damit ich veraltete oder falsche Logos korrigieren kann.
- Als **Team-Mitglied** möchte ich in der Marken- und Kanal-Liste neben dem Namen eine **Logo-Vorschau** sehen, damit ich die Einträge schneller erfasse.
- Als **Team-Mitglied** möchte ich im **Jahreskalender** das Kanal-Logo am Zeilenkopf und das Marken-Logo im Balken-Tooltip sehen, damit ich Kanäle und Marken auch dort visuell wiedererkenne.
- Als **Team-Mitglied** möchte ich für Einträge ohne Logo trotzdem eine saubere Darstellung sehen (farbiger Kreis mit Initiale), damit nie eine leere Lücke entsteht.

## Out of Scope
- **Logo-Anzeige direkt auf den Aktions-Balken** im Kalender → bewusst verworfen (Balken oft zu schmal); Marken-Logo erscheint nur im Tooltip.
- **Server-seitiges Zuschneiden / Skalieren / Komprimieren** der Bilder → nicht im MVP; das Logo wird wie hochgeladen gespeichert und nur per Anzeige-Box (fixe Größe, `object-contain`) begrenzt.
- **Weitere Bildformate** (JPG, WebP, SVG, GIF) → bewusst ausgeschlossen; nur **PNG** im MVP (Transparenz, einfache & sichere Validierung, kein SVG-XSS-Risiko).
- **Logo als Pflichtfeld** → Logos sind überall **optional**; ohne Logo greift der Fallback (farbiger Kreis mit Initiale).
- **Logo für andere Entitäten** (Produktgruppen PROJ-11, Rabatt-Aktionen PROJ-5) → nicht Teil von PROJ-10.
- **Bildergalerie / mehrere Logos pro Eintrag** → genau ein Logo pro Marke bzw. Kanal.
- **Drag & Drop-Upload, Zwischenablage-Paste** → nicht im MVP (klassischer Datei-Auswahl-Dialog genügt); kann später ergänzt werden.
- **Sonstige Änderungen am Kalender (PROJ-6)** außer der Logo-Anzeige → PROJ-10 fasst die Kalenderlogik sonst nicht an.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Hochladen (Marke & Kanal, beim Anlegen und Bearbeiten)
- [ ] Angenommen der Nutzer öffnet den „Marke anlegen/bearbeiten"- bzw. „Kanal anlegen/bearbeiten"-Dialog, wenn der Dialog erscheint, dann sieht er ein optionales Logo-Feld mit der aktuellen Logo-Vorschau (oder dem Fallback-Kreis, falls keins gesetzt ist).
- [ ] Angenommen der Nutzer wählt eine gültige PNG-Datei (≤ 1 MB), wenn er sie auswählt, dann erscheint sofort eine Vorschau des Logos im Dialog, noch bevor gespeichert wird.
- [ ] Angenommen der Nutzer hat ein Logo gewählt, wenn er den Eintrag speichert, dann wird das Logo gespeichert und erscheint anschließend in der Liste (und im Kalender).
- [ ] Angenommen der Nutzer wählt eine Datei, die **kein PNG** ist, wenn er sie auswählt, dann erscheint eine Fehlermeldung („Nur PNG-Dateien erlaubt") und die Datei wird nicht übernommen.
- [ ] Angenommen der Nutzer wählt eine PNG-Datei **größer als 1 MB**, wenn er sie auswählt, dann erscheint eine Fehlermeldung („Maximal 1 MB") und die Datei wird nicht übernommen.

### Ersetzen & Entfernen
- [ ] Angenommen ein Eintrag hat bereits ein Logo, wenn der Nutzer im Bearbeiten-Dialog eine neue PNG-Datei wählt und speichert, dann ersetzt das neue Logo das alte und das alte wird aus dem Speicher entfernt.
- [ ] Angenommen ein Eintrag hat ein Logo, wenn der Nutzer „Logo entfernen" wählt und speichert, dann hat der Eintrag danach kein Logo mehr und es wird wieder der Fallback-Kreis angezeigt; die Datei wird aus dem Speicher entfernt.

### Anzeige (Liste, Dialog, Kalender)
- [ ] Angenommen eine Marke/ein Kanal hat ein Logo, wenn der Nutzer die jeweilige Verwaltungsliste öffnet, dann sieht er das Logo als kleines Thumbnail neben dem Namen.
- [ ] Angenommen eine Marke/ein Kanal hat **kein** Logo, wenn der Nutzer die Liste, den Dialog oder den Kalender ansieht, dann erscheint ein Fallback: ein Kreis mit der Initiale des Namens — bei Marken in der Markenfarbe, bei Kanälen in neutralem Grau.
- [ ] Angenommen Kanäle haben Logos, wenn der Nutzer den Jahreskalender öffnet, dann erscheint je Kanal-Zeile das Kanal-Logo (oder der Fallback) im Zeilenkopf neben dem Kanalnamen.
- [ ] Angenommen eine Aktion gehört zu einer Marke mit Logo, wenn der Nutzer über deren Balken hovert, dann zeigt der Tooltip zusätzlich das Marken-Logo (oder den Fallback).

### Sicherheit & Fehlerfälle
- [ ] Angenommen der Nutzer ist **nicht** eingeloggt, wenn er versucht, ein Logo hoch- oder herunterzuladen bzw. eine geschützte Seite aufzurufen, dann wird der Zugriff verweigert bzw. er wird zur Login-Seite weitergeleitet.
- [ ] Angenommen der Upload schlägt fehl (z.B. Verbindungsfehler), wenn der Nutzer speichert, dann erscheint eine Fehlermeldung und die übrigen Eingaben (Name, Farbe, Gruppe) bleiben erhalten.
- [ ] Angenommen ein Eintrag wird gelöscht (Marke/Kanal), wenn das Löschen erfolgreich ist, dann wird auch dessen Logo-Datei aus dem Speicher entfernt (keine verwaisten Dateien).

## Edge Cases
- **Datei ist kein PNG** (JPG, SVG, PDF, umbenannte Endung …) → Validierung lehnt ab; geprüft wird der echte Dateityp, nicht nur die Endung.
- **PNG > 1 MB** → Validierungsmeldung, keine Übernahme.
- **Sehr breites/hohes oder winziges Logo** → Anzeige in fixer Box mit `object-contain` (Seitenverhältnis bleibt erhalten, kein Verzerren); sehr kleine Logos werden nicht hochskaliert über die Box hinaus.
- **Transparentes PNG** → wird korrekt mit transparentem Hintergrund dargestellt (Box-Hintergrund neutral).
- **Logo ersetzen, aber Speichern schlägt fehl** → altes Logo bleibt erhalten, neues wird nicht übernommen, Fehlermeldung.
- **Eintrag wird gelöscht, während die Logo-Datei nicht entfernt werden kann** → der Datensatz wird trotzdem gelöscht (Daten haben Vorrang); eine verwaiste Datei wird in Kauf genommen bzw. später aufgeräumt (siehe Open Questions).
- **Gleichzeitiges Bearbeiten** zweier Nutzer am selben Eintrag → Last-Write-Wins wie bei PROJ-3/PROJ-4; das zuletzt gespeicherte Logo gewinnt.
- **Logo-Datei fehlt/lädt nicht** (gelöscht, kaputter Verweis) → Anzeige fällt automatisch auf den Fallback-Kreis zurück, keine kaputten Bild-Symbole.
- **Eintrag ohne Logo** → überall Fallback-Kreis mit Initiale (nie leer).

## Technical Requirements
- Storage: Logo-Dateien in **Supabase Storage**; je Eintrag genau eine Datei. Der Verweis (Pfad/URL) wird in der jeweiligen Tabelle (`brands`, `marketplaces`) als optionale Spalte gespeichert.
- Security: Hochladen/Ersetzen/Löschen von Logos nur für **eingeloggte** Nutzer (Storage-Policies analog zur RLS-Konvention aus PROJ-1: anon kein Schreiben). Die genaue Lesbarkeit (öffentlich lesbarer Bucket vs. signierte/proxied URLs) entscheidet `/architecture` — Logos sind nicht vertraulich, der Rest der App ist aber auth-gated.
- Security: Dateityp serverseitig verifizieren (echter PNG-Inhalt, nicht nur Endung/Client-Check); Größenlimit (1 MB) auch serverseitig durchsetzen.
- Aufräumen: beim Ersetzen, Entfernen und beim Löschen des Eintrags wird die zugehörige Datei aus dem Storage gelöscht (keine Datei-Leichen).
- UX: Upload mit Ladezustand und Vorschau; Rückmeldungen via Toast (sonner, vorhanden). Anzeige als fixe Box mit `object-contain`.
- UI: shadcn/ui-Komponenten wiederverwenden (Dialog, Form, Button, Avatar/Card etc.) — keine Eigenbauten; ein gemeinsames Logo-Upload-/Anzeige-Bauteil für Marken und Kanäle.
- Daten: Audit-Spalten der bestehenden Tabellen werden beim Logo-Update normal mitgeführt (`updated_by`/`updated_at`).

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [x] **Bucket-Lesbarkeit:** Entschieden in `/architecture` (2026-06-29) → **privater Bucket, Abruf nur über signierte, kurzlebige URLs** (nichts öffentlich; Nutzerwunsch).
- [ ] **Verwaiste Dateien:** Wenn das Löschen der Storage-Datei beim Entfernen/Löschen scheitert, bleibt eine verwaiste Datei zurück. Reicht „best effort" im MVP, oder wollen wir später einen Aufräum-Job? Zurückgestellt.
- [ ] **Server-Bildoptimierung:** Auto-Resize/Komprimierung später nachrüsten, falls große PNGs die Ladezeit (v.a. im Kalender mit vielen Logos) spürbar belasten?

## Decision Log
<!-- Record of conscious decisions made and why. Added to by /write-spec and /architecture. -->

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Ein Spec für beide Entitäten (Marken **und** Kanäle) | Upload-Mechanismus, Validierung, Storage und Anzeige sind identisch; ein gemeinsames Bauteil, in einem Rutsch deploybar — Aufteilen brächte nur doppelten Workflow | 2026-06-29 |
| Logos überall **optional**, mit Fallback | Anfangs hat kein Eintrag ein Logo; das Tool muss ohne Logos voll funktionieren | 2026-06-29 |
| Fallback = farbiger Kreis mit Initiale (Marke: Markenfarbe, Kanal: grau) | Nutzt die bei Marken bereits vorhandene Farbe (PROJ-4); nie eine leere Lücke, gut unterscheidbar | 2026-06-29 |
| Nur **PNG**, max **1 MB** | Transparenz-Unterstützung, einfache & sichere Validierung; kein SVG (XSS-Risiko); kleine Obergrenze hält den Kalender mit vielen Logos schnell | 2026-06-29 |
| Logo setzbar **beim Anlegen und Bearbeiten**, inkl. Ersetzen & Entfernen | Kein Zwei-Schritt-Umweg für ein neues Logo; volle Kontrolle über das Bild | 2026-06-29 |
| Kalender: Kanal-Logo im **Zeilenkopf**, Marken-Logo im **Tooltip** (nicht auf dem Balken) | Fester Platz im Zeilenkopf bzw. genug Raum im Tooltip; Balken sind oft zu schmal | 2026-06-29 |
| Bilder werden wie hochgeladen gespeichert, nur per Anzeige-Box begrenzt (kein Server-Resize) | Hält das MVP schlank; `object-contain` bewahrt das Seitenverhältnis | 2026-06-29 |
| Alte Datei beim Ersetzen/Entfernen/Löschen aus dem Storage entfernen | Vermeidet Datei-Leichen und unnötigen Speicherverbrauch | 2026-06-29 |
| Logo-Anzeige im Kalender erweitert PROJ-6 nur additiv | PROJ-6 ist bereits live; PROJ-10 fasst nur die Anzeige an, keine Kalenderlogik | 2026-06-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Logos in **Supabase Storage**, **privater** Bucket `logos` | Nutzer-Uploads können nicht in den Code-/Projektordner (Vercel-Dateisystem zur Laufzeit read-only); Storage gehört zum eigenen Projekt. Privat = nichts öffentlich abrufbar (Nutzerwunsch) | 2026-06-29 |
| Abruf nur über **signierte, kurzlebige URLs**, serverseitig erzeugt | Bilddatei nur mit gültiger Sitzung sichtbar; passt zur sonst auth-gegateten App. Server Components erzeugen die Links beim Laden und reichen sie an die Client-Teile | 2026-06-29 |
| Schreiben/Ersetzen/Löschen nur für `authenticated` (Storage-Policies), `anon` kein Zugriff | Konsistent mit der RLS-Konvention aus PROJ-1/PROJ-3/PROJ-4 | 2026-06-29 |
| Upload läuft über die **bestehenden Server-Aktionen** (create/update), nicht per Direkt-Upload aus dem Browser | Eine vertrauenswürdige Stelle prüft Typ (echtes PNG per Signatur-Bytes) und Größe (≤ 1 MB) serverseitig und räumt alte Dateien auf; konsistent mit „alles über Server Actions + RLS" | 2026-06-29 |
| Je Tabelle (`brands`, `marketplaces`) eine **optionale Spalte `logo_path`** (Objekt-Pfad, keine URL) | Die signierte URL wird beim Rendern erzeugt; gespeichert wird nur der stabile Pfad → flexibel, kein veralteter Link in der DB | 2026-06-29 |
| Dateipfad `<{brands\|marketplaces}>/{id}/{zufalls-token}.png`, alte Datei beim Ersetzen löschen | Eindeutiger Name je Upload vermeidet veraltete Caches; Aufräumen verhindert Datei-Leichen | 2026-06-29 |
| Gemeinsame Anzeige-Komponente **`LogoAvatar`** auf Basis der vorhandenen shadcn-`Avatar` (Bild + Initiale-Fallback) | Eine Komponente für Liste, Dialog, Kalender-Zeilenkopf und Tooltip; Marke färbt den Fallback in ihrer Farbe, Kanal neutral grau | 2026-06-29 |
| Gemeinsame Eingabe-Komponente **`LogoUploadField`** (PNG-Picker + Vorschau + „Entfernen"), eingebunden in beide Form-Dialoge | Identischer Upload-Flow für Marke und Kanal ohne Doppelcode; integriert sich in react-hook-form | 2026-06-29 |
| Geteiltes Modul **`logo-validation.ts`** (PNG, ≤ 1 MB) für Client- und Server-Prüfung | Regeln laufen nicht auseinander, analog `channel-/brand-validation.ts` | 2026-06-29 |
| Kalender-Serverseite lädt zusätzlich `logo_path` für Kanäle und Marken und erzeugt signierte URLs (Batch) | Additive Erweiterung der PROJ-6-Datenladung; Kanal-/Marken-Typen um `logo_url` ergänzt | 2026-06-29 |
| **Keine neuen Pakete** | `@supabase/ssr`, shadcn `Avatar`, react-hook-form, zod, sonner, lucide-react sind vorhanden | 2026-06-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Stand:** 2026-06-29

### Überblick
PROJ-10 fügt zwei bereits gebauten Entitäten — Marken (`brands`, PROJ-4) und Kanälen (`marketplaces`, PROJ-3) — ein **optionales Logo** hinzu. Die Logo-Dateien liegen in **Supabase Storage** in einem **privaten Bucket**; abgerufen werden sie nur über serverseitig erzeugte, kurzlebige **signierte Links** (nichts ist öffentlich). Hochladen, Ersetzen und Entfernen laufen über die **bestehenden Server-Aktionen** der beiden Verwaltungsseiten — dieselbe „Server Actions + RLS"-Linie wie im ganzen Projekt, ohne neue Pakete. Angezeigt werden Logos über eine gemeinsame Komponente (Bild mit Initiale-Fallback) in den Verwaltungslisten, in den Dialogen und — additiv — im Jahreskalender (Kanal-Logo im Zeilenkopf, Marken-Logo im Tooltip).

### Was neu gebaut wird (im Überblick)
```
Speicher (Supabase Storage)
└── privater Bucket "logos"
    ├── brands/{markenId}/{token}.png
    └── marketplaces/{kanalId}/{token}.png
        (genau eine Datei pro Eintrag; nur PNG, ≤ 1 MB; Schreiben/Löschen nur eingeloggt)

Datenmodell (additive Spalte)
├── brands.logo_path        (optional, Objekt-Pfad — kein Link)
└── marketplaces.logo_path  (optional, Objekt-Pfad — kein Link)

Gemeinsame Bausteine
├── LogoAvatar (Anzeige)    Bild + Initiale-Fallback (Marke: Markenfarbe · Kanal: grau)
├── LogoUploadField (Eingabe)  PNG-Picker + Live-Vorschau + „Entfernen"
└── logo-validation.ts      geteilte Regeln (PNG, ≤ 1 MB) für Client & Server

Wo es auftaucht
├── Marken-Liste / Kanal-Liste     → LogoAvatar je Zeile
├── Marke/Kanal anlegen+bearbeiten → LogoUploadField im Dialog
└── Jahreskalender (PROJ-6, additiv)
    ├── Zeilenkopf je Kanal  → LogoAvatar (Kanal)
    └── Balken-Tooltip       → LogoAvatar je beteiligter Marke
```

### Datenmodell (in einfacher Sprache)
- Jede **Marke** und jeder **Kanal** bekommt eine zusätzliche, **optionale** Angabe `logo_path` — den Speicher-Pfad der Logo-Datei (kein fertiger Link). Ist sie leer, gibt es kein Logo → Fallback-Kreis.
- Die **Datei** selbst liegt im privaten Storage-Bucket `logos`, getrennt nach `brands/…` und `marketplaces/…`, genau eine pro Eintrag, ausschließlich PNG bis 1 MB.
- Der anzeigbare **Link** wird nie gespeichert, sondern beim Laden der Seite serverseitig als **signierte, ablaufende URL** frisch erzeugt und an die Oberfläche gereicht.

### Sicherheits-Regelwerk
- **Bucket privat:** anonyme/öffentliche Abrufe nicht möglich. Lesen nur über signierte Links, die eine eingeloggte Sitzung serverseitig anfordert.
- **Schreiben/Ersetzen/Löschen** von Dateien nur für eingeloggte Nutzer (Storage-Policies analog PROJ-1; `anon` = kein Zugriff).
- **Typ & Größe** werden in der Server-Aktion serverseitig geprüft (echtes PNG anhand der Datei-Signatur, ≤ 1 MB) — nicht nur im Browser.

### Abläufe (was passiert wann)
- **Hochladen / Ersetzen:** Im Dialog wählt der Nutzer eine PNG-Datei → sofortige Vorschau. Beim Speichern geht die Datei an die bestehende Server-Aktion (`createBrand`/`updateBrand` bzw. die Kanal-Aktionen). Die Aktion prüft Typ/Größe, legt die Datei unter einem eindeutigen Pfad ab, speichert `logo_path` und **löscht beim Ersetzen die alte Datei**.
- **Entfernen:** „Logo entfernen" im Dialog → beim Speichern wird `logo_path` geleert und die Datei aus dem Storage gelöscht; danach erscheint der Fallback-Kreis.
- **Anzeigen:** Beim Laden einer Liste bzw. des Kalenders erzeugt die Server-Komponente für alle vorhandenen `logo_path` (gebündelt) signierte Links und gibt sie als `logo_url` weiter. `LogoAvatar` zeigt das Bild oder — wenn kein Pfad/Link oder Ladefehler — den Initiale-Kreis.
- **Löschen einer Marke/eines Kanals:** Die bestehende Lösch-Aktion entfernt zusätzlich die Logo-Datei (best effort), damit keine verwaisten Dateien zurückbleiben.

### Integration in den Kalender (PROJ-6, nur additiv)
Die Kalender-Serverseite lädt heute Kanäle als `{id, name}` und Marken mit Farbe. PROJ-10 ergänzt das Laden um `logo_path` (Kanäle **und** Marken) und erzeugt die signierten `logo_url`. Im Client kommt im **Zeilenkopf** ein `LogoAvatar` vor den Kanalnamen und im **Balken-Tooltip** ein kleines `LogoAvatar` je beteiligter Marke. Die Kalenderlogik (Layout, Balken, Stapeln) bleibt unverändert.

### Benötigte Pakete
Keine neuen. Wiederverwendet: `@supabase/ssr` (Storage über die vorhandenen Server-/Browser-Clients), shadcn/ui **`Avatar`** (bereits installiert), `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, `lucide-react`.

### Was dieses Feature NICHT enthält (Architektur-Sicht)
- Kein öffentlicher Bucket, keine dauerhaften öffentlichen Bild-URLs.
- Kein serverseitiges Skalieren/Zuschneiden/Komprimieren; keine weiteren Formate außer PNG.
- Keine Logos auf den Aktions-Balken; keine sonstigen Kalender-Änderungen.
- Kein Aufräum-Job für verwaiste Dateien (best-effort-Löschung genügt im MVP — siehe Open Questions).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
