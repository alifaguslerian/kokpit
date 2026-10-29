# Packages 3.4–3.5 manual commits

Run from the repository root after reviewing the complete package. Start with an empty Git
index so unrelated staged files cannot enter these commits. Each pair stages and commits
exactly one file. The agent has not executed staging, commits or pushes.

Intermediate commits depend on other files in this package; validate the complete sequence
before pushing. Reviewed migration 0003 is applied locally only. These commands do not deploy
or migrate production. They cover the combined 3.4 API and 3.5 UI package boundary.

```powershell
git add -- worker/db/schema/ideas.ts
git commit -m "Define Ideas collections favorites and private cover metadata"

git add -- drizzle/migrations/0003_spicy_odin.sql
git commit -m "Add compatible Ideas collections and cover migration"

git add -- drizzle/migrations/meta/0003_snapshot.json
git commit -m "Record the extended Ideas schema snapshot"

git add -- drizzle/migrations/meta/_journal.json
git commit -m "Register the additive Ideas migration"

git add -- worker/middleware/same-origin.ts
git commit -m "Guard private Ideas writes against foreign origins"

git add -- worker/db/repositories/idea-collections.repository.ts
git commit -m "Add bounded collections and atomic JSON based ordering"

git add -- worker/services/idea-collections.service.ts
git commit -m "Normalize and manage owned Ideas collections"

git add -- worker/api/idea-collections.routes.ts
git commit -m "Expose validated collection management endpoints"

git add -- worker/utils/idea-cover.ts
git commit -m "Validate private image bytes dimensions and stream limits"

git add -- worker/utils/idea-cover-upload.ts
git commit -m "Stream a bounded single image multipart upload"

git add -- worker/db/repositories/idea-covers.repository.ts
git commit -m "Guard private cover metadata changes and shared keys"

git add -- worker/services/idea-covers.service.ts
git commit -m "Coordinate cover replacement deletion and recovery"

git add -- worker/db/repositories/ideas.repository.ts
git commit -m "Add owned Ideas filters favorites and guarded deletion"

git add -- worker/services/ideas.service.ts
git commit -m "Validate collection membership and coordinate cover cleanup"

git add -- worker/api/ideas.routes.ts
git commit -m "Expose favorite collection and private cover operations"

git add -- worker/index.ts
git commit -m "Register Ideas collection routes"

git add -- src/features/ideas/types.ts
git commit -m "Add collection favorite and cover client contracts"

git add -- src/features/ideas/api/ideas-api.ts
git commit -m "Support Ideas filters and desired favorite state"

git add -- src/features/ideas/api/use-ideas.ts
git commit -m "Synchronize Ideas previews and guard cross view mutations"

git add -- src/features/ideas/api/use-idea-collections.ts
git commit -m "Fetch complete collection pages and manage mutations"

git add -- src/features/ideas/components/IdeaComposer.tsx
git commit -m "Add optional ruled paper styling for Ideas capture"

git add -- src/features/ideas/components/IdeaCard.tsx
git commit -m "Render ordered idea cards with independent pin and star actions"

git add -- src/features/ideas/components/IdeaCoverEditor.tsx
git commit -m "Add private image upload replace and remove controls"

git add -- src/features/ideas/components/CollectionManager.tsx
git commit -m "Manage complete Ideas collections with keyboard ordering"

git add -- src/features/ideas/components/IdeaEditModal.tsx
git commit -m "Edit collections and covers without overwriting concurrent flags"

git add -- src/features/ideas/components/IdeasFilterBar.tsx
git commit -m "Expose canonical tag and search filters in the Ideas grid"

git add -- src/features/ideas/pages/IdeasPage.tsx
git commit -m "Compose approved Ideas panels with URL filters and safe editors"

git add -- src/features/library/components/QuickLinkIcon.tsx
git commit -m "Render recognizable shortcut icons within existing contracts"

git add -- src/features/library/components/QuickLinkCard.tsx
git commit -m "Polish functional Library portal tiles and menus"

git add -- src/features/library/pages/LibraryPage.tsx
git commit -m "Align Library with approved grid and preserve filtered ordering"

git add -- tests/unit/idea-cover.test.ts
git commit -m "Test image container dimensions and streaming boundaries"

git add -- tests/integration/idea-extensions.test.ts
git commit -m "Verify Ideas ownership filters cover recovery and D1 limits"

git add -- tests/integration/ideas-migration.test.ts
git commit -m "Verify legacy Ideas survive the additive migration"

git add -- tests/integration/backend-regressions.test.ts
git commit -m "Keep legacy Ideas fixtures compatible with additive columns"

git add -- tests/integration/foundation.test.ts
git commit -m "Include approved Ideas collections in schema verification"

git add -- tests/integration/materials-api.test.ts
git commit -m "Align table counts with the Ideas migration"

git add -- tests/e2e/idea-extensions.mjs
git commit -m "Verify approved Ideas Library flows and mutation races"

git add -- tests/e2e/audit-regressions.mjs
git commit -m "Keep audit flows aligned with approved menus and request origins"

git add -- tests/e2e/stitch-visual-regressions.mjs
git commit -m "Verify approved Ideas grid and Library portal composition"

git add -- tests/runtime/materials.test.mjs
git commit -m "Verify private Ideas covers in native Workers D1 and R2"

git add -- docs/features/IDEAS_COLLECTIONS_AND_COVERS.md
git commit -m "Document Ideas contracts private cover recovery and verification"

git add -- docs/features/COLLEGE_SCHEDULE.md
git commit -m "Keep College schema counts and next steps aligned with Ideas delivery"

git add -- docs/features/APPROVED_UI_FEATURES.md
git commit -m "Record delivered Ideas and Library controls"

git add -- docs/engineering/DATA_MODEL.md
git commit -m "Document the implemented nineteen table schema"

git add -- docs/engineering/ARCHITECTURE.md
git commit -m "Record implemented private Ideas extensions"

git add -- docs/engineering/FILE_STRUCTURE.md
git commit -m "Map Ideas collections covers and verification modules"

git add -- docs/engineering/DEPLOYMENT.md
git commit -m "Record local Ideas migration and operational recovery boundaries"

git add -- docs/planning/IMPLEMENTATION_PLAN.md
git commit -m "Complete packages 3.4 and 3.5 and identify Music as next"

git add -- README.md
git commit -m "Update project completion and Ideas capabilities"

git add -- docs/planning/IDEAS_LIBRARY_COMMITS.md
git commit -m "Provide granular manual commits for Ideas and Library"
```

