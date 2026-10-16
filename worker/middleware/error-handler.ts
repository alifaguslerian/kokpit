import type { ErrorHandler, NotFoundHandler } from 'hono';
import { ZodError } from 'zod';
import type { WorkerEnv } from '../env';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorHandler<WorkerEnv> = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      err.status as never,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed for request data.',
          details: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      },
      400,
    );
  }

  console.error('[Unhandled Server Error]', err);
  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    },
    500,
  );
};

export const notFoundHandler: NotFoundHandler<WorkerEnv> = (c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    },
    404,
  );
};
