import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import type { WorkerEnv } from '../../worker/env';
import { createTestD1 } from '../helpers/mock-d1';
import type { IdeaWithTags } from '../../worker/db/repositories/ideas.repository';
import type { QuickLinkRecord } from '../../worker/db/repositories/quick-links.repository';

function setup() {
  const db = createTestD1();
  const env = { DB: db } as WorkerEnv['Bindings'];
  const json = (url: string, method: string, body: unknown) =>
    app.request(
      url,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      env,
    );
  return { db, env, json };
}

test('D1 test batches roll back earlier statements when a later statement fails', async () => {
  const { db } = setup();
  await assert.rejects(
    db.batch([
      db.prepare("UPDATE users SET display_name = 'Changed'"),
      db.prepare('INSERT INTO missing_table VALUES (1)'),
    ]),
  );
  assert.equal(await db.prepare('SELECT display_name FROM users').first('display_name'), 'Owner');
});

for (const operation of ['create', 'update', 'delete'] as const) {
  test(`idea ${operation} rolls back all writes when a later write fails`, async () => {
    const { db, env, json } = setup();
    const createdResponse = await json('/api/ideas', 'POST', {
      content: 'Original',
      tags: ['Old'],
    });
    const original = ((await createdResponse.json()) as { data: IdeaWithTags }).data;
    const target = operation === 'delete' ? 'ideas' : 'idea_tag_links';
    const event = operation === 'delete' ? 'DELETE' : 'INSERT';
    await db.exec(
      `CREATE TRIGGER fail_write BEFORE ${event} ON ${target} BEGIN SELECT RAISE(ABORT, 'forced failure'); END;`,
    );
    const response =
      operation === 'create'
        ? await json('/api/ideas', 'POST', { content: 'New', tags: ['New'] })
        : operation === 'update'
          ? await json(`/api/ideas/${original.id}`, 'PATCH', { content: 'Changed', tags: ['New'] })
          : await app.request(`/api/ideas/${original.id}`, { method: 'DELETE' }, env);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected internal error occurred.' },
    });
    const list = (
      (await (await app.request('/api/ideas', {}, env)).json()) as { data: IdeaWithTags[] }
    ).data;
    assert.deepEqual(list, [original]);
    assert.equal(await db.prepare('SELECT COUNT(*) AS count FROM idea_tags').first('count'), 1);
  });
}

for (const [resource, action, field] of [
  ['ideas', 'pin', 'isPinned'],
  ['quick-links', 'favorite', 'isFavorite'],
] as const) {
  test(`${action} rejects invalid supplied JSON without toggling`, async () => {
    const { env, json } = setup();
    const create = await json(
      `/api/${resource}`,
      'POST',
      resource === 'ideas' ? { content: 'Thought' } : { name: 'Link', url: 'example.com' },
    );
    const original = ((await create.json()) as { data: { id: string } }).data;
    for (const body of ['{', 'null', '[]', 'true', JSON.stringify({ [field]: 'true' })]) {
      const response = await app.request(
        `/api/${resource}/${original.id}/${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        },
        env,
      );
      assert.equal(response.status, 400, body);
      const read = (
        (await (await app.request(`/api/${resource}/${original.id}`, {}, env)).json()) as {
          data: Record<string, unknown>;
        }
      ).data;
      assert.equal(read[field], false);
    }
  });
}

test('reorder rejects duplicate, missing, omitted and foreign IDs without changing rows', async () => {
  const { db, env, json } = setup();
  const links: QuickLinkRecord[] = [];
  for (const name of ['A', 'B']) {
    links.push(
      (
        (await (await json('/api/quick-links', 'POST', { name, url: 'example.com' })).json()) as {
          data: QuickLinkRecord;
        }
      ).data,
    );
  }
  await db.exec(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now'); INSERT INTO quick_links VALUES ('foreign', 'other', 'Other', 'https://example.com', 'favicon', NULL, NULL, 0, 0, 'now', 'now');",
  );
  for (const ids of [
    [links[1]!.id, links[1]!.id],
    [links[1]!.id, 'missing'],
    [links[1]!.id],
    [links[1]!.id, 'foreign'],
  ]) {
    const response = await json('/api/quick-links/reorder', 'POST', { ids });
    assert.equal(response.status, 400);
    const read = (
      (await (await app.request('/api/quick-links', {}, env)).json()) as { data: QuickLinkRecord[] }
    ).data;
    assert.deepEqual(read, links);
  }
});

test('reorder rolls back all positions on a later write failure', async () => {
  const { db, env, json } = setup();
  const links: QuickLinkRecord[] = [];
  for (const name of ['A', 'B']) {
    links.push(
      (
        (await (await json('/api/quick-links', 'POST', { name, url: 'example.com' })).json()) as {
          data: QuickLinkRecord;
        }
      ).data,
    );
  }
  await db.exec(
    "CREATE TRIGGER fail_reorder BEFORE UPDATE ON quick_links WHEN NEW.name = 'A' BEGIN SELECT RAISE(ABORT, 'forced failure'); END;",
  );
  const response = await json('/api/quick-links/reorder', 'POST', {
    ids: [links[1]!.id, links[0]!.id],
  });
  assert.equal(response.status, 500);
  const read = (
    (await (await app.request('/api/quick-links', {}, env)).json()) as { data: QuickLinkRecord[] }
  ).data;
  assert.deepEqual(read, links);
});

test('quick links reject unsafe or malformed URLs while preserving schemeless domain input', async () => {
  const { json } = setup();
  for (const url of [
    'ftp://example.com',
    'mailto:owner@example.com',
    'https://user:pass@example.com',
    'https:///example.com',
    'https://',
    'example.com/a b',
  ]) {
    assert.equal((await json('/api/quick-links', 'POST', { name: 'Link', url })).status, 400, url);
  }
  const created = await json('/api/quick-links', 'POST', { name: 'Link', url: 'example.com/path' });
  assert.equal(created.status, 201);
  assert.equal(
    ((await created.json()) as { data: QuickLinkRecord }).data.url,
    'https://example.com/path',
  );
});

test('explicit icon wins, host detection ignores path lookalikes, and clearing icon re-detects', async () => {
  const { json } = setup();
  const explicit = (
    (await (
      await json('/api/quick-links', 'POST', {
        name: 'Custom Github',
        url: 'github.com',
        iconValue: 'book',
      })
    ).json()) as { data: QuickLinkRecord }
  ).data;
  assert.equal(explicit.iconValue, 'book');
  assert.equal(explicit.iconType, 'lucide');
  const unrelated = (
    (await (
      await json(`/api/quick-links/${explicit.id}`, 'PATCH', { name: 'Renamed' })
    ).json()) as { data: QuickLinkRecord }
  ).data;
  assert.equal(unrelated.iconValue, 'book');
  const cleared = (
    (await (
      await json(`/api/quick-links/${explicit.id}`, 'PATCH', {
        url: 'youtube.com',
        iconValue: null,
      })
    ).json()) as { data: QuickLinkRecord }
  ).data;
  assert.equal(cleared.iconType, 'brand');
  assert.equal(cleared.iconValue, 'youtube');
  for (const url of ['https://example.com/github.com', 'https://github.com.evil.example']) {
    const link = (
      (await (await json('/api/quick-links', 'POST', { name: 'Plain', url })).json()) as {
        data: QuickLinkRecord;
      }
    ).data;
    assert.equal(link.iconType, 'favicon');
    assert.equal(link.iconValue, null);
  }
});

test('legacy icon types normalize on read without changing stored icon keys', async () => {
  const { db, env } = setup();
  await db.exec(
    "INSERT INTO quick_links VALUES ('legacy', 'user-owner-1', 'Legacy', 'https://github.com', 'platform', 'github', NULL, 0, 0, 'now', 'now');",
  );
  const response = await app.request('/api/quick-links/legacy', {}, env);
  const link = ((await response.json()) as { data: QuickLinkRecord }).data;
  assert.equal(link.iconType, 'brand');
  assert.equal(link.iconValue, 'github');
  assert.equal(
    await db.prepare("SELECT icon_type FROM quick_links WHERE id = 'legacy'").first('icon_type'),
    'platform',
  );
});

test('idea tag reuse resolves existing IDs and never reads another owners tag', async () => {
  const { db, env, json } = setup();
  await db.exec(
    "INSERT INTO users VALUES ('other', 'other@example.com', 'Other', 'member', 'now', 'now'); INSERT INTO idea_tags VALUES ('foreign-tag', 'other', 'Private', 'now');",
  );
  const first = (
    (await (await json('/api/ideas', 'POST', { content: 'First', tags: ['Shared'] })).json()) as {
      data: IdeaWithTags;
    }
  ).data;
  const second = (
    (await (
      await json('/api/ideas', 'POST', { content: 'Second', tags: ['Shared', 'Shared'] })
    ).json()) as { data: IdeaWithTags }
  ).data;
  assert.equal(
    await db
      .prepare(
        "SELECT COUNT(*) AS count FROM idea_tags WHERE user_id = 'user-owner-1' AND name = 'Shared'",
      )
      .first('count'),
    1,
  );
  assert.deepEqual(second.tags, ['Shared']);
  await db.prepare('INSERT INTO idea_tag_links VALUES (?, ?)').bind(first.id, 'foreign-tag').run();
  const read = (
    (await (await app.request(`/api/ideas/${first.id}`, {}, env)).json()) as { data: IdeaWithTags }
  ).data;
  assert.deepEqual(read.tags, ['Shared']);
  const filtered = (
    (await (await app.request('/api/ideas?tag=Private', {}, env)).json()) as {
      data: IdeaWithTags[];
    }
  ).data;
  assert.deepEqual(filtered, []);
  const updated = await json(`/api/ideas/${second.id}`, 'PATCH', { tags: ['Shared', 'Fresh'] });
  assert.equal(updated.status, 200);
  const reloaded = (
    (await (await app.request(`/api/ideas/${second.id}`, {}, env)).json()) as { data: IdeaWithTags }
  ).data;
  assert.deepEqual([...reloaded.tags].sort(), ['Fresh', 'Shared']);
});

test('idea pagination uses a stable ID tie breaker when creation timestamps match', async () => {
  const { db, env } = setup();
  for (const id of ['idea-b', 'idea-d', 'idea-a', 'idea-c']) {
    await db
      .prepare(
        "INSERT INTO ideas (id, user_id, title, content, is_pinned, created_at, updated_at) VALUES (?, 'user-owner-1', NULL, 'Thought', 0, '2026-10-23T00:00:00.000Z', '2026-10-23T00:00:00.000Z')",
      )
      .bind(id)
      .run();
  }
  const ids: string[] = [];
  for (const offset of [0, 2]) {
    const response = await app.request(`/api/ideas?limit=2&offset=${offset}`, {}, env);
    assert.equal(response.status, 200);
    const page = ((await response.json()) as { data: IdeaWithTags[] }).data;
    ids.push(...page.map((idea) => idea.id));
  }
  assert.deepEqual(ids, ['idea-d', 'idea-c', 'idea-b', 'idea-a']);
  assert.equal(new Set(ids).size, 4);
});
