# Kokpit

> A private personal digital room for work, college, music, ideas, and the things worth keeping nearby.

Kokpit is a private single-user web workspace designed to stay open throughout the day.

It is not intended to be a productivity dashboard, task manager, admin panel, or Notion clone.

The core idea is simple:

> It shouldn't make me feel productive. It should make me want to stay.

Kokpit combines a calm dark interface with a small set of personal tools:

```txt
Home
College
Music
News
Ideas
Library
```

V1 is built primarily for one owner and deployed privately on Cloudflare.

---

## Status

```txt
Product:
V1 specification frozen

Implementation:
Phase 1.1–1.3 complete; frontend scaffold only

Access model:
Private single-user

Primary platform:
Desktop web

Deployment target:
Cloudflare
```

The repository is specification-driven.

Before implementing anything, read:

```txt
AGENTS.md
```

---

# Product Direction

Kokpit should feel like:

```txt
a personal room
a quiet workspace
a late-night desk
a place to keep useful things close
```

It should not feel like:

```txt
a corporate dashboard
a productivity tracker
an admin template
a gamified workflow app
a generic AI SaaS
```

The visual direction is:

```txt
Dark Cozy Editorial Workspace
```

Core characteristics:

```txt
deep warm charcoal
soft off-white text
restrained copper / amber accent
large serif clock
clean sans-serif functional UI
subtle cards
soft borders
low visual noise
```

---

# V1 Features

## Home

Home is the atmospheric entry point.

It includes:

```txt
real-time clock
date
dynamic hourly quote
music preview
college preview
news preview
quick idea capture
quick links preview
```

Home is intentionally not a full dashboard.

Each feature has its own dedicated page.

---

## Ideas

Fast personal idea capture.

Supports:

```txt
quick text capture
optional title
optional tags
browse
search
edit
delete
pin
```

The feature is intentionally lightweight.

It is not a full document editor or knowledge-management system.

---

## Library

A personal quick-links collection.

Supports:

```txt
custom name
URL
icon
favorite
reorder
edit
delete
optional grouping
```

Designed for frequently visited tools, websites, college resources, and personal shortcuts.

---

## College

Academic material organization.

Hierarchy:

```txt
Semester
└── Course
    └── Week
        └── Material
```

Materials may be:

```txt
PDF
PowerPoint
Word document
image
code/archive
other uploaded file
external link
```

Structured metadata is stored in D1.

Uploaded file bytes are stored privately in R2.

---

## Music

A personal music library and persistent player.

Supports:

```txt
audio upload
library
playback
playlist
queue
favorite
play / pause
previous / next
volume
shuffle
repeat
seek
```

The player persists while navigating between Kokpit pages.

The core V1 music system is based on audio files the owner has permission to store.

---

## Quotes

Home displays one primary thought for each local hour.

Quote behavior:

```txt
mostly English
original AI-generated thoughts
generated in batches
stored in D1
stable within each hour
mood-diverse
anti-cliché
cached fallback
```

Target language mix:

```txt
~90% English
~10% Indonesian
```

Required V1 action, visually secondary:

```txt
another thought
```

AI is never called on every Home page load.

---

## News

A curated personal news feed focused on signal rather than volume.

Primary interests include:

```txt
AI
LLMs
developer tools
software engineering
GitHub
OpenAI
Google AI
NVIDIA
cybersecurity
technology
hardware
research
major world events
```

Initial source strategy:

```txt
Official:
NVIDIA
GitHub
Google
Cloudflare

Developer signal:
Hacker News

Tech journalism:
Ars Technica
TechCrunch

World discovery:
GDELT
```

Pipeline:

```txt
Cron
→ fetch
→ normalize
→ validate
→ deduplicate
→ relevance score
→ optional AI enrichment
→ D1
→ Kokpit
```

Target refresh:

```txt
every 30 minutes
```

AI enrichment is optional and may provide:

```txt
summary
why it matters
classification refinement
```

---

# V1 Non-Goals

Kokpit V1 intentionally does not include:

```txt
Tasks
Kanban
Calendar
Pomodoro
Habit tracking
Focus timer
Goals
Productivity score
Streaks
XP
Team collaboration
Public profiles
Social features
Email client
AI chatbot panel
Universal command palette
Global semantic search
Full note-taking system
Project-management suite
```

New feature ideas should not be added to V1 without revising the product specification.

---

# Architecture

Kokpit uses a single-repository full-stack Cloudflare architecture.

```txt
Browser
   │
   ▼
Cloudflare Access
   │
   ▼
Cloudflare Worker
   ├── React static assets
   ├── Hono API
   ├── D1
   ├── R2
   └── Workers AI
```

Scheduled jobs:

```txt
Cloudflare Cron Triggers
   │
   ├── News refresh
   ├── Quote refill
   └── Content cleanup
```

---

# Tech Stack

## Frontend

```txt
React
TypeScript
Vite
React Router
TanStack Query
Tailwind CSS
Lucide
```

## Backend

```txt
Cloudflare Workers
Hono
TypeScript
Zod
```

## Data

```txt
Cloudflare D1
Drizzle ORM
```

## File Storage

```txt
Cloudflare R2
```

## Private Access

```txt
Cloudflare Access
```

## Scheduled Jobs

```txt
Cloudflare Cron Triggers
```

## AI

```txt
Cloudflare Workers AI
```

Workers AI is optional infrastructure.

Kokpit core functionality must continue working if AI is temporarily unavailable.

---

# Why This Stack?

Kokpit is a highly interactive personal web app but does not require public SEO-oriented server rendering.

React + Vite keeps the frontend simple.

Cloudflare Workers provides the backend without requiring a traditional always-running server.

D1 stores structured data.

R2 stores private file bytes.

Cloudflare Access protects V1 without forcing the project to build a custom authentication product.

The overall goal is:

```txt
few moving parts
low operational overhead
low cost
easy maintenance
future growth without rewrite
```

---

# Data Model

Main V1 entities:

```txt
Identity
├── users
└── user_settings

Ideas
├── ideas
├── idea_tags
└── idea_tag_links

Library
└── quick_links

College
├── semesters
├── courses
├── weeks
└── materials

Music
├── tracks
├── playlists
└── playlist_tracks

News
├── news_sources
└── news_articles

Quotes
└── quotes

System
└── app_state
```

The primary storage rule:

> D1 knows what something is. R2 stores the bytes when that something is a file.

---

# Ownership Model

Kokpit V1 has one owner.

However, persistent user-owned records include:

```txt
user_id
```

This keeps the data layer multi-user-ready without implementing public multi-user behavior in V1.

Application queries must enforce ownership.

Example:

```sql
SELECT *
FROM ideas
WHERE id = ?
AND user_id = ?;
```

Do not remove ownership because V1 currently has only one user.

---

# Private Access

Kokpit V1 is protected with:

```txt
Cloudflare Access
```

Expected policy:

```txt
default
→ deny

owner identity
→ allow
```

V1 does not provide:

```txt
public registration
custom login system
account switching
public profiles
```

Cloudflare Access protects the application entry point.

Application-level ownership checks are still required.

---

# Repository Structure

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
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── types/
│   └── main.tsx
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

For the full structure rules, see:

```txt
docs/engineering/FILE_STRUCTURE.md
```

---

# Documentation

Kokpit uses living documentation.

File names remain stable while document versions evolve through:

```txt
document header versions
Git history
DECISIONS.md
```

## Product

### `docs/product/PRD.md`

Defines:

```txt
what Kokpit is
V1 scope
requirements
non-goals
success criteria
```

### `docs/product/DECISIONS.md`

Records:

```txt
important decisions
reasoning
consequences
future superseding decisions
```

---

## Design

### `docs/design/DESIGN_SYSTEM.md`

Defines:

```txt
colors
typography
spacing
radii
shadows
motion
cards
buttons
inputs
layout
Home hierarchy
responsive behavior
visual anti-patterns
```

---

## Engineering

### `docs/engineering/ARCHITECTURE.md`

Defines:

```txt
stack
runtime
frontend/backend boundaries
Cloudflare services
API architecture
storage strategy
background jobs
security model
```

### `docs/engineering/DATA_MODEL.md`

Defines:

```txt
tables
fields
relationships
ownership
indexes
deletion behavior
D1/R2 boundaries
```

### `docs/engineering/FILE_STRUCTURE.md`

Defines:

```txt
where code belongs
feature boundaries
frontend structure
Worker structure
provider structure
test structure
```

### `docs/engineering/DEPLOYMENT.md`

Defines:

```txt
local setup
Cloudflare resources
D1 migrations
R2
Workers AI
Cron
Access
deployment
rollback
production checks
```

---

## Features

### `docs/features/CONTENT_SOURCES.md`

Defines:

```txt
quote generation
quote rotation
quote moods
news sources
news refresh
relevance scoring
AI enrichment
fallback behavior
```

---

## Planning

### `docs/planning/IMPLEMENTATION_PLAN.md`

Defines implementation order from:

```txt
Phase 0
through
Phase 15
```

Tasks are intentionally small and agent-friendly.

---

# Documentation Reading Order

For the first implementation session:

```txt
1. AGENTS.md
2. PRD.md
3. DESIGN_SYSTEM.md
4. ARCHITECTURE.md
5. DATA_MODEL.md
6. CONTENT_SOURCES.md
7. FILE_STRUCTURE.md
8. IMPLEMENTATION_PLAN.md
9. DECISIONS.md
10. DEPLOYMENT.md
11. README.md
```

Do not ask an AI coding agent to build the entire app from this README alone.

---

# Implementation Strategy

Kokpit is implemented in small phases.

High-level order:

```txt
Phase 0  — Preflight & Documentation Check
Phase 1  — Project Foundation
Phase 2  — Backend & Database Foundation
Phase 3  — App Shell & Design System
Phase 4  — Home Core
Phase 5  — Ideas
Phase 6  — Library / Quick Links
Phase 7  — College Structure
Phase 8  — College Materials
Phase 9  — Music Core
Phase 10 — Quote System
Phase 11 — News System
Phase 12 — Responsive, UX & Polish
Phase 13 — Testing & Hardening
Phase 14 — Cloudflare Deployment
Phase 15 — V1 Acceptance & Freeze
```

Recommended AI-agent session scope:

```txt
1–3 subphases
```

Do not ask one agent to implement every phase at once.

---

# Local Development

The current scaffold covers Phase 1.1–1.3 only. It renders a minimal React page without final styling or Kokpit features. Cloudflare runtime integration starts in Phase 1.4; this build is not yet deployable as the complete Cloudflare application.

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

Use Node.js 20.19+ on the 20.x line or 22.12+ on newer lines, as required by [Vite](https://vite.dev/guide/). The package is private and uses npm. Commit `package-lock.json` with dependency changes and use `npm ci` to reproduce the locked installation.

Current validation and build commands:

```bash
npm run typecheck
npm run build
npm run preview
```

`build` runs strict TypeScript checking before bundling the React frontend. `preview` serves that production build locally. Linting is scheduled for Phase 1.7; no lint script or test framework is configured in this scaffold.

`tsconfig.json` includes `src/`, `worker/`, `shared/`, `tests/`, and `vite.config.ts`. Worker files will be checked when introduced; Cloudflare runtime and binding types belong to the later Cloudflare setup. The only TypeScript aliases are `@/*` for `src/*` and `@worker/*` for `worker/*`. Vite resolves the frontend `@` alias; frontend code must not import Worker-only code.

Phase 1.1 creates `worker/`, `shared/`, `tests/`, and `drizzle/migrations/` locally. They contain no implementation yet, so Git does not track these empty directories. Create their files when the relevant phase starts; no placeholder files are required.

Phase 1.1–1.3 validation on 2026-10-06 passed dependency installation, strict typecheck, production build, and browser smoke checks of both dev and production-preview rendering. The minimal page rendered at desktop (1366px) and mobile (390px) widths without horizontal overflow, and the browser reported no warnings or errors. This checks the scaffold only; feature states and interactions do not exist yet.

The next documented step is Phase 1.4, Configure Cloudflare Vite Integration. It has not started.

Expected Cloudflare commands:

```bash
npx wrangler login
npx wrangler whoami
```

Detailed setup belongs in:

```txt
docs/engineering/DEPLOYMENT.md
```

---

# Expected Package Scripts

The final project is expected to expose commands similar to:

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
deploy
```

The exact scripts should be frozen during implementation Phase 1 and Phase 2.

---

# Environment Configuration

Expected local development configuration:

```txt
.dev.vars
```

Example names:

```txt
KOKPIT_OWNER_EMAIL=
KOKPIT_DEFAULT_TIMEZONE=Asia/Jakarta
KOKPIT_ENVIRONMENT=development
QUOTE_AI_MODEL=
```

Do not commit real secrets.

---

# Deployment

Production target:

```txt
Cloudflare Worker
+
Static Assets
```

Production resources:

```txt
Worker:
kokpit

D1:
kokpit-db

R2:
kokpit-files
```

Suggested deployment flow:

```txt
create D1
create R2
configure bindings
apply migrations
seed owner
build
deploy
configure Cloudflare Access
verify Cron
run smoke tests
```

Detailed instructions:

```txt
docs/engineering/DEPLOYMENT.md
```

---

# AI Coding Agent Rules

All AI coding agents must read:

```txt
AGENTS.md
```

Important rules include:

```txt
do not expand V1 scope
do not replace the approved stack
do not invent new tables silently
do not add infrastructure without need
do not bypass user_id ownership
do not expose R2 publicly
do not send private user content to AI
do not turn Home into a widget wall
do not add generic AI SaaS styling
do not skip validation
```

When a task requires a major product or architecture decision:

```txt
STOP
review
ask
```

Do not silently invent a new direction.

---

# Design Rules

Primary palette:

```txt
background:
warm charcoal

text:
soft off-white

accent:
restrained copper / amber
```

Primary fonts:

```txt
Display:
Cormorant Garamond

UI:
Inter
```

Icon style:

```txt
Lucide outline icons
```

Avoid:

```txt
bright purple gradients
neon cyan
cyberpunk
RGB
heavy glassmorphism
huge productivity stats
gamification
generic AI sparkle styling
```

For complete design tokens:

```txt
docs/design/DESIGN_SYSTEM.md
```

---

# Content Philosophy

Kokpit should surface less content, but better content.

For Quotes:

```txt
varied mood
mostly English
non-generic
hourly
cached
quiet
```

For News:

```txt
relevant
fresh
diverse
source-aware
world-aware
not noisy
```

The final content question is:

> Is this worth occupying attention inside a personal space?

If not, it should not be surfaced.

---

# Testing Philosophy

The highest-value tests cover:

```txt
ownership
data integrity
file handling
music streaming
quote rotation
news normalization
critical user flows
```

Important E2E flows include:

```txt
open Kokpit
save idea
create quick link
create semester/course/week
upload material
upload music
play music
navigate without stopping playback
load current quote
load News
open original article
```

---

# Security Principles

Kokpit V1 assumes personal data is private.

Security layers:

```txt
Cloudflare Access
      ↓
Worker
      ↓
input validation
      ↓
ownership checks
      ↓
D1 / R2
```

Never rely on:

```txt
secret URL
frontend-only permissions
unguessable IDs
public R2 bucket
```

---

# Cost Philosophy

Kokpit should remain inexpensive for personal use.

Prefer:

```txt
batching
caching
scheduled work
rule-based filtering
optional AI
private object storage
small dependencies
```

Avoid:

```txt
AI on every page load
AI summarization for every article
duplicate file storage
unnecessary infrastructure
```

---

# V1 Definition of Done

Kokpit V1 is complete when:

```txt
Home works
real-time clock works
hourly quote works
Ideas works
Quick Links works
College works
material upload works
Music works
persistent playback works
News works
private Access works
critical tests pass
production deployment works
documentation matches implementation
```

---

# Future Direction

Possible future V2 discussions may include:

```txt
public multi-user version
end-user authentication
larger upload flows
advanced search
semantic search
additional content providers
collaboration
more AI features
```

None of these are automatically part of V1.

---

# Core Principle

Kokpit should remain useful without becoming demanding.

The product should feel like a place to return to, not another system asking to be managed.

> It shouldn't make me feel productive. It should make me want to stay.
