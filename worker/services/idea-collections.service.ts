import type { IdeaCollectionsRepository } from '../db/repositories/idea-collections.repository';
import { AppError, BadRequestError, NotFoundError } from '../utils/errors';

export class IdeaCollectionsService {
  constructor(private readonly repository: IdeaCollectionsRepository) {}
  async list(userId: string, limit: number, offset: number) {
    const rows = await this.repository.list(userId, limit + 1, offset);
    return { data: rows.slice(0, limit), nextOffset: rows.length > limit ? offset + limit : null };
  }
  async save(userId: string, name: string, id?: string) {
    if (id && !(await this.repository.find(id, userId)))
      throw new NotFoundError('Collection not found.');
    const display = name.trim();
    const key = display.normalize('NFKC').trim().toLowerCase();
    if (!key) throw new BadRequestError('A collection name is required.');
    const saved = await this.repository.save(userId, display, key, id);
    if (!saved) throw new AppError('CONFLICT', 'A collection with this name already exists.', 409);
    return saved;
  }
  async remove(id: string, userId: string) {
    if (!(await this.repository.find(id, userId))) throw new NotFoundError('Collection not found.');
    if (!(await this.repository.remove(id, userId)))
      throw new AppError('CONFLICT', 'Collection ownership needs review before deletion.', 409);
  }
  reorder(userId: string, ids: string[]) {
    return this.repository.reorder(userId, ids);
  }
}
