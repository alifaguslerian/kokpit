# Kokpit — File Structure

**Version:** 0.1  
**Status:** V1 Codebase Structure Draft  
**Product:** Kokpit  
**Stack:** React + TypeScript + Vite + Cloudflare Workers + Hono + D1 + Drizzle + R2  
**Scope:** Single-repository full-stack application  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This document defines the recommended codebase structure for Kokpit V1.

The structure should:

- keep frontend and backend responsibilities clear
- keep features modular
- make AI-assisted development easier
- avoid giant generic folders
- keep shared code truly shared
- keep Cloudflare-specific code isolated
- make future V2 growth possible without a major restructure

This document defines **where code belongs**.

It does not redefine product requirements, architecture, or data models.

---

# 2. Repository Structure

Recommended root:

```txt
kokpit/
├── README.md
├── AGENTS.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc
├── drizzle.config.ts
├── .gitignore
├── .env.example
│
├── docs/
│   ├── product/
│   │   ├── PRD.md
│   │   └── DECISIONS.md
│   │
│   ├── design/
│   │   └── DESIGN_SYSTEM.md
│   │
│   ├── engineering/
│   │   ├── ARCHITECTURE.md
│   │   ├── DATA_MODEL.md
│   │   ├── FILE_STRUCTURE.md
│   │   └── DEPLOYMENT.md
│   │
│   ├── features/
│   │   └── CONTENT_SOURCES.md
│   │
│   └── planning/
│       └── IMPLEMENTATION_PLAN.md
│
├── public/
│   ├── favicon.svg
│   └── static/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── types/
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── worker/
│   ├── api/
│   ├── db/
│   ├── services/
│   ├── providers/
│   ├── jobs/
│   ├── middleware/
│   ├── utils/
│   ├── env.ts
│   └── index.ts
│
├── drizzle/
│   └── migrations/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

# 3. Root Files

## `README.md`

Purpose:

- project overview
- local setup
- development commands
- architecture summary
- documentation links

Keep it concise.

Detailed technical decisions belong in `/docs`.

---

## `AGENTS.md`

Purpose:

Defines how AI coding agents must work inside Kokpit.

It should include:

- documentation reading order
- scope rules
- coding rules
- testing requirements
- no unapproved architecture changes
- no silent dependency additions
- no hardcoded design deviations

---

## `package.json`

Contains:

- scripts
- dependencies
- development dependencies
- project metadata

Recommended scripts may include:

```txt
dev
build
preview
lint
typecheck
test
test:e2e
db:generate
db:migrate
db:studio
deploy
```

Exact script names may change later.

---

## `vite.config.ts`

Responsible for:

- Vite config
- React plugin
- Cloudflare Vite integration
- aliases if used

Keep configuration small.

---

## `wrangler.jsonc`

Responsible for Cloudflare runtime configuration.

May define:

```txt
D1 binding
R2 binding
Workers AI binding
environment variables
cron triggers
static asset behavior
```

Secrets must not be committed here.

---

## `drizzle.config.ts`

Responsible for:

- Drizzle schema location
- migration output
- D1-related migration configuration

---

## `.env.example`

Documents expected local variables.

Never include real credentials.

---

# 4. Frontend Root — `src/`

The frontend uses React + TypeScript.

Main rule:

> Feature-specific UI belongs in `features/`. Generic reusable UI belongs in `components/`.

Avoid placing everything inside `components`.

Recommended:

```txt
src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── styles/
├── types/
├── main.tsx
└── vite-env.d.ts
```

---

# 5. `src/app/`

Purpose:

Application-level composition.

Recommended:

```txt
src/app/
├── App.tsx
├── router.tsx
├── providers.tsx
├── AppShell.tsx
└── routes/
    ├── HomeRoute.tsx
    ├── CollegeRoute.tsx
    ├── MusicRoute.tsx
    ├── NewsRoute.tsx
    ├── IdeasRoute.tsx
    └── LibraryRoute.tsx
```

Responsibilities:

- routing
- app shell
- top-level providers
- global layout
- route boundaries

Do not place feature business logic here.

---

# 6. `src/components/`

Purpose:

Reusable UI primitives and shared layout components.

Recommended:

```txt
src/components/
├── ui/
│   ├── Button.tsx
│   ├── IconButton.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Chip.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   └── ErrorState.tsx
│
├── layout/
│   ├── Sidebar.tsx
│   ├── SidebarNav.tsx
│   ├── SidebarNavItem.tsx
│   └── PageContainer.tsx
│
└── shared/
    ├── ExternalLink.tsx
    ├── LoadingBlock.tsx
    └── SectionHeader.tsx
```

Rules:

- components here must be genuinely reusable
- do not put College-specific components here
- do not put Music-specific components here
- do not use this folder as a dumping ground

---

# 7. `src/features/`

This is the main product structure.

Recommended:

```txt
src/features/
├── home/
├── college/
├── music/
├── news/
├── ideas/
└── library/
```

Each feature owns:

- UI
- feature hooks
- local types
- API client calls
- feature-specific helpers
- feature state where relevant

---

# 8. Home Feature

```txt
src/features/home/
├── components/
│   ├── HomeHero.tsx
│   ├── Clock.tsx
│   ├── DynamicQuote.tsx
│   ├── MusicPreview.tsx
│   ├── CollegePreview.tsx
│   ├── NewsPreview.tsx
│   ├── IdeaCapturePreview.tsx
│   └── QuickLinksPreview.tsx
│
├── hooks/
│   └── useHomeData.ts
│
├── api/
│   └── home.api.ts
│
├── types.ts
└── index.ts
```

Important rule:

Home previews other features.

Home must not become the canonical owner of feature logic.

---

# 9. College Feature

```txt
src/features/college/
├── components/
│   ├── SemesterList.tsx
│   ├── SemesterHeader.tsx
│   ├── CourseCard.tsx
│   ├── CourseList.tsx
│   ├── WeekList.tsx
│   ├── WeekSection.tsx
│   ├── MaterialItem.tsx
│   ├── MaterialUpload.tsx
│   └── CollegeBreadcrumbs.tsx
│
├── pages/
│   ├── CollegeOverviewPage.tsx
│   ├── SemesterPage.tsx
│   ├── CoursePage.tsx
│   └── WeekPage.tsx
│
├── hooks/
│   ├── useSemesters.ts
│   ├── useCourses.ts
│   ├── useWeeks.ts
│   └── useMaterials.ts
│
├── api/
│   └── college.api.ts
│
├── types.ts
└── index.ts
```

The feature should mirror the domain hierarchy:

```txt
Semester
→ Course
→ Week
→ Material
```

---

# 10. Music Feature

```txt
src/features/music/
├── components/
│   ├── MusicPlayer.tsx
│   ├── MiniPlayer.tsx
│   ├── TrackList.tsx
│   ├── TrackRow.tsx
│   ├── PlaylistList.tsx
│   ├── PlaylistCard.tsx
│   ├── QueuePanel.tsx
│   ├── AlbumArtwork.tsx
│   └── MusicUpload.tsx
│
├── pages/
│   ├── MusicLibraryPage.tsx
│   └── PlaylistPage.tsx
│
├── state/
│   ├── MusicProvider.tsx
│   └── musicReducer.ts
│
├── hooks/
│   ├── useMusicPlayer.ts
│   └── usePlaylists.ts
│
├── api/
│   └── music.api.ts
│
├── types.ts
└── index.ts
```

Important:

`MusicProvider` should be mounted above route-level feature pages.

This keeps playback alive while navigating Kokpit.

---

# 11. News Feature

```txt
src/features/news/
├── components/
│   ├── NewsCard.tsx
│   ├── NewsList.tsx
│   ├── NewsFilter.tsx
│   ├── NewsSourceBadge.tsx
│   └── WhyItMatters.tsx
│
├── pages/
│   └── NewsPage.tsx
│
├── hooks/
│   └── useNews.ts
│
├── api/
│   └── news.api.ts
│
├── types.ts
└── index.ts
```

Do not put external RSS parsing here.

That belongs in the Worker.

---

# 12. Ideas Feature

```txt
src/features/ideas/
├── components/
│   ├── IdeaComposer.tsx
│   ├── IdeaCard.tsx
│   ├── IdeaList.tsx
│   ├── IdeaSearch.tsx
│   └── IdeaTags.tsx
│
├── pages/
│   └── IdeasPage.tsx
│
├── hooks/
│   └── useIdeas.ts
│
├── api/
│   └── ideas.api.ts
│
├── types.ts
└── index.ts
```

The feature should optimize for fast capture.

Avoid turning it into a generic document editor.

---

# 13. Library Feature

```txt
src/features/library/
├── components/
│   ├── QuickLinkCard.tsx
│   ├── QuickLinkGrid.tsx
│   ├── QuickLinkForm.tsx
│   └── QuickLinkGroup.tsx
│
├── pages/
│   └── LibraryPage.tsx
│
├── hooks/
│   └── useQuickLinks.ts
│
├── api/
│   └── library.api.ts
│
├── types.ts
└── index.ts
```

---

# 14. `src/hooks/`

Purpose:

Only truly cross-feature React hooks.

Examples:

```txt
useMediaQuery.ts
useDebounce.ts
useDocumentTitle.ts
```

Do not place feature hooks here unless multiple unrelated features use them.

---

# 15. `src/lib/`

Purpose:

Frontend infrastructure and generic helpers.

Recommended:

```txt
src/lib/
├── api-client.ts
├── query-client.ts
├── format-date.ts
├── format-time.ts
├── cn.ts
└── constants.ts
```

Avoid giant `utils.ts`.

Prefer small focused files.

---

# 16. `src/styles/`

Recommended:

```txt
src/styles/
├── globals.css
├── tokens.css
└── utilities.css
```

## `tokens.css`

Contains Kokpit design tokens from:

```txt
docs/design/DESIGN_SYSTEM.md
```

Example:

```css
:root {
  --kokpit-bg-base: #0D0B0B;
  --kokpit-accent: #D7A06D;
}
```

## `globals.css`

Contains:

- base typography
- body background
- default focus behavior
- global scrollbar rules
- reset / normalized styles

## `utilities.css`

Only for small Kokpit-specific utilities not worth expressing repeatedly.

---

# 17. `src/types/`

Purpose:

Cross-feature frontend types only.

Examples:

```txt
api.ts
common.ts
```

Do not duplicate backend database schema types manually if they can be safely shared or inferred.

---

# 18. Backend Root — `worker/`

Recommended:

```txt
worker/
├── api/
├── db/
├── services/
├── providers/
├── jobs/
├── middleware/
├── utils/
├── env.ts
└── index.ts
```

The Worker is the backend runtime.

---

# 19. `worker/index.ts`

Purpose:

Main Cloudflare Worker entrypoint.

Responsibilities:

- create Hono app
- register middleware
- register API routes
- expose fetch handler
- expose scheduled handler

Keep this file small.

Conceptually:

```txt
create app
register routes
export fetch
export scheduled
```

Do not put business logic here.

---

# 20. `worker/env.ts`

Purpose:

Typed Cloudflare environment bindings.

Conceptual bindings:

```txt
DB
R2
AI
environment variables
```

This file should define runtime types.

Do not access untyped bindings throughout the codebase.

---

# 21. `worker/api/`

Purpose:

HTTP API routes.

Recommended:

```txt
worker/api/
├── system.routes.ts
├── home.routes.ts
├── quotes.routes.ts
├── news.routes.ts
├── ideas.routes.ts
├── library.routes.ts
├── college.routes.ts
├── music.routes.ts
└── files.routes.ts
```

Routes should:

- parse requests
- validate input
- call service
- format response

Routes should not contain large database queries or external provider logic directly.

---

# 22. `worker/services/`

Purpose:

Feature-level business logic.

Recommended:

```txt
worker/services/
├── home.service.ts
├── quotes.service.ts
├── news.service.ts
├── ideas.service.ts
├── library.service.ts
├── college.service.ts
├── music.service.ts
└── files.service.ts
```

Examples:

```txt
IdeasService
→ create idea
→ update idea
→ delete idea

MusicService
→ create track metadata
→ playlist operations
→ track deletion workflow

CollegeService
→ semester hierarchy
→ material deletion
```

---

# 23. `worker/db/`

Purpose:

Database schema and data access.

Recommended:

```txt
worker/db/
├── schema/
│   ├── users.ts
│   ├── ideas.ts
│   ├── library.ts
│   ├── college.ts
│   ├── music.ts
│   ├── news.ts
│   ├── quotes.ts
│   └── index.ts
│
├── repositories/
│   ├── users.repository.ts
│   ├── ideas.repository.ts
│   ├── library.repository.ts
│   ├── college.repository.ts
│   ├── music.repository.ts
│   ├── news.repository.ts
│   └── quotes.repository.ts
│
├── client.ts
└── seed.ts
```

Rules:

- schema mirrors `DATA_MODEL.md`
- repositories own database queries
- services coordinate business operations
- migrations remain outside this folder in `/drizzle/migrations`

Avoid creating one repository per tiny table unless needed.

Domain-level repositories are preferred.

---

# 24. `worker/providers/`

Purpose:

External systems and replaceable content adapters.

Recommended:

```txt
worker/providers/
├── ai/
│   ├── ai.provider.ts
│   └── workers-ai.provider.ts
│
├── quotes/
│   ├── quote.provider.ts
│   └── workers-ai-quote.provider.ts
│
├── news/
│   ├── news-source.types.ts
│   ├── rss.provider.ts
│   ├── hacker-news.provider.ts
│   ├── gdelt.provider.ts
│   └── registry.ts
│
└── storage/
    └── r2.provider.ts
```

Important principle:

The application should depend on internal provider contracts.

Do not scatter external API logic throughout route handlers.

---

# 25. News Provider Structure

Possible future organization:

```txt
worker/providers/news/
├── sources/
│   ├── nvidia.source.ts
│   ├── github.source.ts
│   ├── google.source.ts
│   ├── cloudflare.source.ts
│   ├── arstechnica.source.ts
│   └── techcrunch.source.ts
│
├── hacker-news.provider.ts
├── gdelt.provider.ts
├── rss.provider.ts
├── normalize.ts
├── deduplicate.ts
├── relevance.ts
└── registry.ts
```

Only create individual source files when source-specific behavior is required.

Generic RSS sources can share one adapter with configuration.

---

# 26. `worker/jobs/`

Purpose:

Cloudflare Cron Trigger jobs.

Recommended:

```txt
worker/jobs/
├── refresh-news.job.ts
├── refill-quotes.job.ts
├── cleanup-content.job.ts
└── index.ts
```

Each job should remain callable independently.

The scheduled handler decides which jobs run for a cron event.

---

# 27. `worker/middleware/`

Recommended:

```txt
worker/middleware/
├── owner-context.ts
├── error-handler.ts
└── request-id.ts
```

Possible responsibilities:

## `owner-context.ts`

Resolves the current V1 owner context.

Even with Cloudflare Access protecting the app, application services should still receive an explicit owner ID.

## `error-handler.ts`

Converts unexpected errors into safe JSON responses.

## `request-id.ts`

Optional request tracing for logs.

---

# 28. `worker/utils/`

Only backend utilities that are genuinely generic.

Examples:

```txt
hash.ts
url.ts
file.ts
time.ts
```

Avoid a giant shared helpers file.

---

# 29. Drizzle Migrations

Recommended:

```txt
drizzle/
└── migrations/
    ├── 0000_initial.sql
    ├── 0001_*.sql
    └── ...
```

Rules:

- migrations are committed
- do not edit already-applied production migrations casually
- create a new migration for schema evolution

---

# 30. Public Assets

Recommended:

```txt
public/
├── favicon.svg
└── static/
```

Use this for truly static public assets.

Do not place private user content here.

Private files belong in R2.

---

# 31. Tests

Recommended:

```txt
tests/
├── unit/
├── integration/
└── e2e/
```

---

# 32. Unit Tests

Use for:

- quote filters
- relevance scoring
- deduplication
- URL normalization
- pure helpers
- ordering logic

Example:

```txt
tests/unit/news-relevance.test.ts
tests/unit/quote-filter.test.ts
```

---

# 33. Integration Tests

Use for:

- API routes
- D1 behavior
- ownership checks
- playlist operations
- College hierarchy
- material metadata behavior

Example:

```txt
tests/integration/ideas-api.test.ts
tests/integration/college-api.test.ts
```

---

# 34. E2E Tests

Use for important full flows.

Example:

```txt
tests/e2e/
├── home.spec.ts
├── ideas.spec.ts
├── college.spec.ts
└── music.spec.ts
```

High-priority flows:

```txt
open Kokpit
save idea
navigate College
upload material
play track
change route without stopping music
open quick link
load News
```

---

# 35. Naming Conventions

## React Components

Use PascalCase:

```txt
MusicPlayer.tsx
NewsCard.tsx
CourseCard.tsx
```

## Hooks

Use camelCase with `use` prefix:

```txt
useMusicPlayer.ts
useIdeas.ts
```

## Services

Use:

```txt
ideas.service.ts
music.service.ts
```

## Repositories

Use:

```txt
ideas.repository.ts
music.repository.ts
```

## Routes

Use:

```txt
ideas.routes.ts
music.routes.ts
```

## Providers

Use:

```txt
workers-ai.provider.ts
gdelt.provider.ts
```

## Jobs

Use:

```txt
refresh-news.job.ts
refill-quotes.job.ts
```

---

# 36. Barrel Files

`index.ts` may be used at feature boundaries.

Good:

```txt
src/features/music/index.ts
```

Avoid deep barrel-file chains.

Do not create barrels for every folder.

They can make dependency cycles harder to understand.

---

# 37. Import Aliases

Recommended aliases:

```txt
@/        → src/
@worker/  → worker/
```

Possible usage:

```ts
import { Button } from "@/components/ui/Button";
```

Do not create many aliases.

Keep imports easy to trace.

---

# 38. Shared Types Boundary

Avoid duplicating important API types separately in frontend and backend.

When practical, create a small shared contract area.

Optional structure:

```txt
shared/
├── contracts/
│   ├── ideas.ts
│   ├── college.ts
│   ├── music.ts
│   ├── news.ts
│   └── quotes.ts
└── types.ts
```

If this is introduced, root may become:

```txt
kokpit/
├── src/
├── worker/
├── shared/
└── ...
```

Use shared code only when it is genuinely runtime-agnostic.

Do not import Worker-only dependencies into frontend code.

---

# 39. Recommended Final Root With Shared Contracts

If API contracts are shared, preferred final structure:

```txt
kokpit/
├── README.md
├── AGENTS.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc
├── drizzle.config.ts
├── .gitignore
├── .env.example
│
├── docs/
│   └── ...
│
├── public/
│   └── ...
│
├── src/
│   └── ...
│
├── worker/
│   └── ...
│
├── shared/
│   └── contracts/
│
├── drizzle/
│   └── migrations/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

This is the preferred V1 structure.

---

# 40. Feature Boundary Rule

Each feature should answer:

```txt
What UI belongs to me?
What API calls belong to me?
What types belong to me?
What business logic belongs to me?
```

Example:

```txt
Music
```

owns:

```txt
player UI
playlist UI
music API client
music feature state
track types
```

It does not own:

```txt
generic Button
global Sidebar
news logic
college file upload rules
```

---

# 41. Shared Code Rule

Move code into shared folders only after it is clearly shared.

Bad:

```txt
create generic abstraction before second use exists
```

Preferred:

```txt
feature owns code first

if another feature truly needs it:
move it to shared
```

This avoids premature abstraction.

---

# 42. No Generic Folder Explosion

Avoid root-level folders like:

```txt
helpers/
managers/
controllers/
models/
common/
misc/
core/
```

unless there is a clear architectural need.

Folder names should communicate real responsibilities.

---

# 43. No Giant Files

Recommended soft limits:

```txt
React component:
prefer < 250 lines

service:
prefer < 300 lines

route module:
prefer < 200 lines
```

These are not strict rules.

Split based on responsibility, not line count alone.

---

# 44. API Client Pattern

Frontend feature API modules should hide fetch details.

Example:

```txt
src/features/ideas/api/ideas.api.ts
```

Conceptually exposes:

```txt
listIdeas()
createIdea()
updateIdea()
deleteIdea()
```

React components should not repeatedly construct raw API requests.

---

# 45. Query Layer

If TanStack Query is used:

- feature hooks own query keys
- query keys should be consistent
- mutation success should invalidate relevant queries
- avoid global invalidation when a feature-local invalidation is enough

Example:

```txt
ideasKeys.all
ideasKeys.list
ideasKeys.detail(id)
```

---

# 46. Worker Service Pattern

Preferred backend flow:

```txt
route
↓
service
↓
repository / provider
↓
D1 / R2 / external source
```

Example:

```txt
POST /api/ideas
↓
ideas.routes.ts
↓
ideas.service.ts
↓
ideas.repository.ts
↓
D1
```

Do not force every simple read through unnecessary layers if it makes the code harder to understand.

The principle is separation of responsibility, not ceremony.

---

# 47. File Upload Flow Structure

College upload code should conceptually live across:

```txt
frontend:
src/features/college/components/MaterialUpload.tsx

backend:
worker/api/files.routes.ts
worker/services/files.service.ts
worker/providers/storage/r2.provider.ts
worker/db/repositories/college.repository.ts
```

The frontend should not know R2 object keys.

---

# 48. Music Streaming Flow Structure

Conceptually:

```txt
src/features/music/
→ requests stream URL

worker/api/music.routes.ts
→ validates track ownership

worker/services/music.service.ts
→ resolves metadata

worker/providers/storage/r2.provider.ts
→ performs ranged read
```

---

# 49. News Flow Structure

Conceptually:

```txt
worker/jobs/refresh-news.job.ts
↓
worker/providers/news/*
↓
normalize
↓
deduplicate
↓
relevance score
↓
worker/db/repositories/news.repository.ts
↓
D1
```

Frontend:

```txt
src/features/news/api/news.api.ts
↓
/api/news
```

---

# 50. Quote Flow Structure

Conceptually:

```txt
worker/jobs/refill-quotes.job.ts
↓
workers-ai-quote.provider.ts
↓
quote quality filter
↓
quotes.repository.ts
↓
D1
```

Home:

```txt
DynamicQuote.tsx
↓
home / quote API
↓
quotes.service.ts
↓
quotes.repository.ts
```

---

# 51. Environment Separation

Do not mix environment-specific behavior randomly inside feature code.

Environment bindings belong near:

```txt
worker/env.ts
wrangler.jsonc
```

Feature code should consume typed interfaces.

---

# 52. Config Values

Stable application configuration may live in dedicated config modules.

Possible:

```txt
worker/config/
├── content.ts
└── limits.ts
```

Only introduce `/config` when enough configuration exists.

Do not create it for one constant.

---

# 53. Constants

Feature-specific constants stay with features.

Example:

```txt
src/features/music/constants.ts
```

Cross-feature constants may live in:

```txt
src/lib/constants.ts
```

Do not centralize everything automatically.

---

# 54. Documentation Near Code

Do not create extra README files in every folder by default.

Use comments only when behavior is non-obvious.

Primary design and architecture reasoning belongs in `/docs`.

Code should remain understandable without excessive documentation noise.

---

# 55. Generated Files

Generated files should be clearly separated.

Examples:

```txt
drizzle migrations
build output
coverage
```

Do not manually edit build output.

Typical ignored directories:

```txt
dist/
node_modules/
coverage/
.wrangler/
.dev.vars
```

---

# 56. File Structure for Future Features

If Kokpit later gains a new major feature:

```txt
src/features/projects/
worker/api/projects.routes.ts
worker/services/projects.service.ts
worker/db/repositories/projects.repository.ts
```

Only add folders required by the feature.

Do not pre-create empty future modules.

---

# 57. V1 Folder Creation Rule

At initial scaffold, it is acceptable to create the main structure.

However, do not create dozens of empty files just to match this document.

Create files as implementation reaches the relevant feature.

Recommended initial scaffold:

```txt
src/app/
src/components/ui/
src/components/layout/
src/features/home/
src/styles/

worker/api/
worker/db/schema/
worker/services/
worker/providers/
worker/jobs/

shared/contracts/

drizzle/migrations/

tests/
```

Then expand feature-by-feature.

---

# 58. AI Agent File Rules

AI coding agents must:

1. Read this document before restructuring the repository.
2. Keep feature-specific code inside its feature boundary.
3. Avoid giant generic folders.
4. Avoid moving code to shared before it is actually shared.
5. Keep frontend and Worker code separated.
6. Keep external provider logic in `worker/providers`.
7. Keep scheduled work in `worker/jobs`.
8. Keep database queries in the database layer.
9. Keep app shell and routing in `src/app`.
10. Preserve persistent Music state above route pages.
11. Do not create empty architecture layers with no real purpose.
12. Update this document if the repository structure changes materially.

---

# 59. Final V1 Structure

Preferred Kokpit V1 structure:

```txt
kokpit/
├── README.md
├── AGENTS.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc
├── drizzle.config.ts
├── .gitignore
├── .env.example
│
├── docs/
│   ├── product/
│   │   ├── PRD.md
│   │   └── DECISIONS.md
│   ├── design/
│   │   └── DESIGN_SYSTEM.md
│   ├── engineering/
│   │   ├── ARCHITECTURE.md
│   │   ├── DATA_MODEL.md
│   │   ├── FILE_STRUCTURE.md
│   │   └── DEPLOYMENT.md
│   ├── features/
│   │   └── CONTENT_SOURCES.md
│   └── planning/
│       └── IMPLEMENTATION_PLAN.md
│
├── public/
│   ├── favicon.svg
│   └── static/
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── features/
│   │   ├── home/
│   │   ├── college/
│   │   ├── music/
│   │   ├── news/
│   │   ├── ideas/
│   │   └── library/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── types/
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── worker/
│   ├── api/
│   ├── db/
│   │   ├── schema/
│   │   └── repositories/
│   ├── services/
│   ├── providers/
│   │   ├── ai/
│   │   ├── quotes/
│   │   ├── news/
│   │   └── storage/
│   ├── jobs/
│   ├── middleware/
│   ├── utils/
│   ├── env.ts
│   └── index.ts
│
├── shared/
│   └── contracts/
│
├── drizzle/
│   └── migrations/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

# 60. Final Structure Principle

The codebase should make it obvious:

```txt
where UI lives

where feature logic lives

where backend logic lives

where database logic lives

where external integrations live

where scheduled jobs live
```

The final question when placing a file is:

> Which feature or responsibility truly owns this code?

Put it there.

Do not organize Kokpit around vague technical categories when a clear product or runtime boundary exists.
