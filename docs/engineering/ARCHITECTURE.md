# Kokpit — Architecture

**Version:** 0.1  
**Status:** V1 Architecture Draft  
**Product:** Kokpit  
**Scope:** Private single-user personal workspace  
**Deployment Target:** Cloudflare  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This document defines the technical architecture for Kokpit V1.

It describes:

- application structure
- frontend and backend boundaries
- Cloudflare services
- storage responsibilities
- authentication strategy
- API boundaries
- scheduled background work
- external content handling
- file and media handling
- reliability principles
- security boundaries
- future multi-user readiness

This document defines **how Kokpit is built at the system level**.

Detailed database entities belong in `DATA_MODEL.md`.

Detailed code directories belong in `FILE_STRUCTURE.md`.

Deployment commands, environments, secrets, and CI/CD belong in `DEPLOYMENT.md`.

---

# 2. Architecture Goals

Kokpit V1 should be:

- simple enough for one developer to maintain
- inexpensive or free for normal personal usage
- optimized for Cloudflare
- fast to load
- modular
- easy for AI coding agents to understand
- safe for private personal data
- resilient when external content providers fail
- capable of growing without a rewrite
- multi-user-ready without implementing public multi-user behavior yet

The architecture should avoid infrastructure that requires:

- a permanently running traditional server
- a VPS
- Docker in production
- a separate database server
- unnecessary microservices
- complex DevOps
- paid infrastructure before it is actually needed

---

# 3. Architecture Summary

Kokpit V1 will use a **single-repository full-stack Cloudflare architecture**.

High-level stack:

```txt
Frontend
React
TypeScript
Vite
React Router
Tailwind CSS
CSS Design Tokens

Backend
Cloudflare Workers
Hono
TypeScript
Zod

Database
Cloudflare D1
Drizzle ORM

Object Storage
Cloudflare R2

Authentication / Private Access
Cloudflare Access

Scheduled Jobs
Cloudflare Cron Triggers

Optional AI Content
Cloudflare Workers AI

Deployment
Cloudflare Workers + Static Assets
```

Kokpit should deploy as one logical application.

The frontend static assets and backend Worker are deployed together.

---

# 4. High-Level System Diagram

```txt
                         ┌────────────────────────┐
                         │      User Browser      │
                         │                        │
                         │ React SPA              │
                         │ Persistent Audio       │
                         │ Client UI State        │
                         └───────────┬────────────┘
                                     │
                                     │ HTTPS
                                     ▼
                         ┌────────────────────────┐
                         │   Cloudflare Access    │
                         │                        │
                         │ Private V1 Gate        │
                         │ Allow owner only       │
                         └───────────┬────────────┘
                                     │
                                     ▼
                 ┌─────────────────────────────────────┐
                 │        Cloudflare Worker            │
                 │                                     │
                 │ Static Assets + API                 │
                 │ Hono Router                         │
                 │ Validation                          │
                 │ Services                            │
                 │ Scheduled Jobs                      │
                 └───────┬──────────┬──────────┬───────┘
                         │          │          │
                         │          │          │
                         ▼          ▼          ▼
                   ┌─────────┐ ┌─────────┐ ┌─────────────┐
                   │   D1    │ │   R2    │ │ Workers AI  │
                   │         │ │         │ │ optional    │
                   │metadata │ │ files   │ │ generation  │
                   │content  │ │ music   │ │ summaries   │
                   └─────────┘ └─────────┘ └─────────────┘
                         ▲
                         │
                         │ scheduled ingestion
                         │
                ┌────────┴─────────────┐
                │ External Sources     │
                │                      │
                │ RSS / official APIs  │
                │ technology sources   │
                │ world news sources   │
                └──────────────────────┘
```

---

# 5. Frontend Architecture

## 5.1 Framework

Kokpit V1 will use:

```txt
React
TypeScript
Vite
```

Reasons:

- Kokpit is highly interactive.
- Music playback needs persistent client state.
- Multiple feature pages benefit from client-side routing.
- Vite provides fast local development.
- Cloudflare provides first-party Vite integration for Workers.
- Kokpit does not require SSR for SEO.
- The architecture remains smaller than a full server-rendered framework.

Kokpit V1 should not use Next.js.

There is no meaningful V1 requirement for:

- server-side rendering
- public SEO pages
- static content generation
- React Server Components

A client-side application is the simpler and more appropriate model.

---

# 6. Routing

Client-side routing should use React Router.

Conceptual routes:

```txt
/
or /home

/college
/music
/news
/ideas
/library
```

Optional supporting routes may include:

```txt
/college/:semesterId
/college/:semesterId/:courseId
/college/:semesterId/:courseId/week/:weekId

/music/playlist/:playlistId
```

Exact route structure will be finalized during implementation.

The route system must preserve the global application shell.

The following should not remount during normal page navigation:

- sidebar
- global app providers
- music player engine

This allows music to continue playing when navigating between pages.

---

# 7. Styling Architecture

Kokpit should use:

```txt
Tailwind CSS
+
CSS custom properties
+
custom Kokpit components
```

The visual source of truth remains:

```txt
docs/design/DESIGN_SYSTEM.md
```

Raw Tailwind palette colors should not become the design system.

Prefer semantic design tokens such as:

```txt
bg-app
bg-surface
text-primary
text-muted
accent
border-subtle
```

The CSS variables defined in `DESIGN_SYSTEM.md` remain authoritative.

Do not build Kokpit around a pre-styled component theme.

Avoid making the UI look like a default component library.

---

# 8. UI Component Strategy

Kokpit should use custom lightweight components.

Recommended foundations:

```txt
Lucide React
Tailwind CSS
native HTML controls
small reusable UI primitives
```

Do not add a large UI framework unless a real requirement appears.

A component library may inspire accessibility patterns, but the final visual identity must remain Kokpit-specific.

---

# 9. Client State

State should be divided into two categories.

## 9.1 Server State

Data persisted on the backend includes:

- ideas
- quick links
- college structure
- materials
- music metadata
- playlists
- quotes
- news
- user settings

This data should be loaded from the API.

A server-state library such as TanStack Query may be used to handle:

- fetching
- caching
- invalidation
- background refresh
- loading state

This avoids manually duplicating API state throughout the application.

---

## 9.2 UI / Session State

Local application state includes:

- active music playback
- volume
- queue
- currently selected track
- sidebar collapsed state
- temporary UI selections
- modal state

The music player must live in a provider above page routes.

Do not use Redux for Kokpit V1.

A small React Context or lightweight store is sufficient.

---

# 10. Local Browser Storage

Browser storage may be used only for non-critical preferences.

Examples:

```txt
volume
sidebar collapsed state
last selected playlist
minor display preferences
```

Do not treat LocalStorage as the canonical database for:

- ideas
- academic data
- music metadata
- playlists
- uploaded materials
- news cache

Canonical application data belongs on the backend.

---

# 11. Backend Runtime

The backend will run on:

```txt
Cloudflare Workers
```

The Worker is responsible for:

- serving API routes
- database access
- object storage access
- input validation
- external content ingestion
- scheduled work
- private media access
- optional AI generation

The frontend and API should use the same origin.

Example:

```txt
https://kokpit.example.com/
https://kokpit.example.com/api/...
```

This keeps deployment and browser networking simple.

---

# 12. Backend Router

Use:

```txt
Hono
```

Hono should provide the HTTP routing layer for the Worker.

Reasons:

- lightweight
- designed for edge runtimes
- clean route organization
- suitable for Cloudflare Workers
- easier to modularize than one large Worker fetch handler

Hono should remain an HTTP routing layer.

Business logic should not be buried directly inside route handlers.

---

# 13. API Style

Kokpit V1 should use a simple JSON REST API.

Conceptual route groups:

```txt
/api/system

/api/quotes
/api/news

/api/ideas
/api/links

/api/college
/api/semesters
/api/courses
/api/weeks
/api/materials

/api/music
/api/tracks
/api/playlists

/api/files
```

The exact endpoint names may be simplified later.

API design principles:

- same-origin
- JSON for structured data
- explicit validation
- predictable status codes
- no secrets in frontend code
- no direct database access from browser
- no direct third-party API keys from browser

---

# 14. Validation

Use:

```txt
Zod
```

Validation must occur at API boundaries.

Never trust:

- route parameters
- request JSON
- query parameters
- filenames
- MIME type claims
- external feed data

Validation schemas should be reusable where appropriate.

---

# 15. Database

Use:

```txt
Cloudflare D1
```

D1 stores structured application data.

Examples:

- owner record
- settings
- ideas
- quick links
- semester metadata
- courses
- weeks
- material metadata
- track metadata
- playlists
- playlist relationships
- quote cache
- news articles
- news source metadata

Binary files must not be stored directly in D1.

---

# 16. Database Access Layer

Use:

```txt
Drizzle ORM
```

Reasons:

- typed schema
- typed queries
- migration workflow
- good compatibility with TypeScript
- easier schema evolution
- useful when AI agents modify the application

Raw SQL may still be used when it is clearly better.

The database layer should not leak directly into UI/API route code.

Recommended conceptual flow:

```txt
route
→ service
→ repository/database
```

Avoid excessive enterprise abstraction.

The goal is clear boundaries, not architecture ceremony.

---

# 17. Multi-User Readiness

Kokpit V1 is single-user.

However, the database must not assume that the application can never become multi-user.

User-owned records should contain ownership information.

Conceptually:

```txt
users
  id

ideas
  user_id

quick_links
  user_id

semesters
  user_id

tracks
  user_id

playlists
  user_id
```

For V1:

```txt
one seeded owner exists
```

All requests operate within that owner context.

There is no:

- public registration
- multi-user UI
- account switching
- team workspace
- public profile

If Kokpit becomes public later, ownership already exists at the data layer.

---

# 18. V1 Authentication

Kokpit V1 will not build a custom login system.

Use:

```txt
Cloudflare Access
```

Cloudflare Access should sit in front of the deployed application.

Policy:

```txt
deny by default
allow only the owner
```

Authentication may use:

- allowed email
- email one-time PIN
- configured identity provider

The exact Access setup belongs in `DEPLOYMENT.md`.

Security must not rely on:

```txt
secret URL
unguessable hostname
obscurity
```

---

# 19. Future Public Authentication

If Kokpit becomes public in V2 or later:

Cloudflare Access is not automatically the end-user account system.

A future public release should re-evaluate authentication.

Possible future requirements:

- user registration
- user sessions
- passwordless login
- OAuth
- account recovery
- user deletion
- quotas
- authorization

That work is outside V1.

The V1 data model should simply avoid making it unnecessarily difficult.

---

# 20. Object Storage

Use:

```txt
Cloudflare R2
```

R2 stores binary / unstructured files.

Examples:

```txt
music files
album artwork
college PDFs
PowerPoint files
Word documents
images
other uploaded materials
```

The R2 bucket should remain private.

Do not expose the entire bucket publicly.

---

# 21. R2 Object Organization

Object keys must be generated by the backend.

Conceptual pattern:

```txt
users/{userId}/music/{objectId}.{extension}

users/{userId}/college/{courseId}/{weekId}/{objectId}.{extension}

users/{userId}/images/{objectId}.{extension}
```

Never trust a complete R2 object key supplied by the browser.

Metadata describing the object belongs in D1.

Example:

```txt
id
user_id
r2_key
original_filename
mime_type
size
created_at
```

The complete schema belongs in `DATA_MODEL.md`.

---

# 22. Upload Strategy

V1 should optimize for simplicity.

Expected Kokpit files are generally:

- music tracks
- PDFs
- lecture slides
- documents
- images

For V1, uploads may flow through the Worker into R2.

Recommended application-level upload limit:

```txt
50 MB per file
```

This is intentionally conservative.

The server must validate:

- allowed file type
- declared size
- actual upload constraints
- destination ownership

If Kokpit later needs large media uploads, move to:

```txt
presigned R2 uploads
or
multipart uploads
```

without changing the higher-level product model.

---

# 23. Private File Delivery

Files should be retrieved through authenticated application routes.

Conceptually:

```txt
GET /api/files/:id
```

The backend should:

1. resolve metadata from D1
2. verify ownership
3. fetch the R2 object
4. stream the response

A user should never gain access to an object by guessing an R2 key.

---

# 24. Music Streaming

Music playback uses the browser's native audio capabilities.

Do not implement a custom audio codec engine.

Use:

```txt
HTMLAudioElement
```

or an equivalent React wrapper around the native browser audio API.

The player should be global and persistent across route changes.

---

# 25. Audio Streaming Endpoint

Music should support seeking.

Conceptually:

```txt
GET /api/music/tracks/:id/stream
```

The Worker must support HTTP Range requests.

Flow:

```txt
Browser Audio Element
        │
        ▼
authenticated Worker endpoint
        │
        ▼
R2 ranged read
        │
        ▼
partial audio response
```

This keeps the R2 bucket private while supporting normal audio seeking.

---

# 26. Music Import Scope

Kokpit V1 core architecture supports:

```txt
user-owned audio upload
personal music library
playlist management
playback
```

The system should not depend on unofficial TikTok, Instagram, YouTube, or other platform scraping for its core operation.

External import adapters may be added later when:

- technically reliable
- legally appropriate
- compatible with the source platform

They must remain optional integrations.

---

# 27. News Architecture

The browser should not directly aggregate news from many external websites.

Instead:

```txt
Scheduled Worker
      │
      ▼
Fetch external sources
      │
      ▼
Normalize
      │
      ▼
Deduplicate
      │
      ▼
Score relevance
      │
      ▼
Store in D1
      │
      ▼
Kokpit API
      │
      ▼
Frontend
```

This provides:

- consistent data
- fewer client requests
- caching
- resilience
- source normalization
- better control over relevance

---

# 28. News Sources

Actual providers belong in:

```txt
docs/features/CONTENT_SOURCES.md
```

Architecture should support:

- RSS
- Atom
- official APIs
- official company feeds
- technology publications
- trusted world news sources

Each normalized news item should retain its original source URL.

---

# 29. News Refresh

Use:

```txt
Cloudflare Cron Triggers
```

Initial suggested refresh interval:

```txt
every 30–60 minutes
```

The exact schedule belongs in `CONTENT_SOURCES.md` or `DEPLOYMENT.md`.

The frontend reads cached normalized content from Kokpit.

External source failure should not break the News page.

---

# 30. News Relevance

Kokpit should rank content around user interests.

Examples:

```txt
AI
software engineering
developer tools
cybersecurity
NVIDIA
major technology companies
social platforms
technology research
important world events
geopolitics
major conflicts
```

Initial relevance may use:

- source priority
- keyword matching
- recency
- category
- duplicate detection

AI-based ranking can remain optional.

---

# 31. AI News Enrichment

Workers AI may optionally be used for:

- concise summaries
- "why this matters"
- topic classification
- relevance refinement

AI enrichment should run server-side.

It should not be required to render an article.

Fallback:

```txt
source headline
source description
basic relevance score
```

If AI is unavailable, News must continue working.

---

# 32. Quote Architecture

Quotes must not rely on a small hardcoded frontend array.

Recommended flow:

```txt
Scheduled Worker
      │
      ▼
Quote Provider
      │
      ▼
Generate / collect batch
      │
      ▼
Normalize + deduplicate
      │
      ▼
D1 quote pool
      │
      ▼
Quote selection API
      │
      ▼
Home
```

---

# 33. Quote Provider

Primary V1 option:

```txt
Cloudflare Workers AI
```

Workers AI may generate original short lines across controlled mood categories.

Examples:

```txt
calm
ambition
struggle
life
sadness
uncertainty
hope
creativity
technology
late-night reflection
```

Generated lines should normally remain unattributed.

Do not invent fake author attributions.

---

# 34. Quote Fallback

Quote delivery must survive AI failure or quota limits.

D1 should keep an existing quote pool.

Fallback order:

```txt
1. unused/recent cached quote
2. previously stored quote
3. small emergency fallback set
```

The emergency fallback set exists only for reliability.

It must not become the primary quote experience.

---

# 35. Quote Rotation

The frontend should not generate a new AI quote on every page load.

Instead:

- generate in batches
- store in D1
- rotate periodically
- reduce duplicate display

The exact rotation rules belong in `CONTENT_SOURCES.md`.

---

# 36. Scheduled Worker Architecture

The same Worker deployment may expose both:

```txt
fetch()
scheduled()
```

`fetch()` handles HTTP traffic.

`scheduled()` handles background jobs.

Conceptual scheduled tasks:

```txt
refresh news
generate quote batch when needed
clean stale content
optional maintenance
```

Avoid separate Worker deployments until there is a real need.

---

# 37. External Integrations Boundary

All third-party services must be wrapped behind internal providers.

Conceptual interfaces:

```txt
NewsProvider
QuoteProvider
AIProvider
```

The frontend should never care which external source produced the data.

This makes external providers replaceable.

---

# 38. API Response Boundary

External data must be normalized before reaching the frontend.

Bad:

```txt
Frontend
→ directly consumes 6 unrelated news API shapes
```

Preferred:

```txt
External providers
→ normalization
→ internal Kokpit schema
→ frontend
```

Kokpit controls its own data contracts.

---

# 39. Failure Isolation

Feature failure should remain local.

Examples:

```txt
News source down
→ College still works

Workers AI unavailable
→ cached quotes still work

R2 upload error
→ Ideas still work

one malformed RSS feed
→ other feeds still refresh
```

One integration must not crash the entire application.

---

# 40. Error Strategy

Backend errors should use structured JSON.

Conceptually:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Material not found."
  }
}
```

Do not expose:

- stack traces
- secret values
- SQL internals
- Cloudflare credentials

Frontend error states should follow `DESIGN_SYSTEM.md`.

---

# 41. Logging

V1 should rely primarily on Cloudflare's native Worker logs.

Log:

- unexpected API failures
- failed scheduled jobs
- failed external source fetches
- failed file operations

Do not log:

- file contents
- private idea contents unnecessarily
- secrets
- authentication tokens
- signed URLs

A third-party observability platform is not required for V1.

---

# 42. Security Boundaries

The security layers are:

```txt
Cloudflare Access
      ↓
Worker API
      ↓
request validation
      ↓
ownership checks
      ↓
D1 / R2
```

Cloudflare Access does not remove the need for application-level validation.

---

# 43. Ownership Enforcement

Every resource lookup must include ownership context.

Bad:

```sql
SELECT * FROM ideas WHERE id = ?
```

Preferred concept:

```sql
SELECT *
FROM ideas
WHERE id = ?
AND user_id = ?
```

This principle should apply even though V1 has only one user.

It prevents insecure architecture from becoming embedded before a future public release.

---

# 44. Secret Management

Secrets must exist only in:

- Cloudflare environment bindings
- Wrangler secrets
- deployment configuration

Never commit:

```txt
API keys
R2 credentials
AI credentials
Access secrets
private tokens
```

to Git.

---

# 45. Frontend Security

The frontend must not contain privileged credentials.

Client-side environment variables must be treated as public.

Sensitive third-party APIs must be called from the Worker.

---

# 46. Static Assets

The React build output should be deployed using:

```txt
Cloudflare Workers Static Assets
```

Do not use legacy Workers Sites.

The Vite + Cloudflare integration should handle:

- frontend build
- static assets
- Worker runtime
- SPA routing

as a single deployment unit.

---

# 47. Caching Strategy

Kokpit V1 intentionally avoids adding Cloudflare KV unless there is a clear requirement.

Use:

```txt
Cloudflare static asset caching
D1 for persistent news cache
D1 for quote pool
frontend query cache
browser HTTP cache where appropriate
```

Do not add a new infrastructure product just because it exists.

KV may be introduced later for workloads where global key-value reads provide a real benefit.

---

# 48. Durable Objects

Durable Objects are not required for Kokpit V1.

Current V1 features do not require:

- collaborative realtime state
- distributed coordination
- websocket rooms
- multiplayer state

Do not introduce Durable Objects unless future features require them.

---

# 49. Realtime Features

Kokpit V1 does not require WebSockets.

Examples:

```txt
clock
→ client-side timer

music progress
→ browser audio events

news
→ periodic fetch/cache

quotes
→ periodic refresh
```

Realtime infrastructure would add complexity without meaningful V1 benefit.

---

# 50. Performance Strategy

Performance principles:

- deploy frontend close to users via Cloudflare
- lazy-load feature routes where beneficial
- avoid loading every module on Home
- use thumbnails instead of full-resolution images
- do not preload large music files
- stream media
- keep third-party requests server-side
- cache news and quotes
- minimize JavaScript dependencies

Home should become interactive quickly.

---

# 51. Frontend Code Splitting

Dedicated feature pages should be eligible for lazy loading.

Example:

```txt
Home bundle
does not need the complete College management UI
does not need the complete Music library UI
does not need the complete News page UI
```

Home preview components should remain lightweight.

---

# 52. File Metadata vs File Bytes

Always separate:

```txt
D1
→ metadata

R2
→ file bytes
```

Example:

```txt
D1:
Lecture 05.pdf
course
week
size
mime
r2_key

R2:
actual PDF bytes
```

This rule applies to both music and college files.

---

# 53. Data Lifecycle

Deleting a file-backed entity should handle both layers.

Conceptually:

```txt
delete material
→ remove database record
→ remove R2 object
```

Deletion logic should avoid leaving orphaned files.

Cleanup jobs may later detect unexpected orphaned objects.

---

# 54. Development Environments

Kokpit should support:

```txt
local
production
```

Optional preview/staging may be added later.

Local development should emulate Cloudflare bindings as closely as possible using the Cloudflare Vite tooling.

Local development must not require access to production D1 data.

---

# 55. Local Database

Development should use local D1 emulation / local binding data.

Production database data must remain isolated.

Migrations should be applied deliberately to:

```txt
local
then production
```

---

# 56. Database Migrations

All schema changes must use version-controlled migrations.

Do not manually change production schema without a migration.

Migration files belong in Git.

AI agents modifying the database schema must:

1. update the Drizzle schema
2. create migration
3. update `DATA_MODEL.md`
4. confirm existing data remains valid

---

# 57. Dependency Philosophy

Dependencies should be added intentionally.

Preferred categories:

```txt
React
React Router
Cloudflare Vite integration
Hono
Drizzle
Zod
TanStack Query
Tailwind
Lucide
```

Avoid adding packages for trivial functionality.

Especially avoid:

- giant utility libraries for one function
- duplicate date libraries
- multiple state managers
- multiple UI component systems
- multiple validation libraries

---

# 58. Architecture Boundaries

Recommended conceptual layers:

```txt
UI Components
      ↓
Feature UI
      ↓
Client API
      ↓
HTTP API Routes
      ↓
Services
      ↓
Repositories / Providers
      ↓
D1 / R2 / External Services
```

Not every feature needs every layer.

Use the smallest structure that preserves clear responsibilities.

---

# 59. Feature Modularity

Each major feature should own most of its internal logic.

Conceptual modules:

```txt
home
college
music
news
ideas
library
```

Shared code should exist only when genuinely shared.

Avoid a giant generic `utils` dumping ground.

The exact directories will be defined in `FILE_STRUCTURE.md`.

---

# 60. Home Dependency Rule

Home may consume lightweight summaries from feature modules.

Home must not become the owner of feature logic.

Examples:

```txt
Home music preview
→ reads Music state

Home college preview
→ requests College summary

Home news preview
→ requests News summary
```

The feature page remains the canonical deeper experience.

---

# 61. API Versioning

Explicit `/api/v1` versioning is not required for the private V1 application.

Internal API contracts can evolve with the frontend because both deploy together.

If Kokpit later exposes a public API or external clients, API versioning should be reconsidered.

---

# 62. Testing Architecture

Detailed testing rules may later move into a dedicated document.

Minimum architectural expectation:

```txt
unit tests
for pure business logic

API integration tests
for important routes

database tests
for critical data behavior

basic UI/component tests
for important interactions

end-to-end smoke tests
for core user flows
```

Highest-priority flows:

```txt
open Kokpit
save idea
open quick link
upload college material
play music
switch pages without stopping music
load cached news
```

---

# 63. Backup and Recovery

D1 should use Cloudflare-native recovery capabilities.

Important user files live in R2.

A future backup strategy should cover:

```txt
database export
R2 file inventory
critical configuration
```

Detailed operational backup procedures belong in `DEPLOYMENT.md`.

---

# 64. Cost Philosophy

Kokpit V1 should be designed around low-volume personal usage.

Infrastructure should remain within free/included tiers where practical.

Cost-sensitive services should be:

- cached
- batched
- scheduled
- optional where possible

Especially:

```txt
AI inference
external APIs
object storage
```

Do not call AI on every Home load.

---

# 65. Explicitly Excluded Infrastructure

Kokpit V1 should not use:

```txt
traditional VPS
Express server
separate Node.js server
Docker production deployment
Kubernetes
Redis
MongoDB
Firebase
Supabase
WebSocket server
Durable Objects
microservices
message queue
Elasticsearch
separate search server
```

unless the architecture is intentionally revised.

This is not because those technologies are inherently bad.

They are unnecessary for Kokpit V1.

---

# 66. Future Evolution

Potential future requirements may change the architecture.

Examples:

## Public Kokpit

May introduce:

```txt
real end-user authentication
registration
quotas
per-user storage
account deletion
billing
abuse prevention
```

## Advanced Search

May introduce:

```txt
D1 FTS
vector search
semantic indexing
```

## Collaboration

May introduce:

```txt
Durable Objects
WebSockets
realtime presence
```

## Larger Uploads

May introduce:

```txt
presigned R2 uploads
multipart uploads
```

## AI Features

May introduce:

```txt
AI Gateway
additional model providers
RAG
document embeddings
```

None belong in V1 by default.

---

# 67. Architecture Decision Summary

Kokpit V1 locks the following architecture direction:

```txt
Application:
Single repository

Frontend:
React + TypeScript + Vite

Routing:
React Router

Styling:
Tailwind CSS + Kokpit CSS design tokens

Backend:
Cloudflare Workers + Hono

Validation:
Zod

Database:
Cloudflare D1

Database Layer:
Drizzle ORM

Files:
Cloudflare R2

Authentication:
Cloudflare Access

Background Jobs:
Cloudflare Cron Triggers

AI:
Workers AI as optional content provider

Deployment:
Cloudflare Workers Static Assets + Worker API

Application Model:
SPA + same-origin API

User Model:
Private single-user V1
multi-user-ready data ownership
```

---

# 68. Architecture Principles for AI Agents

AI coding agents must follow these rules:

1. Do not replace the approved architecture without explicit instruction.

2. Do not introduce a second backend runtime.

3. Do not expose D1 or R2 directly to the browser without an approved API flow.

4. Do not put secrets in frontend environment variables.

5. Preserve `user_id` ownership boundaries.

6. Keep R2 private.

7. Keep external provider logic server-side.

8. Keep Home lightweight.

9. Preserve persistent music playback across routes.

10. Use D1 for structured metadata and R2 for file bytes.

11. Prefer graceful cached fallbacks for external content.

12. Do not make AI inference a hard dependency for basic application functionality.

13. Use migrations for schema changes.

14. Do not add infrastructure products merely because they are available.

15. Update architecture documentation if a real architectural decision changes.

---

# 69. Final Architecture Rule

When choosing between two technical solutions, prefer the one that:

```txt
has fewer moving parts
fits Cloudflare naturally
remains inexpensive
keeps user data private
is understandable by one developer
can be maintained long-term
does not block future growth
```

The core architectural question is:

> Does this make Kokpit simpler to own while keeping it easy to grow?

If not, reconsider the decision.
