# Pre-College audit fixes

Scope approved by the owner on 2026-10-23: correct the reproduced audit findings in
existing Foundation, Home, Ideas and Library behavior. Package 4.1 remains pending.
No new dependencies, schema entities, provider integrations or production operations.
The owner performs Git staging, one commit per file/component, and pushing manually.

## Implementation and verification

- [x] Backend: atomic idea/tag writes and link reordering; reject malformed toggle
  bodies and invalid reorder sets; normalize URLs and canonical icon contracts.
  Add API regressions with injected SQLite failures and verify rollback/readback.
- [x] Feature UI: preserve drafts, show recoverable mutation errors, paginate Ideas,
  repair icon selection, and wrap valid long content on narrow screens.
- [x] Shared interaction: native dialogs with focus containment, Escape and focus
  restoration; remove closed mobile navigation from the focus order.
- [x] Home: remove fake personal/news/music content and unsupported controls, use
  temporary unattributed fallback thoughts, and restore documented mobile order,
  semantic colors, typography and restrained surfaces.
- [x] Regression harness: exercise the rendered UI against Hono with an isolated
  in-memory SQLite adapter; cover failed requests, delayed saves, retry, pagination,
  icons, dialogs, mobile navigation, long groups and honest Home states.
- [x] Update current-status documentation and record actual checks. Run lint,
  formatting, strict typecheck, API/unit tests, build and browser regressions.

## Decisions within the existing specification

- Canonical icon types remain `brand`, `lucide`, `favicon`, `custom`; existing
  `platform`/`domain` records remain readable without rewriting migration history.
- Dynamic hourly D1 quotes, real College data, playback and News ingestion remain
  in their documented packages. Current Home states do not pretend those features
  are operational.
- Browser fixtures never write to the local or production Kokpit database. They
  validate UI integration and failure recovery, not Cloudflare Access or production.

## Validation on 2026-10-23

- Unit/API suite: 88 tests passed, including 14 new rollback, validation, ordering,
  ownership, icon compatibility and private-log regressions.
- Browser suite: 11 tests passed in headless Chrome at desktop and mobile widths.
  Includes delayed save/readback, failed save/pin/favorite/delete, retry, pagination,
  icon readback, modal focus/return, closed navigation focus, long groups and Home.
- ESLint, strict TypeScript, Prettier checks and client/Worker production build passed.
- Built Worker was separately exercised in workerd with Miniflare's actual D1
  binding and a fresh temporary audit store: initial 17-table migration applied;
  trigger-injected idea/tag and reorder failures both rolled back on readback.
- Desktop Home and 390px mobile Home/Library captures inspected. Shared and feature
  placeholders use muted text; valid long names/groups wrap without covering controls.
- Review raised dialog focus/dismissal and reorder readback timing issues; all were
  corrected and the browser regressions passed afterwards.

Sandbox `spawn EPERM` required running process-based checks outside the sandbox.
No production, Access, R2 or remote-provider validation was performed. No dependencies,
schema changes, Git staging/commits/pushes or deployment were performed.

The next documented package remains **4.1 Semester, Course & Week APIs**.
Manual commands cover every changed file individually in
[AUDIT_FIX_COMMITS.md](AUDIT_FIX_COMMITS.md).
