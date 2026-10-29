import { AppError, BadRequestError } from './errors';

export const MAX_IDEA_COVER_BYTES = 50 * 1024 * 1024;
export const MAX_IDEA_COVER_DIMENSION = 2048;
type Dimensions = { width: number; height: number };

function unsupported(): never {
  throw new AppError('UNSUPPORTED_FILE_TYPE', 'Choose a valid JPEG, PNG or WebP image.', 415);
}

function dimensions(width: number, height: number): Dimensions {
  if (
    width < 1 ||
    height < 1 ||
    width > MAX_IDEA_COVER_DIMENSION ||
    height > MAX_IDEA_COVER_DIMENSION
  ) {
    throw new BadRequestError('Cover images must be between 1 and 2,048 pixels per side.');
  }
  return { width, height };
}

function sizeLimit(size: number) {
  if (size > MAX_IDEA_COVER_BYTES) {
    throw new AppError('FILE_TOO_LARGE', 'Files must be 50 MB or smaller.', 413);
  }
}

function matches(bytes: Uint8Array, offset: number, expected: readonly number[]) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});

function crc32(bytes: Uint8Array, start: number, end: number) {
  let crc = 0xffffffff;
  for (let index = start; index < end; index++)
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]!) & 255]!;
  return (crc ^ 0xffffffff) >>> 0;
}

function pngDimensions(bytes: Uint8Array): Dimensions {
  if (!matches(bytes, 0, [137, 80, 78, 71, 13, 10, 26, 10])) unsupported();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  let result: Dimensions | undefined;
  let colorType = -1;
  let palette = false;
  let imageData = false;
  let dataEnded = false;
  while (offset + 12 <= bytes.length) {
    const size = view.getUint32(offset);
    const kind = ascii(bytes, offset + 4, 4);
    const end = offset + 12 + size;
    if (end > bytes.length || !/^[A-Za-z]{4}$/.test(kind) || kind[2] !== kind[2]!.toUpperCase())
      unsupported();
    if (crc32(bytes, offset + 4, end - 4) !== view.getUint32(end - 4)) unsupported();
    const data = offset + 8;
    if (!result) {
      if (kind !== 'IHDR' || size !== 13) unsupported();
      result = dimensions(view.getUint32(data), view.getUint32(data + 4));
      const depth = bytes[data + 8]!;
      colorType = bytes[data + 9]!;
      const depths: Record<number, readonly number[]> = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
      };
      if (
        !depths[colorType]?.includes(depth) ||
        bytes[data + 10] !== 0 ||
        bytes[data + 11] !== 0 ||
        bytes[data + 12]! > 1
      )
        unsupported();
    } else if (kind === 'IHDR') {
      unsupported();
    } else if (kind === 'PLTE') {
      if (
        palette ||
        imageData ||
        size === 0 ||
        size > 768 ||
        size % 3 !== 0 ||
        colorType === 0 ||
        colorType === 4
      )
        unsupported();
      palette = true;
    } else if (kind === 'IDAT') {
      if (dataEnded || (colorType === 3 && !palette)) unsupported();
      if (size > 0) imageData = true;
    } else if (kind === 'IEND') {
      if (size !== 0 || !imageData || end !== bytes.length) unsupported();
      return result;
    } else {
      if (kind[0] === kind[0]!.toUpperCase()) unsupported();
      if (imageData) dataEnded = true;
      if (kind === 'fcTL') {
        if (size !== 26) unsupported();
        const width = view.getUint32(data + 4);
        const height = view.getUint32(data + 8);
        if (
          width < 1 ||
          height < 1 ||
          view.getUint32(data + 12) + width > result.width ||
          view.getUint32(data + 16) + height > result.height
        )
          unsupported();
      }
    }
    offset = end;
  }
  unsupported();
}

function jpegDimensions(bytes: Uint8Array): Dimensions {
  if (!matches(bytes, 0, [255, 216])) unsupported();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  let result: Dimensions | undefined;
  let components: number[] = [];
  let scans = 0;
  while (offset < bytes.length) {
    if (bytes[offset++] !== 255) unsupported();
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9) {
      if (!result || scans === 0 || offset !== bytes.length) unsupported();
      return result;
    }
    if (
      marker === undefined ||
      marker === 0 ||
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7) ||
      offset + 2 > bytes.length
    )
      unsupported();
    const length = view.getUint16(offset);
    const end = offset + length;
    if (length < 2 || end > bytes.length) unsupported();
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      if (result || length < 11) unsupported();
      const count = bytes[offset + 7]!;
      if (
        count < 1 ||
        count > 4 ||
        length !== 8 + 3 * count ||
        ![8, 12, 16].includes(bytes[offset + 2]!)
      )
        unsupported();
      result = dimensions(view.getUint16(offset + 5), view.getUint16(offset + 3));
      components = Array.from({ length: count }, (_, index) => bytes[offset + 8 + index * 3]!);
      if (new Set(components).size !== count) unsupported();
    } else if (marker === 0xda) {
      if (!result || length < 8) unsupported();
      const count = bytes[offset + 2]!;
      if (count < 1 || count > components.length || length !== 6 + 2 * count) unsupported();
      const scanComponents = Array.from(
        { length: count },
        (_, index) => bytes[offset + 3 + index * 2]!,
      );
      if (
        new Set(scanComponents).size !== count ||
        scanComponents.some((id) => !components.includes(id))
      )
        unsupported();
      scans++;
      offset = end;
      let entropyBytes = 0;
      // Stuffed FF bytes and restart markers belong to the scan, including progressive scans.
      while (offset < bytes.length) {
        if (bytes[offset] !== 255) {
          entropyBytes++;
          offset++;
          continue;
        }
        const start = offset++;
        while (bytes[offset] === 255) offset++;
        const next = bytes[offset];
        if (next === 0 || (next !== undefined && next >= 0xd0 && next <= 0xd7)) {
          entropyBytes++;
          offset++;
        } else {
          offset = start;
          break;
        }
      }
      if (entropyBytes === 0) unsupported();
      continue;
    } else if (marker === 0xdc) {
      unsupported();
    }
    offset = end;
  }
  unsupported();
}

function little24(bytes: Uint8Array, offset: number) {
  return bytes[offset]! | (bytes[offset + 1]! << 8) | (bytes[offset + 2]! << 16);
}

function webpImageDimensions(
  bytes: Uint8Array,
  kind: string,
  start: number,
  size: number,
): Dimensions {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (kind === 'VP8 ') {
    if (size < 11 || (bytes[start]! & 1) !== 0 || !matches(bytes, start + 3, [157, 1, 42]))
      unsupported();
    const tag = little24(bytes, start);
    if (((tag >>> 1) & 7) > 3 || tag >>> 5 > size - 10) unsupported();
    return dimensions(
      view.getUint16(start + 6, true) & 0x3fff,
      view.getUint16(start + 8, true) & 0x3fff,
    );
  }
  if (kind === 'VP8L') {
    if (size < 6 || bytes[start] !== 0x2f) unsupported();
    const bits = view.getUint32(start + 1, true);
    if (bits >>> 29 !== 0) unsupported();
    return dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
  }
  unsupported();
}

function* webpChunks(bytes: Uint8Array, start: number, end: number) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = start;
  while (offset + 8 <= end) {
    const size = view.getUint32(offset + 4, true);
    const next = offset + 8 + size + (size % 2);
    if (next > end || (size % 2 && bytes[next - 1] !== 0)) unsupported();
    yield { kind: ascii(bytes, offset, 4), start: offset + 8, size };
    offset = next;
  }
  if (offset !== end) unsupported();
}

function webpDimensions(bytes: Uint8Array): Dimensions {
  if (bytes.length < 20 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP')
    unsupported();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(4, true) + 8 !== bytes.length) unsupported();
  const chunks = webpChunks(bytes, 12, bytes.length);
  let canvas: Dimensions | undefined;
  let image: Dimensions | undefined;
  let animated = false;
  let animationHeader = false;
  let frames = 0;
  for (const chunk of chunks) {
    const { kind, start, size } = chunk;
    if (kind === 'VP8X') {
      if (
        start !== 20 ||
        size !== 10 ||
        (bytes[start]! & 0xc1) !== 0 ||
        little24(bytes, start + 1) !== 0
      )
        unsupported();
      canvas = dimensions(little24(bytes, start + 4) + 1, little24(bytes, start + 7) + 1);
      animated = (bytes[start]! & 2) !== 0;
    } else if (kind === 'VP8 ' || kind === 'VP8L') {
      if (image || animated) unsupported();
      image = webpImageDimensions(bytes, kind, start, size);
      if (canvas && (image.width !== canvas.width || image.height !== canvas.height)) unsupported();
    } else if (kind === 'ANIM') {
      if (!animated || animationHeader || frames > 0 || size !== 6) unsupported();
      animationHeader = true;
    } else if (kind === 'ANMF') {
      if (
        !canvas ||
        !animated ||
        !animationHeader ||
        size < 24 ||
        (bytes[start + 15]! & 0xfc) !== 0
      )
        unsupported();
      const width = little24(bytes, start + 6) + 1;
      const height = little24(bytes, start + 9) + 1;
      if (
        little24(bytes, start) * 2 + width > canvas.width ||
        little24(bytes, start + 3) * 2 + height > canvas.height
      )
        unsupported();
      const frameImages = webpChunks(bytes, start + 16, start + size);
      let frame: Dimensions | undefined;
      for (const nested of frameImages) {
        if (nested.kind === 'ALPH') {
          if (frame || nested.size < 1) unsupported();
        } else if (nested.kind === 'VP8 ' || nested.kind === 'VP8L') {
          if (frame) unsupported();
          frame = webpImageDimensions(bytes, nested.kind, nested.start, nested.size);
        } else unsupported();
      }
      if (!frame || frame.width !== width || frame.height !== height) unsupported();
      frames++;
    } else if (kind === 'ALPH' && (!canvas || animated || image || size < 1)) {
      unsupported();
    }
  }
  if (animated) {
    if (!canvas || !animationHeader || frames === 0) unsupported();
    return canvas;
  }
  if (!image) unsupported();
  return canvas ?? image;
}

export async function readIdeaCover(
  body: ReadableStream<Uint8Array> | null,
  suppliedMime: string,
  declaredSize?: number,
): Promise<{ bytes: Uint8Array; mimeType: string; width: number; height: number }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(suppliedMime)) unsupported();
  if (declaredSize !== undefined) {
    sizeLimit(declaredSize);
    if (!Number.isSafeInteger(declaredSize) || declaredSize < 1)
      throw new BadRequestError('A nonempty file with a valid size is required.');
  }
  if (!body) throw new BadRequestError('A nonempty cover image is required.');
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  const declaredBytes = declaredSize === undefined ? null : new Uint8Array(declaredSize);
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      sizeLimit(size);
      if (declaredSize !== undefined && size > declaredSize)
        throw new BadRequestError('File size does not match the declared size.');
      if (declaredBytes) declaredBytes.set(next.value, size - next.value.byteLength);
      else if (next.value.byteLength > 0) chunks.push(next.value);
    }
    if (size === 0) throw new BadRequestError('A nonempty cover image is required.');
    if (declaredSize !== undefined && size !== declaredSize)
      throw new BadRequestError('File size does not match the declared size.');
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = declaredBytes ?? new Uint8Array(size);
  if (!declaredBytes) {
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
  }
  const result =
    suppliedMime === 'image/png'
      ? pngDimensions(bytes)
      : suppliedMime === 'image/jpeg'
        ? jpegDimensions(bytes)
        : webpDimensions(bytes);
  return { bytes, mimeType: suppliedMime, ...result };
}
