# Package 4.4 manual commits

Run from the repository root after reviewing the complete package. Keep the Git index empty
before starting so existing staged files do not enter an unrelated commit. Each pair below
stages and commits one file. The agent has not executed these commands.

Intermediate commits may depend on later files; validate the complete sequence before pushing.
No migration, dependency, production resource or schedule change belongs to this package.

```powershell
git add -- worker/db/repositories/materials.repository.ts
git commit -m "Add bounded material cleanup queries and shared key protection"

git add -- worker/db/repositories/college.repository.ts
git commit -m "Check descendant ownership before hierarchy cleanup"

git add -- worker/services/materials.service.ts
git commit -m "Coordinate private object and material metadata deletion"

git add -- worker/services/college.service.ts
git commit -m "Clean owned materials before hierarchy deletion"

git add -- worker/api/college.routes.ts
git commit -m "Wire material cleanup into College deletion routes"

git add -- worker/api/materials.routes.ts
git commit -m "Expose validated owner-scoped material deletion"

git add -- src/features/college/types.ts
git commit -m "Define safe frontend material contracts"

git add -- src/features/college/api/materials-api.ts
git commit -m "Add frontend material upload metadata and list clients"

git add -- src/features/college/api/use-materials.ts
git commit -m "Add paginated material queries and synchronized mutations"

git add -- src/features/college/api/use-college.ts
git commit -m "Refresh College reads after partial deletion failures"

git add -- src/features/college/components/CollegeLayout.tsx
git commit -m "Explain partial cleanup and support material form errors"

git add -- src/features/college/components/MaterialEditors.tsx
git commit -m "Add file link and material destination forms"

git add -- src/features/college/components/MaterialFileDialog.tsx
git commit -m "Check private files before showing open and download actions"

git add -- src/features/college/components/MaterialList.tsx
git commit -m "Add accessible material rows and confirmed deletion"

git add -- src/features/college/components/MaterialWorkspace.tsx
git commit -m "Add week full semester and recent material surfaces"

git add -- src/features/college/pages/WeekPage.tsx
git commit -m "Replace week material placeholder with working controls"

git add -- src/features/college/pages/CollegePage.tsx
git commit -m "Show recent materials and selected semester material view"

git add -- tests/integration/materials-api.test.ts
git commit -m "Verify material cleanup ownership and partial failure recovery"

git add -- tests/integration/college-api.test.ts
git commit -m "Verify hierarchy safety with unavailable material storage"

git add -- tests/e2e/materials-regressions.mjs
git commit -m "Verify material UI downloads pagination and cleanup recovery"

git add -- tests/e2e/college-regressions.mjs
git commit -m "Update deep link coverage for available material controls"

git add -- tests/unit/college-frontend.test.ts
git commit -m "Verify failed deletion retains and invalidates cached College data"

git add -- tests/runtime/materials.test.mjs
git commit -m "Verify material and hierarchy deletion in native R2 runtime"

git add -- docs/features/COLLEGE_MATERIALS.md
git commit -m "Document material UI deletion retry and verification contracts"

git add -- docs/features/APPROVED_UI_FEATURES.md
git commit -m "Record delivered recent and full College material views"

git add -- docs/engineering/ARCHITECTURE.md
git commit -m "Document material UI and coordinated deletion architecture"

git add -- docs/engineering/DATA_MODEL.md
git commit -m "Document implemented material deletion lifecycle"

git add -- docs/engineering/FILE_STRUCTURE.md
git commit -m "Map College material components and HTTP browser fixtures"

git add -- docs/planning/IMPLEMENTATION_PLAN.md
git commit -m "Mark package 4.4 delivered and identify schedule work next"

git add -- README.md
git commit -m "Update College material delivery status and next package"

git add -- docs/planning/MATERIALS_UI_COMMITS.md
git commit -m "Document granular manual commits for package 4.4"
```
