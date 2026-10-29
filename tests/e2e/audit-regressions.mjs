/* global document, innerWidth, window */
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
  const context = await browser.newContext({
    viewport: { width, height },
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const errors = [];
  const overrides = new Map();
  page.on('pageerror', (error) => errors.push(error.message));
  const api = async (endpoint, method = 'GET', body) => {
    const response = await app.request(
      endpoint,
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
  await page.route(`${baseUrl}/api/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const override = overrides.get(`${request.method()} ${url.pathname}`);
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
      contentType: 'application/json',
      body: await response.text(),
    });
  });
  const go = async (route) => {
    await page.goto(baseUrl + route);
    await page.waitForLoadState('networkidle');
  };
  const screenshot = async (name) => {
    if (outputDirectory) {
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(outputDirectory, `${name}.png`), fullPage: true });
    }
  };
  try {
    await run({ page, api, go, overrides, errors, screenshot });
    assert.deepEqual(errors, [], 'UI operations must not reject promises without handling them');
  } finally {
    await context.close();
  }
}

test('an in-flight idea save cannot erase a new draft', async () => {
  await fixture(async ({ page, api, go, overrides }) => {
    let release;
    let notify;
    const started = new Promise((resolve) => {
      notify = resolve;
    });
    const held = new Promise((resolve) => {
      release = resolve;
    });
    overrides.set('POST /api/ideas', async () => {
      notify();
      await held;
      return false;
    });
    await go('/ideas');
    const input = page.locator('section[aria-label="Compose new thought"] textarea');
    await input.fill('Audit submitted thought');
    await page.getByRole('button', { name: 'Save Thought', exact: true }).click();
    await started;
    try {
      assert.equal(await input.isEditable(), false, 'Pending form must protect unsaved edits');
    } finally {
      release();
    }
    await page.waitForFunction(() => document.querySelector('textarea')?.value === '');
    const saved = await api('/api/ideas');
    assert.equal(saved.body.data.length, 1);
    assert.equal(saved.body.data[0].content, 'Audit submitted thought');
  });
});

test('failed saves explain the failure, preserve the draft, and recover on retry', async () => {
  await fixture(async ({ page, api, go, overrides }) => {
    overrides.set('POST /api/ideas', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'AUDIT_UNAVAILABLE', message: 'Save unavailable.' },
        }),
      });
      return true;
    });
    await go('/ideas');
    const input = page.locator('section[aria-label="Compose new thought"] textarea');
    await input.fill('Audit retry draft');
    await page.getByRole('button', { name: 'Save Thought', exact: true }).click();
    await page.getByRole('alert').first().waitFor();
    assert.equal(await input.inputValue(), 'Audit retry draft');
    overrides.delete('POST /api/ideas');
    await page.getByRole('button', { name: 'Save Thought', exact: true }).click();
    await page.getByRole('button', { name: 'Edit thought', exact: true }).waitFor();
    assert.equal((await api('/api/ideas')).body.data[0].content, 'Audit retry draft');
  });
});

test('all saved ideas are reachable beyond the first page', async () => {
  await fixture(async ({ page, api, go }) => {
    for (let index = 0; index < 55; index++) {
      await api('/api/ideas', 'POST', { content: `Audit pagination ${index}` });
    }
    await go('/ideas');
    assert.equal(await page.getByRole('button', { name: 'Edit thought', exact: true }).count(), 50);
    await page.getByRole('button', { name: /load more/i }).click();
    await page.waitForFunction(
      () => document.querySelectorAll('[aria-label="Edit thought"]').length === 55,
    );
    assert.equal(await page.getByRole('button', { name: /load more/i }).count(), 0);
  });
});

test('editing is keyboard-contained, Escape closes, and focus returns to the trigger', async () => {
  await fixture(async ({ page, api, go }) => {
    await api('/api/ideas', 'POST', { content: 'Audit modal thought' });
    await go('/ideas');
    const trigger = page.getByRole('button', { name: 'Edit thought', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Edit Thought', exact: true });
    await dialog.waitFor();
    for (let index = 0; index < 18; index++) {
      assert.equal(
        await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]'))),
        true,
      );
      await page.keyboard.press('Tab');
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
  });
});

test('shortcut icon choices persist, and Auto-detect follows an edited hostname', async () => {
  await fixture(async ({ page, api, go }) => {
    await go('/library');
    await page.getByRole('button', { name: 'Add Shortcut', exact: true }).first().click();
    await page.getByLabel('Name', { exact: true }).fill('Audit icon');
    await page.getByLabel('URL', { exact: true }).fill('ftp://example.com/audit');
    await page.getByRole('button', { name: 'Create Shortcut', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal((await api('/api/quick-links')).body.data.length, 0);
    await page.getByLabel('URL', { exact: true }).fill('https://github.com/audit');
    await page.getByLabel('Icon Representation', { exact: true }).selectOption('book');
    await page.getByRole('button', { name: 'Create Shortcut', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    let saved = (await api('/api/quick-links')).body.data[0];
    assert.equal(saved.iconType, 'lucide');
    assert.equal(saved.iconValue, 'book');
    await page.getByRole('button', { name: 'Edit shortcut', exact: true }).click();
    await page.getByLabel('URL', { exact: true }).fill('https://www.notion.so/audit');
    await page.getByLabel('Icon Representation', { exact: true }).selectOption('');
    await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    saved = (await api('/api/quick-links')).body.data[0];
    assert.equal(saved.iconType, 'brand');
    assert.equal(saved.iconValue, 'notion');
  });
});

test('the bottom dock exposes all six routes to keyboard users on mobile', async () => {
  await fixture(
    async ({ page, go }) => {
      await go('/library');
      const dock = page.getByRole('navigation', { name: 'Main Navigation', exact: true });
      assert.equal(await dock.count(), 1, 'One common dock serves every screen size');
      assert.deepEqual(await dock.getByRole('link').allTextContents(), [
        'Home',
        'College',
        'Music',
        'News',
        'Ideas',
        'Library',
      ]);
      assert.equal(await page.getByRole('button', { name: /navigation menu/i }).count(), 0);
      await dock.getByRole('link', { name: 'Home', exact: true }).focus();
      for (const label of ['Home', 'College', 'Music', 'News', 'Ideas', 'Library']) {
        const link = dock.getByRole('link', { name: label, exact: true });
        assert.equal(await link.evaluate((element) => element === document.activeElement), true);
        assert.equal(await link.evaluate((element) => element.matches(':focus-visible')), true);
        const box = await link.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= 390, 'Dock links remain inside the viewport');
        if (label !== 'Library') await page.keyboard.press('Tab');
      }
      await dock.getByRole('link', { name: 'Ideas', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/ideas');
      await dock.locator('a[href="/ideas"][aria-current="page"]').waitFor();
      assert.equal(
        await dock.getByRole('link', { name: 'Ideas', exact: true }).getAttribute('aria-current'),
        'page',
      );
      await page.goBack();
      await page.waitForURL('**/library');
      await dock.locator('a[href="/library"][aria-current="page"]').waitFor();
      assert.equal(
        await dock.getByRole('link', { name: 'Library', exact: true }).getAttribute('aria-current'),
        'page',
      );
    },
    { width: 390, height: 600 },
  );
});

test('valid long groups retain visible actions and mobile reorder controls', async () => {
  await fixture(
    async ({ page, api, go, screenshot }) => {
      await api('/api/quick-links', 'POST', {
        name: 'N'.repeat(100),
        url: 'https://example.com',
        groupName: 'G'.repeat(50),
      });
      await api('/api/quick-links', 'POST', { name: 'Audit second', url: 'https://example.org' });
      await go('/library');
      const overflowing = await page.locator('main *').evaluateAll((elements) =>
        elements
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && (rect.right > innerWidth + 2 || rect.left < -2);
          })
          .map((element) => element.tagName),
      );
      assert.deepEqual(overflowing, [], 'Valid API content must fit the mobile viewport');
      assert.equal(
        await page.getByRole('button', { name: 'Move link down', exact: true }).first().isVisible(),
        true,
      );
      const readback = page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/quick-links') && response.request().method() === 'GET',
      );
      await page.getByRole('button', { name: 'Move link down', exact: true }).first().click();
      await readback;
      assert.equal((await api('/api/quick-links')).body.data[0].name, 'Audit second');
      await screenshot('library-mobile');
    },
    { width: 390, height: 844 },
  );
});

test('Home shows honest empty states, session thoughts, and the specified mobile order', async () => {
  await fixture(
    async ({ page, go, screenshot }) => {
      await go('/home');
      const text = await page.locator('main').innerText();
      assert.doesNotMatch(text, /Spring 2025|midnight drive|Lossless|WARMTH|VINYL|UNKNOWN|3h ago/);
      const playback = page.getByRole('button', { name: /^play$|previous track|next track/i });
      assert.equal(await playback.count(), 3);
      for (const control of await playback.all()) assert.equal(await control.isDisabled(), true);
      assert.equal(
        await page.getByText('Playback is not available yet.', { exact: true }).isVisible(),
        true,
      );
      await page.getByRole('button', { name: /another thought/i }).click();
      assert.deepEqual(await page.locator('main h2').allTextContents(), [
        'Now Playing',
        'College',
        'Ideas',
        'News',
        'Quick Links',
      ]);
      await screenshot('home-mobile');
      await page.setViewportSize({ width: 1366, height: 900 });
      await screenshot('home-desktop');
    },
    { width: 390, height: 844 },
  );
});

test('reorder stays locked until the authoritative order is read back', async () => {
  await fixture(async ({ page, api, go, overrides }) => {
    for (const name of ['Audit A', 'Audit B', 'Audit C']) {
      await api('/api/quick-links', 'POST', { name, url: 'https://example.com' });
    }
    await go('/library');
    let release;
    let started;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const requested = new Promise((resolve) => {
      started = resolve;
    });
    overrides.set('GET /api/quick-links', async () => {
      started();
      await held;
      return false;
    });
    await page.getByRole('button', { name: 'Move link down', exact: true }).first().click();
    await requested;
    try {
      assert.equal(
        await page
          .getByRole('button', { name: 'Move link down', exact: true })
          .first()
          .isDisabled(),
        true,
      );
    } finally {
      overrides.delete('GET /api/quick-links');
      release();
    }
    await page.waitForFunction(() => {
      const links = document.querySelectorAll('section[aria-label="Shortcuts list"] h3');
      return links[0]?.textContent === 'Audit B';
    });
    assert.equal((await api('/api/quick-links')).body.data[0].name, 'Audit B');
  });
});

test('Home capture and link loading recover visibly without invented content', async () => {
  await fixture(async ({ page, api, go, overrides }) => {
    const unavailable = async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'AUDIT_UNAVAILABLE', message: 'Unavailable.' } }),
      });
      return true;
    };
    overrides.set('POST /api/ideas', unavailable);
    overrides.set('GET /api/quick-links', unavailable);
    await go('/home');
    const links = page.getByRole('region', { name: 'Quick Links', exact: true });
    await links.getByRole('alert').waitFor();
    assert.equal(await links.locator('a[target="_blank"]').count(), 0);
    const input = page.getByLabel('Quick thought', { exact: true });
    await input.fill('Audit Home retry draft');
    await page.getByRole('button', { name: 'Save thought', exact: true }).click();
    await page
      .getByText('Could not save your thought. Your draft is still here. Try again.', {
        exact: true,
      })
      .waitFor();
    assert.equal(await input.inputValue(), 'Audit Home retry draft');
    overrides.clear();
    await page.getByRole('button', { name: 'Save thought', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#home-quick-thought')?.value === '');
    assert.equal((await api('/api/ideas')).body.data[0].content, 'Audit Home retry draft');
    await links.getByRole('button', { name: 'Try again', exact: true }).click();
    await links.getByText('No links saved yet.', { exact: true }).waitFor();
  });
});

test('failed pin, favorite and delete actions report errors and leave content intact', async () => {
  await fixture(async ({ page, api, go, overrides }) => {
    const idea = (await api('/api/ideas', 'POST', { content: 'Audit retained idea' })).body.data;
    const link = (
      await api('/api/quick-links', 'POST', {
        name: 'Audit retained link',
        url: 'https://example.com',
      })
    ).body.data;
    const unavailable = async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'AUDIT_UNAVAILABLE', message: 'Unavailable.' } }),
      });
      return true;
    };
    overrides.set(`POST /api/ideas/${idea.id}/pin`, unavailable);
    overrides.set(`DELETE /api/ideas/${idea.id}`, unavailable);
    await go('/ideas');
    await page.getByRole('button', { name: 'Pin thought to top', exact: true }).click();
    await page.getByRole('alert').first().waitFor();
    assert.equal((await api(`/api/ideas/${idea.id}`)).body.data.isPinned, false);
    await page.getByLabel('Thought actions', { exact: true }).click();
    await page.getByRole('button', { name: 'Delete thought', exact: true }).click();
    await page.getByRole('button', { name: 'Delete?', exact: true }).click();
    await page
      .getByText('Could not delete this thought. Please try again.', { exact: true })
      .waitFor();
    assert.equal((await api(`/api/ideas/${idea.id}`)).status, 200);
    overrides.set(`POST /api/quick-links/${link.id}/favorite`, unavailable);
    overrides.set(`DELETE /api/quick-links/${link.id}`, unavailable);
    await go('/library');
    await page.getByRole('button', { name: 'Mark as favorite', exact: true }).click();
    await page.getByRole('alert').first().waitFor();
    assert.equal((await api(`/api/quick-links/${link.id}`)).body.data.isFavorite, false);
    await page.getByLabel('Shortcut actions', { exact: true }).click();
    await page.getByRole('button', { name: 'Delete shortcut', exact: true }).click();
    await page.getByRole('button', { name: 'Delete?', exact: true }).click();
    await page
      .getByText('Could not delete this shortcut. Please try again.', { exact: true })
      .waitFor();
    assert.equal((await api(`/api/quick-links/${link.id}`)).status, 200);
  });
});
