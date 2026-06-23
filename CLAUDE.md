# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI Coding Starter Kit

> A Next.js template with an AI-powered development workflow using specialized skills for Requirements, Architecture, Frontend, Backend, QA, and Deployment.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Backend:** Supabase (PostgreSQL + Auth + Storage) — MCP server configured in `.mcp.json`
- **Deployment:** Vercel
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API

## Project Structure

```
src/
  app/              Pages (Next.js App Router)
  components/
    ui/             shadcn/ui components (NEVER recreate these)
  hooks/            Custom React hooks
  lib/              Utilities (supabase.ts, utils.ts)
features/           Feature specifications (PROJ-X-name.md)
  INDEX.md          Feature status overview
docs/
  PRD.md            Product Requirements Document
  production/       Production guides (Sentry, security, performance)
```

## Development Workflow

1. `/init` - Initialize the project: PRD + feature map (run once at the very start)
2. `/write-spec` - Create a full feature spec for one feature
3. `/architecture` - Design tech architecture (PM-friendly, no code)
4. `/frontend` - Build UI components (shadcn/ui first!)
5. `/backend` - Build APIs, database, RLS policies
6. `/qa` - Test against acceptance criteria + security audit
7. `/deploy` - Deploy to Vercel + production-ready checks

Use `/refine PROJ-X` at any point to revisit and improve an existing feature spec.

## Feature Tracking

All features tracked in `features/INDEX.md`. Every skill reads it at start and updates it when done. Feature specs live in `features/PROJ-X-name.md`.

## Key Conventions

- **Feature IDs:** PROJ-1, PROJ-2, etc. (sequential)
- **Commits:** `feat(PROJ-X): description`, `fix(PROJ-X): description`
- **Single Responsibility:** One feature per spec file
- **shadcn/ui first:** NEVER create custom versions of installed shadcn components. Add new ones via `npx shadcn@latest add <component>`
- **Human-in-the-loop:** All workflows have user approval checkpoints
- **Tests:** Unit tests co-located next to source files (`useHook.test.ts` next to `useHook.ts`). E2E tests in `tests/`.

## Build & Test Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Production server
npm test             # Vitest unit tests (single run)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with interactive UI
npm run test:all     # Both test suites
```

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=     # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY= # From Supabase project API settings
```

## Supabase MCP

The Supabase MCP server is configured in `.mcp.json` (gitignored). When active, use MCP tools directly for:
- Schema inspection: `list_tables`, `execute_sql`
- Migrations: `apply_migration`, `list_migrations`
- TypeScript types: `generate_typescript_types`
- Logs & advisors: `get_logs`, `get_advisors`

Always use `list_tables` before making schema changes to understand the existing structure.

## Product Context

@docs/PRD.md

## Feature Overview

@features/INDEX.md
