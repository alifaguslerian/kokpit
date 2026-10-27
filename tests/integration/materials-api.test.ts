import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import { createTestD1 } from '../helpers/mock-d1';
import { createTestR2 } from '../helpers/mock-r2';
import { MaterialsRepository } from '../../worker/db/repositories/materials.repository';
import { createDb } from '../../worker/db/client';

const ownerId = 'user-owner-1';
const base = '/api/college';

async function setup() {
  const DB = createTestD1(ownerId);
  await DB.exec('PRAGMA foreign_keys = ON');
  const storage = createTestR2();
  const env = { DB, R2: storage.bucket };
  const request = (path: string, method = 'GET', body?: object) =>
    app.request(
      base + path,
      {
        method,
        ...(body
          ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
          : {}),
      },
      env,
    );
  const create = async (path: string, body: object): Promise<{ id: string }> => {
    const response = await request(path, 'POST', body);
    assert.equal(response.status, 201);
    return ((await response.json()) as { data: { id: string } }).data;
  };
  const semester = await create('/semesters', { name: 'Semester 1' });
  const course = await create(`/semesters/${semester.id}/courses`, { name: 'Algorithms' });
  const week = await create(`/courses/${course.id}/weeks`, { weekNumber: 1 });
  const upload = (
    filename: string,
    bytes: Uint8Array,
    type = 'application/pdf',
    size = bytes.length,
  ) =>
    app.request(
      `${base}/weeks/${week.id}/materials/upload?filename=${encodeURIComponent(filename)}&sizeBytes=${size}`,
      {
        method: 'POST',
        headers: { 'Content-Type': type },
        body: new Blob([new Uint8Array(bytes)]),
      },
      env,
    );
  return { DB, env, storage, request, create, semester, course, week, upload };
}

test('file deletion keeps metadata on R2 failure and is safe to retry', async () => {
  const ctx = await setup();
  const uploaded = await ctx.upload(
    'note.txt',
    new TextEncoder().encode('Private note'),
    'text/plain',
  );
  const { data } = (await uploaded.json()) as { data: { id: string; fileUrl: string } };
  ctx.storage.failures.delete = true;
  const failed = await ctx.request(`/materials/${data.id}`, 'DELETE');
  assert.equal(failed.status, 503);
  assert.equal((await ctx.request(`/materials/${data.id}`)).status, 200);
  assert.equal(ctx.storage.objects.size, 1);
  ctx.storage.failures.delete = false;
  assert.equal((await ctx.request(`/materials/${data.id}`, 'DELETE')).status, 200);
  assert.equal(ctx.storage.objects.size, 0);
  assert.equal((await app.request(data.fileUrl, {}, ctx.env)).status, 404);
});

test('a metadata failure after R2 cleanup retains the row and finishes on retry', async () => {
  const ctx = await setup();
  const uploaded = await ctx.upload('note.txt', new TextEncoder().encode('Note'), 'text/plain');
  const { data } = (await uploaded.json()) as { data: { id: string } };
  const prepare = ctx.DB.prepare.bind(ctx.DB);
  ctx.DB.prepare = (query: string) => {
    if (/^delete from "materials"/i.test(query)) throw new Error('private SQL failure');
    return prepare(query);
  };
  const response = await ctx.request(`/materials/${data.id}`, 'DELETE');
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private SQL|r2Key|users\//);
  assert.equal(ctx.storage.objects.size, 0);
  assert.equal((await ctx.request(`/materials/${data.id}`)).status, 200);
  ctx.DB.prepare = prepare;
  assert.equal((await ctx.request(`/materials/${data.id}`, 'DELETE')).status, 200);
  assert.equal((await ctx.request(`/materials/${data.id}`)).status, 404);
});

test('foreign descendants are rejected before deleting any owned bytes', async () => {
  const ctx = await setup();
  await ctx.upload('note.txt', new TextEncoder().encode('Note'), 'text/plain');
  const link = await ctx.create(`/weeks/${ctx.week.id}/materials`, {
    title: 'Foreign',
    externalUrl: 'https://example.com',
  });
  await ctx.DB.prepare(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now')",
  ).run();
  await ctx.DB.prepare('UPDATE materials SET user_id = ? WHERE id = ?')
    .bind('other', link.id)
    .run();
  const before = ctx.storage.calls.length;
  for (const path of [
    `/materials/${link.id}`,
    `/weeks/${ctx.week.id}`,
    `/courses/${ctx.course.id}`,
    `/semesters/${ctx.semester.id}`,
  ])
    assert.equal(
      (await ctx.request(path, 'DELETE')).status,
      path.startsWith('/materials') ? 404 : 409,
    );
  assert.equal(ctx.storage.calls.length, before);
  assert.equal(ctx.storage.objects.size, 1);
});

test('shared or foreign storage keys cannot delete another object', async () => {
  const ctx = await setup();
  const upload = await ctx.upload('note.txt', new TextEncoder().encode('Note'), 'text/plain');
  const { data } = (await upload.json()) as { data: { id: string } };
  const key = [...ctx.storage.objects.keys()][0]!;
  const link = await ctx.create(`/weeks/${ctx.week.id}/materials`, {
    title: 'Corrupt',
    externalUrl: 'https://example.com',
  });
  await ctx.DB.prepare('UPDATE materials SET r2_key = ? WHERE id = ?').bind(key, link.id).run();
  assert.equal((await ctx.request(`/materials/${data.id}`, 'DELETE')).status, 409);
  await ctx.DB.prepare('UPDATE materials SET r2_key = NULL WHERE id = ?').bind(link.id).run();
  await ctx.DB.prepare('UPDATE materials SET r2_key = ? WHERE id = ?')
    .bind('users/other/college/secret', data.id)
    .run();
  assert.equal((await ctx.request(`/materials/${data.id}`, 'DELETE')).status, 409);
  assert.equal(ctx.storage.objects.size, 1);
  assert.equal(ctx.storage.calls.filter((call) => call.operation === 'delete').length, 0);
});

test('hierarchy deletion handles material batches beyond the first hundred', async () => {
  const ctx = await setup();
  for (let index = 0; index < 103; index++)
    await ctx.create(`/weeks/${ctx.week.id}/materials`, {
      title: `Link ${index}`,
      externalUrl: 'https://example.com',
    });
  assert.equal((await ctx.request(`/semesters/${ctx.semester.id}`, 'DELETE')).status, 200);
  const count = await ctx.DB.prepare('SELECT COUNT(*) AS total FROM materials').first<{
    total: number;
  }>();
  assert.equal(count?.total, 0);
});

for (const kind of ['semesters', 'courses', 'weeks']) {
  test(`${kind} deletion removes owned R2 bytes before cascading metadata`, async () => {
    const ctx = await setup();
    await ctx.upload('note.txt', new TextEncoder().encode('Private note'), 'text/plain');
    const parent = kind === 'semesters' ? ctx.semester : kind === 'courses' ? ctx.course : ctx.week;
    assert.equal((await ctx.request(`/${kind}/${parent.id}`, 'DELETE')).status, 200);
    assert.equal(ctx.storage.objects.size, 0);
    assert.equal((await ctx.request(`/weeks/${ctx.week.id}`)).status, 404);
  });
}

test('material links are scoped to an owned week and expose safe metadata', async () => {
  const ctx = await setup();
  const created = await ctx.request(`/weeks/${ctx.week.id}/materials`, 'POST', {
    title: ' Reading ',
    externalUrl: 'https://example.com/reading',
  });
  assert.equal(created.status, 201);
  const { data } = (await created.json()) as { data: Record<string, unknown> };
  assert.equal(data.title, 'Reading');
  assert.equal(data.type, 'link');
  assert.equal(data.externalUrl, 'https://example.com/reading');
  assert.equal('r2Key' in data, false);
  const list = await ctx.request(`/weeks/${ctx.week.id}/materials`);
  assert.equal(list.status, 200);
  assert.equal(((await list.json()) as { data: unknown[] }).data.length, 1);
});

test('semester materials use stable bounded pagination and real course/week context', async () => {
  const ctx = await setup();
  for (const name of ['One', 'Two', 'Three']) {
    await ctx.create(`/weeks/${ctx.week.id}/materials`, {
      title: name,
      externalUrl: 'https://example.com',
    });
  }
  const first = await ctx.request(`/semesters/${ctx.semester.id}/materials?limit=2`);
  assert.equal(first.status, 200);
  const page = (await first.json()) as {
    data: Array<{ id: string; courseName: string; weekNumber: number }>;
    nextCursor: string | null;
  };
  assert.equal(page.data.length, 2);
  assert.equal(page.data[0]?.courseName, 'Algorithms');
  assert.equal(page.data[0]?.weekNumber, 1);
  assert.ok(page.nextCursor);
  const next = await ctx.request(
    `/semesters/${ctx.semester.id}/materials?limit=2&cursor=${encodeURIComponent(page.nextCursor)}`,
  );
  const rest = (await next.json()) as { data: Array<{ id: string }>; nextCursor: string | null };
  assert.equal(rest.data.length, 1);
  assert.equal(new Set([...page.data, ...rest.data].map((item) => item.id)).size, 3);
  assert.equal(rest.nextCursor, null);
});

test('material inputs reject unsafe URLs, invented storage keys and missing parents', async () => {
  const ctx = await setup();
  for (const body of [
    { title: 'Bad', externalUrl: 'javascript:alert(1)' },
    { title: 'Bad', externalUrl: 'https://example.com', r2Key: 'stolen' },
    { title: '', externalUrl: 'https://example.com' },
  ]) {
    const response = await ctx.request(`/weeks/${ctx.week.id}/materials`, 'POST', body);
    assert.equal(response.status, 400);
  }
  assert.equal((await ctx.request('/weeks/missing/materials')).status, 404);
});

const pdf = new TextEncoder().encode('%PDF-1.7\nSample academic material.\n%%EOF');

test('file upload persists private bytes and streams only through an owned material ID', async () => {
  const ctx = await setup();
  const response = await ctx.upload('reading.pdf', pdf);
  assert.equal(response.status, 201);
  const { data } = (await response.json()) as {
    data: { id: string; fileUrl: string; sizeBytes: number };
  };
  assert.equal(data.sizeBytes, pdf.length);
  assert.equal(ctx.storage.objects.size, 1);
  assert.equal('r2Key' in data, false);
  assert.equal(data.fileUrl, `/api/files/${data.id}`);
  const file = await app.request(data.fileUrl, {}, ctx.env);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get('Content-Type'), 'application/pdf');
  assert.equal(file.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(file.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), pdf);
  assert.match(file.headers.get('Content-Disposition') ?? '', /^inline;/);
  const download = await app.request(`${data.fileUrl}?download=true`, {}, ctx.env);
  assert.match(download.headers.get('Content-Disposition') ?? '', /^attachment;/);
});

test('upload checks actual type, actual length, filename and 50 MB limit before exposing a record', async () => {
  const ctx = await setup();
  assert.equal((await ctx.upload('../reading.pdf', pdf)).status, 400);
  assert.equal((await ctx.upload('reading.exe', pdf)).status, 415);
  assert.equal(
    (await ctx.upload('reading.pdf', new TextEncoder().encode('<html>bad</html>'))).status,
    415,
  );
  assert.equal((await ctx.upload('reading.pdf', pdf, 'text/plain')).status, 415);
  assert.equal(
    (await ctx.upload('reading.pdf', pdf, 'application/pdf', 50 * 1024 * 1024 + 1)).status,
    413,
  );
  assert.equal(
    (await ctx.upload('reading.pdf', pdf, 'application/pdf', pdf.length + 1)).status,
    400,
  );
  assert.equal(
    (await ctx.upload('reading.pdf', pdf, 'application/pdf', pdf.length - 1)).status,
    400,
  );
  assert.equal(ctx.storage.objects.size, 0);
  const list = await ctx.request(`/weeks/${ctx.week.id}/materials`);
  assert.deepEqual(((await list.json()) as { data: unknown[] }).data, []);
});

test('partial file requests return correct ranges and reject unsatisfiable ranges safely', async () => {
  const ctx = await setup();
  const response = await ctx.upload('reading.pdf', pdf);
  assert.equal(response.status, 201);
  const { data } = (await response.json()) as { data: { fileUrl: string } };
  for (const [range, expected] of [
    ['bytes=2-5', pdf.slice(2, 6)],
    ['bytes=-4', pdf.slice(-4)],
    ['bytes=4-', pdf.slice(4)],
  ] as const) {
    const part = await app.request(data.fileUrl, { headers: { Range: range } }, ctx.env);
    assert.equal(part.status, 206);
    assert.equal(Number(part.headers.get('Content-Length')), expected.length);
    assert.deepEqual(new Uint8Array(await part.arrayBuffer()), expected);
    assert.ok(part.headers.get('Content-Range'));
  }
  const invalid = await app.request(data.fileUrl, { headers: { Range: 'bytes=9999-' } }, ctx.env);
  assert.equal(invalid.status, 416);
  assert.equal(invalid.headers.get('Content-Range'), `bytes */${pdf.length}`);
  assert.equal((await app.request(data.fileUrl, { method: 'HEAD' }, ctx.env)).status, 200);
});

test('metadata can be renamed and moved without changing storage keys or losing private delivery', async () => {
  const ctx = await setup();
  const response = await ctx.upload('reading.pdf', pdf);
  const { data } = (await response.json()) as { data: { id: string; fileUrl: string } };
  const week = await ctx.create(`/courses/${ctx.course.id}/weeks`, { weekNumber: 2 });
  const originalKeys = [...ctx.storage.objects.keys()];
  const moved = await ctx.request(`/materials/${data.id}`, 'PATCH', {
    weekId: week.id,
    title: 'Moved reading',
  });
  assert.equal(moved.status, 200);
  assert.equal(((await moved.json()) as { data: { weekId: string } }).data.weekId, week.id);
  assert.deepEqual([...ctx.storage.objects.keys()], originalKeys);
  assert.equal((await app.request(data.fileUrl, {}, ctx.env)).status, 200);
  assert.equal(
    (await ctx.request(`/materials/${data.id}`, 'PATCH', { externalUrl: 'https://example.com' }))
      .status,
    400,
  );
  assert.equal(
    (await ctx.request(`/materials/${data.id}`, 'PATCH', { r2Key: 'stolen' })).status,
    400,
  );
  assert.equal((await ctx.request(`/materials/${data.id}`, 'PATCH', {})).status, 400);
  assert.equal(
    (await ctx.request(`/materials/${data.id}`, 'PATCH', { weekId: 'missing' })).status,
    404,
  );
});

test('foreign ownership and inconsistent ancestors prevent every material/file access without touching R2', async () => {
  const ctx = await setup();
  const uploaded = await ctx.upload('reading.pdf', pdf);
  const { data } = (await uploaded.json()) as { data: { id: string; fileUrl: string } };
  await ctx.DB.prepare(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now')",
  ).run();
  await ctx.DB.prepare(
    "UPDATE users SET role = CASE WHEN id = 'other' THEN 'owner' ELSE 'member' END",
  ).run();
  ctx.storage.calls.length = 0;
  for (const path of [
    `/weeks/${ctx.week.id}/materials`,
    `/semesters/${ctx.semester.id}/materials`,
    `/materials/${data.id}`,
  ]) {
    assert.equal((await ctx.request(path)).status, 404, path);
  }
  assert.equal((await ctx.upload('reading.pdf', pdf)).status, 404);
  assert.equal(
    (await ctx.request(`/materials/${data.id}`, 'PATCH', { title: 'stolen' })).status,
    404,
  );
  assert.equal((await app.request(data.fileUrl, {}, ctx.env)).status, 404);
  assert.equal((await app.request(data.fileUrl, { method: 'HEAD' }, ctx.env)).status, 404);
  assert.equal(
    (await app.request(data.fileUrl, { headers: { Range: 'bytes=9999-' } }, ctx.env)).status,
    404,
  );
  assert.equal(ctx.storage.calls.length, 0);
  await ctx.DB.prepare("UPDATE users SET role = CASE WHEN id = ? THEN 'owner' ELSE 'member' END")
    .bind(ownerId)
    .run();
  await ctx.DB.prepare("UPDATE semesters SET user_id = 'other' WHERE id = ?")
    .bind(ctx.semester.id)
    .run();
  assert.equal((await ctx.request(`/materials/${data.id}`)).status, 404);
  assert.equal((await ctx.upload('reading.pdf', pdf)).status, 404);
  assert.equal(
    (await ctx.request(`/materials/${data.id}`, 'PATCH', { title: 'stolen' })).status,
    404,
  );
  assert.equal((await app.request(data.fileUrl, {}, ctx.env)).status, 404);
  assert.equal(ctx.storage.calls.length, 0);
});

test('failed metadata writes roll back newly stored objects and expose safe errors', async (t) => {
  const ctx = await setup();
  const logs: unknown[][] = [];
  t.mock.method(console, 'error', (...args: unknown[]) => logs.push(args));
  await ctx.DB.exec(
    "CREATE TRIGGER fail_material BEFORE INSERT ON materials BEGIN SELECT RAISE(ABORT, 'private database details'); END",
  );
  const response = await ctx.upload('reading.pdf', pdf);
  assert.equal(response.status, 503);
  const text = await response.text();
  assert.doesNotMatch(text, /private|SQL|r2Key|reading\.pdf/);
  assert.equal(ctx.storage.objects.size, 0);
  assert.ok(ctx.storage.calls.some((call) => call.operation === 'delete'));
  assert.ok(logs.length > 0);
  assert.doesNotMatch(JSON.stringify(logs), /private database details|reading\.pdf|%PDF/);
});

test('a committed write followed by a read failure preserves its bytes and recovers the record', async () => {
  const ctx = await setup();
  const prepare = ctx.DB.prepare.bind(ctx.DB);
  let failOnce = true;
  ctx.DB.prepare = (query: string) => {
    const statement = prepare(query);
    if (failOnce && /^select /i.test(query) && query.includes('context_course_id')) {
      const originalBind = statement.bind.bind(statement);
      statement.bind = (...values: unknown[]) => {
        const bound = originalBind(...values);
        bound.raw = async () => {
          failOnce = false;
          throw new Error('lost read after insert');
        };
        return bound;
      };
    }
    return statement;
  };
  const response = await ctx.upload('reading.pdf', pdf);
  assert.equal(response.status, 201);
  assert.equal(ctx.storage.objects.size, 1);
  assert.equal(ctx.storage.calls.filter((call) => call.operation === 'delete').length, 0);
});

test('storage failure leaves metadata untouched, reports safely and does not affect link APIs', async (t) => {
  const ctx = await setup();
  t.mock.method(console, 'error', () => {});
  ctx.storage.failures.put = true;
  const response = await ctx.upload('reading.pdf', pdf);
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private provider details/);
  assert.equal(ctx.storage.objects.size, 0);
  const link = await ctx.create(`/weeks/${ctx.week.id}/materials`, {
    title: 'Reading',
    externalUrl: 'https://example.com',
  });
  assert.ok(link.id);
  const absentStorage = await app.request(
    `${base}/weeks/${ctx.week.id}/materials/upload?filename=reading.pdf&sizeBytes=${pdf.length}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      body: new Blob([pdf]),
    },
    { DB: ctx.DB },
  );
  assert.equal(absentStorage.status, 503);
});

test('text and code are validated as UTF-8 and never served as executable inline content', async () => {
  const ctx = await setup();
  const bytes = new TextEncoder().encode('<script>alert(1)</script>');
  const response = await ctx.upload('example.html', bytes, 'text/html');
  assert.equal(response.status, 201);
  const { data } = (await response.json()) as { data: { fileUrl: string } };
  const file = await app.request(data.fileUrl, {}, ctx.env);
  assert.equal(file.headers.get('Content-Type'), 'text/plain');
  assert.match(file.headers.get('Content-Disposition') ?? '', /^attachment;/);
  assert.equal(await file.text(), '<script>alert(1)</script>');
  const binary = await ctx.upload('bad.txt', new Uint8Array([65, 0, 66]), 'text/plain');
  assert.equal(binary.status, 415);
  const invalidUtf8 = await ctx.upload('bad.txt', new Uint8Array([255, 255]), 'text/plain');
  assert.equal(invalidUtf8.status, 415);
});

test('failed hierarchy cleanup preserves the parent and remaining material for retry', async () => {
  const ctx = await setup();
  assert.equal((await ctx.upload('reading.pdf', pdf)).status, 201);
  ctx.storage.failures.delete = true;
  for (const path of [
    `/weeks/${ctx.week.id}`,
    `/courses/${ctx.course.id}`,
    `/semesters/${ctx.semester.id}`,
  ]) {
    assert.equal((await ctx.request(path, 'DELETE')).status, 503);
  }
  assert.equal(ctx.storage.objects.size, 1);
});

test('the additive recent-material index is applied without changing the baseline tables', async () => {
  const ctx = await setup();
  const index = await ctx.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'materials_user_updated_idx'",
  ).first();
  assert.ok(index);
  const tables = await ctx.DB.prepare(
    "SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  ).first<{ total: number }>();
  assert.equal(tables?.total, 18);
});

test('oversize declarations reject with 413 before inconsistent Content-Length metadata', async () => {
  const ctx = await setup();
  const response = await app.request(
    `${base}/weeks/${ctx.week.id}/materials/upload?filename=big.pdf&sizeBytes=${50 * 1024 * 1024 + 1}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(pdf.length) },
      body: new Blob([pdf]),
    },
    ctx.env,
  );
  assert.equal(response.status, 413);
  assert.equal(ctx.storage.objects.size, 0);
});

test('an inaccessible ancestor after a committed upload cannot cause deletion of its referenced bytes', async () => {
  const ctx = await setup();
  await ctx.DB.prepare(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now')",
  ).run();
  await ctx.DB.exec(
    "CREATE TRIGGER change_parent AFTER INSERT ON materials BEGIN UPDATE semesters SET user_id = 'other'; END",
  );
  const response = await ctx.upload('reading.pdf', pdf);
  assert.equal(response.status, 404);
  assert.equal(ctx.storage.objects.size, 1);
  assert.equal(ctx.storage.calls.filter((call) => call.operation === 'delete').length, 0);
});

test('invalid material pagination, malformed JSON, and file query inputs return structured errors', async () => {
  const ctx = await setup();
  for (const query of ['limit=101', 'limit=0', 'cursor=not-base64', 'sort=title', 'unexpected=1']) {
    assert.equal(
      (await ctx.request(`/semesters/${ctx.semester.id}/materials?${query}`)).status,
      400,
    );
  }
  const bad = await app.request(
    `${base}/weeks/${ctx.week.id}/materials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    },
    ctx.env,
  );
  assert.equal(bad.status, 400);
  const uploaded = await ctx.upload('reading.pdf', pdf);
  const { data } = (await uploaded.json()) as { data: { fileUrl: string } };
  for (const query of ['download=maybe', 'key=private', 'download=true&other=1']) {
    assert.equal((await app.request(`${data.fileUrl}?${query}`, {}, ctx.env)).status, 400);
  }
});

test('a read failure or missing object remains safe and does not corrupt material metadata', async (t) => {
  const ctx = await setup();
  t.mock.method(console, 'error', () => {});
  const uploaded = await ctx.upload('reading.pdf', pdf);
  const { data } = (await uploaded.json()) as { data: { id: string; fileUrl: string } };
  ctx.storage.failures.get = true;
  const failed = await app.request(data.fileUrl, {}, ctx.env);
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /private provider details|r2_key|SQL/);
  ctx.storage.failures.get = false;
  ctx.storage.objects.clear();
  assert.equal((await app.request(data.fileUrl, {}, ctx.env)).status, 404);
  assert.equal((await ctx.request(`/materials/${data.id}`)).status, 200);
});

test('cleanup failure is logged safely and a later request can still succeed', async (t) => {
  const ctx = await setup();
  const logs: unknown[][] = [];
  t.mock.method(console, 'error', (...args: unknown[]) => logs.push(args));
  await ctx.DB.exec(
    "CREATE TRIGGER fail_material BEFORE INSERT ON materials BEGIN SELECT RAISE(ABORT, 'hidden'); END",
  );
  ctx.storage.failures.delete = true;
  assert.equal((await ctx.upload('reading.pdf', pdf)).status, 503);
  assert.equal(ctx.storage.objects.size, 1);
  assert.match(JSON.stringify(logs), /STORAGE_CLEANUP_REQUIRED/);
  assert.doesNotMatch(JSON.stringify(logs), /private provider details|reading\.pdf|users\//);
  await ctx.DB.exec('DROP TRIGGER fail_material');
  ctx.storage.failures.delete = false;
  assert.equal((await ctx.upload('another.pdf', pdf)).status, 201);
});

test('the full allowed filename remains an editable material title', async () => {
  const ctx = await setup();
  const filename = 'a'.repeat(251) + '.pdf';
  const uploaded = await ctx.upload(filename, pdf);
  assert.equal(uploaded.status, 201);
  const { data } = (await uploaded.json()) as { data: { id: string; title: string } };
  assert.equal(data.title, filename);
  assert.equal(
    (await ctx.request(`/materials/${data.id}`, 'PATCH', { title: data.title })).status,
    200,
  );
});

test('uncertain D1 recovery retains bytes rather than deleting a potentially committed file', async (t) => {
  const ctx = await setup();
  t.mock.method(console, 'error', () => {});
  const prepare = ctx.DB.prepare.bind(ctx.DB);
  ctx.DB.prepare = (query) => {
    const statement = prepare(query);
    if (/^select /i.test(query) && query.includes('context_course_id')) {
      const bind = statement.bind.bind(statement);
      statement.bind = (...values: unknown[]) => {
        const bound = bind(...values);
        bound.raw = async () => {
          throw new Error('metadata read unavailable');
        };
        return bound;
      };
    }
    return statement;
  };
  assert.equal((await ctx.upload('reading.pdf', pdf)).status, 503);
  assert.equal(ctx.storage.objects.size, 1);
  assert.equal(ctx.storage.calls.filter((call) => call.operation === 'delete').length, 0);
});

test('metadata repository and public material deletion are owner scoped', async () => {
  const ctx = await setup();
  const link = await ctx.create(`/weeks/${ctx.week.id}/materials`, {
    title: 'Reading',
    externalUrl: 'https://example.com',
  });
  const repository = new MaterialsRepository(createDb(ctx.DB));
  assert.equal(await repository.deleteMetadata(link.id, 'other'), false);
  assert.equal((await ctx.request(`/materials/${link.id}`, 'DELETE')).status, 200);
  assert.equal(await repository.deleteMetadata(link.id, ownerId), false);
  assert.equal((await ctx.request(`/materials/${link.id}`)).status, 404);
});

test('material writes reject a foreign Origin while same-origin and non-browser uploads work', async () => {
  const ctx = await setup();
  const bytes = new TextEncoder().encode('A short note.');
  const path = `${base}/weeks/${ctx.week.id}/materials/upload?filename=notes.txt&sizeBytes=${bytes.length}`;
  const foreign = await app.request(
    path,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Origin: 'https://untrusted.example',
      },
      body: new Blob([bytes]),
    },
    ctx.env,
  );
  assert.equal(foreign.status, 403);
  const foreignMetadata = await app.request(
    `${base}/weeks/${ctx.week.id}/materials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: 'https://untrusted.example' },
      body: JSON.stringify({ title: 'Injected link', externalUrl: 'https://example.com' }),
    },
    ctx.env,
  );
  assert.equal(foreignMetadata.status, 403);
  const foreignPatch = await app.request(
    `${base}/materials/any-id`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' },
      body: JSON.stringify({ title: 'Injected title' }),
    },
    ctx.env,
  );
  assert.equal(foreignPatch.status, 403);
  assert.equal(ctx.storage.objects.size, 0);
  assert.equal(ctx.storage.calls.length, 0);
  const same = await app.request(
    'https://kokpit.example' + path,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Origin: 'https://kokpit.example',
      },
      body: new Blob([bytes]),
    },
    ctx.env,
  );
  assert.equal(same.status, 201);
});

test('metadata JSON is size bounded independently from the raw file stream limit', async () => {
  const ctx = await setup();
  const body = JSON.stringify({ title: 'a'.repeat(40 * 1024), externalUrl: 'https://example.com' });
  const response = await app.request(
    `${base}/weeks/${ctx.week.id}/materials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
    ctx.env,
  );
  assert.equal(response.status, 413);
  assert.equal(ctx.storage.calls.length, 0);
});
