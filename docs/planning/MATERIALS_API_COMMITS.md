# Package 4.3 manual commits

Run these from the repository root after reviewing the changes. Each commit stages exactly
one file; the commands below have not been executed by the agent. Keep the index empty
before starting so previously staged changes do not enter an unrelated commit.

These granular commits form one package; validate the complete sequence before pushing.
The generated migration and its metadata belong to the same final migration state.

```powershell
git add -- worker/providers/storage/r2.provider.ts
git commit -m "Add private R2 streaming storage provider"

git add -- worker/utils/material-file.ts
git commit -m "Validate material types and streamed file sizes"

git add -- worker/utils/file-response.ts
git commit -m "Add safe private file headers and range parsing"

git add -- worker/db/repositories/materials.repository.ts
git commit -m "Add owner-scoped material repository"

git add -- worker/services/materials.service.ts
git commit -m "Implement material storage and metadata coordination"

git add -- worker/api/materials.routes.ts
git commit -m "Expose validated material and private file APIs"

git add -- worker/index.ts
git commit -m "Register College material and file routes"

git add -- wrangler.jsonc
git commit -m "Bind R2 storage for isolated local development"

git add -- worker-configuration.d.ts
git commit -m "Regenerate Worker types with R2 binding"

git add -- worker/env.ts
git commit -m "Derive Worker bindings from generated Cloudflare types"

git add -- worker/db/schema/college.ts
git commit -m "Index owner material recency and cursor ordering"

git add -- drizzle/migrations/0001_sloppy_phil_sheldon.sql
git commit -m "Add material recency index migration"

git add -- drizzle/migrations/meta/0001_snapshot.json
git commit -m "Record material index schema snapshot"

git add -- drizzle/migrations/meta/_journal.json
git commit -m "Register material index migration in journal"

git add -- tests/helpers/mock-d1.ts
git commit -m "Apply all local migrations in D1 test fixtures"

git add -- tests/helpers/mock-r2.ts
git commit -m "Add isolated R2 test storage and failure injection"

git add -- tests/unit/material-file.test.ts
git commit -m "Test streamed material limits and file response rules"

git add -- tests/integration/materials-api.test.ts
git commit -m "Test material ownership APIs and storage recovery"

git add -- tests/runtime/materials.test.mjs
git commit -m "Verify material APIs in native Workers D1 and R2 runtime"

git add -- package.json
git commit -m "Add native material storage verification command"

git add -- docs/features/COLLEGE_MATERIALS.md
git commit -m "Document material API upload delivery and recovery contracts"

git add -- docs/engineering/DATA_MODEL.md
git commit -m "Document implemented material recency index"

git add -- docs/engineering/ARCHITECTURE.md
git commit -m "Document private material streaming architecture"

git add -- docs/engineering/DEPLOYMENT.md
git commit -m "Document local R2 setup and storage verification"

git add -- docs/engineering/FILE_STRUCTURE.md
git commit -m "Map material backend modules and runtime tests"

git add -- docs/features/APPROVED_UI_FEATURES.md
git commit -m "Update approved feature contract after material APIs"

git add -- docs/planning/IMPLEMENTATION_PLAN.md
git commit -m "Mark package 4.3 verified and identify package 4.4 next"

git add -- README.md
git commit -m "Update project status and material verification guidance"

git add -- docs/planning/MATERIALS_API_COMMITS.md
git commit -m "Document granular manual commits for package 4.3"
```
