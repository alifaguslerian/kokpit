# Manual commits for pre-College audit fixes

These commands are provided for the owner and have not been executed. Each commit
contains exactly one file. Run them from the repository root after reviewing the diff.
`--only` prevents unrelated staged changes from being included. No push is included.
The commits together form the verified correction; validate the complete set.

```powershell
Set-Location -LiteralPath 'C:\NO WORKSPACE\kokpit\kokpit'
```

## AGENTS.md

```powershell
git add -- "AGENTS.md"
git commit --only -m "docs: require manual commits per file" -- "AGENTS.md"```

## README.md

```powershell
git add -- "README.md"
git commit --only -m "docs: update implemented scope and browser test setup" -- "README.md"```

## docs/engineering/ARCHITECTURE.md

```powershell
git add -- "docs/engineering/ARCHITECTURE.md"
git commit --only -m "docs: document current features and atomic writes" -- "docs/engineering/ARCHITECTURE.md"```

## docs/engineering/DEPLOYMENT.md

```powershell
git add -- "docs/engineering/DEPLOYMENT.md"
git commit --only -m "docs: distinguish local D1 from pending production setup" -- "docs/engineering/DEPLOYMENT.md"```

## docs/engineering/FILE_STRUCTURE.md

```powershell
git add -- "docs/engineering/FILE_STRUCTURE.md"
git commit --only -m "docs: update implemented modules and regression coverage" -- "docs/engineering/FILE_STRUCTURE.md"```

## docs/planning/AUDIT_FIXES.md

```powershell
git add -- "docs/planning/AUDIT_FIXES.md"
git commit --only -m "docs: record pre-College audit fixes and validation" -- "docs/planning/AUDIT_FIXES.md"```

## docs/planning/AUDIT_FIX_COMMITS.md

```powershell
git add -- "docs/planning/AUDIT_FIX_COMMITS.md"
git commit --only -m "docs: provide manual per-file audit fix commit commands" -- "docs/planning/AUDIT_FIX_COMMITS.md"```

## docs/planning/IMPLEMENTATION_PLAN.md

```powershell
git add -- "docs/planning/IMPLEMENTATION_PLAN.md"
git commit --only -m "docs: mark Library complete and retain College boundary" -- "docs/planning/IMPLEMENTATION_PLAN.md"```

## docs/product/DECISIONS.md

```powershell
git add -- "docs/product/DECISIONS.md"
git commit --only -m "docs: record approved audit correction boundaries" -- "docs/product/DECISIONS.md"```

## package.json

```powershell
git add -- "package.json"
git commit --only -m "test: add isolated browser regression command" -- "package.json"```

## src/app/AppShell.tsx

```powershell
git add -- "src/app/AppShell.tsx"
git commit --only -m "fix: keep mobile navigation out of closed focus order" -- "src/app/AppShell.tsx"```

## src/components/layout/Sidebar.tsx

```powershell
git add -- "src/components/layout/Sidebar.tsx"
git commit --only -m "fix: make sidebar navigation accessible on short screens" -- "src/components/layout/Sidebar.tsx"```

## src/components/shared/KokpitLogo.tsx

```powershell
git add -- "src/components/shared/KokpitLogo.tsx"
git commit --only -m "style: align wordmark with existing semantic tokens" -- "src/components/shared/KokpitLogo.tsx"```

## src/components/ui/Dialog.tsx

```powershell
git add -- "src/components/ui/Dialog.tsx"
git commit --only -m "fix: contain dialog focus and restore its opener" -- "src/components/ui/Dialog.tsx"```

## src/components/ui/Input.tsx

```powershell
git add -- "src/components/ui/Input.tsx"
git commit --only -m "fix: improve shared input placeholder contrast" -- "src/components/ui/Input.tsx"```

## src/components/ui/Textarea.tsx

```powershell
git add -- "src/components/ui/Textarea.tsx"
git commit --only -m "fix: improve shared textarea placeholder contrast" -- "src/components/ui/Textarea.tsx"```

## src/features/home/components/Clock.tsx

```powershell
git add -- "src/features/home/components/Clock.tsx"
git commit --only -m "fix: restore readable responsive Home clock" -- "src/features/home/components/Clock.tsx"```

## src/features/home/components/DynamicQuote.tsx

```powershell
git add -- "src/features/home/components/DynamicQuote.tsx"
git commit --only -m "fix: show unattributed session thoughts honestly" -- "src/features/home/components/DynamicQuote.tsx"```

## src/features/home/components/HomeHero.tsx

```powershell
git add -- "src/features/home/components/HomeHero.tsx"
git commit --only -m "fix: connect Home clock and temporary thought controls" -- "src/features/home/components/HomeHero.tsx"```

## src/features/home/components/previews/CollegePreview.tsx

```powershell
git add -- "src/features/home/components/previews/CollegePreview.tsx"
git commit --only -m "fix: replace fabricated College preview with empty state" -- "src/features/home/components/previews/CollegePreview.tsx"```

## src/features/home/components/previews/IdeasPreview.tsx

```powershell
git add -- "src/features/home/components/previews/IdeasPreview.tsx"
git commit --only -m "fix: protect Home idea capture and show retry feedback" -- "src/features/home/components/previews/IdeasPreview.tsx"```

## src/features/home/components/previews/MusicPreview.tsx

```powershell
git add -- "src/features/home/components/previews/MusicPreview.tsx"
git commit --only -m "fix: remove unsupported playback controls and claims" -- "src/features/home/components/previews/MusicPreview.tsx"```

## src/features/home/components/previews/NewsPreview.tsx

```powershell
git add -- "src/features/home/components/previews/NewsPreview.tsx"
git commit --only -m "fix: replace fabricated news with honest empty state" -- "src/features/home/components/previews/NewsPreview.tsx"```

## src/features/home/components/previews/QuickLinksPreview.tsx

```powershell
git add -- "src/features/home/components/previews/QuickLinksPreview.tsx"
git commit --only -m "fix: use saved Home links with loading and error states" -- "src/features/home/components/previews/QuickLinksPreview.tsx"```

## src/features/home/hooks/useRealtimeClock.ts

```powershell
git add -- "src/features/home/hooks/useRealtimeClock.ts"
git commit --only -m "fix: default Home clock to documented 24-hour format" -- "src/features/home/hooks/useRealtimeClock.ts"```

## src/features/home/pages/HomePage.tsx

```powershell
git add -- "src/features/home/pages/HomePage.tsx"
git commit --only -m "fix: preserve documented Home reading order on mobile" -- "src/features/home/pages/HomePage.tsx"```

## src/features/ideas/api/use-ideas.ts

```powershell
git add -- "src/features/ideas/api/use-ideas.ts"
git commit --only -m "fix: support paginated Ideas queries" -- "src/features/ideas/api/use-ideas.ts"```

## src/features/ideas/components/IdeaCard.tsx

```powershell
git add -- "src/features/ideas/components/IdeaCard.tsx"
git commit --only -m "fix: report failed idea actions without unhandled promises" -- "src/features/ideas/components/IdeaCard.tsx"```

## src/features/ideas/components/IdeaComposer.tsx

```powershell
git add -- "src/features/ideas/components/IdeaComposer.tsx"
git commit --only -m "fix: protect pending idea drafts and report save failures" -- "src/features/ideas/components/IdeaComposer.tsx"```

## src/features/ideas/components/IdeaEditModal.tsx

```powershell
git add -- "src/features/ideas/components/IdeaEditModal.tsx"
git commit --only -m "fix: preserve idea edits and use accessible modal behavior" -- "src/features/ideas/components/IdeaEditModal.tsx"```

## src/features/ideas/components/IdeasFilterBar.tsx

```powershell
git add -- "src/features/ideas/components/IdeasFilterBar.tsx"
git commit --only -m "fix: label Ideas search and improve filter readability" -- "src/features/ideas/components/IdeasFilterBar.tsx"```

## src/features/ideas/pages/IdeasPage.tsx

```powershell
git add -- "src/features/ideas/pages/IdeasPage.tsx"
git commit --only -m "fix: make older ideas reachable through pagination" -- "src/features/ideas/pages/IdeasPage.tsx"```

## src/features/library/api/use-quick-links.ts

```powershell
git add -- "src/features/library/api/use-quick-links.ts"
git commit --only -m "fix: keep reorder pending through authoritative refresh" -- "src/features/library/api/use-quick-links.ts"```

## src/features/library/components/QuickLinkCard.tsx

```powershell
git add -- "src/features/library/components/QuickLinkCard.tsx"
git commit --only -m "fix: wrap shortcut details and expose mobile ordering" -- "src/features/library/components/QuickLinkCard.tsx"```

## src/features/library/components/QuickLinkIcon.tsx

```powershell
git add -- "src/features/library/components/QuickLinkIcon.tsx"
git commit --only -m "fix: render canonical icons with safe fallbacks" -- "src/features/library/components/QuickLinkIcon.tsx"```

## src/features/library/components/QuickLinkModal.tsx

```powershell
git add -- "src/features/library/components/QuickLinkModal.tsx"
git commit --only -m "fix: preserve selected icons and reject invalid URLs" -- "src/features/library/components/QuickLinkModal.tsx"```

## src/features/library/pages/LibraryPage.tsx

```powershell
git add -- "src/features/library/pages/LibraryPage.tsx"
git commit --only -m "fix: show reorder failures and wrap long link groups" -- "src/features/library/pages/LibraryPage.tsx"```

## src/styles/globals.css

```powershell
git add -- "src/styles/globals.css"
git commit --only -m "style: use explicit Kokpit base styles without Preflight" -- "src/styles/globals.css"```

## tests/e2e/audit-regressions.mjs

```powershell
git add -- "tests/e2e/audit-regressions.mjs"
git commit --only -m "test: cover audit failures and recovery in the browser" -- "tests/e2e/audit-regressions.mjs"```

## tests/helpers/mock-d1.ts

```powershell
git add -- "tests/helpers/mock-d1.ts"
git commit --only -m "test: make SQLite D1 batches roll back atomically" -- "tests/helpers/mock-d1.ts"```

## tests/integration/backend-regressions.test.ts

```powershell
git add -- "tests/integration/backend-regressions.test.ts"
git commit --only -m "test: cover write rollback validation and icon compatibility" -- "tests/integration/backend-regressions.test.ts"```

## tests/integration/error-privacy.test.ts

```powershell
git add -- "tests/integration/error-privacy.test.ts"
git commit --only -m "test: prevent private database values in error logs" -- "tests/integration/error-privacy.test.ts"```

## tests/integration/quick-links-api.test.ts

```powershell
git add -- "tests/integration/quick-links-api.test.ts"
git commit --only -m "test: expect canonical brand icon contracts" -- "tests/integration/quick-links-api.test.ts"```

## worker/api/ideas.routes.ts

```powershell
git add -- "worker/api/ideas.routes.ts"
git commit --only -m "fix: validate optional pin request bodies" -- "worker/api/ideas.routes.ts"```

## worker/api/quick-links.routes.ts

```powershell
git add -- "worker/api/quick-links.routes.ts"
git commit --only -m "fix: validate favorite bodies and canonical icon types" -- "worker/api/quick-links.routes.ts"```

## worker/db/repositories/ideas.repository.ts

```powershell
git add -- "worker/db/repositories/ideas.repository.ts"
git commit --only -m "fix: persist idea and tag changes atomically" -- "worker/db/repositories/ideas.repository.ts"```

## worker/db/repositories/quick-links.repository.ts

```powershell
git add -- "worker/db/repositories/quick-links.repository.ts"
git commit --only -m "fix: validate and atomically apply complete link orders" -- "worker/db/repositories/quick-links.repository.ts"```

## worker/middleware/error-handler.ts

```powershell
git add -- "worker/middleware/error-handler.ts"
git commit --only -m "fix: omit private error details from unexpected failure logs" -- "worker/middleware/error-handler.ts"```

## worker/services/quick-links.service.ts

```powershell
git add -- "worker/services/quick-links.service.ts"
git commit --only -m "fix: normalize URLs and honor explicit shortcut icons" -- "worker/services/quick-links.service.ts"```

## worker/utils/validator.ts

```powershell
git add -- "worker/utils/validator.ts"
git commit --only -m "fix: validate supplied optional JSON without hiding malformed input" -- "worker/utils/validator.ts"```
