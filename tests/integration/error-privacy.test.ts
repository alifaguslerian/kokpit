import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import type { WorkerEnv } from '../../worker/env';
import { errorHandler } from '../../worker/middleware/error-handler';

test('unexpected errors log request metadata without private SQL parameters or query values', async () => {
  const app = new Hono<WorkerEnv>();
  app.onError(errorHandler);
  app.get('/api/probe', () => {
    throw new Error('SQL failed: private idea content, secret-token');
  });
  const logged: unknown[][] = [];
  const previous = console.error;
  console.error = (...args: unknown[]) => logged.push(args);
  try {
    const response = await app.request('/api/probe?q=private-search');
    assert.equal(response.status, 500);
    const output = logged.flat().map(String).join(' ');
    assert.doesNotMatch(output, /private idea|secret-token|private-search|SQL failed/);
    assert.match(JSON.stringify(logged), /INTERNAL_SERVER_ERROR/);
    assert.match(JSON.stringify(logged), /GET/);
  } finally {
    console.error = previous;
  }
});
