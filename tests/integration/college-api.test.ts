import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import type { WorkerEnv } from '../../worker/env';
import { createTestD1 } from '../helpers/mock-d1';

type Semester = {
  id: string;
  userId: string;
  name: string;
  academicYear: string | null;
  termNumber: number | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};
type Course = {
  id: string;
  userId: string;
  semesterId: string;
  name: string;
  code: string | null;
  lecturer: string | null;
  accentKey: string | null;
  position: number;
};
type Week = {
  id: string;
  userId: string;
  courseId: string;
  weekNumber: number;
  title: string | null;
  notes: string | null;
};

const base = '/api/college';
const ownerId = 'user-owner-1';
const otherId = 'user-other-2';

async function setup() {
  const db = createTestD1(ownerId);
  await db.exec('PRAGMA foreign_keys = ON');
  const env = { DB: db } as WorkerEnv['Bindings'];
  const request = (url: string, method = 'GET', body?: unknown) =>
    app.request(
      `${base}${url}`,
      {
        method,
        ...(body === undefined
          ? {}
          : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      },
      env,
    );
  const data = async <T>(url: string, method = 'GET', body?: unknown): Promise<T> => {
    const response = await request(url, method, body);
    assert.equal(response.status, method === 'POST' ? 201 : 200, `${method} ${url}`);
    return ((await response.json()) as { data: T }).data;
  };
  const semester = (body: object = { name: 'Semester 1' }) =>
    data<Semester>('/semesters', 'POST', body);
  const course = (semesterId: string, body: object = { name: 'Algorithms' }) =>
    data<Course>(`/semesters/${semesterId}/courses`, 'POST', body);
  const week = (courseId: string, body: object = { weekNumber: 1 }) =>
    data<Week>(`/courses/${courseId}/weeks`, 'POST', body);
  return { db, env, request, data, semester, course, week };
}

type Setup = Awaited<ReturnType<typeof setup>>;

async function addOtherUser(db: D1Database) {
  await db
    .prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)')
    .bind(otherId, 'other@example.com', 'Other', 'member', 'now', 'now')
    .run();
}

async function switchOwner(db: D1Database, userId: string) {
  await db.prepare("UPDATE users SET role = 'member'").run();
  await db.prepare("UPDATE users SET role = 'owner' WHERE id = ?").bind(userId).run();
}

async function hierarchy(ctx: Setup) {
  const semester = await ctx.semester();
  const course = await ctx.course(semester.id);
  const week = await ctx.week(course.id);
  return { semester, course, week };
}

async function material(
  db: D1Database,
  weekId: string,
  options?: { file?: boolean; userId?: string },
) {
  const id = crypto.randomUUID();
  await db
    .prepare(
      'INSERT INTO materials (id, user_id, week_id, type, title, original_filename, mime_type, size_bytes, r2_key, external_url, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      options?.userId ?? ownerId,
      weekId,
      options?.file ? 'file' : 'link',
      'Reading',
      options?.file ? 'reading.pdf' : null,
      options?.file ? 'application/pdf' : null,
      options?.file ? 10 : null,
      options?.file ? `users/${ownerId}/college/${id}/reading.pdf` : null,
      options?.file ? null : 'https://example.com/reading',
      0,
      'now',
      'now',
    )
    .run();
  return id;
}

async function error(response: Response, status: number) {
  assert.equal(response.status, status);
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  const body = (await response.json()) as { error: { code: string; message: string } };
  assert.equal(typeof body.error.code, 'string');
  assert.equal(typeof body.error.message, 'string');
  return body;
}

test('College starts with no semesters and creates inactive semesters with normalized metadata', async () => {
  const ctx = await setup();
  assert.deepEqual(await ctx.data('/semesters'), []);
  const created = await ctx.semester({
    name: '  Semester 5  ',
    academicYear: ' 2026/2027 ',
    termNumber: 5,
  });
  assert.ok(created.id);
  assert.equal(created.userId, ownerId);
  assert.equal(created.name, 'Semester 5');
  assert.equal(created.academicYear, '2026/2027');
  assert.equal(created.termNumber, 5);
  assert.equal(created.isActive, false);
  assert.equal(created.position, 0);
  assert.ok(Number.isFinite(Date.parse(created.createdAt)));
  assert.deepEqual(await ctx.data(`/semesters/${created.id}`), created);
  assert.deepEqual(await ctx.data('/semesters'), [created]);
});

test('semester updates persist names and allow clearing optional fields', async () => {
  const ctx = await setup();
  const created = await ctx.semester({ name: 'Old', academicYear: '2025', termNumber: 1 });
  const updated = await ctx.data<Semester>(`/semesters/${created.id}`, 'PATCH', {
    name: ' New ',
    academicYear: null,
    termNumber: null,
  });
  assert.equal(updated.name, 'New');
  assert.equal(updated.academicYear, null);
  assert.equal(updated.termNumber, null);
  assert.equal(updated.id, created.id);
  assert.deepEqual(await ctx.data(`/semesters/${created.id}`), updated);
});

test('explicit activation replaces the active semester only for the current owner', async () => {
  const ctx = await setup();
  await addOtherUser(ctx.db);
  const first = await ctx.semester({ name: 'First', isActive: true });
  const second = await ctx.semester({ name: 'Second', isActive: true });
  assert.equal((await ctx.data<Semester>(`/semesters/${first.id}`)).isActive, false);
  await switchOwner(ctx.db, otherId);
  const foreign = await ctx.semester({ name: 'Other active', isActive: true });
  await switchOwner(ctx.db, ownerId);
  await ctx.data(`/semesters/${first.id}`, 'PATCH', { isActive: true });
  assert.equal((await ctx.data<Semester>(`/semesters/${second.id}`)).isActive, false);
  assert.equal((await ctx.data<Semester>(`/semesters/${first.id}`)).isActive, true);
  assert.equal(
    await ctx.db
      .prepare('SELECT is_active FROM semesters WHERE id = ?')
      .bind(foreign.id)
      .first('is_active'),
    1,
  );
});

for (const action of ['create', 'update'] as const) {
  test(`semester activation during ${action} rolls back deactivation if the target write fails`, async () => {
    const ctx = await setup();
    await ctx.semester({ name: 'Original', isActive: true });
    const target = action === 'update' ? await ctx.semester({ name: 'Target' }) : undefined;
    const original = await ctx.data<Semester[]>('/semesters');
    await ctx.db.exec(
      `CREATE TRIGGER fail_activation BEFORE ${action === 'create' ? 'INSERT' : 'UPDATE'} ON semesters WHEN NEW.name = 'Target' AND NEW.is_active = 1 BEGIN SELECT RAISE(ABORT, 'private trigger failure'); END;`,
    );
    const response =
      action === 'create'
        ? await ctx.request('/semesters', 'POST', { name: 'Target', isActive: true })
        : await ctx.request(`/semesters/${target!.id}`, 'PATCH', { isActive: true });
    assert.deepEqual(await error(response, 500), {
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected internal error occurred.' },
    });
    assert.deepEqual(await ctx.data('/semesters'), original);
  });
}

test('deleting the active semester leaves remaining semesters inactive', async () => {
  const ctx = await setup();
  const active = await ctx.semester({ name: 'Active', isActive: true });
  const inactive = await ctx.semester({ name: 'Inactive' });
  const response = await ctx.request(`/semesters/${active.id}`, 'DELETE');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, id: active.id });
  assert.deepEqual(await ctx.data('/semesters'), [inactive]);
  await error(await ctx.request(`/semesters/${active.id}`), 404);
});

test('courses remain scoped to semesters and persist normalized editable metadata', async () => {
  const ctx = await setup();
  const first = await ctx.semester();
  const second = await ctx.semester({ name: 'Semester 2' });
  assert.deepEqual(await ctx.data(`/semesters/${first.id}/courses`), []);
  const created = await ctx.course(first.id, {
    name: ' Algorithms ',
    code: ' CS101 ',
    lecturer: ' Teacher ',
    accentKey: ' sage ',
  });
  assert.equal(created.semesterId, first.id);
  assert.equal(created.name, 'Algorithms');
  assert.equal(created.code, 'CS101');
  assert.equal(created.lecturer, 'Teacher');
  assert.equal(created.accentKey, 'sage');
  assert.equal(created.position, 0);
  const updated = await ctx.data<Course>(`/courses/${created.id}`, 'PATCH', {
    name: 'Data Structures',
    code: null,
    lecturer: null,
    accentKey: null,
  });
  assert.equal(updated.name, 'Data Structures');
  assert.equal(updated.code, null);
  assert.equal(updated.lecturer, null);
  assert.equal(updated.accentKey, null);
  assert.deepEqual(await ctx.data(`/courses/${created.id}`), updated);
  assert.deepEqual(await ctx.data(`/semesters/${first.id}/courses`), [updated]);
  assert.deepEqual(await ctx.data(`/semesters/${second.id}/courses`), []);
});

test('weeks sort numerically and support numbers beyond fourteen with editable optional notes', async () => {
  const ctx = await setup();
  const parent = await ctx.course((await ctx.semester()).id);
  assert.deepEqual(await ctx.data(`/courses/${parent.id}/weeks`), []);
  const late = await ctx.week(parent.id, {
    weekNumber: 18,
    title: ' Review ',
    notes: ' Read chapters ',
  });
  const early = await ctx.week(parent.id, { weekNumber: 2 });
  assert.equal(late.title, 'Review');
  assert.equal(late.notes, 'Read chapters');
  assert.equal(early.title, null);
  assert.equal(early.notes, null);
  assert.deepEqual(await ctx.data(`/courses/${parent.id}/weeks`), [early, late]);
  const updated = await ctx.data<Week>(`/weeks/${late.id}`, 'PATCH', {
    weekNumber: 20,
    title: null,
    notes: null,
  });
  assert.equal(updated.weekNumber, 20);
  assert.equal(updated.title, null);
  assert.equal(updated.notes, null);
  assert.deepEqual(await ctx.data(`/weeks/${late.id}`), updated);
});

test('week uniqueness is enforced within each course on create and update', async () => {
  const ctx = await setup();
  const semester = await ctx.semester();
  const first = await ctx.course(semester.id);
  const second = await ctx.course(semester.id, { name: 'Networks' });
  await ctx.week(first.id);
  await ctx.week(second.id);
  const week2 = await ctx.week(first.id, { weekNumber: 2 });
  await error(await ctx.request(`/courses/${first.id}/weeks`, 'POST', { weekNumber: 1 }), 409);
  await error(
    await ctx.request(`/weeks/${week2.id}`, 'PATCH', { weekNumber: 1, title: 'Changed' }),
    409,
  );
  assert.deepEqual(await ctx.data(`/weeks/${week2.id}`), week2);
  assert.equal((await ctx.data<Week[]>(`/courses/${first.id}/weeks`)).length, 2);
});

test('College validates JSON shape, fields, integer bounds, and nonempty patches before mutation', async () => {
  const ctx = await setup();
  const { semester, course, week } = await hierarchy(ctx);
  const cases: [string, string, unknown][] = [
    ['/semesters', 'POST', null],
    ['/semesters', 'POST', []],
    ['/semesters', 'POST', { name: ' ' }],
    ['/semesters', 'POST', { name: 'Valid', isActive: 'true' }],
    ['/semesters', 'POST', { name: 'Valid', termNumber: 1.5 }],
    ['/semesters', 'POST', { name: 'Valid', termNumber: 0 }],
    ['/semesters', 'POST', { name: 'Valid', userId: otherId }],
    [`/semesters/${semester.id}`, 'PATCH', {}],
    [`/semesters/${semester.id}`, 'PATCH', { position: 5 }],
    [`/semesters/${semester.id}/courses`, 'POST', { name: 'Valid', semesterId: semester.id }],
    [`/courses/${course.id}`, 'PATCH', { semesterId: semester.id }],
    [`/courses/${course.id}`, 'PATCH', {}],
    [`/courses/${course.id}`, 'PATCH', { lecturer: 3 }],
    [`/courses/${course.id}/weeks`, 'POST', { weekNumber: 0 }],
    [`/courses/${course.id}/weeks`, 'POST', { weekNumber: 1.5 }],
    [`/courses/${course.id}/weeks`, 'POST', { weekNumber: Number.MAX_SAFE_INTEGER + 1 }],
    [`/courses/${course.id}/weeks`, 'POST', { weekNumber: '2' }],
    [`/weeks/${week.id}`, 'PATCH', {}],
    [`/weeks/${week.id}`, 'PATCH', { courseId: course.id }],
  ];
  for (const [url, method, body] of cases) await error(await ctx.request(url, method, body), 400);
  for (const [url, method] of [
    ['/semesters', 'POST'],
    [`/courses/${course.id}`, 'PATCH'],
    [`/weeks/${week.id}`, 'PATCH'],
  ] as const) {
    await error(
      await app.request(
        `${base}${url}`,
        { method, headers: { 'Content-Type': 'application/json' }, body: '{' },
        ctx.env,
      ),
      400,
    );
  }
  assert.deepEqual(await ctx.data('/semesters'), [semester]);
  assert.deepEqual(await ctx.data(`/courses/${course.id}`), course);
  assert.deepEqual(await ctx.data(`/weeks/${week.id}`), week);
});

test('College bounds user text without silently truncating persisted values', async () => {
  const ctx = await setup();
  const { semester, course, week } = await hierarchy(ctx);
  for (const [url, field, length] of [
    [`/semesters/${semester.id}`, 'name', 200],
    [`/semesters/${semester.id}`, 'academicYear', 50],
    [`/courses/${course.id}`, 'name', 200],
    [`/courses/${course.id}`, 'code', 50],
    [`/courses/${course.id}`, 'lecturer', 200],
    [`/courses/${course.id}`, 'accentKey', 64],
    [`/weeks/${week.id}`, 'title', 200],
    [`/weeks/${week.id}`, 'notes', 2000],
  ] as const) {
    await error(await ctx.request(url, 'PATCH', { [field]: 'x'.repeat(length + 1) }), 400);
  }
  assert.deepEqual(await ctx.data(`/weeks/${week.id}`), week);
});

test('missing parents and resources return structured not-found errors', async () => {
  const ctx = await setup();
  const missing = '00000000-0000-4000-8000-000000000000';
  for (const kind of ['semesters', 'courses', 'weeks']) {
    await error(await ctx.request(`/${kind}/${missing}`), 404);
    await error(await ctx.request(`/${kind}/${missing}`, 'DELETE'), 404);
    await error(
      await ctx.request(
        `/${kind}/${missing}`,
        'PATCH',
        kind === 'weeks' ? { title: 'New' } : { name: 'New' },
      ),
      404,
    );
  }
  for (const [url, body] of [
    [`/semesters/${missing}/courses`, { name: 'Course' }],
    [`/courses/${missing}/weeks`, { weekNumber: 1 }],
  ] as const) {
    await error(await ctx.request(url), 404);
    await error(await ctx.request(url, 'POST', body), 404);
  }
});

test('another owner cannot read, mutate, delete, or add to a foreign hierarchy', async () => {
  const ctx = await setup();
  await addOtherUser(ctx.db);
  const original = await hierarchy(ctx);
  await switchOwner(ctx.db, otherId);
  assert.deepEqual(await ctx.data('/semesters'), []);
  for (const [kind, item] of [
    ['semesters', original.semester],
    ['courses', original.course],
    ['weeks', original.week],
  ] as const) {
    await error(await ctx.request(`/${kind}/${item.id}`), 404);
    await error(
      await ctx.request(
        `/${kind}/${item.id}`,
        'PATCH',
        kind === 'weeks' ? { title: 'Hijacked' } : { name: 'Hijacked' },
      ),
      404,
    );
    await error(await ctx.request(`/${kind}/${item.id}`, 'DELETE'), 404);
  }
  for (const [url, body] of [
    [`/semesters/${original.semester.id}/courses`, { name: 'Injected' }],
    [`/courses/${original.course.id}/weeks`, { weekNumber: 2 }],
  ] as const) {
    await error(await ctx.request(url), 404);
    await error(await ctx.request(url, 'POST', body), 404);
  }
  await error(
    await ctx.request(`/semesters/${original.semester.id}/courses/reorder`, 'POST', {
      ids: [original.course.id],
    }),
    404,
  );
  await switchOwner(ctx.db, ownerId);
  assert.deepEqual(await ctx.data(`/semesters/${original.semester.id}`), original.semester);
  assert.deepEqual(await ctx.data(`/courses/${original.course.id}`), original.course);
  assert.deepEqual(await ctx.data(`/weeks/${original.week.id}`), original.week);
});

test('course and week access verifies ancestor ownership even for inconsistent legacy rows', async () => {
  const ctx = await setup();
  await addOtherUser(ctx.db);
  const { semester, course, week } = await hierarchy(ctx);
  await ctx.db
    .prepare('UPDATE semesters SET user_id = ? WHERE id = ?')
    .bind(otherId, semester.id)
    .run();
  for (const url of [`/courses/${course.id}`, `/courses/${course.id}/weeks`, `/weeks/${week.id}`])
    await error(await ctx.request(url), 404);
  await error(await ctx.request(`/courses/${course.id}/weeks`, 'POST', { weekNumber: 2 }), 404);
  await error(await ctx.request(`/courses/${course.id}`, 'PATCH', { name: 'Changed' }), 404);
  await error(await ctx.request(`/weeks/${week.id}`, 'DELETE'), 404);
  await ctx.db
    .prepare('UPDATE semesters SET user_id = ? WHERE id = ?')
    .bind(ownerId, semester.id)
    .run();
  await ctx.db
    .prepare('UPDATE courses SET user_id = ? WHERE id = ?')
    .bind(otherId, course.id)
    .run();
  assert.deepEqual(await ctx.data(`/semesters/${semester.id}/courses`), []);
  await error(await ctx.request(`/weeks/${week.id}`), 404);
  await error(await ctx.request(`/weeks/${week.id}`, 'PATCH', { notes: 'Changed' }), 404);
});

for (const resource of ['semesters', 'courses'] as const) {
  test(`${resource} reorder persists complete contiguous positions within its owner and parent scope`, async () => {
    const ctx = await setup();
    await addOtherUser(ctx.db);
    const parent = await ctx.semester({ name: 'Parent' });
    const otherParent = await ctx.semester({ name: 'Other parent' });
    const first =
      resource === 'semesters' ? parent : await ctx.course(parent.id, { name: 'First' });
    const second =
      resource === 'semesters' ? otherParent : await ctx.course(parent.id, { name: 'Second' });
    const unrelated =
      resource === 'courses' ? await ctx.course(otherParent.id, { name: 'Unrelated' }) : undefined;
    await switchOwner(ctx.db, otherId);
    const foreignParent = await ctx.semester({ name: 'Foreign' });
    const foreign = resource === 'semesters' ? foreignParent : await ctx.course(foreignParent.id);
    await switchOwner(ctx.db, ownerId);
    const url = resource === 'semesters' ? '/semesters' : `/semesters/${parent.id}/courses`;
    const response = await ctx.request(`${url}/reorder`, 'POST', { ids: [second.id, first.id] });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    const listed = await ctx.data<(Semester | Course)[]>(url);
    assert.deepEqual(
      listed.map(({ id, position }) => ({ id, position })),
      [
        { id: second.id, position: 0 },
        { id: first.id, position: 1 },
      ],
    );
    assert.equal(
      await ctx.db
        .prepare(`SELECT position FROM ${resource} WHERE id = ?`)
        .bind(foreign.id)
        .first('position'),
      foreign.position,
    );
    if (unrelated) assert.deepEqual(await ctx.data(`/courses/${unrelated.id}`), unrelated);
  });

  test(`${resource} reorder rejects duplicate, missing, omitted, and out-of-scope IDs without writes`, async () => {
    const ctx = await setup();
    await addOtherUser(ctx.db);
    const parent = await ctx.semester();
    const first = resource === 'semesters' ? parent : await ctx.course(parent.id);
    const second =
      resource === 'semesters'
        ? await ctx.semester({ name: 'Second' })
        : await ctx.course(parent.id, { name: 'Second' });
    await switchOwner(ctx.db, otherId);
    const foreignParent = await ctx.semester({ name: 'Foreign' });
    const foreign = resource === 'semesters' ? foreignParent : await ctx.course(foreignParent.id);
    await switchOwner(ctx.db, ownerId);
    const url = resource === 'semesters' ? '/semesters' : `/semesters/${parent.id}/courses`;
    const original = await ctx.data(url);
    const invalid: unknown[] = [
      { ids: [second.id, second.id] },
      { ids: [second.id, 'missing'] },
      { ids: [first.id] },
      { ids: [second.id, foreign.id] },
      { ids: [] },
      { ids: 'wrong' },
      {},
    ];
    if (resource === 'courses') {
      const otherParent = await ctx.semester({ name: 'Other parent' });
      const sibling = await ctx.course(otherParent.id);
      invalid.push({ ids: [second.id, sibling.id] });
    }
    for (const body of invalid) {
      await error(await ctx.request(`${url}/reorder`, 'POST', body), 400);
      assert.deepEqual(await ctx.data(url), original);
    }
  });

  test(`${resource} reorder rolls back earlier positions when a later update fails`, async () => {
    const ctx = await setup();
    const parent = await ctx.semester({ name: 'First' });
    const first =
      resource === 'semesters' ? parent : await ctx.course(parent.id, { name: 'First' });
    const second =
      resource === 'semesters'
        ? await ctx.semester({ name: 'Second' })
        : await ctx.course(parent.id, { name: 'Second' });
    const url = resource === 'semesters' ? '/semesters' : `/semesters/${parent.id}/courses`;
    const original = await ctx.data(url);
    await ctx.db.exec(
      `CREATE TRIGGER fail_reorder BEFORE UPDATE ON ${resource} WHEN NEW.name = 'First' BEGIN SELECT RAISE(ABORT, 'private reorder failure'); END;`,
    );
    const response = await ctx.request(`${url}/reorder`, 'POST', { ids: [second.id, first.id] });
    assert.deepEqual(await error(response, 500), {
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected internal error occurred.' },
    });
    assert.deepEqual(await ctx.data(url), original);
  });
}

test('course reorder accepts more than one hundred IDs without losing any positions', async () => {
  const ctx = await setup();
  const parent = await ctx.semester();
  const ids = Array.from({ length: 105 }, () => crypto.randomUUID());
  await ctx.db.batch(
    ids.map((id, position) =>
      ctx.db
        .prepare(
          'INSERT INTO courses (id, user_id, semester_id, name, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, ownerId, parent.id, `Course ${position}`, position, 'now', 'now'),
    ),
  );
  const reversed = [...ids].reverse();
  const response = await ctx.request(`/semesters/${parent.id}/courses/reorder`, 'POST', {
    ids: reversed,
  });
  assert.equal(response.status, 200);
  const listed = await ctx.data<Course[]>(`/semesters/${parent.id}/courses`);
  assert.deepEqual(
    listed.map((course) => course.id),
    reversed,
  );
  assert.deepEqual(
    listed.map((course) => course.position),
    Array.from({ length: 105 }, (_, position) => position),
  );
});

for (const resource of ['semesters', 'courses', 'weeks'] as const) {
  test(`${resource} deletion cascades owned link metadata while retaining unrelated hierarchy`, async () => {
    const ctx = await setup();
    const target = await hierarchy(ctx);
    const untouched = await hierarchy(ctx);
    const materialId = await material(ctx.db, target.week.id);
    const untouchedMaterial = await material(ctx.db, untouched.week.id);
    const id =
      resource === 'semesters'
        ? target.semester.id
        : resource === 'courses'
          ? target.course.id
          : target.week.id;
    const response = await ctx.request(`/${resource}/${id}`, 'DELETE');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, id });
    assert.equal(
      await ctx.db.prepare('SELECT id FROM materials WHERE id = ?').bind(materialId).first('id'),
      null,
    );
    assert.equal(
      await ctx.db
        .prepare('SELECT id FROM materials WHERE id = ?')
        .bind(untouchedMaterial)
        .first('id'),
      untouchedMaterial,
    );
    assert.equal(
      await ctx.db.prepare('SELECT id FROM weeks WHERE id = ?').bind(target.week.id).first('id'),
      null,
    );
    if (resource !== 'weeks')
      assert.equal(
        await ctx.db
          .prepare('SELECT id FROM courses WHERE id = ?')
          .bind(target.course.id)
          .first('id'),
        null,
      );
    assert.deepEqual(await ctx.data(`/weeks/${untouched.week.id}`), untouched.week);
  });

  test(`${resource} deletion preserves stored descendants when storage is unavailable or metadata is broken`, async () => {
    const ctx = await setup();
    const target = await hierarchy(ctx);
    const materialId = await material(ctx.db, target.week.id, { file: true });
    const id =
      resource === 'semesters'
        ? target.semester.id
        : resource === 'courses'
          ? target.course.id
          : target.week.id;
    await error(await ctx.request(`/${resource}/${id}`, 'DELETE'), 503);
    await ctx.db.prepare("UPDATE materials SET type = 'link' WHERE id = ?").bind(materialId).run();
    await error(await ctx.request(`/${resource}/${id}`, 'DELETE'), 503);
    await ctx.db
      .prepare("UPDATE materials SET type = 'file', r2_key = NULL WHERE id = ?")
      .bind(materialId)
      .run();
    await error(await ctx.request(`/${resource}/${id}`, 'DELETE'), 409);
    assert.deepEqual(await ctx.data(`/semesters/${target.semester.id}`), target.semester);
    assert.deepEqual(await ctx.data(`/courses/${target.course.id}`), target.course);
    assert.deepEqual(await ctx.data(`/weeks/${target.week.id}`), target.week);
    assert.equal(
      await ctx.db.prepare('SELECT id FROM materials WHERE id = ?').bind(materialId).first('id'),
      materialId,
    );
  });
}

test('hierarchy deletion rejects inconsistent foreign descendants before SQL cascade can remove them', async () => {
  const ctx = await setup();
  await addOtherUser(ctx.db);
  const { semester, course, week } = await hierarchy(ctx);
  await ctx.db
    .prepare('UPDATE courses SET user_id = ? WHERE id = ?')
    .bind(otherId, course.id)
    .run();
  await error(await ctx.request(`/semesters/${semester.id}`, 'DELETE'), 409);
  await ctx.db
    .prepare('UPDATE courses SET user_id = ? WHERE id = ?')
    .bind(ownerId, course.id)
    .run();
  await ctx.db.prepare('UPDATE weeks SET user_id = ? WHERE id = ?').bind(otherId, week.id).run();
  await error(await ctx.request(`/courses/${course.id}`, 'DELETE'), 409);
  await error(await ctx.request(`/semesters/${semester.id}`, 'DELETE'), 409);
  await ctx.db.prepare('UPDATE weeks SET user_id = ? WHERE id = ?').bind(ownerId, week.id).run();
  const materialId = await material(ctx.db, week.id, { userId: otherId });
  for (const url of [`/semesters/${semester.id}`, `/courses/${course.id}`, `/weeks/${week.id}`])
    await error(await ctx.request(url, 'DELETE'), 409);
  assert.deepEqual(await ctx.data(`/weeks/${week.id}`), week);
  assert.equal(
    await ctx.db.prepare('SELECT id FROM materials WHERE id = ?').bind(materialId).first('id'),
    materialId,
  );
});
