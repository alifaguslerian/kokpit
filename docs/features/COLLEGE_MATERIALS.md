# College materials API

**Version:** 1.1 | **Status:** Packages 4.3–4.4 implemented locally | **Updated:** 2026-10-26

The backend supports private file materials and HTTP(S) link materials under owned weeks.
Package 4.4 supplies the material UI and R2-aware material/hierarchy deletion. Final hierarchy
guards still reject inaccessible descendants and file additions not covered by completed cleanup.
No production bucket, Access deployment, Music API or timetable is introduced here.

## Routes

All routes run through owner context, Zod validation and route → service → repository/provider.
Each lookup/mutation checks material, week, course and semester ownership, including inconsistent
legacy parent rows. Missing/foreign personal IDs return safe 404 responses.

| Method/path | Contract |
| --- | --- |
| GET /api/college/weeks/:weekId/materials | Bounded position/ID ascending list; limit default 20, maximum 100; nonnegative offset. |
| POST /api/college/weeks/:weekId/materials | JSON link: title and externalUrl; returns 201 with data. |
| POST /api/college/weeks/:weekId/materials/upload | Raw streamed file body; filename, sizeBytes and optional title query parameters. |
| GET /api/college/materials/:id | Safe metadata with course/week/semester context. |
| PATCH /api/college/materials/:id | Nonempty JSON patch: title, link externalUrl, or owned destination weekId. |
| DELETE /api/college/materials/:id | Owned object cleanup before metadata removal; returns success=true. |
| GET /api/college/semesters/:semesterId/materials | Updated-time/ID descending list; limit default 20, cap 100; optional cursor and sort=updated. |
| GET /api/files/:id | Owned private bytes, never a bucket/key URL. Optional download=true forces attachment. |
| HEAD /api/files/:id | Owned metadata/headers without reading a response body. |

Link URLs must be HTTP(S), at most 4,096 characters, without embedded credentials. Link bodies
and patches reject unknown fields such as r2Key, userId or type. JSON metadata bodies are
capped at 32 KiB independently from streamed file bodies. Titles are trimmed nonempty
plain text up to 255 characters; a file defaults to its full original filename. Filenames are
1–255 characters with no separators/control characters. Names never become storage paths.
File materials cannot acquire an externalUrl through a patch.

Moves validate both old and new ancestry and append to the destination week's ordering.
The existing R2 key stays unchanged; key prefixes are not the authorization source.
The low-level owner-scoped metadata deletion is called only after coordinated object cleanup.
Public DELETE is implemented in 4.4, using the same origin/ownership validation as other writes.

## Material UI (4.4)

- Week pages offer Upload file and Add link with labeled, keyboard-contained forms. A pending
  save locks inputs/submission and dismissal to prevent duplicate writes. Upload status is
  indeterminate; it never invents a byte percentage. Failed uploads preserve the selected file/title.
- Edit material renames the title, edits an HTTP(S) link, or moves it to an owned destination
  semester/course/week. Destination failures have a local retry; moves preserve the storage key.
- File titles open a metadata dialog that checks private HEAD before showing Open file and
  Download file. Errors/missing bytes are local and retryable. Authenticated browser links
  stream bytes directly; React never fetches the complete file into a Blob for download.
- Link titles open validated external URLs with noopener/noreferrer. Course/week context links
  return to the existing hierarchy, including from the semester-wide view.
- The selected semester shows three recent files/links. View materials opens
  /college?semester=<id>&view=materials, with a complete cursor-paginated list. Week lists use
  bounded offset pages. Load more keeps later records reachable; selection/back/forward/reload
  retain the normal College routing. No tracking, fake records or extra primary route is added.
- Material actions refresh all College material/preview queries. Hierarchy failures also
  refresh reads because some child deletions may already have completed. Authoritative missing
  material lists hide cached rows. Existing room typography/tokens, native dialog focus and
  dock clearance apply. The recurring schedule and final overview composition remain 4.5.

## Deletion and retry (4.4)

Destructive UI actions explicitly confirm removal of stored files and explain irreversible,
possibly partial cleanup. The same material service coordinates DELETE material and the
existing semester/course/week DELETE routes:

1. Verify the owned target and all descendant ownership before hierarchy cleanup. Missing or
   foreign targets return 404; inconsistent descendants block with 409 before touching objects.
2. Read at most 100 material IDs per cleanup batch and recheck current ownership/parent context.
3. For each stored object, require a server-generated owner College prefix and reject any
   shared-key reference. Delete only the exact metadata key; never delete a wildcard/prefix.
4. Await R2 deletion, then remove owned metadata. Link-only deletion needs no R2 binding.
5. Finish hierarchy deletion with the existing SQL ownership/file guards. A concurrent file
   addition cannot be silently cascaded without R2 cleanup; retry starts from remaining rows.

If R2 fails, the material row remains. If metadata fails after R2 succeeds, bytes may already
be gone while metadata remains. The API returns a safe 503 and the UI explains partial
completion; retrying R2's idempotent delete then removes the remaining metadata. A successful
hierarchy deletion leaves no ordinary child file orphan. D1/R2 have no shared transaction;
this workflow does not promise rollback of already deleted files, a trash can or a background job.
Unexpected failures log only operation codes and opaque material IDs. No new table/migration
or dependency was required for 4.4.

## Upload protocol and validation

Send the selected File as the fetch body, not JSON, base64 or multipart formData:

```ts
const query = new URLSearchParams({
  filename: file.name,
  sizeBytes: String(file.size),
});
const response = await fetch(
  `/api/college/weeks/${encodeURIComponent(weekId)}/materials/upload?${query}`,
  {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  },
);
```

The application ceiling is 50 × 1,024 × 1,024 = **52,428,800 bytes**, displayed as 50 MB.
Check declared and actual bytes. A supplied Content-Length must match sizeBytes; neither
query metadata nor headers substitute for counting the streamed body. Oversize declarations
return 413 before accepting storage work; short/long mismatches return 400. Filename/title/query
validation is bounded; missing body and zero-sized uploads are rejected.
Upload headers are bounded and validated. A browser Origin must match the request's
origin on all material writes before metadata or bytes are stored; foreign/null origins return 403. Requests without Origin
remain usable by CLI/API clients behind the same deployed private access boundary.

Supported types:

- PDF; PNG, JPEG, WebP, GIF.
- DOCX, PPTX, XLSX using their ZIP container signature; DOC, PPT, XLS using their OLE signature.
- UTF-8 text/Markdown/CSV/JSON/XML/YAML/TOML/logs and common code extensions enumerated in
  worker/utils/material-file.ts. HTML/SVG/code are stored as text/plain and download-only.
- Unknown executable/archive formats are rejected; application/octet-stream is accepted only
  when extension and byte checks identify an allowed type. Explicit conflicting MIME claims fail.

Inspect a bounded signature prefix and validate text incrementally (valid UTF-8, no NUL bytes).
Office checks verify the allowed container signature, not every document entry or macro.
This is type/safety validation, not an antivirus or semantic document parser.

Use a counting stream and native FixedLengthStream to keep R2's known-length requirement
without buffering a complete file in Worker JavaScript. Download bodies also stream.
The provider exposes upload/read/head/delete and optional bounded single-range reads.
No S3 SDK, presigned URL, public R2 domain or new dependency is required.

## Metadata and private delivery

Successful creates return { data: material }; semester lists return { data: material[], nextCursor }.
Safe metadata includes fileUrl for files or externalUrl for links, original filename, MIME,
actual validated size, timestamps, position and course/week/semester context. It never includes
r2Key or another unrestricted storage reference. Week lists retain offset pagination;
semester cursors carry validated timestamp/ID tie-breakers. A preview limit is not a hard list cap.

The server generates an opaque key using owner ID and fresh UUIDs, with no supplied filename/key.
A file is resolved by owned material ID before any R2 read. Link IDs do not redirect through
the file endpoint and the Worker never fetches a submitted external material URL.

Delivery uses private, no-store caching, nosniff, sandbox CSP, same-origin resource policy
and safely encoded Content-Disposition. Only PDF and the allowed raster image MIME types
may be inline; other content downloads. Range supports one bytes interval, suffix or open end,
206 with accurate lengths, and structured 416 with Content-Range for invalid/unsatisfiable requests.
HEAD returns full-file headers. Unknown/broken storage objects produce safe local errors.

## Failure and recovery

1. Verify owned destination and metadata before creating a storage object.
2. Stream/count/validate bytes into a new server-generated key.
3. Insert metadata only after successful storage; guard insertion against lost/foreign parents.
4. On failure, check whether a metadata write actually committed before deleting anything.
   A readable matching committed record can recover the operation as success.
5. If matching metadata exists but ancestry is inaccessible, preserve the bytes without
   exposing that record. If metadata recovery itself is unavailable, preserve bytes rather
   than risk deleting a committed upload.
6. Delete a newly stored key only when its metadata is known absent. Await compensation;
   log cleanup/recovery failures using operation codes and the opaque material ID, never file
   contents, full keys, SQL errors or filenames.

Exceptional D1 recovery/R2 cleanup failures may require operator reconciliation: resolve the
logged material ID against owned D1 metadata and inventory before retrying/removing an object.
Do not blindly delete a prefix or assume an error implies metadata never committed. No new
cleanup table/background job is introduced. Package 4.4 supplies the explicit delete/retry UI
and the coordinated lifecycle described above.

## Migration and verification

The generated 0001_sloppy_phil_sheldon.sql adds only materials_user_updated_idx on
(user_id, updated_at DESC, id DESC). The original migration is unchanged and table count remains 17.
Reviewed/applied to local development D1 and isolated runtime D1; no production migration ran.
The test D1 helper applies all migration SQL in order.

Package 4.3 baseline checks on 2026-10-26:

- 152 unit/API tests, including 30 new material/stream/ownership/recovery/migration/origin checks.
- 45 existing browser regressions using Hono and isolated SQLite.
- npm run test:storage:runtime: build plus one native Workers/D1/R2 integration test, including
  raw upload, actual size mismatch, private GET/HEAD/Range, links/pagination, exactly 50 MB
  streamed upload and over-limit rejection.
- Lint, strict typecheck, formatting and production build.

The runtime test chooses its own local port and unique ignored .wrangler persistence path,
applies migrations/owner seed only there, and shuts down its own process tree. It never seeds
the owner's normal database or contacts production. Ignored runtime fixture directories are
retained for diagnosis. Cloudflare Access/remote R2/production behavior remains unverified.

Package 4.4 verification includes 160 unit/API tests, 56 browser regressions (11 new material
flows), and the extended native Workers/D1/R2 test covering individual/hierarchy deletion
as well as upload, private delivery and the 50 MB boundary. Desktop/mobile captures at
1366, 390 and 320 px were compared with the approved College reference within the 4.4 scope.
The browser fixture uses real local HTTP for download filename/byte checks: Chromium
request interception can cancel attachment downloads ([Playwright issue #28253](https://github.com/microsoft/playwright/issues/28253)).
The native test closes client connections and verifies rejected upload → deletion → healthy
response. Miniflare produced intermittent plain-text Network connection lost responses during
parallel browser/native verification, including after connection closing was added. The final
isolated native run passed without request retries. Run native storage verification separately
from the browser suite; these results do not establish the underlying Miniflare reset cause.
No production Access/remote storage assertion follows from these local checks.

Implementation references: [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/),
[Wrangler local development](https://developers.cloudflare.com/workers/local-development/),
[Drizzle indexes](https://orm.drizzle.team/docs/indexes-constraints).

