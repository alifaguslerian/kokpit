// Node tests emulate the stream contract; the native runtime is checked separately.
if (typeof FixedLengthStream === 'undefined') {
  Object.defineProperty(globalThis, 'FixedLengthStream', {
    configurable: true,
    value: class extends TransformStream<Uint8Array, Uint8Array> {
      constructor(length: number) {
        let count = 0;
        super({
          transform(chunk, controller) {
            count += chunk.byteLength;
            if (count > length) throw new Error('Fixed stream exceeded length.');
            controller.enqueue(chunk);
          },
          flush() {
            if (count !== length) throw new Error('Fixed stream incomplete.');
          },
        });
      }
    },
  });
}

export function createTestR2() {
  const objects = new Map<string, { bytes: Uint8Array; type: string }>();
  const calls: Array<{ operation: string; key: string }> = [];
  const failures = { put: false, get: false, delete: false };
  const object = (key: string, value: { bytes: Uint8Array; type: string }) => ({
    key,
    version: 'test-version',
    size: value.bytes.length,
    etag: 'test-etag',
    httpEtag: '"test-etag"',
    uploaded: new Date(),
    checksums: {},
    storageClass: 'Standard',
    httpMetadata: { contentType: value.type },
    writeHttpMetadata(headers: Headers) {
      headers.set('Content-Type', value.type);
    },
  });
  const bucket = {
    async put(
      key: string,
      body: ReadableStream<Uint8Array>,
      options?: { httpMetadata?: { contentType?: string } },
    ) {
      calls.push({ operation: 'put', key });
      if (failures.put) throw new Error('private provider details');
      const bytes = new Uint8Array(await new Response(body).arrayBuffer());
      const value = {
        bytes,
        type: options?.httpMetadata?.contentType ?? 'application/octet-stream',
      };
      objects.set(key, value);
      return object(key, value);
    },
    async head(key: string) {
      calls.push({ operation: 'head', key });
      if (failures.get) throw new Error('private provider details');
      const value = objects.get(key);
      return value ? object(key, value) : null;
    },
    async get(key: string, options?: { range?: { offset: number; length: number } }) {
      calls.push({ operation: 'get', key });
      if (failures.get) throw new Error('private provider details');
      const value = objects.get(key);
      if (!value) return null;
      const bytes = options?.range
        ? value.bytes.slice(options.range.offset, options.range.offset + options.range.length)
        : value.bytes;
      return { ...object(key, value), body: new Blob([new Uint8Array(bytes)]).stream() };
    },
    async delete(key: string) {
      calls.push({ operation: 'delete', key });
      if (failures.delete) throw new Error('private provider details');
      objects.delete(key);
    },
  };
  return { bucket: bucket as unknown as R2Bucket, objects, calls, failures };
}
