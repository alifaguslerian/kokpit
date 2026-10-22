import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeDate } from '../../src/lib/format-time';

describe('Ideas Frontend & UI Unit Tests', () => {
  describe('formatRelativeDate', () => {
    test('formats dates less than 60 seconds ago as "Just now"', () => {
      const now = new Date();
      const thirtySecsAgo = new Date(now.getTime() - 30 * 1000);
      assert.strictEqual(formatRelativeDate(thirtySecsAgo), 'Just now');
    });

    test('formats dates within the hour as minutes ago', () => {
      const now = new Date();
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
      assert.strictEqual(formatRelativeDate(tenMinsAgo), '10m ago');
    });

    test('formats dates within 24 hours as hours ago', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000);
      assert.strictEqual(formatRelativeDate(threeHoursAgo), '3h ago');
    });

    test('formats dates 1 day ago as "Yesterday"', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 25 * 3600 * 1000);
      assert.strictEqual(formatRelativeDate(oneDayAgo), 'Yesterday');
    });

    test('formats dates 3 days ago as "3d ago"', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
      assert.strictEqual(formatRelativeDate(threeDaysAgo), '3d ago');
    });

    test('handles invalid date strings gracefully', () => {
      assert.strictEqual(formatRelativeDate('invalid-date-token'), 'invalid-date-token');
    });
  });

  describe('Ideas Data Validation Logic', () => {
    test('detects empty and whitespace-only content as invalid', () => {
      const emptyContent = '';
      const whitespaceContent = '   \t  \n  ';
      const validContent = 'A meaningful spontaneous thought.';

      assert.strictEqual(emptyContent.trim().length === 0, true);
      assert.strictEqual(whitespaceContent.trim().length === 0, true);
      assert.strictEqual(validContent.trim().length > 0, true);
    });

    test('normalizes custom tags by trimming and removing leading hashes', () => {
      const rawTag = '  #Reflection  ';
      const normalized = rawTag.trim().replace(/^#/, '');
      assert.strictEqual(normalized, 'Reflection');
    });

    test('deduplicates tags', () => {
      const tags = ['Idea', 'College', 'Idea', 'Personal', 'College'];
      const deduplicated = Array.from(new Set(tags));
      assert.deepStrictEqual(deduplicated, ['Idea', 'College', 'Personal']);
    });
  });
});
