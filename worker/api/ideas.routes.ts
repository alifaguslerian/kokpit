import { Hono } from 'hono';
import { z } from 'zod';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { IdeasRepository } from '../db/repositories/ideas.repository';
import { IdeasService } from '../services/ideas.service';
import {
  validateJson,
  validateOptionalJson,
  validateParams,
  validateQuery,
  idParamSchema,
} from '../utils/validator';

export const createIdeaSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Content is required.')
    .max(10000, 'Content cannot exceed 10000 characters.'),
  title: z.string().trim().max(200, 'Title cannot exceed 200 characters.').optional().nullable(),
  isPinned: z.boolean().optional(),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty.').max(50, 'Tag too long.'))
    .max(20, 'Cannot exceed 20 tags.')
    .optional(),
});

export const updateIdeaSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Content cannot be empty.')
    .max(10000, 'Content cannot exceed 10000 characters.')
    .optional(),
  title: z.string().trim().max(200, 'Title cannot exceed 200 characters.').optional().nullable(),
  isPinned: z.boolean().optional(),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty.').max(50, 'Tag too long.'))
    .max(20, 'Cannot exceed 20 tags.')
    .optional(),
});

export const listIdeasQuerySchema = z.object({
  q: z.string().trim().optional(),
  tag: z.string().trim().optional(),
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

function getIdeasService(c: { env: WorkerEnv['Bindings'] }): IdeasService {
  const db = createDb(c.env.DB);
  const repository = new IdeasRepository(db);
  return new IdeasService(repository);
}

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
ideasRoutes.post('/', validateJson(createIdeaSchema), async (c) => {
  const body = c.get('validatedJson' as never) as z.infer<typeof createIdeaSchema>;
  const userId = c.get('userId');
  const service = getIdeasService(c);

  const data = await service.createIdea(userId, body);
  return c.json({ data }, 201);
});

// PATCH /api/ideas/:id - Update an existing idea
ideasRoutes.patch(
  '/:id',
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
ideasRoutes.delete('/:id', validateParams(idParamSchema), async (c) => {
  const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
  const userId = c.get('userId');
  const service = getIdeasService(c);

  await service.deleteIdea(id, userId);
  return c.json({ success: true, id });
});

// POST /api/ideas/:id/pin - Toggle or set pin status
ideasRoutes.post(
  '/:id/pin',
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
