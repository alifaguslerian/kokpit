import { AppError, NotFoundError, BadRequestError } from '../utils/errors';
import type {
  IdeasRepository,
  IdeaWithTags,
  ListIdeasFilters,
} from '../db/repositories/ideas.repository';
import type { IdeaCollectionsRepository } from '../db/repositories/idea-collections.repository';
import type { IdeaCoversService } from './idea-covers.service';

export interface CreateIdeaInput {
  title?: string | null | undefined;
  content: string;
  isPinned?: boolean | undefined;
  isFavorite?: boolean | undefined;
  collectionId?: string | null | undefined;
  tags?: string[] | undefined;
}

export interface UpdateIdeaInput {
  title?: string | null | undefined;
  content?: string | undefined;
  isPinned?: boolean | undefined;
  isFavorite?: boolean | undefined;
  collectionId?: string | null | undefined;
  tags?: string[] | undefined;
}

export class IdeasService {
  constructor(
    private readonly repository: IdeasRepository,
    private readonly collections?: IdeaCollectionsRepository,
    private readonly covers?: IdeaCoversService,
  ) {}

  private async validateCollection(id: string | null | undefined, userId: string) {
    if (id && !(await this.collections?.find(id, userId)))
      throw new NotFoundError('Collection not found.');
  }

  async listIdeas(userId: string, filters?: ListIdeasFilters): Promise<IdeaWithTags[]> {
    await this.validateCollection(filters?.collectionId, userId);
    return this.repository.list(userId, filters);
  }

  async getIdeaById(id: string, userId: string): Promise<IdeaWithTags> {
    const idea = await this.repository.getById(id, userId);
    if (!idea) {
      throw new NotFoundError('Idea not found.');
    }
    return idea;
  }

  async createIdea(userId: string, input: CreateIdeaInput): Promise<IdeaWithTags> {
    await this.validateCollection(input.collectionId, userId);
    const trimmedContent = input.content?.trim();
    if (!trimmedContent) {
      throw new BadRequestError('Content cannot be empty.');
    }

    const normalizedTitle = input.title?.trim() || null;
    const isPinned = Boolean(input.isPinned);
    const tags = this.normalizeTags(input.tags);

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    return this.repository.create({
      id,
      userId,
      title: normalizedTitle,
      content: trimmedContent,
      isPinned,
      isFavorite: Boolean(input.isFavorite),
      collectionId: input.collectionId ?? null,
      tags,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateIdea(id: string, userId: string, input: UpdateIdeaInput): Promise<IdeaWithTags> {
    // Verify existence & ownership
    await this.getIdeaById(id, userId);
    await this.validateCollection(input.collectionId, userId);

    let contentUpdate: string | undefined;
    if (input.content !== undefined) {
      const trimmed = input.content.trim();
      if (!trimmed) {
        throw new BadRequestError('Content cannot be empty.');
      }
      contentUpdate = trimmed;
    }

    let titleUpdate: string | null | undefined;
    if (input.title !== undefined) {
      titleUpdate = input.title?.trim() || null;
    }

    let tagsUpdate: string[] | undefined;
    if (input.tags !== undefined) {
      tagsUpdate = this.normalizeTags(input.tags);
    }

    const now = new Date().toISOString();

    const updated = await this.repository.update(id, userId, {
      title: titleUpdate,
      content: contentUpdate,
      isPinned: input.isPinned,
      isFavorite: input.isFavorite,
      collectionId: input.collectionId,
      tags: tagsUpdate,
      updatedAt: now,
    });

    if (!updated) {
      throw new NotFoundError('Idea not found.');
    }

    return updated;
  }

  async deleteIdea(id: string, userId: string): Promise<void> {
    // Verify existence & ownership
    await this.getIdeaById(id, userId);
    if (this.covers) await this.covers.remove(id, userId);

    const success = await this.repository.delete(id, userId);
    if (!success) {
      if (await this.repository.getById(id, userId))
        throw new AppError(
          'CONFLICT',
          'This idea changed during cleanup. Reload it and retry deletion.',
          409,
        );
      throw new NotFoundError('Idea not found.');
    }
  }

  async togglePin(id: string, userId: string, targetPinState?: boolean): Promise<IdeaWithTags> {
    const existing = await this.getIdeaById(id, userId);
    const newPinned = targetPinState !== undefined ? targetPinState : !existing.isPinned;

    const now = new Date().toISOString();
    const updated = await this.repository.update(id, userId, {
      isPinned: newPinned,
      updatedAt: now,
    });

    if (!updated) {
      throw new NotFoundError('Idea not found.');
    }

    return updated;
  }

  private normalizeTags(tags?: string[]): string[] {
    if (!tags || !Array.isArray(tags)) return [];
    return Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
  }
}
