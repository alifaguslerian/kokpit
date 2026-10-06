# Kokpit — AGENTS.md

**Version:** 1.0  
**Status:** Active V1 Agent Rules  
**Product:** Kokpit  
**Applies To:** All AI coding agents working in this repository  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This file defines the mandatory working rules for AI coding agents contributing to Kokpit.

Kokpit is heavily specification-driven.

Agents must not treat the repository as an open-ended coding playground.

The repository documentation is the source of truth.

The agent's job is to:

```txt
understand the current specification
implement the requested scope
validate the result
report clearly
stop before expanding scope
```

The agent must not silently redesign the product, architecture, data model, or visual system.

---

# 2. Product Context

Kokpit is a private personal web workspace.

V1 is designed primarily for one owner.

Core V1 modules:

```txt
Home
College
Music
News
Ideas
Library / Quick Links
```

Kokpit should feel:

```txt
calm
dark
warm
personal
lightweight
editorial
cozy
intentional
```

Kokpit should not become:

```txt
a generic SaaS dashboard
an admin panel
a productivity gamification tool
a neon developer UI
a Notion clone
a corporate workspace
```

---

# 3. Mandatory Documentation Reading Order

Before making implementation decisions, read:

```txt
1. AGENTS.md
2. docs/product/PRD.md
3. docs/design/DESIGN_SYSTEM.md
4. docs/engineering/ARCHITECTURE.md
5. docs/engineering/DATA_MODEL.md
6. docs/features/CONTENT_SOURCES.md
7. docs/engineering/FILE_STRUCTURE.md
8. docs/planning/IMPLEMENTATION_PLAN.md
9. docs/product/DECISIONS.md
10. docs/engineering/DEPLOYMENT.md
11. README.md
```

Not every task requires reading every file in full again.

However:

- the first agent session should read all of them
- later sessions must read the documents relevant to the current task
- if unsure which document controls a decision, search the docs before coding

---

# 4. Source of Truth Priority

When documents appear to conflict, use this priority:

```txt
1. explicit latest user instruction
2. AGENTS.md
3. PRD.md
4. DESIGN_SYSTEM.md
5. ARCHITECTURE.md
6. DATA_MODEL.md
7. CONTENT_SOURCES.md
8. FILE_STRUCTURE.md
9. IMPLEMENTATION_PLAN.md
10. DECISIONS.md
11. README.md
```

If the conflict affects scope, architecture, security, or persistence:

```txt
STOP
report the conflict
ask for resolution
```

Do not choose silently.

---

# 5. Implementation Scope Rule

The current implementation task defines the boundary.

If the requested task is:

```txt
Phase 5.1
```

do not also implement:

```txt
Phase 5.2
Phase 5.3
Phase 6
```

unless explicitly requested.

Implementation should be incremental.

The preferred unit of work is:

```txt
1–3 small subphases
```

per agent session.

---

# 6. No Scope Expansion

Do not add features simply because they seem useful.

V1 explicitly excludes many common productivity features.

Do not add:

```txt
Tasks
Kanban
Calendar
Pomodoro
Habit tracking
Focus timer
AI assistant panel
Chatbot
Productivity score
Streaks
XP
Team collaboration
Public profiles
Social features
Analytics dashboard
Universal command palette
Global semantic search
```

unless the product specification is explicitly revised.

---

# 7. Architecture Lock

Kokpit V1 architecture is:

```txt
Frontend:
React
TypeScript
Vite
React Router
Tailwind CSS

Server State:
TanStack Query

Backend:
Cloudflare Workers
Hono
TypeScript

Validation:
Zod

Database:
Cloudflare D1

ORM:
Drizzle

Object Storage:
Cloudflare R2

Authentication / Private Gate:
Cloudflare Access

Scheduled Work:
Cloudflare Cron Triggers

Optional AI:
Cloudflare Workers AI

Deployment:
Cloudflare Workers + Static Assets
```

Do not replace this stack without explicit approval.

---

# 8. Architecture Changes Require Approval

Stop before introducing:

```txt
Next.js
Express
NestJS
Firebase
Supabase
MongoDB
PostgreSQL
Redis
Docker production
VPS
Durable Objects
WebSockets
GraphQL
another ORM
another validation library
another UI framework
```

unless a documented requirement proves they are needed.

If a new dependency is genuinely necessary:

1. explain why existing tools are insufficient
2. explain the dependency cost
3. explain alternatives
4. wait for approval if it materially changes architecture

---

# 9. Cloudflare-First Rule

Production decisions must fit Cloudflare naturally.

Prefer:

```txt
Workers
D1
R2
Cron
Workers AI
Access
Static Assets
```

Do not design around a permanently running traditional server.

---

# 10. Frontend Structure Rule

Frontend feature code belongs under:

```txt
src/features/
```

Major feature boundaries:

```txt
home
college
music
news
ideas
library
```

Reusable UI primitives belong under:

```txt
src/components/
```

Application composition belongs under:

```txt
src/app/
```

Generic frontend infrastructure belongs under:

```txt
src/lib/
```

Do not dump feature code into `components/`.

---

# 11. Backend Structure Rule

Backend code belongs under:

```txt
worker/
```

Use these responsibilities:

```txt
worker/api/
HTTP routes

worker/services/
business logic

worker/db/
database schema and repositories

worker/providers/
external services and storage adapters

worker/jobs/
scheduled jobs

worker/middleware/
request middleware
```

Avoid putting business logic directly in route handlers.

---

# 12. Preferred Backend Flow

Preferred flow:

```txt
route
→ service
→ repository/provider
→ D1 / R2 / external source
```

Do not create architecture layers merely for ceremony.

Simple operations may remain simple.

The goal is clear responsibility, not enterprise abstraction.

---

# 13. Data Model Lock

The canonical persisted model is defined in:

```txt
docs/engineering/DATA_MODEL.md
```

Do not create a new table without checking that document.

Any material schema change requires:

```txt
1. schema update
2. migration
3. data-model documentation update
4. compatibility review
```

---

# 14. Migration Rule

Never modify production database structure manually.

Use version-controlled migrations.

For every schema change:

```txt
update Drizzle schema
generate migration
inspect migration
apply locally
run tests
update DATA_MODEL.md if material
```

Do not silently modify already-applied migration history.

---

# 15. Ownership Rule

Kokpit V1 is single-user, but user-owned resources must remain ownership-aware.

Important records include:

```txt
user_id
```

Queries must include ownership context.

Bad:

```sql
SELECT *
FROM ideas
WHERE id = ?;
```

Preferred:

```sql
SELECT *
FROM ideas
WHERE id = ?
AND user_id = ?;
```

Do not remove ownership fields because V1 currently has one user.

---

# 16. Private V1 Rule

Kokpit V1 is not public.

Do not implement:

```txt
public signup
user registration
account switching
social profile
multi-user workspace UI
```

Cloudflare Access protects the deployed application.

Future public release is a later product decision.

---

# 17. D1 vs R2 Rule

Use:

```txt
D1
→ structured metadata

R2
→ file bytes
```

Examples:

```txt
D1:
track title
artist
file size
R2 key

R2:
actual audio bytes
```

```txt
D1:
material title
course
week
filename

R2:
actual PDF / PPT / image
```

Never store large binary files directly in D1.

---

# 18. R2 Privacy Rule

R2 buckets remain private.

The browser should not receive unrestricted bucket access.

Backend-generated keys only.

Never trust a complete storage key sent by the client.

Files should be resolved through metadata + ownership checks.

---

# 19. File Upload Rule

Uploads must validate:

```txt
owner
file size
allowed type
destination
metadata
```

V1 default application upload limit:

```txt
50 MB per file
```

Do not increase limits silently.

---

# 20. Music Architecture Rule

Music playback must remain persistent across route navigation.

The music provider must live above route-level pages.

Use native browser audio capabilities.

Do not build a custom codec/player engine.

Private audio streaming should support:

```txt
HTTP Range requests
```

so seeking works correctly.

---

# 21. Quote System Rule

Quotes are not a static generic motivational array.

Primary strategy:

```txt
Workers AI
→ batch generation
→ quality filter
→ deduplicate
→ D1 pool
→ hourly selection
```

Primary quote language:

```txt
~90% English
~10% Indonesian
```

The main quote changes per local hour.

Refreshing repeatedly during the same hour should normally keep the same quote.

Do not call AI on every page load.

---

# 22. Quote Quality Rule

Avoid:

```txt
Believe in yourself.
Never give up.
Dream big.
Trust the process.
You got this.
Everything happens for a reason.
```

Avoid:

```txt
LinkedIn hustle tone
therapy language
fake philosophical depth
repetitive sentence structures
fake author attribution
```

AI-generated quotes normally have:

```txt
author = null
```

Never fabricate an author.

---

# 23. News System Rule

News is an internal aggregation pipeline.

Preferred flow:

```txt
Cron
→ source adapters
→ normalize
→ validate
→ deduplicate
→ relevance scoring
→ optional AI enrichment
→ D1
→ Kokpit API
→ frontend
```

The frontend should not directly call many news providers.

---

# 24. News Source Rule

Initial source strategy is defined in:

```txt
CONTENT_SOURCES.md
```

Initial source types include:

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

Do not randomly add more sources.

A new source must materially improve feed quality.

---

# 25. News AI Rule

AI enrichment is optional.

It may provide:

```txt
summary
why_it_matters
classification
```

AI must not be required for:

```txt
news ingestion
news listing
source links
basic relevance
```

If AI fails, the News feature continues.

---

# 26. External Source Rule

External provider logic belongs in:

```txt
worker/providers/
```

Do not scatter provider-specific code across:

```txt
React components
API route files
database code
```

Normalize external data into Kokpit-owned contracts.

---

# 27. Design System Lock

UI implementation must follow:

```txt
docs/design/DESIGN_SYSTEM.md
```

Official direction:

```txt
Dark Cozy Editorial Workspace
```

Primary characteristics:

```txt
deep warm charcoal
soft off-white text
warm copper accent
large serif clock
clean sans-serif UI
subtle cards
soft shadows
restrained motion
cozy nighttime atmosphere
```

---

# 28. Color Rule

Do not invent random colors.

Use Kokpit semantic tokens.

Avoid raw palette usage throughout feature code such as:

```txt
bg-zinc-950
text-stone-200
border-neutral-800
```

when a Kokpit semantic token exists.

---

# 29. Typography Rule

Primary UI font:

```txt
Inter
```

Display serif:

```txt
Cormorant Garamond
```

Use serif selectively for:

```txt
clock
quote
expressive hero text
```

Do not use serif for dense functional UI.

Do not introduce additional font families without approval.

---

# 30. Home Density Rule

Home is a highlight surface.

Home is not the complete feature implementation.

Home may show:

```txt
clock
quote
music preview
college preview
news preview
idea capture
quick links preview
```

Dedicated feature pages contain the deeper functionality.

Do not turn Home into a widget wall.

---

# 31. No Generic AI UI

Avoid:

```txt
purple-blue AI gradients
sparkle icons everywhere
glowing cards
floating glass panels
massive blur
generic AI-generated SaaS styling
```

Kokpit should remain restrained and personal.

---

# 32. Component Rule

Prefer small focused components.

Avoid giant multi-purpose components.

Good:

```txt
MusicPlayer
TrackRow
PlaylistCard
IdeaComposer
NewsCard
CourseCard
```

Bad:

```txt
UniversalDashboardCard
MegaFeatureContainer
GenericEverythingPanel
```

Do not abstract before a second genuine use exists.

---

# 33. Shared Code Rule

Feature code starts inside the feature.

Only move something to shared when multiple unrelated parts actually use it.

Do not prematurely centralize.

---

# 34. No Utility Dumping Ground

Avoid giant files like:

```txt
utils.ts
helpers.ts
common.ts
misc.ts
```

Prefer focused modules:

```txt
format-time.ts
normalize-url.ts
hash.ts
file.ts
```

---

# 35. Dependency Rule

Before adding a package, ask:

```txt
Can existing platform APIs handle this?
Can existing dependency handle this?
Is this package worth the maintenance cost?
```

Do not install a package for a trivial function.

Avoid:

```txt
duplicate date libraries
multiple state managers
multiple component systems
multiple validators
```

---

# 36. State Management Rule

Use:

```txt
TanStack Query
```

for server state.

Use:

```txt
React Context
or a lightweight local store
```

for UI/session state where appropriate.

Do not add Redux unless architecture is explicitly revised.

---

# 37. Browser Storage Rule

LocalStorage may store non-critical preferences.

Examples:

```txt
volume
collapsed sidebar
small display preferences
```

Do not use LocalStorage as the canonical database for Kokpit content.

---

# 38. Validation Rule

All API boundaries must validate external input.

Use:

```txt
Zod
```

Validate:

```txt
route params
query params
JSON bodies
URLs
filenames
file metadata
external source data
```

Never trust browser input.

---

# 39. Error Handling Rule

Errors should be:

```txt
structured
safe
local
recoverable where possible
```

Do not expose:

```txt
stack traces
SQL errors
secrets
credentials
internal bindings
```

to the frontend.

---

# 40. Failure Isolation Rule

One feature failure must not crash unrelated features.

Examples:

```txt
News refresh fails
→ Ideas still work

Workers AI fails
→ cached quote remains

Music upload fails
→ College remains usable

one RSS source fails
→ other news sources continue
```

---

# 41. Testing Rule

Relevant tests are mandatory before declaring a task complete.

Test priorities:

```txt
business logic
ownership
API behavior
file operations
music streaming
quote selection
news normalization
critical UI flow
```

Do not skip failing tests to finish faster.

---

# 42. Baseline Validation

Before reporting task completion, run relevant checks:

```txt
lint
typecheck
build
tests
```

If a check cannot run:

```txt
state exactly which check failed to run
state why
do not pretend it passed
```

---

# 43. UI Validation

For UI work, verify:

```txt
desktop layout
basic responsive behavior
keyboard focus
loading state
empty state
error state where applicable
```

Do not declare visual work complete based only on TypeScript compilation.

---

# 44. Security Validation

For backend and file work, verify:

```txt
ownership
input validation
R2 privacy
no secrets exposed
safe error output
```

---

# 45. Accessibility Rule

At minimum:

```txt
semantic controls
keyboard navigation
visible focus
reasonable contrast
labels
reduced motion support
heading hierarchy
```

Do not use clickable `div` elements when a native button or link fits.

---

# 46. Performance Rule

Keep Kokpit lightweight.

Prefer:

```txt
lazy-loaded feature routes
small dependencies
cached external content
thumbnail images
streamed audio
server-side external integrations
```

Avoid:

```txt
loading full feature implementations on Home
preloading full music files
massive JS libraries
unnecessary animations
```

---

# 47. Logging Rule

Log:

```txt
unexpected API failures
scheduled job failures
external source failures
important file operation failures
```

Do not log:

```txt
private idea content
document contents
music bytes
tokens
credentials
secrets
```

unless explicitly needed for local debugging and removed before completion.

---

# 48. Secret Rule

Never commit:

```txt
API keys
private tokens
Cloudflare secrets
R2 credentials
Access secrets
real production environment values
```

Use:

```txt
Wrangler secrets
Cloudflare environment bindings
local environment files
```

`.env.example` must contain placeholders only.

---

# 49. Development Data Rule

Production should not ship with fake personal data.

Do not leave:

```txt
fake ideas
fake courses
fake tracks
fake news
fake quotes
debug records
```

inside production seed data.

Development fixtures are allowed in isolated development/testing environments.

---

# 50. Commit Scope Rule

Prefer commits aligned to implementation tasks.

Examples:

```txt
feat: implement ideas CRUD

feat: add quick links library

feat: add college hierarchy

feat: implement persistent music playback

feat: add hourly quote rotation

feat: add news ingestion pipeline
```

Avoid giant unrelated commits.

---

# 51. Documentation Update Rule

If implementation changes a documented decision materially:

update the relevant document.

Examples:

```txt
schema changed
→ DATA_MODEL.md

deployment changed
→ DEPLOYMENT.md

architecture changed
→ ARCHITECTURE.md

design token changed
→ DESIGN_SYSTEM.md

scope changed
→ PRD.md

source strategy changed
→ CONTENT_SOURCES.md
```

Do not let documentation drift knowingly.

---

# 52. DECISIONS.md Rule

Important non-obvious decisions should be added to:

```txt
docs/product/DECISIONS.md
```

Examples:

```txt
why a provider changed
why a dependency was added
why a schema constraint changed
why a product behavior changed
```

Do not log trivial implementation details there.

---

# 53. Stop Conditions

Stop and ask for review if:

- product scope must expand
- architecture must change
- a new database table is needed unexpectedly
- a destructive migration is needed
- a major dependency is needed
- documentation conflicts materially
- private/public assumptions change
- a provider cannot satisfy documented behavior
- design direction cannot be matched reasonably
- deployment differs materially from architecture

Do not silently invent a workaround that changes the product.

---

# 54. Safe Assumptions

The agent may make small implementation choices without stopping when they do not alter product behavior.

Examples:

```txt
local variable names
internal helper names
minor component extraction
test fixture names
non-user-visible refactoring
```

Use good engineering judgment.

---

# 55. Unsafe Assumptions

Do not guess:

```txt
new features
new infrastructure
new public behavior
new auth model
new persistent entities
new user-facing workflow
new visual identity
new external data provider
new privacy behavior
```

These require documentation or explicit approval.

---

# 56. Task Completion Report

After completing a task, report:

```txt
Completed
Files changed
Validation performed
Known limitations
Next documented step
```

Keep the report concise.

Do not claim success if important validation failed.

---

# 57. Implementation Session Pattern

Preferred working pattern:

```txt
1. read relevant docs
2. inspect current code
3. state task boundary internally
4. implement smallest correct change
5. test
6. fix
7. re-run validation
8. summarize
9. stop
```

Do not continuously wander into adjacent phases.

---

# 58. Refactoring Rule

Refactor when:

```txt
code is duplicated meaningfully
responsibility is unclear
current structure blocks the requested task
```

Do not refactor unrelated areas during a small feature task.

Large refactors require explicit scope.

---

# 59. Deletion Rule

Do not delete code, data, migration history, or documentation casually.

Before destructive changes:

- confirm why
- confirm ownership
- confirm migration impact
- confirm R2 cleanup impact if relevant

---

# 60. Package Lock Rule

Commit the package lockfile.

Do not regenerate it unnecessarily.

Dependency changes should be intentional and visible.

---

# 61. Generated Code Rule

Do not hand-edit generated build artifacts.

Generated artifacts include:

```txt
dist
coverage
temporary Worker output
```

Migration SQL is generated but must still be reviewed.

---

# 62. Comments Rule

Do not over-comment obvious code.

Use comments for:

```txt
non-obvious security reasoning
provider quirks
unusual Cloudflare constraints
complex algorithm decisions
```

Code should remain readable without tutorial-style comments everywhere.

---

# 63. TODO Rule

Do not leave vague TODOs like:

```txt
TODO: fix later
TODO: improve this
```

If a task is intentionally deferred:

```txt
reference the phase or issue
state why
```

Example:

```txt
TODO(V2): public authentication is outside V1 scope.
```

---

# 64. Feature Flags

Do not introduce feature-flag infrastructure for V1 unless required.

Optional features may degrade gracefully through configuration.

Keep V1 simple.

---

# 65. AI Usage Within Kokpit

Kokpit may use Workers AI for:

```txt
quote generation
optional news enrichment
```

Do not add embedded AI assistant/chat features.

AI should enhance content, not become the product interface.

---

# 66. Privacy Rule for AI

Do not send private Kokpit user content to AI providers unless explicitly designed and approved.

For V1 quote generation, do not include:

```txt
idea content
college files
personal notes
uploaded documents
music history
private links
```

Use only general predefined context.

---

# 67. Home Rule for New Features

A future feature does not automatically get a Home card.

Before surfacing anything on Home, verify:

```txt
Does the user need this information almost every time Kokpit opens?
```

If not:

keep it on its own page.

---

# 68. V1 Priority Order

If trade-offs are necessary:

```txt
1. data safety
2. privacy
3. core correctness
4. stable UX
5. performance
6. visual polish
7. optional AI enrichment
```

Do not sacrifice data safety for visual completeness.

---

# 69. Agent Behavior Summary

The agent should behave like:

```txt
a careful implementer
working from a frozen product specification
```

not like:

```txt
a product manager
inventing a better app
```

The agent may improve code quality.

The agent may not redefine Kokpit without permission.

---

# 70. Final Agent Rule

Before every meaningful change, ask:

> Is this required by the current documented task?

Then:

> Does this preserve Kokpit's product, architecture, data, privacy, and visual rules?

If both are yes:

implement it.

If either is no or unclear:

stop and review the documentation before proceeding.
