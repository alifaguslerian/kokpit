import { and, asc, eq, sql } from 'drizzle-orm';
import type { Database } from '../client';
import { ideaCollections as collections } from '../schema';
import { BadRequestError } from '../../utils/errors';

export class IdeaCollectionsRepository {
  constructor(private readonly db: Database) {}
  list(userId: string, limit = 50, offset = 0) {
    return this.db
      .select({
        id: collections.id,
        name: collections.name,
        position: collections.position,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
        ideaCount:
          sql<number>`(SELECT COUNT(*) FROM ideas i WHERE i.collection_id = idea_collections.id AND i.user_id = ${userId})`.as(
            'idea_count',
          ),
      })
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(asc(collections.position), asc(collections.id))
      .limit(limit)
      .offset(offset);
  }
  async find(id: string, userId: string) {
    return (
      (
        await this.db
          .select()
          .from(collections)
          .where(and(eq(collections.id, id), eq(collections.userId, userId)))
          .limit(1)
      )[0] ?? null
    );
  }
  async save(userId: string, name: string, nameKey: string, id?: string) {
    const now = new Date().toISOString();
    if (id) {
      const rows = await this.db
        .update(collections)
        .set({ name, nameKey, updatedAt: now })
        .where(
          and(
            eq(collections.id, id),
            eq(collections.userId, userId),
            sql`NOT EXISTS (SELECT 1 FROM idea_collections other WHERE other.user_id = ${userId} AND other.name_key = ${nameKey} AND other.id <> ${id})`,
          ),
        )
        .returning();
      return rows[0] ?? null;
    }
    const key = crypto.randomUUID();
    const rows = await this.db
      .all(sql`INSERT INTO idea_collections (id, user_id, name, name_key, position, created_at, updated_at)
      SELECT ${key}, ${userId}, ${name}, ${nameKey}, COALESCE(MAX(position), -1) + 1, ${now}, ${now}
      FROM idea_collections WHERE user_id = ${userId}
      ON CONFLICT(user_id, name_key) DO NOTHING RETURNING id`);
    return rows.length ? this.find(key, userId) : null;
  }
  async remove(id: string, userId: string) {
    const rows = await this.db
      .delete(collections)
      .where(
        and(
          eq(collections.id, id),
          eq(collections.userId, userId),
          sql`NOT EXISTS (SELECT 1 FROM ideas WHERE collection_id = ${id} AND user_id <> ${userId})`,
        ),
      )
      .returning({ id: collections.id });
    return rows.length > 0;
  }
  async reorder(userId: string, ids: string[]) {
    if (new Set(ids).size !== ids.length)
      throw new BadRequestError('Provide every current collection ID exactly once.');
    const count = sql`(SELECT COUNT(*) FROM idea_collections WHERE user_id = ${userId})`;
    if (!ids.length) {
      const rows = await this.db.all<{ count: number }>(sql`SELECT ${count} AS count`);
      if (rows[0]?.count !== 0)
        throw new BadRequestError('Provide every current collection ID exactly once.');
      return;
    }
    // One JSON binding keeps complete reorders within D1's per-statement parameter limit.
    const changed = await this.db
      .all(sql`WITH requested AS (SELECT value AS id, CAST(key AS INTEGER) AS position FROM json_each(${JSON.stringify(ids)}))
      UPDATE idea_collections SET position = (SELECT position FROM requested WHERE requested.id = idea_collections.id), updated_at = ${new Date().toISOString()}
      WHERE user_id = ${userId} AND ${count} = ${ids.length}
      AND NOT EXISTS (SELECT 1 FROM idea_collections WHERE user_id = ${userId} AND id NOT IN (SELECT id FROM requested))
      RETURNING id`);
    if (changed.length !== ids.length)
      throw new BadRequestError('Provide every current collection ID exactly once.');
  }
}
