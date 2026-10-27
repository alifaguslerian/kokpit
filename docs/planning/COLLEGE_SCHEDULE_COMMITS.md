# Package 4.5 manual commits

Run from the repository root after reviewing the complete package. Start with an empty Git
index so unrelated staged work cannot enter these commits. Each pair stages and commits
exactly one file. The agent has not executed any staging, commit or push command.

Intermediate commits depend on other files in this package. Validate the complete sequence
before pushing. Migration 0002 has been reviewed and applied locally only; these commands
do not migrate production or deploy the application.

```powershell
git add -- worker/db/schema/college.ts
git commit -m "Define recurring class schema and optional course descriptions"

git add -- drizzle/migrations/0002_closed_mister_sinister.sql
git commit -m "Add compatible schedule and course description migration"

git add -- drizzle/migrations/meta/0002_snapshot.json
git commit -m "Record Drizzle schema snapshot for College schedules"

git add -- drizzle/migrations/meta/_journal.json
git commit -m "Register the additive College schedule migration"

git add -- worker/utils/schedule-week.ts
git commit -m "Derive Monday based weeks in the saved owner timezone"

git add -- worker/db/repositories/schedule.repository.ts
git commit -m "Add owned schedule queries and guarded class mutations"

git add -- worker/services/schedule.service.ts
git commit -m "Validate recurring classes and resolve the local week"

git add -- worker/api/schedule.routes.ts
git commit -m "Expose validated private College schedule endpoints"

git add -- worker/index.ts
git commit -m "Register College schedule routes"

git add -- worker/db/repositories/college.repository.ts
git commit -m "Persist course descriptions and guard schedule cascades"

git add -- worker/services/college.service.ts
git commit -m "Normalize optional course descriptions"

git add -- worker/api/college.routes.ts
git commit -m "Validate course description metadata"

git add -- src/features/college/types.ts
git commit -m "Add recurring class and course description contracts"

git add -- src/features/college/api/schedule-api.ts
git commit -m "Add College schedule API client"

git add -- src/features/college/api/use-schedule.ts
git commit -m "Manage schedule queries and mutation refreshes"

git add -- src/features/college/api/use-college.ts
git commit -m "Clear descendant schedule caches after hierarchy deletion"

git add -- src/features/college/schedule-format.ts
git commit -m "Format local class times and date only labels"

git add -- src/features/college/schedule.css
git commit -m "Adapt timetable panels into readable narrow agendas"

git add -- src/features/college/components/ScheduleEditor.tsx
git commit -m "Add labeled class forms with midnight end support"

git add -- src/features/college/components/ScheduleManager.tsx
git commit -m "Add accessible schedule management and class deletion"

git add -- src/features/college/components/WeeklySchedule.tsx
git commit -m "Render real weekly classes with timezone and recovery states"

git add -- src/features/college/components/CourseRow.tsx
git commit -m "Add compact course rows with menus and keyboard ordering"

git add -- src/features/college/components/CollegeEditors.tsx
git commit -m "Allow editing and clearing course descriptions"

git add -- src/features/college/components/MaterialWorkspace.tsx
git commit -m "Align recent materials with the College room panels"

git add -- src/features/college/pages/CollegePage.tsx
git commit -m "Compose the approved College overview and restore deletion focus"

git add -- src/features/college/pages/CoursePage.tsx
git commit -m "Show full course descriptions on course detail"

git add -- tests/unit/schedule-week.test.ts
git commit -m "Test schedule dates across timezone and calendar boundaries"

git add -- tests/integration/schedule-migration.test.ts
git commit -m "Verify additive schedule migration compatibility and constraints"

git add -- tests/integration/schedule-api.test.ts
git commit -m "Test schedule ownership validation duplicates and safe cascades"

git add -- tests/integration/foundation.test.ts
git commit -m "Include the approved recurring class table in schema checks"

git add -- tests/integration/materials-api.test.ts
git commit -m "Keep material schema checks aligned with the schedule migration"

git add -- tests/e2e/schedule-regressions.mjs
git commit -m "Verify College schedule flows responsive layouts and focus"

git add -- tests/runtime/materials.test.mjs
git commit -m "Exercise native class persistence and material guarded cascades"

git add -- docs/features/COLLEGE_SCHEDULE.md
git commit -m "Document College schedules deletion contracts and verification"

git add -- docs/features/APPROVED_UI_FEATURES.md
git commit -m "Record delivery of the approved College overview controls"

git add -- docs/engineering/DATA_MODEL.md
git commit -m "Document the implemented eighteen table College schema"

git add -- docs/engineering/ARCHITECTURE.md
git commit -m "Record College schedules within existing architecture boundaries"

git add -- docs/engineering/FILE_STRUCTURE.md
git commit -m "Map implemented College schedule modules and tests"

git add -- docs/engineering/DEPLOYMENT.md
git commit -m "Record local schedule migration and production boundaries"

git add -- docs/design/DESIGN_SYSTEM.md
git commit -m "Document readable College timetable and agenda behavior"

git add -- docs/planning/IMPLEMENTATION_PLAN.md
git commit -m "Complete package 4.5 and identify the next approved package"

git add -- README.md
git commit -m "Update College completion and current project status"

git add -- docs/planning/COLLEGE_SCHEDULE_COMMITS.md
git commit -m "Provide granular manual commits for package 4.5"
```
