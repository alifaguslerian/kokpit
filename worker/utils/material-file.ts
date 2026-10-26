import { AppError, BadRequestError } from './errors';

export const MAX_MATERIAL_BYTES = 50 * 1024 * 1024;
type Kind = 'pdf' | 'png' | 'jpeg' | 'webp' | 'gif' | 'zip' | 'ole' | 'text';
interface FileRule {
  kind: Kind;
  mime: string;
  aliases?: string[];
}
const rules: Record<string, FileRule> = {
  pdf: { kind: 'pdf', mime: 'application/pdf' },
  png: { kind: 'png', mime: 'image/png' },
  jpg: { kind: 'jpeg', mime: 'image/jpeg' },
  jpeg: { kind: 'jpeg', mime: 'image/jpeg' },
  webp: { kind: 'webp', mime: 'image/webp' },
  gif: { kind: 'gif', mime: 'image/gif' },
  docx: {
    kind: 'zip',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  pptx: {
    kind: 'zip',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  xlsx: { kind: 'zip', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  doc: { kind: 'ole', mime: 'application/msword' },
  ppt: { kind: 'ole', mime: 'application/vnd.ms-powerpoint' },
  xls: { kind: 'ole', mime: 'application/vnd.ms-excel' },
};
for (const ext of [
  'txt',
  'md',
  'csv',
  'json',
  'xml',
  'yaml',
  'yml',
  'toml',
  'log',
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'css',
  'html',
  'svg',
  'sql',
  'sh',
  'rs',
  'go',
]) {
  rules[ext] = {
    kind: 'text',
    mime: 'text/plain',
    aliases: [
      'text/markdown',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml',
      'application/yaml',
      'text/yaml',
      'text/javascript',
      'application/javascript',
      'application/typescript',
      'text/typescript',
      'text/x-python',
      'text/x-java-source',
      'text/x-c',
      'text/css',
      'text/html',
      'image/svg+xml',
      'application/sql',
      'application/x-sh',
    ],
  };
}

function unsupported(): never {
  throw new AppError(
    'UNSUPPORTED_FILE_TYPE',
    'This file type or its contents are not supported.',
    415,
  );
}
function sizeError(actual: number, declared: number) {
  if (actual > MAX_MATERIAL_BYTES)
    throw new AppError('FILE_TOO_LARGE', 'Files must be 50 MB or smaller.', 413);
  if (actual > declared) throw new BadRequestError('File size does not match the declared size.');
}

export async function prepareMaterialStream(
  body: ReadableStream<Uint8Array> | null,
  filename: string,
  declaredSize: number,
  contentType: string,
) {
  sizeError(declaredSize, declaredSize);
  if (!body || declaredSize < 1) throw new BadRequestError('A nonempty file is required.');
  const rule = rules[filename.split('.').at(-1)?.toLowerCase() ?? ''];
  const supplied = contentType.split(';')[0]?.trim().toLowerCase() || 'application/octet-stream';
  if (!rule || ![rule.mime, 'application/octet-stream', ...(rule.aliases ?? [])].includes(supplied))
    unsupported();
  const reader = body.getReader();
  const initial: Uint8Array[] = [];
  let initialSize = 0;
  try {
    while (initialSize < 12) {
      const chunk = await reader.read();
      if (chunk.done) break;
      initial.push(chunk.value);
      initialSize += chunk.value.byteLength;
      sizeError(initialSize, declaredSize);
    }
    if (initialSize === 0) throw new BadRequestError('A nonempty file is required.');
    const prefix = new Uint8Array(Math.min(initialSize, 12));
    let offset = 0;
    for (const chunk of initial) {
      const slice = chunk.subarray(0, prefix.length - offset);
      prefix.set(slice, offset);
      offset += slice.length;
    }
    const matches = (...bytes: number[]) => bytes.every((value, index) => prefix[index] === value);
    const signature = new TextDecoder().decode(prefix);
    const valid =
      rule.kind === 'text' ||
      (rule.kind === 'pdf' && signature.startsWith('%PDF-')) ||
      (rule.kind === 'png' && matches(137, 80, 78, 71, 13, 10, 26, 10)) ||
      (rule.kind === 'jpeg' && matches(255, 216, 255)) ||
      (rule.kind === 'webp' && signature.startsWith('RIFF') && signature.slice(8, 12) === 'WEBP') ||
      (rule.kind === 'gif' && /^GIF8[79]a/.test(signature)) ||
      (rule.kind === 'zip' && matches(80, 75, 3, 4)) ||
      (rule.kind === 'ole' && matches(208, 207, 17, 224, 161, 177, 26, 225));
    if (!valid) unsupported();
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }
  let total = 0;
  let initialIndex = 0;
  const decoder = rule.kind === 'text' ? new TextDecoder('utf-8', { fatal: true }) : null;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next =
          initialIndex < initial.length
            ? { done: false as const, value: initial[initialIndex++]! }
            : await reader.read();
        if (next.done) {
          if (total !== declaredSize)
            throw new BadRequestError('File size does not match the declared size.');
          if (decoder) {
            try {
              decoder.decode();
            } catch {
              unsupported();
            }
          }
          controller.close();
          reader.releaseLock();
          return;
        }
        total += next.value.byteLength;
        sizeError(total, declaredSize);
        if (decoder) {
          try {
            if (next.value.includes(0)) unsupported();
            decoder.decode(next.value, { stream: true });
          } catch {
            unsupported();
          }
        }
        controller.enqueue(next.value);
      } catch (error) {
        controller.error(error);
        await reader.cancel().catch(() => {});
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return { stream, mimeType: rule.mime };
}
