# Manual commits for approved UI specifications

**Updated:** 2026-10-25

No commands below were executed. The owner stages, commits and pushes manually.
Each commit covers exactly one file, including each tracked reference deletion.
Review the diff before running. Superseded untracked drafts were deleted from the working
folder and do not need a Git deletion commit; the tracked Stitch deletions below do.

This package changes documentation and reference assets only. It does not implement
APIs, schema/migrations, UI behavior, integrations or deployment. Next implementation
package remains 4.3; the updated plan defines the later extension order.

```powershell
Set-Location -LiteralPath 'C:\NO WORKSPACE\kokpit\kokpit'

git add -- AGENTS.md
git commit -m "Align agent rules with approved feature requirements"

git add -- README.md
git commit -m "Update approved V1 features and implementation status"

git add -- docs/design/DESIGN_SYSTEM.md
git commit -m "Define approved feature page layouts and interactions"

git add -- docs/design/UI_REFERENCES.md
git commit -m "Replace obsolete UI gallery with approved references"

git add -- docs/design/concepts/2026-10-25/01-college-v2.png
git commit -m "Preserve approved College schedule and materials design"

git add -- docs/design/concepts/2026-10-25/02-music.png
git commit -m "Preserve approved personal Music library design"

git add -- docs/design/concepts/2026-10-25/03-news-v2.png
git commit -m "Preserve approved News saves and feed topics design"

git add -- docs/design/concepts/2026-10-25/04-ideas-v2.png
git commit -m "Preserve approved Ideas collections and favorites design"

git add -- docs/design/concepts/2026-10-25/05-library.png
git commit -m "Preserve approved Library shortcut grid design"

git add -- docs/design/concepts/2026-10-25/README.md
git commit -m "Index the approved feature page references"

git add -- docs/design/references/college.png
git commit -m "Remove superseded college design reference"

git add -- docs/design/references/home-alternate.png
git commit -m "Remove superseded home alternate design reference"

git add -- docs/design/references/home.png
git commit -m "Remove superseded home design reference"

git add -- docs/design/references/ideas.png
git commit -m "Remove superseded ideas design reference"

git add -- docs/design/references/library.png
git commit -m "Remove superseded library design reference"

git add -- docs/design/references/music.png
git commit -m "Remove superseded music design reference"

git add -- docs/design/references/news.png
git commit -m "Remove superseded news design reference"

git add -- docs/engineering/ARCHITECTURE.md
git commit -m "Document boundaries for approved feature additions"

git add -- docs/engineering/DATA_MODEL.md
git commit -m "Specify additive schema for approved UI features"

git add -- docs/engineering/DEPLOYMENT.md
git commit -m "Document migration and recovery checks for approved additions"

git add -- docs/engineering/FILE_STRUCTURE.md
git commit -m "Map approved feature responsibilities and reference assets"

git add -- docs/features/APPROVED_UI_FEATURES.md
git commit -m "Define functional controls APIs and acceptance for approved UI"

git add -- docs/features/CONTENT_SOURCES.md
git commit -m "Specify saved article retention and cached feed topics"

git add -- docs/planning/IMPLEMENTATION_PLAN.md
git commit -m "Schedule approved feature additions and verification packages"

git add -- docs/planning/UI_APPROVAL_COMMITS.md
git commit -m "Document manual commits for the approved UI specification update"

git add -- docs/product/DECISIONS.md
git commit -m "Record approval of feature designs and functional scope"

git add -- docs/product/PRD.md
git commit -m "Approve functional scope for the selected feature designs"

```
