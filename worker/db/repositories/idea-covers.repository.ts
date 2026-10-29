import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Database } from '../client';
import { ideas } from '../schema';
import { ownedIdeaScope } from './ideas.repository';

export class IdeaCoversRepository {
  constructor(private readonly db: Database) {}
  async find(id: string, userId: string) {
    return (
      (
        await this.db
          .select()
          .from(ideas)
          .where(and(eq(ideas.id, id), ownedIdeaScope(userId)))
          .limit(1)
      )[0] ?? null
    );
  }
  async shared(id: string, key: string) {
    const rows = await this.db
      .all(sql`SELECT id FROM ideas WHERE cover_r2_key = ${key} AND id <> ${id}
      UNION ALL SELECT id FROM materials WHERE r2_key = ${key}
      UNION ALL SELECT id FROM tracks WHERE audio_r2_key = ${key} OR cover_r2_key = ${key}
      UNION ALL SELECT id FROM playlists WHERE cover_r2_key = ${key} LIMIT 1`);
    return rows.length > 0;
  }
  async replace(
    id: string,
    userId: string,
    expected: string | null,
    value: {
      coverR2Key: string | null;
      coverMimeType: string | null;
      coverSizeBytes: number | null;
    },
  ) {
    return (
      (
        await this.db
          .update(ideas)
          .set({ ...value, updatedAt: new Date().toISOString() })
          .where(
            and(
              eq(ideas.id, id),
              ownedIdeaScope(userId),
              expected === null ? isNull(ideas.coverR2Key) : eq(ideas.coverR2Key, expected),
            ),
          )
          .returning({ id: ideas.id })
      ).length > 0
    );
  }
}
