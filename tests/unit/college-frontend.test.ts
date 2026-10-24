import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import app from '../../worker/index';
import type { WorkerEnv } from '../../worker/env';
import { createTestD1 } from '../helpers/mock-d1';
import * as api from '../../src/features/college/api/college-api';
import {
  useCreateSemester,
  useDeleteCourse,
  useDeleteSemester,
  useDeleteWeek,
} from '../../src/features/college/api/use-college';
import { queryKeys } from '../../src/lib/query-keys';
import { ApiClientError } from '../../src/lib/api-client';

async function setup(t: TestContext) {
  const db = createTestD1();
  await db.exec('PRAGMA foreign_keys = ON');
  const env = { DB: db } as WorkerEnv['Bindings'];
  const adapter: typeof fetch = async (input, init) => {
    const request =
      input instanceof Request
        ? new Request(input, init)
        : new Request(new URL(String(input), 'http://localhost'), init);
    request.signal.throwIfAborted();
    return app.fetch(request, env);
  };
  t.mock.method(globalThis, 'fetch', adapter);
  return { db, adapter };
}

function captureHook<T>(client: QueryClient, hook: () => T): T {
  let result: T | undefined;
  function Capture() {
    result = hook();
    return null;
  }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Capture)));
  assert.ok(result);
  return result;
}

test('College client CRUD, active semester changes, ordering, and nullable updates reach the real API', async (t) => {
  await setup(t);
  const first = await api.createSemester({ name: ' First ', isActive: true });
  const second = await api.createSemester({ name: 'Second', academicYear: '2026/2027' });
  assert.equal(first.name, 'First');
  await api.updateSemester(second.id, { isActive: true });
  assert.equal((await api.getSemester(first.id)).isActive, false);
  await api.reorderSemesters([second.id, first.id]);
  assert.deepEqual(
    (await api.listSemesters()).map(({ id }) => id),
    [second.id, first.id],
  );

  const course = await api.createCourse(second.id, { name: 'Algorithms', code: 'CS101' });
  const otherCourse = await api.createCourse(second.id, { name: 'Networks' });
  await api.reorderCourses(second.id, [otherCourse.id, course.id]);
  assert.deepEqual(
    (await api.listCourses(second.id)).map(({ id }) => id),
    [otherCourse.id, course.id],
  );
  assert.equal((await api.updateCourse(course.id, { code: null })).code, null);
  assert.equal((await api.getCourse(course.id)).name, 'Algorithms');

  const laterWeek = await api.createWeek(course.id, { weekNumber: 20, notes: 'Reading' });
  const firstWeek = await api.createWeek(course.id, { weekNumber: 2 });
  assert.deepEqual(
    (await api.listWeeks(course.id)).map(({ weekNumber }) => weekNumber),
    [2, 20],
  );
  assert.equal((await api.updateWeek(laterWeek.id, { notes: null })).notes, null);
  assert.equal((await api.getWeek(firstWeek.id)).weekNumber, 2);
  assert.equal(await api.deleteWeek(firstWeek.id), true);
  assert.equal(await api.deleteCourse(otherCourse.id), true);
  assert.equal(await api.deleteSemester(second.id), true);
  assert.deepEqual(await api.listSemesters(), [await api.getSemester(first.id)]);
});

test('College client treats all parent and detail IDs as opaque path segments', async (t) => {
  const { db } = await setup(t);
  const original = await api.createSemester({ name: 'Opaque IDs' });
  const semesterId = 'semester/a ?#%';
  await db.prepare('UPDATE semesters SET id = ? WHERE id = ?').bind(semesterId, original.id).run();
  assert.equal((await api.getSemester(semesterId)).id, semesterId);
  await api.updateSemester(semesterId, { name: 'Updated' });
  const created = await api.createCourse(semesterId, { name: 'Course' });
  const courseId = 'course/a ?#%';
  await db.prepare('UPDATE courses SET id = ? WHERE id = ?').bind(courseId, created.id).run();
  assert.equal((await api.listCourses(semesterId))[0]?.id, courseId);
  assert.equal((await api.getCourse(courseId)).id, courseId);
  await api.updateCourse(courseId, { lecturer: 'Lecturer' });
  await api.reorderCourses(semesterId, [courseId]);
  const createdWeek = await api.createWeek(courseId, { weekNumber: 1 });
  const weekId = 'week/a ?#%';
  await db.prepare('UPDATE weeks SET id = ? WHERE id = ?').bind(weekId, createdWeek.id).run();
  assert.equal((await api.listWeeks(courseId))[0]?.id, weekId);
  assert.equal((await api.getWeek(weekId)).id, weekId);
  await api.updateWeek(weekId, { title: 'Updated' });
  await api.deleteWeek(weekId);
  await api.deleteCourse(courseId);
  await api.deleteSemester(semesterId);
});

test('College client preserves safe API conflicts and aborted query requests', async (t) => {
  await setup(t);
  const semester = await api.createSemester({ name: 'Semester' });
  const course = await api.createCourse(semester.id, { name: 'Course' });
  await api.createWeek(course.id, { weekNumber: 3 });
  await assert.rejects(
    api.createWeek(course.id, { weekNumber: 3 }),
    (error) => error instanceof ApiClientError && error.status === 409 && error.code === 'CONFLICT',
  );
  await assert.rejects(
    api.getCourse('missing'),
    (error) => error instanceof ApiClientError && error.status === 404,
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.listSemesters(controller.signal), { name: 'AbortError' });
});

test('College mutations wait for shared Home/College query refresh', async (t) => {
  const { adapter } = await setup(t);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  t.after(() => client.clear());
  client.setQueryData(queryKeys.college.semesters(), []);
  const observer = new QueryObserver(client, {
    queryKey: queryKeys.college.semesters(),
    queryFn: ({ signal }) => api.listSemesters(signal),
    staleTime: Infinity,
  });
  const unsubscribe = observer.subscribe(() => {});
  t.after(unsubscribe);
  let markStarted!: () => void;
  let releaseRequest!: () => void;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const release = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) === '/api/college/semesters' && init?.method === 'GET') {
      markStarted();
      await release;
    }
    return adapter(input, init);
  });
  const mutation = captureHook(client, useCreateSemester);
  let finished = false;
  const result = mutation.mutateAsync({ name: 'New semester' }).then(() => {
    finished = true;
  });
  await started;
  assert.equal(finished, false);
  releaseRequest();
  await result;
  assert.equal(observer.getCurrentResult().data?.[0]?.name, 'New semester');
});

test('College deletion mutations remove cached descendants before invalidating parent lists', async (t) => {
  await setup(t);
  const client = new QueryClient();
  t.after(() => client.clear());
  const semester = await api.createSemester({ name: 'Semester' });
  const course = await api.createCourse(semester.id, { name: 'Course' });
  const week = await api.createWeek(course.id, { weekNumber: 1 });
  client.setQueryData(queryKeys.college.semesters(), [semester]);
  client.setQueryData(queryKeys.college.semester(semester.id), semester);
  client.setQueryData(queryKeys.college.courses(semester.id), [course]);
  client.setQueryData(queryKeys.college.course(course.id), course);
  client.setQueryData(queryKeys.college.weeks(course.id), [week]);
  client.setQueryData(queryKeys.college.week(week.id), week);
  client.setQueryData(queryKeys.college.materials(week.id), []);
  client.setQueryData(queryKeys.ideas.all, ['unrelated']);
  await captureHook(client, useDeleteWeek).mutateAsync(week.id);
  assert.equal(client.getQueryData(queryKeys.college.week(week.id)), undefined);
  assert.equal(client.getQueryData(queryKeys.college.materials(week.id)), undefined);
  assert.equal(client.getQueryState(queryKeys.college.weeks(course.id))?.isInvalidated, true);

  await captureHook(client, useDeleteCourse).mutateAsync(course.id);
  assert.equal(client.getQueryData(queryKeys.college.course(course.id)), undefined);
  assert.equal(client.getQueryData(queryKeys.college.weeks(course.id)), undefined);
  assert.equal(client.getQueryState(queryKeys.college.courses(semester.id))?.isInvalidated, true);

  await captureHook(client, useDeleteSemester).mutateAsync(semester.id);
  assert.equal(client.getQueryData(queryKeys.college.semester(semester.id)), undefined);
  assert.equal(client.getQueryData(queryKeys.college.courses(semester.id)), undefined);
  assert.equal(client.getQueryState(queryKeys.college.semesters())?.isInvalidated, true);
  assert.deepEqual(client.getQueryData(queryKeys.ideas.all), ['unrelated']);
});

test('a blocked deletion preserves the cached College tree for recovery', async (t) => {
  const { db } = await setup(t);
  const client = new QueryClient();
  t.after(() => client.clear());
  const semester = await api.createSemester({ name: 'Semester' });
  const course = await api.createCourse(semester.id, { name: 'Course' });
  const week = await api.createWeek(course.id, { weekNumber: 1 });
  await db
    .prepare(
      'INSERT INTO materials (id, user_id, week_id, type, title, r2_key, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      'file-1',
      semester.userId,
      week.id,
      'file',
      'Reading',
      'private/reading.pdf',
      0,
      'now',
      'now',
    )
    .run();
  client.setQueryData(queryKeys.college.semester(semester.id), semester);
  client.setQueryData(queryKeys.college.weeks(course.id), [week]);
  await assert.rejects(
    captureHook(client, useDeleteSemester).mutateAsync(semester.id),
    (error) => error instanceof ApiClientError && error.status === 409,
  );
  assert.deepEqual(client.getQueryData(queryKeys.college.semester(semester.id)), semester);
  assert.deepEqual(client.getQueryData(queryKeys.college.weeks(course.id)), [week]);
  assert.equal(client.getQueryState(queryKeys.college.semester(semester.id))?.isInvalidated, false);
});
