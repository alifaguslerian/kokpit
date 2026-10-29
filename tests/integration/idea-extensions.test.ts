import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import { createTestD1 } from '../helpers/mock-d1';
import { createTestR2 } from '../helpers/mock-r2';
import { createDb } from '../../worker/db/client';
import { IdeasRepository } from '../../worker/db/repositories/ideas.repository';
import { IdeaCoversRepository } from '../../worker/db/repositories/idea-covers.repository';
import { IdeaCoversService } from '../../worker/services/idea-covers.service';

const png = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  ),
);
function fixture() {
  const storage = createTestR2();
  const env = { DB: createTestD1(), R2: storage.bucket };
  const request = async (path: string, method = 'GET', body?: unknown) => {
    const response = await app.request(
      '/api/' + path,
      {
        method,
        ...(body !== undefined
          ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
          : {}),
      },
      env,
    );
    return {
      status: response.status,
      body: (await response.json()) as {
        data: Record<string, unknown> & Array<Record<string, unknown>>;
        error: unknown;
      },
    };
  };
  const create = async (path: string, body: unknown) => {
    const result = await request(path, 'POST', body);
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body.data;
  };
  const upload = (id: string, bytes = png, type = 'image/png') => {
    const data = new FormData();
    data.set('file', new Blob([new Uint8Array(bytes)], { type }), 'cover.png');
    return app.request('/api/ideas/' + id + '/cover', { method: 'PUT', body: data }, env);
  };
  return { env, storage, request, create, upload };
}

test('collections normalize names, reorder completely and clear membership without losing ideas', async () => {
  const { request, create } = fixture();
  const first = await create('idea-collections', { name: '  Personal  ' });
  const second = await create('idea-collections', { name: 'Learning' });
  assert.equal(first.name, 'Personal');
  assert.equal(
    (await request('idea-collections', 'POST', { name: 'ＰＥＲＳＯＮＡＬ' })).status,
    409,
  );
  const idea = await create('ideas', {
    content: 'Kept thought',
    collectionId: first.id,
    isFavorite: true,
    isPinned: true,
    tags: ['Idea'],
  });
  assert.equal(
    (await request('idea-collections/reorder', 'PUT', { ids: [second.id] })).status,
    400,
  );
  assert.equal(
    (await request('idea-collections/reorder', 'PUT', { ids: [second.id, first.id] })).status,
    200,
  );
  assert.deepEqual(
    (await request('idea-collections')).body.data.map((row) => row.id),
    [second.id, first.id],
  );
  assert.equal(
    (await request('idea-collections/' + first.id, 'PATCH', { name: 'Private' })).status,
    200,
  );
  assert.equal((await request('idea-collections/' + first.id, 'DELETE')).status, 200);
  const kept = (await request('ideas/' + idea.id)).body.data;
  assert.equal(kept.collectionId, null);
  assert.equal(kept.isPinned, true);
  assert.equal(kept.isFavorite, true);
  assert.deepEqual(kept.tags, ['Idea']);
});

test('favorite and collection predicates intersect with existing search, tags, pins and pagination', async () => {
  const { request, create, env } = fixture();
  const collection = await create('idea-collections', { name: 'Projects' });
  const a = await create('ideas', {
    content: 'calm building',
    tags: ['Idea'],
    isPinned: true,
    collectionId: collection.id,
  });
  const b = await create('ideas', {
    content: 'calm building',
    tags: ['Idea'],
    isFavorite: true,
    collectionId: collection.id,
  });
  await create('ideas', { content: 'other', tags: ['Question'], isFavorite: true });
  const result = await request(
    `ideas?q=building&tag=Idea&favorite=true&collectionId=${collection.id}&limit=1&offset=0`,
  );
  assert.equal(result.status, 200);
  assert.deepEqual(
    result.body.data.map((row) => row.id),
    [b.id],
  );
  assert.equal((await request('ideas/' + a.id, 'PATCH', { isFavorite: true })).status, 200);
  const pinned = (await request('ideas/' + a.id)).body.data;
  assert.equal(pinned.isPinned, true);
  assert.equal(pinned.isFavorite, true);
  await env.DB.prepare('UPDATE ideas SET updated_at = ? WHERE id = ?')
    .bind('2099-01-01T00:00:00Z', b.id)
    .run();
  assert.equal((await request('ideas?favorite=true&sort=updated&limit=1')).body.data[0]!.id, b.id);
  assert.equal((await request('ideas?favorite=maybe')).status, 400);
  assert.equal(
    (await request('ideas', 'POST', { content: 'reject', collectionId: 'missing' })).status,
    404,
  );
});

test('private covers validate bytes, replace safely, stream without exposing storage keys and clean up on delete', async () => {
  const { create, upload, request, env, storage } = fixture();
  const idea = await create('ideas', { content: 'A real note' });
  const id = String(idea.id);
  assert.equal((await upload(id, new TextEncoder().encode('<svg/>'))).status, 415);
  assert.equal(storage.objects.size, 0);
  const response = await upload(id);
  assert.equal(response.status, 200, await response.clone().text());
  const value = (await response.json()) as { data: { coverUrl: string } };
  assert.ok(value.data.coverUrl);
  assert.equal(JSON.stringify(value).includes('coverR2Key'), false);
  const oldKey = [...storage.objects.keys()][0]!;
  const file = await app.request(value.data.coverUrl, {}, env);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get('Cache-Control'), 'private, no-store');
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), png);
  assert.equal((await upload(id)).status, 200);
  assert.equal(storage.objects.has(oldKey), false);
  assert.equal(storage.objects.size, 1);
  storage.failures.delete = true;
  assert.equal((await request('ideas/' + id, 'DELETE')).status, 503);
  assert.equal((await request('ideas/' + id)).status, 200);
  storage.failures.delete = false;
  assert.equal((await request('ideas/' + id, 'DELETE')).status, 200);
  assert.equal(storage.objects.size, 0);
});

test('failed cover upload or metadata writes preserve the old cover and remove replacement bytes', async () => {
  const { create, upload, request, env, storage } = fixture();
  const idea = await create('ideas', { content: 'Draft' });
  const id = String(idea.id);
  assert.equal((await upload(id)).status, 200);
  const original = [...storage.objects.keys()];
  storage.failures.put = true;
  assert.equal((await upload(id)).status, 503);
  storage.failures.put = false;
  assert.deepEqual([...storage.objects.keys()], original);
  await env.DB.exec(
    `CREATE TRIGGER reject_cover BEFORE UPDATE OF cover_r2_key ON ideas BEGIN SELECT RAISE(ABORT, 'fixture'); END;`,
  );
  assert.equal((await upload(id)).status, 503);
  assert.deepEqual([...storage.objects.keys()], original);
  await env.DB.exec('DROP TRIGGER reject_cover');
  assert.equal((await request('ideas/' + id + '/cover', 'DELETE')).status, 200);
  assert.equal((await request('ideas/' + id)).body.data.coverUrl, null);
  assert.equal(storage.objects.size, 0);
});

test('collection and cover operations reject foreign parents and inconsistent legacy ancestry', async () => {
  const { env, request, create, upload } = fixture();
  await env.DB.exec(
    "INSERT INTO users VALUES ('foreign', 'foreign@example.com', 'Other', 'member', 't', 't'); INSERT INTO idea_collections VALUES ('foreign-collection', 'foreign', 'Private', 'private', 0, 't', 't');",
  );
  const own = await create('idea-collections', { name: 'Owned' });
  const idea = await create('ideas', { content: 'Owned thought' });
  assert.equal(
    (await request('ideas', 'POST', { content: 'Invalid', collectionId: 'foreign-collection' }))
      .status,
    404,
  );
  assert.equal((await request('ideas?collectionId=foreign-collection')).status, 404);
  assert.equal(
    (await request('idea-collections/foreign-collection', 'PATCH', { name: 'Stolen' })).status,
    404,
  );
  assert.equal((await request('idea-collections/foreign-collection', 'DELETE')).status, 404);
  assert.equal(
    (await request('idea-collections/reorder', 'PUT', { ids: ['foreign-collection'] })).status,
    400,
  );
  await env.DB.prepare('UPDATE ideas SET collection_id = ? WHERE id = ?')
    .bind('foreign-collection', idea.id)
    .run();
  assert.equal((await request('ideas/' + idea.id)).status, 404);
  assert.equal((await request('ideas/' + idea.id, 'PATCH', { content: 'Changed' })).status, 404);
  assert.equal((await upload(String(idea.id))).status, 404);
  assert.deepEqual((await request('ideas')).body.data, []);
  await env.DB.prepare(
    "INSERT INTO ideas (id,user_id,content,collection_id,created_at,updated_at) VALUES ('foreign-idea','foreign','Other',?,'t','t')",
  )
    .bind(own.id)
    .run();
  assert.equal((await request('idea-collections/' + own.id, 'DELETE')).status, 409);
  assert.equal((await request('idea-collections')).body.data.length, 1);
});

test('collection reorder is atomic when a later write fails', async () => {
  const { env, request, create } = fixture();
  const a = await create('idea-collections', { name: 'First' });
  const b = await create('idea-collections', { name: 'Second' });
  await env.DB.exec(
    `CREATE TRIGGER fail_reorder BEFORE UPDATE OF position ON idea_collections WHEN OLD.name = 'First' BEGIN SELECT RAISE(ABORT, 'fixture'); END;`,
  );
  assert.equal(
    (await request('idea-collections/reorder', 'PUT', { ids: [b.id, a.id] })).status,
    500,
  );
  assert.deepEqual(
    (await request('idea-collections')).body.data.map((row) => row.id),
    [a.id, b.id],
  );
});

test('cover metadata cleanup failures are explicit and retryable without deleting idea text', async () => {
  const { env, request, create, upload, storage } = fixture();
  const idea = await create('ideas', { content: 'Keep this', tags: ['Idea'] });
  assert.equal((await upload(String(idea.id))).status, 200);
  await env.DB.exec(
    "CREATE TRIGGER fail_clear BEFORE UPDATE OF cover_r2_key ON ideas WHEN NEW.cover_r2_key IS NULL BEGIN SELECT RAISE(ABORT, 'fixture'); END;",
  );
  assert.equal((await request('ideas/' + idea.id + '/cover', 'DELETE')).status, 503);
  assert.equal(storage.objects.size, 0);
  assert.equal((await request('ideas/' + idea.id)).body.data.content, 'Keep this');
  await env.DB.exec('DROP TRIGGER fail_clear');
  assert.equal((await request('ideas/' + idea.id + '/cover', 'DELETE')).status, 200);
  assert.equal((await request('ideas/' + idea.id)).body.data.coverUrl, null);
});

test('final idea deletion refuses a newly attached cover and preserves tags', async () => {
  const { env, request, create, upload } = fixture();
  const idea = await create('ideas', { content: 'Keep this', tags: ['Idea'] });
  assert.equal((await upload(String(idea.id))).status, 200);
  const repository = new IdeasRepository(createDb(env.DB));
  assert.equal(await repository.delete(String(idea.id), 'user-owner-1'), false);
  assert.deepEqual((await request('ideas/' + idea.id)).body.data.tags, ['Idea']);
});

test('private cover reads and cleanup reject shared or foreign storage keys', async () => {
  const { env, request, create, upload, storage } = fixture();
  const idea = await create('ideas', { content: 'Original' });
  const sibling = await create('ideas', { content: 'Sibling' });
  await upload(String(idea.id));
  const key = [...storage.objects.keys()][0]!;
  await env.DB.prepare(
    "UPDATE ideas SET cover_r2_key = ?,cover_mime_type = 'image/png',cover_size_bytes = ? WHERE id = ?",
  )
    .bind(key, png.length, sibling.id)
    .run();
  assert.equal((await request('ideas/' + idea.id + '/cover')).status, 409);
  assert.equal((await request('ideas/' + sibling.id + '/cover')).status, 409);
  assert.equal((await request('ideas/' + idea.id + '/cover', 'DELETE')).status, 409);
  assert.equal(storage.objects.size, 1);
});

test('Ideas write boundaries reject cross-origin writes and untrusted cover metadata', async () => {
  const { env, request, create } = fixture();
  const idea = await create('ideas', { content: 'Original' });
  const forbidden = await app.request(
    '/api/ideas/' + idea.id,
    {
      method: 'PATCH',
      headers: { Origin: 'https://foreign.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: true }),
    },
    env,
  );
  assert.equal(forbidden.status, 403);
  assert.equal(
    (await request('ideas/' + idea.id, 'PATCH', { coverUrl: 'https://foreign.example/image.png' }))
      .status,
    400,
  );
  assert.equal((await request('ideas/' + idea.id, 'PATCH', { collectionId: '' })).status, 400);
});

test('a committed cover with a lost database acknowledgement retains its live bytes', async () => {
  const { env, create, upload, storage } = fixture();
  const idea = await create('ideas', { content: 'Keep the image' });
  const id = String(idea.id);
  await upload(id);
  const old = [...storage.objects.keys()][0]!;
  class LostAckRepository extends IdeaCoversRepository {
    private once = true;
    override async replace(...args: Parameters<IdeaCoversRepository['replace']>) {
      const saved = await super.replace(...args);
      if (saved && this.once) {
        this.once = false;
        throw new Error('fixture acknowledgement lost');
      }
      return saved;
    }
  }
  const service = new IdeaCoversService(new LostAckRepository(createDb(env.DB)), storage.bucket);
  await service.upload(id, 'user-owner-1', {
    body: new Blob([png]).stream(),
    mimeType: 'image/png',
  });
  assert.equal(storage.objects.has(old), false);
  assert.equal(storage.objects.size, 1);
  assert.equal((await service.read(id, 'user-owner-1', false)).status, 200);
});

test('collection pages expose every saved collection without an unbounded response', async () => {
  const { env } = fixture();
  for (let index = 0; index < 101; index++)
    await env.DB.prepare('INSERT INTO idea_collections VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(
        'collection-' + index,
        'user-owner-1',
        'Name ' + index,
        'name ' + index,
        index,
        't',
        't',
      )
      .run();
  const first = await app.request('/api/idea-collections?limit=100', {}, env);
  const page = (await first.json()) as { data: unknown[]; nextOffset: number | null };
  assert.equal(page.data.length, 100);
  assert.equal(page.nextOffset, 100);
  const second = await app.request('/api/idea-collections?limit=100&offset=100', {}, env);
  const last = (await second.json()) as { data: unknown[]; nextOffset: number | null };
  assert.equal(last.data.length, 1);
  assert.equal(last.nextOffset, null);
  const prepare = env.DB.prepare.bind(env.DB);
  env.DB.prepare = (query: string) => {
    const statement = prepare(query);
    return {
      ...statement,
      bind(...values: unknown[]) {
        assert.ok(values.length <= 100, 'D1 statements support at most 100 bound parameters.');
        return statement.bind(...values);
      },
    } as D1PreparedStatement;
  };
  const reordered = await app.request(
    '/api/idea-collections/reorder',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: Array.from({ length: 101 }, (_, index) => 'collection-' + (100 - index)),
      }),
    },
    env,
  );
  assert.equal(reordered.status, 200, await reordered.text());
});

test('streamed multipart cover uploads handle split boundaries and reject extra fields before storage', async () => {
  const { env, create, storage } = fixture();
  const idea = await create('ideas', { content: 'Chunked image' });
  const form = new FormData();
  form.set('file', new Blob([png], { type: 'image/png' }), 'image.png');
  const sample = new Request('http://localhost/upload', { method: 'PUT', body: form });
  const bytes = new Uint8Array(await sample.arrayBuffer());
  let offset = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset === bytes.length) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.slice(offset, offset + 1));
      offset++;
    },
  });
  const request = new Request('http://localhost/api/ideas/' + idea.id + '/cover', {
    method: 'PUT',
    headers: { 'Content-Type': sample.headers.get('Content-Type')! },
    body,
    duplex: 'half',
  } as RequestInit);
  const uploaded = await app.request(request, {}, env);
  assert.equal(uploaded.status, 200, await uploaded.clone().text());
  const extra = new FormData();
  extra.set('file', new Blob([png], { type: 'image/png' }), 'image.png');
  extra.set('extra', 'not permitted');
  // Node's lazy FormData stream throws from Undici when cancelled mid-part; use its wire bytes.
  const malformed = new Request('http://localhost/upload', { method: 'PUT', body: extra });
  const invalid = await app.request(
    '/api/ideas/' + idea.id + '/cover',
    {
      method: 'PUT',
      headers: { 'Content-Type': malformed.headers.get('Content-Type')! },
      body: await malformed.arrayBuffer(),
    },
    env,
  );
  assert.equal(invalid.status, 400, await invalid.text());
  assert.equal(storage.objects.size, 1);
  const head = await app.request('/api/ideas/' + idea.id + '/cover', { method: 'HEAD' }, env);
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
});

test('declared oversized cover bodies and unknown ideas reject before reading image data', async () => {
  const { env, create, storage } = fixture();
  const idea = await create('ideas', { content: 'Safe' });
  const size = await app.request(
    '/api/ideas/' + idea.id + '/cover',
    {
      method: 'PUT',
      headers: {
        'Content-Length': String(51 * 1024 * 1024),
        'Content-Type': 'multipart/form-data; boundary=test',
      },
      body: 'not an image',
    },
    env,
  );
  assert.equal(size.status, 413);
  const unknown = await app.request(
    '/api/ideas/unknown/cover',
    { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: 'invalid data' },
    env,
  );
  assert.equal(unknown.status, 404);
  assert.equal(storage.calls.length, 0);
});

test('Ideas search treats percent and underscore literally and supports long Unicode text', async () => {
  const { request, create } = fixture();
  const phrase = 'catatan panjang tentang kuliah 🎓 dan rencana pribadi untuk minggu depan';
  const wanted = await create('ideas', { content: '100% sure_first — ' + phrase });
  await create('ideas', { content: '100 percent sure first' });
  assert.deepEqual(
    (await request('ideas?q=%25')).body.data.map((row) => row.id),
    [wanted.id],
  );
  assert.deepEqual(
    (await request('ideas?q=_')).body.data.map((row) => row.id),
    [wanted.id],
  );
  assert.deepEqual(
    (await request('ideas?q=' + encodeURIComponent(phrase))).body.data.map((row) => row.id),
    [wanted.id],
  );
});
