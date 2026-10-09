# Kokpit

> A private personal digital room for work, college, music, ideas, and the things worth keeping nearby.

Kokpit is a personal web workspace for one owner.
It brings everyday files, links, music, news, and ideas into a calm place that can stay open throughout the day.

The direction is **Dark Cozy Editorial Workspace**:
warm charcoal, soft off-white text, copper accents, and quiet editorial typography.
Kokpit should feel like a room to return to, without the pressure of a productivity dashboard.

## Preview

> Main screenshot will be added when the Kokpit interface is implemented.
> The current app is an unstyled React scaffold, not the final design.

<!-- Replace this preview note with a real screenshot when one is available. -->

## Core features

| Area | V1 experience |
| --- | --- |
| Home | Live clock, hourly thought, and lightweight feature previews |
| College | Semester → Course → Week → Material, with private files and links |
| Music | Personal audio library, playlists, and playback that persists across navigation |
| News | Curated technology and world news, with original source links |
| Ideas | Fast text capture, optional titles/tags, search, editing, and pinning |
| Library | Personal quick links with icons, favorites, and ordering |

These describe the planned V1, not features already shipped.
Public registration, team workspaces, task management, and embedded AI chat are outside V1.

## Project status

**Phase 1.1–1.5 is complete:** npm package, strict TypeScript, Vite + React, Cloudflare Vite integration, and Hono routing.
The app currently renders a minimal scaffold page.
The next documented step is **Phase 1.6: Configure Tailwind CSS**.

The Hono Worker exposes `GET /api/system/health` with `200 {"status":"ok"}` and returns structured 404 responses for unknown API routes. Feature APIs are pending.
Database, final UI, and production deployment are not implemented.
Install, typecheck, client/Worker build, and local dev/preview smoke checks passed on 2026-10-09.
See the [implementation plan](docs/planning/IMPLEMENTATION_PLAN.md) for the remaining work.

## Tech stack

| Layer | Approved stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS, Lucide |
| Server state | TanStack Query |
| Backend | Cloudflare Workers, Hono, Zod |
| Data | Cloudflare D1, Drizzle ORM |
| Files | Private Cloudflare R2 |
| Access | Cloudflare Access |
| Background work | Cloudflare Cron Triggers |
| Content AI | Workers AI for quote generation and optional news enrichment |

The production target is one Worker serving the React SPA and same-origin API,
with Access in front and D1/R2 behind it.
See [Architecture](docs/engineering/ARCHITECTURE.md) for system boundaries.

## Local development

Prerequisites: Git, npm, and Node.js `>=22.12.0` (Wrangler requires Node 22+).

```bash
npm ci
npm run dev
```

The dev server normally opens at `http://localhost:5173`.

| Command | Current behavior |
| --- | --- |
| `npm run typecheck` | Strict source checking; declaration checking exception per [DEC-049](docs/product/DECISIONS.md#dec-049--owner-approved-declaration-checking-exception) |
| `npm run build` | Typecheck, then client and Worker build |
| `npm run preview` | Serve the production build in the local Workers runtime |

Use `npm install` when intentionally updating dependencies and keep the lockfile with those changes.
Linting is scheduled for Phase 1.7; a test framework is not configured yet.
`npm run dev` runs React HMR and the Worker locally on the same origin.
SPA navigation falls back to `index.html`; `/api/*` reaches the Hono Worker.
Open `http://localhost:5173/api/system/health` to check the local health response.
Build output lives in `dist/client/` and `dist/kokpit/`; Vite generates the output Wrangler configuration.
No production resources or data bindings are configured yet.
Local Cloudflare setup and deployment belong in the [deployment runbook](docs/engineering/DEPLOYMENT.md).

## Documentation

| Document | Use it for |
| --- | --- |
| [PRD](docs/product/PRD.md) | Product vision, requirements, and V1 boundaries |
| [Design system](docs/design/DESIGN_SYSTEM.md) | Tokens, typography, layout, and interaction rules |
| [Architecture](docs/engineering/ARCHITECTURE.md) | Runtime, services, security, and failure boundaries |
| [Data model](docs/engineering/DATA_MODEL.md) | Tables, constraints, relationships, and lifecycle |
| [Content sources](docs/features/CONTENT_SOURCES.md) | Quotes, news sources, ranking, and refresh behavior |
| [File structure](docs/engineering/FILE_STRUCTURE.md) | Code placement and naming |
| [Implementation plan](docs/planning/IMPLEMENTATION_PLAN.md) | Phase-by-phase execution checklist |
| [Decisions](docs/product/DECISIONS.md) | Accepted decisions and their reasoning |
| [Deployment](docs/engineering/DEPLOYMENT.md) | Local setup, release steps, and recovery |
| [Agent rules](AGENTS.md) | Required behavior for coding agents |

Read the PRD for the product and the relevant technical document for implementation detail.
Agents must start with AGENTS.md.
