import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { z } from 'zod';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { CollegeRepository } from '../db/repositories/college.repository';
import { ScheduleRepository } from '../db/repositories/schedule.repository';
import { ScheduleService } from '../services/schedule.service';
import { AppError, ForbiddenError } from '../utils/errors';
import { validateJson, validateParams, validateQuery } from '../utils/validator';

const id = z.string().min(1).max(128);
const fields = {
  weekday: z.number().int().min(1).max(7),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  room: z.string().trim().max(120).nullable().optional(),
};
const create = z.object(fields).strict();
const update = z
  .object({ ...create.partial().shape, courseId: id.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.');
const sameOrigin: MiddlewareHandler<WorkerEnv> = async (c, next) => {
  const origin = z.string().max(2048).optional().parse(c.req.header('Origin'));
  if (origin !== undefined && origin !== new URL(c.req.url).origin)
    throw new ForbiddenError('Cross-origin schedule writes are not allowed.');
  await next();
};
const metadataLimit = bodyLimit({
  maxSize: 32 * 1024,
  onError: () => {
    throw new AppError('BODY_TOO_LARGE', 'Class metadata must be 32 KB or smaller.', 413);
  },
});
const service = (c: Context<WorkerEnv>) => {
  const db = createDb(c.env.DB);
  return new ScheduleService(new ScheduleRepository(db), new CollegeRepository(db));
};
const empty = validateQuery(z.object({}).strict());
export const scheduleRoutes = new Hono<WorkerEnv>();
scheduleRoutes.get(
  '/semesters/:semesterId/schedule',
  validateParams(z.object({ semesterId: id })),
  empty,
  async (c) => c.json(await service(c).list(c.req.param('semesterId'), c.get('userId'))),
);
scheduleRoutes.post(
  '/courses/:courseId/schedule',
  sameOrigin,
  validateParams(z.object({ courseId: id })),
  empty,
  metadataLimit,
  validateJson(create),
  async (c) =>
    c.json(
      {
        data: await service(c).create(
          c.req.param('courseId'),
          c.get('userId'),
          c.get('validatedJson' as never) as z.infer<typeof create>,
        ),
      },
      201,
    ),
);
scheduleRoutes.patch(
  '/schedule/:entryId',
  sameOrigin,
  validateParams(z.object({ entryId: id })),
  empty,
  metadataLimit,
  validateJson(update),
  async (c) =>
    c.json({
      data: await service(c).update(
        c.req.param('entryId'),
        c.get('userId'),
        c.get('validatedJson' as never) as z.infer<typeof update>,
      ),
    }),
);
scheduleRoutes.delete(
  '/schedule/:entryId',
  sameOrigin,
  validateParams(z.object({ entryId: id })),
  empty,
  async (c) => {
    await service(c).delete(c.req.param('entryId'), c.get('userId'));
    return c.json({ success: true });
  },
);
