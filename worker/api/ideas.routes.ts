import { Hono } from 'hono';
import { z } from 'zod';
import { bodyLimit } from 'hono/body-limit';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { IdeasRepository } from '../db/repositories/ideas.repository';
import { IdeasService } from '../services/ideas.service';
import { IdeaCollectionsRepository } from '../db/repositories/idea-collections.repository';
import { IdeaCoversRepository } from '../db/repositories/idea-covers.repository';
import { IdeaCoversService } from '../services/idea-covers.service';
import { sameOriginWrite } from '../middleware/same-origin';
import { AppError } from '../utils/errors';
import { MAX_IDEA_COVER_BYTES } from '../utils/idea-cover';
import { ideaCoverUpload } from '../utils/idea-cover-upload';
import {
  validateJson,
  validateOptionalJson,
  validateParams,
  validateQuery,
} from '../utils/validator';

const idParamSchema = z.object({ id: z.string().min(1).max(128) });

export const createIdeaSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, 'Content is required.')
      .max(10000, 'Content cannot exceed 10000 characters.'),
    title: z.string().trim().max(200, 'Title cannot exceed 200 characters.').optional().nullable(),
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    collectionId: z.string().min(1).max(128).nullable().optional(),
    tags: z
      .array(z.string().trim().min(1, 'Tag cannot be empty.').max(50, 'Tag too long.'))
      .max(20, 'Cannot exceed 20 tags.')
      .optional(),
  })
  .strict();

export const updateIdeaSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, 'Content cannot be empty.')
      .max(10000, 'Content cannot exceed 10000 characters.')
      .optional(),
    title: z.string().trim().max(200, 'Title cannot exceed 200 characters.').optional().nullable(),
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    collectionId: z.string().min(1).max(128).nullable().optional(),
    tags: z
      .array(z.string().trim().min(1, 'Tag cannot be empty.').max(50, 'Tag too long.'))
      .max(20, 'Cannot exceed 20 tags.')
      .optional(),
  })
  .strict();

export const listIdeasQuerySchema = z.object({
  q: z.string().trim().max(10000).optional(),
  tag: z.string().trim().max(50).optional(),
  favorite: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  collectionId: z.string().min(1).max(128).optional(),
  sort: z.enum(['updated']).optional(),
  pinned: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const pinIdeaSchema = z.object({
  isPinned: z.boolean().optional(),
});

export const ideasRoutes = new Hono<WorkerEnv>();
const metadataLimit = bodyLimit({
  maxSize: 64 * 1024,
  onError: () => {
    throw new AppError('BODY_TOO_LARGE', 'Idea metadata is too large.', 413);
  },
});

function getIdeasService(c: { env: WorkerEnv['Bindings'] }): IdeasService {
  const db = createDb(c.env.DB);
  const repository = new IdeasRepository(db);
  return new IdeasService(
    repository,
    new IdeaCollectionsRepository(db),
    new IdeaCoversService(new IdeaCoversRepository(db), c.env.R2),
  );
}
const coverService = (env: WorkerEnv['Bindings']) =>
  new IdeaCoversService(new IdeaCoversRepository(createDb(env.DB)), env.R2);
const coverQuery = z.object({ v: z.string().min(1).max(128).optional() }).strict();
ideasRoutes.get('/:id/cover', validateParams(idParamSchema), validateQuery(coverQuery), async (c) =>
  coverService(c.env).read(c.req.param('id'), c.get('userId'), c.req.method === 'HEAD'),
);
ideasRoutes.put(
  '/:id/cover',
  sameOriginWrite,
  validateParams(idParamSchema),
  validateQuery(z.object({}).strict()),
  async (c) => {
    await getIdeasService(c).getIdeaById(c.req.param('id'), c.get('userId'));
    const length = c.req.header('Content-Length');
    if (length !== undefined) {
      const declared = z
        .string()
        .max(20)
        .regex(/^\d+$/)
        .transform(Number)
        .refine(Number.isSafeInteger)
        .parse(length);
      if (declared > MAX_IDEA_COVER_BYTES + 64 * 1024)
        throw new AppError('FILE_TOO_LARGE', 'Files must be 50 MB or smaller.', 413);
    }
    const contentType = z
      .string()
      .max(256)
      .parse(c.req.header('Content-Type') ?? '');
    const input = await ideaCoverUpload(c.req.raw.body, contentType);
    await coverService(c.env).upload(c.req.param('id'), c.get('userId'), input);
    return c.json({
      data: await getIdeasService(c).getIdeaById(c.req.param('id'), c.get('userId')),
    });
  },
);
ideasRoutes.delete(
  '/:id/cover',
  sameOriginWrite,
  validateParams(idParamSchema),
  validateQuery(z.object({}).strict()),
  async (c) => {
    await coverService(c.env).remove(c.req.param('id'), c.get('userId'));
    return c.json({
      data: await getIdeasService(c).getIdeaById(c.req.param('id'), c.get('userId')),
    });
  },
);

// GET /api/ideas - List ideas with optional query search, tag filter, and pagination
ideasRoutes.get('/', validateQuery(listIdeasQuerySchema), async (c) => {
  const query = c.get('validatedQuery' as never) as z.infer<typeof listIdeasQuerySchema>;
  const userId = c.get('userId');
  const service = getIdeasService(c);

  const data = await service.listIdeas(userId, query);
  return c.json({ data });
});

// GET /api/ideas/:id - Get a single idea by ID
ideasRoutes.get('/:id', validateParams(idParamSchema), async (c) => {
  const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
  const userId = c.get('userId');
  const service = getIdeasService(c);

  const data = await service.getIdeaById(id, userId);
  return c.json({ data });
});

// POST /api/ideas - Create a new idea
ideasRoutes.post('/', sameOriginWrite, metadataLimit, validateJson(createIdeaSchema), async (c) => {
  const body = c.get('validatedJson' as never) as z.infer<typeof createIdeaSchema>;
  const userId = c.get('userId');
  const service = getIdeasService(c);

  const data = await service.createIdea(userId, body);
  return c.json({ data }, 201);
});

// PATCH /api/ideas/:id - Update an existing idea
ideasRoutes.patch(
  '/:id',
  sameOriginWrite,
  metadataLimit,
  validateParams(idParamSchema),
  validateJson(updateIdeaSchema),
  async (c) => {
    const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
    const body = c.get('validatedJson' as never) as z.infer<typeof updateIdeaSchema>;
    const userId = c.get('userId');
    const service = getIdeasService(c);

    const data = await service.updateIdea(id, userId, body);
    return c.json({ data });
  },
);

// DELETE /api/ideas/:id - Delete an idea
ideasRoutes.delete('/:id', sameOriginWrite, validateParams(idParamSchema), async (c) => {
  const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
  const userId = c.get('userId');
  const service = getIdeasService(c);

  await service.deleteIdea(id, userId);
  return c.json({ success: true, id });
});

// POST /api/ideas/:id/pin - Toggle or set pin status
ideasRoutes.post(
  '/:id/pin',
  sameOriginWrite,
  metadataLimit,
  validateParams(idParamSchema),
  validateOptionalJson(pinIdeaSchema),
  async (c) => {
    const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
    const userId = c.get('userId');
    const service = getIdeasService(c);

    const body = c.get('validatedJson' as never) as z.infer<typeof pinIdeaSchema>;
    const data = await service.togglePin(id, userId, body.isPinned);
    return c.json({ data });
  },
);
