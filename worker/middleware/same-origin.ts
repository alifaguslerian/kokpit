import type { MiddlewareHandler } from 'hono';
import { z } from 'zod';
import type { WorkerEnv } from '../env';
import { ForbiddenError } from '../utils/errors';

export const sameOriginWrite: MiddlewareHandler<WorkerEnv> = async (c, next) => {
  const origin = z.string().max(2048).optional().parse(c.req.header('Origin'));
  if (origin !== undefined && origin !== new URL(c.req.url).origin)
    throw new ForbiddenError('Cross-origin writes are not allowed.');
  await next();
};
