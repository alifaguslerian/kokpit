import type { CollegeRepository } from '../db/repositories/college.repository';
import type {
  MaterialContext,
  MaterialCursor,
  MaterialsRepository,
} from '../db/repositories/materials.repository';
import { AppError, BadRequestError, NotFoundError } from '../utils/errors';
import { R2Storage } from '../providers/storage/r2.provider';
import { prepareMaterialStream } from '../utils/material-file';
import { fileHeaders, fileRange } from '../utils/file-response';

export function materialResponse(record: MaterialContext) {
  return {
    id: record.id,
    userId: record.userId,
    weekId: record.weekId,
    type: record.type,
    title: record.title,
    originalFilename: record.originalFilename,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    externalUrl: record.externalUrl,
    position: record.position,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastOpenedAt: record.lastOpenedAt,
    courseId: record.courseId,
    courseName: record.courseName,
    semesterId: record.semesterId,
    weekNumber: record.weekNumber,
    fileUrl: record.type === 'file' ? `/api/files/${encodeURIComponent(record.id)}` : null,
  };
}

export class MaterialsService {
  constructor(
    private readonly repository: MaterialsRepository,
    private readonly college: CollegeRepository,
    private readonly bucket?: R2Bucket,
  ) {}

  private storage() {
    if (!this.bucket)
      throw new AppError('STORAGE_UNAVAILABLE', 'File storage is unavailable.', 503);
    return new R2Storage(this.bucket);
  }

  async upload(
    weekId: string,
    userId: string,
    input: { filename: string; sizeBytes: number; title?: string | undefined },
    body: ReadableStream<Uint8Array> | null,
    contentType: string,
  ) {
    if (!(await this.college.findWeek(weekId, userId))) throw new NotFoundError('Week not found.');
    const storage = this.storage();
    const prepared = await prepareMaterialStream(
      body,
      input.filename,
      input.sizeBytes,
      contentType,
    );
    const id = crypto.randomUUID();
    const key = `users/${encodeURIComponent(userId)}/college/${id}/${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    try {
      await storage.upload(key, prepared.stream, input.sizeBytes, prepared.mimeType);
      const row = await this.repository.create({
        id,
        userId,
        weekId,
        type: 'file',
        title: input.title ?? input.filename,
        originalFilename: input.filename,
        mimeType: prepared.mimeType,
        sizeBytes: input.sizeBytes,
        r2Key: key,
        createdAt: now,
        updatedAt: now,
      });
      if (!row) throw new NotFoundError('Week not found.');
      return materialResponse(row);
    } catch (error) {
      // A transport error can follow a committed D1 write. Never delete its live bytes.
      let knownAbsent = false;
      try {
        const persisted = await this.repository.find(id, userId);
        if (persisted?.r2Key === key) return materialResponse(persisted);
        knownAbsent = !persisted && !(await this.repository.hasStoredReference(id, userId, key));
        if (!knownAbsent)
          console.error('[Material upload recovery]', {
            code: 'METADATA_RECOVERY_REQUIRED',
            materialId: id,
          });
      } catch {
        console.error('[Material upload recovery]', {
          code: 'METADATA_RECOVERY_REQUIRED',
          materialId: id,
        });
      }
      if (knownAbsent) {
        try {
          await storage.delete(key);
        } catch {
          console.error('[Material upload cleanup]', {
            code: 'STORAGE_CLEANUP_REQUIRED',
            materialId: id,
          });
        }
      }
      if (error instanceof AppError) throw error;
      console.error('[Material upload failed]', { code: 'MATERIAL_UPLOAD_FAILED', materialId: id });
      throw new AppError('MATERIAL_UPLOAD_FAILED', 'Could not store this file. Try again.', 503);
    }
  }

  async file(id: string, userId: string, request: Request, download: boolean) {
    const material = await this.get(id, userId);
    if (
      material.type !== 'file' ||
      !material.r2Key ||
      !material.sizeBytes ||
      !material.mimeType ||
      !material.originalFilename
    )
      throw new NotFoundError('File not found.');
    const range =
      request.method === 'HEAD'
        ? null
        : fileRange(request.headers.get('Range'), material.sizeBytes);
    const headers = fileHeaders(
      material.originalFilename,
      material.mimeType,
      material.sizeBytes,
      download,
    );
    if (range === false) {
      headers.delete('Content-Length');
      headers.set('Content-Range', `bytes */${material.sizeBytes}`);
      headers.set('Content-Type', 'application/json');
      return Response.json(
        {
          error: {
            code: 'RANGE_NOT_SATISFIABLE',
            message: 'The requested file range is not available.',
          },
        },
        { status: 416, headers },
      );
    }
    const storage = this.storage();
    try {
      const object =
        request.method === 'HEAD'
          ? await storage.head(material.r2Key)
          : await storage.read(material.r2Key, range ?? undefined);
      if (!object) throw new NotFoundError('File not found.');
      if (object.size !== material.sizeBytes) throw new Error('File metadata mismatch.');
      headers.set('ETag', object.httpEtag);
      if (range) {
        headers.set(
          'Content-Range',
          `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`,
        );
        headers.set('Content-Length', String(range.length));
      }
      const responseBody =
        'body' in object && object.body instanceof ReadableStream ? object.body : null;
      if (request.method !== 'HEAD' && !responseBody) throw new Error('File body unavailable.');
      return new Response(responseBody, { status: range ? 206 : 200, headers });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[Material file read]', { code: 'FILE_READ_FAILED', materialId: id });
      throw new AppError('FILE_READ_FAILED', 'Could not read this file. Try again.', 503);
    }
  }

  async get(id: string, userId: string) {
    const row = await this.repository.find(id, userId);
    if (!row) throw new NotFoundError('Material not found.');
    return row;
  }

  async listWeek(weekId: string, userId: string, limit: number, offset: number) {
    if (!(await this.college.findWeek(weekId, userId))) throw new NotFoundError('Week not found.');
    return (await this.repository.listWeek(weekId, userId, limit, offset)).map(materialResponse);
  }

  async listSemester(semesterId: string, userId: string, limit: number, cursor?: MaterialCursor) {
    if (!(await this.college.findSemester(semesterId, userId)))
      throw new NotFoundError('Semester not found.');
    const rows = await this.repository.listSemester(semesterId, userId, limit, cursor);
    const page = rows.slice(0, limit);
    const last = page.at(-1);
    return {
      data: page.map(materialResponse),
      nextCursor:
        rows.length > limit && last
          ? btoa(JSON.stringify({ updatedAt: last.updatedAt, id: last.id }))
          : null,
    };
  }

  async createLink(weekId: string, userId: string, input: { title: string; externalUrl: string }) {
    if (!(await this.college.findWeek(weekId, userId))) throw new NotFoundError('Week not found.');
    const now = new Date().toISOString();
    const row = await this.repository.create({
      id: crypto.randomUUID(),
      userId,
      weekId,
      type: 'link',
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    if (!row) throw new NotFoundError('Week not found.');
    return materialResponse(row);
  }

  async update(
    id: string,
    userId: string,
    input: {
      title?: string | undefined;
      externalUrl?: string | undefined;
      weekId?: string | undefined;
    },
  ) {
    const current = await this.get(id, userId);
    if (input.externalUrl !== undefined && current.type !== 'link')
      throw new BadRequestError('Only link materials have a destination URL.');
    if (input.weekId && !(await this.college.findWeek(input.weekId, userId)))
      throw new NotFoundError('Week not found.');
    const row = await this.repository.update(id, userId, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!row) throw new NotFoundError('Material not found.');
    return materialResponse(row);
  }
}
