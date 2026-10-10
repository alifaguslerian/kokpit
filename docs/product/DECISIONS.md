# Kokpit — Decisions

**Version:** 1.3
**Status:** Active V1 Decision Log
**Product:** Kokpit · **Type:** Product + Architecture ADRs
**Last Updated:** 2026-10-10

This log preserves decisions and their reasons, not minor implementation changes. Status vocabulary: Accepted, Superseded, Deprecated, Under Review. Each record retains its original date; shortening the record does not reopen or replace it.

Before changing a decision, preserve its reasoning, add a new approved record or mark it superseded, explain the change, and update affected documents/implementation. New product, architecture, privacy, data, or design choices require owner review. Use existing decisions before inventing another direction.

Canonical contracts: [PRD](PRD.md), [Design System](../design/DESIGN_SYSTEM.md), [Architecture](../engineering/ARCHITECTURE.md), [Data Model](../engineering/DATA_MODEL.md), [Content Sources](../features/CONTENT_SOURCES.md), [File Structure](../engineering/FILE_STRUCTURE.md), [Implementation Plan](../planning/IMPLEMENTATION_PLAN.md), [Deployment](../engineering/DEPLOYMENT.md), [Agent Rules](../../AGENTS.md), [README](../../README.md).

## Product and ownership

### DEC-001 — Personal digital room

**Accepted · 2026-10-06**

**Decision:** Kokpit is a private personal digital room, not a task manager, admin dashboard, Notion clone, productivity operating system, corporate workspace, or team platform. **Reason:** The owner should want to keep a useful personal room open, without constant productivity demands. **Impact:** Calm, low-density Home; personal features; comfort and atmosphere; productivity mechanics need explicit future approval.

### DEC-002 — Private single-user V1

**Accepted · 2026-10-06**

**Decision:** Owner-only; no signup, public login, account switching, team features, public profiles, or public registration/multi-user access. **Reason:** A useful first personal version need not carry public-product complexity: auth design, recovery, quotas, user deletion, abuse prevention, storage limits, billing, privacy policy, multi-user authorization. **Impact:** Public release needs a later product decision.

### DEC-003 — Ownership-aware data from day one

**Accepted · 2026-10-06**

**Decision:** User-owned entities include `user_id`; queries scope by resource AND owner (`WHERE id = ? AND user_id = ?`). **Reason:** Small initial structure avoids destructive restructuring for a possible public version. **Impact:** One owner does not justify ID-only authorization.

## Platform, storage, and validation

### DEC-004 — Cloudflare production platform

**Accepted · 2026-10-06**

**Decision:** Workers, Workers Static Assets, D1, R2, Access, Cron Triggers, Workers AI. **Reason:** Low overhead/cost, serverless private hosting, edge runtime, object storage, scheduled work, integrated AI option. **Impact:** No required VPS, always-on Node server, Docker production runtime, or separate database server without a future platform revision.

### DEC-005 — React + TypeScript + Vite frontend

**Accepted · 2026-10-06**

**Decision:** React, TypeScript, Vite, React Router. **Reason:** Persistent music, client routing, dynamic Home, and interactive pages need no public SEO-oriented rendering; Vite keeps development/build lightweight. **Impact:** No Next.js or V1 SSR requirement.

### DEC-006 — Workers + Hono backend

**Accepted · 2026-10-06**

**Decision:** Workers runtime with Hono routing. **Reason:** Natural Workers fit and less weight than a traditional server framework. **Impact:** Routes, services, repositories, providers, jobs own separate responsibilities; business logic must not accumulate in handlers.

### DEC-007 — D1 metadata, R2 bytes

**Accepted · 2026-10-06**

**Decision:** D1 owns relational content/metadata: ideas, courses/materials, tracks, playlist relationships, news, quotes. R2 owns music, PDF/PowerPoint/Word files, images, artwork. **Reason:** Relational metadata and binaries have different requirements. **Impact:** No large bytes in D1 or canonical metadata database in R2.

### DEC-008 — Drizzle database layer

**Accepted · 2026-10-06**

**Decision:** Drizzle ORM with D1. **Reason:** Typed schema/queries, migrations, TypeScript compatibility, inspectable schema, clear evolution suit AI-assisted work. **Impact:** Schema change → schema update → generated migration → local verification → material documentation update.

### DEC-009 — Zod API validation

**Accepted · 2026-10-06**

**Decision:** Zod validates route/query params, bodies, URLs, filenames, file metadata, external provider data. **Reason:** Browser and provider input cannot be trusted. **Impact:** Validation belongs at API boundaries.

### DEC-010 — Cloudflare Access private gate

**Accepted · 2026-10-06**

**Decision:** Deny by default, owner identity only; no custom V1 login screen. **Reason:** Custom auth is unnecessary for one owner; a secret URL is inadequate protection. **Impact:** Access does not replace application ownership checks.

## Home, visual identity, and core features

### DEC-011 — Home highlights

**Accepted · 2026-10-06**

**Decision:** Lightweight Clock, Quote, Music, College, News, Ideas, Quick Links previews; deep functionality belongs on dedicated pages. **Reason:** Home should be atmospheric and immediately readable. **Impact:** No card soup; future features do not automatically get Home cards.

### DEC-012 — Six main destinations

**Accepted · 2026-10-06**

**Decision:** Home, College, Music, News, Ideas, Library. **Reason:** These are actual V1 scope. **Impact:** Tasks, Calendar, Goals, Habits, Focus, Notes, AI Chat, Analytics, Projects require PRD revision before navigation entries.

### DEC-013 — Dark Cozy Editorial Workspace

**Accepted · 2026-10-06**

**Decision:** Deep warm charcoal, off-white text, restrained copper/amber, elegant large serif clock, functional sans UI, soft borders, subtle shadows, cozy nighttime atmosphere. **Reason:** Matches the personal-room feeling. **Impact:** Avoid neon cyberpunk, blue SaaS, purple AI gradients, RGB, heavy glassmorphism, admin density.

### DEC-014 — Dark-first V1

**Accepted · 2026-10-06**

**Decision:** Dark theme required; light mode is not. **Reason:** The approved concept centers on a warm dark environment. **Impact:** No full light-theme system without scope revision.

### DEC-015 — Serif atmosphere, sans function

**Accepted · 2026-10-06**

**Decision:** Cormorant Garamond for clock, quote, expressive hero text; Inter for navigation, buttons, inputs, cards, functional content. **Reason:** Editorial warmth with UI clarity. **Impact:** V1 font lock reaffirmed by DEC-048.

### DEC-016 — Fast Ideas capture

**Accepted · 2026-10-06**

**Decision:** Fast text capture, optional title/tags, browse, search, edit, delete. **Reason:** Capture spontaneous thoughts before they disappear. **Impact:** No Notion editor, task manager, complex knowledge base, or project management.

### DEC-017 — College hierarchy

**Accepted · 2026-10-06**

**Decision:** Semester → Course → Week → Material, with files and links; no global artificial week limit. **Reason:** Mirrors academic organization. **Impact:** File metadata in D1, bytes in R2.

### DEC-018 — Persistent music

**Accepted · 2026-10-06**

**Decision:** Playback state above route pages; mini player stays active across sections. **Reason:** Music is persistent workspace atmosphere. **Impact:** No route remounts; native audio APIs; private streaming supports HTTP Range for seeking.

### DEC-019 — User-owned audio core

**Accepted · 2026-10-06**

**Decision:** Personal uploads, library, playlists, queue, playback. **Reason:** Avoid fragile unofficial media extraction. **Impact:** TikTok/Instagram/YouTube scraping or downloading is no core dependency; later adapters require technical reliability and appropriateness.

## Quotes and News

### DEC-020 — Original batch-generated thoughts

**Accepted · 2026-10-06**

**Decision:** Workers AI generates quotes in batches into D1, with emotional range/personality rather than a generic motivational API. **Reason:** Traditional quote APIs repeat clichés. **Impact:** Moods: calm, reflective, ambition, struggle, sad, uncertain, hopeful, lonely, creative, life, student, developer, late-night, rest, curiosity, dry-humor.

### DEC-021 — Mostly English quotes

**Accepted · 2026-10-06**

**Decision:** ~90% English / ~10% Indonesian. **Reason:** English matches the approved editorial direction/tone. **Impact:** Natural single-language quotes; avoid forced mixing.

### DEC-022 — Stable quote each local hour

**Accepted · 2026-10-06**

**Decision:** Same primary quote within each clock-hour slot, normally unchanged on refresh; next local hour becomes a new slot. **Reason:** Intentional experience and fewer AI calls. **Impact:** Stable/deterministic scheduled selection; required secondary `another thought` supplies only a temporary alternate, clarified by DEC-048.

### DEC-023 — No AI per Home load

**Accepted · 2026-10-06**

**Decision:** Quote generation/news enrichment use batches/cache. **Reason:** Less cost, latency, failure dependence, duplicate output, unpredictability. **Impact:** Home works during AI failure; AI is an enhancement.

### DEC-024 — No private content in quote prompts

**Accepted · 2026-10-06**

**Decision:** General time-of-day, student life, software building, creativity, technology context only; no ideas, College files, documents, private links, music history. **Reason:** Personalization does not justify needless privacy exposure. **Impact:** Prompts remain separated from private content.

### DEC-025 — Independent news sources

**Accepted · 2026-10-06**

**Decision:** Official NVIDIA/GitHub/Google/Cloudflare; Hacker News signal; Ars Technica/TechCrunch journalism; GDELT world discovery. **Reason:** Multiple sources improve resilience and signal. **Impact:** Provider/adapter boundaries; no universal provider dependency or whole-feed failure from one source.

### DEC-026 — News relevance over volume

**Accepted · 2026-10-06**

**Decision:** Surface strongest items in AI, LLMs, developer tools, software engineering, GitHub, OpenAI, Google AI, NVIDIA, cybersecurity, technology, hardware, research, major world events. **Reason:** Reduce noise rather than recreate a portal. **Impact:** Deterministic relevance scoring before optional AI enrichment.

### DEC-027 — Avoid a total filter bubble

**Accepted · 2026-10-06**

**Decision:** 70–80% personally relevant / 20–30% important outside usual interests. **Reason:** Personal feeds should expand awareness. **Impact:** World, science, geopolitics, major economics can surface without direct software relevance.

### DEC-028 — Scheduled server-side News

**Accepted · 2026-10-06**

**Decision:** Recommended every 30 minutes: Cron → fetch → normalize → validate → deduplicate → score → optional AI → D1 → frontend. **Reason:** More reliable than browser calls to many providers. **Impact:** Source integration stays backend-side.

### DEC-029 — No full article republication

**Accepted · 2026-10-06**

**Decision:** Headline, source, publication time, available excerpt, appropriate brief summary, why it matters, original URL. **Reason:** Discovery/briefing, not publisher replacement. **Impact:** Clear original links; full article copying is no V1 goal.

### DEC-030 — Optional News AI enrichment

**Accepted · 2026-10-06**

**Decision:** Summary, `why_it_matters`, classification refinement for selected high-relevance items. **Reason:** Rule-based first filtering is cheaper and sufficient. **Impact:** Non-enriched articles render normally; AI failure cannot break News.

### DEC-031 — Two or three Home news items

**Accepted · 2026-10-06**

**Decision:** Home preview has 2–3 items. **Reason:** Calm and scannable Home. **Impact:** Full feed on News page; Home balances relevance, freshness, topic/source diversity.

## Implementation and operations

### DEC-032 — Lightweight custom UI

**Accepted · 2026-10-06**

**Decision:** Tailwind CSS, CSS tokens, custom lightweight components, Lucide icons; no large pre-styled UI framework. **Reason:** Preserve visual identity rather than default framework styling. **Impact:** Intentional reusable primitives; no extra UI system just to speed appearance work.

### DEC-033 — TanStack Query server state

**Accepted · 2026-10-06**

**Decision:** TanStack Query for server state; React local state/context for UI/session state. **Reason:** Predictable fetching, caching, invalidation, loading without large global architecture. **Impact:** No Redux in V1.

### DEC-034 — Infrastructure must earn its cost

**Accepted · 2026-10-06**

**Decision:** No Redis, Durable Objects, WebSockets, queues, Elasticsearch, microservices, separate search server. **Reason:** Requirements do not justify operational/cognitive cost. **Impact:** Add infrastructure only for a real product requirement.

### DEC-035 — No WebSockets

**Accepted · 2026-10-06**

**Decision:** V1 needs no distributed realtime state. **Reason:** Clock uses client timer; music browser audio state; news scheduled refresh; quotes cached hourly selection. **Impact:** No realtime infrastructure for cosmetics.

### DEC-036 — No KV by default

**Accepted · 2026-10-06**

**Decision:** KV excluded initially. **Reason:** D1, R2, browser/query cache, static-asset caching cover current needs. **Impact:** Later KV requires a clear key-value workload.

### DEC-037 — Initial 50 MB upload limit

**Accepted · 2026-10-06**

**Decision:** Application default: 50 MB/file. **Reason:** Covers most music, PDFs, slides, documents, images while uploads stay simple. **Impact:** Larger support may later use presigned/multipart R2 flows.

### DEC-038 — Real deletion by default

**Accepted · 2026-10-06**

**Decision:** Most V1 data uses real deletion; no universal trash. **Reason:** Soft deletion adds unneeded complexity. **Impact:** Selective `deleted_at` only if restore/trash becomes a real requirement.

### DEC-039 — Granular phased implementation

**Superseded by DEC-050 for execution granularity · Originally accepted 2026-10-06**

**Decision:** Small phases/subphases with Goal, Tasks, Acceptance Criteria, Do Not Do. **Reason:** Explicit boundaries improve agent work. **Impact:** Ideally 1–3 subphases/session, not the entire product.

### DEC-040 — Documentation first

**Accepted · 2026-10-06**

**Decision:** Read repository docs before implementation choices. **Reason:** Product, design, architecture, content behavior were deliberately frozen before code. **Impact:** No silent scope expansion, stack replacement, new tables, visual changes, infrastructure.

### DEC-041 — Major uncertainty requires review

**Accepted · 2026-10-06**

**Decision:** Stop for scope expansion, architecture change, new persistent entity, destructive migration, major dependency, public/private change, provider strategy, major visual revision. **Reason:** Silent reinterpretation undermines specification-driven work. **Impact:** Ask owner before changing direction.

### DEC-042 — Feature-oriented file structure

**Accepted · 2026-10-06**

**Decision:** Frontend features under `src/features/{home,college,music,news,ideas,library}`; backend by runtime responsibility. **Reason:** Clearer boundaries than a flat giant component folder. **Impact:** Avoid generic root dumping grounds: misc, helpers, common, core, managers.

### DEC-043 — Share code after real reuse

**Accepted · 2026-10-06**

**Decision:** Keep feature code local until a second real use warrants extraction. **Reason:** Premature abstractions complicate AI-generated code. **Impact:** No generic abstractions for hypothetical reuse.

### DEC-044 — No fake production personal content

**Accepted · 2026-10-06**

**Decision:** Seeds may contain owner, settings, source registry, emergency quote fallbacks only; no fake ideas, courses, tracks, materials, playlists. **Reason:** Personal workspace, not demo app. **Impact:** Production seed remains structural/operational.

### DEC-045 — Reproducible manual deployment

**Accepted · 2026-10-06**

**Decision:** Initial deployment may be manual from owner's machine; CI/CD initially optional. **Reason:** Automation need not precede stable core product. **Impact:** Manual flow stays scripted, documented, repeatable, validated; automation may follow.

### DEC-046 — Simple production operations

**Accepted · 2026-10-06**

**Decision:** Operational simplicity over clever infrastructure. **Reason:** A personal app benefits from stable, private, recoverable, understandable, low-maintenance hosting. **Impact:** Prefer fewer moving parts when requirements are equally satisfied.

## Preflight history and approved resolutions

### DEC-047 — Phase 0 documentation preflight

**Superseded by DEC-048 · 2026-10-06**

**Historical scope:** All eleven required documents existed, were non-empty, and were read. At that review the repository had documentation and an empty `.gitignore`, no implementation/Git metadata; Node/npm/Git were available, `git status --short` reported no repository. Private scope, stack, Cloudflare deployment, D1/Drizzle, private R2, Access, feature boundaries, design/content direction agreed. Phase 0.2's consistency gate was blocked and Phase 1.1–1.3 had not started **at that time**, not today.

| Original finding | Reason review was required |
| --- | --- |
| Hourly quote vs `240`-minute default/configurable interval | AGENTS/content/DEC-022 required local-hour stability, while data settings suggested a different default and configurable behavior. Proposed fixed `60`, clock boundaries, no V1 interval setting. |
| Display font lock vs serif comparison | AGENTS/DEC-015 required Cormorant Garamond; design said not frozen. Proposed retain locked font, require approved revision before comparison/replacement. |
| Functionality-first vs safety/privacy-first | Plan and AGENTS ranked trade-offs differently. Proposed AGENTS priority. |
| Sixteen vs seventeen tables | Explicit list matched Phase 2.3/README; correction did not propose changing tables. |
| Missing persisted quote language | API/selection used language absent from canonical fields; needed representation before schema work. |
| Optional `another thought` vs acceptance/Phase 10.6 | Required-versus-optional implementation status needed clarification. |
| Missing approved visual reference image | Did not block minimal scaffold; comparison needed it before Phase 4.5. |
| Git initialization absent from Phase 1.1 | Versioned commits/migrations unavailable then; review created no metadata. |
| Empty `.gitignore` | Needed dependency/build/local-secret exclusions at authorized initialization. |

**Historical validation:** Inventory, document reads, cross-document searches, tool-version checks only; no dependencies, application/schema/deployment/UI changes. Build, typecheck, lint, render checks unavailable then. This was findings-only, with proposed resolutions unapplied and owner review required; it did not supersede accepted decisions. DEC-048 resolved the review status.

### DEC-048 — Owner-approved preflight resolutions

**Accepted · 2026-10-06 · Supersedes DEC-047 review status and its conflicting specification wording**

**Decision:** The owner approved these documentation changes before implementation:

1. Primary quote changes at local clock-hour boundaries, stable within hour; retain fixed V1 `user_settings.quote_rotation_minutes = 60`, no configurable interval.
2. Lock display Cormorant Garamond and UI Inter; comparisons/replacements require explicit design revision.
3. AGENTS priority: data safety → privacy → core correctness → stable UX → performance → visual polish → optional AI enrichment.
4. Correct summary to seventeen tables, without changing their list.
5. Require `quotes.language` with `en`/`id` to align API, selection, canonical model.
6. Require visually secondary `another thought` for V1/Phase 10.6; optional to use, leaves scheduled hourly quote unchanged.
7. Include Git initialization when needed and dependency/build/local-secret exclusions in Phase 1.1.

**Reason/impact:** Remove ambiguity while preserving approved product/stack. Data Model, Design System, Content Sources, Implementation Plan, README, and DEC-022 wording were aligned; DEC-047 retained as history. Language was specification-only at approval, with no existing data/schema to migrate; initial Drizzle schema/migration must include it in Phase 2.3–2.4.

**Historical authorization:** That instruction authorized documentation only and required waiting for separate implementation instruction. The decision alone did not authorize scaffold, Git initialization, dependencies, schema/migration, backend, or UI. Later owner instruction separately authorized Phase 1.1–1.3; the old wait is not a current scaffold blocker. The visual reference was still needed at that time and never blocked minimal scaffold; DEC-051 records its later receipt for package 2.3 (legacy Phase 4.5) comparison.

### DEC-049 — Owner-approved declaration checking exception

**Accepted · 2026-10-09**

**Decision:** Enable TypeScript `skipLibCheck` during Phase 1.4 with explicit owner approval.
**Reason:** Cloudflare Vite/Wrangler/Miniflare published declarations reference missing
internal modules and contain incompatible declarations. An earlier compatible pair
also failed declaration checking and introduced npm audit findings; retain the current
pair `@cloudflare/vite-plugin@1.63.1` and `wrangler@4.149.0` instead.
**Impact:** Skip internal checking of `.d.ts` files; all Kokpit `.ts`/`.tsx` source and
usage of imported types remain checked with strict mode and the existing safeguards.
`npm run typecheck` remains mandatory and remains part of `npm run build`.
This exception does not authorize disabling source checks or hiding application errors.

### DEC-050: Milestones and complete work packages

**Accepted · 2026-10-09 · Supersedes DEC-039 execution granularity**

**Decision:** The owner approved eight milestones with numbered work packages and
unnumbered technical checklists. A package is the default execution unit; the owner
may authorize a package range or a whole milestone. Agents continue through included
checklist items and validation, then stop at the authorized boundary or a review gate.

**Reason:** Stopping after each small setup or implementation step created repeated
instruction, reporting, documentation, and validation overhead.

**Impact:** Preserve all 127 legacy checklists, goals, acceptance criteria, prohibitions,
dependency order, and completed work. The new plan has 32 work packages. Completed
legacy Phase 0.1–0.2 and 1.1–1.6 map to packages 1.1–1.3; next is package 1.4.
Historical Phase identifiers, including references in existing source comments,
remain interpretable through each package's legacy labels. Product, stack, design,
schema, privacy, tests, and deployment requirements remain unchanged.

The owner still stages, commits, and pushes manually. Agents supply concrete English
commands, grouping related files while keeping unrelated changes separate, according
to the owner's previously approved commit preference.

**Authorization:** This instruction authorizes documentation restructuring only.
Implementation of the next package requires a separate owner instruction.

### DEC-051 — Stitch visual references and refined V1 layouts

**Accepted · 2026-10-10**

**Decision:** The owner supplied Home, College, Ideas, Library, Music, and News screens,
then authorized documentation for a similar UI with cleaner execution. Retain the original
PNGs in `docs/design/references/` and interpret them through
[UI References](../design/UI_REFERENCES.md) and [Design System](../design/DESIGN_SYSTEM.md).
The dark Home screen is the primary atmosphere; the alternate's bright placeholder is not
the target image treatment.

**Reason:** A shared, persistent visual reference makes future implementation review concrete
without redesigning each page or relying on temporary attachment paths.

**Impact:** Refine large-desktop sidebar width to 280px, page padding to 40px / 32px,
content/section gaps to 24px, and the clock baseline to 112px with responsive scaling.
Keep constrained-desktop geometry documented. Home uses Music/Ideas in its left column
and College/News/Quick Links in its right column. Dedicated pages retain the supplied
player, capture, portal-grid, resource-organizer, and editorial-feed character.
Color tokens and Cormorant Garamond + Inter remain unchanged; functional content uses Inter.

**Scope interpretation:** The screens guide appearance. PRD, Data Model, Architecture,
and Content Sources continue to define feature behavior and capabilities. The reference
mapping explicitly separates existing V1 behavior from calendar/progress workflows,
notebooks/reading trackers, encryption/sync claims, DSP/mixing, stream grabbing,
and extra News persistence/settings. Those reference-only elements do not become requirements
through a screenshot. The UI must still expose required V1 controls absent from the mockups.

**Authorization:** Documentation and reference preservation only. No application code,
schema, provider integration, deployment, or work-package completion is authorized by this
decision. Historical missing-reference findings remain recorded, with the asset gap now resolved.
