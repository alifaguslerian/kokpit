import { z } from 'zod';
import { AppError, BadRequestError } from './errors';
import { MAX_IDEA_COVER_BYTES } from './idea-cover';

// Only one file part is accepted. Streaming keeps multipart parsing from buffering another 50 MB copy.
export async function ideaCoverUpload(
  body: ReadableStream<Uint8Array> | null,
  contentType: string,
) {
  const match = /^multipart\/form-data;\s*boundary=(?:"([^"\r\n]{1,70})"|([^\s;]{1,70}))$/i.exec(
    contentType,
  );
  if (!body || !match) throw new BadRequestError('Send one image in a multipart file field.');
  const boundary = match[1] ?? match[2]!;
  if (!/^[\w'()+,./:=?-]+$/.test(boundary))
    throw new BadRequestError('Invalid multipart boundary.');
  const reader = body.getReader();
  const encoder = new TextEncoder();
  const opening = `--${boundary}\r\n`;
  const delimiter = encoder.encode(`\r\n--${boundary}`);
  let buffer = new Uint8Array(0);
  let received = 0;
  function append(bytes: Uint8Array) {
    received += bytes.byteLength;
    if (received > MAX_IDEA_COVER_BYTES + 64 * 1024)
      throw new AppError('FILE_TOO_LARGE', 'Files must be 50 MB or smaller.', 413);
    const joined = new Uint8Array(buffer.length + bytes.length);
    joined.set(buffer);
    joined.set(bytes, buffer.length);
    buffer = joined;
  }
  function locate(marker: Uint8Array) {
    outer: for (let index = 0; index <= buffer.length - marker.length; index++) {
      for (let offset = 0; offset < marker.length; offset++)
        if (buffer[index + offset] !== marker[offset]) continue outer;
      return index;
    }
    return -1;
  }
  let mimeType: string;
  try {
    const split = encoder.encode('\r\n\r\n');
    let headerEnd = -1;
    while ((headerEnd = locate(split)) < 0) {
      if (buffer.length > 8192) throw new BadRequestError('Image upload headers are too large.');
      const chunk = await reader.read();
      if (chunk.done) throw new BadRequestError('Incomplete multipart image.');
      append(chunk.value);
    }
    if (headerEnd > 8192) throw new BadRequestError('Image upload headers are too large.');
    const header = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, headerEnd));
    if (!header.startsWith(opening)) throw new BadRequestError('Invalid multipart image.');
    const fields = header.slice(opening.length).split('\r\n');
    const disposition = fields.find((value) => /^Content-Disposition:/i.test(value));
    const imageType = fields.find((value) => /^Content-Type:/i.test(value));
    if (fields.length !== 2 || !disposition || !imageType)
      throw new BadRequestError('Send one image file.');
    const file =
      /^Content-Disposition:\s*form-data;\s*name="file";\s*filename="([^"\r\n]*)"$/i.exec(
        disposition,
      );
    if (!file) throw new BadRequestError('Send exactly one image in the file field.');
    z.string()
      .min(1)
      .max(255)
      .refine(
        (value) =>
          !value.includes('/') &&
          !value.includes('\\') &&
          [...value].every((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127),
        'Invalid image filename.',
      )
      .parse(file[1]);
    mimeType = z
      .string()
      .min(1)
      .max(128)
      .parse(imageType.slice(imageType.indexOf(':') + 1).trim());
    buffer = buffer.slice(headerEnd + split.length);
  } catch (error) {
    await reader.cancel().catch(() => {});
    if (error instanceof TypeError) throw new BadRequestError('Invalid image upload headers.');
    throw error;
  }
  let finished = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (!finished) {
          const index = locate(delimiter);
          if (index >= 0) {
            const bytes = buffer.slice(0, index);
            buffer = buffer.slice(index + delimiter.length);
            while (buffer.length <= 4) {
              const chunk = await reader.read();
              if (chunk.done) break;
              append(chunk.value);
            }
            const ending = new TextDecoder().decode(buffer);
            if (ending !== '--' && ending !== '--\r\n')
              throw new BadRequestError('Send exactly one complete image file.');
            finished = true;
            if (bytes.length) controller.enqueue(bytes);
            controller.close();
            await reader.cancel();
            return;
          }
          if (buffer.length > delimiter.length) {
            const length = buffer.length - delimiter.length;
            controller.enqueue(buffer.slice(0, length));
            buffer = buffer.slice(length);
            return;
          }
          const chunk = await reader.read();
          if (chunk.done) throw new BadRequestError('Incomplete multipart image.');
          append(chunk.value);
        }
      } catch (error) {
        finished = true;
        await reader.cancel().catch(() => {});
        controller.error(error);
      }
    },
    async cancel(reason) {
      finished = true;
      await reader.cancel(reason);
    },
  });
  return { body: stream, mimeType };
}
