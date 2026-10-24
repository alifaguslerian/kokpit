# Kokpit

> A private personal digital room for work, college, music, ideas, and the things worth keeping nearby.

Kokpit is a personal web workspace for one owner.
It brings everyday files, links, music, news, and ideas into a calm place that can stay open throughout the day.

The direction is **Dark Cozy Editorial Workspace**:
warm charcoal, soft off-white text, copper accents, and quiet editorial typography.
Kokpit should feel like a room to return to, without the pressure of a productivity dashboard.

## Preview

The application has a responsive shell, Home, College, Ideas and Library. A runtime screenshot
is not committed yet; the reference gallery below contains design concepts.

The owner-supplied Stitch concepts for all six pages are saved in the
[UI reference gallery](docs/design/UI_REFERENCES.md). They guide the planned interface;
the [Design System](docs/design/DESIGN_SYSTEM.md) specifies its refined V1 layouts.
These concepts are separate from the implemented-app preview above.

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

**Milestones 1–3 are complete (packages 1.1–3.3).** Foundation includes the 17-table
Drizzle schema and local migration, explicit owner context, Zod boundaries and safe
API errors. Ideas supports capture, search, tags, pinning, editing, deletion and
paginated browsing. Library supports shortcuts, icons, favorites and persistent ordering.
Home uses real Ideas/Library/College data, a local clock and temporary unattributed
session thoughts. Music and News previews have honest empty states.

**Packages 4.1–4.2 are complete:** owner-scoped Semester, Course and Week APIs,
College pages, semester selection/activation, course ordering, metadata forms and
confirmed hierarchy deletion. Home shows a saved course/week from the active semester.
Week pages have a material placeholder; uploads and material links are not available yet.
The next documented package is **4.3: Private Storage & Material APIs**.
R2 file handling, real playback, hourly D1 quotes, News ingestion and private production
deployment remain pending. Cloudflare Access is part of that deployment, not a custom login.

The Worker currently exposes `/api/system/health`, `/api/ideas`, `/api/quick-links`
and `/api/college`. The [package 4.1 contract](docs/planning/IMPLEMENTATION_PLAN.md#41-semester-course--week-apis)
documents College routes, response shapes and temporary file-deletion guards.
See the [pre-College audit fixes](docs/planning/AUDIT_FIXES.md) for regression coverage
and validation limits.
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
| `npm run lint` | Run ESLint across frontend and Worker code |
| `npm run format:check` | Check code formatting via Prettier |
| `npm run format` | Format code via Prettier |
| `npm run typecheck` | Strict source checking; declaration checking exception per [DEC-049](docs/product/DECISIONS.md#dec-049--owner-approved-declaration-checking-exception) |
| `npm run build` | Typecheck, then client and Worker build |
| `npm test` | Run unit/API tests, ownership and failure-rollback regressions via tsx and node:test |
| `npm run test:browser` | Run audit and College browser regressions against a running local app; setup below |
| `npm run preview` | Serve the production build in the local Workers runtime |
| `npm run db:generate` | Generate SQL migration from Drizzle schema |
| `npm run db:migrate:local` | Apply pending migrations to local D1 database |
| `npm run db:seed:local` | Execute local D1 database seed for owner user and settings |

Use `npm install` when intentionally updating dependencies and keep the lockfile with those changes.
Linting and formatting are configured via ESLint and Prettier; integration tests run via `npm test`.
`npm run dev` runs React HMR and the Worker locally on the same origin.
Tailwind uses the official Vite plugin and `src/styles/globals.css`, scanning `src/`.
Kokpit semantic tokens, Inter and Cormorant Garamond, explicit base styles and the
documented 4px spacing unit control the interface. Tailwind utilities are imported
without Preflight; its utility theme is overridden with the Kokpit tokens.
SPA navigation falls back to `index.html`; `/api/*` reaches the Hono Worker.
Open `http://localhost:5173/api/system/health` to check the local health response.
Build output lives in `dist/client/` and `dist/kokpit/`; Vite generates the output Wrangler configuration.
The configured D1 binding uses a placeholder remote ID for local development.
No production resources, private R2 binding or Access deployment are configured here.
Local Cloudflare setup and deployment belong in the [deployment runbook](docs/engineering/DEPLOYMENT.md).

### Browser regressions

Start `npm run dev` in one terminal. In a second terminal, use an existing Playwright
installation and browser; the test runner adds no project dependency. Codex desktop
can resolve its bundled module with `load_workspace_dependencies`.

```powershell
$env:KOKPIT_PLAYWRIGHT_MODULE = '<absolute path to an existing playwright module>'
$env:KOKPIT_BROWSER_CHANNEL = 'chrome'
npm run test:browser
```

`KOKPIT_TEST_BASE_URL` defaults to `http://127.0.0.1:5173`. Omit the channel to use
Playwright's installed Chromium. Optional `KOKPIT_TEST_SCREENSHOTS` names an output
directory. The browser loads the real UI, while API requests use the Hono app and
a fresh in-memory SQLite D1 adapter. No test writes to local or production Kokpit data.
These tests do not verify production Cloudflare Access or remote storage.

## Documentation

| Document | Use it for |
| --- | --- |
| [PRD](docs/product/PRD.md) | Product vision, requirements, and V1 boundaries |
| [Design system](docs/design/DESIGN_SYSTEM.md) | Tokens, typography, layout, and interaction rules |
| [UI references](docs/design/UI_REFERENCES.md) | Original Stitch screens, visual analysis, and their mapping to V1 |
| [Architecture](docs/engineering/ARCHITECTURE.md) | Runtime, services, security, and failure boundaries |
| [Data model](docs/engineering/DATA_MODEL.md) | Tables, constraints, relationships, and lifecycle |
| [Content sources](docs/features/CONTENT_SOURCES.md) | Quotes, news sources, ranking, and refresh behavior |
| [File structure](docs/engineering/FILE_STRUCTURE.md) | Code placement and naming |
| [Implementation plan](docs/planning/IMPLEMENTATION_PLAN.md) | Milestones, work packages, and acceptance checklists |
| [Decisions](docs/product/DECISIONS.md) | Accepted decisions and their reasoning |
| [Deployment](docs/engineering/DEPLOYMENT.md) | Local setup, release steps, and recovery |
| [Agent rules](AGENTS.md) | Required behavior for coding agents |

Read the PRD for the product and the relevant technical document for implementation detail.
Agents must start with AGENTS.md.
