import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { z } from 'zod';
import app from '../../worker/index';
import type { WorkerEnv } from '../../worker/env';
import { DEFAULT_OWNER_ID } from '../../worker/db/seed';
import { AppError, BadRequestError, NotFoundError } from '../../worker/utils/errors';
import { errorHandler, notFoundHandler } from '../../worker/middleware/error-handler';
import { ownerContext } from '../../worker/middleware/owner-context';
import { validateJson, validateParams, validateQuery } from '../../worker/utils/validator';
import { ApiClientError, apiFetch } from '../../src/lib/api-client';
import * as schema from '../../worker/db/schema';

describe('Backend Foundation & API Safety Integration Tests', () => {
  describe('System Health Endpoint', () => {
    test('GET /api/system/health returns 200 with status: ok', async () => {
      const response = await app.request('/api/system/health');
      assert.strictEqual(response.status, 200);

      const data = (await response.json()) as { status: string };
      assert.strictEqual(data.status, 'ok');
    });
  });

  describe('Global Error & 404 Handlers', () => {
    test('unmatched route returns structured 404 response', async () => {
      const response = await app.request('/api/non-existent-route');
      assert.strictEqual(response.status, 404);

      const body = (await response.json()) as { error: { code: string; message: string } };
      assert.strictEqual(body.error.code, 'NOT_FOUND');
      assert.strictEqual(typeof body.error.message, 'string');
    });

    test('custom AppError returns appropriate HTTP status and payload', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);

      testApp.get('/test-bad-request', () => {
        throw new BadRequestError('Invalid query parameters', { field: 'filter' });
      });

      testApp.get('/test-not-found', () => {
        throw new NotFoundError('Custom resource missing');
      });

      const badReqRes = await testApp.request('/test-bad-request');
      assert.strictEqual(badReqRes.status, 400);
      const badReqBody = (await badReqRes.json()) as {
        error: { code: string; message: string; details: unknown };
      };
      assert.strictEqual(badReqBody.error.code, 'BAD_REQUEST');
      assert.strictEqual(badReqBody.error.message, 'Invalid query parameters');
      assert.deepStrictEqual(badReqBody.error.details, { field: 'filter' });

      const notFoundRes = await testApp.request('/test-not-found');
      assert.strictEqual(notFoundRes.status, 404);
      const notFoundBody = (await notFoundRes.json()) as {
        error: { code: string; message: string };
      };
      assert.strictEqual(notFoundBody.error.code, 'NOT_FOUND');
      assert.strictEqual(notFoundBody.error.message, 'Custom resource missing');
    });

    test('notFoundHandler produces standardized 404 payload', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.notFound(notFoundHandler);

      const response = await testApp.request('/custom-404');
      assert.strictEqual(response.status, 404);
      const body = (await response.json()) as { error: { code: string; message: string } };
      assert.strictEqual(body.error.code, 'NOT_FOUND');
    });

    test('AppError creates typed error instance with code, message, status, and details', () => {
      const error = new AppError('TEST_ERROR', 'Test message', 418, { foo: 'bar' });
      assert.strictEqual(error.code, 'TEST_ERROR');
      assert.strictEqual(error.message, 'Test message');
      assert.strictEqual(error.status, 418);
      assert.deepStrictEqual(error.details, { foo: 'bar' });
    });

    test('unexpected runtime error returns 500 without leaking stack traces or SQL', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);

      testApp.get('/test-crash', () => {
        throw new Error('Database connection failed: SQLITE_CORRUPT sensitive internal details');
      });

      const originalConsoleError = console.error;
      console.error = () => {};
      try {
        const response = await testApp.request('/test-crash');
        assert.strictEqual(response.status, 500);

        const body = (await response.json()) as { error: { code: string; message: string } };
        assert.strictEqual(body.error.code, 'INTERNAL_SERVER_ERROR');
        assert.strictEqual(body.error.message, 'An unexpected internal error occurred.');
        assert.strictEqual((body as Record<string, unknown>).stack, undefined);
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe('Owner Context Middleware', () => {
    test('resolves to default owner ID when D1 binding is absent', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.use('/test-owner/*', ownerContext);
      testApp.get('/test-owner/me', (c) => {
        return c.json({ userId: c.var.userId });
      });

      const response = await testApp.request('/test-owner/me');
      assert.strictEqual(response.status, 200);

      const body = (await response.json()) as { userId: string };
      assert.strictEqual(body.userId, DEFAULT_OWNER_ID);
    });

    test('resolves owner from D1 database when binding is present', async () => {
      const customOwnerId = 'custom-owner-uuid-1234';
      const mockD1 = {
        prepare: () => {
          const statement = {
            bind: () => statement,
            all: async () => ({
              results: [{ id: customOwnerId }],
              success: true,
            }),
            first: async () => ({ id: customOwnerId }),
            run: async () => ({ success: true }),
            raw: async () => [[customOwnerId]],
          };
          return statement;
        },
      } as unknown as D1Database;

      const testApp = new Hono<WorkerEnv>();
      testApp.use('/test-owner/*', ownerContext);
      testApp.get('/test-owner/me', (c) => {
        return c.json({ userId: c.var.userId });
      });

      const response = await testApp.request('/test-owner/me', {}, {
        DB: mockD1,
      } as unknown as WorkerEnv['Bindings']);
      assert.strictEqual(response.status, 200);

      const body = (await response.json()) as { userId: string };
      assert.strictEqual(body.userId, customOwnerId);
    });
  });

  describe('Zod Validation Middleware', () => {
    const payloadSchema = z.object({
      title: z.string().min(1, 'Title is required.'),
      count: z.number().int().positive('Count must be a positive integer.'),
    });

    test('validates valid JSON request and passes data to handler', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);
      testApp.post('/validate-test', validateJson(payloadSchema), (c) => {
        const body = c.get('validatedJson' as never) as z.infer<typeof payloadSchema>;
        return c.json({ received: body });
      });

      const response = await testApp.request('/validate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Read Chapter 4', count: 5 }),
      });

      assert.strictEqual(response.status, 200);
      const data = (await response.json()) as {
        received: { title: string; count: number };
      };
      assert.strictEqual(data.received.title, 'Read Chapter 4');
      assert.strictEqual(data.received.count, 5);
    });

    test('rejects invalid JSON request with structured 400 validation error', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);
      testApp.post('/validate-test', validateJson(payloadSchema), (c) => {
        return c.json({ status: 'ok' });
      });

      const response = await testApp.request('/validate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', count: -1 }),
      });

      assert.strictEqual(response.status, 400);
      const data = (await response.json()) as {
        error: { code: string; message: string; details: Array<{ path: string; message: string }> };
      };
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
      assert.strictEqual(Array.isArray(data.error.details), true);
      assert.strictEqual(data.error.details.length, 2);
    });

    test('rejects malformed JSON body with 400 Bad Request', async () => {
      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);
      testApp.post('/validate-test', validateJson(payloadSchema), (c) => c.json({ status: 'ok' }));

      const response = await testApp.request('/validate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ malformed json ',
      });

      assert.strictEqual(response.status, 400);
      const data = (await response.json()) as { error: { code: string; message: string } };
      assert.strictEqual(data.error.code, 'BAD_REQUEST');
      assert.strictEqual(data.error.message, 'Malformed JSON in request body.');
    });

    test('validates URL parameters using validateParams', async () => {
      const paramSchema = z.object({
        resourceId: z.string().min(3),
      });

      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);
      testApp.get('/resources/:resourceId', validateParams(paramSchema), (c) => {
        const params = c.get('validatedParams' as never) as z.infer<typeof paramSchema>;
        return c.json({ id: params.resourceId });
      });

      const validRes = await testApp.request('/resources/item-99');
      assert.strictEqual(validRes.status, 200);
      const validData = (await validRes.json()) as { id: string };
      assert.strictEqual(validData.id, 'item-99');

      const invalidRes = await testApp.request('/resources/no');
      assert.strictEqual(invalidRes.status, 400);
    });

    test('validates query parameters using validateQuery', async () => {
      const querySchema = z.object({
        limit: z.coerce.number().int().min(1).max(50),
      });

      const testApp = new Hono<WorkerEnv>();
      testApp.onError(errorHandler);
      testApp.get('/search', validateQuery(querySchema), (c) => {
        const query = c.get('validatedQuery' as never) as z.infer<typeof querySchema>;
        return c.json({ limit: query.limit });
      });

      const validRes = await testApp.request('/search?limit=25');
      assert.strictEqual(validRes.status, 200);
      const validData = (await validRes.json()) as { limit: number };
      assert.strictEqual(validData.limit, 25);

      const invalidRes = await testApp.request('/search?limit=999');
      assert.strictEqual(invalidRes.status, 400);
    });
  });

  describe('Frontend API Client', () => {
    test('apiFetch parses successful JSON response', async () => {
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(JSON.stringify({ status: 'online' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });

        const result = await apiFetch<{ status: string }>('/api/test');
        assert.strictEqual(result.status, 'online');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    test('apiFetch transforms API error responses into ApiClientError', async () => {
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid title format.',
                details: [{ path: 'title', message: 'Too short' }],
              },
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          );

        await assert.rejects(
          async () => {
            await apiFetch('/api/test');
          },
          (err: unknown) => {
            assert.ok(err instanceof ApiClientError);
            assert.strictEqual(err.code, 'VALIDATION_ERROR');
            assert.strictEqual(err.message, 'Invalid title format.');
            assert.strictEqual(err.status, 400);
            return true;
          },
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('D1 Schema Definition Completeness', () => {
    test('exports the baseline tables and approved College schedule and Ideas collection tables', () => {
      const expectedTables = [
        'users',
        'userSettings',
        'ideas',
        'ideaCollections',
        'ideaTags',
        'ideaTagLinks',
        'quickLinks',
        'semesters',
        'courses',
        'courseScheduleEntries',
        'weeks',
        'materials',
        'tracks',
        'playlists',
        'playlistTracks',
        'newsSources',
        'newsArticles',
        'quotes',
        'appState',
      ];

      for (const table of expectedTables) {
        assert.ok(table in schema, `Expected table '${table}' to be defined in worker/db/schema`);
      }
    });
  });
});
