import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { z } from 'zod';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { IdeaCollectionsRepository } from '../db/repositories/idea-collections.repository';
import { IdeaCollectionsService } from '../services/idea-collections.service';
import { sameOriginWrite } from '../middleware/same-origin';
import { validateJson, validateParams, validateQuery } from '../utils/validator';
import { AppError } from '../utils/errors';

export const ideaCollectionsRoutes = new Hono<WorkerEnv>();
const params = z.object({ id: z.string().min(1).max(128) });
const name = z.object({ name: z.string().trim().min(1).max(80) }).strict();
const service = (env: WorkerEnv['Bindings']) =>
  new IdeaCollectionsService(new IdeaCollectionsRepository(createDb(env.DB)));
ideaCollectionsRoutes.use(
  '*',
  bodyLimit({
    maxSize: 2 * 1024 * 1024,
    onError: () => {
      throw new AppError('BODY_TOO_LARGE', 'Collection metadata is too large.', 413);
    },
  }),
);
const listing = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
  })
  .strict();
ideaCollectionsRoutes.get('/', validateQuery(listing), async (c) => {
  const query = c.get('validatedQuery' as never) as z.infer<typeof listing>;
  return c.json(await service(c.env).list(c.get('userId'), query.limit, query.offset));
});
ideaCollectionsRoutes.post('/', sameOriginWrite, validateJson(name), async (c) => {
  const body = c.get('validatedJson' as never) as z.infer<typeof name>;
  return c.json({ data: await service(c.env).save(c.get('userId'), body.name) }, 201);
});
const order = z.object({ ids: z.array(z.string().min(1).max(128)).max(10000) }).strict();
ideaCollectionsRoutes.put('/reorder', sameOriginWrite, validateJson(order), async (c) => {
  await service(c.env).reorder(
    c.get('userId'),
    (c.get('validatedJson' as never) as z.infer<typeof order>).ids,
  );
  return c.json({ success: true });
});
ideaCollectionsRoutes.patch(
  '/:id',
  sameOriginWrite,
  validateParams(params),
  validateJson(name),
  async (c) => {
    return c.json({
      data: await service(c.env).save(
        c.get('userId'),
        (c.get('validatedJson' as never) as z.infer<typeof name>).name,
        c.req.param('id'),
      ),
    });
  },
);
ideaCollectionsRoutes.delete('/:id', sameOriginWrite, validateParams(params), async (c) => {
  await service(c.env).remove(c.req.param('id'), c.get('userId'));
  return c.json({ success: true });
});
