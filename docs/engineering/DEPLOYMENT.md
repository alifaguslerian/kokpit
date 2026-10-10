# Kokpit — Deployment

**Version:** 0.2 · **Status:** V1 Deployment Draft · **Updated:** 2026-10-09

Operational runbook for one Cloudflare Worker + Static Assets, private Access gate,
D1 metadata, private R2 files, Cron jobs and Workers AI content.
[Architecture](ARCHITECTURE.md) owns system choices; [Data Model](DATA_MODEL.md) owns schema;
[Implementation Plan](../planning/IMPLEMENTATION_PLAN.md) controls when this runbook is implemented.

> Current boundary: packages 1.2–1.3 include local React/TypeScript/Vite + Workers integration, Hono health routing, and Tailwind utilities.
> Feature APIs are pending. Remote resources, migrations, Access and
> deployment steps below are planned procedures, not claims that infrastructure already exists.

## 1. Environments and prerequisites

| Environment | Storage and purpose |
|---|---|
| Local | Local D1/R2 emulation; React + Worker development once integration exists |
| Production | Remote `kokpit-db`, private `kokpit-files`, Worker `kokpit` |
| Preview/staging | Optional later; separate resources such as `kokpit-db-preview` and `kokpit-files-preview` |

Use Node.js, npm and Git plus project-local Vite/Wrangler/Cloudflare Vite tooling and Drizzle/Drizzle Kit
when their documented packages arrive. Do not depend on global Wrangler.
Keep names lowercase and consistent. Local development must not use production bindings as a convenience.
Workers AI inference is remote even when called from local development; use mocks/cached fixtures and
manual job invocation to avoid unnecessary inference.

Current frontend commands:

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

`dev` currently provides React HMR and the Hono Worker on the same origin.
`GET /api/system/health` returns `200 {"status":"ok"}`; unknown API routes return structured 404 responses.
This health endpoint checks HTTP routing only; it does not probe D1, R2, or AI.
`build` prepares `dist/client/` and `dist/kokpit/` as one deployment unit.
Tailwind compiles frontend utilities into the client CSS assets; preview must serve them with the SPA.
Local D1/R2 and their typed bindings remain later packages.
Preview must exercise SPA routes, API routing, assets and changed UI; it does not replace production smoke tests.

## 2. Configuration and secrets

Use one `wrangler.jsonc`, not mixed Wrangler formats. The current config uses
`worker/index.ts`, tested compatibility date `2026-10-09`, SPA fallback and
`assets.run_worker_first = ["/api/*"]`; no remote data bindings or secrets.
The example below is a structural future template;
the actual config must match the Cloudflare Vite plugin and tested project setup.
Never assume this date or binding declaration has been validated by the current scaffold.

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "kokpit",
  "main": "./worker/index.ts",
  "compatibility_date": "2026-10-06",
  "assets": { "not_found_handling": "single-page-application" },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "kokpit-db",
    "database_id": "<D1_DATABASE_ID>",
    "migrations_dir": "drizzle/migrations"
  }],
  "r2_buckets": [{ "binding": "R2", "bucket_name": "kokpit-files" }],
  "ai": { "binding": "AI" },
  "vars": {
    "KOKPIT_ENVIRONMENT": "production",
    "KOKPIT_DEFAULT_TIMEZONE": "Asia/Jakarta"
  },
  "triggers": { "crons": ["*/30 * * * *"] }
}
```

Choose a recent **tested** compatibility date; changing it requires local checks.
Treat date changes as infrastructure work; do not bundle automatic updates with unrelated features.
Let the integration generate final deployment output; do not hardcode asset paths without a project requirement.
SPA fallback must coexist with API routing rather than conceal API failures.
Regenerate typed bindings with `npx wrangler types` after binding changes, then typecheck.

| Configuration | Handling |
|---|---|
| Local sensitive values | Ignored `.dev.vars` / environment files |
| Production secrets/provider credentials | Wrangler secrets or equivalent Cloudflare secret configuration |
| Non-secret runtime variables | Wrangler `vars` where appropriate |
| Client environment variables | Treat as public; never privileged credentials |
| `.env.example` | Names, placeholders and safe defaults only |

Local example (replace placeholders only in ignored local files):

```dotenv
KOKPIT_OWNER_EMAIL=owner@example.com
KOKPIT_DEFAULT_TIMEZONE=Asia/Jakarta
KOKPIT_ENVIRONMENT=development
QUOTE_AI_MODEL=<model-name>
NEWS_AI_MODEL=<model-name>
```

Owner email is configured rather than baked into code; D1 owner and Access policy refer to the same identity.
`QUOTE_AI_MODEL` / `NEWS_AI_MODEL` centralize model choice; one model may serve both when suitable.
Do not expose API tokens, R2 credentials, Access secrets or production values in Git/source/README/examples.
Workers AI binding does not require a frontend AI key.

## 3. First resource setup: only within authorized Milestone 8 work

Authenticate and confirm account before creating remote resources:

```bash
npx wrangler login
npx wrangler whoami
npx wrangler d1 create kokpit-db
npx wrangler d1 list
npx wrangler r2 bucket create kokpit-files
npx wrangler r2 bucket list
```

Record reproducible resource names/IDs in the proper config; keep secret values out of it.
Bindings are `env.DB`, `env.R2`, `env.AI`. Never make R2 public or use a public bucket domain
as the normal delivery path. Preview resources, if added, must not point at production storage.

Production secret example:

```bash
npx wrangler secret put SOME_SECRET
```

## 4. Migrations and seed

Canonical flow: Data Model → Drizzle schema → generated migration → SQL inspection → local apply → tests → remote apply.
Configure Wrangler's migration directory/pattern to discover the generated files.
Use version-controlled migrations; do not edit production tables manually or rewrite applied history.

```bash
npx wrangler d1 migrations apply kokpit-db --local
# Only after review, local validation and explicit target confirmation:
npx wrangler d1 migrations apply kokpit-db --remote
```

Before remote apply, confirm account, database, migration order, compatibility and destructive impact.
Risky/destructive changes require owner review and a recovery/export plan before execution.
If migration fails, stop schema work, inspect the failed migration and previous state;
never force a half-migrated production database manually.

Idempotent production seed creates only one owner, settings, approved source registry and small emergency quote pool.
No fake ideas, courses, tracks, playlists or files. Isolate development/test fixtures.

## 5. Access and launch sequence

1. Create D1/R2, configure bindings/AI, validate local migrations and apply reviewed production migrations.
2. Seed required owner/settings/source/fallback records.
3. Deploy the validated Worker + frontend; configure the owner's chosen production hostname.
4. Configure Cloudflare Access, verify protection and check Cron Triggers.
5. Run production smoke tests and inspect logs before storing private content.

Preferred hostname: `kokpit.<owned-domain>`. Avoid a second unprotected production hostname;
Access must cover every reachable frontend, API and file/audio route.
Create a self-hosted/web Access application: **deny by default, allow only owner identity**.
Allowed email with One-Time PIN or configured identity provider is sufficient; do not build another V1 login screen.

Access does not replace owner resolution, resource ownership, Zod validation or private storage.
Verify owner browser is allowed and incognito/different session is challenged or denied.
Do not upload private files until both Access and ownership behavior have been verified.

## 6. Scheduled content

Recommended base Cron is `*/30 * * * *` (UTC). The shared `scheduled()` handler refreshes news,
refills quotes only below threshold and runs stale-content cleanup at its selected maintenance window.
Multiple cron expressions are acceptable if clearer; separate Workers are unnecessary without a real need.

Quote selection uses `user_settings.timezone` and local clock-hour boundaries, independent of UTC Cron timing.
Keep same-hour selection stable; no AI inference on page loads. Refill in batches and preserve cached fallback.
News retention is configurable (suggested 30–60 days, initial plan roughly 45); filter first, enrich top-N optionally.
AI handles only quotes and optional news enrichment, never private user ideas/documents/files/history.

Test exported job functions directly in local/test environments; do not expose an unsecured `/api/run-all-crons`.
Any eventual production manual trigger requires explicit protection.
Verify quote pool generation/fallback, source registry, normalized news and isolation of source failures.

## 7. Routine deployment gate

- [ ] Review working tree, changed docs, secret exposure and fake production data.
- [ ] Install intentional dependency changes; lint, typecheck, relevant tests and build pass.
- [ ] Review migrations, apply locally, confirm remote target and recovery plan if needed.
- [ ] Test changed file behavior, ownership, private R2 and scheduled jobs.
- [ ] Preview SPA/API/assets and changed UI; never deploy known failures.
- [ ] Apply approved migrations, deploy, inspect logs and smoke-test changes.

Future package deployment script is `npm run build && wrangler deploy`; until it exists,
use the project-defined build/deploy procedure rather than claiming `npm run deploy` is available.
Manual owner deployment is acceptable when scripted, repeatable and validated.
`main` is recommended as production-ready; do not deploy arbitrary broken branches.
Optional future CI runs install/checks/build/deploy and stores scoped credentials in CI secrets, never Git.
Agents follow the owner's manual staging/commit/push policy.

## 8. Production smoke test

| Area | Verify |
|---|---|
| Access | Owner allowed; unauthenticated frontend, API and media blocked |
| Home | Loads; clock and quote work |
| Ideas / Library | Idea create/edit/delete; link create/open |
| College | Semester/course/week creation; material upload/open/delete |
| Music | Upload/play/seek; music continues during navigation; playlist flow |
| News | Feed, source links, cached content; one failed source does not break others |
| Storage/jobs | D1, private R2, quote refill, news ingestion and Cron active |

Lightweight `GET /api/system/health` may return `{"status":"ok"}`.
Never expose resource IDs, secrets or internal config, or perform expensive writes/AI inference there.
An internal D1/R2 readiness check may be added only when useful.

## 9. Logs, recovery and costs

Log unexpected API/R2/source/job/migration/deployment failures using native Worker logs.
News summaries: source, fetched/accepted/duplicate/failure counts, duration.
Quote summaries: pool sizes, generated/rejected/accepted counts, model, duration.
Never log private idea/document content, article bodies, audio bytes, tokens, signed URLs or secrets.

| Incident | Response |
|---|---|
| Deploy failure | Inspect build/Wrangler output, bindings, IDs, migration state and compatibility date; fix locally, redeploy deliberately. |
| Broken Worker | Deploy last known-good Git revision; verify schema compatibility first. |
| Schema regression | Code rollback does not restore schema. Prefer additive migrations; use the reviewed recovery plan. |
| R2 deletion/replacement | Validate ownership and exact target key; avoid wildcard deletion. Delete old files only after replacement is committed. |
| Security exposure | Disable affected functionality/exposure first, then reproduce, repair in repo, validate and deploy. |

R2 deletion may be irreversible. Retry partial cleanup safely; avoid duplicate/orphaned objects.
Recovery baseline: Git remote, D1 native recovery/export, R2 inventory and critical config.
Export/backup before risky migrations or architecture changes; more automation can follow growing data volume.
Persistent dashboard changes must be reflected in reproducible repository config/docs; avoid untracked live edits.
Watch Worker/D1/R2/AI/external API usage; cache, batch, schedule and avoid duplicate processing.
Deployment is complete only when private access, routes, storage, media, content jobs and smoke checks pass,
and repository configuration matches production.
