# Kokpit — File Structure

**Version:** 1.2 | **Status:** V1 structure reference | **Updated:** 2026-10-28

This document defines where code belongs. Product behavior, runtime design, and
persisted entities remain in [PRD](../product/PRD.md),
[Architecture](ARCHITECTURE.md), and [Data Model](DATA_MODEL.md).

## Current scaffold and growth

Packages 1.1–3.5 and 4.1–4.5 are implemented locally. `src/app/` owns the routed shell/providers;
Home, College, Ideas and Library have feature implementations. `worker/api/`,
`worker/services/` and `worker/db/repositories/` contain Ideas, Quick Links and
the College hierarchy APIs (package 4.1). `tests/integration/college-api.test.ts`
covers College lifecycle, ownership, validation, ordering and rollback behavior.
The schema and reviewed initial migration include the 17-table baseline. The approved
20-table target adds later migrations. Package 4.3 adds only the generated recent-material index;
4.5 adds the 18th table and nullable course description through migration 0002.
Package 3.4 adds the 19th table, Ideas collections, and favorite/membership/cover fields
through additive migration 0003. The remaining new News save table stays pending.
`src/components/ui/Dialog.tsx` supplies native modal behavior shared by forms.
`src/components/layout/BottomNavigation.tsx` owns the shared six-link floating dock
and navigation items; `AppShell` owns the room backdrop and content clearance.
The clean runtime photo is `public/images/room-background.webp`; the exact approved
Home image stays in `docs/design/references/home-final.png` for review, not runtime UI.
College pages, editors, types and data hooks stay in
`src/features/college/`; Home imports only its data hooks. The audit and College
suites in `tests/e2e/` exercise rendered UI against Hono and isolated in-memory
SQLite. Package 4.3 adds materials.routes.ts (including private file routes),
materials.service.ts, materials.repository.ts, providers/storage/r2.provider.ts and focused
stream/header utilities. tests/integration/materials-api.test.ts and tests/unit/material-file.test.ts
cover the new behavior; tests/runtime/materials.test.mjs exercises isolated native Workers/D1/R2.
Package 4.4 adds feature-local materials-api.ts/use-materials.ts and MaterialWorkspace,
MaterialList, MaterialEditors and MaterialFileDialog, reusing the existing College dialog
and private APIs. tests/e2e/materials-regressions.mjs serves isolated Hono/SQLite/R2 fixtures
over local HTTP to verify actual browser downloads without request interception.
Material/hierarchy cleanup extends the existing services/repositories, without a new table
or package. Package 4.5 adds schedule.routes.ts, schedule.service.ts, schedule.repository.ts
and the pure schedule-week.ts calendar helper. Feature-local schedule-api/use-schedule,
CourseRow, WeeklySchedule, ScheduleManager and ScheduleEditor implement the approved overview;
schedule-format.ts and schedule.css handle labels and responsive calendar reflow.
Focused schedule API/migration/week/browser tests extend existing regressions and the native
runtime test. Packages 3.4–3.5 add idea-collections.routes/service/repository, the focused
idea-covers service/repository, idea-cover/image-upload utilities and shared same-origin
middleware. Existing Ideas routes/service/repository retain capture/search/tags/pins.
Feature-local CollectionManager/IdeaCoverEditor and use-idea-collections extend the Ideas
page; Library retains its API/model. Idea extension/migration/image/browser tests and the
native storage test exercise these additions. Playback and content pipelines remain pending.
The following tree is a target reference, not an inventory of implemented files.
Create folders and files as their work package needs them; do not pre-create empty modules.

## Target repository

```text
kokpit/
├── README.md
├── AGENTS.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── wrangler.jsonc
├── drizzle.config.ts
├── .gitignore
├── .env.example
├── docs/
│   ├── product/                 # PRD.md, DECISIONS.md
│   ├── design/                  # design/gallery, FINAL Home, approved feature images in concepts/
│   ├── engineering/             # architecture, data, structure, deployment
│   ├── features/                # content, approved UI, COLLEGE_MATERIALS.md API contract
│   └── planning/                # IMPLEMENTATION_PLAN.md
├── public/                      # favicon.svg, static/; public assets only
├── src/
│   ├── app/                     # composition, providers, shell, routing
│   ├── components/
│   │   ├── ui/                  # reusable primitives
│   │   ├── layout/              # BottomNavigation and page containers
│   │   └── shared/              # genuinely reused presentation
│   ├── features/
│   │   ├── home/
│   │   ├── college/
│   │   ├── music/
│   │   ├── news/
│   │   ├── ideas/
│   │   └── library/
│   ├── hooks/                   # cross-feature hooks only
│   ├── lib/                     # frontend infrastructure
│   ├── styles/                  # tokens.css, globals.css, utilities.css
│   ├── types/                   # cross-feature frontend types
│   ├── main.tsx
│   └── vite-env.d.ts
├── worker/
│   ├── api/                     # HTTP route modules
│   ├── services/                # domain operations
│   ├── db/
│   │   ├── schema/              # canonical Drizzle schema
│   │   └── repositories/        # domain queries
│   ├── providers/
│   │   ├── ai/
│   │   ├── quotes/
│   │   ├── news/
│   │   └── storage/
│   ├── jobs/                    # independently callable scheduled jobs
│   ├── middleware/              # owner context, safe errors, optional request ID
│   ├── utils/                   # focused backend utilities
│   ├── env.ts                   # typed DB, R2, AI, environment bindings
│   └── index.ts                 # register Hono routes; export fetch/scheduled
├── shared/
│   └── contracts/               # runtime-agnostic API contracts when shared
├── drizzle/
│   └── migrations/              # reviewed, version-controlled SQL
└── tests/
    ├── unit/
    ├── integration/
    ├── runtime/                # native Workers/D1/R2 integration with isolated state
    └── e2e/
```

## Root responsibilities

| File | Responsibility |
| --- | --- |
| `package.json` / lockfile | Scripts and intentional dependency versions |
| `tsconfig.json` | Strict checks, source inclusion, import aliases |
| `vite.config.ts` | React build/dev configuration and frontend aliases |
| `wrangler.jsonc` | Worker entry, static assets, bindings, cron; no secrets |
| `drizzle.config.ts` | Schema location and migration output/configuration |
| `.env.example` | Placeholder-only local variables |
| `README.md` / `AGENTS.md` | Human entry point / mandatory agent workflow |

Current scripts are documented in [README](../../README.md). Later lint, test,
database, and deployment scripts are added at their documented package, not assumed available.

## Frontend ownership

`src/app/` owns `App.tsx`, `router.tsx`, `providers.tsx`, `AppShell.tsx`, and
thin `routes/*Route.tsx` boundaries. Keep feature business logic out of composition.

Each feature owns its `components/`, `pages/`, `hooks/`, `api/`, local `types.ts`,
helpers, and state where needed. These are placement examples, not required empty files:

| Feature | Representative files and boundary |
| --- | --- |
| Home | `HomeHero`, `Clock`, `DynamicQuote`, previews; `useHomeData`, `home.api.ts`. Preview other domains; do not own their logic. |
| College | Semester/Course/Week pages, materials, breadcrumbs, recurring schedule editor/grid/day list and recent/semester material views; hierarchy remains Semester → Course → Week → Material. |
| Music | `MusicPlayer`, `MiniPlayer`, track/playlist lists, queue, artwork, upload; MusicLibrary/Playlist pages; `state/MusicProvider.tsx`, reducer, player hooks. Mount provider above routes. |
| News | Article/feed/filter/source components, saved preview/full view and topics list; feature hooks synchronize bookmark state. RSS parsing/topic classification/aggregation remain in Worker. |
| Ideas | Paper composer, ordered grid/search/tags, collection manager/filter, favorite preview/full view, cover control in editor. Fast capture, not a generic document editor. |
| Library | QuickLink card/grid/form/group, Library page, `useQuickLinks`, `library.api.ts`. |

- Reusable primitives include Button, IconButton, Input, Textarea, Card, Badge,
  Chip, Skeleton, EmptyState, ErrorState. Layout owns BottomNavigation and PageContainer.
- `src/hooks/` is for hooks actually reused across unrelated features, such as
  media queries, debounce, and document title. Feature hooks stay in their feature.
- `src/lib/` owns API/query clients and focused helpers such as `format-time.ts`,
  `format-date.ts`, `cn.ts`. Avoid a giant `utils.ts` or global constants dump.
- `tokens.css` follows [Design System](../design/DESIGN_SYSTEM.md); `globals.css`
  owns base typography/background/focus/scrollbar/reset; utilities are small repeated needs.
- Feature API modules hide fetch details. Query hooks own consistent feature keys,
  list/detail queries, and relevant mutation invalidation; avoid global invalidation.
- Cross-feature types live in `src/types/`; infer or share safe contracts rather
  than duplicating database types. Never import Worker-only dependencies into React.

## Backend ownership and flows

| Area | Responsibility and examples |
| --- | --- |
| `api/` | `system`, `home`, `quotes`, `news`, `ideas`, `library`, `college`, `music`, `files` route modules: parse, validate, call service, format response |
| `services/` | Domain operations: Ideas/collections/favorites/covers, College schedule/materials, News saves and retention, playlist/track deletion; keep related operations focused without a layer per table |
| `db/` | `client.ts`, operational `seed.ts`, schema matching Data Model, domain repositories; avoid a repository per tiny table |
| `providers/ai/`, `quotes/` | Internal AI/quote contracts and Workers AI adapters |
| `providers/news/` | Registry, source types, generic RSS, Hacker News, GDELT, normalization/deduplication/relevance |
| `providers/storage/` | `r2.provider.ts`: private bytes and ranged reads |
| `jobs/` | `refresh-news.job.ts`, `refill-quotes.job.ts`, `cleanup-content.job.ts`; scheduled handler dispatches jobs |
| `middleware/` | `owner-context.ts` passes explicit owner ID even with Access; `error-handler.ts` returns safe JSON; `request-id.ts` is optional tracing |
| `utils/` | Focused hash, URL, file, time helpers; no generic dumping ground |

Prefer route → service → repository/provider → D1/R2/external source.
Simple operations need no ceremonial layers. Keep business logic out of entrypoint/routes.

| Flow | Placement |
| --- | --- |
| College upload | `MaterialUpload.tsx` → files route/service → R2 provider + College repository; frontend never owns R2 keys |
| Music stream | Music API → route ownership check → service metadata resolution → R2 ranged read |
| News | Refresh job → providers → normalize/deduplicate/score → News repository → D1; frontend calls Kokpit News API |
| Quotes | Refill job → Workers AI quote provider → quality filter → Quotes repository; Home quote component reads quote service/API |

Generic RSS sources share a configured adapter. Add individual NVIDIA/GitHub/Google/
Cloudflare/Ars/TechCrunch source files only when behavior requires them.
Environment bindings stay near `worker/env.ts` and Wrangler; feature code uses typed interfaces.
Introduce `worker/config/content.ts` or `limits.ts` only when enough configuration exists.

## Naming, sharing, and size

| Kind | Convention |
| --- | --- |
| React component | PascalCase: `MusicPlayer.tsx`, `NewsCard.tsx` |
| Hook | `use` + camelCase: `useMusicPlayer.ts` |
| Service / repository / route | `ideas.service.ts`, `ideas.repository.ts`, `ideas.routes.ts` |
| Provider / scheduled job | `gdelt.provider.ts`, `refresh-news.job.ts` |
| Unit / integration / E2E test | `quote-filter.test.ts`, `ideas-api.test.ts`, `music.spec.ts` |

Aliases: `@/` → `src/`, `@worker/` → `worker/`. Keep them few and traceable;
frontend imports must respect the runtime boundary. Shared contracts are optional
until both runtimes need them; no Worker bindings/dependencies inside `shared/`.

Use feature-boundary `index.ts` exports when useful; avoid deep barrel chains and cycles.
Move code to shared only after a second genuine use. Constants stay with their owner.
Avoid vague root folders (`helpers`, `managers`, `controllers`, `models`, `common`,
`misc`, `core`) without a clear need. Soft size guides: component <250 lines,
service <300, route <200; split by responsibility rather than line count.

## Tests, assets, and generated files

- Unit: quote filters, relevance, deduplication, URL normalization, ordering, pure helpers.
- Integration: APIs, D1, ownership, playlists, College hierarchy/material metadata.
- E2E: open app, save idea, navigate College, upload material, play track, keep
  music playing across routes, open quick link, load News.
- `public/` contains only public static assets; private content belongs in R2.
- Review and commit migrations; evolve schema with new migrations, preserving applied history.
- Ignore `dist/`, `node_modules/`, `coverage/`, `.wrangler/`, local secrets.
  Do not hand-edit build output. Follow [Deployment](DEPLOYMENT.md) for environments.
- FINAL Home lives in `docs/design/references/home-final.png`; the five approved feature
  references live in `docs/design/concepts/2026-10-25/`, indexed by
  [UI References](../design/UI_REFERENCES.md). Superseded images/proposal notes were removed
  at the owner's request; decision history remains in Decisions. These images are not runtime
  assets; use `public/` only for approved images actually needed by the application.

Read this reference before restructuring. Add only files required by the current
work package, preserve runtime/feature boundaries, and update this document for material
structure changes. Keep primary reasoning in `docs/`; no per-folder README explosion.
