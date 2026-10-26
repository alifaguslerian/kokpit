export function fileRange(
  header: string | null,
  size: number,
): { offset: number; length: number } | null | false {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return false;
  if (!match[1]) {
    const suffix = Number(match[2]);
    return Number.isSafeInteger(suffix) && suffix > 0
      ? { offset: Math.max(0, size - suffix), length: Math.min(size, suffix) }
      : false;
  }
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start)
    return false;
  return { offset: start, length: Math.min(end, size - 1) - start + 1 };
}

export function fileHeaders(filename: string, mime: string, size: number, download: boolean) {
  const safe = filename.replace(/[^\w. -]/g, '_') || 'download';
  const inline =
    !download &&
    ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(mime);
  let encoded = safe;
  try {
    encoded = encodeURIComponent(filename).replace(
      /[!'()*]/g,
      (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  } catch {
    /* Fall back for malformed legacy Unicode filenames. */
  }
  return new Headers({
    'Content-Type': mime,
    'Content-Length': String(size),
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${safe}"; filename*=UTF-8''${encoded}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "sandbox; default-src 'none'",
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Accept-Ranges': 'bytes',
  });
}
