import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../worker/index';
import type { WorkerEnv } from '../../worker/env';
import { createTestD1 } from '../helpers/mock-d1';
import type { IdeaWithTags } from '../../worker/db/repositories/ideas.repository';

describe('Ideas API & Backend Integration Tests (Milestone 3.1)', () => {
  const ownerId = 'user-owner-1';
  const otherUserId = 'user-other-2';

  function createEnv(userId = ownerId) {
    const mockD1 = createTestD1(userId);
    return {
      env: { DB: mockD1 } as WorkerEnv['Bindings'],
    };
  }

  describe('GET /api/ideas', () => {
    test('returns empty data array initially', async () => {
      const { env } = createEnv();
      const res = await app.request('/api/ideas', {}, env);
      assert.strictEqual(res.status, 200);

      const body = (await res.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(Array.isArray(body.data), true);
      assert.strictEqual(body.data.length, 0);
    });

    test('lists ideas ordered by pinned first, then newest createdAt', async () => {
      const { env } = createEnv();

      // Create unpinned idea 1
      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Idea 1 - Unpinned', isPinned: false }),
        },
        env,
      );

      // Create pinned idea 2
      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Idea 2 Title',
            content: 'Idea 2 - Pinned',
            isPinned: true,
          }),
        },
        env,
      );

      // Create unpinned idea 3
      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Idea 3 - Unpinned', isPinned: false }),
        },
        env,
      );

      const res = await app.request('/api/ideas', {}, env);
      assert.strictEqual(res.status, 200);

      const body = (await res.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(body.data.length, 3);
      // Pinned idea must be first
      assert.strictEqual(body.data[0]!.content, 'Idea 2 - Pinned');
      assert.strictEqual(body.data[0]!.isPinned, true);
      // Next is newest unpinned
      assert.strictEqual(body.data[1]!.content, 'Idea 3 - Unpinned');
      assert.strictEqual(body.data[2]!.content, 'Idea 1 - Unpinned');
    });

    test('filters ideas by search query q in title and content', async () => {
      const { env } = createEnv();

      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Algorithm Optimization',
            content: 'Review quicksort vs mergesort.',
          }),
        },
        env,
      );

      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Grocery Checklist',
            content: 'Buy oat milk and coffee beans.',
          }),
        },
        env,
      );

      // Search by title match
      const titleRes = await app.request('/api/ideas?q=Algorithm', {}, env);
      const titleData = (await titleRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(titleData.data.length, 1);
      assert.strictEqual(titleData.data[0]!.title, 'Algorithm Optimization');

      // Search by content match
      const contentRes = await app.request('/api/ideas?q=coffee', {}, env);
      const contentData = (await contentRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(contentData.data.length, 1);
      assert.strictEqual(contentData.data[0]!.title, 'Grocery Checklist');

      // Search with non-matching query
      const nonMatchRes = await app.request('/api/ideas?q=nonexistent', {}, env);
      const nonMatchData = (await nonMatchRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(nonMatchData.data.length, 0);
    });

    test('filters ideas by tag', async () => {
      const { env } = createEnv();

      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Tagged idea',
            tags: ['College', 'CS180'],
          }),
        },
        env,
      );

      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Other idea',
            tags: ['Personal'],
          }),
        },
        env,
      );

      const tagRes = await app.request('/api/ideas?tag=College', {}, env);
      const tagData = (await tagRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(tagData.data.length, 1);
      assert.strictEqual(tagData.data[0]!.content, 'Tagged idea');
      assert.ok(tagData.data[0]!.tags.includes('College'));

      const unusedTagRes = await app.request('/api/ideas?tag=UnusedTag', {}, env);
      const unusedTagData = (await unusedTagRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(unusedTagData.data.length, 0);
    });

    test('filters ideas by pinned status', async () => {
      const { env } = createEnv();

      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Pinned thought', isPinned: true }),
        },
        env,
      );

      await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Normal thought', isPinned: false }),
        },
        env,
      );

      const pinnedRes = await app.request('/api/ideas?pinned=true', {}, env);
      const pinnedData = (await pinnedRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(pinnedData.data.length, 1);
      assert.strictEqual(pinnedData.data[0]!.content, 'Pinned thought');

      const unpinnedRes = await app.request('/api/ideas?pinned=false', {}, env);
      const unpinnedData = (await unpinnedRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(unpinnedData.data.length, 1);
      assert.strictEqual(unpinnedData.data[0]!.content, 'Normal thought');
    });
  });

  describe('POST /api/ideas', () => {
    test('creates an idea with content, optional title, tags, and returns 201', async () => {
      const { env } = createEnv();

      const res = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Warmth over Cold Glass',
            content:
              'The digital desk should feel less like a clinical monitor and more like an aged walnut bureau.',
            isPinned: true,
            tags: ['Design', 'Philosophy'],
          }),
        },
        env,
      );

      assert.strictEqual(res.status, 201);
      const body = (await res.json()) as { data: IdeaWithTags };
      assert.ok(body.data.id);
      assert.strictEqual(body.data.userId, ownerId);
      assert.strictEqual(body.data.title, 'Warmth over Cold Glass');
      assert.strictEqual(
        body.data.content,
        'The digital desk should feel less like a clinical monitor and more like an aged walnut bureau.',
      );
      assert.strictEqual(body.data.isPinned, true);
      assert.strictEqual(body.data.tags.length, 2);
      assert.ok(body.data.tags.includes('Design'));
      assert.ok(body.data.tags.includes('Philosophy'));
      assert.ok(body.data.createdAt);
      assert.ok(body.data.updatedAt);
    });

    test('creates an idea without title and normalizes title to null', async () => {
      const { env } = createEnv();

      const res = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Spontaneous fleeting thought without any title.',
          }),
        },
        env,
      );

      assert.strictEqual(res.status, 201);
      const body = (await res.json()) as { data: IdeaWithTags };
      assert.strictEqual(body.data.title, null);
      assert.strictEqual(body.data.isPinned, false);
      assert.deepStrictEqual(body.data.tags, []);
    });

    test('rejects request with empty content or whitespace-only content', async () => {
      const { env } = createEnv();

      const res = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Title',
            content: '   ',
          }),
        },
        env,
      );

      assert.strictEqual(res.status, 400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    });

    test('rejects request with title longer than 200 characters', async () => {
      const { env } = createEnv();

      const res = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'A'.repeat(201),
            content: 'Valid content.',
          }),
        },
        env,
      );

      assert.strictEqual(res.status, 400);
      const body = (await res.json()) as { error: { code: string } };
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/ideas/:id', () => {
    test('retrieves an existing idea by ID', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Specific Idea',
            content: 'Content to fetch by ID',
            tags: ['Idea'],
          }),
        },
        env,
      );

      const created = ((await createRes.json()) as { data: IdeaWithTags }).data;

      const getRes = await app.request(`/api/ideas/${created.id}`, {}, env);
      assert.strictEqual(getRes.status, 200);

      const body = (await getRes.json()) as { data: IdeaWithTags };
      assert.strictEqual(body.data.id, created.id);
      assert.strictEqual(body.data.title, 'Specific Idea');
      assert.strictEqual(body.data.content, 'Content to fetch by ID');
      assert.deepStrictEqual(body.data.tags, ['Idea']);
    });

    test('returns 404 for non-existent idea ID', async () => {
      const { env } = createEnv();
      const res = await app.request('/api/ideas/00000000-none-0000-0000-000000000000', {}, env);
      assert.strictEqual(res.status, 404);

      const body = (await res.json()) as { error: { code: string; message: string } };
      assert.strictEqual(body.error.code, 'NOT_FOUND');
    });
  });

  describe('PATCH /api/ideas/:id', () => {
    test('updates idea title, content, isPinned, and tags', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Original Title',
            content: 'Original Content',
            isPinned: false,
            tags: ['OldTag'],
          }),
        },
        env,
      );

      const created = ((await createRes.json()) as { data: IdeaWithTags }).data;

      const patchRes = await app.request(
        `/api/ideas/${created.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Updated Title',
            content: 'Updated Content',
            isPinned: true,
            tags: ['NewTag1', 'NewTag2'],
          }),
        },
        env,
      );

      assert.strictEqual(patchRes.status, 200);
      const patched = ((await patchRes.json()) as { data: IdeaWithTags }).data;
      assert.strictEqual(patched.title, 'Updated Title');
      assert.strictEqual(patched.content, 'Updated Content');
      assert.strictEqual(patched.isPinned, true);
      assert.strictEqual(patched.tags.length, 2);
      assert.ok(patched.tags.includes('NewTag1'));
      assert.ok(patched.tags.includes('NewTag2'));
      assert.ok(!patched.tags.includes('OldTag'));
    });

    test('returns 404 when updating non-existent idea', async () => {
      const { env } = createEnv();

      const res = await app.request(
        '/api/ideas/00000000-none-0000-0000-000000000000',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Title' }),
        },
        env,
      );

      assert.strictEqual(res.status, 404);
    });
  });

  describe('POST /api/ideas/:id/pin', () => {
    test('toggles pin state when no body is provided', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Toggle pin test', isPinned: false }),
        },
        env,
      );

      const created = ((await createRes.json()) as { data: IdeaWithTags }).data;

      // Pin it
      const pinRes1 = await app.request(`/api/ideas/${created.id}/pin`, { method: 'POST' }, env);
      assert.strictEqual(pinRes1.status, 200);
      const pinnedData1 = ((await pinRes1.json()) as { data: IdeaWithTags }).data;
      assert.strictEqual(pinnedData1.isPinned, true);

      // Unpin it
      const pinRes2 = await app.request(`/api/ideas/${created.id}/pin`, { method: 'POST' }, env);
      assert.strictEqual(pinRes2.status, 200);
      const pinnedData2 = ((await pinRes2.json()) as { data: IdeaWithTags }).data;
      assert.strictEqual(pinnedData2.isPinned, false);
    });

    test('sets explicit pin state when body provided', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Explicit pin test', isPinned: false }),
        },
        env,
      );

      const created = ((await createRes.json()) as { data: IdeaWithTags }).data;

      const res = await app.request(
        `/api/ideas/${created.id}/pin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPinned: true }),
        },
        env,
      );

      assert.strictEqual(res.status, 200);
      const data = ((await res.json()) as { data: IdeaWithTags }).data;
      assert.strictEqual(data.isPinned, true);
    });
  });

  describe('DELETE /api/ideas/:id', () => {
    test('deletes idea and prevents subsequent retrieval', async () => {
      const { env } = createEnv();

      const createRes = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'To Delete',
            content: 'Content will be deleted',
            tags: ['DeleteTag'],
          }),
        },
        env,
      );

      const created = ((await createRes.json()) as { data: IdeaWithTags }).data;

      const deleteRes = await app.request(`/api/ideas/${created.id}`, { method: 'DELETE' }, env);
      assert.strictEqual(deleteRes.status, 200);
      const delBody = (await deleteRes.json()) as { success: boolean; id: string };
      assert.strictEqual(delBody.success, true);
      assert.strictEqual(delBody.id, created.id);

      // Subsequent GET must return 404
      const getRes = await app.request(`/api/ideas/${created.id}`, {}, env);
      assert.strictEqual(getRes.status, 404);

      // Subsequent DELETE must return 404
      const delRes2 = await app.request(`/api/ideas/${created.id}`, { method: 'DELETE' }, env);
      assert.strictEqual(delRes2.status, 404);
    });
  });

  describe('User Ownership Isolation (Security)', () => {
    test('prevents User B from accessing, modifying, or deleting User A ideas', async () => {
      // Create shared mock DB with User A as initial owner
      const sharedD1 = createTestD1(ownerId);

      // Insert User B into users table as member initially
      await sharedD1.exec(
        `INSERT INTO users (id, email, display_name, role, created_at, updated_at) VALUES ('${otherUserId}', 'other@example.com', 'Other User', 'member', datetime('now'), datetime('now'))`,
      );

      const sharedEnv = { DB: sharedD1 } as WorkerEnv['Bindings'];

      // User A creates an idea
      const createRes = await app.request(
        '/api/ideas',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'User A Private Idea',
            content: 'Top secret thoughts of User A',
            tags: ['Private'],
          }),
        },
        sharedEnv,
      );

      assert.strictEqual(createRes.status, 201);
      const userAIdea = ((await createRes.json()) as { data: IdeaWithTags }).data;

      // Switch active owner to User B in database
      await sharedD1.exec(
        `UPDATE users SET role = 'member' WHERE id = '${ownerId}'; UPDATE users SET role = 'owner' WHERE id = '${otherUserId}';`,
      );

      // User B lists ideas - User A idea must NOT appear
      const listBRes = await app.request('/api/ideas', {}, sharedEnv);
      assert.strictEqual(listBRes.status, 200);
      const listBData = (await listBRes.json()) as { data: IdeaWithTags[] };
      assert.strictEqual(listBData.data.length, 0);

      // User B attempts to GET User A idea - returns 404
      const getBRes = await app.request(`/api/ideas/${userAIdea.id}`, {}, sharedEnv);
      assert.strictEqual(getBRes.status, 404);

      // User B attempts to PATCH User A idea - returns 404
      const patchBRes = await app.request(
        `/api/ideas/${userAIdea.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Hijacked by User B' }),
        },
        sharedEnv,
      );
      assert.strictEqual(patchBRes.status, 404);

      // User B attempts to DELETE User A idea - returns 404
      const delBRes = await app.request(
        `/api/ideas/${userAIdea.id}`,
        { method: 'DELETE' },
        sharedEnv,
      );
      assert.strictEqual(delBRes.status, 404);

      // Switch active owner back to User A
      await sharedD1.exec(
        `UPDATE users SET role = 'owner' WHERE id = '${ownerId}'; UPDATE users SET role = 'member' WHERE id = '${otherUserId}';`,
      );

      // User A can still retrieve their idea unmutated
      const verifyRes = await app.request(`/api/ideas/${userAIdea.id}`, {}, sharedEnv);
      assert.strictEqual(verifyRes.status, 200);
      const verifiedData = (await verifyRes.json()) as { data: IdeaWithTags };
      assert.strictEqual(verifiedData.data.content, 'Top secret thoughts of User A');
    });
  });
});
