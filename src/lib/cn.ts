export type ClassValue =
  string | number | boolean | undefined | null | Record<string, boolean | undefined | null>;

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'number') {
      result.push(String(item));
    } else if (typeof item === 'object') {
      for (const [key, val] of Object.entries(item)) {
        if (val) result.push(key);
      }
    }
  }

  return result.join(' ');
}
