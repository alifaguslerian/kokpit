/* global document, innerWidth */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
import { Buffer } from 'node:buffer';
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
        ...(request.postDataBuffer() ? { body: request.postDataBuffer() } : {}),
      },
      env,
    );
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
  const api = async (endpoint, body, method = 'POST') => {
    const response = await app.request(
      '/api' + endpoint,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      },
      env,
    );
    assert.ok(response.ok, await response.clone().text());
    return (await response.json()).data;
  };
  const capture = async (name) => {
    if (!process.env.KOKPIT_TEST_SCREENSHOTS) return;
    await mkdir(process.env.KOKPIT_TEST_SCREENSHOTS, { recursive: true });
    await page.screenshot({
      path: path.join(process.env.KOKPIT_TEST_SCREENSHOTS, name + '.png'),
      fullPage: true,
    });
  };
  try {
    await run({ page, api, overrides, capture });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
test('approved Ideas exposes complete collections management', async () =>
  fixture(async ({ page }) => {
    await page.goto(base + '/ideas');
    await page.getByRole('button', { name: 'New collection', exact: true }).click();
    const manager = page.getByRole('dialog', { name: 'Collections', exact: true });
    await manager.getByLabel('Collection name', { exact: true }).fill('Personal');
    await manager.getByRole('button', { name: 'Create collection', exact: true }).click();
    await manager.getByRole('button', { name: 'Rename Personal', exact: true }).click();
    await manager.getByLabel('Rename collection', { exact: true }).fill('Projects');
    await manager.getByRole('button', { name: 'Save name', exact: true }).click();
    await manager.getByRole('button', { name: 'Close collections', exact: true }).click();
    await page.getByRole('button', { name: 'Filter collection Projects', exact: true }).click();
    assert.ok(new URL(page.url()).searchParams.get('collection'));
    await page.getByRole('button', { name: 'View all collections', exact: true }).click();
    await manager.getByRole('button', { name: 'Delete Projects', exact: true }).click();
    await manager.getByRole('button', { name: 'Confirm delete collection', exact: true }).click();
    await manager.getByText('Projects', { exact: true }).waitFor({ state: 'hidden' });
  }));
test('favorite, assignment, cover and URL history stay synchronized', async () =>
  fixture(async ({ page, api }) => {
    const collection = await api('/idea-collections', { name: 'Learning' });
    const idea = await api('/ideas', {
      title: 'A useful question',
      content: 'How can this become clearer?',
      tags: ['Question'],
    });
    await page.goto(base + '/ideas');
    let card = page.getByRole('article', { name: 'A useful question', exact: true });
    await card.getByRole('button', { name: 'Mark as favorite', exact: true }).click();
    await card.getByRole('button', { name: 'Remove from favorites', exact: true }).waitFor();
    await card.getByRole('button', { name: 'Edit thought', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Edit Thought', exact: true });
    await editor.getByLabel('Collection', { exact: true }).selectOption(collection.id);
    await editor.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Filter collection Learning', exact: true }).click();
    assert.equal(new URL(page.url()).searchParams.get('collection'), collection.id);
    await card.waitFor();
    await page.getByRole('button', { name: 'View all favorites', exact: true }).click();
    assert.equal(new URL(page.url()).search, '?favorite=true');
    await page.goBack();
    assert.equal(new URL(page.url()).searchParams.get('collection'), collection.id);
    await card.getByRole('button', { name: 'Edit thought', exact: true }).click();
    await editor.getByLabel('Cover image', { exact: true }).setInputFiles({
      name: 'cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 8;
          canvas.height = 8;
          return canvas.toDataURL('image/png').split(',')[1];
        }),
        'base64',
      ),
    });
    await editor.getByRole('button', { name: 'Upload cover', exact: true }).click();
    await editor.getByText('Cover saved.', { exact: true }).waitFor();
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
    card = page.getByRole('article', { name: 'A useful question', exact: true });
    assert.equal(await card.locator('img').count(), 1);
    await card.getByRole('button', { name: 'Edit thought', exact: true }).click();
    await editor.getByRole('button', { name: 'Remove cover', exact: true }).click();
    await editor.getByText('Cover removed.', { exact: true }).waitFor();
    assert.equal((await api(`/ideas/${idea.id}`, undefined, 'GET')).coverUrl, null);
  }));
test('capture and editor failures preserve draft and pagination remains reachable', async () =>
  fixture(async ({ page, api, overrides }) => {
    for (let i = 0; i < 51; i++)
      await api('/ideas', { title: `Thought ${i}`, content: `A thought ${i}`, isFavorite: true });
    await page.goto(base + '/ideas?favorite=true');
    await page.getByRole('button', { name: 'Load more thoughts', exact: true }).click();
    await page
      .getByRole('region', { name: 'Ideas list', exact: true })
      .getByRole('article')
      .nth(50)
      .waitFor();
    assert.equal(
      await page
        .getByRole('region', { name: 'Ideas list', exact: true })
        .getByRole('article')
        .count(),
      51,
    );
    overrides.set('POST /api/ideas', async (route) => {
      await route.fulfill({
        status: 503,
        json: { error: { code: 'UNAVAILABLE', message: 'Try again' } },
      });
      return true;
    });
    await page.getByLabel('Thought', { exact: true }).fill('Keep my newer draft');
    await page.getByRole('button', { name: 'Save Thought', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Your draft is here' }).waitFor();
    assert.equal(
      await page.getByLabel('Thought', { exact: true }).inputValue(),
      'Keep my newer draft',
    );
    overrides.delete('POST /api/ideas');
    await page.getByLabel('Thought', { exact: true }).press('Control+Enter');
    await page.getByLabel('Thought', { exact: true }).fill('');
  }));

test('collection ordering, favorites beyond preview and unavailable selections remain complete', async () =>
  fixture(async ({ page, api }) => {
    const first = await api('/idea-collections', { name: 'First' });
    const second = await api('/idea-collections', { name: 'Second' });
    for (let i = 0; i < 5; i++)
      await api('/ideas', {
        title: `Favorite ${i}`,
        content: 'Kept close.',
        isFavorite: true,
        collectionId: first.id,
        tags: ['Idea'],
      });
    await page.goto(base + '/ideas?q=nonmatching&tag=Question&pinned=true');
    await page.getByRole('button', { name: 'View all collections', exact: true }).click();
    const manager = page.getByRole('dialog', { name: 'Collections', exact: true });
    await manager.getByRole('button', { name: 'Move Second up', exact: true }).focus();
    await page.keyboard.press('Enter');
    await manager
      .getByRole('button', { name: 'Move Second up', exact: true })
      .waitFor({ state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('dialog li p')?.textContent === 'Second',
    );
    assert.equal((await api('/idea-collections', undefined, 'GET'))[0].id, second.id);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'View all favorites', exact: true }).click();
    assert.equal(new URL(page.url()).search, '?favorite=true');
    await page
      .getByRole('region', { name: 'Ideas list', exact: true })
      .getByRole('article')
      .nth(4)
      .waitFor();
    await page.goto(base + '/ideas?collection=00000000-0000-4000-8000-000000000000');
    await page.getByRole('heading', { name: 'Collection unavailable', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Back to all ideas', exact: true }).last().click();
    await page
      .getByRole('region', { name: 'Ideas list', exact: true })
      .getByRole('article')
      .nth(4)
      .waitFor();
  }));

test('failed editor and cover writes preserve text and browser navigation closes the old editor', async () =>
  fixture(async ({ page, api, overrides }) => {
    const idea = await api('/ideas', { title: 'Original title', content: 'Original content.' });
    await page.goto(base + '/ideas');
    await page.getByRole('button', { name: 'View all favorites', exact: true }).click();
    await page.getByRole('button', { name: 'Back to all ideas', exact: true }).click();
    await page
      .getByRole('article', { name: 'Original title', exact: true })
      .getByRole('button', { name: 'Edit thought', exact: true })
      .click();
    const editor = page.getByRole('dialog', { name: 'Edit Thought', exact: true });
    await editor.getByLabel('Content', { exact: true }).fill('A newer draft that must survive.');
    overrides.set(`PATCH /api/ideas/${idea.id}`, async (route) => {
      await route.fulfill({
        status: 503,
        json: { error: { code: 'UNAVAILABLE', message: 'Unavailable' } },
      });
      return true;
    });
    await editor.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await editor.getByRole('alert').filter({ hasText: 'Your draft is here' }).waitFor();
    assert.equal(
      await editor.getByLabel('Content', { exact: true }).inputValue(),
      'A newer draft that must survive.',
    );
    await editor.getByLabel('Cover image', { exact: true }).setInputFiles({
      name: 'invalid.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    });
    await editor.getByRole('button', { name: 'Upload cover', exact: true }).click();
    await editor.getByRole('alert').filter({ hasText: 'Choose a JPEG' }).waitFor();
    assert.equal(
      await editor.getByLabel('Content', { exact: true }).inputValue(),
      'A newer draft that must survive.',
    );
    await editor.getByLabel('Cover image', { exact: true }).setInputFiles({
      name: 'private-cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 8;
          canvas.height = 8;
          return canvas.toDataURL('image/png').split(',')[1];
        }),
        'base64',
      ),
    });
    overrides.set(`PUT /api/ideas/${idea.id}/cover`, async (route) => {
      await route.fulfill({
        status: 503,
        json: { error: { code: 'UNAVAILABLE', message: 'Unavailable' } },
      });
      return true;
    });
    await editor.getByRole('button', { name: 'Upload cover', exact: true }).click();
    await editor.getByRole('alert').filter({ hasText: 'Could not update this cover' }).waitFor();
    assert.equal(
      await editor.getByLabel('Content', { exact: true }).inputValue(),
      'A newer draft that must survive.',
    );
    overrides.delete(`PUT /api/ideas/${idea.id}/cover`);
    await editor.getByRole('button', { name: 'Upload cover', exact: true }).click();
    await editor.getByText('Cover saved.', { exact: true }).waitFor();
    assert.equal(
      await editor.getByLabel('Content', { exact: true }).inputValue(),
      'A newer draft that must survive.',
    );
    await page.goBack();
    await editor.waitFor({ state: 'hidden' });
    await page.goForward();
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page
      .getByRole('article', { name: 'Original title', exact: true })
      .getByRole('button', { name: 'Edit thought', exact: true })
      .click();
    assert.equal(
      await editor.getByLabel('Content', { exact: true }).inputValue(),
      'Original content.',
    );
  }));

test('Library group names cannot collide with filter kinds and filtered reorder preserves hidden positions', async () =>
  fixture(async ({ page, api }) => {
    const first = await api('/quick-links', {
      name: 'Visible A',
      url: 'https://example.com/a',
      groupName: 'all',
    });
    const hidden = await api('/quick-links', {
      name: 'Hidden',
      url: 'https://example.com/h',
      groupName: 'favorites',
    });
    const second = await api('/quick-links', {
      name: 'Visible B',
      url: 'https://example.com/b',
      groupName: 'all',
    });
    await page.goto(base + '/library');
    await page.getByRole('button', { name: 'all', exact: true }).click();
    assert.equal(await page.getByRole('link', { name: 'Open Hidden', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Move link down', exact: true }).first().focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      () =>
        document.querySelector('section[aria-label="Shortcuts list"] h3')?.textContent ===
        'Visible B',
    );
    assert.deepEqual(
      (await api('/quick-links', undefined, 'GET')).map((link) => link.id),
      [second.id, hidden.id, first.id],
    );
    await page.getByRole('button', { name: 'favorites', exact: true }).click();
    await page.getByRole('link', { name: 'Open Hidden', exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Open Visible A', exact: true }).count(), 0);
  }));
test('a delayed save cannot close a newer editor after browser navigation', async () =>
  fixture(async ({ page, api, overrides }) => {
    const first = await api('/ideas', {
      title: 'First draft',
      content: 'First content.',
      tags: ['Idea'],
    });
    await api('/ideas', { title: 'Second draft', content: 'Second content.', tags: ['Idea'] });
    await page.goto(base + '/ideas?tag=Idea');
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page
      .getByRole('article', { name: 'First draft', exact: true })
      .getByRole('button', { name: 'Edit thought', exact: true })
      .click();
    const editor = page.getByRole('dialog', { name: 'Edit Thought', exact: true });
    await editor.getByLabel('Content', { exact: true }).fill('A submitted first draft.');
    let release;
    let notify;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const started = new Promise((resolve) => {
      notify = resolve;
    });
    overrides.set(`PATCH /api/ideas/${first.id}`, async () => {
      notify();
      await held;
      return false;
    });
    await editor.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await started;
    try {
      await page.goBack();
      await editor.waitFor({ state: 'hidden' });
      await page
        .getByRole('article', { name: 'Second draft', exact: true })
        .getByRole('button', { name: 'Edit thought', exact: true })
        .click();
      await editor.getByLabel('Content', { exact: true }).fill('Keep this newer second draft.');
      const saved = page.waitForResponse(
        (response) =>
          response.request().method() === 'PATCH' && response.url().endsWith(`/ideas/${first.id}`),
      );
      release();
      await saved;
      await editor.getByLabel('Content', { exact: true }).waitFor();
      assert.equal(
        await editor.getByLabel('Content', { exact: true }).inputValue(),
        'Keep this newer second draft.',
      );
    } finally {
      release();
    }
  }));

for (const kind of ['favorite', 'unfavorite', 'pin'])
  test(`a text-only save preserves a ${kind} change started before the editor opened`, async () =>
    fixture(async ({ page, api, overrides }) => {
      const idea = await api('/ideas', {
        title: 'A shared thought',
        content: 'Original.',
        isFavorite: kind === 'unfavorite',
      });
      await page.goto(base + '/ideas');
      let release;
      let notify;
      let heldOnce = false;
      const held = new Promise((resolve) => {
        release = resolve;
      });
      const started = new Promise((resolve) => {
        notify = resolve;
      });
      const endpoint =
        kind === 'pin' ? `POST /api/ideas/${idea.id}/pin` : `PATCH /api/ideas/${idea.id}`;
      overrides.set(endpoint, async () => {
        if (heldOnce) return false;
        heldOnce = true;
        notify();
        await held;
        return false;
      });
      const card = page.getByRole('article', { name: 'A shared thought', exact: true });
      if (kind === 'unfavorite')
        await page
          .getByRole('region', { name: 'Favorite Ideas', exact: true })
          .getByRole('button', { name: 'Remove A shared thought from favorites', exact: true })
          .click();
      else
        await card
          .getByRole('button', {
            name: kind === 'pin' ? 'Pin thought to top' : 'Mark as favorite',
            exact: true,
          })
          .click();
      await started;
      try {
        await card.getByRole('button', { name: 'Edit thought', exact: true }).click();
        const editor = page.getByRole('dialog', { name: 'Edit Thought', exact: true });
        await editor.getByLabel('Content', { exact: true }).fill('Only the text changed.');
        release();
        const updatedLabel =
          kind === 'pin'
            ? 'Unpin thought'
            : kind === 'unfavorite'
              ? 'Mark as favorite'
              : 'Remove from favorites';
        await page.waitForFunction(
          (label) => Boolean(document.querySelector(`article button[aria-label="${label}"]`)),
          updatedLabel,
        );
        await editor.getByRole('button', { name: 'Save Changes', exact: true }).click();
        await editor.waitFor({ state: 'hidden' });
        const saved = await api(`/ideas/${idea.id}`, undefined, 'GET');
        assert.equal(saved.content, 'Only the text changed.');
        assert.equal(saved[kind === 'pin' ? 'isPinned' : 'isFavorite'], kind !== 'unfavorite');
      } finally {
        release();
      }
    }));

test('an idea being deleted cannot open from the favorite preview and a failed deletion recovers', async () =>
  fixture(async ({ page, api, overrides }) => {
    const idea = await api('/ideas', {
      title: 'Keep until deleted',
      content: 'An owned thought.',
      isFavorite: true,
    });
    await page.goto(base + '/ideas');
    let release;
    let notify;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const started = new Promise((resolve) => {
      notify = resolve;
    });
    overrides.set(`DELETE /api/ideas/${idea.id}`, async (route) => {
      notify();
      await held;
      await route.fulfill({
        status: 503,
        json: { error: { code: 'UNAVAILABLE', message: 'Unavailable' } },
      });
      return true;
    });
    const card = page.getByRole('article', { name: 'Keep until deleted', exact: true });
    await card.getByLabel('Thought actions', { exact: true }).click();
    await card.getByRole('button', { name: 'Delete thought', exact: true }).click();
    await card.getByRole('button', { name: 'Delete?', exact: true }).click();
    await started;
    const previewOpen = page
      .getByRole('region', { name: 'Favorite Ideas', exact: true })
      .getByRole('button', { name: 'Open thought Keep until deleted', exact: true });
    try {
      await page.waitForFunction(
        () =>
          document.querySelector(
            'section[aria-label="Favorite Ideas"] button[aria-label="Open thought Keep until deleted"]',
          )?.disabled === true,
      );
      assert.equal(await previewOpen.isEnabled(), false);
      assert.equal(
        await card.getByRole('button', { name: 'Edit thought', exact: true }).isEnabled(),
        false,
      );
    } finally {
      release();
    }
    await card.getByRole('alert').waitFor();
    await previewOpen.click();
    await page.getByRole('dialog', { name: 'Edit Thought', exact: true }).waitFor();
    assert.equal((await api(`/ideas/${idea.id}`, undefined, 'GET')).content, 'An owned thought.');
  }));

test('the complete collection manager reaches records beyond the first API page', async () =>
  fixture(async ({ page, api }) => {
    for (let i = 0; i < 101; i++)
      await api('/idea-collections', { name: `Shelf ${String(i).padStart(3, '0')}` });
    await page.goto(base + '/ideas');
    await page.getByRole('button', { name: 'View all collections', exact: true }).click();
    const manager = page.getByRole('dialog', { name: 'Collections', exact: true });
    await manager.getByRole('button', { name: 'Rename Shelf 100', exact: true }).waitFor();
    assert.equal(await manager.getByRole('listitem').count(), 101);
    await manager.getByRole('button', { name: 'Move Shelf 100 up', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelectorAll('dialog li p')[198]?.textContent === 'Shelf 100',
    );
    assert.equal(
      (await api('/idea-collections?limit=100&offset=100', undefined, 'GET'))[0].name,
      'Shelf 099',
    );
  }));

for (const width of [320, 390, 1366, 1600])
  test(`approved Ideas and Library remain usable at ${width}px`, async () =>
    fixture(async ({ page, api, capture }) => {
      for (let i = 0; i < 6; i++) await api('/idea-collections', { name: `Collection ${i}` });
      for (let i = 0; i < 6; i++)
        await api('/ideas', {
          title: `Room for thought ${i}`,
          content: 'A little room for unfinished thoughts and useful questions.',
          tags: ['Idea'],
          isFavorite: i < 4,
        });
      await page.goto(base + '/ideas');
      await page.getByRole('button', { name: 'New collection', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: /^Filter collection / }).count(), 4);
      assert.equal(
        await page
          .getByRole('region', { name: 'Favorite Ideas', exact: true })
          .getByRole('button', { name: /^Open thought / })
          .count(),
        3,
      );
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await capture(`ideas-approved-${width}`);
      await page.getByRole('button', { name: 'View all collections', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('dialog', { name: 'Collections', exact: true }).waitFor();
      await page.keyboard.press('Escape');
      assert.equal(
        await page
          .getByRole('button', { name: 'View all collections', exact: true })
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await api('/quick-links', {
        name: 'Documentation',
        url: 'https://developer.mozilla.org',
        iconType: 'lucide',
        iconValue: 'code',
        groupName: 'all',
      });
      for (const [name, host, iconValue] of [
        ['GitHub', 'github.com', 'github'],
        ['Google Drive', 'drive.google.com', 'drive'],
        ['Figma', 'figma.com', 'figma'],
      ]) {
        await api('/quick-links', {
          name,
          url: `https://${host}`,
          iconType: 'brand',
          iconValue,
          isFavorite: name !== 'Figma',
        });
      }
      await page.goto(base + '/library');
      await page.getByRole('link', { name: 'Open Documentation', exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await capture(`library-approved-${width}`);
    }, width));
