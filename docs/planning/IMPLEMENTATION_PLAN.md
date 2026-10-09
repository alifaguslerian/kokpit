# Kokpit — Implementation Plan

**Version:** 0.2 | **Status:** V1 implementation plan | **Updated:** 2026-10-09

Implement the documented V1 in small, reviewable steps. This plan controls order
and acceptance; [AGENTS](../../AGENTS.md) controls agent behavior. Read the
[PRD](../product/PRD.md), [Design System](../design/DESIGN_SYSTEM.md),
[Architecture](../engineering/ARCHITECTURE.md), [Data Model](../engineering/DATA_MODEL.md),
[File Structure](../engineering/FILE_STRUCTURE.md), [Content Sources](../features/CONTENT_SOURCES.md),
and [Deployment](../engineering/DEPLOYMENT.md) for the relevant task before coding.

## Progress and execution

Phase 0.1–0.2 and Phase 1.1–1.6 are complete. Phase 1 as a whole is not complete.
The next implementation step is **1.7 Configure Linting and Formatting**, requiring a new owner instruction.

- Work on the requested scope only, usually 1–3 subphases per session. Understand,
  implement, validate, report, then stop; do not implement future phases early.
- Preserve every applicable goal, task, acceptance criterion, and prohibition below.
  A missing task-local checklist does not waive the global definition of done.
- Run relevant lint, typecheck, build, and tests; if a tool is not configured yet,
  report that limitation rather than claiming it passed.
- UI: verify desktop, responsive behavior, keyboard focus, and Design System fit.
  Backend: verify validation, ownership, safe errors, and migration consistency.
- Do not silently add dependencies, expand V1, or change design/architecture.
  Update canonical documentation when an approved decision actually changes.

## Phase map

| Phase | Deliverable |
| --- | --- |
| 0 | Preflight & Documentation Check |
| 1 | Project Foundation |
| 2 | Backend & Database Foundation |
| 3 | App Shell & Design System |
| 4 | Home Core |
| 5 | Ideas |
| 6 | Library / Quick Links |
| 7 | College Structure |
| 8 | College Materials |
| 9 | Music Core |
| 10 | Quote System |
| 11 | News System |
| 12 | Responsive, UX & Polish |
| 13 | Testing & Hardening |
| 14 | Cloudflare Deployment |
| 15 | V1 Acceptance & Freeze |

## Phase 0 — Preflight & Documentation Check

**Phase 0 goal:** Ensure the repository has the required documentation and no implementation starts from missing assumptions.

### 0.1 Verify Documentation Skeleton

**Goal:** Confirm all required documentation files exist.

**Tasks**

- verify `README.md`
- verify `AGENTS.md`
- verify `docs/product/PRD.md`
- verify `docs/product/DECISIONS.md`
- verify `docs/design/DESIGN_SYSTEM.md`
- verify `docs/engineering/ARCHITECTURE.md`
- verify `docs/engineering/DATA_MODEL.md`
- verify `docs/engineering/FILE_STRUCTURE.md`
- verify `docs/engineering/DEPLOYMENT.md`
- verify `docs/features/CONTENT_SOURCES.md`
- verify `docs/planning/IMPLEMENTATION_PLAN.md`

**Acceptance Criteria:** all expected files exist; no implementation files are created as a substitute for missing documentation

**Do Not Do:** do not scaffold the application yet; do not invent undocumented features

### 0.2 Cross-Check Documentation Consistency

**Goal:** Ensure product, design, architecture, and data model do not contradict each other.

**Tasks**
Check consistency for:

- V1 single-user private scope
- Cloudflare deployment
- React + TypeScript + Vite
- Workers + Hono
- D1 + Drizzle
- R2
- Cloudflare Access
- quote strategy
- news strategy
- feature list
- design direction

**Acceptance Criteria:** contradictions are documented in `DECISIONS.md`; implementation can proceed without unresolved foundational conflict

**Do Not Do:** do not silently resolve major contradictions in code

## Phase 1 — Project Foundation

**Phase 1 goal:** Create a clean, buildable, deployable project skeleton.

### 1.1 Initialize Project

**Goal:** Create the initial package and source structure.

**Tasks**

- initialize package manager metadata
- initialize Git if the directory is not already a Git repository
- configure `.gitignore` for dependencies, generated build output, and local secret files
- create root directories from `FILE_STRUCTURE.md`
- create `src/`
- create `worker/`
- create `shared/`
- create `tests/`
- create `drizzle/migrations/`

**Acceptance Criteria:** repository structure matches documented boundaries; no unnecessary empty files are created; package manager works; Git recognizes the repository and generated/local secret files are ignored

**Do Not Do:** do not implement features; do not add UI libraries yet

### 1.2 Configure TypeScript

**Goal:** Enable strict TypeScript across frontend and Worker code.

**Tasks**

- create `tsconfig.json`
- enable strict mode
- configure path aliases
- ensure frontend and Worker files are typechecked

**Acceptance Criteria:** TypeScript compiles without errors; aliases are minimal and documented

**Do Not Do:** do not disable strictness to bypass type errors

### 1.3 Configure Vite + React

**Goal:** Get the frontend development environment running.

**Tasks**

- install React
- install Vite
- configure React plugin
- create `src/main.tsx`
- create minimal `App.tsx`

**Acceptance Criteria:** dev server starts; minimal app renders; production build succeeds

**Do Not Do:** do not build final UI yet

### 1.4 Configure Cloudflare Vite Integration

**Goal:** Make the project compatible with Cloudflare Workers deployment.

**Tasks**

- install Cloudflare Vite integration
- configure Worker entrypoint
- configure static asset serving
- connect frontend build to Worker runtime

**Acceptance Criteria:** local Cloudflare-compatible development works; static frontend and Worker route can coexist

**Do Not Do:** do not configure production secrets yet

### 1.5 Configure Hono

**Goal:** Create the backend routing foundation.

**Tasks**

- install Hono
- create `worker/index.ts`
- create a minimal API route
- create `/api/system/health`

**Acceptance Criteria:** `GET /api/system/health` returns success; frontend still loads normally

**Do Not Do:** do not add business logic

### 1.6 Configure Tailwind CSS

**Goal:** Enable styling foundation.

**Tasks**

- install Tailwind
- configure Vite integration
- import global stylesheet
- verify utility classes work

**Acceptance Criteria:** Tailwind styles render; no default theme overrides Kokpit design system

**Do Not Do:** do not install a large UI framework

### 1.7 Configure Linting and Formatting

**Goal:** Make code quality checks deterministic.

**Tasks**

- configure ESLint
- configure formatting strategy
- add scripts
- lint frontend and Worker code

**Acceptance Criteria:** lint command passes; formatting rules are consistent

**Do Not Do:** do not add multiple competing formatters

### 1.8 Foundation Verification

**Goal:** Freeze Phase 1 with a clean build.

**Tasks**
Run:

- lint
- typecheck
- build

**Acceptance Criteria:** all checks pass; repository has no feature implementation drift

## Phase 2 — Backend & Database Foundation

**Phase 2 goal:** Establish data persistence, validation, ownership context, and backend conventions.

### 2.1 Configure D1 Binding

**Goal:** Connect Cloudflare D1 to the Worker.

**Tasks**

- configure D1 binding
- create local development database
- expose typed binding through `worker/env.ts`

**Acceptance Criteria:** Worker can query local D1; binding is typed

**Do Not Do:** do not connect local development directly to production database

### 2.2 Configure Drizzle

**Goal:** Create typed database access.

**Tasks**

- install Drizzle ORM
- configure `drizzle.config.ts`
- create database client
- create schema folder structure

**Acceptance Criteria:** Drizzle config resolves correctly; schema can generate migrations

### 2.3 Implement Initial Database Schema

**Goal:** Translate `DATA_MODEL.md` into Drizzle schema.

**Tasks**
Implement tables:

- users
- user_settings
- ideas
- idea_tags
- idea_tag_links
- quick_links
- semesters
- courses
- weeks
- materials
- tracks
- playlists
- playlist_tracks
- news_sources
- news_articles
- quotes
- app_state

**Acceptance Criteria:** schema matches `DATA_MODEL.md`; foreign keys are defined; indexes are defined; ownership fields exist

**Do Not Do:** do not simplify away `user_id`; do not add undocumented tables

### 2.4 Generate Initial Migration

**Goal:** Create the first version-controlled migration.

**Tasks**

- generate migration
- inspect migration SQL
- apply locally

**Acceptance Criteria:** local migration succeeds; schema is queryable; migration is committed

### 2.5 Seed Owner User

**Goal:** Create the initial Kokpit owner identity.

**Tasks**

- create seed script
- seed owner user
- seed user settings
- use environment-provided owner email/config

**Acceptance Criteria:** exactly one owner exists in local seed; rerunning seed is safe

**Do Not Do:** do not hardcode private credentials

### 2.6 Implement Owner Context Middleware

**Goal:** Ensure every user-owned request has explicit owner context.

**Tasks**

- create owner-context middleware
- resolve owner ID
- expose owner ID to services

**Acceptance Criteria:** API handlers receive owner context; ownership can be enforced consistently

**Do Not Do:** do not rely purely on frontend assumptions

### 2.7 Implement Error Handler

**Goal:** Create safe structured API errors.

**Tasks**

- create global Hono error handler
- create standard error format
- hide stack traces in production responses

**Acceptance Criteria**
Errors return predictable JSON.

**Do Not Do:** do not expose SQL or secret details

### 2.8 Configure Zod Validation

**Goal:** Validate API inputs consistently.

**Tasks**

- install Zod
- define reusable validation patterns
- validate route params and request JSON

**Acceptance Criteria:** invalid input returns 4xx; services do not receive unvalidated raw payloads

### 2.9 Configure TanStack Query

**Goal:** Create consistent frontend server-state behavior.

**Tasks**

- install TanStack Query
- create query client
- mount provider
- establish query-key conventions

**Acceptance Criteria:** frontend can fetch health endpoint through query layer

### 2.10 Backend Foundation Verification

**Goal:** Freeze backend foundation.

**Tasks**
Test:

- D1 connection
- migration
- owner context
- validation
- API error handling
- frontend API client

**Acceptance Criteria:** lint passes; typecheck passes; build passes; basic API integration test passes

## Phase 3 — App Shell & Design System

**Phase 3 goal:** Implement the visual foundation before feature pages.

### 3.1 Implement Design Tokens

**Goal:** Translate `DESIGN_SYSTEM.md` into actual CSS tokens.

**Tasks**

- create `src/styles/tokens.css`
- add colors
- add radii
- add spacing
- add shadows
- add motion tokens
- add typography variables

**Acceptance Criteria:** design tokens match documentation; no raw arbitrary palette becomes primary system

### 3.2 Load Fonts

**Goal:** Implement the approved typography direction.

**Tasks**

- load Inter
- load Cormorant Garamond or approved serif
- configure fallbacks
- apply font roles

**Acceptance Criteria:** display and UI fonts render correctly; fallback remains readable

### 3.3 Implement Global Styles

**Goal:** Create base Kokpit visual behavior.

**Tasks**

- body background
- default text
- focus styles
- scrollbar styling
- reduced-motion behavior
- global box sizing

**Acceptance Criteria:** page visually matches dark cozy foundation

### 3.4 Build UI Primitives

**Goal:** Create small reusable Kokpit components.

**Tasks**
Build:

- Button
- IconButton
- Input
- Textarea
- Card
- Badge
- Chip
- Skeleton
- EmptyState
- ErrorState

**Acceptance Criteria:** states exist: default, hover, focus, active, disabled; components use semantic tokens

**Do Not Do:** do not over-abstract; do not mimic generic component library appearance

### 3.5 Build App Shell

**Goal:** Create persistent app layout.

**Tasks**

- create `AppShell`
- create sidebar container
- create main content region
- prepare mobile collapse behavior

**Acceptance Criteria:** route content renders inside shell; shell does not remount on page navigation

### 3.6 Build Sidebar

**Goal:** Implement V1 navigation.

**Tasks**
Navigation:

- Home
- College
- Music
- News
- Ideas
- Library
- use Lucide icons
- active state
- hover state
- keyboard focus

**Acceptance Criteria:** all navigation destinations work; visual style matches design system

**Do Not Do:** do not add Tasks, Calendar, Focus, Notes, or Goals

### 3.7 Configure Routing

**Goal:** Create V1 routes.

**Tasks**
Create route placeholders:

- /home
- /college
- /music
- /news
- /ideas
- /library

Handle root redirect or Home root behavior.

**Acceptance Criteria:** all routes render; sidebar state follows route

### 3.8 App Shell Verification

**Acceptance Criteria:** design tokens consistent; routes work; no layout overflow at common laptop width; lint, typecheck, build pass

## Phase 4 — Home Core

**Phase 4 goal:** Build the Home atmosphere and preview layout without complete downstream features.

### 4.1 Build Home Hero

**Goal:** Implement the approved visual focal point.

**Tasks**

- greeting area
- large clock
- date
- contextual line
- quote placeholder
- atmospheric image area

**Acceptance Criteria:** clock is primary hierarchy; layout resembles approved design direction; Home does not feel like a dense dashboard

### 4.2 Implement Real-Time Clock

**Goal:** Show real local time.

**Tasks**

- update clock client-side
- use user timezone
- support 24h preference
- avoid unnecessary rerenders

**Acceptance Criteria:** time updates correctly; seconds display if design keeps seconds; no backend request required for clock

### 4.3 Build Home Feature Card Pattern

**Goal:** Create consistent preview cards.

**Tasks**

- section icon
- section title
- compact content
- CTA to dedicated page

**Acceptance Criteria:** cards feel like previews; cards do not duplicate full feature pages

### 4.4 Build Home Placeholder Previews

**Goal:** Create visual structure before feature integration.

**Tasks**
Build preview shells for:

- Music
- College
- News
- Ideas
- Quick Links

**Acceptance Criteria:** Home composition is complete visually; placeholders are temporary and clearly isolated

**Do Not Do:** do not implement fake production data as permanent logic

### 4.5 Home Visual Review

**Goal:** Compare actual Home against approved design concept.

**Acceptance Criteria**
Review:

- color
- density
- typography
- spacing
- card radius
- hero balance
- sidebar proportion
- cozy atmosphere

Do not proceed if Home already feels like a generic SaaS dashboard.

## Phase 5 — Ideas

**Phase 5 goal:** Ship the first fully functional user-owned feature.

### 5.1 Ideas Repository

**Goal:** Implement data access for ideas.

**Tasks**

- list
- create
- update
- delete
- search
- pin/unpin

**Acceptance Criteria:** all queries include user ownership

### 5.2 Ideas Service

**Goal:** Implement idea business logic.

**Tasks**

- validate content
- normalize optional title
- timestamps
- tag coordination if used

### 5.3 Ideas API

**Goal:** Expose Ideas endpoints.

Conceptual endpoints:

- GET /api/ideas
- POST /api/ideas
- PATCH /api/ideas/:id
- DELETE /api/ideas/:id

**Acceptance Criteria:** validation works; ownership works; errors are structured

### 5.4 Idea Composer

**Goal:** Make idea capture frictionless.

**Tasks**

- large simple input
- optional title
- optional tags
- keyboard submit behavior
- loading state

**Acceptance Criteria:** user can capture an idea quickly; tags are optional

### 5.5 Ideas Page

**Goal:** Create full Ideas page.

**Tasks**

- list ideas
- search
- edit
- delete
- pin
- empty state

**Acceptance Criteria:** feature is usable without Home

### 5.6 Connect Home Idea Capture

**Goal:** Replace Home placeholder with real idea capture.

**Acceptance Criteria:** idea can be saved directly from Home; Ideas page reflects it immediately

### 5.7 Ideas Tests

**Acceptance Criteria**
Test:

- create
- read
- update
- delete
- search
- ownership
- Home capture

## Phase 6 — Library / Quick Links

**Phase 6 goal:** Implement personal one-click web shortcuts.

### 6.1 Quick Links Repository & Service

**Tasks**
Implement:

- list
- create
- update
- delete
- reorder
- favorite

**Acceptance Criteria:** ownership enforced; ordering persists

### 6.2 Quick Links API

**Acceptance Criteria**
CRUD and reorder work with validation.

### 6.3 Library Page

**Tasks**

- quick link grid
- create form
- edit form
- delete
- reorder
- add icon selection strategy
- external link opening

**Acceptance Criteria:** user can manage links without editing code

### 6.4 Home Quick Links Preview

**Goal:** Show favorite or first links on Home.

**Acceptance Criteria:** preview uses real data; CTA opens Library

### 6.5 Library Tests

Test:

- create
- edit
- delete
- reorder
- favorite
- ownership

## Phase 7 — College Structure

**Phase 7 goal:** Implement Semester → Course → Week hierarchy before file uploads.

### 7.1 Semester Repository & API

Implement:

- list
- create
- rename
- set active
- delete
- reorder

**Acceptance Criteria:** one active semester behavior is correct

### 7.2 Course Repository & API

Implement:

- list by semester
- create
- update
- delete
- reorder

### 7.3 Week Repository & API

Implement:

- list by course
- create
- rename
- delete

**Acceptance Criteria:** week number unique per course

### 7.4 College Overview Page

**Tasks**

- active semester display
- semester selector
- course cards
- create semester
- create course

### 7.5 Course Page

**Tasks**

- breadcrumbs
- course header
- week list
- add week
- edit course metadata

### 7.6 Week Page Structure

**Goal:** Create week page before material upload is implemented.

**Acceptance Criteria:** page renders empty material state correctly

### 7.7 Home College Preview

**Goal:** Connect Home to active semester and relevant course/week.

**Acceptance Criteria:** preview uses real College data; no fake course data remains

### 7.8 College Structure Tests

Test:

- semester lifecycle
- course lifecycle
- week lifecycle
- cascade behavior
- ownership
- active semester

## Phase 8 — College Materials

**Phase 8 goal:** Add private file and link materials to College.

### 8.1 Configure R2 Binding

**Goal:** Connect private R2 storage.

**Acceptance Criteria:** Worker can write/read local or development R2 binding; bucket is not exposed publicly

### 8.2 Implement Storage Provider

**Goal:** Create backend-controlled R2 operations.

Implement:

- upload
- read
- delete
- range read if reusable

**Acceptance Criteria:** object keys are backend-generated

### 8.3 Material Metadata Repository

**Tasks**
Implement metadata CRUD.

Support:

- file
- link

### 8.4 Material Upload API

**Tasks**

- validate file
- enforce size limit
- create R2 object
- create D1 metadata
- rollback safely on failure

**Acceptance Criteria:** uploaded file appears in correct week; invalid upload is rejected

### 8.5 Material Link API

**Goal:** Support URL materials without R2.

**Acceptance Criteria:** valid links save; invalid URLs fail validation

### 8.6 Private File Delivery

**Tasks**

- authenticated file endpoint
- ownership check
- correct content type
- download/view response

**Acceptance Criteria:** file cannot be accessed by guessing IDs outside owner context

### 8.7 Material UI

**Tasks**

- upload control
- material row/card
- file icon
- link icon
- rename
- delete
- open/download

### 8.8 Material Deletion Workflow

**Goal:** Delete both metadata and R2 bytes.

**Acceptance Criteria:** no normal orphan remains after successful deletion

### 8.9 College Materials Tests

Test:

- upload
- link create
- open
- rename
- delete
- R2 cleanup
- ownership
- invalid file
- size limit

## Phase 9 — Music Core

**Phase 9 goal:** Build personal music library, playlists, and persistent playback.

### 9.1 Track Repository & API

Implement:

- list tracks
- create metadata
- update metadata
- favorite
- delete
- last played
- play count

### 9.2 Music Upload

**Tasks**

- validate audio type
- validate size
- upload to R2
- extract available metadata if practical
- persist track record

**Acceptance Criteria:** uploaded track appears in library

### 9.3 Track Streaming Endpoint

**Goal:** Support private browser playback with seeking.

**Tasks**

- ownership check
- parse Range header
- ranged R2 read
- return correct partial response

**Acceptance Criteria:** audio plays; user can seek; bucket stays private

### 9.4 Music Provider

**Goal:** Create global persistent playback state.

State includes:

- current track
- queue
- playing
- volume
- current time
- repeat
- shuffle

**Acceptance Criteria:** provider is mounted above route pages

### 9.5 Mini Player

**Goal:** Create persistent compact player.

**Acceptance Criteria:** remains active while navigating Kokpit; play/pause works; next/previous works; volume works

### 9.6 Music Library Page

**Tasks**

- list tracks
- upload track
- play track
- favorite
- delete
- search if needed

### 9.7 Playlist Repository & API

Implement:

- create playlist
- rename
- delete
- add track
- remove track
- reorder tracks

### 9.8 Playlist Page

**Tasks**

- playlist header
- track list
- reorder
- play playlist
- add/remove tracks

### 9.9 Home Music Preview

**Goal:** Connect Home Now Playing card to real playback state.

**Acceptance Criteria:** Home player reflects active track; controls affect persistent player

### 9.10 Music Tests

Test:

- upload
- stream
- range seek
- playback persistence
- playlist CRUD
- playlist reorder
- track delete
- R2 cleanup
- ownership

## Phase 10 — Quote System

**Phase 10 goal:** Implement hourly original quote generation and rotation.

### 10.1 Quote Repository

Implement:

- insert batch
- list eligible
- mark shown
- deduplicate by hash
- count pool

### 10.2 Quote Quality Filter

**Tasks**
Implement deterministic checks for:

- empty output
- length
- banned clichés
- duplicate content
- malformed attribution
- boilerplate

**Acceptance Criteria:** obvious generic output is rejected

### 10.3 Workers AI Quote Provider

**Goal:** Create provider abstraction.

**Tasks**

- provider interface
- Workers AI implementation
- configurable model
- mood input
- language input
- recent quote context

**Acceptance Criteria:** provider returns structured quote candidates

**Do Not Do:** do not call AI from React

### 10.4 Quote Refill Job

**Tasks**

- count pool
- stop if healthy
- generate batch
- validate
- deduplicate
- persist

**Acceptance Criteria:** job is safe to rerun; no uncontrolled generation

### 10.5 Current Hour Quote Selection

**Goal:** Return stable quote per local hour.

**Tasks**

- calculate user-local hour slot
- choose eligible quote
- avoid recent repetition
- keep same scheduled selection during hour

**Acceptance Criteria:** repeated calls in same hour return same primary quote

### 10.6 "Another Thought"

**Goal:** Allow manual alternate quote.

**Acceptance Criteria:** alternate differs from current where pool allows; scheduled hourly quote remains unchanged

### 10.7 Quote API

Conceptual:

- GET /api/quotes/current
- POST /api/quotes/another

### 10.8 Connect Home Quote

**Acceptance Criteria:** Home no longer uses placeholder quote; quote is mostly English; AI failure falls back gracefully

### 10.9 Quote Tests

Test:

- same-hour stability
- next-hour eligibility
- duplicate filter
- cliché filter
- fallback
- another thought
- AI failure

## Phase 11 — News System

**Phase 11 goal:** Build a curated, resilient personal news pipeline.

### 11.1 News Source Registry

**Goal:** Centralize source configuration.

Initial sources:

- NVIDIA
- GitHub Changelog
- Google
- Cloudflare
- Hacker News
- Ars Technica
- TechCrunch
- GDELT

**Acceptance Criteria:** source configuration is not scattered

### 11.2 Generic RSS Provider

**Goal:** Support standard RSS/Atom sources.

**Tasks**

- fetch
- parse
- normalize
- handle malformed entries safely

### 11.3 Hacker News Provider

**Goal:** Fetch developer signal.

**Tasks**

- top/best story IDs
- fetch item metadata
- normalize into Kokpit format

### 11.4 GDELT Provider

**Goal:** Provide world-event discovery.

**Tasks**

- query selected world-interest topics
- normalize results
- preserve original publisher domain

### 11.5 URL Normalization

**Goal:** Reduce duplicate articles.

**Tasks**

- remove UTM
- normalize trailing slash
- normalize canonical-like variants where safe

### 11.6 Deduplication Logic

**Tasks**

- exact URL dedup
- title normalization
- dedup key generation
- same-source near duplicate handling

### 11.7 Relevance Scoring

**Goal:** Implement deterministic V1 ranking.

**Inputs**

- topic match
- source priority
- freshness
- HN signal
- world importance
- duplicate penalty
- source quality

**Acceptance Criteria:** AI/NVIDIA/dev-tool stories rank strongly; irrelevant celebrity/lifestyle content ranks low

### 11.8 News Repository

Implement:

- insert/update normalized articles
- feed query
- home query
- category query
- cleanup old articles

### 11.9 News Refresh Job

**Tasks**

- fetch enabled sources
- isolate source failure
- normalize
- deduplicate
- score
- persist
- log counts

**Acceptance Criteria:** one failed source does not fail whole refresh

### 11.10 Optional AI News Enrichment

**Goal:** Enrich top relevant items only.

Potential output:

- summary
- why_it_matters
- category refinement

**Acceptance Criteria:** non-enriched articles still work normally

### 11.11 News API

Conceptual endpoints:

- GET /api/news
- GET /api/news/home

Support:

- limit
- category
- pagination/cursor if needed

### 11.12 News Page

**Tasks**

- article cards/list
- source
- time
- summary
- why it matters
- category filtering if useful
- original article link

**Acceptance Criteria:** feed feels curated, not noisy

### 11.13 Home News Preview

**Goal:** Show 2–3 strong diverse items.

**Acceptance Criteria:** avoid same-topic repetition; Home remains lightweight

### 11.14 News Cleanup Job

**Goal:** Delete stale articles after retention window.

**Acceptance Criteria:** default retention roughly 45 days; cleanup does not affect fresh feed

### 11.15 News Tests

Test:

- RSS parsing
- HN normalization
- GDELT normalization
- URL normalization
- dedup
- relevance scoring
- source failure isolation
- cached fallback
- Home selection

## Phase 12 — Responsive, UX & Polish

**Phase 12 goal:** Make Kokpit feel complete rather than merely functional.

### 12.1 Desktop Layout Polish

Review:

- spacing
- alignment
- typography
- max widths
- card proportions
- hero balance

**Acceptance Criteria:** approved dark visual direction is preserved

### 12.2 Tablet Layout

**Tasks**

- collapse sidebar where appropriate
- stack grids
- preserve player usability

### 12.3 Mobile Layout

Prioritize:

- clock
- idea capture
- music controls
- quick links
- college access
- news glance

**Acceptance Criteria:** no desktop dashboard squeezed onto mobile

### 12.4 Loading States

Implement:

- skeletons
- cached content where possible
- subtle loading

Avoid giant spinners.

### 12.5 Empty States

Implement for:

- ideas
- quick links
- college
- music
- news

### 12.6 Error States

Implement graceful local errors.

Examples:

- news refresh failed
- music upload failed
- material unavailable

### 12.7 Accessibility Pass

Verify:

- keyboard navigation
- focus states
- labels
- contrast
- reduced motion
- semantic buttons/links
- heading hierarchy

### 12.8 Motion Polish

Implement only subtle:

- hover
- small card transition
- page fade
- button press

**Do Not Do:** no bounce; no huge parallax; no glow-heavy effects

## Phase 13 — Testing & Hardening

**Phase 13 goal:** Validate critical flows before deployment.

### 13.1 Unit Test Pass

Required areas:

- quote filters
- quote selection
- news scoring
- news dedup
- URL normalization
- ordering logic

### 13.2 API Integration Test Pass

Required:

- ideas
- quick links
- college
- materials
- music
- quotes
- news
- ownership

### 13.3 E2E Smoke Tests

Critical flows:

- open Kokpit
- save an idea
- create quick link
- create semester/course/week
- upload material
- upload music
- play music
- navigate route while music continues
- load current quote
- load News
- open external news article

### 13.4 Ownership Security Pass

Verify every user-owned endpoint checks owner context.

**Acceptance Criteria**
No resource endpoint relies only on ID.

### 13.5 File Security Pass

Verify:

- R2 bucket private
- file route checks ownership
- music route checks ownership
- no raw object key trusted from client

### 13.6 Secret Scan

Verify:

- no API keys committed
- no production secret in source
- `.env.example` contains placeholders only

### 13.7 Dependency Review

Remove:

- unused packages
- duplicate utilities
- unnecessary heavy dependencies

### 13.8 Performance Pass

Review:

- Home bundle size
- lazy route loading
- image dimensions
- news query size
- music preloading
- unnecessary rerenders

## Phase 14 — Cloudflare Deployment

**Phase 14 goal:** Deploy Kokpit privately and safely.

### 14.1 Create Production D1

**Tasks**

- create production database
- configure binding
- apply migrations
- seed owner

### 14.2 Create Production R2 Bucket

**Tasks**

- create bucket
- keep private
- configure binding

### 14.3 Configure Workers AI

**Tasks**

- configure AI binding
- configure model setting
- verify quote provider

### 14.4 Configure Cron Triggers

Jobs:

- news refresh
- quote refill
- content cleanup

**Acceptance Criteria:** cron schedules deploy correctly

### 14.5 Configure Production Environment

Set:

- owner identity config
- timezone defaults if needed
- feature limits
- source configuration

### 14.6 Deploy Worker + Static Assets

**Acceptance Criteria:** frontend loads; API works; D1 works; R2 works; routes resolve correctly

### 14.7 Configure Cloudflare Access

**Goal:** Keep Kokpit private.

**Tasks**

- protect production hostname
- allow owner identity only
- deny default public access

**Acceptance Criteria:** unauthenticated visitor cannot access Kokpit; owner can access normally

### 14.8 Production Smoke Test

Verify:

- Home
- Ideas
- Library
- College
- Material upload
- Music upload/playback
- Quotes
- News
- navigation

## Phase 15 — V1 Acceptance & Freeze

**Phase 15 goal:** Confirm Kokpit V1 matches its product definition.

### 15.1 PRD Acceptance Review

Check V1 features against `PRD.md`.

Must exist:

- Home
- real-time clock
- dynamic quote
- Music
- News
- College
- Quick Links / Library
- Ideas
- private access

### 15.2 Design Review

Check against `DESIGN_SYSTEM.md`.

Reject regressions toward:

- generic dashboard
- dense cards
- neon SaaS look
- unnecessary widgets

### 15.3 Architecture Review

Check against `ARCHITECTURE.md`.

Confirm:

- React + Vite
- Worker + Hono
- D1
- Drizzle
- R2
- Access
- Cron
- optional Workers AI

### 15.4 Data Model Review

Confirm implementation matches `DATA_MODEL.md`.

Any real schema deviation must be documented.

### 15.5 Remove Temporary Development Content

Remove:

- fake quotes
- fake news
- fake courses
- fake tracks
- temporary placeholders
- debug UI
- console noise

### 15.6 Documentation Update

Update:

- README.md
- DECISIONS.md
- DEPLOYMENT.md
- AGENTS.md

where necessary.

### 15.7 V1 Freeze

V1 is considered frozen when:

- all core features work
- production deployment works
- private access works
- critical tests pass
- docs match implementation
- no known blocker remains

After freeze:

New feature ideas should not be silently added.

They should become:

- V1.x improvement
- or
- V2 scope discussion

## Session boundaries and manual commits

Do not build the whole application in one session. Prefer 1–3 subphases;
for larger features, separate repository/service/API, UI, and integration slices.
Examples: 1.1–1.3, then 1.4–1.6, then 2.1–2.3; split broader App Shell work
into similarly reviewable scopes. Stop at the scope the owner authorized.

The owner stages and commits manually. Agents must not run Git staging, commits,
or pushes. After edits, provide one concrete English commit command per changed
file, consistent with the owner's current instruction. Avoid giant unrelated commits.

## Review gates and trade-offs

Stop and request review when documentation contradicts implementation needs,
a new dependency/table appears necessary, architecture or V1 scope would change,
a provider is unavailable, design cannot match the approved direction, a destructive
migration is needed, or deployment behavior differs materially from this plan.
Do not silently invent a new direction.

Priority: data safety → privacy → core correctness → stable UX → performance →
visual polish → optional AI enrichment. News can ship without unstable AI enrichment.

A temporarily reduced usable internal build may include Home, Ideas, Quick Links,
College, basic Music, cached Quotes, basic News, and private Access. Optional
AI news enrichment, advanced mood weighting, complex playlist covers, and advanced
search may follow stable core functionality. This is a contingency path, not the
default V1 target or permission to drop required capabilities.

Every step should improve usability without making Kokpit harder to own.
Choose the smallest correct step toward the documented V1; reduce oversized tasks
before continuing. New ideas after freeze become V1.x improvements or V2 discussions.
