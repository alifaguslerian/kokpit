import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import { createTestD1 } from '../helpers/mock-d1';
import { createTestR2 } from '../helpers/mock-r2';

const ownerId = 'user-owner-1';
async function fixture() {
  const DB = createTestD1(ownerId);
  await DB.exec('PRAGMA foreign_keys = ON');
  const storage = createTestR2();
  const env = { DB, R2: storage.bucket };
  const request = (path: string, method = 'GET', body?: object) =>
    app.request(
      '/api/college' + path,
      {
        method,
        ...(body
          ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
          : {}),
      },
      env,
    );
  const create = async (path: string, body: object) => {
    const response = await request(path, 'POST', body);
    assert.equal(response.status, 201, await response.clone().text());
    return (await response.json()) as { data: { id: string; description?: string | null } };
  };
  const { data: semester } = await create('/semesters', { name: 'Semester' });
  const { data: course } = await create(`/semesters/${semester.id}/courses`, {
    name: 'Algorithms',
  });
  return { DB, env, storage, request, create, semester, course };
}

test('schedule CRUD keeps all overlapping and weekend classes and rejects exact duplicates', async () => {
  const ctx = await fixture();
  const input = { weekday: 6, startMinute: 570, endMinute: 660, room: ' A.12 ' };
  const { data: entry } = await ctx.create(`/courses/${ctx.course.id}/schedule`, input);
  const duplicate = await ctx.request(`/courses/${ctx.course.id}/schedule`, 'POST', input);
  assert.equal(duplicate.status, 409);
  await ctx.create(`/courses/${ctx.course.id}/schedule`, { ...input, startMinute: 600 });
  const response = await ctx.request(`/semesters/${ctx.semester.id}/schedule`);
  const result = (await response.json()) as {
    data: Array<{ id: string; courseName: string; room: string }>;
    timezone: string;
    week: { start: string; end: string };
  };
  assert.equal(response.status, 200);
  assert.equal(result.data.length, 2);
  assert.equal(result.data[0]?.courseName, 'Algorithms');
  assert.equal(result.data[0]?.room, 'A.12');
  assert.equal(result.timezone, 'Asia/Jakarta');
  assert.match(result.week.start, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(
    (await ctx.request(`/schedule/${entry.id}`, 'PATCH', { weekday: 7, endMinute: 1440, room: '' }))
      .status,
    200,
  );
  assert.equal((await ctx.request(`/schedule/${entry.id}`, 'DELETE')).status, 200);
  assert.equal((await ctx.request(`/schedule/${entry.id}`, 'DELETE')).status, 404);
});

test('course descriptions are optional plain text that can be edited and cleared', async () => {
  const ctx = await fixture();
  const { data: course } = await ctx.create(`/semesters/${ctx.semester.id}/courses`, {
    name: 'Databases',
    description: ' Relational models ',
  });
  assert.equal(course.description, 'Relational models');
  const changed = await ctx.request(`/courses/${course.id}`, 'PATCH', { description: 'SQL notes' });
  assert.equal(changed.status, 200);
  const cleared = await ctx.request(`/courses/${course.id}`, 'PATCH', { description: '  ' });
  assert.equal(
    ((await cleared.json()) as { data: { description: string | null } }).data.description,
    null,
  );
  assert.equal(
    (await ctx.request(`/courses/${course.id}`, 'PATCH', { description: 'x'.repeat(2001) })).status,
    400,
  );
});

test('schedule validates minute bounds, full intervals and bounded metadata without changing saved classes', async () => {
  const ctx = await fixture();
  const input = { weekday: 1, startMinute: 540, endMinute: 600 };
  for (const extra of [
    { weekday: 0 },
    { weekday: 8 },
    { weekday: 1.5 },
    { weekday: '1' },
    { startMinute: -1 },
    { startMinute: 1440 },
    { startMinute: 540.5 },
    { endMinute: 0 },
    { endMinute: 1441 },
    { endMinute: 540 },
    { endMinute: 500 },
    { room: 'x'.repeat(121) },
    { userId: ownerId },
    { semesterId: ctx.semester.id },
  ])
    assert.equal(
      (await ctx.request(`/courses/${ctx.course.id}/schedule`, 'POST', { ...input, ...extra }))
        .status,
      400,
    );
  const { data: entry } = await ctx.create(`/courses/${ctx.course.id}/schedule`, input);
  assert.equal(
    (await ctx.request(`/schedule/${entry.id}`, 'PATCH', { startMinute: 700 })).status,
    400,
  );
  assert.equal((await ctx.request(`/schedule/${entry.id}`, 'PATCH', {})).status, 400);
  assert.equal(
    (await ctx.request(`/schedule/${entry.id}`, 'PATCH', { courseId: 'missing' })).status,
    404,
  );
  assert.equal(
    (await ctx.request(`/semesters/${ctx.semester.id}/schedule?timezone=UTC`)).status,
    400,
  );
  const rows = (await (await ctx.request(`/semesters/${ctx.semester.id}/schedule`)).json()) as {
    data: Array<{ startMinute: number }>;
  };
  assert.equal(rows.data.length, 1);
  assert.equal(rows.data[0]?.startMinute, 540);
  const oversized = await app.request(
    `/api/college/courses/${ctx.course.id}/schedule`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, room: 'x'.repeat(40 * 1024) }),
    },
    ctx.env,
  );
  assert.equal(oversized.status, 413);
});

test('schedule updates prevent duplicates and permit a different course only in the same semester', async () => {
  const ctx = await fixture();
  const input = { weekday: 7, startMinute: 0, endMinute: 1440, room: 'Hall' };
  const { data: first } = await ctx.create(`/courses/${ctx.course.id}/schedule`, input);
  const { data: second } = await ctx.create(`/courses/${ctx.course.id}/schedule`, {
    ...input,
    startMinute: 1,
  });
  assert.equal(
    (await ctx.request(`/schedule/${second.id}`, 'PATCH', { startMinute: 0 })).status,
    409,
  );
  const { data: otherCourse } = await ctx.create(`/semesters/${ctx.semester.id}/courses`, {
    name: 'Databases',
  });
  const moved = await ctx.request(`/schedule/${first.id}`, 'PATCH', {
    courseId: otherCourse.id,
    room: null,
  });
  assert.equal(moved.status, 200);
  assert.equal(((await moved.json()) as { data: { room: string | null } }).data.room, null);
  const { data: otherSemester } = await ctx.create('/semesters', { name: 'Other semester' });
  const { data: outside } = await ctx.create(`/semesters/${otherSemester.id}/courses`, {
    name: 'Networks',
  });
  assert.equal(
    (await ctx.request(`/schedule/${first.id}`, 'PATCH', { courseId: outside.id })).status,
    404,
  );
});

test('another owner and inconsistent course ancestry cannot read, mutate or attach schedule entries', async () => {
  const ctx = await fixture();
  const input = { weekday: 2, startMinute: 540, endMinute: 600 };
  const { data: entry } = await ctx.create(`/courses/${ctx.course.id}/schedule`, input);
  await ctx.DB.prepare(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now')",
  ).run();
  await ctx.DB.prepare(
    "UPDATE users SET role = CASE WHEN id = 'other' THEN 'owner' ELSE 'member' END",
  ).run();
  for (const [path, method, body] of [
    [`/semesters/${ctx.semester.id}/schedule`, 'GET', undefined],
    [`/courses/${ctx.course.id}/schedule`, 'POST', input],
    [`/schedule/${entry.id}`, 'PATCH', { room: 'Changed' }],
    [`/schedule/${entry.id}`, 'DELETE', undefined],
  ] as const)
    assert.equal((await ctx.request(path, method, body)).status, 404);
  await ctx.DB.prepare("UPDATE users SET role = CASE WHEN id = ? THEN 'owner' ELSE 'member' END")
    .bind(ownerId)
    .run();
  await ctx.DB.prepare('UPDATE semesters SET user_id = ? WHERE id = ?')
    .bind('other', ctx.semester.id)
    .run();
  assert.equal((await ctx.request(`/schedule/${entry.id}`, 'DELETE')).status, 404);
  assert.equal(
    (await ctx.request(`/courses/${ctx.course.id}/schedule`, 'POST', { ...input, weekday: 3 }))
      .status,
    404,
  );
});

test('saved owner timezone controls the schedule week and invalid timezone failure is isolated', async (t) => {
  const ctx = await fixture();
  await ctx.DB.prepare(
    'INSERT INTO user_settings (user_id, timezone, created_at, updated_at) VALUES (?, ?, ?, ?)',
  )
    .bind(ownerId, 'Pacific/Kiritimati', 'now', 'now')
    .run();
  const result = (await (await ctx.request(`/semesters/${ctx.semester.id}/schedule`)).json()) as {
    timezone: string;
  };
  assert.equal(result.timezone, 'Pacific/Kiritimati');
  await ctx.DB.prepare('UPDATE user_settings SET timezone = ? WHERE user_id = ?')
    .bind('Invalid/Timezone', ownerId)
    .run();
  t.mock.method(console, 'error', () => {});
  const failed = await ctx.request(`/semesters/${ctx.semester.id}/schedule`);
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /RangeError|Invalid\/Timezone|SELECT|stack/);
  assert.equal((await ctx.request(`/courses/${ctx.course.id}`)).status, 200);
});

test('schedule writes reject foreign browser origins while same-origin requests work', async () => {
  const ctx = await fixture();
  const url = `https://kokpit.example/api/college/courses/${ctx.course.id}/schedule`;
  const input = { weekday: 1, startMinute: 540, endMinute: 600 };
  const foreign = await app.request(
    url,
    {
      method: 'POST',
      headers: { Origin: 'https://untrusted.example', 'Content-Type': 'text/plain' },
      body: JSON.stringify(input),
    },
    ctx.env,
  );
  assert.equal(foreign.status, 403);
  const same = await app.request(
    url,
    {
      method: 'POST',
      headers: { Origin: 'https://kokpit.example', 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    ctx.env,
  );
  assert.equal(same.status, 201);
});

for (const resource of ['courses', 'semesters'])
  test(`${resource} cascade schedule entries only after owned file cleanup succeeds`, async (t) => {
    const ctx = await fixture();
    const { data: entry } = await ctx.create(`/courses/${ctx.course.id}/schedule`, {
      weekday: 1,
      startMinute: 540,
      endMinute: 600,
    });
    const { data: week } = await ctx.create(`/courses/${ctx.course.id}/weeks`, { weekNumber: 1 });
    const text = new TextEncoder().encode('Private note');
    const file = await app.request(
      `/api/college/weeks/${week.id}/materials/upload?filename=notes.txt&sizeBytes=${text.length}`,
      { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: new Blob([text]) },
      ctx.env,
    );
    assert.equal(file.status, 201);
    const parent = resource === 'courses' ? ctx.course.id : ctx.semester.id;
    ctx.storage.failures.delete = true;
    t.mock.method(console, 'error', () => {});
    assert.equal((await ctx.request(`/${resource}/${parent}`, 'DELETE')).status, 503);
    assert.ok(
      await ctx.DB.prepare('SELECT id FROM course_schedule_entries WHERE id = ?')
        .bind(entry.id)
        .first(),
    );
    ctx.storage.failures.delete = false;
    assert.equal((await ctx.request(`/${resource}/${parent}`, 'DELETE')).status, 200);
    assert.equal(
      await ctx.DB.prepare('SELECT id FROM course_schedule_entries WHERE id = ?')
        .bind(entry.id)
        .first(),
      null,
    );
    assert.equal(ctx.storage.objects.size, 0);
  });

test('week and material deletion leave recurring classes intact; foreign class metadata blocks parent cascade', async () => {
  const ctx = await fixture();
  const { data: entry } = await ctx.create(`/courses/${ctx.course.id}/schedule`, {
    weekday: 1,
    startMinute: 540,
    endMinute: 600,
  });
  const { data: week } = await ctx.create(`/courses/${ctx.course.id}/weeks`, { weekNumber: 1 });
  const { data: link } = await ctx.create(`/weeks/${week.id}/materials`, {
    title: 'Reading',
    externalUrl: 'https://example.com',
  });
  assert.equal((await ctx.request(`/materials/${link.id}`, 'DELETE')).status, 200);
  assert.equal((await ctx.request(`/weeks/${week.id}`, 'DELETE')).status, 200);
  assert.ok(
    await ctx.DB.prepare('SELECT id FROM course_schedule_entries WHERE id = ?')
      .bind(entry.id)
      .first(),
  );
  await ctx.DB.prepare(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now')",
  ).run();
  await ctx.DB.prepare('UPDATE course_schedule_entries SET user_id = ? WHERE id = ?')
    .bind('other', entry.id)
    .run();
  assert.equal((await ctx.request(`/courses/${ctx.course.id}`, 'DELETE')).status, 409);
  assert.equal((await ctx.request(`/semesters/${ctx.semester.id}`, 'DELETE')).status, 409);
  assert.ok(
    await ctx.DB.prepare('SELECT id FROM course_schedule_entries WHERE id = ?')
      .bind(entry.id)
      .first(),
  );
});
