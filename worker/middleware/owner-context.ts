import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { users } from '../db/schema';
import { DEFAULT_OWNER_ID } from '../db/seed';

export const ownerContext = createMiddleware<WorkerEnv>(async (c, next) => {
  let userId = DEFAULT_OWNER_ID;

  if (c.env?.DB) {
    try {
      const db = createDb(c.env.DB);
      const [owner] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, 'owner'))
        .limit(1);

      if (owner?.id) {
        userId = owner.id;
      }
    } catch (err) {
      console.warn('[ownerContext] Failed to query owner from D1, using default owner ID:', err);
    }
  }

  c.set('userId', userId);
  await next();
});
