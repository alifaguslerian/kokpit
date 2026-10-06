# Kokpit — Decisions

**Version:** 1.0  
**Status:** Active V1 Decision Log  
**Product:** Kokpit  
**Document Type:** Product + Architecture Decision Log  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This document records important decisions that shape Kokpit V1.

It exists to answer:

```txt
What did we decide?
Why did we decide it?
What does that decision affect?
What would need to happen before changing it?
```

This document should capture decisions that are:

- product-defining
- architectural
- security-relevant
- data-model-relevant
- design-defining
- operationally important
- likely to be questioned later

It should not become a changelog for minor implementation details.

---

# 2. Decision Status

Each decision uses one of these statuses:

```txt
Accepted
Superseded
Deprecated
Under Review
```

Unless stated otherwise, decisions in this document are:

```txt
Accepted
```

---

# 3. Decision Change Rule

A decision may change later.

When it does:

1. do not silently overwrite the historical reasoning
2. add a new decision or mark the old one as superseded
3. explain why the change happened
4. update affected documentation
5. update implementation if required

Relevant documents may include:

```txt
PRD.md
DESIGN_SYSTEM.md
ARCHITECTURE.md
DATA_MODEL.md
CONTENT_SOURCES.md
FILE_STRUCTURE.md
IMPLEMENTATION_PLAN.md
DEPLOYMENT.md
AGENTS.md
README.md
```

---

# 4. DEC-001 — Kokpit Is a Personal Digital Room, Not a Productivity Dashboard

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit is defined as a:

```txt
private personal digital room
```

It is not positioned as:

```txt
task manager
admin dashboard
Notion clone
productivity operating system
corporate workspace
team collaboration platform
```

## Reason

The product should feel like a place the owner wants to keep open throughout the day.

The intended feeling is closer to:

```txt
a personal room
with useful things inside
```

than:

```txt
a system constantly asking for productivity
```

## Consequences

- Home must stay calm and low-density.
- Features should feel personal rather than corporate.
- Productivity mechanics require explicit future product approval.
- Visual design should prioritize atmosphere and comfort.

---

# 5. DEC-002 — V1 Is Private Single-User

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit V1 is:

```txt
private
single-user
owner-only
```

Public registration and multi-user access are outside V1.

## Reason

The immediate goal is to build a useful personal workspace without introducing public-product complexity too early.

Public release would require:

```txt
authentication product design
account recovery
quotas
user deletion
abuse prevention
storage limits
billing considerations
privacy policy
multi-user authorization
```

None of these are necessary for the owner's first usable version.

## Consequences

V1 does not implement:

```txt
signup
public login
account switching
team features
public profile
```

---

# 6. DEC-003 — V1 Must Remain Multi-User-Ready at the Data Layer

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Although V1 has one user, persistent user-owned entities include:

```txt
user_id
```

Ownership-aware queries are required from the beginning.

## Reason

A future public version should not require destructive restructuring of every important table.

## Consequences

Queries should conceptually use:

```sql
WHERE id = ?
AND user_id = ?
```

instead of relying only on resource IDs.

This adds a small amount of V1 structure while avoiding a painful future migration.

---

# 7. DEC-004 — Cloudflare Is the Primary Production Platform

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit V1 will be deployed on Cloudflare using Cloudflare-native services.

Primary platform components:

```txt
Cloudflare Workers
Workers Static Assets
D1
R2
Access
Cron Triggers
Workers AI
```

## Reason

The application benefits from:

- low operational overhead
- serverless deployment
- simple private hosting
- object storage
- edge runtime
- scheduled background work
- integrated AI option
- low-cost personal usage

## Consequences

The architecture avoids requiring:

```txt
VPS
traditional always-on Node server
Docker production runtime
separate database server
```

unless a future decision changes the platform.

---

# 8. DEC-005 — Frontend Stack Is React + TypeScript + Vite

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Frontend stack:

```txt
React
TypeScript
Vite
React Router
```

## Reason

Kokpit is highly interactive and does not need public SEO-oriented server rendering.

Important client behaviors include:

```txt
persistent music playback
client-side routing
dynamic Home
interactive feature pages
```

Vite keeps the development and build system lightweight.

## Consequences

Kokpit V1 does not use Next.js.

Server-side rendering is not a V1 requirement.

---

# 9. DEC-006 — Backend Stack Is Cloudflare Workers + Hono

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Backend runtime:

```txt
Cloudflare Workers
```

HTTP routing:

```txt
Hono
```

## Reason

Hono fits the Workers runtime naturally and keeps the backend smaller than a traditional server framework.

## Consequences

Backend logic is structured around:

```txt
routes
services
repositories
providers
jobs
```

Business logic should not accumulate inside route handlers.

---

# 10. DEC-007 — D1 Stores Structured Data, R2 Stores File Bytes

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Storage boundary:

```txt
Cloudflare D1
→ structured application data and metadata

Cloudflare R2
→ binary files
```

## Examples

D1 stores:

```txt
idea content
course metadata
material metadata
track metadata
playlist relationships
news metadata
quotes
```

R2 stores:

```txt
music files
PDFs
PowerPoint files
Word files
images
album artwork
```

## Reason

Relational metadata and binary file storage have different requirements.

## Consequences

Do not store large file bytes directly inside D1.

Do not use R2 as the canonical metadata database.

---

# 11. DEC-008 — Drizzle Is the Database Layer

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Use:

```txt
Drizzle ORM
```

with D1.

## Reason

Drizzle provides:

- typed schema
- typed queries
- migrations
- TypeScript compatibility
- clear schema evolution

It is also suitable for AI-assisted development because the schema is explicit and inspectable.

## Consequences

Schema changes require:

```txt
Drizzle schema update
migration generation
local verification
documentation update when material
```

---

# 12. DEC-009 — Zod Is the API Validation Layer

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Use:

```txt
Zod
```

for API-boundary validation.

## Reason

Browser input and external source data must not be trusted.

## Consequences

Validate:

```txt
route params
query params
request bodies
URLs
filenames
file metadata
external provider data
```

---

# 13. DEC-010 — Cloudflare Access Protects V1

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit V1 uses:

```txt
Cloudflare Access
```

as the private entry gate.

Policy:

```txt
deny by default
allow owner identity only
```

## Reason

A custom authentication system is unnecessary for a private one-owner V1.

A secret URL is not considered acceptable protection.

## Consequences

V1 does not build its own login screen.

Cloudflare Access does not replace application-level ownership checks.

---

# 14. DEC-011 — Home Is a Highlight Surface, Not a Full Dashboard

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Home may show lightweight previews of:

```txt
Clock
Quote
Music
College
News
Ideas
Quick Links
```

Full feature functionality belongs on dedicated pages.

## Reason

Home should remain atmospheric and immediately readable.

## Consequences

A new future feature does not automatically receive a Home card.

The product should avoid "card soup."

---

# 15. DEC-012 — V1 Navigation Is Limited to Six Main Destinations

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Primary V1 navigation:

```txt
Home
College
Music
News
Ideas
Library
```

## Reason

These represent the actual V1 product scope.

## Consequences

Do not add navigation entries for:

```txt
Tasks
Calendar
Goals
Habits
Focus
Notes
AI Chat
Analytics
Projects
```

without revising the PRD.

---

# 16. DEC-013 — Visual Direction Is Dark Cozy Editorial Workspace

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

The approved V1 visual direction is:

```txt
Dark Cozy Editorial Workspace
```

Core visual characteristics:

```txt
deep warm charcoal surfaces
off-white text
restrained copper / amber accent
large elegant serif clock
functional sans-serif UI
soft borders
subtle shadows
cozy nighttime atmosphere
```

## Reason

This direction best matches the desired personal-room feeling.

## Consequences

Avoid:

```txt
neon cyberpunk
bright blue SaaS
purple AI gradients
RGB styling
heavy glassmorphism
admin-dashboard density
```

---

# 17. DEC-014 — V1 Is Dark-First

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Dark theme is the primary and required V1 theme.

Light mode is not a V1 requirement.

## Reason

The approved design concept and product atmosphere are centered around a warm dark environment.

## Consequences

Do not spend V1 implementation time building a full light-theme system unless the product scope changes.

---

# 18. DEC-015 — Typography Uses Serif for Atmosphere, Sans for Function

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Display font:

```txt
Cormorant Garamond
```

UI font:

```txt
Inter
```

## Usage

Serif:

```txt
clock
quote
expressive hero text
```

Sans:

```txt
navigation
buttons
inputs
cards
functional content
```

## Reason

This combination creates editorial warmth without harming UI clarity.

---

# 19. DEC-016 — Ideas Must Optimize for Capture Speed

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Ideas is a lightweight capture system.

Required behavior:

```txt
fast text capture
optional title
optional tags
browse
search
edit
delete
```

## Reason

The product goal is to capture spontaneous ideas before they disappear.

## Consequences

Ideas should not become:

```txt
Notion editor
task manager
complex knowledge base
project management system
```

---

# 20. DEC-017 — College Uses Semester → Course → Week → Material

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

College hierarchy:

```txt
Semester
→ Course
→ Week
→ Material
```

## Reason

This mirrors how academic material is naturally organized.

## Consequences

There is no global artificial week limit.

Materials may include:

```txt
files
links
```

File metadata belongs in D1.

File bytes belong in R2.

---

# 21. DEC-018 — Music Playback Must Persist Across Navigation

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Music playback state must live above route-level pages.

The mini player remains active while moving between Kokpit sections.

## Reason

Music is part of the persistent workspace atmosphere, not a page-local feature.

## Consequences

The player should not remount on every route change.

Native browser audio APIs should be used.

Private streaming must support Range requests so seeking works.

---

# 22. DEC-019 — Music Core Is Based on User-Owned Audio

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit V1 music core supports:

```txt
uploaded personal audio
library
playlists
queue
playback
```

## Reason

The core product should not depend on fragile unofficial extraction from social/media platforms.

## Consequences

TikTok, Instagram, YouTube, or other unofficial scraping/downloading is not a core dependency.

External import adapters may only be added later if they are technically reliable and appropriate.

---

# 23. DEC-020 — Quotes Are Original AI-Generated Thoughts, Not Generic Quote API Content

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Primary quote source:

```txt
Cloudflare Workers AI
```

Quotes are generated in batches and stored in D1.

They should feel like original short thoughts rather than classic motivational quote-library content.

## Reason

Traditional quote APIs tend to produce repetitive cliché content.

The product needs emotional range and personality.

## Consequences

The quote system supports moods such as:

```txt
calm
reflective
ambition
struggle
sad
uncertain
hopeful
lonely
creative
life
student
developer
late-night
rest
curiosity
dry-humor
```

---

# 24. DEC-021 — Quotes Are Mostly English

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Target quote language distribution:

```txt
~90% English
~10% Indonesian
```

## Reason

English better matches the approved visual/editorial direction and desired tone.

## Consequences

Avoid forced mixed-language sentences.

Each quote should normally remain in one natural language.

---

# 25. DEC-022 — Main Quote Changes Once Per Local Hour

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

The main Home quote is stable within an hourly local-time slot.

Example:

```txt
07:00–07:59
→ Quote A

08:00–08:59
→ Quote B
```

Repeated refreshes should not normally change the quote.

## Reason

This feels intentional rather than random and avoids unnecessary AI calls.

## Consequences

The current quote must be selected deterministically/stably for the hour.

Required V1 action (clarified by DEC-048):

```txt
another thought
```

may provide a temporary alternate.

---

# 26. DEC-023 — AI Must Not Run on Every Home Load

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Quote generation and news enrichment are batch/cached operations.

Do not call AI on every page load.

## Reason

This reduces:

```txt
cost
latency
failure dependency
duplicate generation
unpredictability
```

## Consequences

AI is an enhancement layer.

Home must remain functional when AI is temporarily unavailable.

---

# 27. DEC-024 — Private User Content Is Not Sent to Quote AI

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Quote generation may use general context such as:

```txt
time of day
student life
software building
creativity
technology
```

It must not use private user content such as:

```txt
ideas
college files
personal documents
private links
music history
```

## Reason

Personalization does not justify unnecessary privacy exposure.

---

# 28. DEC-025 — News Uses Multiple Independent Sources

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit News must not depend on one universal news API.

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

## Reason

A multi-source system is more resilient and gives better signal quality.

## Consequences

External sources are wrapped behind provider/adaptor boundaries.

One source failure must not break the News feature.

---

# 29. DEC-026 — News Is Curated for Relevance, Not Volume

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

News ingestion may fetch many items, but Kokpit should surface only the strongest ones.

Primary interest areas include:

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

## Reason

Kokpit should reduce noise rather than recreate a full news portal.

## Consequences

Use deterministic relevance scoring before optional AI enrichment.

---

# 30. DEC-027 — News Must Avoid a Total Filter Bubble

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Target content mix:

```txt
70–80% personally relevant
20–30% important outside the usual interest bubble
```

## Reason

A personal feed should still expand general awareness.

## Consequences

Important world, science, geopolitical, and major economic events may surface even if they are not directly software-related.

---

# 31. DEC-028 — News Refreshes on a Scheduled Backend Pipeline

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

News refresh is server-side and scheduled.

Recommended cadence:

```txt
every 30 minutes
```

Flow:

```txt
Cron
→ fetch
→ normalize
→ validate
→ deduplicate
→ relevance score
→ optional AI enrichment
→ D1
→ frontend
```

## Reason

This is more reliable than making the browser contact many third-party providers directly.

---

# 32. DEC-029 — News Does Not Republish Full Articles

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit stores/displays:

```txt
headline
source
published time
source excerpt where available
brief Kokpit summary where appropriate
why it matters
original URL
```

Full article copying is not a V1 goal.

## Reason

Kokpit is a discovery and briefing layer, not a replacement publisher.

## Consequences

Every article should retain a clear original source link.

---

# 33. DEC-030 — AI News Enrichment Is Optional

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

AI may add:

```txt
summary
why_it_matters
classification refinement
```

but only to selected high-relevance items.

## Reason

Rule-based filtering is cheaper and sufficient for the first selection stage.

## Consequences

A non-enriched article must still render normally.

AI failure must not break News.

---

# 34. DEC-031 — Home Shows Only 2–3 News Items

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Home displays a small News preview.

Recommended:

```txt
2–3 items
```

## Reason

Home should remain calm and scannable.

## Consequences

The full feed belongs on the dedicated News page.

Home selection should prioritize:

```txt
relevance
freshness
topic diversity
source diversity
```

---

# 35. DEC-032 — No Large UI Framework in V1

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit uses:

```txt
Tailwind CSS
CSS design tokens
custom lightweight components
Lucide icons
```

A large pre-styled component framework is not part of V1.

## Reason

The approved visual identity should not collapse into a default framework aesthetic.

## Consequences

Reusable primitives are built intentionally.

Do not install another UI system only to speed up appearance work.

---

# 36. DEC-033 — TanStack Query Handles Server State

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Use:

```txt
TanStack Query
```

for frontend server state.

Use local React state/context for UI/session state.

## Reason

Kokpit needs predictable:

```txt
fetching
caching
mutation invalidation
loading state
```

without a large global state architecture.

## Consequences

Redux is not part of V1.

---

# 37. DEC-034 — Do Not Add Infrastructure Without a Real Need

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

V1 intentionally does not use:

```txt
Redis
Durable Objects
WebSockets
message queues
Elasticsearch
microservices
separate search server
```

## Reason

Current V1 requirements do not justify the operational and cognitive cost.

## Consequences

Infrastructure should be introduced only when a real product requirement appears.

---

# 38. DEC-035 — No WebSockets in V1

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Kokpit V1 does not use WebSockets.

## Reason

Current features do not need real-time distributed state.

Examples:

```txt
clock
→ client timer

music playback
→ browser audio state

news
→ scheduled refresh

quotes
→ cached hourly selection
```

## Consequences

Do not introduce realtime infrastructure for cosmetic reasons.

---

# 39. DEC-036 — No KV by Default

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Cloudflare KV is not part of initial V1 architecture.

## Reason

Existing systems already cover the current needs:

```txt
D1
R2
browser/query cache
static asset caching
```

## Consequences

KV may be added later only if a clear key-value workload justifies it.

---

# 40. DEC-037 — File Upload Limit Starts at 50 MB

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Default application-level V1 file upload limit:

```txt
50 MB per file
```

## Reason

This is sufficient for most:

```txt
music files
PDFs
slides
documents
images
```

while keeping upload handling simple.

## Consequences

Large upload support may later move to presigned or multipart R2 flows.

---

# 41. DEC-038 — Soft Delete Is Not Default in V1

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Most V1 data uses real deletion.

No universal trash system is implemented.

## Reason

Soft delete adds complexity that the current product does not require.

## Consequences

If restore/trash becomes a real product requirement, `deleted_at` may be added selectively later.

---

# 42. DEC-039 — Implementation Must Be Phase-Based and Granular

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Implementation is split into small phases and subphases.

Typical task format:

```txt
Goal
Tasks
Acceptance Criteria
Do Not Do
```

## Reason

AI agents perform better when work has explicit boundaries.

## Consequences

One agent session should ideally handle:

```txt
1–3 subphases
```

not the entire project.

---

# 43. DEC-040 — Documentation Is the Source of Truth for AI Agents

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

AI coding agents must read repository documentation before making implementation decisions.

## Reason

The project has deliberately frozen product, design, architecture, and content behavior before coding.

## Consequences

Agents must not silently:

```txt
expand scope
replace architecture
invent new tables
change design direction
add infrastructure
```

---

# 44. DEC-041 — Major Agent Uncertainty Must Stop Implementation

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

AI agents must stop and request review if a task requires:

```txt
product scope expansion
architecture change
new persistent entity
destructive migration
major dependency
public/private model change
provider strategy change
major visual direction change
```

## Reason

Silent reinterpretation would undermine the specification-driven workflow.

---

# 45. DEC-042 — File Structure Is Feature-Oriented

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Frontend is primarily organized by product feature.

Example:

```txt
src/features/home
src/features/college
src/features/music
src/features/news
src/features/ideas
src/features/library
```

Backend is organized by runtime responsibility.

## Reason

Feature boundaries are easier to understand and maintain than a giant flat component folder.

## Consequences

Avoid generic root dumping grounds such as:

```txt
misc
helpers
common
core
managers
```

---

# 46. DEC-043 — Shared Code Is Extracted Only After It Is Truly Shared

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Feature code should remain inside its feature until a second real use justifies extraction.

## Reason

Premature abstractions increase complexity and make AI-generated code harder to follow.

## Consequences

Do not create generic abstractions in anticipation of hypothetical reuse.

---

# 47. DEC-044 — Production Data Must Not Ship With Fake Personal Content

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Production seed may include only structural/operational data such as:

```txt
owner
settings
news source registry
emergency quote fallbacks
```

Do not seed fake:

```txt
ideas
courses
tracks
personal materials
playlists
```

## Reason

Kokpit is a personal workspace, not a demo application.

---

# 48. DEC-045 — Deployment Can Start Manual, but Must Be Reproducible

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

V1 may initially deploy manually from the owner's machine.

CI/CD is optional at first.

## Reason

Automated deployment is useful, but not necessary before the core product is stable.

## Consequences

Manual deployment must still be:

```txt
scripted
documented
repeatable
validated
```

CI/CD may be introduced later.

---

# 49. DEC-046 — Production Should Be Boring

**Status:** Accepted  
**Date:** 2026-10-06

## Decision

Operational simplicity is preferred over clever infrastructure.

## Reason

Kokpit is primarily a personal application.

The best production system is one that is:

```txt
stable
private
recoverable
understandable
low-maintenance
```

## Consequences

When two solutions satisfy the same requirement, prefer the one with fewer moving parts.

---

# 50. Decision Summary

The current V1 direction is:

```txt
PRODUCT
Private personal digital room
Single-user V1
No productivity-dashboard expansion

DESIGN
Dark Cozy Editorial Workspace
Dark-first
Warm charcoal + copper
Cormorant Garamond + Inter

FRONTEND
React
TypeScript
Vite
React Router
TanStack Query
Tailwind
Lucide

BACKEND
Cloudflare Workers
Hono
Zod

DATA
D1
Drizzle
user_id ownership

FILES
R2 private storage

ACCESS
Cloudflare Access

BACKGROUND
Cron Triggers

AI
Workers AI optional
batch/cached use only

QUOTES
mostly English
original AI-generated thoughts
hourly stable rotation

NEWS
multi-source
30-minute refresh
relevance-ranked
world-awareness included
AI enrichment optional

IMPLEMENTATION
small phases
docs first
agent scope locked
```

---

# 51. Final Decision Rule

When a future implementation question appears, first ask:

```txt
Has this already been decided?
```

If yes:

follow the existing decision.

If no:

decide intentionally before allowing the codebase to define the product by accident.

---

# 52. DEC-047 — Phase 0 Documentation Preflight Findings

**Status:** Superseded by DEC-048  
**Date:** 2026-10-06

The findings below preserve the initial preflight record. The owner approved the resolutions in DEC-048 after this review; statements about unresolved conflicts describe the state at the time of the original review.

## Review Scope and Result

Phase 0.1 verified all eleven required documentation files exist and are non-empty. All were read before implementation. The repository currently contains documentation and an empty `.gitignore`; no application implementation exists. Node.js, npm, and Git are available, but `git status --short` reports that this directory is not a Git repository.

Phase 0.2 checked private single-user scope, Cloudflare deployment, React + TypeScript + Vite, Workers + Hono, D1 + Drizzle, private R2, Cloudflare Access, content strategy, feature boundaries, and design direction. The main stack and product boundaries agree. The consistency acceptance gate remains blocked by the findings below. Phase 1.1–1.3 has not started.

## Conflicts Requiring Owner Resolution

1. **Quote rotation and persisted settings:** `AGENTS.md` section 21, `CONTENT_SOURCES.md` section 8, and DEC-022 require a stable quote per local clock hour. `DATA_MODEL.md` section 9 defines a required preferred `quote_rotation_minutes` setting and suggests `240` as its default. This leaves both the default and the setting's role inconsistent with hourly V1 behavior. Proposed resolution for review: retain the documented field with a fixed V1 value of `60`, clarify that rotation uses local clock-hour boundaries rather than elapsed minutes, and remove the implication of a configurable V1 interval. No resolution has been applied.

2. **Display font lock:** `AGENTS.md` section 29 requires Cormorant Garamond and approval before introducing another family; DEC-015 also accepts that font. `DESIGN_SYSTEM.md` section 8.1 says it is not frozen and instructs comparison with other serif candidates. Proposed resolution for review: retain Cormorant Garamond for V1 and defer any font comparison or replacement to an explicitly approved design revision. No resolution has been applied.

3. **Implementation priorities:** `AGENTS.md` section 68 ranks data safety, privacy, then core correctness. `IMPLEMENTATION_PLAN.md` section 25 places core functionality before data safety and privacy. This could produce different decisions during implementation trade-offs. Proposed resolution for review: align the plan with the AGENTS.md priority order. No resolution has been applied.

## Other Findings and Open Questions

- `DATA_MODEL.md` section 47 lists seventeen tables but states `16 tables`. The explicit list also matches Phase 2.3 and README.md. This is a count discrepancy, not a proposal to add or remove a table.
- `CONTENT_SOURCES.md` sections 68–69 use quote `language` in the response and selection inputs, but the canonical `quotes` fields omit language. Its representation should be clarified before schema implementation; no field or table has been introduced.
- `CONTENT_SOURCES.md` section 9 calls `another thought` optional, while section 79 requires it for acceptance and Phase 10.6 explicitly schedules it. Whether it is required for V1 acceptance should be stated consistently.
- The approved visual concept is referenced by the design document and Phase 4.5, but no reference image is present in the current file inventory. This does not block a minimal scaffold, but visual comparison will need the approved reference before that phase.
- Git initialization is not explicitly listed in Phase 1.1. The current directory cannot yet support version-controlled commits or migrations. No Git metadata has been created during this documentation review.
- The empty `.gitignore` will need dependency, build-output, and local-secret exclusions when project initialization is authorized.

## Validation and Next Gate

Read-only file inventory, full required-document reads, targeted cross-document searches, and local tool-version checks were performed. No dependencies were installed and no application code, database, deployment configuration, or UI was created. Build, typecheck, lint, and application-render checks are not yet available because Phase 1 is blocked.

Owner resolution is required before changing the conflicting specifications or proceeding to Phase 1.1. This entry records findings only and does not supersede any accepted decision.

---

# 53. DEC-048 — Owner-Approved Preflight Resolutions

**Status:** Accepted  
**Date:** 2026-10-06  
**Supersedes:** DEC-047 review status and the conflicting specification wording identified there

## Decision

The owner approved the following documentation resolutions:

1. The primary quote changes at each local clock-hour boundary and remains stable within that hour. Retain `user_settings.quote_rotation_minutes` with a fixed V1 value of `60`; it is not a configurable V1 preference.
2. Lock Cormorant Garamond for display and Inter for UI in V1. Font comparison or replacement requires an explicitly approved design revision.
3. Align implementation priorities with AGENTS.md: data safety, privacy, core correctness, stable UX, performance, visual polish, then optional AI enrichment.
4. Correct the data-model summary to seventeen tables without changing the table list.
5. Add required `quotes.language` metadata with allowed values `en` and `id`. This makes the documented API and language-aware selection consistent with the canonical model.
6. Require the visually secondary `another thought` action for V1 acceptance, consistent with Phase 10.6. It remains optional for the owner to use and does not change the scheduled hourly quote.
7. Include Git initialization, when necessary, and dependency/build/local-secret exclusions in Phase 1.1.

## Reason and Documentation Impact

These resolutions remove ambiguity before implementation while preserving the approved product and stack. DATA_MODEL.md, DESIGN_SYSTEM.md, CONTENT_SOURCES.md, IMPLEMENTATION_PLAN.md, README.md, and DEC-022 wording have been aligned. DEC-047 remains as the historical preflight record.

The `quotes.language` change is a specification-only addition. No database or application implementation exists yet, so there is no existing data to migrate or compatibility break to repair. The field and constraint must be included in the initial Drizzle schema and migration during Phase 2.3–2.4.

## Remaining Preparation and Execution Boundary

The approved visual reference remains required before the Phase 4.5 visual comparison. Its absence does not block a minimal scaffold.

The owner explicitly authorized documentation updates only and instructed the agent to wait before continuing any implementation phase. No scaffold, Git initialization, dependency installation, schema, migration, backend, or UI is authorized by this decision entry alone. Phase 1.1 is the next implementation step only after a new owner instruction.
