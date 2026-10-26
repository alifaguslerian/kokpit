import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { z } from 'zod';
import { bodyLimit } from 'hono/body-limit';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { CollegeRepository } from '../db/repositories/college.repository';
import { MaterialsRepository } from '../db/repositories/materials.repository';
import { MaterialsService, materialResponse } from '../services/materials.service';
import { validateJson, validateParams, validateQuery } from '../utils/validator';
import { MAX_MATERIAL_BYTES } from '../utils/material-file';
import { AppError, ForbiddenError } from '../utils/errors';

const id = z.string().min(1).max(128);
const title = z.string().trim().min(1).max(255);
const url = z
  .url()
  .max(4096)
  .refine((value) => {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password;
  }, 'Use an HTTP or HTTPS URL without embedded credentials.');
const createLink = z.object({ title, externalUrl: url }).strict();
const sameOriginWrite: MiddlewareHandler<WorkerEnv> = async (c, next) => {
  const origin = z.string().max(2048).optional().parse(c.req.header('Origin'));
  if (origin !== undefined && origin !== new URL(c.req.url).origin)
    throw new ForbiddenError('Cross-origin material writes are not allowed.');
  await next();
};
const metadataBodyLimit = bodyLimit({
  maxSize: 32 * 1024,
  onError: () => {
    throw new AppError('BODY_TOO_LARGE', 'Material metadata must be 32 KB or smaller.', 413);
  },
});
const update = z
  .object({ title: title.optional(), externalUrl: url.optional(), weekId: id.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.');
const limit = z.coerce.number().int().min(1).max(100).default(20);
const cursorSchema = z.object({ updatedAt: z.iso.datetime(), id }).strict();
const cursor = z
  .string()
  .max(1024)
  .transform((value, ctx) => {
    try {
      return cursorSchema.parse(JSON.parse(atob(value)));
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid material cursor.' });
      return z.NEVER;
    }
  });
const weekQuery = z
  .object({ limit, offset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0) })
  .strict();
const semesterQuery = z
  .object({ limit, cursor: cursor.optional(), sort: z.literal('updated').optional() })
  .strict();
const service = (c: Context<WorkerEnv>) => {
  const db = createDb(c.env.DB);
  return new MaterialsService(new MaterialsRepository(db), new CollegeRepository(db), c.env.R2);
};

export const materialsRoutes = new Hono<WorkerEnv>();

const uploadQuery = z
  .object({
    filename: z
      .string()
      .min(1)
      .max(255)
      .refine(
        (value) =>
          value.trim().length > 0 &&
          !value.includes('/') &&
          !value.includes('\\') &&
          [...value].every((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127),
        'Invalid filename.',
      ),
    sizeBytes: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    title: title.optional(),
  })
  .strict();
const uploadHeaders = z.object({
  contentType: z.string().max(256),
  contentLength: z.string().max(20).regex(/^\d+$/).optional(),
});
materialsRoutes.post(
  '/weeks/:weekId/materials/upload',
  sameOriginWrite,
  validateParams(z.object({ weekId: id })),
  validateQuery(uploadQuery),
  async (c) => {
    const query = c.get('validatedQuery' as never) as z.infer<typeof uploadQuery>;
    if (query.sizeBytes > MAX_MATERIAL_BYTES)
      throw new AppError('FILE_TOO_LARGE', 'Files must be 50 MB or smaller.', 413);
    const headers = uploadHeaders.parse({
      contentType: c.req.header('Content-Type') ?? '',
      contentLength: c.req.header('Content-Length'),
    });
    if (headers.contentLength !== undefined)
      z.string()
        .regex(/^\d+$/)
        .refine(
          (value) => Number(value) === query.sizeBytes,
          'Content-Length must match sizeBytes.',
        )
        .parse(headers.contentLength);
    return c.json(
      {
        data: await service(c).upload(
          c.req.param('weekId'),
          c.get('userId'),
          query,
          c.req.raw.body,
          headers.contentType,
        ),
      },
      201,
    );
  },
);

materialsRoutes.get(
  '/weeks/:weekId/materials',
  validateParams(z.object({ weekId: id })),
  validateQuery(weekQuery),
  async (c) => {
    const query = c.get('validatedQuery' as never) as z.infer<typeof weekQuery>;
    return c.json({
      data: await service(c).listWeek(
        c.req.param('weekId'),
        c.get('userId'),
        query.limit,
        query.offset,
      ),
    });
  },
);
materialsRoutes.post(
  '/weeks/:weekId/materials',
  sameOriginWrite,
  validateParams(z.object({ weekId: id })),
  metadataBodyLimit,
  validateJson(createLink),
  async (c) =>
    c.json(
      {
        data: await service(c).createLink(
          c.req.param('weekId'),
          c.get('userId'),
          c.get('validatedJson' as never) as z.infer<typeof createLink>,
        ),
      },
      201,
    ),
);
materialsRoutes.get(
  '/semesters/:semesterId/materials',
  validateParams(z.object({ semesterId: id })),
  validateQuery(semesterQuery),
  async (c) => {
    const query = c.get('validatedQuery' as never) as z.infer<typeof semesterQuery>;
    return c.json(
      await service(c).listSemester(
        c.req.param('semesterId'),
        c.get('userId'),
        query.limit,
        query.cursor,
      ),
    );
  },
);
materialsRoutes.get('/materials/:id', validateParams(z.object({ id })), async (c) =>
  c.json({ data: materialResponse(await service(c).get(c.req.param('id'), c.get('userId'))) }),
);
materialsRoutes.patch(
  '/materials/:id',
  sameOriginWrite,
  validateParams(z.object({ id })),
  metadataBodyLimit,
  validateJson(update),
  async (c) =>
    c.json({
      data: await service(c).update(
        c.req.param('id'),
        c.get('userId'),
        c.get('validatedJson' as never) as z.infer<typeof update>,
      ),
    }),
);

export const fileRoutes = new Hono<WorkerEnv>();
materialsRoutes.delete(
  '/materials/:id',
  sameOriginWrite,
  validateParams(z.object({ id })),
  validateQuery(z.object({}).strict()),
  async (c) => {
    await service(c).delete(c.req.param('id'), c.get('userId'));
    return c.json({ success: true });
  },
);
fileRoutes.use('*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store');
  await next();
});
fileRoutes.on(
  ['GET', 'HEAD'],
  '/:id',
  validateParams(z.object({ id })),
  validateQuery(z.object({ download: z.enum(['true', 'false']).default('false') }).strict()),
  async (c) => {
    const query = c.get('validatedQuery' as never) as { download: 'true' | 'false' };
    return service(c).file(
      c.req.param('id'),
      c.get('userId'),
      c.req.raw,
      query.download === 'true',
    );
  },
);
