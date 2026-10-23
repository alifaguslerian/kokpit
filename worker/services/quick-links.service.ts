import { NotFoundError, BadRequestError } from '../utils/errors';
import type {
  QuickLinksRepository,
  QuickLinkRecord,
  ListQuickLinksFilters,
} from '../db/repositories/quick-links.repository';

export interface CreateQuickLinkDTO {
  name: string;
  url: string;
  iconType?: string | undefined;
  iconValue?: string | null | undefined;
  groupName?: string | null | undefined;
  position?: number | undefined;
  isFavorite?: boolean | undefined;
}

export interface UpdateQuickLinkDTO {
  name?: string | undefined;
  url?: string | undefined;
  iconType?: string | undefined;
  iconValue?: string | null | undefined;
  groupName?: string | null | undefined;
  position?: number | undefined;
  isFavorite?: boolean | undefined;
}

export class QuickLinksService {
  constructor(private readonly repository: QuickLinksRepository) {}

  private normalizeUrl(rawUrl: string): string {
    let trimmed = rawUrl.trim();
    if (!trimmed) {
      throw new BadRequestError('URL cannot be empty.');
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new BadRequestError('URL must use http or https protocol.');
      }
      return parsed.toString();
    } catch {
      throw new BadRequestError('Invalid URL format.');
    }
  }

  private detectIcon(url: string, explicitType?: string, explicitValue?: string | null) {
    if (explicitType && explicitValue) {
      return {
        iconType: explicitType,
        iconValue: explicitValue.trim() || null,
      };
    }

    const lower = url.toLowerCase();
    if (lower.includes('github.com')) return { iconType: 'platform', iconValue: 'github' };
    if (lower.includes('notion.so') || lower.includes('notion.site')) {
      return { iconType: 'platform', iconValue: 'notion' };
    }
    if (lower.includes('drive.google.com')) return { iconType: 'platform', iconValue: 'drive' };
    if (lower.includes('mail.google.com') || lower.includes('gmail.com')) {
      return { iconType: 'platform', iconValue: 'mail' };
    }
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return { iconType: 'platform', iconValue: 'youtube' };
    }
    if (lower.includes('figma.com')) return { iconType: 'platform', iconValue: 'figma' };
    if (lower.includes('discord.com') || lower.includes('discord.gg')) {
      return { iconType: 'platform', iconValue: 'discord' };
    }
    if (lower.includes('spotify.com')) return { iconType: 'platform', iconValue: 'spotify' };

    return {
      iconType: explicitType || 'domain',
      iconValue: explicitValue?.trim() || null,
    };
  }

  async list(userId: string, filters?: ListQuickLinksFilters): Promise<QuickLinkRecord[]> {
    return this.repository.list(userId, filters);
  }

  async getById(id: string, userId: string): Promise<QuickLinkRecord> {
    const link = await this.repository.findById(id, userId);
    if (!link) {
      throw new NotFoundError('Quick link not found.');
    }
    return link;
  }

  async create(userId: string, input: CreateQuickLinkDTO): Promise<QuickLinkRecord> {
    const trimmedName = input.name?.trim();
    if (!trimmedName) {
      throw new BadRequestError('Name cannot be empty.');
    }
    if (trimmedName.length > 100) {
      throw new BadRequestError('Name cannot exceed 100 characters.');
    }

    const validatedUrl = this.normalizeUrl(input.url);
    const { iconType, iconValue } = this.detectIcon(validatedUrl, input.iconType, input.iconValue);

    const position =
      input.position !== undefined ? input.position : await this.repository.getNextPosition(userId);

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    return this.repository.create({
      id,
      userId,
      name: trimmedName,
      url: validatedUrl,
      iconType,
      iconValue,
      groupName: input.groupName?.trim() || null,
      position,
      isFavorite: Boolean(input.isFavorite),
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(id: string, userId: string, input: UpdateQuickLinkDTO): Promise<QuickLinkRecord> {
    await this.getById(id, userId);

    const updateData: {
      name?: string | undefined;
      url?: string | undefined;
      iconType?: string | undefined;
      iconValue?: string | null | undefined;
      groupName?: string | null | undefined;
      position?: number | undefined;
      isFavorite?: boolean | undefined;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed) throw new BadRequestError('Name cannot be empty.');
      if (trimmed.length > 100) throw new BadRequestError('Name cannot exceed 100 characters.');
      updateData.name = trimmed;
    }

    if (input.url !== undefined) {
      updateData.url = this.normalizeUrl(input.url);
    }

    if (input.iconType !== undefined) {
      updateData.iconType = input.iconType.trim();
    }

    if (input.iconValue !== undefined) {
      updateData.iconValue = input.iconValue?.trim() || null;
    }

    if (input.groupName !== undefined) {
      updateData.groupName = input.groupName?.trim() || null;
    }

    if (input.position !== undefined) {
      updateData.position = input.position;
    }

    if (input.isFavorite !== undefined) {
      updateData.isFavorite = Boolean(input.isFavorite);
    }

    const updated = await this.repository.update(id, userId, updateData);
    if (!updated) {
      throw new NotFoundError('Quick link not found.');
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.getById(id, userId);
    return this.repository.delete(id, userId);
  }

  async reorder(userId: string, orderedIds: string[]): Promise<boolean> {
    if (!Array.isArray(orderedIds)) {
      throw new BadRequestError('Ordered IDs must be an array.');
    }
    return this.repository.reorder(userId, orderedIds);
  }

  async toggleFavorite(
    id: string,
    userId: string,
    isFavorite?: boolean | undefined,
  ): Promise<QuickLinkRecord> {
    await this.getById(id, userId);
    const updated = await this.repository.toggleFavorite(id, userId, isFavorite);
    if (!updated) {
      throw new NotFoundError('Quick link not found.');
    }
    return updated;
  }
}
