/* global document, innerWidth, history, dispatchEvent, PopStateEvent, getComputedStyle */
import test, { before, after } from 'node:test';
import process from 'node:process';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { URL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import app from '../../worker/index.ts';
import { createTestD1 } from '../helpers/mock-d1.ts';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.KOKPIT_PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.KOKPIT_TEST_BASE_URL || 'http://127.0.0.1:5173';
const outputDirectory = process.env.KOKPIT_TEST_SCREENSHOTS;
const base = '/api/college';
let browser;

before(async () => {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.KOKPIT_BROWSER_CHANNEL ? { channel: process.env.KOKPIT_BROWSER_CHANNEL } : {}),
  });
  if (outputDirectory) await mkdir(outputDirectory, { recursive: true });
});

after(async () => {
  await browser?.close();
});

async function fixture(run, { width = 1366, height = 900 } = {}) {
  const env = { DB: createTestD1() };
  await env.DB.exec('PRAGMA foreign_keys = ON');
  const context = await browser.newContext({
    viewport: { width, height },
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  const overrides = new Map();
  page.on('pageerror', (error) => errors.push(error.message));
  const api = async (endpoint, method = 'GET', body) => {
    const response = await app.request(
      base + endpoint,
      {
        method,
        ...(body === undefined
          ? {}
          : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      },
      env,
    );
    return { status: response.status, body: await response.json() };
  };
  const create = async (endpoint, body) => {
    const response = await api(endpoint, 'POST', body);
    assert.equal(response.status, 201, `Seed ${endpoint}: ${JSON.stringify(response.body)}`);
    return response.body.data;
  };
  await page.route(`${baseUrl}/api/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const override = overrides.get(`${request.method()} ${url.pathname}`);
    if (override && (await override(route))) return;
    const response = await app.request(
      url.pathname + url.search,
      {
        method: request.method(),
        headers: request.headers(),
        ...(request.postData() ? { body: request.postData() } : {}),
      },
      env,
    );
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: await response.text(),
    });
  });
  const go = async (route) => {
    await page.goto(baseUrl + route);
    await page.waitForLoadState('networkidle');
  };
  const screenshot = async (name) => {
    const listStyles = await page
      .locator('main ul, main ol')
      .evaluateAll((lists) => lists.map((list) => getComputedStyle(list).listStyleType));
    assert.ok(
      listStyles.every((style) => style === 'none'),
      'College lists must not show native markers',
    );
    if (outputDirectory) {
      await page.screenshot({ path: path.join(outputDirectory, `${name}.png`), fullPage: true });
    }
  };
  try {
    await run({ page, api, create, go, overrides, db: env.DB, screenshot });
    assert.deepEqual(errors, [], 'College flows must not cause unhandled browser errors');
  } finally {
    await context.close();
  }
}

test('College creates a semester through its accessible form and persists active selection', async () => {
  await fixture(async ({ page, api, go }) => {
    await go('/college');
    await page.getByRole('heading', { name: 'College', exact: true, level: 1 }).waitFor();
    await page.getByRole('button', { name: 'Add semester', exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Add semester', exact: true });
    await dialog.getByLabel('Semester name', { exact: true }).fill('Browser semester');
    await dialog.getByLabel('Academic year', { exact: true }).fill('2026/2027');
    await dialog.getByLabel('Term number', { exact: true }).fill('5');
    await dialog.getByLabel('Use as active semester', { exact: true }).check();
    await dialog.getByRole('button', { name: 'Create semester', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    const semesters = (await api('/semesters')).body.data;
    assert.equal(semesters.length, 1);
    assert.equal(semesters[0].name, 'Browser semester');
    assert.equal(semesters[0].academicYear, '2026/2027');
    assert.equal(semesters[0].termNumber, 5);
    assert.equal(semesters[0].isActive, true);
    await page.reload();
    await page.getByRole('button', { name: 'Edit semester', exact: true }).waitFor();
    assert.equal(await page.getByLabel('Semester', { exact: true }).inputValue(), semesters[0].id);
  });
});

async function hierarchy(
  create,
  { semesterName = 'Browser term', courseName = 'Algorithms' } = {},
) {
  const semester = await create('/semesters', { name: semesterName, isActive: true });
  const course = await create(`/semesters/${semester.id}/courses`, { name: courseName });
  const week = await create(`/courses/${course.id}/weeks`, {
    weekNumber: 18,
    title: 'Beyond fourteen',
    notes: 'Read the lecture notes.',
  });
  return { semester, course, week };
}

async function submitDialog(page, name, button, fields) {
  const dialog = page.getByRole('dialog', { name, exact: true });
  for (const [label, value] of Object.entries(fields)) {
    await dialog.getByLabel(label, { exact: true }).fill(value);
  }
  await dialog.getByRole('button', { name: button, exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
}

async function confirmDelete(page, entity) {
  await page.getByRole('button', { name: `Delete ${entity}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `Delete ${entity}?`, exact: true });
  await dialog.getByRole('button', { name: `Delete ${entity}`, exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
}

const unavailable = async (route) => {
  await route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({
      error: { code: 'TEST_UNAVAILABLE', message: 'Temporarily unavailable.' },
    }),
  });
  return true;
};

test('semester, course and week metadata can be edited and deleted through confirmed forms', async () => {
  await fixture(async ({ page, create, api, go }) => {
    const semester = await create('/semesters', { name: 'Initial term', isActive: true });
    await go('/college');
    await page.getByRole('button', { name: 'Edit semester', exact: true }).click();
    await submitDialog(page, 'Edit semester', 'Save changes', {
      'Semester name': 'Revised term',
      'Academic year': '2027/2028',
      'Term number': '7',
    });
    assert.equal((await api(`/semesters/${semester.id}`)).body.data.name, 'Revised term');
    await page.getByRole('button', { name: 'Add course', exact: true }).first().click();
    await submitDialog(page, 'Add course', 'Create course', {
      'Course name': 'Networks',
      'Course code': 'NET101',
      Lecturer: 'Dr Browser',
    });
    const course = (await api(`/semesters/${semester.id}/courses`)).body.data[0];
    assert.equal(course.code, 'NET101');
    assert.equal(course.lecturer, 'Dr Browser');
    await page.locator(`a[href="/college/courses/${course.id}"]`).first().click();
    await page.getByRole('button', { name: 'Edit course', exact: true }).click();
    await submitDialog(page, 'Edit course', 'Save changes', {
      'Course name': 'Network Systems',
      'Course code': 'NET202',
      Lecturer: 'Professor Browser',
    });
    assert.equal((await api(`/courses/${course.id}`)).body.data.name, 'Network Systems');
    await page.getByRole('button', { name: 'Add week', exact: true }).first().click();
    await submitDialog(page, 'Add week', 'Create week', {
      'Week number': '18',
      'Week title': 'Routing',
      Notes: 'A saved week note.',
    });
    const week = (await api(`/courses/${course.id}/weeks`)).body.data[0];
    assert.equal(week.weekNumber, 18, 'A course is not limited to fourteen weeks');
    await page.locator(`a[href="/college/weeks/${week.id}"]`).first().click();
    await page.getByRole('heading', { name: 'No materials yet', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Edit week', exact: true }).click();
    await submitDialog(page, 'Edit week', 'Save changes', {
      'Week number': '21',
      'Week title': 'Reliable routing',
      Notes: 'Updated browser note.',
    });
    const savedWeek = (await api(`/weeks/${week.id}`)).body.data;
    assert.equal(savedWeek.weekNumber, 21);
    assert.equal(savedWeek.title, 'Reliable routing');
    assert.equal(savedWeek.notes, 'Updated browser note.');
    await page.getByRole('button', { name: 'Delete week', exact: true }).click();
    let confirmation = page.getByRole('dialog', { name: 'Delete week?', exact: true });
    await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
    await confirmation.waitFor({ state: 'hidden' });
    assert.equal((await api(`/weeks/${week.id}`)).status, 200);
    await confirmDelete(page, 'week');
    await page.waitForURL(`**/college/courses/${course.id}`);
    assert.equal((await api(`/weeks/${week.id}`)).status, 404);
    await confirmDelete(page, 'course');
    await page.waitForURL((url) => url.pathname === '/college');
    assert.equal(await page.getByLabel('Semester', { exact: true }).inputValue(), semester.id);
    assert.equal((await api(`/courses/${course.id}`)).status, 404);
    await confirmDelete(page, 'semester');
    assert.deepEqual((await api('/semesters')).body.data, []);
  });
});

test('course and week deep links survive reload and expose the complete breadcrumb hierarchy', async () => {
  await fixture(async ({ page, create, go, screenshot }) => {
    const { semester, course, week } = await hierarchy(create);
    await go(`/college/courses/${course.id}`);
    await page.getByRole('heading', { name: course.name, exact: true, level: 1 }).waitFor();
    let breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    await breadcrumbs.getByRole('link', { name: 'College', exact: true }).waitFor();
    await breadcrumbs.getByRole('link', { name: semester.name, exact: true }).waitFor();
    assert.match(await breadcrumbs.innerText(), new RegExp(semester.name));
    await screenshot('course-desktop');
    await page.reload();
    await page.locator(`a[href="/college/weeks/${week.id}"]`).waitFor();
    await go(`/college/weeks/${week.id}`);
    await page.getByRole('heading', { name: 'No materials yet', exact: true }).waitFor();
    assert.match(await page.locator('main').innerText(), /Read the lecture notes\./);
    assert.equal(await page.locator('input[type="file"]').count(), 0);
    assert.equal(
      await page.getByRole('button', { name: /upload|add material|add link/i }).count(),
      0,
    );
    await page.reload();
    await page.getByRole('heading', { name: 'No materials yet', exact: true }).waitFor();
    breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    await breadcrumbs.getByRole('link', { name: semester.name, exact: true }).waitFor();
    assert.match(await breadcrumbs.innerText(), new RegExp(semester.name));
    await breadcrumbs.getByRole('link', { name: course.name, exact: true }).click();
    await page.waitForURL(`**/college/courses/${course.id}`);
    await breadcrumbs.getByRole('link', { name: 'College', exact: true }).click();
    await page.waitForURL('**/college');
    assert.equal(await page.getByLabel('Semester', { exact: true }).inputValue(), semester.id);
    await screenshot('college-desktop');
    await page.setViewportSize({ width: 1600, height: 1000 });
    await screenshot('college-wide-desktop');
    await go(`/college/courses/${course.id}`);
    await screenshot('course-wide-desktop');
  });
});

test('browsing an inactive semester leaves Home on the active semester until explicit activation', async () => {
  await fixture(async ({ page, create, api, go }) => {
    const { semester, course } = await hierarchy(create);
    const firstWeek = await create(`/courses/${course.id}/weeks`, {
      weekNumber: 3,
      title: 'First numbered week',
    });
    await create(`/semesters/${semester.id}/courses`, { name: 'Second positioned course' });
    const inactive = await create('/semesters', { name: 'Archived term' });
    const archivedCourse = await create(`/semesters/${inactive.id}/courses`, {
      name: 'Archived course',
    });
    const archivedWeek = await create(`/courses/${archivedCourse.id}/weeks`, {
      weekNumber: 4,
      title: 'Archived week',
    });
    await go('/college');
    await page.getByLabel('Semester', { exact: true }).selectOption(inactive.id);
    await page.locator(`a[href="/college/courses/${archivedCourse.id}"]`).first().waitFor();
    assert.equal((await api(`/semesters/${semester.id}`)).body.data.isActive, true);
    assert.equal((await api(`/semesters/${inactive.id}`)).body.data.isActive, false);
    await go('/home');
    const preview = page.locator('section[aria-labelledby="home-college-title"]');
    await preview.locator(`a[href="/college/courses/${course.id}"]`).waitFor();
    await preview.locator(`a[href="/college/weeks/${firstWeek.id}"]`).waitFor();
    const text = await preview.innerText();
    assert.match(text, new RegExp(semester.name));
    assert.doesNotMatch(text, /Archived|Second positioned course|current week|this week/i);
    await go('/college');
    await page.getByLabel('Semester', { exact: true }).selectOption(inactive.id);
    await page.getByRole('button', { name: 'Make active', exact: true }).click();
    await page
      .getByRole('button', { name: 'Make active', exact: true })
      .waitFor({ state: 'hidden' });
    assert.equal((await api(`/semesters/${inactive.id}`)).body.data.isActive, true);
    assert.equal((await api(`/semesters/${semester.id}`)).body.data.isActive, false);
    await go('/home');
    await preview.locator(`a[href="/college/weeks/${archivedWeek.id}"]`).waitFor();
    assert.match(await preview.innerText(), /Archived term/);
  });
});

test('a duplicate week number explains the conflict and preserves all form fields for correction', async () => {
  await fixture(async ({ page, create, api, go }) => {
    const { course, week } = await hierarchy(create);
    await go(`/college/courses/${course.id}`);
    await page.getByRole('button', { name: 'Add week', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Add week', exact: true });
    await dialog.getByLabel('Week number', { exact: true }).fill(String(week.weekNumber));
    await dialog.getByLabel('Week title', { exact: true }).fill('Retained draft title');
    await dialog.getByLabel('Notes', { exact: true }).fill('Retained draft notes');
    await dialog.getByRole('button', { name: 'Create week', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.match(await dialog.getByRole('alert').innerText(), /already exists|duplicate|number/i);
    assert.equal(
      await dialog.getByLabel('Week number', { exact: true }).inputValue(),
      String(week.weekNumber),
    );
    assert.equal(
      await dialog.getByLabel('Week title', { exact: true }).inputValue(),
      'Retained draft title',
    );
    assert.equal(
      await dialog.getByLabel('Notes', { exact: true }).inputValue(),
      'Retained draft notes',
    );
    assert.equal((await api(`/courses/${course.id}/weeks`)).body.data.length, 1);
    await dialog.getByLabel('Week number', { exact: true }).fill('25');
    await dialog.getByRole('button', { name: 'Create week', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal((await api(`/courses/${course.id}/weeks`)).body.data.length, 2);
  });
});

test('failed creation and deletion preserve content and recover after retry', async () => {
  await fixture(async ({ page, create, api, go, overrides }) => {
    const semester = await create('/semesters', { name: 'Retry term', isActive: true });
    const endpoint = `/semesters/${semester.id}/courses`;
    overrides.set(`POST ${base}${endpoint}`, unavailable);
    await go('/college');
    await page.getByRole('button', { name: 'Add course', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Add course', exact: true });
    await dialog.getByLabel('Course name', { exact: true }).fill('Retained course draft');
    await dialog.getByLabel('Course code', { exact: true }).fill('RETRY');
    await dialog.getByLabel('Lecturer', { exact: true }).fill('Test lecturer');
    await dialog.getByRole('button', { name: 'Create course', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(
      await dialog.getByLabel('Course name', { exact: true }).inputValue(),
      'Retained course draft',
    );
    assert.equal(await dialog.getByLabel('Course code', { exact: true }).inputValue(), 'RETRY');
    assert.equal(
      await dialog.getByLabel('Lecturer', { exact: true }).inputValue(),
      'Test lecturer',
    );
    assert.deepEqual((await api(endpoint)).body.data, []);
    overrides.clear();
    await dialog.getByRole('button', { name: 'Create course', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    const course = (await api(endpoint)).body.data[0];
    await page.locator(`a[href="/college/courses/${course.id}"]`).first().click();
    overrides.set(`DELETE ${base}/courses/${course.id}`, unavailable);
    await page.getByRole('button', { name: 'Delete course', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Delete course?', exact: true });
    await confirmation.getByRole('button', { name: 'Delete course', exact: true }).click();
    await confirmation.getByRole('alert').waitFor();
    assert.equal((await api(`/courses/${course.id}`)).status, 200);
    assert.doesNotMatch(await confirmation.innerText(), /SQLITE|stack trace|user-owner-1/);
    overrides.clear();
    await confirmation.getByRole('button', { name: 'Delete course', exact: true }).click();
    await confirmation.waitFor({ state: 'hidden' });
    assert.equal((await api(`/courses/${course.id}`)).status, 404);
  });
});

test('an in-flight semester save protects its draft and cannot create duplicate submissions', async () => {
  await fixture(async ({ page, api, go, overrides }) => {
    let release;
    let started;
    let submissions = 0;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const requested = new Promise((resolve) => {
      started = resolve;
    });
    overrides.set(`POST ${base}/semesters`, async () => {
      submissions++;
      started();
      await held;
      return false;
    });
    await go('/college');
    await page.getByRole('button', { name: 'Add semester', exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Add semester', exact: true });
    const name = dialog.getByLabel('Semester name', { exact: true });
    await name.fill('Protected draft');
    await dialog.getByRole('button', { name: 'Create semester', exact: true }).click();
    await requested;
    try {
      assert.equal(await name.isEditable(), false);
      assert.equal(
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).isDisabled(),
        true,
      );
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), true);
      assert.equal(await name.inputValue(), 'Protected draft');
      assert.equal(submissions, 1);
    } finally {
      release();
    }
    await dialog.waitFor({ state: 'hidden' });
    assert.equal((await api('/semesters')).body.data.length, 1);
  });
});

test('College dialogs contain keyboard focus, close with Escape, and restore the trigger', async () => {
  await fixture(async ({ page, create, go }) => {
    await hierarchy(create);
    await go('/college');
    const trigger = page.getByRole('button', { name: 'Edit semester', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Edit semester', exact: true });
    await dialog.waitFor();
    for (let index = 0; index < 16; index++) {
      assert.equal(
        await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]'))),
        true,
      );
      await page.keyboard.press('Tab');
    }
    for (let index = 0; index < 16; index++) {
      await page.keyboard.press('Shift+Tab');
      assert.equal(
        await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]'))),
        true,
      );
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
    await page.getByRole('button', { name: 'Delete semester', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Delete semester?', exact: true });
    await confirmation.waitFor();
    await page.keyboard.press('Escape');
    await confirmation.waitFor({ state: 'hidden' });
  });
});

test('missing and foreign parent hierarchies show safe unavailable screens', async () => {
  await fixture(async ({ page, create, db, go }) => {
    const { semester, course, week } = await hierarchy(create);
    await db
      .prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)')
      .bind('foreign-owner', 'foreign@example.test', 'Foreign', 'member', 'now', 'now')
      .run();
    await db
      .prepare('UPDATE semesters SET user_id = ? WHERE id = ?')
      .bind('foreign-owner', semester.id)
      .run();
    for (const route of [
      '/college/courses/missing-course',
      '/college/weeks/missing-week',
      `/college/courses/${course.id}`,
      `/college/weeks/${week.id}`,
    ]) {
      await go(route);
      await page.getByRole('alert').first().waitFor();
      const text = await page.locator('main').innerText();
      assert.match(text, /not found|unavailable|could not|couldn.t/i);
      assert.doesNotMatch(
        text,
        /Browser term|Algorithms|Beyond fourteen|Read the lecture notes|SQLITE|foreign-owner/,
      );
      assert.equal(
        await page
          .getByRole('button', { name: /Edit course|Edit week|Add week|Delete course|Delete week/ })
          .count(),
        0,
      );
    }
  });
});

test('College loading and failed reads recover visibly into honest empty states', async () => {
  await fixture(async ({ page, go, overrides }) => {
    let release;
    let started;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const requested = new Promise((resolve) => {
      started = resolve;
    });
    overrides.set(`GET ${base}/semesters`, async () => {
      started();
      await held;
      return false;
    });
    await page.goto(baseUrl + '/college');
    await requested;
    try {
      await page.getByText(/loading.*semester|loading.*college/i).waitFor();
    } finally {
      overrides.clear();
      release();
    }
    await page.getByRole('button', { name: 'Add semester', exact: true }).first().waitFor();
    assert.equal(await page.locator('a[href^="/college/courses/"]').count(), 0);
    overrides.set(`GET ${base}/semesters`, unavailable);
    await go('/college');
    await page.getByRole('alert').first().waitFor();
    assert.equal(await page.locator('a[href^="/college/courses/"]').count(), 0);
    overrides.clear();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await page.getByRole('alert').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Add semester', exact: true }).first().waitFor();
    await go('/home');
    const preview = page.locator('section[aria-labelledby="home-college-title"]');
    assert.equal(await preview.locator('a[href^="/college/courses/"]').count(), 0);
    assert.doesNotMatch(
      await preview.innerText(),
      /Spring 2025|Mathematics|current week|this week/i,
    );
  });
});

test('course and week read failures remain local and retry the actual hierarchy', async () => {
  await fixture(async ({ page, create, go, overrides }) => {
    const { course, week } = await hierarchy(create);
    for (const [endpoint, route, ready] of [
      [`/courses/${course.id}`, `/college/courses/${course.id}`, course.name],
      [`/weeks/${week.id}`, `/college/weeks/${week.id}`, 'No materials yet'],
    ]) {
      overrides.set(`GET ${base}${endpoint}`, unavailable);
      await go(route);
      await page.getByRole('alert').first().waitFor();
      assert.equal(await page.getByRole('button', { name: /Edit course|Edit week/ }).count(), 0);
      overrides.clear();
      await page.getByRole('button', { name: 'Try again', exact: true }).click();
      await page.getByRole('heading', { name: ready, exact: true }).waitFor();
    }
    overrides.set(`GET ${base}/semesters`, unavailable);
    await go('/home');
    const preview = page.locator('section[aria-labelledby="home-college-title"]');
    await preview.getByRole('alert').waitFor();
    assert.doesNotMatch(
      await preview.innerText(),
      /No active semester|No courses yet|No weeks yet/i,
      'A failed read must not claim that saved College content is empty',
    );
    assert.equal(await preview.locator('a[href^="/college/courses/"]').count(), 0);
    assert.equal(
      await page.getByRole('region', { name: 'Quick Links', exact: true }).isVisible(),
      true,
    );
    overrides.clear();
    await preview.getByRole('button', { name: 'Try again', exact: true }).click();
    await preview.locator(`a[href="/college/weeks/${week.id}"]`).waitFor();
  });
});

test('active semesters with no courses and courses with no weeks expose useful empty states', async () => {
  await fixture(async ({ page, create, go }) => {
    const semester = await create('/semesters', { name: 'Empty active term', isActive: true });
    await go('/college');
    assert.equal(await page.getByLabel('Semester', { exact: true }).inputValue(), semester.id);
    await page.getByRole('button', { name: 'Add course', exact: true }).first().waitFor();
    assert.equal(await page.locator('a[href^="/college/courses/"]').count(), 0);
    await go('/home');
    const preview = page.locator('section[aria-labelledby="home-college-title"]');
    assert.match(await preview.innerText(), /Empty active term/);
    assert.equal(await preview.locator('a[href^="/college/courses/"]').count(), 0);
    const course = await create(`/semesters/${semester.id}/courses`, { name: 'Empty course' });
    await go(`/college/courses/${course.id}`);
    await page.getByRole('button', { name: 'Add week', exact: true }).first().waitFor();
    assert.equal(await page.locator('a[href^="/college/weeks/"]').count(), 0);
    await go('/home');
    await preview.locator(`a[href="/college/courses/${course.id}"]`).waitFor();
    assert.equal(await preview.locator('a[href^="/college/weeks/"]').count(), 0);
    assert.doesNotMatch(await preview.innerText(), /current week|this week/i);
  });
});

test('browser history changes reset open editors across course and week identities', async () => {
  await fixture(async ({ page, create, api, go }) => {
    const { semester, course, week } = await hierarchy(create);
    const secondCourse = await create(`/semesters/${semester.id}/courses`, {
      name: 'Second course',
    });
    const secondWeek = await create(`/courses/${secondCourse.id}/weeks`, {
      weekNumber: 2,
      title: 'Second week',
    });
    for (const [firstRoute, secondRoute, button, label, initial, endpoint] of [
      [
        `/college/courses/${course.id}`,
        `/college/courses/${secondCourse.id}`,
        'Edit course',
        'Course name',
        course.name,
        `/courses/${secondCourse.id}`,
      ],
      [
        `/college/weeks/${week.id}`,
        `/college/weeks/${secondWeek.id}`,
        'Edit week',
        'Week title',
        week.title,
        `/weeks/${secondWeek.id}`,
      ],
    ]) {
      await go(firstRoute);
      await page.getByRole('button', { name: button, exact: true }).waitFor();
      // Deliver a history transition directly between identities of the same lazy route.
      await page.evaluate((route) => {
        history.pushState({ idx: 1 }, '', route);
        dispatchEvent(new PopStateEvent('popstate'));
      }, secondRoute);
      await page
        .getByRole('heading', {
          name: button === 'Edit course' ? secondCourse.name : secondWeek.title,
          exact: true,
          level: 1,
        })
        .waitFor();
      await page.getByRole('button', { name: button, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: button, exact: true });
      await dialog.getByLabel(label, { exact: true }).fill('Unsaved second identity');
      await page.goBack();
      await dialog.waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: button, exact: true }).click();
      assert.equal(
        await page.getByRole('dialog').getByLabel(label, { exact: true }).inputValue(),
        initial,
      );
      await page.keyboard.press('Escape');
      assert.notEqual(
        (await api(endpoint)).body.data.name ?? (await api(endpoint)).body.data.title,
        'Unsaved second identity',
      );
    }
  });
});

test('late hierarchy mutation completion does not navigate away from the current page', async () => {
  await fixture(async ({ page, create, api, go, overrides }) => {
    const { course, week } = await hierarchy(create);
    for (const [entity, id, route] of [
      ['week', week.id, `/college/weeks/${week.id}`],
      ['course', course.id, `/college/courses/${course.id}`],
    ]) {
      await go('/home');
      await page
        .getByRole('link', {
          name: entity === 'week' ? /Week 18/ : 'Algorithms',
          exact: entity === 'course',
        })
        .first()
        .click();
      await page.waitForURL('**' + route);
      let release;
      let started;
      const held = new Promise((resolve) => {
        release = resolve;
      });
      const requested = new Promise((resolve) => {
        started = resolve;
      });
      const endpoint = `${base}/${entity === 'course' ? 'courses' : 'weeks'}/${id}`;
      const completed = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === endpoint && response.request().method() === 'DELETE',
      );
      overrides.set(`DELETE ${endpoint}`, async () => {
        started();
        await held;
        return false;
      });
      await page.getByRole('button', { name: `Delete ${entity}`, exact: true }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: `Delete ${entity}`, exact: true })
        .click();
      await requested;
      try {
        await page.goBack();
        await page.waitForURL('**/home');
      } finally {
        release();
      }
      await completed;
      await page.waitForLoadState('networkidle');
      assert.equal(
        new URL(page.url()).pathname,
        '/home',
        'An unmounted delete must not redirect later',
      );
      assert.equal((await api(`/${entity === 'course' ? 'courses' : 'weeks'}/${id}`)).status, 404);
      overrides.clear();
    }
    await go('/home');
    await page.getByRole('link', { name: 'College', exact: true }).first().click();
    let release;
    let started;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const requested = new Promise((resolve) => {
      started = resolve;
    });
    overrides.set(`POST ${base}/semesters`, async () => {
      started();
      await held;
      return false;
    });
    const completed = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === `${base}/semesters` &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Add semester', exact: true }).first().click();
    await page
      .getByRole('dialog')
      .getByLabel('Semester name', { exact: true })
      .fill('Late new semester');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Create semester', exact: true })
      .click();
    await requested;
    try {
      await page.goBack();
      await page.waitForURL('**/home');
    } finally {
      release();
    }
    await completed;
    await page.waitForLoadState('networkidle');
    assert.equal(
      new URL(page.url()).pathname,
      '/home',
      'An unmounted semester form must not change selection URL',
    );
    assert.ok(
      (await api('/semesters')).body.data.some((item) => item.name === 'Late new semester'),
    );
  });
});

test('a cached detail is hidden after an authoritative 404 on a later visit', async () => {
  for (const entity of ['course', 'week']) {
    await fixture(async ({ page, create, go, overrides }) => {
      const { course, week } = await hierarchy(create);
      const item = entity === 'course' ? course : week;
      const route = `/college/${entity === 'course' ? 'courses' : 'weeks'}/${item.id}`;
      await go(route);
      await page.getByRole('button', { name: `Edit ${entity}`, exact: true }).waitFor();
      await page
        .getByRole('navigation', { name: /breadcrumb/i })
        .getByRole('link', { name: 'College', exact: true })
        .click();
      await page.waitForURL('**/college');
      overrides.set(
        `GET ${base}/${entity === 'course' ? 'courses' : 'weeks'}/${item.id}`,
        async (response) => {
          await response.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found.' } }),
          });
          return true;
        },
      );
      // A real mutation invalidates cached detail queries before history remounts them.
      await page.getByRole('button', { name: 'Add course', exact: true }).first().click();
      await submitDialog(page, 'Add course', 'Create course', {
        'Course name': 'Cache invalidation fixture',
      });
      const missingRead = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(`${base}/${entity === 'course' ? 'courses' : 'weeks'}/${item.id}`) &&
          response.status() === 404,
      );
      await page.goBack();
      await missingRead;
      await page.getByRole('alert').first().waitFor();
      assert.equal(
        await page.getByRole('button', { name: `Edit ${entity}`, exact: true }).count(),
        0,
      );
      assert.equal(
        await page.getByRole('button', { name: `Delete ${entity}`, exact: true }).count(),
        0,
      );
      assert.equal(
        await page
          .getByRole('heading', {
            name: entity === 'course' ? course.name : /Beyond fourteen/,
            exact: entity === 'course',
          })
          .count(),
        0,
      );
    });
  }
});

test('a late course save cannot close the draft opened for another semester', async () => {
  await fixture(async ({ page, create, api, go, overrides }) => {
    const first = await create('/semesters', { name: 'First term', isActive: true });
    const second = await create('/semesters', { name: 'Second term' });
    let release;
    let started;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const requested = new Promise((resolve) => {
      started = resolve;
    });
    overrides.set(`POST ${base}/semesters/${first.id}/courses`, async () => {
      started();
      await held;
      return false;
    });
    await go(`/college?semester=${first.id}`);
    await page.getByRole('button', { name: 'Add course', exact: true }).first().click();
    await page
      .getByRole('dialog')
      .getByLabel('Course name', { exact: true })
      .fill('Submitted first term');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Create course', exact: true })
      .click();
    await requested;
    const completed = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes(`/semesters/${first.id}/courses`),
    );
    try {
      await page.evaluate((route) => {
        history.pushState({ idx: 1 }, '', route);
        dispatchEvent(new PopStateEvent('popstate'));
      }, `/college?semester=${second.id}`);
      await page.waitForFunction(() => document.querySelector('dialog input')?.value === '');
      assert.equal(await page.getByLabel('Semester', { exact: true }).inputValue(), second.id);
      await page
        .getByRole('dialog')
        .getByLabel('Course name', { exact: true })
        .fill('Unsaved second term');
    } finally {
      release();
    }
    await completed;
    const dialog = page.getByRole('dialog', { name: 'Add course', exact: true });
    assert.equal(await dialog.isVisible(), true);
    assert.equal(
      await dialog.getByLabel('Course name', { exact: true }).inputValue(),
      'Unsaved second term',
    );
    assert.equal(
      (await api(`/semesters/${first.id}/courses`)).body.data[0].name,
      'Submitted first term',
    );
    assert.deepEqual((await api(`/semesters/${second.id}/courses`)).body.data, []);
  });
});

test('course order persists and Home follows the first positioned course after reordering', async () => {
  await fixture(async ({ page, create, api, go }) => {
    const { semester, course } = await hierarchy(create);
    const second = await create(`/semesters/${semester.id}/courses`, { name: 'New first course' });
    await go('/college');
    const move = page.getByRole('button', { name: 'Move Algorithms down', exact: true });
    const readback = page.waitForResponse(
      (response) =>
        response.url().includes(`/semesters/${semester.id}/courses`) &&
        response.request().method() === 'GET',
    );
    await move.click();
    await readback;
    assert.deepEqual(
      (await api(`/semesters/${semester.id}/courses`)).body.data.map((item) => item.id),
      [second.id, course.id],
    );
    await page.reload();
    await page
      .getByRole('button', { name: 'Move New first course down', exact: true })
      .first()
      .waitFor();
    await go('/home');
    const preview = page.locator('section[aria-labelledby="home-college-title"]');
    await preview.locator(`a[href="/college/courses/${second.id}"]`).waitFor();
    assert.equal(await preview.locator(`a[href="/college/courses/${course.id}"]`).count(), 0);
  });
});

test('valid long College metadata fits a 390px viewport on every hierarchy page', async () => {
  await fixture(
    async ({ page, create, go, screenshot }) => {
      const { semester, course } = await hierarchy(create, {
        semesterName: 'S'.repeat(200),
        courseName: 'C'.repeat(200),
      });
      const week = await create(`/courses/${course.id}/weeks`, {
        weekNumber: 99,
        title: 'W'.repeat(200),
        notes: 'N'.repeat(2000),
      });
      for (const [route, name] of [
        ['/college', 'college-mobile'],
        [`/college/courses/${course.id}`, 'course-mobile'],
        [`/college/weeks/${week.id}`, 'week-mobile'],
        ['/home', 'home-college-mobile'],
      ]) {
        await go(route);
        const overflowing = await page.locator('main *').evaluateAll((elements) =>
          elements
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && (rect.right > innerWidth + 2 || rect.left < -2);
            })
            .map((element) => element.tagName),
        );
        assert.deepEqual(overflowing, [], `${route} content must fit the viewport`);
        await screenshot(name);
      }
      await go('/college');
      assert.equal(await page.getByLabel('Semester', { exact: true }).inputValue(), semester.id);
      await page.getByRole('button', { name: 'Edit semester', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Edit semester', exact: true });
      await dialog.waitFor();
      const rect = await dialog.boundingBox();
      assert.ok(rect.x >= 0 && rect.x + rect.width <= 391, 'Dialog must fit the mobile viewport');
      await screenshot('college-dialog-mobile');
    },
    { width: 390, height: 844 },
  );
});
