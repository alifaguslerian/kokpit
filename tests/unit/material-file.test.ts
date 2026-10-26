import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_MATERIAL_BYTES, prepareMaterialStream } from '../../worker/utils/material-file';
import { fileHeaders, fileRange } from '../../worker/utils/file-response';
import { AppError } from '../../worker/utils/errors';

function generatedBody(size: number) {
  let remaining = size;
  const chunk = new Uint8Array(64 * 1024).fill(65);
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (!remaining) {
        controller.close();
        return;
      }
      const length = Math.min(remaining, chunk.length);
      controller.enqueue(chunk.subarray(0, length));
      remaining -= length;
    },
  });
}

test('a 50 MB material is validated incrementally at the allowed boundary', async () => {
  const { stream } = await prepareMaterialStream(
    generatedBody(MAX_MATERIAL_BYTES),
    'reading.txt',
    MAX_MATERIAL_BYTES,
    'text/plain',
  );
  const reader = stream.getReader();
  let total = 0;
  let largest = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    total += chunk.value.byteLength;
    largest = Math.max(largest, chunk.value.byteLength);
  }
  assert.equal(total, MAX_MATERIAL_BYTES);
  assert.ok(largest <= 64 * 1024);
});

test('late actual overflow is rejected even when the declared size is allowed', async () => {
  const { stream } = await prepareMaterialStream(
    generatedBody(MAX_MATERIAL_BYTES + 1),
    'reading.txt',
    MAX_MATERIAL_BYTES,
    'text/plain',
  );
  await assert.rejects(
    async () => {
      await stream.pipeTo(new WritableStream<Uint8Array>({ write() {} }));
    },
    (error: unknown) => error instanceof AppError && error.status === 413,
  );
});

test('declared oversize is rejected before consuming the file stream', async () => {
  let reads = 0;
  const body = new ReadableStream<Uint8Array>(
    {
      pull() {
        reads++;
      },
    },
    { highWaterMark: 0 },
  );
  await assert.rejects(
    () => prepareMaterialStream(body, 'reading.txt', MAX_MATERIAL_BYTES + 1, 'text/plain'),
    (error: unknown) => error instanceof AppError && error.status === 413,
  );
  assert.equal(reads, 0);
});

test('UTF-8 sequences may span chunks while late invalid text cancels safely', async () => {
  const bytes = new TextEncoder().encode('a'.repeat(12) + 'Catatan café');
  let index = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index === bytes.length) controller.close();
      else controller.enqueue(bytes.subarray(index, ++index));
    },
  });
  const prepared = await prepareMaterialStream(body, 'notes.md', bytes.length, 'text/markdown');
  assert.equal(await new Response(prepared.stream).text(), 'a'.repeat(12) + 'Catatan café');
  let cancelled = false;
  const invalid = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(12).fill(65));
      controller.enqueue(new Uint8Array([255]));
    },
    cancel() {
      cancelled = true;
    },
  });
  const bad = await prepareMaterialStream(invalid, 'notes.txt', 13, 'text/plain');
  await assert.rejects(
    () => new Response(bad.stream).arrayBuffer(),
    (error: unknown) => error instanceof AppError && error.status === 415,
  );
  assert.equal(cancelled, true);
});

test('file range parsing handles limits, suffixes and invalid or multiple ranges', () => {
  assert.equal(fileRange(null, 10), null);
  assert.deepEqual(fileRange('bytes=0-99', 10), { offset: 0, length: 10 });
  assert.deepEqual(fileRange('bytes=-99', 10), { offset: 0, length: 10 });
  for (const range of [
    'bytes=-0',
    'bytes=-',
    'bytes=9-2',
    'bytes=10-',
    'bytes=0-1,3-4',
    'bytes=999999999999999999999-',
    'items=0-1',
  ]) {
    assert.equal(fileRange(range, 10), false, range);
  }
});

test('legacy filenames cannot inject headers and active formats always download', () => {
  const headers = fileHeaders('catatan "秘密"\r\n.txt', 'text/html', 12, false);
  assert.match(headers.get('Content-Disposition') ?? '', /^attachment;/);
  assert.doesNotMatch(headers.get('Content-Disposition') ?? '', /[\r\n]/);
  assert.ok(headers.get('Content-Disposition')?.includes("filename*=UTF-8''"));
  assert.equal(headers.get('Cache-Control'), 'private, no-store');
  assert.match(headers.get('Content-Security-Policy') ?? '', /sandbox/);
});
