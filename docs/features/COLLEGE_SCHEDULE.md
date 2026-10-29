# College schedule and overview

**Version:** 1.1 | **Status:** Package 4.5 implemented locally | **Updated:** 2026-10-28

College now has recurring classes and optional course descriptions. The approved overview
keeps owned semester selection/activation, course rows at left, and Weekly Schedule plus
Recent Files & Notes at right. Mobile stacks these sections in the same DOM order.
Home still follows the active semester's first positioned course and first week.
No reminders, dated events, calendar sync, deadlines, study metrics or class joining are added.

## API contract

Routes use owner context, strict Zod boundaries, safe data/errors and route → service →
repository. IDs are bounded opaque strings. Schedule metadata bodies are capped at 32 KiB.
Foreign browser origins are rejected on schedule writes; CLI requests without Origin remain
available behind the private application boundary.

| Method/path | Behavior |
| --- | --- |
| GET /api/college/semesters/:semesterId/schedule | Owned entries plus saved timezone and current local week; no client timezone/date override. |
| POST /api/college/courses/:courseId/schedule | Create recurring class; returns 201 with data. |
| PATCH /api/college/schedule/:entryId | Nonempty partial update; optional courseId must remain within the same owned semester. |
| DELETE /api/college/schedule/:entryId | Delete owned class only; returns success=true. Course/material bytes stay saved. |

Create example:

```json
{ "weekday": 1, "startMinute": 540, "endMinute": 650, "room": "C1.01" }
```

- weekday: integer 1 (Monday) through 7 (Sunday).
- startMinute: integer 0–1439. endMinute: integer 1–1440, strictly later on the same day.
  Overnight classes require separate entries. End-of-day 1440 displays as 24:00.
- room: optional/null, trimmed, maximum 120 characters; empty text becomes null.
- Exact course/day/start/end duplicates return 409 without changing the existing entry.
  Other overlapping intervals and multiple intervals per course/day are allowed.
- Updates validate the complete merged interval. Unknown fields, invalid bounds, foreign
  parents and cross-semester course moves fail without changing the saved class.
- SQL writes recheck current/destination ancestry. Unexpected database failures use the
  existing safe error boundary, rather than being mislabeled as duplicates.

GET returns { data: ScheduleEntry[], timezone, week }, where week contains today, start,
end and seven { weekday, date } values. Dates are YYYY-MM-DD; start is local Monday and end
local Sunday. Entries join current course name/code and semester context, ordered by weekday,
start minute and ID. No copied course titles, file keys or external calendar/provider data.

## Timezone and UI

Read user_settings.timezone for the current owner. Missing settings use the existing
schema/seed default Asia/Jakarta. Invalid saved timezone data gives a safe local 503 instead
of silently adopting the server/browser zone; other College content remains accessible.
Timezone editing is outside this package.

Resolve today's calendar date with Intl in that zone, then advance date-only values in UTC
to derive Monday–Sunday. This avoids DST-hour arithmetic. The client formats those date-only
values in UTC without shifting the day. The mounted schedule refreshes each minute and on
normal query refocus so its week follows date changes.

Desktop shows five days, expanding to seven when weekend classes exist. Rows group by saved
start minute; every class shows its full time range and optional room. Overlaps are separate
blocks. Visible time bounds derive from real entries, including arbitrary minutes and midnight.
Minimum readable column widths use panel-local horizontal scrolling when needed. The focusable
table region and course links remain keyboard usable; the whole page must not overflow.
Narrow panels use day-grouped lists. Empty days are not fake events.

Edit schedule opens real Add/Edit/Delete controls. Forms label course/day/time/room and offer
Ends at midnight (24:00). Pending writes lock the draft and dismissal; failed writes preserve
fields. Sibling native dialogs contain focus and restore the manager trigger. Semester/route
changes unmount the old editor identity. Successful writes refresh shared College queries.

Course row menus retain edit/delete, keyboard reorder and hierarchy links. Description is
optional plain text up to 2,000 characters; whitespace clears it to null. Overview previews
use two lines; course detail shows the full text. Overview deletion restores focus to the
remaining course list after its removed row/dialog unmounts.

## Persistence and deletion

Generated migration 0002_closed_mister_sinister.sql creates course_schedule_entries with
range checks, unique interval/indexes and owner/course cascading FKs, then adds nullable
courses.description. Reviewed and applied locally; existing rows preserved and applied
history unchanged. Package 4.5 produced 18 tables; subsequent package 3.4 brings the current
schema to 19. The approved future News save table completes the 20-table target.

Course/semester deletion runs existing R2-aware material cleanup first. Only successful
parent deletion cascades classes. Preflight and final SQL guards reject foreign class rows,
including courses without weeks. Failed file cleanup retains classes under the remaining
parent; retry follows the material contract. Week/material deletion leaves classes intact.
No deletion queue, extra entity, provider, dependency or deployment is introduced.

## Verification and boundary

Tests cover CRUD/reload, duplicates/partial updates, overlaps/weekends, midnight bounds,
description save/clear, owner/ancestor isolation, timezone/date-line/year/leap/DST behavior,
additive migration preservation and SQLite FK/check/unique behavior. Browser cases cover
desktop/mobile, long metadata, pending/error recovery, focus, row menus and material navigation.
Existing Home/material suites remain required. The isolated native Workers/D1/R2 test also
verifies schedule writes/duplicates/query/cascade alongside streaming/file cleanup.

Verified on 2026-10-27: unit/API/migration suite 173/173, browser regressions 67/67,
and isolated native Workers/D1/R2 runtime 1/1. Lint, strict typecheck, format, build and
`git diff --check` also passed. The first native runtime attempt hit Miniflare's
`Network connection lost` after the oversized-upload rejection while the Vite dev server
was running; the separate rerun with that dev server stopped passed without request retries.
This local transport issue does not establish production behavior.

Fixtures are isolated. Captures remain under ignored .wrangler/screenshots/college-45.
Local verification does not establish production Access or remote D1/R2 behavior.
No production resources or bindings changed. The next package at the 4.5 boundary was 3.4;
3.4–3.5 have since been delivered, with their contracts in
[Ideas collections and covers](IDEAS_COLLECTIONS_AND_COVERS.md). The next package is 5.1.

References: [approved College](../design/concepts/2026-10-25/01-college-v2.png),
[approved feature contract](APPROVED_UI_FEATURES.md), [material lifecycle](COLLEGE_MATERIALS.md),
[D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).
