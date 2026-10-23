import { Hono } from 'hono';
import { z } from 'zod';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { QuickLinksRepository } from '../db/repositories/quick-links.repository';
import { QuickLinksService } from '../services/quick-links.service';
import { validateJson, validateParams, validateQuery, idParamSchema } from '../utils/validator';

export const createQuickLinkSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name cannot exceed 100 characters.'),
  url: z.string().trim().min(1, 'URL is required.').max(2000, 'URL too long.'),
  iconType: z.string().trim().max(50).optional(),
  iconValue: z.string().trim().max(100).optional().nullable(),
  groupName: z.string().trim().max(50).optional().nullable(),
  position: z.coerce.number().int().min(0).optional(),
  isFavorite: z.boolean().optional(),
});

export const updateQuickLinkSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty.')
    .max(100, 'Name cannot exceed 100 characters.')
    .optional(),
  url: z.string().trim().min(1, 'URL cannot be empty.').max(2000, 'URL too long.').optional(),
  iconType: z.string().trim().max(50).optional(),
  iconValue: z.string().trim().max(100).optional().nullable(),
  groupName: z.string().trim().max(50).optional().nullable(),
  position: z.coerce.number().int().min(0).optional(),
  isFavorite: z.boolean().optional(),
});

export const listQuickLinksQuerySchema = z.object({
  group: z.string().trim().optional(),
  favorite: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const reorderQuickLinksSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required.'),
});

export const favoriteQuickLinkSchema = z.object({
  isFavorite: z.boolean().optional(),
});

export const quickLinksRoutes = new Hono<WorkerEnv>();

function getQuickLinksService(c: { env: WorkerEnv['Bindings'] }): QuickLinksService {
  const db = createDb(c.env.DB);
  const repository = new QuickLinksRepository(db);
  return new QuickLinksService(repository);
}

// GET /api/quick-links
quickLinksRoutes.get('/', validateQuery(listQuickLinksQuerySchema), async (c) => {
  const query = c.get('validatedQuery' as never) as z.infer<typeof listQuickLinksQuerySchema>;
  const service = getQuickLinksService(c);
  const userId = c.get('userId');

  const links = await service.list(userId, {
    groupName: query.group,
    isFavorite: query.favorite,
    limit: query.limit,
    offset: query.offset,
  });

  return c.json({ data: links }, 200);
});

// POST /api/quick-links/reorder (must be declared BEFORE /:id to prevent route clash)
quickLinksRoutes.post('/reorder', validateJson(reorderQuickLinksSchema), async (c) => {
  const body = c.get('validatedJson' as never) as z.infer<typeof reorderQuickLinksSchema>;
  const service = getQuickLinksService(c);
  const userId = c.get('userId');

  await service.reorder(userId, body.ids);
  return c.json({ success: true }, 200);
});

// POST /api/quick-links
quickLinksRoutes.post('/', validateJson(createQuickLinkSchema), async (c) => {
  const body = c.get('validatedJson' as never) as z.infer<typeof createQuickLinkSchema>;
  const service = getQuickLinksService(c);
  const userId = c.get('userId');

  const link = await service.create(userId, body);
  return c.json({ data: link }, 201);
});

// GET /api/quick-links/:id
quickLinksRoutes.get('/:id', validateParams(idParamSchema), async (c) => {
  const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
  const service = getQuickLinksService(c);
  const userId = c.get('userId');

  const link = await service.getById(id, userId);
  return c.json({ data: link }, 200);
});

// PATCH /api/quick-links/:id
quickLinksRoutes.patch(
  '/:id',
  validateParams(idParamSchema),
  validateJson(updateQuickLinkSchema),
  async (c) => {
    const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
    const body = c.get('validatedJson' as never) as z.infer<typeof updateQuickLinkSchema>;
    const service = getQuickLinksService(c);
    const userId = c.get('userId');

    const link = await service.update(id, userId, body);
    return c.json({ data: link }, 200);
  },
);

// DELETE /api/quick-links/:id
quickLinksRoutes.delete('/:id', validateParams(idParamSchema), async (c) => {
  const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
  const service = getQuickLinksService(c);
  const userId = c.get('userId');

  await service.delete(id, userId);
  return c.json({ success: true }, 200);
});

// POST /api/quick-links/:id/favorite
quickLinksRoutes.post('/:id/favorite', validateParams(idParamSchema), async (c) => {
  const { id } = c.get('validatedParams' as never) as z.infer<typeof idParamSchema>;
  const service = getQuickLinksService(c);
  const userId = c.get('userId');

  let targetFav: boolean | undefined;
  try {
    const body = (await c.req.json()) as { isFavorite?: boolean };
    if (typeof body?.isFavorite === 'boolean') {
      targetFav = body.isFavorite;
    }
  } catch {
    // Optional body, ignore absent JSON and toggle
  }

  const link = await service.toggleFavorite(id, userId, targetFav);
  return c.json({ data: link }, 200);
});
