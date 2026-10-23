import { eq, and, asc } from 'drizzle-orm';
import type { Database } from '../client';
import { quickLinks } from '../schema';
import { BadRequestError } from '../../utils/errors';

export type QuickLinkIconType = 'brand' | 'lucide' | 'favicon' | 'custom';

export interface QuickLinkRecord {
  id: string;
  userId: string;
  name: string;
  url: string;
  iconType: QuickLinkIconType;
  iconValue: string | null;
  groupName: string | null;
  position: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListQuickLinksFilters {
  groupName?: string | undefined;
  isFavorite?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CreateQuickLinkData {
  id: string;
  userId: string;
  name: string;
  url: string;
  iconType: QuickLinkIconType;
  iconValue?: string | null | undefined;
  groupName?: string | null | undefined;
  position: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateQuickLinkData {
  name?: string | undefined;
  url?: string | undefined;
  iconType?: QuickLinkIconType | undefined;
  iconValue?: string | null | undefined;
  groupName?: string | null | undefined;
  position?: number | undefined;
  isFavorite?: boolean | undefined;
  updatedAt: string;
}

export class QuickLinksRepository {
  constructor(private readonly db: Database) {}

  private mapRow(row: typeof quickLinks.$inferSelect): QuickLinkRecord {
    let iconType: QuickLinkIconType;
    switch (row.iconType) {
      case 'platform':
        iconType = 'brand';
        break;
      case 'domain':
        iconType = 'favicon';
        break;
      case 'brand':
      case 'lucide':
      case 'favicon':
      case 'custom':
        iconType = row.iconType;
        break;
      default:
        iconType = row.iconValue ? 'lucide' : 'favicon';
    }
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      url: row.url,
      iconType,
      iconValue: row.iconValue,
      groupName: row.groupName,
      position: row.position,
      isFavorite: Boolean(row.isFavorite),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async list(userId: string, filters?: ListQuickLinksFilters): Promise<QuickLinkRecord[]> {
    const conditions = [eq(quickLinks.userId, userId)];

    if (filters?.groupName) {
      conditions.push(eq(quickLinks.groupName, filters.groupName));
    }

    if (filters?.isFavorite !== undefined) {
      conditions.push(eq(quickLinks.isFavorite, filters.isFavorite ? 1 : 0));
    }

    let query = this.db
      .select()
      .from(quickLinks)
      .where(and(...conditions))
      .orderBy(asc(quickLinks.position), asc(quickLinks.createdAt));

    if (filters?.limit !== undefined) {
      query = query.limit(filters.limit) as typeof query;
    }

    if (filters?.offset !== undefined) {
      query = query.offset(filters.offset) as typeof query;
    }

    const rows = await query;
    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: string, userId: string): Promise<QuickLinkRecord | null> {
    const rows = await this.db
      .select()
      .from(quickLinks)
      .where(and(eq(quickLinks.id, id), eq(quickLinks.userId, userId)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.mapRow(row);
  }

  async getNextPosition(userId: string): Promise<number> {
    const rows = await this.db
      .select({ position: quickLinks.position })
      .from(quickLinks)
      .where(eq(quickLinks.userId, userId))
      .orderBy(asc(quickLinks.position));

    if (rows.length === 0) return 0;
    const maxPos = rows.reduce((max, r) => Math.max(max, r.position), -1);
    return maxPos + 1;
  }

  async create(data: CreateQuickLinkData): Promise<QuickLinkRecord> {
    await this.db.insert(quickLinks).values({
      id: data.id,
      userId: data.userId,
      name: data.name,
      url: data.url,
      iconType: data.iconType,
      iconValue: data.iconValue ?? null,
      groupName: data.groupName ?? null,
      position: data.position,
      isFavorite: data.isFavorite ? 1 : 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });

    const created = await this.findById(data.id, data.userId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created quick link: ${data.id}`);
    }
    return created;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateQuickLinkData,
  ): Promise<QuickLinkRecord | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const valuesToUpdate: Partial<typeof quickLinks.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.name !== undefined) valuesToUpdate.name = data.name;
    if (data.url !== undefined) valuesToUpdate.url = data.url;
    if (data.iconType !== undefined) valuesToUpdate.iconType = data.iconType;
    if (data.iconValue !== undefined) valuesToUpdate.iconValue = data.iconValue;
    if (data.groupName !== undefined) valuesToUpdate.groupName = data.groupName;
    if (data.position !== undefined) valuesToUpdate.position = data.position;
    if (data.isFavorite !== undefined) valuesToUpdate.isFavorite = data.isFavorite ? 1 : 0;

    await this.db
      .update(quickLinks)
      .set(valuesToUpdate)
      .where(and(eq(quickLinks.id, id), eq(quickLinks.userId, userId)));

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.findById(id, userId);
    if (!existing) return false;

    await this.db
      .delete(quickLinks)
      .where(and(eq(quickLinks.id, id), eq(quickLinks.userId, userId)));

    return true;
  }

  async reorder(userId: string, orderedIds: string[]): Promise<boolean> {
    const current = await this.list(userId);
    const ownerIds = new Set(current.map((link) => link.id));
    if (
      orderedIds.length !== current.length ||
      new Set(orderedIds).size !== orderedIds.length ||
      orderedIds.some((id) => !ownerIds.has(id))
    ) {
      throw new BadRequestError('Provide every current quick link ID exactly once.');
    }
    if (orderedIds.length === 0) return true;
    const updatedAt = new Date().toISOString();
    const statements = orderedIds.map((id, index) =>
      this.db
        .update(quickLinks)
        .set({ position: index, updatedAt })
        .where(and(eq(quickLinks.id, id), eq(quickLinks.userId, userId))),
    );
    await this.db.batch([statements[0]!, ...statements.slice(1)]);
    return true;
  }

  async toggleFavorite(
    id: string,
    userId: string,
    explicitFavorite?: boolean | undefined,
  ): Promise<QuickLinkRecord | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const newFavorite = explicitFavorite !== undefined ? explicitFavorite : !existing.isFavorite;

    await this.db
      .update(quickLinks)
      .set({
        isFavorite: newFavorite ? 1 : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(quickLinks.id, id), eq(quickLinks.userId, userId)));

    return this.findById(id, userId);
  }
}
