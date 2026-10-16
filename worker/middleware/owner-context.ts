import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { users } from '../db/schema';
import { DEFAULT_OWNER_ID } from '../db/seed';

export const ownerContext = createMiddleware<WorkerEnv>(async (c, next) => {
  const db = createDb(c.env.DB);
  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'owner'))
    .limit(1);

  const userId = owner?.id ?? DEFAULT_OWNER_ID;
  c.set('userId', userId);

  await next();
});
