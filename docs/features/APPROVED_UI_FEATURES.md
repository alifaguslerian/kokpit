# Approved UI feature contract

**Version:** 1.1 | **Status:** Owner-approved V1 requirements; package-specific delivery | **Updated:** 2026-10-26

The owner approved the five feature-page references in [UI References](../design/UI_REFERENCES.md)
and requested working behavior for their controls. This document maps that approval to concrete
interactions and acceptance checks. [PRD](../product/PRD.md) owns product scope,
[Data Model](../engineering/DATA_MODEL.md) owns persistence, and
[Implementation Plan](../planning/IMPLEMENTATION_PLAN.md) owns execution order.
The approval revises requirements; it does not claim the features are already implemented.

Supporting navigation remains inside the six existing routes. View materials uses
`/college?semester=<id>&view=materials`; News View saved uses `/news?view=saved`,
and category/topic query parameters identify the normal feed filters. Ideas collection
selection and favorite views use `/ideas?collection=<id>` and `/ideas?favorite=true`;
View all favorites clears other filters first so the whole favorite set is reachable.
View all collections opens a complete accessible collection manager, not a seventh module.
Validate URL selections, support back/forward, and never treat an unknown/foreign selection
as authorization to reveal another owner's data.

## Delivery boundary

- Home and the shared room/dock remain as implemented. Keep hide/show, six destinations,
  keyboard focus, safe-area clearance and persistent playback across routes.
- Packages 3.1–3.3 and 4.1–4.3 are completed baseline work. The approved additions are
  new pending work, not a reason to mark unfinished features complete.
- Next: 4.4, then 4.5; return to 3.4–3.5 for approved Ideas/Library work,
  then continue Milestones 5–8 in order. New package numbers preserve existing references.
- The 2026-10-25 approval itself changed documentation only. Package 4.3 subsequently
  implemented material/file APIs and local R2, documented in [College Materials](COLLEGE_MATERIALS.md).
  Material UI/full deletion remains 4.4; schedule, Ideas additions and News are still pending.
- Populate production views from real data. Sample names, times, files, counts and photographs
  in the images are not records, defaults or mandatory seed content.

## College

Target: [approved College](../design/concepts/2026-10-25/01-college-v2.png).

| Visible control/surface | Working behavior | Package |
| --- | --- | --- |
| Add semester; semester tabs | Existing create/edit/delete and selection behavior remains. Browsing an inactive semester never activates it implicitly. | Existing 4.1–4.2 |
| Active semester | Show the actual active flag; retain explicit activation for a different semester. | Existing 4.1–4.2 |
| Add course; Open course; row menu | Create, enter, rename/edit, delete with existing safeguards, and reorder with keyboard controls as well as any drag affordance. | Existing; description/layout in 4.5 |
| Course description | Optional plain text, maximum 2,000 characters; empty means absent. Display a short preview and show full text on course detail. | 4.5 |
| Weekly Schedule | Selected semester's recurring weekly classes, using its owned courses and the owner's saved IANA timezone. | 4.5 |
| Edit schedule | Open a labeled editor with add, edit and delete for course, weekday, start/end time and optional room. | 4.5 |
| Schedule block | Open the linked course. Show course title, time range and optional room; never a fabricated live session. | 4.5 |
| Recent Files & Notes | Latest three materials in the selected semester, ordered by updated time then ID descending. | 4.4 |
| Recent material row | Open its owned file/view/download flow or validated external link; provide its course/week context. | 4.4 |
| View materials | Open the selected semester's paginated materials view with breadcrumbs back to course/week. | 4.4 |

Weekly schedule rules:

- One entry is one recurring class: weekday 1–7 (Monday–Sunday), local start/end minute
  and optional room up to 120 characters. Course is required and must belong to the selected semester/owner.
- Start must precede end within one day; overnight classes are entered as separate day entries.
  More than one entry per course/day is allowed; reject an exact duplicate course/day/time interval.
- Overlapping entries stay individually readable and editable. Do not silently overwrite one
  class with another or invent a conflict-resolution workflow.
- Show the current local Monday-based week/date range; display weekends when entries require
  them and derive the visible time range from saved entries. Do not hardcode the sample hours.
- On mobile use a day-grouped list with full time ranges instead of shrinking a seven-day grid.
- Deleting a course/semester deletes its schedule entries after existing material/R2 deletion
  checks succeed. Deleting a week or material leaves recurring classes unchanged.
- No Google Calendar integration, arbitrary events, reminders, deadlines, attendance, class
  joining, study-hour tracking or progress/streak metrics are introduced.

Recent notes are existing uploaded text/Markdown/document materials. Week context notes stay
on their week page; this section does not add another notes database or rich-text editor.
Recent lists use create/update timestamps, not tracking of views or a new activity log.
An empty semester shows an explanatory state and a link to add course/material as appropriate.

## Music

Target: [approved Music](../design/concepts/2026-10-25/02-music.png), unchanged by the revision.

| Visible control/surface | Working behavior | Package |
| --- | --- | --- |
| Import music | Upload owned/permitted audio through private Worker/R2 handling, show validation/progress/error and preserve unrelated playback. | 5.1–5.2 |
| Track metadata/artwork; row menu | Real title, artist, duration and optional cover; edit metadata, replace/remove cover, favorite and delete through actual actions. | 5.1–5.2 |
| All tracks / Playlists | Switch to the corresponding real library view; links support playlist detail navigation. | 5.2–5.3 |
| Search your music | Required local-to-feature title/artist/album search, with bounded stable pagination rather than loading every track. | 5.2 |
| Track row; play/pause; previous/next | Control the single persistent audio provider, including the selected track and queue. | 5.2 |
| Progress slider; time labels | Seek within actual duration; unknown duration is shown as unavailable until metadata exists. | 5.1–5.2 |
| Shuffle; repeat | Functional queue shuffle and repeat off/all/one, with labeled selected state. | 5.2 |
| Volume | Control native audio volume, exposed consistently on Music, Home and the persistent compact player. | 5.2–5.3 |
| New playlist; playlist entry | Create/open/rename/delete; add/remove/reorder real tracks with keyboard support; play its ordered queue. | 5.3 |

Playback requires a user gesture where the browser requires it. Handle unsupported media and
stream failure locally. Deleting the playing track safely updates the queue; no stale request
may resume a deleted track. Playlist artwork can derive from its first track or use the existing
optional cover field; a custom cover editor is not required merely by the image.
All uploads keep the 50 MB per-file limit and ownership-controlled private delivery.

## News

Target: [approved News](../design/concepts/2026-10-25/03-news-v2.png).

| Visible control/surface | Working behavior | Package |
| --- | --- | --- |
| All stories / Technology / Research / World | Query real normalized categories; a changed filter resets the cursor and preserves usable browser history. | 6.5 |
| Lead article; More to read | Render deduplicated cached articles, source/time, short summary and optional grounded why-it-matters. | 6.4–6.5 |
| Read original | Open validated original publisher URL with safe external-link behavior. | 6.5 |
| Bookmark on article | Idempotently save/unsave an owner-scoped reference and synchronize all visible instances. | 6.5 |
| Saved for Later | Two most recently saved articles in the preview, ordered by saved time then article ID descending. | 6.5 |
| View saved | Open the paginated saved view within News; retain original links and an accessible remove-save control. | 6.5 |
| Trending Topics; topic row | Derive up to four nonempty topic groups from eligible cached articles in the last seven days; click filters the full feed by that topic. | 6.4–6.5 |

Trending is a view of this Kokpit feed, not measured global popularity. Label the context
"Topics in your feed · past 7 days". Fixed initial primary topics are artificial intelligence,
developer tools, cybersecurity and world affairs. A deterministic classifier assigns at most
one primary topic per article; unclassified articles remain in the normal feed. Ranking and
tie-breaking are specified in [Content Sources](CONTENT_SOURCES.md). No new provider,
paid trend API, AI-per-click call, growth percentage or invented count is required.

Saving retains the normalized article/source reference beyond ordinary cleanup, not a full
publisher page or offline copy. Unsave does not mean read, delete the source article immediately,
or change other records. Feed retention excludes old saved records from fresh feed/trends;
the Saved view can still open them. Never send private saved-state data to providers or AI.
Empty Trending/Saved sections explain their state; a failed save restores the prior bookmark
state and permits retry. Cached feed still works when a provider fails.

## Ideas

Target: [approved Ideas](../design/concepts/2026-10-25/04-ideas-v2.png).

| Visible control/surface | Working behavior | Package |
| --- | --- | --- |
| Paper Quick thought; optional title; tag buttons; Save thought | Preserve immediate capture, native form behavior and draft on failure; no required collection, cover or category. To-do is a text tag, not a task workflow. | Existing; adapted in 3.5 |
| All Ideas | Responsive card grid with readable previews, optional cover, tags and date; stable paginated results retain existing pinned-first behavior. | 3.5 |
| All / Ideas / Questions / Random | Reset or apply existing canonical tag values (Idea, Question, Random); labels are aliases, not a second taxonomy. | 3.5 |
| Search ideas | Search title/content server-side; combine with tag, collection and favorite filters; reset pagination on filter change. | 3.4–3.5 |
| Card title/body | Open the existing accessible edit/detail form; expose edit/delete through a labeled row menu. | 3.5 |
| Pin icon | Toggle existing isPinned; pinning remains independent from the new favorite flag. | Existing; adapted in 3.5 |
| Star on card/favorite row | Persist isFavorite and synchronize the grid, favorite preview and filtered views. | 3.4–3.5 |
| Collections; collection tile | Show up to four real collections, select one to filter All Ideas, and show a clear way back to all. No fixed sample folders are seeded. | 3.4–3.5 |
| New collection; View all | Accessible collection create/manage view with rename, delete and explicit ordering controls; View all lists every collection. | 3.4–3.5 |
| Favorite Ideas; View all | Three most recently updated favorites, then a complete paginated favorite-only grid; no hard limit on reachable saved ideas. | 3.4–3.5 |

Collections are deliberately lightweight: an idea belongs to zero or one collection, alongside
its independent lightweight tags. Assign/clear collection in the idea edit form; quick capture
does not open another workflow. Deleting a collection preserves its ideas and clears membership.
Collection names are trimmed, case-insensitively unique per owner, 1–80 characters, no nesting.

Card photographs become optional private covers chosen by the owner in the idea edit form.
Support upload/replace/remove for JPEG, PNG and WebP, validated by actual bytes/type and size,
with the existing 50 MB ceiling; stored covers are at most 2,048 pixels per side. The edit
form may downscale through native browser APIs, but backend validation must verify the
uploaded bytes/dimensions rather than trust client metadata. Reject SVG/HTML or external
arbitrary cover URLs. No automatic image generation, remote scraping or new attachment system.
Text-only cards remain complete; cover loading/failure cannot hide the idea or stop capture.
Use existing private R2 infrastructure and authenticated cover delivery, with metadata/R2
rollback and cleanup on replace/remove/delete. Do not send covers or ideas to content AI.

For combined filters, predicates intersect; pins sort first, then created time and ID descending.
The separate favorite preview orders by updated time and ID descending. Deleting/filtering
a record or a pending request cannot erase a newer draft, leave a stale editor open or show a
cross-owner collection/cover. Desktop grid placement must keep DOM/keyboard reading order;
mobile uses a single-column list and supporting sections below the primary capture/grid.

## Library

Target: [approved Library](../design/concepts/2026-10-25/05-library.png), unchanged.

All links/Favorites/group filters query actual shortcuts. Add link/Add a link open the same
accessible name/URL/icon/group/favorite form; a tile opens its validated external destination.
Star toggles Home favorite, pencil edits, overflow exposes deletion, and ordering works with
explicit keyboard controls even if a drag handle is shown. In a filtered view, reorder retains
positions of hidden links according to the existing full-list reorder contract.
No fake default portals, book records, reading progress or generic file-storage view are added.
Package 3.5 applies the approved appearance while preserving existing APIs and regressions.

## Cross-feature acceptance

- Every visible action has a real handler or navigation target; no dead View all/Edit/New menu.
  Do not expose unfinished new feature controls before their package is implemented.
- Verify desktop and basic mobile, keyboard-only use, modal containment/focus restoration,
  visible focus, readable contrast and reduced motion.
- Verify loading, initial empty, filtered empty, cached/error/retry and mutation-pending states.
  Failed writes preserve drafts/content; disable duplicate submission and rollback speculative state.
- Test ownership for every entity, ancestry and related collection/file ID; reject missing or foreign
  references safely. Bound text, query parameters, cursors, time ranges, URLs, MIME/type and file size.
- Test schedule CRUD/reload/timezone/weekend/overlap/delete; saved-article cleanup/save races;
  topic filtering; collection delete without idea loss; favorite/pin independence; cover access/cleanup;
  audio queue continuity; and all collection/favorite/saved lists beyond preview limits.
- Implement through additive reviewed migrations and local verification. Existing 17-table data
  and prior APIs must remain readable; do not rewrite the initial migration.

## Required API additions

The 4.3 material list route is implemented; its frontend remains 4.4. Other additions in
this table are pending their listed package, not claims about the current Worker. Keep the existing safe
JSON data/error conventions, Zod boundary validation and explicit owner context.

| Package | Route/contract | Purpose |
| --- | --- | --- |
| 4.3–4.4 | GET /api/college/semesters/:semesterId/materials | Latest/complete material lists, updated-time ordering, bounded cursor pagination and owned ancestry. |
| 4.5 | GET /api/college/semesters/:semesterId/schedule | Selected semester's owned class entries. |
| 4.5 | POST /api/college/courses/:courseId/schedule | Create entry with weekday, startMinute, endMinute and optional room. |
| 4.5 | PATCH /api/college/schedule/:entryId; DELETE same path | Edit/delete an owned entry; course reassignment must remain inside its semester. |
| 4.5 | Existing PATCH course route | Add optional nullable description without breaking existing metadata clients. |
| 3.4 | GET/POST /api/idea-collections; PATCH/DELETE /api/idea-collections/:id | List/create/manage owned flat collections. |
| 3.4 | PUT /api/idea-collections/reorder | Atomically validate and persist all owned collection IDs once each. |
| 3.4 | Existing GET /api/ideas | Add favorite=true/false and collectionId filters; retain q/tag/pinned/limit/offset compatibility. |
| 3.4 | Existing idea create/update routes | Add optional isFavorite and nullable collectionId; validate related owner. |
| 3.4 | PUT /api/ideas/:id/cover; DELETE same path | Multipart image upload/replace and cover removal with private R2 coordination. |
| 3.4 | GET /api/ideas/:id/cover | Private authenticated image bytes, never a raw R2 key or public URL. |
| 6.5 | GET /api/news?category=technology&topic=ai | Shared cached feed with owner-specific isSaved state, stable bounded cursor pagination. |
| 6.5 | GET /api/news/topics | At most four derived nonempty primary topic groups and their feed filter keys. |
| 6.5 | GET /api/news/saved | Complete owner-scoped saved list; limit/cursor apply beyond its two-item preview. |
| 6.5 | PUT /api/news/:articleId/saved; DELETE same path | Idempotent save/unsave; repeated saves preserve savedAt. |

New paginated material/news lists default to 20 and cap limit at 100. Collection/schedule
management lists must also be bounded and expose pagination when necessary; a preview never
silently limits the full manager. New list cursors include stable ID tie-breakers. Existing
Ideas limit/offset pagination is retained; a more extensive cursor migration is not required.
Empty lists return successful empty data; missing/foreign personal IDs return safe not-found.
Invalid data returns structured validation errors; exact duplicates use recoverable conflict
errors. Save/favorite mutations set an explicit desired state rather than blindly toggling,
so retries cannot undo the owner's intent. Invalidate only the affected lists/previews/details.

