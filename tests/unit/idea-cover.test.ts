import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { MAX_IDEA_COVER_BYTES, readIdeaCover } from '../../worker/utils/idea-cover';
import { AppError } from '../../worker/utils/errors';

// Locally encoded 1px images include alpha, baseline/progressive JPEG and both WebP encodings.
const fixtures = {
  png: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMQkdOoAAABdwDT8q1/CgAAAABJRU5ErkJggg==',
  jpeg: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDxuiiitjI//9k=',
  progressive:
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wgARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/9oADAMBAAIQAxAAAAGNDH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAn//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/An//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IX//2gAMAwEAAgADAAAAEAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2Q==',
  webp: 'UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAAeFZQOCAiAAAAcAEAnQEqAQABAAFAJiWUAnQBQAAA/vt7CLUSVLyfojAAAA==',
  lossless: 'UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAEAdQj1IUpXiBiOh/AAA=',
};
const decode = (value: string) => new Uint8Array(Buffer.from(value, 'base64'));
function stream(bytes: Uint8Array, chunkSize = bytes.length || 1) {
  let offset = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset === bytes.length) controller.close();
      else {
        controller.enqueue(bytes.subarray(offset, offset + chunkSize));
        offset = Math.min(offset + chunkSize, bytes.length);
      }
    },
  });
}
function errorCode(code: string, status: number) {
  return (error: unknown) =>
    error instanceof AppError && error.code === code && error.status === status;
}
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(kind: string, data: Uint8Array) {
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length);
  result.write(kind, 4, 'ascii');
  result.set(data, 8);
  result.writeUInt32BE(crc32(result.subarray(4, -4)), result.length - 4);
  return result;
}
function png(width: number, height: number, data?: Uint8Array) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    decode(fixtures.png).subarray(0, 8),
    pngChunk('IHDR', header),
    pngChunk(
      'IDAT',
      data ?? deflateSync(Buffer.alloc(Math.max(1, height) * (1 + Math.max(1, width) * 4))),
    ),
    pngChunk('IEND', new Uint8Array()),
  ]);
}
function webpChunk(kind: string, data: Uint8Array) {
  const result = Buffer.alloc(8 + data.length + (data.length % 2));
  result.write(kind, 'ascii');
  result.writeUInt32LE(data.length, 4);
  result.set(data, 8);
  return result;
}
function riff(...chunks: Uint8Array[]) {
  const payload = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('RIFF');
  header.writeUInt32LE(payload.length + 4, 4);
  header.write('WEBP', 8);
  return Buffer.concat([header, payload]);
}

for (const [kind, mimeType] of [
  ['png', 'image/png'],
  ['jpeg', 'image/jpeg'],
  ['progressive', 'image/jpeg'],
  ['webp', 'image/webp'],
  ['lossless', 'image/webp'],
] as const) {
  test(`valid ${kind} bytes return their verified dimensions and canonical MIME`, async () => {
    const bytes = decode(fixtures[kind]);
    const result = await readIdeaCover(stream(bytes, 1), mimeType, bytes.length);
    assert.deepEqual(result, { bytes, mimeType, width: 1, height: 1 });
  });
}

test('the actual PNG dimensions accept 2048 on either side and reject larger or zero sides', async () => {
  const bytes = png(2048, 1);
  assert.equal((await readIdeaCover(stream(bytes), 'image/png')).width, 2048);
  const tall = png(1, 2048);
  assert.equal((await readIdeaCover(stream(tall), 'image/png')).height, 2048);
  for (const [width, height] of [
    [2049, 1],
    [1, 2049],
    [0, 1],
    [1, 0],
  ]) {
    await assert.rejects(
      () => readIdeaCover(stream(png(width!, height!)), 'image/png'),
      errorCode('BAD_REQUEST', 400),
    );
  }
});

test('SVG, HTML, wrong MIME and signature-only image impostors fail safely', async () => {
  for (const mime of ['image/svg+xml', 'text/html', 'application/octet-stream', 'image/jpg', '']) {
    await assert.rejects(
      () => readIdeaCover(stream(decode(fixtures.png)), mime),
      errorCode('UNSUPPORTED_FILE_TYPE', 415),
    );
  }
  for (const bytes of [
    new TextEncoder().encode('<svg></svg>'),
    new TextEncoder().encode('<html>cover</html>'),
    decode(fixtures.jpeg),
    decode(fixtures.png).subarray(0, 24),
  ]) {
    await assert.rejects(
      () => readIdeaCover(stream(bytes), 'image/png'),
      errorCode('UNSUPPORTED_FILE_TYPE', 415),
    );
  }
});

test('empty, missing and mismatched declared byte counts are rejected', async () => {
  await assert.rejects(() => readIdeaCover(null, 'image/png'), errorCode('BAD_REQUEST', 400));
  await assert.rejects(
    () => readIdeaCover(stream(new Uint8Array()), 'image/png'),
    errorCode('BAD_REQUEST', 400),
  );
  const bytes = decode(fixtures.png);
  for (const size of [0, -1, 1.5, NaN, bytes.length - 1, bytes.length + 1]) {
    await assert.rejects(
      () => readIdeaCover(stream(bytes), 'image/png', size),
      errorCode('BAD_REQUEST', 400),
    );
  }
});

test('declared overflow stops before reading and actual overflow cancels the stream immediately', async () => {
  let reads = 0;
  let cancelled = false;
  const body = () =>
    new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          reads++;
          controller.enqueue(new Uint8Array(MAX_IDEA_COVER_BYTES + 1));
        },
        cancel() {
          cancelled = true;
        },
      },
      { highWaterMark: 0 },
    );
  await assert.rejects(
    () => readIdeaCover(body(), 'image/png', MAX_IDEA_COVER_BYTES + 1),
    errorCode('FILE_TOO_LARGE', 413),
  );
  assert.equal(reads, 0);
  await assert.rejects(() => readIdeaCover(body(), 'image/png'), errorCode('FILE_TOO_LARGE', 413));
  assert.equal(reads, 1);
  assert.equal(cancelled, true);
});

test('the exact 50 MB ceiling accepts a complete PNG with bounded stream chunks', async () => {
  const original = decode(fixtures.png);
  const padding = pngChunk('paDd', new Uint8Array(MAX_IDEA_COVER_BYTES - original.length - 12));
  const bytes = Buffer.concat([original.subarray(0, 33), padding, original.subarray(33)]);
  const result = await readIdeaCover(stream(bytes, 64 * 1024), 'image/png', MAX_IDEA_COVER_BYTES);
  assert.equal(result.bytes.length, MAX_IDEA_COVER_BYTES);
  assert.equal(result.width, 1);
});

test('an overflow after many allowed chunks cancels as soon as the cumulative limit is exceeded', async () => {
  const chunk = new Uint8Array(64 * 1024);
  let reads = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        reads++;
        controller.enqueue(chunk);
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  await assert.rejects(() => readIdeaCover(body, 'image/png'), errorCode('FILE_TOO_LARGE', 413));
  assert.equal(reads, MAX_IDEA_COVER_BYTES / chunk.length + 1);
  assert.equal(cancelled, true);
});

test('late declared-size overflow cancels without waiting for an endless stream', async () => {
  let cancelled = false;
  let reads = 0;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        reads++;
        controller.enqueue(new Uint8Array(8));
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  await assert.rejects(() => readIdeaCover(body, 'image/png', 10), errorCode('BAD_REQUEST', 400));
  assert.equal(reads, 2);
  assert.equal(cancelled, true);
});

test('PNG rejects missing IEND, missing IDAT, corrupt chunk CRC and out-of-bounds chunk lengths', async () => {
  const valid = decode(fixtures.png);
  const corrupt = valid.slice();
  corrupt[29] = corrupt[29]! ^ 1;
  const huge = valid.slice();
  new DataView(huge.buffer).setUint32(33, 0x7fffffff);
  for (const bytes of [
    valid.subarray(0, -12),
    Buffer.concat([valid.subarray(0, 33), valid.subarray(-12)]),
    corrupt,
    huge,
    Buffer.concat([valid, new Uint8Array([1])]),
  ]) {
    await assert.rejects(
      () => readIdeaCover(stream(bytes), 'image/png'),
      errorCode('UNSUPPORTED_FILE_TYPE', 415),
    );
  }
});

test('JPEG verifies SOF dimensions, preserves non-ASCII EXIF and requires complete scan/end markers', async () => {
  const bytes = decode(fixtures.jpeg);
  const exif = Buffer.from([255, 225, 0, 8, 69, 120, 105, 102, 255, 254]);
  const withExif = Buffer.concat([bytes.subarray(0, 2), exif, bytes.subarray(2)]);
  assert.equal((await readIdeaCover(stream(withExif), 'image/jpeg')).width, 1);
  const sof = Buffer.from(bytes).indexOf(Buffer.from([255, 192]));
  const oversized = bytes.slice();
  new DataView(oversized.buffer).setUint16(sof + 7, 2049);
  await assert.rejects(
    () => readIdeaCover(stream(oversized), 'image/jpeg'),
    errorCode('BAD_REQUEST', 400),
  );
  const badLength = bytes.slice();
  new DataView(badLength.buffer).setUint16(4, 65535);
  for (const invalid of [
    bytes.subarray(0, -2),
    bytes.subarray(0, sof + 19),
    badLength,
    new Uint8Array([255, 216, 255, 217]),
  ]) {
    await assert.rejects(
      () => readIdeaCover(stream(invalid), 'image/jpeg'),
      errorCode('UNSUPPORTED_FILE_TYPE', 415),
    );
  }
});

test('WebP verifies RIFF/chunk sizes, dimensions and extended canvas consistency', async () => {
  const bytes = decode(fixtures.webp);
  const badLength = bytes.slice();
  new DataView(badLength.buffer).setUint32(16, 0xffffffff, true);
  const mismatchedCanvas = bytes.slice();
  mismatchedCanvas[24] = 1;
  const oversized = bytes.slice();
  oversized[24] = 0;
  oversized[25] = 8;
  await assert.rejects(
    () => readIdeaCover(stream(oversized), 'image/webp'),
    errorCode('BAD_REQUEST', 400),
  );
  for (const invalid of [
    bytes.subarray(0, -1),
    badLength,
    mismatchedCanvas,
    riff(webpChunk('VP8X', new Uint8Array(10))),
  ]) {
    await assert.rejects(
      () => readIdeaCover(stream(invalid), 'image/webp'),
      errorCode('UNSUPPORTED_FILE_TYPE', 415),
    );
  }
});

test('animated WebP frame dimensions and offsets must fit their validated canvas', async () => {
  const canvas = new Uint8Array(10);
  canvas[0] = 2;
  const frame = new Uint8Array(16);
  const image = decode(fixtures.lossless).subarray(12);
  const animated = () =>
    riff(
      webpChunk('VP8X', canvas),
      webpChunk('ANIM', new Uint8Array(6)),
      webpChunk('ANMF', Buffer.concat([frame, image])),
    );
  assert.equal((await readIdeaCover(stream(animated()), 'image/webp')).width, 1);
  frame[0] = 1;
  await assert.rejects(
    () => readIdeaCover(stream(animated()), 'image/webp'),
    errorCode('UNSUPPORTED_FILE_TYPE', 415),
  );
  frame[0] = 0;
  frame[6] = 1;
  await assert.rejects(
    () => readIdeaCover(stream(animated()), 'image/webp'),
    errorCode('UNSUPPORTED_FILE_TYPE', 415),
  );
});

test('every WebP image encoding checks dimensions and chunk padding', async () => {
  const lossless = decode(fixtures.lossless);
  const hugeLossless = lossless.slice();
  const view = new DataView(hugeLossless.buffer);
  view.setUint32(21, (view.getUint32(21, true) & ~0x3fff) | 2048, true);
  await assert.rejects(
    () => readIdeaCover(stream(hugeLossless), 'image/webp'),
    errorCode('BAD_REQUEST', 400),
  );
  const badPad = lossless.slice();
  badPad[badPad.length - 1] = 1;
  await assert.rejects(
    () => readIdeaCover(stream(badPad), 'image/webp'),
    errorCode('UNSUPPORTED_FILE_TYPE', 415),
  );
  const lossy = decode(fixtures.webp).slice(40);
  const tooWide = lossy.slice();
  new DataView(tooWide.buffer).setUint16(14, 2049, true);
  await assert.rejects(
    () => readIdeaCover(stream(riff(tooWide)), 'image/webp'),
    errorCode('BAD_REQUEST', 400),
  );
});
