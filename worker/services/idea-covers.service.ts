import type { IdeaCoversRepository } from '../db/repositories/idea-covers.repository';
import type { IdeaRecord } from '../db/repositories/ideas.repository';
import { R2Storage } from '../providers/storage/r2.provider';
import { AppError, NotFoundError } from '../utils/errors';
import { readIdeaCover } from '../utils/idea-cover';
import { fileHeaders } from '../utils/file-response';

export class IdeaCoversService {
  constructor(
    private readonly repository: IdeaCoversRepository,
    private readonly bucket?: R2Bucket,
  ) {}
  private storage() {
    if (!this.bucket)
      throw new AppError('STORAGE_UNAVAILABLE', 'Cover storage is unavailable.', 503);
    return new R2Storage(this.bucket);
  }
  private async get(id: string, userId: string) {
    const idea = await this.repository.find(id, userId);
    if (!idea) throw new NotFoundError('Idea not found.');
    return idea;
  }
  private async safeKey(idea: IdeaRecord) {
    const prefix = `users/${encodeURIComponent(idea.userId)}/ideas/covers/${encodeURIComponent(idea.id)}/`;
    if (
      !idea.coverR2Key?.startsWith(prefix) ||
      !/^[\da-f-]{36}$/.test(idea.coverR2Key.slice(prefix.length)) ||
      (await this.repository.shared(idea.id, idea.coverR2Key))
    )
      throw new AppError(
        'CONFLICT',
        'Cover ownership metadata needs review before this operation.',
        409,
      );
    return idea.coverR2Key;
  }
  private failure(code: string, message: string) {
    console.error('[Idea cover]', { code });
    return new AppError(code, message, 503);
  }
  private async deleteObject(storage: R2Storage, key: string) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await storage.delete(key);
        return;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
  }
  async upload(
    id: string,
    userId: string,
    input: { body: ReadableStream<Uint8Array>; mimeType: string },
  ) {
    const previous = await this.get(id, userId);
    if (previous.coverR2Key) await this.safeKey(previous);
    const image = await readIdeaCover(input.body, input.mimeType);
    const storage = this.storage();
    const key = `users/${encodeURIComponent(userId)}/ideas/covers/${encodeURIComponent(id)}/${crypto.randomUUID()}`;
    try {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(image.bytes);
          controller.close();
        },
      });
      await storage.upload(key, stream, image.bytes.byteLength, image.mimeType);
    } catch {
      await this.deleteObject(storage, key).catch(() => {
        console.error('[Idea cover]', { code: 'COVER_ROLLBACK_FAILED' });
      });
      throw this.failure(
        'COVER_UPLOAD_FAILED',
        'Cover upload failed. Your existing idea and cover are unchanged.',
      );
    }
    let committed: boolean;
    try {
      committed = await this.repository.replace(id, userId, previous.coverR2Key, {
        coverR2Key: key,
        coverMimeType: image.mimeType,
        coverSizeBytes: image.bytes.byteLength,
      });
    } catch {
      let current: IdeaRecord | null;
      try {
        current = await this.repository.find(id, userId);
      } catch {
        throw this.failure(
          'COVER_SAVE_UNCERTAIN',
          'Cover save could not be confirmed. Reload this idea before retrying.',
        );
      }
      if (current?.coverR2Key === key) committed = true;
      else {
        await this.deleteObject(storage, key).catch(() => {
          console.error('[Idea cover]', { code: 'COVER_ROLLBACK_FAILED' });
        });
        throw this.failure('COVER_SAVE_FAILED', 'Cover metadata could not be saved. Please retry.');
      }
    }
    if (!committed) {
      await this.deleteObject(storage, key).catch(() => {
        console.error('[Idea cover]', { code: 'COVER_ROLLBACK_FAILED' });
      });
      throw new AppError(
        'CONFLICT',
        'This idea changed during upload. Reload it before trying again.',
        409,
      );
    }
    if (previous.coverR2Key) {
      try {
        await this.deleteObject(storage, previous.coverR2Key);
      } catch {
        // Restore the old reference only if another cover write has not superseded ours.
        try {
          await this.repository.replace(id, userId, key, {
            coverR2Key: previous.coverR2Key,
            coverMimeType: previous.coverMimeType,
            coverSizeBytes: previous.coverSizeBytes,
          });
          const current = await this.repository.find(id, userId);
          if (current?.coverR2Key !== key) await this.deleteObject(storage, key);
        } catch {
          console.error('[Idea cover]', { code: 'COVER_ROLLBACK_FAILED' });
        }
        throw this.failure(
          'COVER_CLEANUP_FAILED',
          'Previous cover cleanup failed. Reload this idea and retry; your text remains saved.',
        );
      }
    }
  }
  async remove(id: string, userId: string) {
    const idea = await this.get(id, userId);
    if (!idea.coverR2Key) return;
    const key = await this.safeKey(idea);
    try {
      await this.deleteObject(this.storage(), key);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw this.failure(
        'COVER_DELETE_FAILED',
        'Cover cleanup failed. Please retry; the idea has been kept.',
      );
    }
    try {
      if (
        !(await this.repository.replace(id, userId, key, {
          coverR2Key: null,
          coverMimeType: null,
          coverSizeBytes: null,
        }))
      )
        throw new AppError('CONFLICT', 'The cover changed. Reload this idea before retrying.', 409);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw this.failure(
        'COVER_SAVE_FAILED',
        'Cover bytes were removed, but metadata cleanup needs a retry.',
      );
    }
  }
  async read(id: string, userId: string, head: boolean) {
    const idea = await this.get(id, userId);
    if (!idea.coverR2Key) throw new NotFoundError('Cover not found.');
    const key = await this.safeKey(idea);
    try {
      const storage = this.storage();
      const object = head ? await storage.head(key) : await storage.read(key);
      if (!object)
        throw new NotFoundError('Cover is unavailable. Upload another image or remove the cover.');
      if (
        object.size !== idea.coverSizeBytes ||
        !['image/png', 'image/jpeg', 'image/webp'].includes(idea.coverMimeType ?? '')
      )
        throw new AppError('CONFLICT', 'Cover metadata needs review.', 409);
      return new Response(head ? null : (object as R2ObjectBody).body, {
        headers: fileHeaders('idea-cover', idea.coverMimeType!, object.size, false),
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw this.failure(
        'COVER_READ_FAILED',
        'Cover is temporarily unavailable. Your text is still accessible.',
      );
    }
  }
}
