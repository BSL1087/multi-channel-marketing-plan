# Product Requirements Document

## Vision
Ein webbasiertes Planungstool für Marketing-Teams, das alle Rabatt-Aktionen über sämtliche Marketplaces und Webshops hinweg in einem Jahreskalender visualisiert. Kernziel: zeitliche Überschneidungen derselben Marke auf verschiedenen Kanälen sichtbar machen und aktiv davor warnen, damit sich bezahlte Anzeigen nicht gegenseitig kannibalisieren.

## Target Users
Marketing-Teams (mehrere gleichberechtigte Nutzer), die parallel auf mehreren Marketplaces und eigenen Webshops Rabatt-Aktionen für verschiedene Marken planen. Schmerzpunkt heute: Es fehlt der zentrale Überblick — Aktionen werden unkoordiniert angesetzt, dieselbe Marke läuft versehentlich gleichzeitig auf mehreren Kanälen rabattiert, Ads konkurrieren miteinander.

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 (MVP) | Supabase-Infrastruktur (DB, Auth, Schema) | Planned |
| P0 (MVP) | Login / Team-Zugang | Planned |
| P0 (MVP) | Marketplaces & Webshops verwalten | Planned |
| P0 (MVP) | Produktgruppen verwalten | Planned |
| P0 (MVP) | Marken verwalten (mit individueller Farbe) | Planned |
| P0 (MVP) | Rabatt-Aktionen anlegen & bearbeiten | Planned |
| P0 (MVP) | Jahreskalender-Übersicht | Planned |
| P0 (MVP) | Kannibalisierungs-Warnung | Planned |
| P1 | Monats-Zoom / Tagesansicht | Planned |
| P1 | Aktivitätsprotokoll (wer hat was gemacht) | Planned |
| P1 | Logo-Uploads für Marken & Marketplaces | Planned |

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
- **Produktgruppen** (Name, z.B. „Fitness", „Familie") — eigene **verwaltbare Liste** (anleg-/umbenenn-/löschbar wie die Kanäle), gestartet mit Fitness + Familie; zur Gruppierung/Filterung der Marken
- **Marken** (Name + individuelle Farbe + Zuordnung zu einer Produktgruppe)
- **Rabatt-Aktionen** (Titel, Marketplace, Marke, Startdatum, Enddatum, Rabattwert [Freitext], Kommentar [optional], erstellt von)
- **Nutzer** (Supabase Auth)
- **Aktivitätsprotokoll** (wer hat wann was geändert)

> **Hinweis (Entscheidung 2026-06-24):** Der Jahreskalender (PROJ-6) wird nach **Produktgruppe/Marke** filterbar, damit z.B. das Fitness-Team nur seine Aktionen sieht. Deshalb erhält jede Marke eine Produktgruppe (PROJ-4). Ein Plattform-Typ am Kanal (Marketplace/Webshop) wurde dafür bewusst zurückgestellt.

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
