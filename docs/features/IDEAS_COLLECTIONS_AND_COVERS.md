# Ideas collections, favorites and private covers

**Version:** 1.0 | **Status:** Packages 3.4–3.5 implemented locally | **Updated:** 2026-10-28

Ideas retains fast capture, title/content search, tags, pins and existing limit/offset clients.
Collections are optional flat groups; favorites and pins are separate flags. The approved
Ideas page uses a cream ruled-paper composer, an ordered card grid and supporting Collections
and Favorite Ideas panels. Library retains its shortcut model and uses the approved portal grid.
No new provider, dependency, public image storage, attachment workflow or content AI is added.

## API and persistence

All personal operations resolve owner context and verify collection ancestry. Inconsistent
legacy ideas with a foreign collection are inaccessible; collection deletion also refuses
foreign descendants. Collection names are trimmed, 1–80 characters, unique per owner after
Unicode NFKC normalization, trimming and lowercase conversion. Collection deletion clears
membership without deleting ideas, tags, pins, favorites or cover bytes.

| Route | Contract |
| --- | --- |
| GET /api/idea-collections | Ordered by position then ID; limit defaults to 50, maximum 100; nonnegative offset; data and nullable nextOffset. Counts include only owned ideas. |
| POST /api/idea-collections | Create from name; backend assigns ID, order and timestamps. |
| PATCH /api/idea-collections/:id | Rename owned collection; normalized duplicates return 409. |
| DELETE /api/idea-collections/:id | Preserve ideas and clear membership through SET NULL. |
| PUT /api/idea-collections/reorder | Supply every current owned ID exactly once in ids; at most 10,000 IDs in a 2 MiB metadata envelope. |
| GET /api/ideas | Retains q/tag/pinned/limit/offset; adds favorite and collectionId. Predicates intersect. |
| POST /api/ideas; PATCH /api/ideas/:id | Optional isFavorite and nullable collectionId alongside existing metadata; cover keys/URLs are never accepted. |
| PUT /api/ideas/:id/cover | One multipart file field; upload or replace a private JPEG/PNG/WebP. |
| GET/HEAD /api/ideas/:id/cover | Owned image bytes/headers; optional bounded v identifies the display revision. |
| DELETE /api/ideas/:id/cover | Remove cover bytes and metadata; retain idea text and tags. |

Default idea order remains pinned first, then created time and ID descending. The separate
favorite preview requests favorite=true, sort=updated, limit=3; it orders by updated time
and ID descending. The complete favorite grid keeps normal pinned-first ordering. Idea
responses add isFavorite, collectionId and coverUrl; private R2 keys are omitted.
Collection responses are paginated; the full manager accumulates bounded pages so previews
do not cap the reachable set. Reorder checks complete membership and changes positions in
one SQL statement. A JSON/SQLite CTE keeps the bound-parameter count constant for large lists.
Title/content search is a literal SQLite substring search; percent/underscore do not act as
wildcards. It avoids D1's short LIKE-pattern limit while preserving ordinary case-insensitive
ASCII matching and exact Unicode text matching.

Generated and reviewed migration `0003_spicy_odin.sql` creates idea_collections and adds
nullable collection/cover metadata plus default-false is_favorite. Review replaced the
generator's table rebuild with additive ALTER TABLE statements; older rows and tag relations
remain intact. SQLite enforces favorite values, collection FK/SET NULL and complete valid
cover metadata. The local schema now has 19 tables; the remaining approved News save table
brings the future target to 20. Earlier applied migrations are unchanged.

## Covers and partial failures

The Worker checks ownership before consuming image data. A strict single-file multipart
reader caps headers and counts streamed bytes, including chunked requests. The image reader
enforces the existing 50 MiB ceiling, exact declared sizes when supplied, allowed MIME/byte
agreement and dimensions from 1 to 2,048 pixels per side. PNG CRC/chunks, JPEG frame/scan
headers and WebP canvas/frame bounds are validated. Compressed pixels are not decoded by a
new codec engine. A browser image decode failure falls back to readable text.

Keys are generated beneath the exact owned idea prefix, with fresh UUIDs. Before reads or
deletion, reject foreign prefixes and keys referenced by another idea/material/music record.
Delivery uses private/no-store, same-origin, nosniff and sandbox headers; no public bucket
URL or external cover URL is exposed. Missing storage or bytes is a local recoverable error.

Replacement uploads and validates fresh bytes before a compare-and-set metadata update.
A losing concurrent write cleans its unused candidate. If a database acknowledgement is
lost, re-read the current key before deleting candidate bytes. Only committed replacement
metadata permits old-key cleanup. Transient object deletions receive three bounded attempts.
On old-key cleanup failure, restore the previous reference only if no later writer replaced
it, then try to remove unused fresh bytes. Remove/delete keeps metadata until object cleanup
succeeds. A metadata failure after byte deletion is explicit and retryable. Final idea
deletion requires no attached cover and preserves tags if a new cover won the race.

D1/R2 do not share a transaction. A persistent simultaneous database/object-store failure
can prevent compensating cleanup; the request returns a safe 503 and logs an operation code
without content or keys. The UI asks for reload/retry and retains text. An unresolved
COVER_ROLLBACK_FAILED/COVER_SAVE_UNCERTAIN requires operational inspection of the exact
affected metadata/object keys after storage recovers. No durable cleanup queue or extra
persistent entity is introduced by these packages; do not describe every provider failure
as automatically repaired or delete unrelated objects to force recovery.

## UI and compatibility

Quick capture never requires a collection, favorite or cover. Home continues using the
default lightweight composer/data hooks. The feature page alone opts into paper styling.
Collections preview four records; New/View all opens complete create/rename/delete/reorder
controls. Assignment/clearing and optional cover changes belong in the existing idea editor.
Favorite preview shows three records; View all clears other filters to expose the full set.
Card pin/star controls are independent; menus retain edit/delete and keyboard access.

Feature filters live in /ideas query parameters (q, tag, pinned, collection, favorite), reset
pagination and support browser history. A draft survives failed saves; pending operations
prevent duplicate submission. Editor identity prevents an old response from closing a newer
draft. Desktop grids keep DOM order; mobile stacks the composer/grid before support panels.
Images are optional and cannot hide the text. Empty/loading/error and retry states remain local.

Library keeps validated one-click links, icons, groups, Home favorites and existing forms.
Filtered ordering swaps visible IDs in the full ordered list, retaining hidden positions.
Group identity is distinct from built-in All/Favorites controls even when names collide.
Every displayed edit/star/delete/move/Add tile has a real accessible action.

## Verification boundary

Use the full unit/API/migration suite, browser regressions, lint, strict typecheck, format,
build and the isolated native Workers/D1/R2 test. Tests include legacy migration preservation,
owner/foreign ancestry, normalized names, rollback, large collection pagination/reorder,
favorite/pin/filter intersections, image formats/dimensions/50 MiB, private delivery and
cover failure/concurrency handling. Browser checks cover approved desktop/mobile layouts,
keyboard focus, history, draft races, previews/full lists and existing Home/College flows.
Fixtures and captures are isolated; screenshots stay under ignored .wrangler paths.

Verified on 2026-10-28: unit/API/migration 206/206, browser 83/83, native storage runtime
1/1, lint, strict typecheck, format and build. Drizzle generation reports no schema changes;
manual commit coverage, empty Git index, diff whitespace and documentation links were checked.
The native runtime exercises private cover replacement at exactly 50 MiB as well as College
material streaming and cleanup. Its first run hit Miniflare's intermittent Network connection
lost after the rejected oversized College upload; the unchanged isolated rerun passed.
This transport limitation also occurred in prior College verification and is not proof of
production behavior.

No remote migration, resource creation, production Access test or deployment is included.
After local completion, the next documented package is 5.1; it requires owner authorization.

References: [approved UI features](APPROVED_UI_FEATURES.md),
[Data Model](../engineering/DATA_MODEL.md),
[D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[private R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).
