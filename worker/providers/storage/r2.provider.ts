import { AppError } from '../../utils/errors';

export class R2Storage {
  constructor(private readonly bucket: R2Bucket) {}

  async upload(key: string, body: ReadableStream<Uint8Array>, size: number, mimeType: string) {
    // R2 needs a known-length stream; validation transforms otherwise lose that property.
    const fixed = new FixedLengthStream(size);
    const abort = new AbortController();
    const transfer = body.pipeTo(fixed.writable, { signal: abort.signal });
    const storing = Promise.resolve().then(() =>
      this.bucket.put(key, fixed.readable, {
        httpMetadata: { contentType: mimeType },
      }),
    );
    try {
      const [object] = await Promise.all([storing, transfer]);
      if (object.size !== size) throw new Error('Stored file size mismatch.');
    } catch (error) {
      abort.abort();
      await fixed.readable.cancel().catch(() => {});
      const [streamResult] = await Promise.allSettled([transfer, storing]);
      if (streamResult.status === 'rejected' && streamResult.reason instanceof AppError)
        throw streamResult.reason;
      throw error;
    }
  }

  read(key: string, range?: { offset: number; length: number }) {
    return this.bucket.get(key, range ? { range } : undefined);
  }
  head(key: string) {
    return this.bucket.head(key);
  }
  delete(key: string) {
    return this.bucket.delete(key);
  }
}
