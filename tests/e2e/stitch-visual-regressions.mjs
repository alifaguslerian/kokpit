/* global document, innerWidth, getComputedStyle */
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
const previewNames = ['music', 'college', 'ideas', 'news', 'links'];
const previewSelector = (name) => `section[aria-labelledby="home-${name}-title"]`;
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

async function fixture(run, viewport = { width: 1366, height: 900 }) {
  const env = { DB: createTestD1() };
  await env.DB.exec('PRAGMA foreign_keys = ON');
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
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
    if (outputDirectory) {
      await page.screenshot({ path: path.join(outputDirectory, `${name}.png`), fullPage: true });
    }
  };
  try {
    await run({ page, api, create, go, overrides, screenshot });
    assert.deepEqual(errors, [], 'Visual changes must not cause unhandled browser errors');
  } finally {
    await context.close();
  }
}

async function assertFits(page) {
  const overflowing = await page.locator('main *').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > innerWidth + 2 || rect.left < -2);
      })
      .map((element) => element.tagName),
  );
  assert.deepEqual(overflowing, [], 'Rendered content must fit the viewport');
}

for (const width of [1366, 1600]) {
  test(`Home columns follow their own content height at ${width}px`, async () => {
    await fixture(
      async ({ page, go, screenshot }) => {
        await go('/home');
        await screenshot(`stitch-home-${width}`);
        for (const [musicHeight, collegeHeight] of [
          [430, 270],
          [260, 470],
        ]) {
          await page.locator(previewSelector('music')).evaluate((element, height) => {
            element.style.minHeight = `${height}px`;
          }, musicHeight);
          await page.locator(previewSelector('college')).evaluate((element, height) => {
            element.style.minHeight = `${height}px`;
          }, collegeHeight);
          // ResizeObserver must respond to real content changes in either column.
          await page.waitForFunction(
            ({ names, expectedGap }) => {
              const boxes = Object.fromEntries(
                names.map((name) => [
                  name,
                  document
                    .querySelector(`section[aria-labelledby="home-${name}-title"]`)
                    .getBoundingClientRect(),
                ]),
              );
              return [
                ['music', 'ideas'],
                ['college', 'news'],
                ['news', 'links'],
              ].every(([above, below]) => {
                const gap = boxes[below].top - boxes[above].bottom;
                return gap >= expectedGap - 1 && gap <= expectedGap + 2;
              });
            },
            { names: previewNames, expectedGap: width < 1440 ? 16 : 24 },
          );
          const boxes = await Promise.all(
            previewNames.map(async (name) => [
              name,
              await page.locator(previewSelector(name)).boundingBox(),
            ]),
          );
          const byName = Object.fromEntries(boxes);
          assert.ok(Math.abs(byName.music.y - byName.college.y) <= 2);
          assert.ok(Math.abs(byName.music.x - byName.ideas.x) <= 2);
          assert.ok(Math.abs(byName.college.x - byName.news.x) <= 2);
          assert.ok(byName.music.x + byName.music.width < byName.college.x);
          for (let index = 0; index < boxes.length; index++) {
            for (const [, other] of boxes.slice(index + 1)) {
              const [, box] = boxes[index];
              const overlaps =
                box.x < other.x + other.width - 1 &&
                box.x + box.width > other.x + 1 &&
                box.y < other.y + other.height - 1 &&
                box.y + box.height > other.y + 1;
              assert.equal(overlaps, false, 'Preview cards must not overlap');
            }
          }
        }
        await assertFits(page);
      },
      { width, height: 1000 },
    );
  });
}

test('Home retains its real draft, mobile reading order, and keyboard order through resizing', async () => {
  await fixture(async ({ page, api, go, screenshot }) => {
    await go('/home');
    const input = page.getByLabel('Quick thought', { exact: true });
    await input.fill('A draft kept while the room changes width');
    for (const width of [390, 1600, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await input.count(), 1, 'Responsive layouts must not duplicate the composer');
      assert.equal(await input.inputValue(), 'A draft kept while the room changes width');
      assert.deepEqual(
        await page
          .locator('main section[aria-labelledby^="home-"]')
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute('aria-labelledby')),
          ),
        previewNames.map((name) => `home-${name}-title`),
      );
      await assertFits(page);
    }
    const boxes = await Promise.all(
      previewNames.map((name) => page.locator(previewSelector(name)).boundingBox()),
    );
    for (let index = 1; index < boxes.length; index++) {
      assert.ok(boxes[index].y >= boxes[index - 1].y + boxes[index - 1].height);
    }
    await page.getByRole('link', { name: 'Open Music', exact: true }).focus();
    const visited = ['home-music-title'];
    for (let index = 0; index < 35; index++) {
      await page.keyboard.press('Tab');
      const section = await page.evaluate(() =>
        document.activeElement
          ?.closest('section[aria-labelledby^="home-"]')
          ?.getAttribute('aria-labelledby'),
      );
      if (section && visited.at(-1) !== section) visited.push(section);
      if (section === 'home-links-title') break;
    }
    assert.deepEqual(
      visited,
      previewNames.map((name) => `home-${name}-title`),
    );
    await input.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#home-quick-thought')?.value === '');
    assert.equal(
      (await api('/api/ideas')).body.data[0].content,
      'A draft kept while the room changes width',
    );
    await screenshot('stitch-home-mobile');
  });
});

test('Home artwork is local and a failed image leaves the room usable', async () => {
  await fixture(
    async ({ page, go, screenshot }) => {
      await go('/home');
      const hero = page.getByRole('region', { name: 'Your room', exact: true });
      const sources = await hero.evaluate((element) => {
        const children = [element, ...element.querySelectorAll('*')];
        return children.flatMap((child) => {
          const background = getComputedStyle(child).backgroundImage;
          return [
            ...(child.tagName === 'IMG' ? [child.getAttribute('src')] : []),
            ...Array.from(background.matchAll(/url\(["']?([^"')]+)["']?\)/g), (match) => match[1]),
          ];
        });
      });
      assert.ok(sources.length > 0, 'The desktop hero should render its approved room artwork');
      for (const source of sources) {
        assert.equal(new URL(source, page.url()).origin, new URL(baseUrl).origin);
      }
      const initial = await hero.boundingBox();
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() === 'image') await route.abort();
        else await route.fallback();
      });
      await go('/home');
      const failed = await hero.boundingBox();
      assert.ok(
        Math.abs(initial.height - failed.height) <= 2,
        'Missing decoration must not collapse the hero',
      );
      assert.equal(await hero.getByRole('heading', { level: 1 }).isVisible(), true);
      await page.getByLabel('Quick thought', { exact: true }).fill('The image is optional');
      await assertFits(page);
      await screenshot('stitch-home-failed-artwork');
    },
    { width: 1600, height: 1000 },
  );
});

async function titleStyle(page) {
  return page.getByRole('heading', { level: 1 }).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      family: style.fontFamily,
      size: style.fontSize,
      weight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
    };
  });
}

test('Ideas, Library, and College use the same functional title and responsive page spacing', async () => {
  await fixture(async ({ page, go, screenshot }) => {
    for (const [width, paddingX, paddingY, gap] of [
      [1366, 24, 22, 20],
      [1600, 40, 32, 24],
      [390, 16, 20, 20],
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      const styles = [];
      for (const route of ['/ideas', '/library', '/college']) {
        await go(route);
        styles.push(await titleStyle(page));
        if (width >= 1024) {
          const sidebar = await page.locator('aside:visible').first().boundingBox();
          assert.equal(sidebar.width, width < 1440 ? 220 : 280, `Sidebar width at ${width}px`);
        }
        const spacing = await page.getByRole('heading', { level: 1 }).evaluate((element) => {
          const container = element.closest('header').parentElement;
          const style = getComputedStyle(container);
          return [
            parseFloat(style.paddingLeft),
            parseFloat(style.paddingTop),
            parseFloat(style.rowGap),
          ];
        });
        assert.deepEqual(spacing, [paddingX, paddingY, gap], `${route} spacing at ${width}px`);
        await assertFits(page);
        await screenshot(`stitch-${route.slice(1)}-empty-${width}`);
      }
      assert.match(styles[0].family, /Inter/i);
      assert.deepEqual(styles[1], styles[0], 'Library title must match Ideas');
      assert.deepEqual(styles[2], styles[0], 'College title must match Ideas');
    }
  });
});

test('College keeps its header stable through loading, failed read, and empty recovery', async () => {
  await fixture(async ({ page, go, overrides, screenshot }) => {
    await go('/college');
    const expected = await titleStyle(page);
    let release;
    let requested;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    const started = new Promise((resolve) => {
      requested = resolve;
    });
    overrides.set('GET /api/college/semesters', async (route) => {
      requested();
      await held;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'UNAVAILABLE', message: 'Unavailable.' } }),
      });
      return true;
    });
    await page.goto(baseUrl + '/college');
    await started;
    try {
      await page.getByText('Loading semesters…', { exact: true }).waitFor();
      assert.deepEqual(await titleStyle(page), expected);
      await screenshot('stitch-college-loading');
    } finally {
      release();
    }
    await page.getByRole('alert').first().waitFor();
    assert.deepEqual(await titleStyle(page), expected);
    await screenshot('stitch-college-error');
    overrides.clear();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await page.getByRole('heading', { name: 'No semesters yet', exact: true }).waitFor();
    assert.deepEqual(await titleStyle(page), expected);
    await assertFits(page);
  });
});

test('Ideas is a readable single stream and a keyboard pin persists through search and filtering', async () => {
  await fixture(
    async ({ page, api, create, go, screenshot }) => {
      const first = await create('/api/ideas', {
        title: 'Reading note',
        content: 'A saved reflection with a deliberate line break.\nAnd its next line.',
        tags: ['reading'],
      });
      await create('/api/ideas', {
        title: 'Another note',
        content: 'A separate unpinned reflection.',
      });
      await go('/ideas');
      const stream = page.getByRole('region', { name: 'Ideas list', exact: true });
      const cards = stream.getByRole('article');
      const item = stream.getByRole('article', { name: 'Reading note', exact: true });
      const pin = item.getByRole('button', { name: 'Pin thought to top', exact: true });
      await pin.focus();
      assert.equal(await pin.evaluate((element) => element.matches(':focus-visible')), true);
      await page.keyboard.press('Enter');
      await item.getByRole('button', { name: 'Unpin thought', exact: true }).waitFor();
      assert.equal((await api(`/api/ideas/${first.id}`)).body.data.isPinned, true);
      const editButtons = stream.getByRole('button', { name: 'Edit thought', exact: true });
      const firstBox = await cards.nth(0).boundingBox();
      const secondBox = await cards.nth(1).boundingBox();
      assert.ok(
        secondBox.y >= firstBox.y + firstBox.height,
        'Saved thoughts should read vertically rather than across columns',
      );
      assert.ok(Math.abs(secondBox.x - firstBox.x) <= 2);
      assert.equal(await cards.count(), 2);
      await page.getByRole('button', { name: 'Pinned Only', exact: true }).click();
      await stream
        .getByRole('heading', { name: 'Another note', exact: true })
        .waitFor({ state: 'hidden' });
      assert.equal(await editButtons.count(), 1);
      await page.getByLabel('Search thoughts', { exact: true }).fill('Reading note');
      await stream.getByRole('heading', { name: 'Reading note', exact: true }).waitFor();
      assert.equal(
        await item.getByRole('button', { name: 'Unpin thought', exact: true }).isVisible(),
        true,
      );
      await page.reload();
      await stream.getByRole('button', { name: 'Unpin thought', exact: true }).waitFor();
      await assertFits(page);
      await screenshot('stitch-ideas-stream-desktop');
      await page.setViewportSize({ width: 390, height: 844 });
      await assertFits(page);
      await screenshot('stitch-ideas-stream-mobile');
    },
    { width: 1600, height: 1000 },
  );
});

test('Library portals keep a vertical primary link and accessible actions with long mobile metadata', async () => {
  await fixture(
    async ({ page, api, create, go, screenshot }) => {
      const longName = 'L'.repeat(100);
      const link = await create('/api/quick-links', {
        name: longName,
        url: 'https://example.com/portal',
        groupName: 'Research'.repeat(7).slice(0, 50),
      });
      await create('/api/quick-links', {
        name: 'Second portal',
        url: 'https://example.org/portal',
      });
      await go('/library');
      const primary = page.locator('a[href="https://example.com/portal"]').first();
      const heading = primary.getByRole('heading', { name: longName, exact: true });
      const icon = primary.locator('svg').first();
      const iconBox = await icon.boundingBox();
      const headingBox = await heading.boundingBox();
      assert.ok(
        headingBox.y >= iconBox.y + iconBox.height,
        'A portal title belongs below its recognizable icon',
      );
      assert.equal(await primary.getAttribute('target'), '_blank');
      assert.match(await primary.getAttribute('rel'), /noopener/);
      const edit = page.getByRole('button', { name: 'Edit shortcut', exact: true }).first();
      await edit.focus();
      assert.equal(await edit.evaluate((element) => element.matches(':focus-visible')), true);
      await page.keyboard.press('Enter');
      await page.getByRole('dialog').waitFor();
      assert.equal(await page.getByLabel('Name', { exact: true }).inputValue(), longName);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Mark as favorite', exact: true }).first().click();
      await page.getByRole('button', { name: 'Remove from favorites', exact: true }).waitFor();
      assert.equal((await api(`/api/quick-links/${link.id}`)).body.data.isFavorite, true);
      await screenshot('stitch-library-portals-desktop');
      await page.setViewportSize({ width: 390, height: 844 });
      await assertFits(page);
      assert.equal(await heading.isVisible(), true);
      assert.equal(await edit.isVisible(), true);
      await screenshot('stitch-library-portals-mobile');
    },
    { width: 1600, height: 1000 },
  );
});
