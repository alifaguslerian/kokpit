/* global document, innerWidth, getComputedStyle, window */
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

for (const [width, height] of [
  [1366, 768],
  [1280, 720],
]) {
  test(`room panels retain generous proportions and scroll clear of the dock at ${width}x${height}`, async () => {
    await fixture(
      async ({ page, create, go, screenshot }) => {
        await create('/api/ideas', {
          title: 'A small thought',
          content: 'Leave room for reading.',
        });
        await create('/api/quick-links', { name: 'Campus', url: 'https://example.com' });
        const semester = await create('/api/college/semesters', {
          name: 'Semester 1',
          isActive: true,
        });
        const course = await create(`/api/college/semesters/${semester.id}/courses`, {
          name: 'Interaction Design',
        });
        await create(`/api/college/courses/${course.id}/weeks`, {
          weekNumber: 1,
          title: 'Understanding people',
        });
        await go('/home');
        const musicBox = await page.locator(previewSelector('music')).boundingBox();
        const ideasBox = await page.locator(previewSelector('ideas')).boundingBox();
        assert.ok(musicBox.height >= 240, `Music needs vertical room: ${musicBox.height}px`);
        assert.ok(ideasBox.height >= 260, `Ideas needs vertical room: ${ideasBox.height}px`);
        await screenshot(`roomy-home-${width}x${height}`, { fullPage: false });
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const dockBox = await page.locator('.navigation-dock').boundingBox();
        const linksBox = await page.locator(previewSelector('links')).boundingBox();
        const scrolledIdeas = await page.locator(previewSelector('ideas')).boundingBox();
        const bottom = Math.max(
          linksBox.y + linksBox.height,
          scrolledIdeas.y + scrolledIdeas.height,
        );
        assert.ok(
          Math.abs(linksBox.y + linksBox.height - scrolledIdeas.y - scrolledIdeas.height) < 2,
        );
        assert.ok(
          bottom <= dockBox.y - 12,
          `Scrolled Home ends at ${bottom}px; dock starts at ${dockBox.y}px`,
        );
        await screenshot(`roomy-home-bottom-${width}x${height}`, {
          fullPage: false,
          resetScroll: false,
        });
        await assertFits(page);
      },
      { width, height },
    );
  });
}

for (const width of [1366, 390]) {
  test(`dock can hide and reopen with keyboard without losing a draft at ${width}px`, async () => {
    await fixture(
      async ({ page, go, screenshot }) => {
        await go('/home');
        const draft = page.getByLabel('Quick thought', { exact: true });
        await draft.fill('Keep this draft while hiding the dock.');
        const hide = page.getByRole('button', { name: 'Hide navigation', exact: true });
        await hide.focus();
        await page.keyboard.press('Enter');
        const show = page.getByRole('button', { name: 'Show navigation', exact: true });
        assert.equal(await show.getAttribute('aria-expanded'), 'false');
        assert.equal(
          await page.getByRole('navigation', { name: 'Main Navigation', exact: true }).count(),
          0,
        );
        assert.equal(await show.evaluate((element) => element === document.activeElement), true);
        await page.keyboard.press('Tab');
        assert.equal(
          await page.evaluate(() =>
            Boolean(document.activeElement?.closest('nav.bottom-navigation')),
          ),
          false,
        );
        await screenshot(`compact-dock-hidden-${width}`, { fullPage: false });
        await show.focus();
        await page.keyboard.press('Enter');
        assert.equal(await hide.getAttribute('aria-expanded'), 'true');
        assert.equal(await draft.inputValue(), 'Keep this draft while hiding the dock.');
        const nav = page.getByRole('navigation', { name: 'Main Navigation', exact: true });
        assert.equal(await nav.getByRole('link').count(), 6);
        await page.keyboard.press('Shift+Tab');
        assert.equal(
          await nav
            .getByRole('link', { name: 'Library', exact: true })
            .evaluate((element) => element === document.activeElement),
          true,
        );
        await page.keyboard.press('Enter');
        await page.waitForURL('**/library');
        await nav.locator('a[href="/library"][aria-current="page"]').waitFor();
        await assertFits(page);
      },
      { width, height: 844 },
    );
  });
}

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
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  };
  const screenshot = async (name, { fullPage = true, resetScroll = true } = {}) => {
    if (outputDirectory) {
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      if (resetScroll) await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(outputDirectory, `${name}.png`), fullPage });
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

for (const [width, height] of [
  [1600, 1000],
  [1366, 768],
  [390, 844],
  [320, 700],
]) {
  test(`the room grid and bottom dock remain usable at ${width}x${height}`, async () => {
    await fixture(
      async ({ page, create, go, screenshot }) => {
        await create('/api/ideas', {
          title: 'A room for reading',
          content: 'Keep one thought close while reading.',
          tags: ['reading'],
        });
        await create('/api/quick-links', {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/',
          isFavorite: true,
        });
        const semester = await create('/api/college/semesters', {
          name: 'Semester 1',
          isActive: true,
        });
        const course = await create(`/api/college/semesters/${semester.id}/courses`, {
          name: 'Interaction Design',
        });
        const week = await create(`/api/college/courses/${course.id}/weeks`, {
          weekNumber: 1,
          title: 'Understanding people',
        });
        await go('/home');
        await page.locator(`a[href="/college/weeks/${week.id}"]`).waitFor();
        const dock = page.getByRole('navigation', { name: 'Main Navigation', exact: true });
        assert.equal(await dock.count(), 1);
        assert.equal(await dock.getByRole('link').count(), 6);
        assert.equal(await page.locator('aside').count(), 0);
        assert.equal(await page.getByRole('button', { name: /navigation menu/i }).count(), 0);
        assert.deepEqual(
          await page
            .locator('.home-preview-grid > section')
            .evaluateAll((elements) =>
              elements.map((element) => element.getAttribute('aria-labelledby')),
            ),
          previewNames.map((name) => `home-${name}-title`),
        );
        const boxes = Object.fromEntries(
          await Promise.all(
            previewNames.map(async (name) => [
              name,
              await page.locator(previewSelector(name)).boundingBox(),
            ]),
          ),
        );
        if (width >= 1024) {
          const hero = page.getByRole('region', { name: 'Your room', exact: true });
          const clock = await hero.locator('time').boundingBox();
          const quote = await hero.locator('[aria-live="polite"]').boundingBox();
          assert.ok(
            quote.x > clock.x + clock.width,
            'The desktop quote belongs alongside the clock',
          );
          assert.ok(
            quote.y < clock.y + clock.height && quote.y + quote.height > clock.y,
            'Clock and quote share a visual row',
          );
          assert.ok(
            Math.abs(boxes.music.y - boxes.college.y) <= 2,
            'Both room columns start together',
          );
          assert.ok(
            Math.abs(boxes.ideas.y + boxes.ideas.height - boxes.links.y - boxes.links.height) <= 3,
            'Both room columns end together',
          );
          assert.ok(boxes.music.x + boxes.music.width < boxes.college.x);
          assert.ok(boxes.ideas.y >= boxes.music.y + boxes.music.height);
          assert.ok(boxes.news.y >= boxes.college.y + boxes.college.height);
          assert.ok(boxes.links.y >= boxes.news.y + boxes.news.height);
        } else {
          for (let index = 1; index < previewNames.length; index++) {
            const current = boxes[previewNames[index]];
            const previous = boxes[previewNames[index - 1]];
            assert.ok(
              current.y >= previous.y + previous.height,
              'Mobile cards follow the reading order',
            );
          }
        }
        for (const [index, box] of Object.values(boxes).entries()) {
          for (const other of Object.values(boxes).slice(index + 1)) {
            assert.equal(
              box.x < other.x + other.width - 1 &&
                box.x + box.width > other.x + 1 &&
                box.y < other.y + other.height - 1 &&
                box.y + box.height > other.y + 1,
              false,
              'Room panels must not overlap',
            );
          }
        }
        assert.equal(await page.locator('.home-ideas').count(), 1);
        assert.equal(await page.locator('.home-preview-grid > .room-panel').count(), 4);
        if (width === 1600) {
          const initialDock = await dock.boundingBox();
          const finalCardBottom = Math.max(
            boxes.ideas.y + boxes.ideas.height,
            boxes.links.y + boxes.links.height,
          );
          await screenshot('final-home-1600x1000-initial-clearance', { fullPage: false });
          assert.ok(
            finalCardBottom <= initialDock.y - 16,
            `The standard desktop room fits above the dock before scrolling: cards end at ${finalCardBottom.toFixed(1)}, dock starts at ${initialDock.y.toFixed(1)}`,
          );
        }
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const dockBox = await dock.boundingBox();
        const finalBox = await page.locator(previewSelector('links')).boundingBox();
        assert.ok(
          finalBox.y + finalBox.height <= dockBox.y - 8,
          'The bottom dock must not cover the final card at maximum scroll',
        );
        assert.ok(dockBox.x >= 0 && dockBox.x + dockBox.width <= width + 1);
        assert.ok(dockBox.y + dockBox.height <= height + 1);
        await assertFits(page);
        await screenshot(`final-home-${width}x${height}-bottom-viewport`, {
          fullPage: false,
          resetScroll: false,
        });
        await screenshot(`final-home-${width}x${height}`);
        await screenshot(`final-home-${width}x${height}-viewport`, { fullPage: false });
        if (width === 1600 || width === 390) {
          await go('/college');
          await page.locator(`a[href="/college/courses/${course.id}"]`).first().waitFor();
          await screenshot(`final-college-saved-${width}`);
        }
      },
      { width, height },
    );
  });
}

test('every dock destination selects its active route without losing browser history', async () => {
  await fixture(async ({ page, go, screenshot }) => {
    await go('/home');
    const dock = page.getByRole('navigation', { name: 'Main Navigation', exact: true });
    for (const name of ['College', 'Music', 'News', 'Ideas', 'Library', 'Home']) {
      await dock.getByRole('link', { name, exact: true }).click();
      await page.waitForURL(`**/${name.toLowerCase()}`);
      await dock.locator(`a[href="/${name.toLowerCase()}"][aria-current="page"]`).waitFor();
      assert.equal(await dock.locator('[aria-current="page"]').count(), 1);
      assert.equal(
        await dock.getByRole('link', { name, exact: true }).getAttribute('aria-current'),
        'page',
      );
      if (name === 'Music' || name === 'News') {
        assert.match(
          await page.locator('main').innerText(),
          /will be implemented in Milestone [56]/,
          'Unimplemented integrations remain honest',
        );
        await screenshot(`final-${name.toLowerCase()}-placeholder`);
      }
    }
    await page.goBack();
    await page.waitForURL('**/library');
    await dock.locator('a[href="/library"][aria-current="page"]').waitFor();
    assert.equal(
      await dock.getByRole('link', { name: 'Library', exact: true }).getAttribute('aria-current'),
      'page',
    );
  });
});

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
    for (const name of ['Idea', 'Question', 'To-do', 'Random', 'Save thought']) {
      await page.keyboard.press('Tab');
      assert.equal(
        await page
          .getByRole('button', { name, exact: true })
          .evaluate((element) => element === document.activeElement),
        true,
        'Composer tags and save remain reachable in keyboard order',
      );
      if (name === 'Idea') await page.keyboard.press('Space');
    }
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#home-quick-thought')?.value === '');
    assert.equal(
      (await api('/api/ideas')).body.data[0].content,
      'A draft kept while the room changes width',
    );
    assert.deepEqual((await api('/api/ideas')).body.data[0].tags, ['Idea']);
    await screenshot('stitch-home-mobile');
  });
});

test('local room decoration can fail without hiding the clock, content, or dock', async () => {
  await fixture(
    async ({ page, go, screenshot }) => {
      const requested = [];
      page.on('request', (request) => {
        if (request.resourceType() === 'image') requested.push(request.url());
      });
      await go('/home');
      assert.ok(
        requested.some((url) => new URL(url).pathname === '/images/room-background.webp'),
        'The shell loads the local approved room background',
      );
      await page.waitForFunction(() => {
        const image = document.querySelector('img[src="/images/room-background.webp"]');
        return image?.complete && image.naturalWidth > 0;
      });
      for (const source of requested) assert.equal(new URL(source).origin, new URL(baseUrl).origin);
      const hero = page.getByRole('region', { name: 'Your room', exact: true });
      const initial = await hero.boundingBox();
      await page.route('**/images/room-background.webp', (route) => route.abort());
      await go('/home');
      const failed = await hero.boundingBox();
      assert.ok(
        Math.abs(initial.height - failed.height) <= 2,
        'Missing decoration must not collapse the hero',
      );
      assert.equal(await hero.getByRole('heading', { level: 1 }).isVisible(), true);
      assert.equal(
        await page.getByRole('navigation', { name: 'Main Navigation', exact: true }).isVisible(),
        true,
      );
      const surface = await page.locator('main').evaluate((element) => {
        const colors = [];
        for (let node = element; node; node = node.parentElement)
          colors.push(getComputedStyle(node).backgroundColor);
        return colors;
      });
      assert.ok(
        surface.some((color) => color !== 'rgba(0, 0, 0, 0)'),
        'The room retains a solid fallback surface',
      );
      await page.getByLabel('Quick thought', { exact: true }).fill('The image is optional');
      await assertFits(page);
      await screenshot('final-home-failed-artwork');
    },
    { width: 1600, height: 1000 },
  );
});

test('reduced motion and unavailable backdrop blur retain usable controls', async () => {
  await fixture(
    async ({ page, go, screenshot }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await go('/home');
      await page.addStyleTag({
        content:
          '*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
      });
      const input = page.getByLabel('Quick thought', { exact: true });
      await input.fill('Readable without visual effects');
      const dock = page.getByRole('navigation', { name: 'Main Navigation', exact: true });
      const motionDurations = await page.locator('main *, nav *').evaluateAll((elements) =>
        elements.flatMap((element) => {
          const style = getComputedStyle(element);
          return [style.animationDuration, style.transitionDuration].flatMap((value) =>
            value.split(',').map((duration) => parseFloat(duration) * 1000),
          );
        }),
      );
      assert.ok(
        motionDurations.every((duration) => duration <= 1),
        'Reduced motion disables decorative motion and prolonged transitions',
      );
      await dock.getByRole('link', { name: 'Ideas', exact: true }).click();
      await page.waitForURL('**/ideas');
      assert.equal(await page.getByRole('heading', { level: 1 }).isVisible(), true);
      await page.goBack();
      await page.waitForURL('**/home');
      await assertFits(page);
      await screenshot('final-home-reduced-motion-no-blur');
    },
    { width: 390, height: 844 },
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

test('Ideas, Library, and College retain consistent functional titles and dock clearance', async () => {
  await fixture(async ({ page, go, screenshot }) => {
    for (const width of [1366, 1600, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const styles = [];
      for (const route of ['/ideas', '/library', '/college']) {
        await go(route);
        styles.push(await titleStyle(page));
        assert.equal(await page.locator('aside').count(), 0);
        const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
        assert.ok(heading.x >= 12 && heading.x + heading.width <= width - 12);
        const dock = page.getByRole('navigation', { name: 'Main Navigation', exact: true });
        assert.equal(
          await dock.getByRole('link', { name: route.slice(1), exact: false }).count(),
          1,
        );
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const dockBox = await dock.boundingBox();
        const bottomControl = await page
          .locator('main button:visible, main input:visible, main textarea:visible')
          .last()
          .boundingBox();
        if (bottomControl)
          assert.ok(
            bottomControl.y + bottomControl.height <= dockBox.y - 4,
            'Page controls remain above the dock',
          );
        await assertFits(page);
        await screenshot(`final-${route.slice(1)}-empty-${width}`);
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
      await page.waitForFunction(
        () =>
          document
            .querySelector('section[aria-label="Ideas list"] article')
            ?.getAttribute('aria-label') === 'Reading note',
      );
      const [firstBox, secondBox] = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { x: box.x, y: box.y, height: box.height };
        }),
      );
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
