/* global document, innerWidth */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
import app from '../../worker/index.ts';
import { createTestD1 } from '../helpers/mock-d1.ts';
import { createTestR2 } from '../helpers/mock-r2.ts';
const { chromium } = createRequire(import.meta.url)(
  process.env.KOKPIT_PLAYWRIGHT_MODULE || 'playwright',
);
const base = process.env.KOKPIT_TEST_BASE_URL || 'http://127.0.0.1:5173';
let browser;
before(async () => {
  browser = await chromium.launch({
    headless: true,
    channel: process.env.KOKPIT_BROWSER_CHANNEL || 'chrome',
  });
});
after(async () => {
  await browser?.close();
});
async function fixture(run, width = 1366) {
  const storage = createTestR2();
  const env = { DB: createTestD1(), R2: storage.bucket };
  await env.DB.exec('PRAGMA foreign_keys = ON');
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  const overrides = new Map();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(base + '/api/**', async (route) => {
    const request = route.request();
    const override = overrides.get(`${request.method()} ${new URL(request.url()).pathname}`);
    if (override && (await override(route))) return;
    const response = await app.request(
      request.url(),
      {
        method: request.method(),
        headers: request.headers(),
        ...(request.postData() ? { body: request.postData() } : {}),
      },
      env,
    );
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    });
  });
  const api = async (route, body) => {
    const response = await app.request(
      '/api/college' + route,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      env,
    );
    assert.equal(response.status, 201, await response.clone().text());
    return (await response.json()).data;
  };
  const semester = await api('/semesters', {
    name: 'Semester 3',
    isActive: true,
    academicYear: '2026/27',
  });
  const course = await api(`/semesters/${semester.id}/courses`, {
    name: 'Algorithms',
    code: 'CS301',
    lecturer: 'Dr. Amelia Chen',
    description: 'Core algorithms and data structures.',
  });
  const capture = async (name) => {
    if (!process.env.KOKPIT_TEST_SCREENSHOTS) return;
    await mkdir(process.env.KOKPIT_TEST_SCREENSHOTS, { recursive: true });
    await page.screenshot({
      path: path.join(process.env.KOKPIT_TEST_SCREENSHOTS, name + '.png'),
      fullPage: true,
    });
  };
  try {
    await run({ page, api, env, storage, semester, course, overrides, capture });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

test('College creates, edits and deletes recurring classes through its schedule editor', async () =>
  fixture(async ({ page, semester, course }) => {
    await page.goto(`${base}/college?semester=${semester.id}`);
    await page.getByRole('button', { name: 'Edit schedule', exact: true }).click();
    const manager = page.getByRole('dialog', { name: 'Edit schedule', exact: true });
    await manager.getByRole('button', { name: 'Add class', exact: true }).click();
    let editor = page.getByRole('dialog', { name: 'Add class', exact: true });
    await editor.getByLabel('Course', { exact: true }).selectOption(course.id);
    await editor.getByLabel('Day', { exact: true }).selectOption('6');
    await editor.getByLabel('Start time').fill('08:30');
    await editor.getByLabel('End time').fill('10:00');
    await editor.getByLabel('Room (optional)').fill('C1.01');
    await editor.getByRole('button', { name: 'Create class', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await manager
      .getByRole('button', { name: 'Edit Algorithms Saturday 08:30', exact: true })
      .click();
    editor = page.getByRole('dialog', { name: 'Edit class', exact: true });
    await editor.getByLabel('Day', { exact: true }).selectOption('7');
    await editor.getByLabel('Ends at midnight (24:00)').check();
    await editor.getByRole('button', { name: 'Save class', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await manager.getByRole('button', { name: 'Close schedule' }).click();
    await page.reload();
    const schedule = page.getByRole('region', { name: 'Weekly Schedule' });
    await schedule.getByText('08:30–24:00', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Edit schedule', exact: true }).click();
    await manager
      .getByRole('button', { name: 'Delete Algorithms Sunday 08:30', exact: true })
      .click();
    const deletion = page.getByRole('dialog', { name: 'Delete class?', exact: true });
    await deletion.getByRole('button', { name: 'Delete class', exact: true }).click();
    await deletion.waitFor({ state: 'hidden' });
    await manager.getByRole('button', { name: 'Close schedule' }).click();
    await schedule.getByRole('heading', { name: 'No classes scheduled', exact: true }).waitFor();
  }));

test('the normal weekday overview shows the complete five-day grid beside real courses and materials', async () =>
  fixture(async ({ page, api, semester, course, capture }) => {
    const database = await api(`/semesters/${semester.id}/courses`, {
      name: 'Database Systems',
      code: 'CS302',
      lecturer: 'Prof. Daniel Park',
      description: 'Data models, relational systems and query languages.',
    });
    const network = await api(`/semesters/${semester.id}/courses`, {
      name: 'Computer Networks',
      code: 'CS303',
      lecturer: 'Dr. Priya Nair',
      description: 'Network architectures, protocols and applications.',
    });
    for (const [courseId, weekday, startMinute, endMinute, room] of [
      [course.id, 1, 540, 650, 'C1.01'],
      [database.id, 2, 660, 750, 'B2.03'],
      [course.id, 3, 540, 650, 'C1.01'],
      [database.id, 4, 660, 750, 'B2.03'],
      [network.id, 5, 780, 870, 'A1.12'],
    ]) {
      await api(`/courses/${courseId}/schedule`, { weekday, startMinute, endMinute, room });
    }
    const week = await api(`/courses/${course.id}/weeks`, { weekNumber: 4 });
    await api(`/weeks/${week.id}/materials`, {
      title: 'Graph traversal summary',
      externalUrl: 'https://example.com/notes',
    });
    await page.goto(`${base}/college?semester=${semester.id}`);
    const schedule = page.getByRole('region', { name: 'Weekly Schedule' });
    await schedule.getByRole('table').waitFor();
    assert.equal(await schedule.getByRole('columnheader').count(), 6);
    assert.equal(await schedule.getByRole('link').count(), 5);
    assert.equal(await schedule.getByRole('columnheader', { name: /Sun|Sat/ }).count(), 0);
    await page
      .getByRole('region', { name: 'Recent Files & Notes' })
      .getByRole('link', { name: 'Graph traversal summary', exact: true })
      .waitFor();
    await capture('college-overview-approved-desktop');
  }, 1600));

test('duplicate and failed class saves preserve the draft, and interval errors remain recoverable', async () =>
  fixture(async ({ page, api, semester, course, overrides }) => {
    await api(`/courses/${course.id}/schedule`, { weekday: 1, startMinute: 540, endMinute: 600 });
    await page.goto(`${base}/college?semester=${semester.id}`);
    await page.getByRole('button', { name: 'Edit schedule', exact: true }).click();
    const manager = page.getByRole('dialog', { name: 'Edit schedule', exact: true });
    await manager.getByRole('button', { name: 'Add class' }).click();
    const editor = page.getByRole('dialog', { name: 'Add class', exact: true });
    await editor.getByLabel('Room (optional)').fill('Draft room');
    await editor.getByRole('button', { name: 'Create class', exact: true }).click();
    await editor.getByRole('alert').filter({ hasText: 'same day and times' }).waitFor();
    assert.equal(await editor.getByLabel('Room (optional)').inputValue(), 'Draft room');
    await editor.getByLabel('Start time').fill('10:30');
    await editor.getByRole('button', { name: 'Create class', exact: true }).click();
    await editor.getByRole('alert').filter({ hasText: 'End time must follow' }).waitFor();
    await editor.getByLabel('End time').fill('11:30');
    overrides.set(`POST /api/college/courses/${course.id}/schedule`, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'UNAVAILABLE', message: 'Unavailable' } }),
      });
      return true;
    });
    await editor.getByRole('button', { name: 'Create class', exact: true }).click();
    await editor.getByRole('alert').filter({ hasText: 'Your changes are here' }).waitFor();
    assert.equal(await editor.getByLabel('Room (optional)').inputValue(), 'Draft room');
    overrides.clear();
    await editor.getByRole('button', { name: 'Create class', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await manager.getByRole('button', { name: 'Edit Algorithms Monday 10:30' }).waitFor();
  }));

test('the pending class form prevents duplicate submissions and keeps keyboard focus inside its dialog', async () =>
  fixture(async ({ page, semester, course, overrides }) => {
    let entered;
    let release;
    const started = new Promise((resolve) => {
      entered = resolve;
    });
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    let requests = 0;
    overrides.set(`POST /api/college/courses/${course.id}/schedule`, async () => {
      requests++;
      entered();
      await gate;
      return false;
    });
    try {
      await page.goto(`${base}/college?semester=${semester.id}`);
      const trigger = page.getByRole('button', { name: 'Edit schedule', exact: true });
      await trigger.click();
      const manager = page.getByRole('dialog', { name: 'Edit schedule', exact: true });
      const add = manager.getByRole('button', { name: 'Add class' });
      await add.click();
      const editor = page.getByRole('dialog', { name: 'Add class', exact: true });
      for (let index = 0; index < 14; index++) {
        await page.keyboard.press('Tab');
        assert.ok(await editor.evaluate((dialog) => dialog.contains(document.activeElement)));
      }
      await editor.getByRole('button', { name: 'Create class', exact: true }).click();
      await started;
      assert.equal(await editor.getByLabel('Start time').isDisabled(), true);
      await page.keyboard.press('Escape');
      assert.equal(await editor.isVisible(), true);
      release();
      await editor.waitFor({ state: 'hidden' });
      assert.equal(requests, 1);
      assert.ok(await add.evaluate((button) => button === document.activeElement));
      await page.keyboard.press('Escape');
      await manager.waitFor({ state: 'hidden' });
      assert.ok(await trigger.evaluate((button) => button === document.activeElement));
    } finally {
      release();
    }
  }));

test('schedule load failures stay local, retry restores real classes and semester switching never activates one', async () =>
  fixture(async ({ page, api, env, semester, course, overrides }) => {
    const { id: otherSemester } = await api('/semesters', { name: 'Semester 2' });
    const other = await api(`/semesters/${otherSemester}/courses`, { name: 'Databases' });
    await api(`/courses/${other.id}/schedule`, {
      weekday: 5,
      startMinute: 1000,
      endMinute: 1100,
      room: 'B2',
    });
    overrides.set(`GET /api/college/semesters/${semester.id}/schedule`, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'UNAVAILABLE', message: 'Unavailable' } }),
      });
      return true;
    });
    await page.goto(`${base}/college?semester=${semester.id}`);
    const schedule = page.getByRole('region', { name: 'Weekly Schedule' });
    await schedule.getByRole('heading', { name: 'College could not load' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: course.name, exact: true }).count(), 1);
    overrides.clear();
    await schedule.getByRole('button', { name: /try again/i }).click();
    await schedule.getByRole('heading', { name: 'No classes scheduled' }).waitFor();
    await page.getByLabel('Semester', { exact: true }).selectOption(otherSemester);
    await schedule.getByRole('link', { name: /Databases.*16:40–18:20/ }).waitFor();
    assert.equal(
      await env.DB.prepare('SELECT is_active FROM semesters WHERE id = ?')
        .bind(semester.id)
        .first('is_active'),
      1,
    );
    assert.equal(
      await env.DB.prepare('SELECT is_active FROM semesters WHERE id = ?')
        .bind(otherSemester)
        .first('is_active'),
      0,
    );
  }));

test('overview course deletion clears its classes and returns keyboard focus to the course list', async () =>
  fixture(async ({ page, api, semester, course }) => {
    await api(`/courses/${course.id}/schedule`, { weekday: 1, startMinute: 540, endMinute: 600 });
    await page.goto(`${base}/college?semester=${semester.id}`);
    const options = page.getByLabel(`Options for ${course.name}`, { exact: true });
    await options.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Delete course', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Delete course?', exact: true });
    await dialog.getByRole('button', { name: 'Delete course', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { name: 'No courses yet', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'No classes scheduled', exact: true }).waitFor();
    assert.ok(
      await page
        .getByRole('heading', { name: 'Courses', exact: true })
        .evaluate((element) => element === document.activeElement),
    );
  }));

test('course row menus save and clear the complete description without losing hierarchy navigation', async () =>
  fixture(async ({ page, semester, course }) => {
    await page.goto(`${base}/college?semester=${semester.id}`);
    await page.getByLabel(`Options for ${course.name}`, { exact: true }).click();
    await page.getByRole('button', { name: 'Edit course', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Edit course', exact: true });
    const description = 'A complete course description. '.repeat(50);
    await editor.getByLabel('Description', { exact: true }).fill(description);
    await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.getByRole('link', { name: course.name, exact: true }).click();
    await page.locator('main').getByText(description.trim(), { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Edit course', exact: true }).click();
    await editor.getByLabel('Description', { exact: true }).fill('');
    await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    assert.equal(
      await page.locator('main').getByText(description.trim(), { exact: true }).count(),
      0,
    );
  }));

for (const width of [1600, 1366, 390, 320])
  test(`College schedule keeps overlaps weekends and long names readable at ${width}px`, async () =>
    fixture(async ({ page, api, semester, course, capture }) => {
      const second = await api(`/semesters/${semester.id}/courses`, {
        name: width < 500 ? 'Long_course_name_'.repeat(11) : 'Database Systems',
        code: 'CS302',
        lecturer: 'Prof. Daniel Park',
        description: 'Data models, relational systems and query languages.',
      });
      await api(`/courses/${course.id}/schedule`, {
        weekday: 1,
        startMinute: 5,
        endMinute: 35,
        room: 'A1.12',
      });
      await api(`/courses/${course.id}/schedule`, {
        weekday: 1,
        startMinute: 540,
        endMinute: 660,
        room: 'C1.01',
      });
      await api(`/courses/${second.id}/schedule`, {
        weekday: 1,
        startMinute: 540,
        endMinute: 600,
        room: width < 500 ? 'Long_room_'.repeat(12) : 'B2.03',
      });
      await api(`/courses/${second.id}/schedule`, {
        weekday: 3,
        startMinute: 817,
        endMinute: 900,
        room: 'Lab 1',
      });
      await api(`/courses/${course.id}/schedule`, {
        weekday: 7,
        startMinute: 1395,
        endMinute: 1440,
        room: 'C1.01',
      });
      const week = await api(`/courses/${course.id}/weeks`, { weekNumber: 4 });
      await api(`/weeks/${week.id}/materials`, {
        title: 'Graph traversal summary',
        externalUrl: 'https://example.com/notes',
      });
      await page.goto(`${base}/college?semester=${semester.id}`);
      const schedule = page.getByRole('region', { name: 'Weekly Schedule' });
      await schedule.getByRole('link', { name: /Algorithms.*23:15–24:00/ }).waitFor();
      assert.equal(await schedule.getByRole('link', { name: /09:00/ }).count(), 2);
      await schedule.getByRole('link', { name: /13:37–15:00/ }).waitFor();
      if (width < 500) {
        assert.equal(await schedule.getByRole('table').count(), 0);
        await schedule.getByRole('heading', { name: /Sunday/ }).waitFor();
      } else {
        assert.equal(await schedule.getByRole('table').count(), 1);
      }
      await capture(`college-schedule-${width}`);
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll('main *')]
          .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
          .map((element) => ({ tag: element.tagName, classes: element.className }))
          .slice(-12),
      );
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        JSON.stringify(overflow),
      );
      await schedule.getByRole('link', { name: /Algorithms.*23:15–24:00/ }).click();
      await page.getByRole('heading', { name: 'Algorithms', level: 1, exact: true }).waitFor();
    }, width));
