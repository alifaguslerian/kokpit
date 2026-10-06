# Kokpit — Deployment

**Version:** 0.1  
**Status:** V1 Deployment Draft  
**Product:** Kokpit  
**Platform:** Cloudflare  
**Deployment Model:** Cloudflare Worker + Static Assets  
**Database:** Cloudflare D1  
**Object Storage:** Cloudflare R2  
**Private Access:** Cloudflare Access  
**Scheduled Jobs:** Cloudflare Cron Triggers  
**Optional AI:** Cloudflare Workers AI  
**Last Updated:** 2026-10-06

---

# 1. Purpose

This document defines how Kokpit V1 is configured, deployed, protected, migrated, verified, and operated on Cloudflare.

It covers:

- local development
- Cloudflare authentication
- Worker configuration
- D1 setup
- R2 setup
- Workers AI binding
- Cron Trigger setup
- environment variables and secrets
- production deployment
- Cloudflare Access
- custom domain setup
- database migration procedure
- rollback and recovery
- post-deployment smoke testing
- operational rules

This document does not redefine application architecture.

Architecture belongs in:

```txt
docs/engineering/ARCHITECTURE.md
```

---

# 2. Deployment Principles

Kokpit V1 deployment should remain:

```txt
simple
private
reproducible
low-cost
version-controlled
Cloudflare-native
```

Production should not require:

```txt
VPS
Docker
always-running Node server
manual file copying
manual database editing
```

---

# 3. Deployment Architecture

Production request flow:

```txt
Browser
   │
   ▼
Cloudflare Access
   │
   ▼
Cloudflare Worker
   ├── Static React assets
   ├── Hono API
   ├── D1 binding
   ├── R2 binding
   └── Workers AI binding
```

Background flow:

```txt
Cloudflare Cron
   │
   ▼
scheduled() Worker handler
   ├── refresh news
   ├── refill quotes
   └── cleanup stale content
```

---

# 4. Production Resources

Recommended production resource names:

```txt
Worker:
kokpit

D1:
kokpit-db

R2:
kokpit-files
```

Optional preview names:

```txt
kokpit-preview
kokpit-db-preview
kokpit-files-preview
```

V1 does not require a full staging environment by default.

---

# 5. Required Local Software

Install:

```txt
Node.js
npm
Git
```

Project-local dependencies should provide:

```txt
Vite
Wrangler
Cloudflare Vite plugin
Drizzle
Drizzle Kit
```

Prefer running Wrangler through:

```bash
npx wrangler
```

or package scripts.

Do not depend on a globally installed Wrangler version.

---

# 6. Cloudflare Authentication

Before creating remote resources:

```bash
npx wrangler login
```

Verify authentication:

```bash
npx wrangler whoami
```

Do not store Cloudflare API tokens directly in repository files.

For local interactive development, Wrangler login is preferred.

For CI/CD later, use scoped secrets configured in the CI platform.

---

# 7. Local Development

Primary command:

```bash
npm run dev
```

The Cloudflare Vite integration should run Worker code inside the Workers runtime environment while also serving the React frontend.

Expected local capabilities:

```txt
React development
Worker API
local D1
local R2 emulation
HMR
typed bindings
```

---

# 8. Local vs Production Data

Local development must not casually use production data.

Default:

```txt
local D1
local R2
```

Production:

```txt
remote D1
remote R2
```

Do not use remote production bindings just because local setup is temporarily inconvenient.

---

# 9. Environment Files

Recommended local file:

```txt
.dev.vars
```

This file must be ignored by Git.

Example:

```txt
KOKPIT_OWNER_EMAIL=owner@example.com
KOKPIT_DEFAULT_TIMEZONE=Asia/Jakarta
KOKPIT_ENVIRONMENT=development
QUOTE_AI_MODEL=<model-name>
```

Never put actual production secrets in:

```txt
.env.example
README.md
source code
Git history
```

---

# 10. `.env.example`

Repository may include:

```txt
.env.example
```

Example:

```txt
KOKPIT_OWNER_EMAIL=
KOKPIT_DEFAULT_TIMEZONE=Asia/Jakarta
KOKPIT_ENVIRONMENT=development
QUOTE_AI_MODEL=
```

This file contains names and safe defaults only.

---

# 11. Worker Configuration

Primary configuration file:

```txt
wrangler.jsonc
```

Use JSONC rather than mixing multiple Wrangler config formats.

Conceptual production configuration:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",

  "name": "kokpit",
  "main": "./worker/index.ts",
  "compatibility_date": "2026-10-06",

  "assets": {
    "not_found_handling": "single-page-application"
  },

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kokpit-db",
      "database_id": "<D1_DATABASE_ID>",
      "migrations_dir": "drizzle/migrations"
    }
  ],

  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "kokpit-files"
    }
  ],

  "ai": {
    "binding": "AI"
  },

  "vars": {
    "KOKPIT_ENVIRONMENT": "production",
    "KOKPIT_DEFAULT_TIMEZONE": "Asia/Jakarta"
  },

  "triggers": {
    "crons": [
      "*/30 * * * *"
    ]
  }
}
```

This is a structural example.

The actual generated configuration must match the Cloudflare Vite plugin and current project setup.

---

# 12. Compatibility Date

Use a recent tested Cloudflare Workers compatibility date.

Example:

```txt
2026-10-06
```

Do not automatically update compatibility date in the same change as unrelated features.

A compatibility-date update should be treated as an infrastructure change and tested.

---

# 13. Static Assets

Kokpit uses:

```txt
Cloudflare Workers Static Assets
```

with the Cloudflare Vite plugin.

Do not use legacy:

```txt
Workers Sites
```

The frontend and Worker should deploy as one logical unit.

The Vite integration may generate final deployment configuration during build.

Do not manually hardcode output asset paths unless required by the actual project configuration.

---

# 14. SPA Routing

Kokpit uses client-side React routing.

Static asset configuration must support SPA fallback.

Conceptually:

```jsonc
{
  "assets": {
    "not_found_handling": "single-page-application"
  }
}
```

This ensures routes such as:

```txt
/college
/music
/news
/ideas
/library
```

can load directly without returning a static 404.

API routes must still be handled by the Worker.

---

# 15. D1 — Create Production Database

Create:

```bash
npx wrangler d1 create kokpit-db
```

Wrangler returns a database ID.

Copy that ID into the appropriate D1 binding in:

```txt
wrangler.jsonc
```

Do not confuse:

```txt
database_name
database_id
binding
```

Recommended binding:

```txt
DB
```

---

# 16. D1 Binding

Conceptual configuration:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kokpit-db",
      "database_id": "<DATABASE_ID>",
      "migrations_dir": "drizzle/migrations"
    }
  ]
}
```

Worker code accesses:

```txt
env.DB
```

---

# 17. Local D1 Migrations

Apply migrations locally before production:

```bash
npx wrangler d1 migrations apply kokpit-db --local
```

If Drizzle generates migration files in the documented migration directory, verify Wrangler can discover them using the configured migration path/pattern.

Do not apply an untested migration directly to production.

---

# 18. Production D1 Migrations

After local verification:

```bash
npx wrangler d1 migrations apply kokpit-db --remote
```

Before applying:

```txt
review generated SQL
confirm target database
confirm migration order
check destructive changes
```

For a destructive or risky migration:

```txt
STOP
review backup/recovery plan
```

---

# 19. Migration Source of Truth

Database schema flow:

```txt
DATA_MODEL.md
      ↓
Drizzle schema
      ↓
generated migration
      ↓
local apply
      ↓
tests
      ↓
production apply
```

Do not manually edit production D1 tables through the dashboard as the normal workflow.

---

# 20. D1 Seed

Production seed should create only necessary initial application data.

Recommended:

```txt
owner user
user settings
news sources
small emergency quote fallback pool
```

Do not seed:

```txt
fake ideas
fake courses
fake tracks
demo playlists
fake personal files
```

Seed logic should be idempotent.

---

# 21. Owner Configuration

V1 uses one owner.

Owner identity should be provided through environment configuration rather than being baked into code.

Example:

```txt
KOKPIT_OWNER_EMAIL
```

The database owner record and Cloudflare Access allow policy should refer to the same actual owner identity.

---

# 22. R2 — Create Production Bucket

Create:

```bash
npx wrangler r2 bucket create kokpit-files
```

Verify:

```bash
npx wrangler r2 bucket list
```

Do not make the bucket publicly accessible.

---

# 23. R2 Binding

Conceptual:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "kokpit-files"
    }
  ]
}
```

Worker code accesses:

```txt
env.R2
```

The application controls access.

---

# 24. R2 Privacy

Production rule:

```txt
bucket remains private
```

Do not configure a public development URL or custom public bucket domain as the normal Kokpit file-access path.

College files and music are delivered through authenticated application logic.

---

# 25. Preview R2

If remote preview development is introduced later, use a separate preview bucket.

Example:

```jsonc
{
  "binding": "R2",
  "bucket_name": "kokpit-files",
  "preview_bucket_name": "kokpit-files-preview"
}
```

Do not point preview development at the production bucket.

---

# 26. Workers AI Binding

Workers AI configuration:

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

Worker access:

```txt
env.AI
```

Workers AI is used only for approved content features such as:

```txt
quote generation
optional news enrichment
```

It is not required for core Kokpit rendering.

---

# 27. Workers AI Model Configuration

Do not hardcode the model throughout application code.

Use configuration such as:

```txt
QUOTE_AI_MODEL
NEWS_AI_MODEL
```

If one efficient model serves both safely, they may point to the same model.

Model changes should not require database or frontend changes.

---

# 28. Workers AI Development Note

Workers AI uses Cloudflare-hosted inference.

Local application development may therefore still invoke a remote Cloudflare AI service when the AI binding is used.

Avoid repeatedly triggering AI generation during development.

Use:

```txt
cached fixtures
provider mocks
manual job invocation
```

where practical.

---

# 29. Cron Triggers

Kokpit background jobs use Cloudflare Cron Triggers.

Primary scheduled responsibilities:

```txt
news refresh
quote refill
content cleanup
```

---

# 30. Cron Strategy

News requires frequent execution.

Recommended base cron:

```txt
*/30 * * * *
```

Meaning:

```txt
every 30 minutes
```

The scheduled handler can decide which internal jobs should run on each invocation.

This allows one Worker deployment to manage multiple scheduled responsibilities without unnecessary separate Workers.

---

# 31. Internal Job Scheduling

Not every internal job needs to execute every 30 minutes.

Example:

```txt
every scheduled invocation:
    refresh news

if quote pool below threshold:
    refill quotes

if current UTC run matches cleanup window:
    cleanup stale content
```

Alternative:

Use multiple cron expressions if implementation remains clearer.

Do not create separate Worker deployments unless there is a real operational reason.

---

# 32. Cron Timezone

Cloudflare Cron expressions are evaluated in UTC.

User-facing quote rotation uses:

```txt
user_settings.timezone
```

Therefore:

```txt
Cron schedule timezone
!=
quote display timezone
```

Do not calculate hourly quote changes from cron execution time.

---

# 33. Secrets

Sensitive values should use Wrangler secrets or equivalent Cloudflare secret configuration.

Example command:

```bash
npx wrangler secret put SOME_SECRET
```

Potential future secrets:

```txt
third-party API credentials
provider tokens
private integration credentials
```

The Workers AI binding itself does not require exposing an API key to the frontend.

---

# 34. Non-Secret Variables

Safe runtime configuration may live under Wrangler `vars`.

Examples:

```txt
KOKPIT_ENVIRONMENT
KOKPIT_DEFAULT_TIMEZONE
QUOTE_AI_MODEL
NEWS_RETENTION_DAYS
```

Do not put values in `vars` merely because it is convenient if they are actually secret.

---

# 35. Type Generation

After changing Cloudflare bindings, regenerate Worker types when the project uses generated binding types.

Typical command:

```bash
npx wrangler types
```

Then run:

```bash
npm run typecheck
```

Do not leave `env` bindings untyped.

---

# 36. Build

Production build:

```bash
npm run build
```

Expected responsibilities:

```txt
build React client
build Worker
prepare static assets
generate deployment output
```

Build must succeed before deploy.

---

# 37. Preview

Before production deployment:

```bash
npm run preview
```

or the project-defined preview command.

Verify:

```txt
SPA routing
API routing
static assets
critical UI
```

Preview does not replace production smoke testing.

---

# 38. Deploy

Recommended package script:

```json
{
  "scripts": {
    "deploy": "npm run build && wrangler deploy"
  }
}
```

Deploy with:

```bash
npm run deploy
```

Do not deploy with known:

```txt
lint failures
type errors
migration mismatches
failing critical tests
```

---

# 39. Pre-Deploy Checklist

Before every production deploy:

```txt
[ ] git working tree reviewed
[ ] relevant docs updated
[ ] lint passes
[ ] typecheck passes
[ ] tests pass
[ ] build passes
[ ] migrations reviewed
[ ] local migrations applied
[ ] production migration target confirmed
[ ] no secrets in diff
[ ] no fake production data
[ ] R2 behavior tested if changed
[ ] content jobs tested if changed
```

---

# 40. Recommended Deployment Order

For first production launch:

```txt
1. create D1
2. create R2
3. configure wrangler bindings
4. configure Workers AI binding
5. apply production D1 migrations
6. seed owner + settings + source registry
7. deploy Worker + frontend
8. configure custom hostname/domain
9. configure Cloudflare Access
10. verify Access protection
11. verify Cron Triggers
12. run production smoke test
```

Do not upload private files before Access and ownership behavior have been verified.

---

# 41. Custom Domain

Recommended production address:

```txt
kokpit.<owned-domain>
```

or another private subdomain chosen by the owner.

The application should remain behind Cloudflare.

Avoid exposing a second unprotected production hostname if possible.

---

# 42. Cloudflare Access

Kokpit V1 must be protected by Cloudflare Access.

Access acts before the application and checks identity/policy before allowing access.

Create a self-hosted/web application for the Kokpit hostname.

Policy:

```txt
default:
deny

allow:
owner identity only
```

---

# 43. Access Identity

Simplest V1 option:

```txt
allow specific owner email
```

Authentication may use:

```txt
One-Time PIN
configured identity provider
```

The exact login method may depend on the Cloudflare account configuration.

Do not build a second custom login screen for V1.

---

# 44. Access Coverage

Access protection must cover:

```txt
/
all frontend routes
/api/*
private file routes
music stream routes
```

Do not protect only the Home page while leaving API endpoints publicly reachable.

---

# 45. Cloudflare Access Is Not Authorization

Access verifies that a permitted identity reached the application.

Application code must still:

```txt
resolve owner context
validate resource ownership
validate input
keep R2 private
```

Do not remove ownership checks because Access exists.

---

# 46. Access Verification

Test from:

```txt
authenticated owner browser
incognito/private window
different browser session
```

Expected:

```txt
owner
→ allowed

unauthenticated visitor
→ Access challenge / denied
```

---

# 47. Initial Content Bootstrap

After production deployment:

## Quotes

Ensure:

```txt
emergency fallback exists
quote refill job can execute
quote pool fills successfully
```

## News

Ensure:

```txt
source registry exists
news refresh runs successfully
normalized articles appear
one failed source does not break others
```

---

# 48. Manual Scheduled Job Testing

Scheduled job logic should be callable in local/test environments without waiting for real cron time.

Preferred:

```txt
export job functions independently
test them directly
```

Do not expose an unsecured public production endpoint such as:

```txt
/api/run-all-crons
```

If a production manual trigger is ever needed, protect it explicitly.

---

# 49. Production Smoke Test

Immediately after deployment verify:

```txt
Home loads

clock works

quote loads

Ideas:
create
edit
delete

Library:
create link
open link

College:
create semester
create course
create week
upload material
open material
delete material

Music:
upload track
play
seek
navigate route while playing
playlist basic flow

News:
feed loads
source links open
cached data works

Access:
unauthenticated request blocked
```

---

# 50. Health Endpoint

Recommended:

```txt
GET /api/system/health
```

Response should remain lightweight.

Potential result:

```json
{
  "status": "ok"
}
```

Do not expose:

```txt
database credentials
resource IDs
secret values
internal configuration
```

---

# 51. Readiness Checks

A separate internal readiness check may test:

```txt
D1 query
R2 binding
```

if genuinely useful.

Do not make a public health endpoint perform expensive writes or AI inference.

---

# 52. Logging

Use Cloudflare Worker logs for V1 operational debugging.

Log:

```txt
unexpected API errors
scheduled job result
news source failures
quote generation failures
R2 operation failures
migration/deployment issues
```

Do not log:

```txt
private idea body
college document content
music bytes
authentication token
secret
```

---

# 53. News Job Logging

Useful summary:

```txt
source
fetched count
accepted count
duplicate count
failure count
duration
```

Avoid logging complete article bodies.

---

# 54. Quote Job Logging

Useful summary:

```txt
pool size before
generated count
rejected count
accepted count
pool size after
model identifier
duration
```

Do not log private user data into AI job logs.

---

# 55. Deployment Failure

If application deploy fails:

```txt
do not repeatedly mutate production resources blindly
```

Check:

```txt
build output
wrangler error
binding names
database IDs
migration state
compatibility date
```

Fix locally, then redeploy.

---

# 56. Migration Failure

If production migration fails:

```txt
STOP application schema work
inspect the failed migration
verify previous migration state
```

Do not manually force the database into a half-migrated state.

Cloudflare D1 migration tooling should remain the normal migration mechanism.

---

# 57. Rollback — Application Code

If a newly deployed Worker is broken:

Preferred response:

```txt
deploy the last known-good Git revision
```

Do not fix production directly from the Cloudflare dashboard and leave Git behind.

Git remains the code source of truth.

---

# 58. Rollback — Database

Database rollback is more sensitive than code rollback.

Never assume:

```txt
reverting Worker code
=
reverting schema safely
```

For destructive schema changes:

```txt
plan recovery before deploy
```

Prefer additive migrations where possible.

---

# 59. R2 Recovery

Deleting an R2 object may be irreversible depending on configured storage/recovery settings.

Therefore:

```txt
validate ownership
validate target key
avoid wildcard deletion logic
```

Bulk cleanup jobs require extra caution.

---

# 60. Backup Strategy

V1 should maintain a practical recovery strategy for:

```txt
D1 data
R2 inventory
critical configuration
Git repository
```

At minimum:

```txt
Git:
remote repository

D1:
Cloudflare-native recovery / export strategy

R2:
periodic inventory awareness
```

A more automated backup workflow can be added later if personal data volume grows.

---

# 61. Data Export

Before risky database migrations or major architecture changes, create a data export/backup where practical.

Do not rely solely on confidence in a migration script.

---

# 62. CI/CD

V1 may begin with manual deployment from the owner's machine.

Manual deployment is acceptable if:

```txt
repeatable
scripted
validated
```

Future CI/CD may automate:

```txt
install
lint
typecheck
test
build
deploy
```

Do not add CI complexity before it materially improves reliability.

---

# 63. GitHub Actions — Future Option

If automated deployment is later added:

```txt
push to main
→ checks
→ build
→ deploy
```

Production deployment secrets must be stored in GitHub Actions secrets or Cloudflare-supported secure integration.

Do not commit Cloudflare API tokens.

---

# 64. Production Branch

Recommended simple branch policy:

```txt
main
→ production-ready branch
```

Feature branches may be used during implementation.

Do not deploy arbitrary broken development branches to the primary production hostname.

---

# 65. Deployment Environments

V1 required:

```txt
local
production
```

Optional later:

```txt
preview
staging
```

Do not create staging infrastructure simply for appearance.

Add it when production risk justifies it.

---

# 66. Resource Naming Rules

Use consistent lowercase names.

Preferred:

```txt
kokpit
kokpit-db
kokpit-files
kokpit-preview
kokpit-db-preview
kokpit-files-preview
```

Avoid opaque random names unless Cloudflare generates IDs internally.

---

# 67. Production Configuration Drift

Cloudflare dashboard configuration and Git configuration can drift.

Whenever production configuration changes manually:

```txt
reflect persistent reproducible configuration in repository docs/config where applicable
```

Do not allow important deployment behavior to exist only in someone's memory.

---

# 68. No Dashboard-Only Architecture

The Cloudflare dashboard may be used for:

```txt
creating resources
Access policy setup
observing logs
reviewing usage
```

But architecture should remain reproducible from:

```txt
Git
wrangler config
migration files
deployment docs
```

---

# 69. Cost Guardrails

Kokpit is a private personal application.

Avoid unnecessary paid usage.

Watch:

```txt
Workers AI inference
R2 storage
D1 usage
Worker requests
external API usage
```

Primary cost strategy:

```txt
cache
batch
schedule
avoid duplicate processing
retain useful generated output
```

---

# 70. Quote Cost Guardrail

Do not:

```txt
generate quote per page load
```

Use:

```txt
batch refill
pool threshold
cached hourly selection
```

---

# 71. News Cost Guardrail

Do not:

```txt
AI-enrich every fetched article
```

Use:

```txt
rule-based filtering first
top-N AI enrichment second
```

---

# 72. R2 Cost Guardrail

Do not duplicate files unnecessarily.

If a file is replaced:

```txt
delete old object when replacement is safely committed
```

Avoid orphan accumulation.

---

# 73. Deployment Security Checklist

Before declaring production safe:

```txt
[ ] Cloudflare Access active
[ ] owner-only policy active
[ ] API covered by Access
[ ] R2 private
[ ] ownership checks active
[ ] no public storage URLs
[ ] no secrets in frontend
[ ] no secrets in Git
[ ] no stack traces in production
[ ] file validation active
[ ] upload size limit active
```

---

# 74. First Deployment Checklist

```txt
[ ] Cloudflare login works
[ ] production D1 created
[ ] production R2 created
[ ] bindings configured
[ ] Workers AI binding configured
[ ] local migrations pass
[ ] production migrations pass
[ ] owner seeded
[ ] project builds
[ ] Worker deploy succeeds
[ ] SPA routes work
[ ] API works
[ ] Access configured
[ ] unauthenticated access blocked
[ ] quote job works
[ ] news job works
[ ] material upload works
[ ] music stream works
[ ] production smoke test passes
```

---

# 75. Routine Deployment Checklist

For normal future deploys:

```txt
[ ] pull/review current main
[ ] install dependency changes
[ ] review docs impact
[ ] run lint
[ ] run typecheck
[ ] run relevant tests
[ ] run build
[ ] review migration changes
[ ] apply migration if required
[ ] deploy
[ ] inspect logs
[ ] smoke-test changed feature
```

---

# 76. Emergency Rule

Do not turn a production incident into an untracked live-edit session.

Preferred:

```txt
identify
reproduce if possible
fix in repository
validate
deploy
verify
```

For an urgent security issue:

```txt
disable affected functionality or Access exposure first
then repair cleanly
```

---

# 77. V1 Deployment Definition of Done

Deployment is complete when:

```txt
Kokpit is reachable on its production hostname

Cloudflare Access blocks unauthorized access

owner can authenticate

frontend routes work

Worker API works

D1 works

R2 upload/download works

music streaming works

quote system works

news refresh works

Cron Triggers are active

critical smoke tests pass

Git and production configuration match
```

---

# 78. Final Deployment Rule

Kokpit production should be boring.

Deployment should not depend on memory, improvisation, or hidden manual steps.

The target is:

```txt
documented
repeatable
private
recoverable
simple
```

The final deployment question is:

> Could the application be redeployed safely from the repository and this document alone?

If not, the deployment process is not documented well enough.
