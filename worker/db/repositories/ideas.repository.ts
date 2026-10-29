import { eq, and, desc, inArray, sql, isNull } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import type { Database } from '../client';
import { ideas, ideaTags, ideaTagLinks } from '../schema';

export function ownedIdeaScope(userId: string) {
  return and(
    eq(ideas.userId, userId),
    sql`(${ideas.collectionId} IS NULL OR EXISTS (SELECT 1 FROM idea_collections c WHERE c.id = ${ideas.collectionId} AND c.user_id = ${userId}))`,
  );
}
export type IdeaRecord = typeof ideas.$inferSelect;
function ideaResponse(row: IdeaRecord, tags: string[]): IdeaWithTags {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    content: row.content,
    isPinned: Boolean(row.isPinned),
    isFavorite: Boolean(row.isFavorite),
    collectionId: row.collectionId,
    coverUrl: row.coverR2Key
      ? `/api/ideas/${encodeURIComponent(row.id)}/cover?v=${encodeURIComponent(row.coverR2Key.split('/').at(-1)!)}`
      : null,
    tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export interface IdeaWithTags {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  collectionId: string | null;
  coverUrl: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListIdeasFilters {
  q?: string | undefined;
  tag?: string | undefined;
  pinned?: boolean | undefined;
  favorite?: boolean | undefined;
  collectionId?: string | undefined;
  sort?: 'updated' | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CreateIdeaData {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  isPinned: boolean;
  isFavorite?: boolean | undefined;
  collectionId?: string | null | undefined;
  tags?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateIdeaData {
  title?: string | null | undefined;
  content?: string | undefined;
  isPinned?: boolean | undefined;
  isFavorite?: boolean | undefined;
  collectionId?: string | null | undefined;
  tags?: string[] | undefined;
  updatedAt: string;
}

export class IdeasRepository {
  constructor(private readonly db: Database) {}

  async list(userId: string, filters?: ListIdeasFilters): Promise<IdeaWithTags[]> {
    const conditions = [ownedIdeaScope(userId)];
    if (filters?.favorite !== undefined)
      conditions.push(eq(ideas.isFavorite, filters.favorite ? 1 : 0));
    if (filters?.collectionId) conditions.push(eq(ideas.collectionId, filters.collectionId));

    if (filters?.q && filters.q.trim()) {
      const searchTerm = filters.q.trim();
      // Literal substring search avoids wildcard surprises and D1's short LIKE-pattern limit.
      conditions.push(
        sql`(instr(lower(COALESCE(${ideas.title}, '')), lower(${searchTerm})) > 0 OR instr(lower(${ideas.content}), lower(${searchTerm})) > 0)`,
      );
    }

    if (filters?.pinned !== undefined) {
      conditions.push(eq(ideas.isPinned, filters.pinned ? 1 : 0));
    }

    if (filters?.tag && filters.tag.trim()) {
      const normalizedTag = filters.tag.trim();
      const matchingLinks = await this.db
        .select({ ideaId: ideaTagLinks.ideaId })
        .from(ideaTagLinks)
        .innerJoin(ideaTags, eq(ideaTagLinks.tagId, ideaTags.id))
        .where(and(eq(ideaTags.userId, userId), eq(ideaTags.name, normalizedTag)));

      if (matchingLinks.length === 0) {
        return [];
      }

      const matchingIds = matchingLinks.map((l) => l.ideaId);
      conditions.push(inArray(ideas.id, matchingIds));
    }

    const limit = Math.min(Math.max(filters?.limit ?? 50, 1), 100);
    const offset = Math.max(filters?.offset ?? 0, 0);

    const rows = await this.db
      .select()
      .from(ideas)
      .where(and(...conditions))
      .orderBy(
        ...(filters?.sort === 'updated'
          ? [desc(ideas.updatedAt), desc(ideas.id)]
          : [desc(ideas.isPinned), desc(ideas.createdAt), desc(ideas.id)]),
      )
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) {
      return [];
    }

    const ideaIds = rows.map((r) => r.id);
    const tagMap = await this.getTagsForIdeaIds(ideaIds, userId);

    return rows.map((row) => ideaResponse(row, tagMap.get(row.id) || []));
  }

  async getById(id: string, userId: string): Promise<IdeaWithTags | null> {
    const [row] = await this.db
      .select()
      .from(ideas)
      .where(and(eq(ideas.id, id), ownedIdeaScope(userId)))
      .limit(1);

    if (!row) {
      return null;
    }

    const tagMap = await this.getTagsForIdeaIds([id], userId);

    return ideaResponse(row, tagMap.get(id) || []);
  }

  async create(data: CreateIdeaData): Promise<IdeaWithTags> {
    const insert = this.db.insert(ideas).values({
      id: data.id,
      userId: data.userId,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned ? 1 : 0,
      isFavorite: data.isFavorite ? 1 : 0,
      collectionId: data.collectionId ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });

    const tags = data.tags || [];
    await this.db.batch([
      insert,
      ...this.tagStatements(data.id, data.userId, tags, data.createdAt),
    ]);

    return (await this.getById(data.id, data.userId))!;
  }

  async update(id: string, userId: string, data: UpdateIdeaData): Promise<IdeaWithTags | null> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      return null;
    }

    const updateValues: Partial<typeof ideas.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.title !== undefined) {
      updateValues.title = data.title;
    }

    if (data.content !== undefined) {
      updateValues.content = data.content;
    }

    if (data.isPinned !== undefined) {
      updateValues.isPinned = data.isPinned ? 1 : 0;
    }
    if (data.isFavorite !== undefined) updateValues.isFavorite = data.isFavorite ? 1 : 0;
    if (data.collectionId !== undefined) updateValues.collectionId = data.collectionId;

    const update = this.db
      .update(ideas)
      .set(updateValues)
      .where(and(eq(ideas.id, id), ownedIdeaScope(userId)));

    const statements: [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]] = [update];
    if (data.tags !== undefined) {
      statements.push(
        this.db
          .delete(ideaTagLinks)
          .where(
            and(
              eq(ideaTagLinks.ideaId, id),
              inArray(
                ideaTagLinks.ideaId,
                this.db.select({ id: ideas.id }).from(ideas).where(eq(ideas.userId, userId)),
              ),
            ),
          ),
      );
      statements.push(...this.tagStatements(id, userId, data.tags, data.updatedAt));
    }
    await this.db.batch(statements);

    return this.getById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      return false;
    }

    const scope = and(eq(ideas.id, id), ownedIdeaScope(userId), isNull(ideas.coverR2Key));
    const [, deleted] = await this.db.batch([
      this.db
        .delete(ideaTagLinks)
        .where(
          and(
            eq(ideaTagLinks.ideaId, id),
            inArray(ideaTagLinks.ideaId, this.db.select({ id: ideas.id }).from(ideas).where(scope)),
          ),
        ),
      this.db.delete(ideas).where(scope).returning({ id: ideas.id }),
    ]);

    return deleted.length > 0;
  }

  private async getTagsForIdeaIds(
    ideaIds: string[],
    userId: string,
  ): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (ideaIds.length === 0) return map;

    const links = await this.db
      .select({
        ideaId: ideaTagLinks.ideaId,
        tagName: ideaTags.name,
      })
      .from(ideaTagLinks)
      .innerJoin(ideaTags, eq(ideaTagLinks.tagId, ideaTags.id))
      .innerJoin(ideas, eq(ideaTagLinks.ideaId, ideas.id))
      .where(
        and(
          inArray(ideaTagLinks.ideaId, ideaIds),
          eq(ideaTags.userId, userId),
          eq(ideas.userId, userId),
        ),
      );

    for (const link of links) {
      const list = map.get(link.ideaId) || [];
      list.push(link.tagName);
      map.set(link.ideaId, list);
    }

    return map;
  }

  private tagStatements(
    ideaId: string,
    userId: string,
    tagNames: string[],
    timestamp: string,
  ): BatchItem<'sqlite'>[] {
    const uniqueTags = Array.from(new Set(tagNames.map((t) => t.trim()).filter(Boolean)));
    const statements: BatchItem<'sqlite'>[] = [];
    for (const name of uniqueTags) {
      statements.push(
        this.db
          .insert(ideaTags)
          .values({
            id: crypto.randomUUID(),
            userId,
            name,
            createdAt: timestamp,
          })
          .onConflictDoNothing({ target: [ideaTags.userId, ideaTags.name] }),
      );
      // Resolve the winning tag ID inside the same atomic batch, including existing tags.
      statements.push(
        this.db
          .insert(ideaTagLinks)
          .select(
            this.db
              .select({ ideaId: sql<string>`${ideaId}`.as('idea_id'), tagId: ideaTags.id })
              .from(ideaTags)
              .innerJoin(ideas, and(eq(ideas.id, ideaId), eq(ideas.userId, userId)))
              .where(and(eq(ideaTags.userId, userId), eq(ideaTags.name, name))),
          )
          .onConflictDoNothing({ target: [ideaTagLinks.ideaId, ideaTagLinks.tagId] }),
      );
    }
    return statements;
  }
}
