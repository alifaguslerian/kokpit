# Kokpit — Implementation Plan

**Version:** 0.3 | **Status:** V1 implementation plan | **Updated:** 2026-10-09

Implement the documented V1 in milestones and reviewable work packages. This plan controls order
and acceptance; [AGENTS](../../AGENTS.md) controls agent behavior. Read the
[PRD](../product/PRD.md), [Design System](../design/DESIGN_SYSTEM.md),
[Architecture](../engineering/ARCHITECTURE.md), [Data Model](../engineering/DATA_MODEL.md),
[File Structure](../engineering/FILE_STRUCTURE.md), [Content Sources](../features/CONTENT_SOURCES.md),
and [Deployment](../engineering/DEPLOYMENT.md) for the relevant task before coding.

## Progress and execution

Milestone 1 is in progress. Packages **1.1, 1.2, and 1.3 are complete**, preserving
the completed legacy Phase 0.1–0.2 and Phase 1.1–1.6 work.
The next implementation package is **1.4 Linting, Formatting & Foundation Verification**.
This documentation revision does not authorize starting it.

Use **milestone → work package → checklist**. Only milestones and work packages
have active numbers; the unnumbered checklist sections below are implementation details.

- An instruction such as `gas 2.1` authorizes that whole package, including validation.
  `gas Milestone 2` authorizes packages 2.1–2.3 in dependency order.
- Continue across checklist items within the authorized scope. Stop when the requested
  package/milestone is complete or a review gate requires an owner decision; do not ask
  for a new instruction after every checklist item.
- Do not enter the next package or milestone unless it is already authorized.
  A large milestone can span multiple turns; its size does not relax checks or scope.
- Preserve every goal, task, acceptance criterion, and prohibition. A package is complete
  only when all its included criteria pass. Test critical behavior during implementation
  and run the relevant final checks at the package boundary.
- Run relevant lint, typecheck, build, and tests. If a tool is not configured yet,
  report the limitation rather than claiming it passed.
- UI: verify desktop, responsive behavior, keyboard focus, and Design System fit.
  Backend: verify validation, ownership, safe errors, and migration consistency.
- Update the canonical documents affected by actual changes and report once at the
  authorized boundary. Do not update unrelated documents just to repeat progress.
- Do not silently add dependencies, expand V1, or change design/architecture.

### Legacy numbering

Each package lists its former Phase identifiers for traceability. References explicitly
named **Phase** in historical decisions and existing source comments use that old numbering.
Current instructions use **Milestone** or **package** numbers. Use the legacy labels below
to interpret old references; do not redo completed work or silently reinterpret its scope.

## Milestone map

| Milestone | Deliverable | Packages | Status |
| --- | --- | --- | --- |
| 1 | Foundation | 1.1–1.7 | In progress; 1.1–1.3 complete |
| 2 | App Shell & Home | 2.1–2.3 | Pending |
| 3 | Ideas & Library | 3.1–3.3 | Pending |
| 4 | College | 4.1–4.4 | Pending |
| 5 | Music | 5.1–5.3 | Pending |
| 6 | Quotes & News | 6.1–6.5 | Pending |
| 7 | Polish & Hardening | 7.1–7.4 | Pending |
| 8 | Private Release | 8.1–8.3 | Pending |

## Work package map

| Package | Deliverable | Legacy Phase checklist | Status |
| --- | --- | --- | --- |
| 1.1 | Preflight & Documentation Check | 0.1–0.2 | Complete |
| 1.2 | Frontend Scaffold | 1.1–1.3 | Complete |
| 1.3 | Workers, Hono & Tailwind Integration | 1.4–1.6 | Complete |
| 1.4 | Linting, Formatting & Foundation Verification | 1.7–1.8 | Pending |
| 1.5 | D1, Drizzle, Schema & Local Migration | 2.1–2.4 | Pending |
| 1.6 | Owner Context & API Safety | 2.5–2.8 | Pending |
| 1.7 | Server State & Backend Foundation Verification | 2.9–2.10 | Pending |
| 2.1 | Visual Foundation | 3.1–3.3 | Pending |
| 2.2 | App Shell & Navigation | 3.4–3.8 | Pending |
| 2.3 | Home Core & Visual Review | 4.1–4.5 | Pending |
| 3.1 | Ideas Backend | 5.1–5.3 | Pending |
| 3.2 | Ideas UI, Home Capture & Verification | 5.4–5.7 | Pending |
| 3.3 | Library & Quick Links | 6.1–6.5 | Pending |
| 4.1 | Semester, Course & Week APIs | 7.1–7.3 | Pending |
| 4.2 | College Pages, Home Preview & Verification | 7.4–7.8 | Pending |
| 4.3 | Private Storage & Material APIs | 8.1–8.6 | Pending |
| 4.4 | Material UI, Deletion & Verification | 8.7–8.9 | Pending |
| 5.1 | Tracks, Upload & Private Streaming | 9.1–9.3 | Pending |
| 5.2 | Persistent Playback & Music Library | 9.4–9.6 | Pending |
| 5.3 | Playlists, Home Player & Verification | 9.7–9.10 | Pending |
| 6.1 | Quote Pool, Quality & Batch Generation | 10.1–10.4 | Pending |
| 6.2 | Hourly Quotes, Home Integration & Verification | 10.5–10.9 | Pending |
| 6.3 | News Sources & Providers | 11.1–11.4 | Pending |
| 6.4 | News Normalization, Ranking & Refresh | 11.5–11.9 | Pending |
| 6.5 | News Delivery & Verification | 11.10–11.15 | Pending |
| 7.1 | Desktop, Tablet & Mobile Layout | 12.1–12.3 | Pending |
| 7.2 | UI States, Accessibility & Motion | 12.4–12.8 | Pending |
| 7.3 | Critical Flows, Ownership & File Security | 13.1–13.5 | Pending |
| 7.4 | Secrets, Dependencies & Performance | 13.6–13.8 | Pending |
| 8.1 | Production Resources & Configuration | 14.1–14.5 | Pending |
| 8.2 | Private Deployment & Production Smoke Test | 14.6–14.8 | Pending |
| 8.3 | V1 Acceptance, Documentation & Freeze | 15.1–15.7 | Pending |

## Milestone 1: Foundation

**Goal:** Ensure the repository has the required documentation and no implementation starts from missing assumptions. Create a clean, buildable, deployable project skeleton. Establish data persistence, validation, ownership context, and backend conventions.

### 1.1 Preflight & Documentation Check

**Status:** Complete | **Legacy Phase checklist:** 0.1–0.2

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Verify Documentation Skeleton

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

#### Cross-Check Documentation Consistency

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

</details>

### 1.2 Frontend Scaffold

**Status:** Complete | **Legacy Phase checklist:** 1.1–1.3

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Initialize Project

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

#### Configure TypeScript

**Goal:** Enable strict TypeScript across frontend and Worker code.

**Tasks**

- create `tsconfig.json`
- enable strict mode
- configure path aliases
- ensure frontend and Worker files are typechecked

**Acceptance Criteria:** TypeScript compiles without errors; aliases are minimal and documented

**Do Not Do:** do not disable strictness to bypass type errors

#### Configure Vite + React

**Goal:** Get the frontend development environment running.

**Tasks**

- install React
- install Vite
- configure React plugin
- create `src/main.tsx`
- create minimal `App.tsx`

**Acceptance Criteria:** dev server starts; minimal app renders; production build succeeds

**Do Not Do:** do not build final UI yet

</details>

### 1.3 Workers, Hono & Tailwind Integration

**Status:** Complete | **Legacy Phase checklist:** 1.4–1.6

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Configure Cloudflare Vite Integration

**Goal:** Make the project compatible with Cloudflare Workers deployment.

**Tasks**

- install Cloudflare Vite integration
- configure Worker entrypoint
- configure static asset serving
- connect frontend build to Worker runtime

**Acceptance Criteria:** local Cloudflare-compatible development works; static frontend and Worker route can coexist

**Do Not Do:** do not configure production secrets yet

#### Configure Hono

**Goal:** Create the backend routing foundation.

**Tasks**

- install Hono
- create `worker/index.ts`
- create a minimal API route
- create `/api/system/health`

**Acceptance Criteria:** `GET /api/system/health` returns success; frontend still loads normally

**Do Not Do:** do not add business logic

#### Configure Tailwind CSS

**Goal:** Enable styling foundation.

**Tasks**

- install Tailwind
- configure Vite integration
- import global stylesheet
- verify utility classes work

**Acceptance Criteria:** Tailwind styles render; no default theme overrides Kokpit design system

**Do Not Do:** do not install a large UI framework

</details>

### 1.4 Linting, Formatting & Foundation Verification

**Status:** Pending | **Legacy Phase checklist:** 1.7–1.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Configure Linting and Formatting

**Goal:** Make code quality checks deterministic.

**Tasks**

- configure ESLint
- configure formatting strategy
- add scripts
- lint frontend and Worker code

**Acceptance Criteria:** lint command passes; formatting rules are consistent

**Do Not Do:** do not add multiple competing formatters

#### Foundation Verification

**Goal:** Verify the project tooling foundation with a clean build.

**Tasks**
Run:

- lint
- typecheck
- build

**Acceptance Criteria:** all checks pass; repository has no feature implementation drift

</details>

### 1.5 D1, Drizzle, Schema & Local Migration

**Status:** Pending | **Legacy Phase checklist:** 2.1–2.4

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Configure D1 Binding

**Goal:** Connect Cloudflare D1 to the Worker.

**Tasks**

- configure D1 binding
- create local development database
- expose typed binding through `worker/env.ts`

**Acceptance Criteria:** Worker can query local D1; binding is typed

**Do Not Do:** do not connect local development directly to production database

#### Configure Drizzle

**Goal:** Create typed database access.

**Tasks**

- install Drizzle ORM
- configure `drizzle.config.ts`
- create database client
- create schema folder structure

**Acceptance Criteria:** Drizzle config resolves correctly; schema can generate migrations

#### Implement Initial Database Schema

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

#### Generate Initial Migration

**Goal:** Create the first version-controlled migration.

**Tasks**

- generate migration
- inspect migration SQL
- apply locally

**Acceptance Criteria:** local migration succeeds; schema is queryable; migration is committed

</details>

### 1.6 Owner Context & API Safety

**Status:** Pending | **Legacy Phase checklist:** 2.5–2.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Seed Owner User

**Goal:** Create the initial Kokpit owner identity.

**Tasks**

- create seed script
- seed owner user
- seed user settings
- use environment-provided owner email/config

**Acceptance Criteria:** exactly one owner exists in local seed; rerunning seed is safe

**Do Not Do:** do not hardcode private credentials

#### Implement Owner Context Middleware

**Goal:** Ensure every user-owned request has explicit owner context.

**Tasks**

- create owner-context middleware
- resolve owner ID
- expose owner ID to services

**Acceptance Criteria:** API handlers receive owner context; ownership can be enforced consistently

**Do Not Do:** do not rely purely on frontend assumptions

#### Implement Error Handler

**Goal:** Create safe structured API errors.

**Tasks**

- create global Hono error handler
- create standard error format
- hide stack traces in production responses

**Acceptance Criteria**
Errors return predictable JSON.

**Do Not Do:** do not expose SQL or secret details

#### Configure Zod Validation

**Goal:** Validate API inputs consistently.

**Tasks**

- install Zod
- define reusable validation patterns
- validate route params and request JSON

**Acceptance Criteria:** invalid input returns 4xx; services do not receive unvalidated raw payloads

</details>

### 1.7 Server State & Backend Foundation Verification

**Status:** Pending | **Legacy Phase checklist:** 2.9–2.10

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Configure TanStack Query

**Goal:** Create consistent frontend server-state behavior.

**Tasks**

- install TanStack Query
- create query client
- mount provider
- establish query-key conventions

**Acceptance Criteria:** frontend can fetch health endpoint through query layer

#### Backend Foundation Verification

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

</details>

## Milestone 2: App Shell & Home

**Goal:** Implement the visual foundation before feature pages. Build the Home atmosphere and preview layout without complete downstream features.

### 2.1 Visual Foundation

**Status:** Pending | **Legacy Phase checklist:** 3.1–3.3

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Implement Design Tokens

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

#### Load Fonts

**Goal:** Implement the approved typography direction.

**Tasks**

- load Inter
- load Cormorant Garamond or approved serif
- configure fallbacks
- apply font roles

**Acceptance Criteria:** display and UI fonts render correctly; fallback remains readable

#### Implement Global Styles

**Goal:** Create base Kokpit visual behavior.

**Tasks**

- body background
- default text
- focus styles
- scrollbar styling
- reduced-motion behavior
- global box sizing

**Acceptance Criteria:** page visually matches dark cozy foundation

</details>

### 2.2 App Shell & Navigation

**Status:** Pending | **Legacy Phase checklist:** 3.4–3.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Build UI Primitives

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

#### Build App Shell

**Goal:** Create persistent app layout.

**Tasks**

- create `AppShell`
- create sidebar container
- create main content region
- prepare mobile collapse behavior

**Acceptance Criteria:** route content renders inside shell; shell does not remount on page navigation

#### Build Sidebar

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

#### Configure Routing

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

#### App Shell Verification

**Acceptance Criteria:** design tokens consistent; routes work; no layout overflow at common laptop width; lint, typecheck, build pass

</details>

### 2.3 Home Core & Visual Review

**Status:** Pending | **Legacy Phase checklist:** 4.1–4.5

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Build Home Hero

**Goal:** Implement the approved visual focal point.

**Tasks**

- greeting area
- large clock
- date
- contextual line
- quote placeholder
- atmospheric image area

**Acceptance Criteria:** clock is primary hierarchy; layout resembles approved design direction; Home does not feel like a dense dashboard

#### Implement Real-Time Clock

**Goal:** Show real local time.

**Tasks**

- update clock client-side
- use user timezone
- support 24h preference
- avoid unnecessary rerenders

**Acceptance Criteria:** time updates correctly; seconds display if design keeps seconds; no backend request required for clock

#### Build Home Feature Card Pattern

**Goal:** Create consistent preview cards.

**Tasks**

- section icon
- section title
- compact content
- CTA to dedicated page

**Acceptance Criteria:** cards feel like previews; cards do not duplicate full feature pages

#### Build Home Placeholder Previews

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

#### Home Visual Review

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

</details>

## Milestone 3: Ideas & Library

**Goal:** Ship the first fully functional user-owned feature. Implement personal one-click web shortcuts.

### 3.1 Ideas Backend

**Status:** Pending | **Legacy Phase checklist:** 5.1–5.3

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Ideas Repository

**Goal:** Implement data access for ideas.

**Tasks**

- list
- create
- update
- delete
- search
- pin/unpin

**Acceptance Criteria:** all queries include user ownership

#### Ideas Service

**Goal:** Implement idea business logic.

**Tasks**

- validate content
- normalize optional title
- timestamps
- tag coordination if used

#### Ideas API

**Goal:** Expose Ideas endpoints.

Conceptual endpoints:

- GET /api/ideas
- POST /api/ideas
- PATCH /api/ideas/:id
- DELETE /api/ideas/:id

**Acceptance Criteria:** validation works; ownership works; errors are structured

</details>

### 3.2 Ideas UI, Home Capture & Verification

**Status:** Pending | **Legacy Phase checklist:** 5.4–5.7

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Idea Composer

**Goal:** Make idea capture frictionless.

**Tasks**

- large simple input
- optional title
- optional tags
- keyboard submit behavior
- loading state

**Acceptance Criteria:** user can capture an idea quickly; tags are optional

#### Ideas Page

**Goal:** Create full Ideas page.

**Tasks**

- list ideas
- search
- edit
- delete
- pin
- empty state

**Acceptance Criteria:** feature is usable without Home

#### Connect Home Idea Capture

**Goal:** Replace Home placeholder with real idea capture.

**Acceptance Criteria:** idea can be saved directly from Home; Ideas page reflects it immediately

#### Ideas Tests

**Acceptance Criteria**
Test:

- create
- read
- update
- delete
- search
- ownership
- Home capture

</details>

### 3.3 Library & Quick Links

**Status:** Pending | **Legacy Phase checklist:** 6.1–6.5

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Quick Links Repository & Service

**Tasks**
Implement:

- list
- create
- update
- delete
- reorder
- favorite

**Acceptance Criteria:** ownership enforced; ordering persists

#### Quick Links API

**Acceptance Criteria**
CRUD and reorder work with validation.

#### Library Page

**Tasks**

- quick link grid
- create form
- edit form
- delete
- reorder
- add icon selection strategy
- external link opening

**Acceptance Criteria:** user can manage links without editing code

#### Home Quick Links Preview

**Goal:** Show favorite or first links on Home.

**Acceptance Criteria:** preview uses real data; CTA opens Library

#### Library Tests

Test:

- create
- edit
- delete
- reorder
- favorite
- ownership

</details>

## Milestone 4: College

**Goal:** Implement Semester → Course → Week hierarchy before file uploads. Add private file and link materials to College.

### 4.1 Semester, Course & Week APIs

**Status:** Pending | **Legacy Phase checklist:** 7.1–7.3

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Semester Repository & API

Implement:

- list
- create
- rename
- set active
- delete
- reorder

**Acceptance Criteria:** one active semester behavior is correct

#### Course Repository & API

Implement:

- list by semester
- create
- update
- delete
- reorder

#### Week Repository & API

Implement:

- list by course
- create
- rename
- delete

**Acceptance Criteria:** week number unique per course

</details>

### 4.2 College Pages, Home Preview & Verification

**Status:** Pending | **Legacy Phase checklist:** 7.4–7.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### College Overview Page

**Tasks**

- active semester display
- semester selector
- course cards
- create semester
- create course

#### Course Page

**Tasks**

- breadcrumbs
- course header
- week list
- add week
- edit course metadata

#### Week Page Structure

**Goal:** Create week page before material upload is implemented.

**Acceptance Criteria:** page renders empty material state correctly

#### Home College Preview

**Goal:** Connect Home to active semester and relevant course/week.

**Acceptance Criteria:** preview uses real College data; no fake course data remains

#### College Structure Tests

Test:

- semester lifecycle
- course lifecycle
- week lifecycle
- cascade behavior
- ownership
- active semester

</details>

### 4.3 Private Storage & Material APIs

**Status:** Pending | **Legacy Phase checklist:** 8.1–8.6

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Configure R2 Binding

**Goal:** Connect private R2 storage.

**Acceptance Criteria:** Worker can write/read local or development R2 binding; bucket is not exposed publicly

#### Implement Storage Provider

**Goal:** Create backend-controlled R2 operations.

Implement:

- upload
- read
- delete
- range read if reusable

**Acceptance Criteria:** object keys are backend-generated

#### Material Metadata Repository

**Tasks**
Implement metadata CRUD.

Support:

- file
- link

#### Material Upload API

**Tasks**

- validate file
- enforce size limit
- create R2 object
- create D1 metadata
- rollback safely on failure

**Acceptance Criteria:** uploaded file appears in correct week; invalid upload is rejected

#### Material Link API

**Goal:** Support URL materials without R2.

**Acceptance Criteria:** valid links save; invalid URLs fail validation

#### Private File Delivery

**Tasks**

- authenticated file endpoint
- ownership check
- correct content type
- download/view response

**Acceptance Criteria:** file cannot be accessed by guessing IDs outside owner context

</details>

### 4.4 Material UI, Deletion & Verification

**Status:** Pending | **Legacy Phase checklist:** 8.7–8.9

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Material UI

**Tasks**

- upload control
- material row/card
- file icon
- link icon
- rename
- delete
- open/download

#### Material Deletion Workflow

**Goal:** Delete both metadata and R2 bytes.

**Acceptance Criteria:** no normal orphan remains after successful deletion

#### College Materials Tests

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

</details>

## Milestone 5: Music

**Goal:** Build personal music library, playlists, and persistent playback.

### 5.1 Tracks, Upload & Private Streaming

**Status:** Pending | **Legacy Phase checklist:** 9.1–9.3

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Track Repository & API

Implement:

- list tracks
- create metadata
- update metadata
- favorite
- delete
- last played
- play count

#### Music Upload

**Tasks**

- validate audio type
- validate size
- upload to R2
- extract available metadata if practical
- persist track record

**Acceptance Criteria:** uploaded track appears in library

#### Track Streaming Endpoint

**Goal:** Support private browser playback with seeking.

**Tasks**

- ownership check
- parse Range header
- ranged R2 read
- return correct partial response

**Acceptance Criteria:** audio plays; user can seek; bucket stays private

</details>

### 5.2 Persistent Playback & Music Library

**Status:** Pending | **Legacy Phase checklist:** 9.4–9.6

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Music Provider

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

#### Mini Player

**Goal:** Create persistent compact player.

**Acceptance Criteria:** remains active while navigating Kokpit; play/pause works; next/previous works; volume works

#### Music Library Page

**Tasks**

- list tracks
- upload track
- play track
- favorite
- delete
- search if needed

</details>

### 5.3 Playlists, Home Player & Verification

**Status:** Pending | **Legacy Phase checklist:** 9.7–9.10

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Playlist Repository & API

Implement:

- create playlist
- rename
- delete
- add track
- remove track
- reorder tracks

#### Playlist Page

**Tasks**

- playlist header
- track list
- reorder
- play playlist
- add/remove tracks

#### Home Music Preview

**Goal:** Connect Home Now Playing card to real playback state.

**Acceptance Criteria:** Home player reflects active track; controls affect persistent player

#### Music Tests

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

</details>

## Milestone 6: Quotes & News

**Goal:** Implement hourly original quote generation and rotation. Build a curated, resilient personal news pipeline.

### 6.1 Quote Pool, Quality & Batch Generation

**Status:** Pending | **Legacy Phase checklist:** 10.1–10.4

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Quote Repository

Implement:

- insert batch
- list eligible
- mark shown
- deduplicate by hash
- count pool

#### Quote Quality Filter

**Tasks**
Implement deterministic checks for:

- empty output
- length
- banned clichés
- duplicate content
- malformed attribution
- boilerplate

**Acceptance Criteria:** obvious generic output is rejected

#### Workers AI Quote Provider

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

#### Quote Refill Job

**Tasks**

- count pool
- stop if healthy
- generate batch
- validate
- deduplicate
- persist

**Acceptance Criteria:** job is safe to rerun; no uncontrolled generation

</details>

### 6.2 Hourly Quotes, Home Integration & Verification

**Status:** Pending | **Legacy Phase checklist:** 10.5–10.9

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Current Hour Quote Selection

**Goal:** Return stable quote per local hour.

**Tasks**

- calculate user-local hour slot
- choose eligible quote
- avoid recent repetition
- keep same scheduled selection during hour

**Acceptance Criteria:** repeated calls in same hour return same primary quote

#### "Another Thought"

**Goal:** Allow manual alternate quote.

**Acceptance Criteria:** alternate differs from current where pool allows; scheduled hourly quote remains unchanged

#### Quote API

Conceptual:

- GET /api/quotes/current
- POST /api/quotes/another

#### Connect Home Quote

**Acceptance Criteria:** Home no longer uses placeholder quote; quote is mostly English; AI failure falls back gracefully

#### Quote Tests

Test:

- same-hour stability
- next-hour eligibility
- duplicate filter
- cliché filter
- fallback
- another thought
- AI failure

</details>

### 6.3 News Sources & Providers

**Status:** Pending | **Legacy Phase checklist:** 11.1–11.4

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### News Source Registry

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

#### Generic RSS Provider

**Goal:** Support standard RSS/Atom sources.

**Tasks**

- fetch
- parse
- normalize
- handle malformed entries safely

#### Hacker News Provider

**Goal:** Fetch developer signal.

**Tasks**

- top/best story IDs
- fetch item metadata
- normalize into Kokpit format

#### GDELT Provider

**Goal:** Provide world-event discovery.

**Tasks**

- query selected world-interest topics
- normalize results
- preserve original publisher domain

</details>

### 6.4 News Normalization, Ranking & Refresh

**Status:** Pending | **Legacy Phase checklist:** 11.5–11.9

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### URL Normalization

**Goal:** Reduce duplicate articles.

**Tasks**

- remove UTM
- normalize trailing slash
- normalize canonical-like variants where safe

#### Deduplication Logic

**Tasks**

- exact URL dedup
- title normalization
- dedup key generation
- same-source near duplicate handling

#### Relevance Scoring

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

#### News Repository

Implement:

- insert/update normalized articles
- feed query
- home query
- category query
- cleanup old articles

#### News Refresh Job

**Tasks**

- fetch enabled sources
- isolate source failure
- normalize
- deduplicate
- score
- persist
- log counts

**Acceptance Criteria:** one failed source does not fail whole refresh

</details>

### 6.5 News Delivery & Verification

**Status:** Pending | **Legacy Phase checklist:** 11.10–11.15

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Optional AI News Enrichment

**Goal:** Enrich top relevant items only.

Potential output:

- summary
- why_it_matters
- category refinement

**Acceptance Criteria:** non-enriched articles still work normally

#### News API

Conceptual endpoints:

- GET /api/news
- GET /api/news/home

Support:

- limit
- category
- pagination/cursor if needed

#### News Page

**Tasks**

- article cards/list
- source
- time
- summary
- why it matters
- category filtering if useful
- original article link

**Acceptance Criteria:** feed feels curated, not noisy

#### Home News Preview

**Goal:** Show 2–3 strong diverse items.

**Acceptance Criteria:** avoid same-topic repetition; Home remains lightweight

#### News Cleanup Job

**Goal:** Delete stale articles after retention window.

**Acceptance Criteria:** default retention roughly 45 days; cleanup does not affect fresh feed

#### News Tests

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

</details>

## Milestone 7: Polish & Hardening

**Goal:** Make Kokpit feel complete rather than merely functional. Validate critical flows before deployment.

### 7.1 Desktop, Tablet & Mobile Layout

**Status:** Pending | **Legacy Phase checklist:** 12.1–12.3

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Desktop Layout Polish

Review:

- spacing
- alignment
- typography
- max widths
- card proportions
- hero balance

**Acceptance Criteria:** approved dark visual direction is preserved

#### Tablet Layout

**Tasks**

- collapse sidebar where appropriate
- stack grids
- preserve player usability

#### Mobile Layout

Prioritize:

- clock
- idea capture
- music controls
- quick links
- college access
- news glance

**Acceptance Criteria:** no desktop dashboard squeezed onto mobile

</details>

### 7.2 UI States, Accessibility & Motion

**Status:** Pending | **Legacy Phase checklist:** 12.4–12.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Loading States

Implement:

- skeletons
- cached content where possible
- subtle loading

Avoid giant spinners.

#### Empty States

Implement for:

- ideas
- quick links
- college
- music
- news

#### Error States

Implement graceful local errors.

Examples:

- news refresh failed
- music upload failed
- material unavailable

#### Accessibility Pass

Verify:

- keyboard navigation
- focus states
- labels
- contrast
- reduced motion
- semantic buttons/links
- heading hierarchy

#### Motion Polish

Implement only subtle:

- hover
- small card transition
- page fade
- button press

**Do Not Do:** no bounce; no huge parallax; no glow-heavy effects

</details>

### 7.3 Critical Flows, Ownership & File Security

**Status:** Pending | **Legacy Phase checklist:** 13.1–13.5

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Unit Test Pass

Required areas:

- quote filters
- quote selection
- news scoring
- news dedup
- URL normalization
- ordering logic

#### API Integration Test Pass

Required:

- ideas
- quick links
- college
- materials
- music
- quotes
- news
- ownership

#### E2E Smoke Tests

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

#### Ownership Security Pass

Verify every user-owned endpoint checks owner context.

**Acceptance Criteria**
No resource endpoint relies only on ID.

#### File Security Pass

Verify:

- R2 bucket private
- file route checks ownership
- music route checks ownership
- no raw object key trusted from client

</details>

### 7.4 Secrets, Dependencies & Performance

**Status:** Pending | **Legacy Phase checklist:** 13.6–13.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Secret Scan

Verify:

- no API keys committed
- no production secret in source
- `.env.example` contains placeholders only

#### Dependency Review

Remove:

- unused packages
- duplicate utilities
- unnecessary heavy dependencies

#### Performance Pass

Review:

- Home bundle size
- lazy route loading
- image dimensions
- news query size
- music preloading
- unnecessary rerenders

</details>

## Milestone 8: Private Release

**Goal:** Deploy Kokpit privately and safely. Confirm Kokpit V1 matches its product definition.

### 8.1 Production Resources & Configuration

**Status:** Pending | **Legacy Phase checklist:** 14.1–14.5

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Create Production D1

**Tasks**

- create production database
- configure binding
- apply migrations
- seed owner

#### Create Production R2 Bucket

**Tasks**

- create bucket
- keep private
- configure binding

#### Configure Workers AI

**Tasks**

- configure AI binding
- configure model setting
- verify quote provider

#### Configure Cron Triggers

Jobs:

- news refresh
- quote refill
- content cleanup

**Acceptance Criteria:** cron schedules deploy correctly

#### Configure Production Environment

Set:

- owner identity config
- timezone defaults if needed
- feature limits
- source configuration

</details>

### 8.2 Private Deployment & Production Smoke Test

**Status:** Pending | **Legacy Phase checklist:** 14.6–14.8

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### Deploy Worker + Static Assets

**Acceptance Criteria:** frontend loads; API works; D1 works; R2 works; routes resolve correctly

#### Configure Cloudflare Access

**Goal:** Keep Kokpit private.

**Tasks**

- protect production hostname
- allow owner identity only
- deny default public access

**Acceptance Criteria:** unauthenticated visitor cannot access Kokpit; owner can access normally

#### Production Smoke Test

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

</details>

### 8.3 V1 Acceptance, Documentation & Freeze

**Status:** Pending | **Legacy Phase checklist:** 15.1–15.7

<details>
<summary>Checklist, acceptance criteria, and constraints</summary>

#### PRD Acceptance Review

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

#### Design Review

Check against `DESIGN_SYSTEM.md`.

Reject regressions toward:

- generic dashboard
- dense cards
- neon SaaS look
- unnecessary widgets

#### Architecture Review

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

#### Data Model Review

Confirm implementation matches `DATA_MODEL.md`.

Any real schema deviation must be documented.

#### Remove Temporary Development Content

Remove:

- fake quotes
- fake news
- fake courses
- fake tracks
- temporary placeholders
- debug UI
- console noise

#### Documentation Update

Update:

- README.md
- DECISIONS.md
- DEPLOYMENT.md
- AGENTS.md

where necessary.

#### V1 Freeze

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

</details>

## Session boundaries and manual commits

A work package is the default execution unit. The owner may authorize one package,
a package range, or a whole milestone. Keep internal implementation and verification
steps connected; no new instruction is needed between included checklist items.
Stop at the authorized boundary. Review gates still apply within a package.

The owner stages, commits, and pushes manually. Agents must not run Git staging,
commits, or pushes. After edits, supply commands covering every changed file with
concrete English messages. Group related files that serve the same change; keep
unrelated work separate and avoid bundling the whole session into one commit.

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
