import type { MiddlewareHandler } from 'hono';
import { z, type ZodSchema } from 'zod';
import { AppError } from './errors';

export function validateJson<T>(schema: ZodSchema<T>): MiddlewareHandler {
  return async (c, next) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw new AppError('BAD_REQUEST', 'Malformed JSON in request body.', 400);
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      throw result.error;
    }

    c.set('validatedJson' as never, result.data as never);
    await next();
  };
}

export function validateOptionalJson<T>(schema: ZodSchema<T>): MiddlewareHandler {
  return async (c, next) => {
    const text = await c.req.text();
    let body: unknown = {};
    if (text !== '') {
      try {
        body = JSON.parse(text);
      } catch {
        throw new AppError('BAD_REQUEST', 'Malformed JSON in request body.', 400);
      }
    }
    const result = schema.safeParse(body);
    if (!result.success) throw result.error;
    c.set('validatedJson' as never, result.data as never);
    await next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>): MiddlewareHandler {
  return async (c, next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);
    if (!result.success) {
      throw result.error;
    }

    c.set('validatedParams' as never, result.data as never);
    await next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): MiddlewareHandler {
  return async (c, next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);
    if (!result.success) {
      throw result.error;
    }

    c.set('validatedQuery' as never, result.data as never);
    await next();
  };
}

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required.'),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
