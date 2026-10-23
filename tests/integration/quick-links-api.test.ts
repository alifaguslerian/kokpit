import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import type { WorkerEnv } from '../../worker/env';
import { createTestD1 } from '../helpers/mock-d1';
import type { QuickLinkRecord } from '../../worker/db/repositories/quick-links.repository';

describe('Quick Links API & Backend Integration Tests (Milestone 3.3)', () => {
  const ownerId = 'user-owner-1';
  const otherUserId = 'user-other-2';

  function createEnv(userId = ownerId) {
    const mockD1 = createTestD1(userId);
    return {
      env: { DB: mockD1 } as WorkerEnv['Bindings'],
    };
  }

  describe('GET /api/quick-links', () => {
    test('returns empty data array initially', async () => {
      const { env } = createEnv();
      const res = await app.request('/api/quick-links', {}, env);
      assert.strictEqual(res.status, 200);

      const body = (await res.json()) as { data: QuickLinkRecord[] };
      assert.strictEqual(Array.isArray(body.data), true);
      assert.strictEqual(body.data.length, 0);
    });

    test('lists quick links ordered by position ASC', async () => {
      const { env } = createEnv();

      // Create link 1
      await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'First Link', url: 'https://first.com', position: 1 }),
        },
        env,
      );

      // Create link 0 (lower position)
      await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Zero Link', url: 'https://zero.com', position: 0 }),
        },
        env,
      );

      const res = await app.request('/api/quick-links', {}, env);
      assert.strictEqual(res.status, 200);

      const body = (await res.json()) as { data: QuickLinkRecord[] };
      assert.strictEqual(body.data.length, 2);
      assert.strictEqual(body.data[0]!.name, 'Zero Link');
      assert.strictEqual(body.data[1]!.name, 'First Link');
    });

    test('filters quick links by group and favorite', async () => {
      const { env } = createEnv();

      await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Work Notion',
            url: 'https://notion.so',
            groupName: 'Work',
            isFavorite: true,
          }),
        },
        env,
      );

      await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Study Docs',
            url: 'https://docs.google.com',
            groupName: 'Study',
            isFavorite: false,
          }),
        },
        env,
      );

      // Filter by group Work
      const workRes = await app.request('/api/quick-links?group=Work', {}, env);
      assert.strictEqual(workRes.status, 200);
      const workData = (await workRes.json()) as { data: QuickLinkRecord[] };
      assert.strictEqual(workData.data.length, 1);
      assert.strictEqual(workData.data[0]!.name, 'Work Notion');

      // Filter by favorite true
      const favRes = await app.request('/api/quick-links?favorite=true', {}, env);
      assert.strictEqual(favRes.status, 200);
      const favData = (await favRes.json()) as { data: QuickLinkRecord[] };
      assert.strictEqual(favData.data.length, 1);
      assert.strictEqual(favData.data[0]!.name, 'Work Notion');
    });
  });

  describe('POST /api/quick-links', () => {
    test('creates a quick link and auto-detects platform icon', async () => {
      const { env } = createEnv();

      const res = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'GitHub',
            url: 'https://github.com/my-profile',
            groupName: 'Code',
          }),
        },
        env,
      );

      assert.strictEqual(res.status, 201);
      const body = (await res.json()) as { data: QuickLinkRecord };
      assert.ok(body.data.id);
      assert.strictEqual(body.data.name, 'GitHub');
      assert.strictEqual(body.data.url, 'https://github.com/my-profile');
      assert.strictEqual(body.data.iconType, 'platform');
      assert.strictEqual(body.data.iconValue, 'github');
      assert.strictEqual(body.data.groupName, 'Code');
      assert.strictEqual(body.data.position, 0);
      assert.strictEqual(body.data.isFavorite, false);
    });

    test('rejects creation with empty name or invalid URL', async () => {
      const { env } = createEnv();

      // Empty name
      const res1 = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '   ', url: 'https://example.com' }),
        },
        env,
      );
      assert.strictEqual(res1.status, 400);

      // Invalid URL
      const res2 = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Valid Name', url: 'javascript:alert(1)' }),
        },
        env,
      );
      assert.strictEqual(res2.status, 400);
    });
  });

  describe('GET /api/quick-links/:id', () => {
    test('retrieves an existing quick link by ID', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Portal', url: 'https://portal.com' }),
        },
        env,
      );
      const created = ((await createRes.json()) as { data: QuickLinkRecord }).data;

      const getRes = await app.request(`/api/quick-links/${created.id}`, {}, env);
      assert.strictEqual(getRes.status, 200);
      const body = (await getRes.json()) as { data: QuickLinkRecord };
      assert.strictEqual(body.data.id, created.id);
      assert.strictEqual(body.data.name, 'Portal');
    });

    test('returns 404 for non-existent ID', async () => {
      const { env } = createEnv();
      const res = await app.request(
        '/api/quick-links/00000000-0000-0000-0000-000000000000',
        {},
        env,
      );
      assert.strictEqual(res.status, 404);
    });
  });

  describe('PATCH /api/quick-links/:id', () => {
    test('updates quick link fields', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Old Name', url: 'https://old.com' }),
        },
        env,
      );
      const created = ((await createRes.json()) as { data: QuickLinkRecord }).data;

      const patchRes = await app.request(
        `/api/quick-links/${created.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'New Name',
            url: 'https://new.com',
            groupName: 'Updated Group',
            isFavorite: true,
          }),
        },
        env,
      );

      assert.strictEqual(patchRes.status, 200);
      const body = (await patchRes.json()) as { data: QuickLinkRecord };
      assert.strictEqual(body.data.name, 'New Name');
      assert.strictEqual(body.data.url, 'https://new.com/');
      assert.strictEqual(body.data.groupName, 'Updated Group');
      assert.strictEqual(body.data.isFavorite, true);
    });
  });

  describe('POST /api/quick-links/reorder', () => {
    test('reorders quick links based on provided IDs array', async () => {
      const { env } = createEnv();

      const resA = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'A', url: 'https://a.com' }),
        },
        env,
      );
      const linkA = ((await resA.json()) as { data: QuickLinkRecord }).data;

      const resB = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'B', url: 'https://b.com' }),
        },
        env,
      );
      const linkB = ((await resB.json()) as { data: QuickLinkRecord }).data;

      // Reorder to [B, A]
      const reorderRes = await app.request(
        '/api/quick-links/reorder',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [linkB.id, linkA.id] }),
        },
        env,
      );
      assert.strictEqual(reorderRes.status, 200);

      // Verify list order
      const listRes = await app.request('/api/quick-links', {}, env);
      const listBody = (await listRes.json()) as { data: QuickLinkRecord[] };
      assert.strictEqual(listBody.data[0]!.id, linkB.id);
      assert.strictEqual(listBody.data[1]!.id, linkA.id);
    });
  });

  describe('POST /api/quick-links/:id/favorite', () => {
    test('toggles favorite status', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Fav Test', url: 'https://fav.com', isFavorite: false }),
        },
        env,
      );
      const created = ((await createRes.json()) as { data: QuickLinkRecord }).data;

      // Toggle to true
      const favRes1 = await app.request(
        `/api/quick-links/${created.id}/favorite`,
        { method: 'POST' },
        env,
      );
      assert.strictEqual(favRes1.status, 200);
      const favData1 = ((await favRes1.json()) as { data: QuickLinkRecord }).data;
      assert.strictEqual(favData1.isFavorite, true);

      // Toggle to false
      const favRes2 = await app.request(
        `/api/quick-links/${created.id}/favorite`,
        { method: 'POST' },
        env,
      );
      assert.strictEqual(favRes2.status, 200);
      const favData2 = ((await favRes2.json()) as { data: QuickLinkRecord }).data;
      assert.strictEqual(favData2.isFavorite, false);
    });
  });

  describe('DELETE /api/quick-links/:id', () => {
    test('deletes quick link and returns 404 on subsequent get', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'To Delete', url: 'https://delete.com' }),
        },
        env,
      );
      const created = ((await createRes.json()) as { data: QuickLinkRecord }).data;

      const delRes = await app.request(`/api/quick-links/${created.id}`, { method: 'DELETE' }, env);
      assert.strictEqual(delRes.status, 200);

      const getRes = await app.request(`/api/quick-links/${created.id}`, {}, env);
      assert.strictEqual(getRes.status, 404);
    });
  });

  describe('User Ownership Isolation (Security)', () => {
    test('prevents User B from accessing, modifying, or deleting User A quick links', async () => {
      const sharedD1 = createTestD1(ownerId);
      await sharedD1.exec(
        `INSERT INTO users (id, email, display_name, role, created_at, updated_at) VALUES ('${otherUserId}', 'other@example.com', 'Other User', 'member', datetime('now'), datetime('now'))`,
      );

      const sharedEnv = { DB: sharedD1 } as WorkerEnv['Bindings'];

      // User A creates a quick link
      const createRes = await app.request(
        '/api/quick-links',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'User A Secret Link', url: 'https://secret.com' }),
        },
        sharedEnv,
      );
      assert.strictEqual(createRes.status, 201);
      const linkA = ((await createRes.json()) as { data: QuickLinkRecord }).data;

      // Switch active owner to User B
      await sharedD1.exec(
        `UPDATE users SET role = 'member' WHERE id = '${ownerId}'; UPDATE users SET role = 'owner' WHERE id = '${otherUserId}';`,
      );

      // User B lists links - User A link must NOT appear
      const listBRes = await app.request('/api/quick-links', {}, sharedEnv);
      assert.strictEqual(listBRes.status, 200);
      const listBData = (await listBRes.json()) as { data: QuickLinkRecord[] };
      assert.strictEqual(listBData.data.length, 0);

      // User B attempts to GET User A link - 404
      const getBRes = await app.request(`/api/quick-links/${linkA.id}`, {}, sharedEnv);
      assert.strictEqual(getBRes.status, 404);

      // User B attempts to PATCH User A link - 404
      const patchBRes = await app.request(
        `/api/quick-links/${linkA.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Hijacked by B' }),
        },
        sharedEnv,
      );
      assert.strictEqual(patchBRes.status, 404);

      // User B attempts to DELETE User A link - 404
      const delBRes = await app.request(
        `/api/quick-links/${linkA.id}`,
        { method: 'DELETE' },
        sharedEnv,
      );
      assert.strictEqual(delBRes.status, 404);
    });
  });
});
