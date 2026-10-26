/* global innerWidth, document, fetch, Headers, Response */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import app from '../../worker/index.ts';
import { createTestD1 } from '../helpers/mock-d1.ts';
import { createTestR2 } from '../helpers/mock-r2.ts';

const { chromium } = createRequire(import.meta.url)(
  process.env.KOKPIT_PLAYWRIGHT_MODULE || 'playwright',
);
const viteBase = process.env.KOKPIT_TEST_BASE_URL || 'http://127.0.0.1:5173';
let base;
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
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const overrides = new Map();
  // Serve isolated Hono/D1/R2 over HTTP so downloads avoid Chromium interception limitations.
  const fileServer = createServer(async (request, response) => {
    try {
      let result;
      if (request.url.startsWith('/api/')) {
        const override = overrides.get(`${request.method} ${request.url.split('?')[0]}`);
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const body = Buffer.concat(chunks);
        result = override ? await override() : null;
        result ??= await app.request(
          base + request.url,
          { method: request.method, headers: request.headers, ...(body.length ? { body } : {}) },
          env,
        );
      } else {
        result = await fetch(viteBase + request.url, { method: request.method });
      }
      const headers = new Headers(result.headers);
      if (!request.url.startsWith('/api/')) {
        headers.delete('content-encoding');
        headers.delete('content-length');
      }
      response.writeHead(result.status, Object.fromEntries(headers));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch {
      response.writeHead(500);
      response.end();
    }
  });
  await new Promise((resolve) => fileServer.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${fileServer.address().port}`;
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const api = async (route, body) => {
    const result = await app.request(
      base + '/api/college' + route,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      env,
    );
    assert.equal(result.status, 201);
    return (await result.json()).data;
  };
  const semester = await api('/semesters', { name: 'Material semester', isActive: true });
  const course = await api(`/semesters/${semester.id}/courses`, { name: 'Algorithms' });
  const week = await api(`/courses/${course.id}/weeks`, { weekNumber: 1 });
  const week2 = await api(`/courses/${course.id}/weeks`, { weekNumber: 2 });
  const capture = async (name) => {
    if (!process.env.KOKPIT_TEST_SCREENSHOTS) return;
    await mkdir(process.env.KOKPIT_TEST_SCREENSHOTS, { recursive: true });
    await page.screenshot({
      path: path.join(process.env.KOKPIT_TEST_SCREENSHOTS, `${name}.png`),
      fullPage: true,
    });
  };
  const upload = async (filename = 'private.txt') => {
    const bytes = Buffer.from('Private study material');
    const response = await app.request(
      `${base}/api/college/weeks/${week.id}/materials/upload?filename=${filename}&sizeBytes=${bytes.length}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: bytes,
      },
      env,
    );
    assert.equal(response.status, 201);
    return (await response.json()).data;
  };
  try {
    await run({
      page,
      storage,
      env,
      api,
      semester,
      course,
      week,
      week2,
      overrides,
      upload,
      capture,
    });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
    fileServer.closeAllConnections();
    await new Promise((resolve) => fileServer.close(resolve));
  }
}

test('week materials create a link and upload real bytes, then rename and delete', async () =>
  fixture(async ({ page, week, storage }) => {
    await page.goto(`${base}/college/weeks/${week.id}`);
    await page.getByRole('button', { name: 'Add link', exact: true }).click();
    let dialog = page.getByRole('dialog');
    await dialog.getByLabel('Title', { exact: true }).fill('Reading');
    await dialog.getByLabel('URL', { exact: true }).fill('https://example.com/reading');
    await dialog.getByRole('button', { name: 'Save link', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(
      await page.getByRole('link', { name: 'Reading', exact: true }).getAttribute('href'),
      'https://example.com/reading',
    );
    await page.getByRole('button', { name: 'Upload file', exact: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByLabel('File', { exact: true }).setInputFiles({
      name: 'summary.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Private study summary'),
    });
    await dialog.getByRole('button', { name: 'Upload', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(storage.objects.size, 1);
    await page.getByRole('button', { name: 'Edit summary.txt', exact: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByLabel('Title', { exact: true }).fill('Study summary');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Delete Study summary', exact: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Delete material', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(storage.objects.size, 0);
  }));

test('moving a file across semesters preserves bytes and updates week and recent lists', async () =>
  fixture(async ({ page, api, upload, storage, week, capture }) => {
    const material = await upload();
    const semester = await api('/semesters', { name: 'Next semester' });
    const course = await api(`/semesters/${semester.id}/courses`, { name: 'Databases' });
    const destination = await api(`/courses/${course.id}/weeks`, { weekNumber: 3 });
    const keys = [...storage.objects.keys()];
    await page.goto(`${base}/college/weeks/${week.id}`);
    await page.getByRole('button', { name: 'Edit private.txt', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Destination semester').selectOption(semester.id);
    await dialog.getByLabel('Destination course').selectOption(course.id);
    await dialog.getByLabel('Destination week').selectOption(destination.id);
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('button', { name: 'private.txt', exact: true }).count(), 0);
    assert.deepEqual([...storage.objects.keys()], keys);
    await page.goto(`${base}/college?semester=${semester.id}`);
    await page.getByRole('button', { name: 'private.txt', exact: true }).waitFor();
    await capture('materials-recent-desktop');
    await page.getByRole('button', { name: 'private.txt', exact: true }).click();
    assert.equal(
      await page.getByRole('link', { name: 'Open file', exact: true }).getAttribute('href'),
      `/api/files/${material.id}`,
    );
  }));

test('recent preview stays at three while full semester and week views expose later pages', async () =>
  fixture(async ({ page, api, semester, week, capture }) => {
    for (let index = 1; index <= 23; index++)
      await api(`/weeks/${week.id}/materials`, {
        title: `Reading ${String(index).padStart(2, '0')}`,
        externalUrl: `https://example.com/${index}`,
      });
    await page.goto(`${base}/college?semester=${semester.id}`);
    const recent = page.getByRole('region', { name: 'Recent Files & Notes' });
    await recent.getByRole('link', { name: 'Reading 23', exact: true }).waitFor();
    assert.equal(await recent.locator('li').count(), 3);
    await page.getByRole('link', { name: 'View materials', exact: true }).click();
    await page.getByRole('heading', { name: 'All materials' }).waitFor();
    assert.equal(
      await page.locator('section[aria-labelledby="all-materials-title"] li').count(),
      20,
    );
    await page.getByRole('button', { name: 'Load more materials' }).click();
    await page.getByRole('link', { name: 'Reading 01', exact: true }).waitFor();
    assert.equal(
      await page.locator('section[aria-labelledby="all-materials-title"] li').count(),
      23,
    );
    await page.reload();
    await page.getByRole('heading', { name: 'All materials' }).waitFor();
    await page.goto(`${base}/college/weeks/${week.id}`);
    await page.getByRole('button', { name: 'Load more materials' }).click();
    await page.getByRole('link', { name: 'Reading 23', exact: true }).waitFor();
    await capture('materials-week-desktop');
  }));

test('failed upload preserves the chosen file, and failed cleanup can be retried in the dialog', async () =>
  fixture(async ({ page, week, storage }) => {
    storage.failures.put = true;
    await page.goto(`${base}/college/weeks/${week.id}`);
    await page.getByRole('button', { name: 'Upload file', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('File', { exact: true }).setInputFiles({
      name: 'retry.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Draft retained'),
    });
    await dialog.getByRole('button', { name: 'Upload', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(await dialog.getByLabel('Title', { exact: true }).inputValue(), 'retry.txt');
    assert.equal(
      await dialog.getByLabel('File', { exact: true }).evaluate((input) => input.files.length),
      1,
    );
    storage.failures.put = false;
    await dialog.getByRole('button', { name: 'Upload', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    storage.failures.delete = true;
    await page.getByRole('button', { name: 'Delete retry.txt', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delete material', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(storage.objects.size, 1);
    storage.failures.delete = false;
    await dialog.getByRole('button', { name: 'Delete material', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(storage.objects.size, 0);
  }));

test('private file errors stay local and retry exposes open and authenticated download actions', async () =>
  fixture(async ({ page, upload, week, storage }) => {
    const material = await upload();
    storage.failures.get = true;
    await page.goto(`${base}/college/weeks/${week.id}`);
    await page.getByRole('button', { name: 'private.txt', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('alert').waitFor();
    storage.failures.get = false;
    await dialog.getByRole('button', { name: 'Retry file' }).click();
    const downloadLink = dialog.getByRole('link', { name: 'Download file' });
    assert.equal(
      await downloadLink.getAttribute('href'),
      `/api/files/${material.id}?download=true`,
    );
    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;
    assert.equal(await download.failure(), null);
    assert.equal(download.suggestedFilename(), 'private.txt');
    assert.equal(await readFile(await download.path(), 'utf8'), 'Private study material');
  }));

for (const width of [1366, 390, 320])
  test(`materials keep long titles and keyboard dialogs usable at ${width}px`, async () =>
    fixture(async ({ page, api, week, capture }) => {
      const title = 'Long_material_name_'.repeat(13);
      await api(`/weeks/${week.id}/materials`, { title, externalUrl: 'https://example.com' });
      await page.goto(`${base}/college/weeks/${week.id}`);
      const edit = page.getByRole('button', { name: `Edit ${title}`, exact: true });
      await edit.click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Title', { exact: true }).waitFor();
      for (let index = 0; index < 12; index++) {
        await page.keyboard.press('Tab');
        assert.ok(await dialog.evaluate((element) => element.contains(document.activeElement)));
      }
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.ok(await edit.evaluate((element) => element === document.activeElement));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await capture(`materials-week-${width}`);
    }, width));

test('partial semester cleanup refreshes recent files and retry finishes the deletion', async () =>
  fixture(async ({ page, semester, upload, storage }) => {
    await upload('first.txt');
    await upload('second.txt');
    const originalDelete = storage.bucket.delete.bind(storage.bucket);
    let calls = 0;
    storage.bucket.delete = async (key) => {
      if (++calls === 2) throw new Error('Injected cleanup failure');
      return originalDelete(key);
    };
    await page.goto(`${base}/college?semester=${semester.id}`);
    const recent = page.getByRole('region', { name: 'Recent Files & Notes' });
    await recent.getByRole('button', { name: 'first.txt', exact: true }).waitFor();
    assert.equal(await recent.locator('li').count(), 2);
    await page.getByRole('button', { name: 'Delete semester', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Delete semester', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(storage.objects.size, 1);
    await page.waitForFunction(
      () =>
        document.querySelectorAll('section[aria-labelledby="recent-materials-title"] li').length ===
        1,
    );
    await dialog.getByRole('button', { name: 'Delete semester', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { name: 'No semesters yet', exact: true }).waitFor();
    assert.equal(storage.objects.size, 0);
  }));

test('an in-flight material save locks its draft and cannot submit duplicate links', async () =>
  fixture(async ({ page, week, overrides }) => {
    let release;
    let started;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const entered = new Promise((resolve) => {
      started = resolve;
    });
    let submissions = 0;
    overrides.set(`POST /api/college/weeks/${week.id}/materials`, async () => {
      submissions++;
      started();
      await gate;
      return null;
    });
    try {
      await page.goto(`${base}/college/weeks/${week.id}`);
      await page.getByRole('button', { name: 'Add link', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Title', { exact: true }).fill('One link');
      await dialog.getByLabel('URL', { exact: true }).fill('https://example.com');
      await dialog.getByRole('button', { name: 'Save link' }).click();
      await entered;
      assert.equal(await dialog.getByLabel('Title', { exact: true }).isDisabled(), true);
      assert.equal(await dialog.getByRole('button', { name: 'Save link' }).isDisabled(), true);
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), true);
      release();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(submissions, 1);
      assert.equal(await page.getByRole('link', { name: 'One link', exact: true }).count(), 1);
    } finally {
      release();
    }
  }));

test('material list failures recover locally into honest empty states', async () =>
  fixture(async ({ page, week, semester, overrides }) => {
    const failed = () =>
      Response.json({ error: { code: 'UNAVAILABLE', message: 'Unavailable' } }, { status: 503 });
    overrides.set(`GET /api/college/weeks/${week.id}/materials`, failed);
    await page.goto(`${base}/college/weeks/${week.id}`);
    const section = page.getByRole('region', { name: 'Materials', exact: true });
    await section.getByRole('heading', { name: 'College could not load' }).waitFor();
    overrides.clear();
    await section.getByRole('button', { name: /try again/i }).click();
    await section.getByText('No materials yet', { exact: true }).waitFor();
    overrides.set(`GET /api/college/semesters/${semester.id}/materials`, failed);
    await page.goto(`${base}/college?semester=${semester.id}`);
    const recent = page.getByRole('region', { name: 'Recent Files & Notes' });
    await recent.getByRole('heading', { name: 'College could not load' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Algorithms', exact: true }).count(), 1);
    overrides.clear();
    await recent.getByRole('button', { name: /try again/i }).click();
    await recent.getByText('No recent materials', { exact: true }).waitFor();
  }));
