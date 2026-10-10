# Kokpit agent rules

**Version:** 1.2 | **Status:** Active V1 Agent Rules | **Updated:** 2026-10-09

Applies to all AI coding agents working in this repository.

Implement the frozen specification within the current task boundary.
Read the docs, inspect the code, make the smallest correct change, validate, report, and stop.
Do not redesign the product, architecture, data model, or visual identity.

## Read before implementing

In the first session, read all documents in this order:

1. [AGENTS.md](AGENTS.md)
2. [PRD](docs/product/PRD.md)
3. [Design system](docs/design/DESIGN_SYSTEM.md)
4. [Architecture](docs/engineering/ARCHITECTURE.md)
5. [Data model](docs/engineering/DATA_MODEL.md)
6. [Content sources](docs/features/CONTENT_SOURCES.md)
7. [File structure](docs/engineering/FILE_STRUCTURE.md)
8. [Implementation plan](docs/planning/IMPLEMENTATION_PLAN.md)
9. [Decisions](docs/product/DECISIONS.md)
10. [Deployment](docs/engineering/DEPLOYMENT.md)
11. [README](README.md)

Later sessions must read the documents relevant to the requested work.
Search the docs before coding when it is unclear which document controls a decision.

## Source of truth and conflicts

Priority: latest explicit user instruction → AGENTS → PRD → Design system →
Architecture → Data model → Content sources → File structure → Implementation plan →
Decisions → README.

If a conflict affects scope, architecture, security, or persistence, stop, report it, and ask for resolution.
Do not silently choose or encode a workaround.
Minor internal choices such as variable names, helper names, test fixtures, and focused extraction are safe when behavior is unchanged.
Do not guess new workflows, auth, public behavior, infrastructure, providers, entities, privacy, or visual identity.

## Task scope

- The requested milestone/work package is the boundary; do not implement adjacent work early.
- Use the work packages in Implementation plan as execution units. The owner may authorize
  one package, a package range, or a whole milestone. Complete the included checklist and
  validation without asking for a new instruction after each internal item.
- Stop at the authorized boundary or a required review gate. Do not start the next package
  merely because it is listed next. Legacy Phase references in historical decisions and
  source comments use the mapping in Implementation plan.
- Check before each meaningful change: is it required by the current task, and does it preserve the specification?
- If either answer is unclear, review the docs before proceeding.
- Refactor only when meaningful duplication, unclear responsibility, or a task blocker justifies it.
- Keep refactors local; large refactors require explicit scope.
- Do not create empty modules, files, or architecture layers just to match a tree.
- Stop after the requested work and its validation.

V1 is a private, single-owner personal room with Home, College, Music, News, Ideas, and Library.
It must remain calm, warm, lightweight, editorial, and personal.
No task manager, Kanban, calendar, Pomodoro/focus timer, habit tracking, productivity scores,
streaks/XP, AI chatbot/panel, team features, public profiles/accounts, social features,
analytics dashboard, universal command palette, or global semantic search without an explicit PRD revision.
The complete non-goals are in the PRD.

## Architecture and dependencies

The approved stack is locked:

| Responsibility | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Server state | TanStack Query |
| UI/session state | React Context or a lightweight local store |
| Backend/validation | Cloudflare Workers, Hono, TypeScript, Zod |
| Database | D1 with Drizzle |
| Files/access | Private R2, Cloudflare Access |
| Scheduled work/AI | Cron Triggers, optional Workers AI |
| Deployment | Workers + Static Assets |

Do not replace the stack without explicit approval.
Prefer Cloudflare-native services; do not design around an always-running traditional server.
Do not introduce Next.js, Express, NestJS, Firebase, Supabase, MongoDB, PostgreSQL, Redis,
Docker production, VPS, Durable Objects, WebSockets, GraphQL, another ORM/validator/UI framework, or Redux without an approved architecture revision.
A documented need must be reviewed before changing architecture.

Before adding a package, check platform APIs and existing dependencies.
Explain why they are insufficient, maintenance cost, and alternatives.
Wait for approval when a dependency materially changes architecture.
No trivial-function packages, duplicate date libraries/state managers/UI systems/validators.
Keep package-lock.json with intentional dependency changes; do not regenerate it unnecessarily.
Do not add feature-flag infrastructure unless required; optional capabilities may degrade through configuration.

## Code placement and maintainability

Follow File structure; key boundaries:

| Path | Responsibility |
| --- | --- |
| `src/features/` | Feature UI, hooks, clients, types, and local logic |
| `src/components/` | Genuinely reusable UI primitives/layout |
| `src/app/` | Application composition, routing, providers |
| `src/lib/` | Generic frontend infrastructure |
| `worker/api/` | HTTP boundary |
| `worker/services/` | Business logic |
| `worker/db/` | Schema and repositories |
| `worker/providers/` | External services and storage adapters |
| `worker/jobs/` | Scheduled jobs |
| `worker/middleware/` | Request middleware |

Prefer route → service → repository/provider, without ceremony for simple operations.
Keep business logic out of route handlers and external-provider logic out of React/routes/database modules.
Normalize external data into Kokpit contracts.
Use small focused components; avoid giant multipurpose containers.
Feature code stays local until a second genuine use justifies shared extraction.
No giant `utils.ts`/`helpers.ts`/`common.ts`/`misc.ts` dumping grounds.
Comments explain non-obvious security, provider quirks, Cloudflare constraints, or complex algorithms, not obvious code.
Deferred TODOs must reference a milestone/package or issue and state why.
Do not hand-edit generated build/coverage/temporary Worker output; generated migration SQL must still be reviewed.

## Data, files, and privacy

- Check Data model before adding a table; unexpected new persistent entities require review.
- Material schema changes need schema update, migration, documentation update, and compatibility review.
- Generate, inspect, apply migrations locally, test, then apply deliberately to production.
- Never manually alter production structure or silently rewrite applied migration history.
- Preserve `user_id`; every user-owned lookup/mutation includes ownership context even in single-user V1.
- D1 stores metadata; R2 stores bytes. Do not put large binaries in D1.
- R2 remains private. Resolve file IDs through metadata and ownership checks.
- Generate storage keys server-side; never trust complete client-supplied keys or expose unrestricted bucket access.
- Validate owner, size, allowed type, destination, and metadata on uploads.
- The V1 upload limit is **50 MB per file**; do not increase it silently.
- File deletion must coordinate metadata and R2 cleanup with safe handling of partial failure.
- Before destructive deletion, confirm purpose, ownership, migration impact, and R2 cleanup impact.
- Cloudflare Access protects the deployed application; do not add signup, registration, account switching, or multi-user UI.
- LocalStorage is for non-critical preferences, never canonical Kokpit content.
- Use Zod at all API boundaries: params, queries, JSON, URLs, filenames, metadata, external source data.
- Errors must be structured, safe, local, and recoverable where possible.
- Do not expose stack traces, SQL internals, secrets, credentials, or internal bindings.
- Never commit real production values, tokens, API keys, R2/Access credentials, or Cloudflare secrets.
- Use environment bindings, Wrangler secrets, and ignored local files; `.env.example` contains placeholders only.
- Keep local and production data isolated as specified in Deployment.
- Production must not ship fake personal content, debug records, or demo fixtures.
- Isolated development/test fixtures and documented operational seed data are allowed.

## Content and music constraints

Music uses native browser audio, a provider above route pages, persistent playback, and private HTTP Range streaming.
Do not build a codec engine or make unofficial platform scraping a core dependency.

Follow Content sources for quote and news details:

- Quotes use batch generation, filtering/deduplication, a D1 pool, and stable local-hour selection.
- Preserve the approved language distribution and fixed V1 hourly behavior.
- Do not call AI on every page load or use a static motivational array as the primary quote system.
- Reject clichés, hustle/therapy tone, fake depth, repetitive structures, and fake author attribution.
- AI-generated authors are normally null; never fabricate an author.
- News is a scheduled backend aggregation pipeline; the browser reads Kokpit's normalized cache.
- Use the documented initial sources; a new source must materially improve quality and require review if strategy changes.
- AI news enrichment is optional; ingestion, listing, links, and basic relevance must work without it.
- Isolate failures: one source, feature, upload, or AI failure must not crash unrelated functionality.
- Retain cached quotes/news when providers fail.
- Workers AI is limited to quote generation and optional news enrichment, not an assistant/chat interface.
- Never send private ideas, college files, notes/documents, music history, or private links to quote AI.
- Use only approved general predefined context.

Log unexpected API, scheduled-job, external-source, and important file-operation failures.
Do not log private content, bytes, tokens, credentials, or secrets.
Exceptional local debugging must be necessary and removed before completion.

## Design and performance

Follow Design system: **Dark Cozy Editorial Workspace**, semantic tokens, Cormorant Garamond + Inter.
No arbitrary palette colors when a semantic token exists; no extra font families without approval.
Serif belongs to clock/quote/expressive hero text, not dense functional UI.
Keep Home a highlight surface; deeper functionality belongs on feature pages.
A future feature gets a Home card only if it is useful almost every time Kokpit opens.
Avoid generic SaaS/admin/Notion styling, neon gradients, AI sparkles, heavy glass/blur, glowing cards, and widget walls.

Use semantic controls, keyboard navigation, visible focus, labels, contrast, heading hierarchy, and reduced-motion support.
Prefer lazy feature routes, small dependencies, cached content, thumbnails, streamed audio, and server-side integrations.
Do not load complete feature implementations on Home, preload full music files, or add unnecessary animations.

## Validation and completion

Relevant tests are mandatory; never skip a failing test to finish faster.
Prioritize business logic, ownership, API behavior, file operations, streaming, quote selection, news normalization, and critical UI flows.
Run relevant lint, typecheck, build, and tests before claiming completion.
If a check cannot run, name it and explain why; do not claim it passed.

| Work | Additional verification |
| --- | --- |
| UI | Desktop, basic responsive layout, keyboard focus, loading/empty/error states where applicable |
| Backend/files | Ownership, input validation, R2 privacy, no secrets exposed, safe error output |
| Schema | Reviewed migration, local application, compatibility, matching Data model |

Update the canonical document when scope, schema, deployment, architecture, design tokens, or source strategy changes materially.
Record non-obvious decisions in Decisions; do not fill it with trivial implementation details.
Preserve decision history when superseding a decision.

Stop for review if scope/architecture changes, unexpected tables, destructive migrations, major dependencies,
material doc conflicts, public/private assumptions, provider limitations, design mismatch, or deployment deviations arise.
Never invent a product-changing workaround.

Priority: **data safety → privacy → core correctness → stable UX → performance → visual polish → optional AI enrichment**.

Report: Completed; Files changed; Validation performed; Known limitations/conflicts; Next documented step.
Keep it concise and stop at the authorized boundary.

## Git workflow for this owner

The owner stages, commits, and pushes manually.
Do not run `git add`, `git commit`, or `git push`.
After each edit/work package/milestone, supply manual commands covering every changed file.
Use concrete English messages. Group related files that serve the same change; keep unrelated
work separate and avoid bundling the whole session into one commit.
Read-only Git inspection is allowed.
