# Product Requirements Document

## Vision
Ein webbasiertes Planungstool für Marketing-Teams, das alle Rabatt-Aktionen über sämtliche Marketplaces und Webshops hinweg in einem Jahreskalender visualisiert. Kernziel: zeitliche Überschneidungen derselben Marke auf verschiedenen Kanälen sichtbar machen und aktiv davor warnen, damit sich bezahlte Anzeigen nicht gegenseitig kannibalisieren.

## Target Users
Marketing-Teams (mehrere gleichberechtigte Nutzer), die parallel auf mehreren Marketplaces und eigenen Webshops Rabatt-Aktionen für verschiedene Marken planen. Schmerzpunkt heute: Es fehlt der zentrale Überblick — Aktionen werden unkoordiniert angesetzt, dieselbe Marke läuft versehentlich gleichzeitig auf mehreren Kanälen rabattiert, Ads konkurrieren miteinander.

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 (MVP) | Supabase-Infrastruktur (DB, Auth, Schema) | Planned |
| P0 (MVP) | Login / Team-Zugang | Roadmap |
| P0 (MVP) | Marketplaces & Webshops verwalten | Roadmap |
| P0 (MVP) | Marken verwalten (mit individueller Farbe) | Roadmap |
| P0 (MVP) | Rabatt-Aktionen anlegen & bearbeiten | Roadmap |
| P0 (MVP) | Jahreskalender-Übersicht | Roadmap |
| P0 (MVP) | Kannibalisierungs-Warnung | Roadmap |
| P1 | Monats-Zoom / Tagesansicht | Roadmap |
| P1 | Aktivitätsprotokoll (Admin: wer hat was gemacht) | Roadmap |
| P1 | Logo-Uploads für Marken & Marketplaces | Roadmap |

## Success Metrics
- Reduktion zeitgleicher Doppel-Rabattierungen derselben Marke auf verschiedenen Kanälen (Ziel: nahe 0 unbeabsichtigte Überschneidungen)
- Team plant Aktionen zentral im Tool statt in verteilten Listen/Tabellen
- Geplante Aktionen sind auf einen Blick im Jahreskalender erkennbar

## Constraints
- Kein zeitlicher Rahmen — iterative Entwicklung, MVP zuerst
- Backend: **Supabase** (PostgreSQL + Auth + Storage), da Team-Zugang & zentrale Datenhaltung nötig
- Mehrbenutzer-Tool, alle Nutzer gleichberechtigt (keine Rollen im MVP)
- Design: kein bestehendes CI; Standard-Look (Tailwind + shadcn/ui), Firmenlogo in der Kopfzeile als statisches Asset

## Non-Goals
- **Keine** Produkte als eigene Datenentität (produktspezifische Hinweise nur als Freitext-Kommentar in der Aktion)
- **Keine** automatische Anbindung an Marketplace-APIs (Aktionen werden manuell erfasst)
- **Kein** Blockieren von Überschneidungen — nur Warnen, der Nutzer entscheidet selbst
- **Keine** Benutzerrollen/Rechteverwaltung im MVP

---

## Datenmodell (Übersicht)
- **Marketplaces** (Name) — Marketplaces & eigene Webshops
- **Marken** (Name + individuelle Farbe)
- **Rabatt-Aktionen** (Titel, Marketplace, Marke, Startdatum, Enddatum, Rabattwert [Freitext], Kommentar [optional], erstellt von)
- **Nutzer** (Supabase Auth)
- **Aktivitätsprotokoll** (wer hat wann was geändert)

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
