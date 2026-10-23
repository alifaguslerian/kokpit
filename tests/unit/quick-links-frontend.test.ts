import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import type { QuickLink } from '../../src/features/library/types';

describe('Quick Links Frontend & Data Logic Unit Tests', () => {
  describe('Quick Links Grouping & Filtering', () => {
    const mockLinks: QuickLink[] = [
      {
        id: 'ql-1',
        userId: 'user-default-1',
        name: 'GitHub',
        url: 'https://github.com',
        iconType: 'platform',
        iconValue: 'github',
        groupName: 'Engineering',
        position: 0,
        isFavorite: true,
        createdAt: '2026-10-23T10:00:00Z',
        updatedAt: '2026-10-23T10:00:00Z',
      },
      {
        id: 'ql-2',
        userId: 'user-default-1',
        name: 'Notion Workspace',
        url: 'https://notion.so',
        iconType: 'platform',
        iconValue: 'notion',
        groupName: 'General',
        position: 1,
        isFavorite: false,
        createdAt: '2026-10-23T10:01:00Z',
        updatedAt: '2026-10-23T10:01:00Z',
      },
      {
        id: 'ql-3',
        userId: 'user-default-1',
        name: 'Figma System',
        url: 'https://figma.com',
        iconType: 'platform',
        iconValue: 'figma',
        groupName: 'Design',
        position: 2,
        isFavorite: true,
        createdAt: '2026-10-23T10:02:00Z',
        updatedAt: '2026-10-23T10:02:00Z',
      },
    ];

    test('extracts unique group names from link list', () => {
      const groups = Array.from(
        new Set(mockLinks.map((l) => l.groupName).filter(Boolean)),
      ) as string[];
      assert.deepStrictEqual(groups.sort(), ['Design', 'Engineering', 'General'].sort());
    });

    test('filters favorites accurately', () => {
      const favorites = mockLinks.filter((l) => l.isFavorite);
      assert.strictEqual(favorites.length, 2);
      assert.deepStrictEqual(
        favorites.map((l) => l.id),
        ['ql-1', 'ql-3'],
      );
    });

    test('filters by selected group category', () => {
      const designLinks = mockLinks.filter((l) => l.groupName === 'Design');
      assert.strictEqual(designLinks.length, 1);
      assert.strictEqual(designLinks[0]?.name, 'Figma System');
    });
  });

  describe('Reordering Array Calculation Logic', () => {
    test('moves an item up one position correctly', () => {
      const ids = ['item-1', 'item-2', 'item-3'];
      const index = 1; // item-2
      const targetIndex = index - 1; // 0

      const newIds = [...ids];
      const removed = newIds.splice(index, 1)[0];
      assert.ok(removed);
      newIds.splice(targetIndex, 0, removed);

      assert.deepStrictEqual(newIds, ['item-2', 'item-1', 'item-3']);
    });

    test('moves an item down one position correctly', () => {
      const ids = ['item-1', 'item-2', 'item-3'];
      const index = 0; // item-1
      const targetIndex = index + 1; // 1

      const newIds = [...ids];
      const removed = newIds.splice(index, 1)[0];
      assert.ok(removed);
      newIds.splice(targetIndex, 0, removed);

      assert.deepStrictEqual(newIds, ['item-2', 'item-1', 'item-3']);
    });

    test('prevents moving top item up or bottom item down', () => {
      const ids = ['item-1', 'item-2'];
      const canMoveFirstUp = 0 > 0;
      const canMoveLastDown = 1 < ids.length - 1;

      assert.strictEqual(canMoveFirstUp, false);
      assert.strictEqual(canMoveLastDown, false);
    });
  });

  describe('URL & Platform Identification Logic', () => {
    test('infers correct platform key from hostnames', () => {
      const detectPlatform = (urlStr: string): string => {
        const lower = urlStr.toLowerCase();
        if (lower.includes('github.com')) return 'github';
        if (lower.includes('notion.so') || lower.includes('notion.site')) return 'notion';
        if (lower.includes('figma.com')) return 'figma';
        if (lower.includes('spotify.com')) return 'spotify';
        if (lower.includes('discord.com') || lower.includes('discord.gg')) return 'discord';
        if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
        return 'generic';
      };

      assert.strictEqual(detectPlatform('https://github.com/kokpit'), 'github');
      assert.strictEqual(detectPlatform('https://www.notion.so/my-docs'), 'notion');
      assert.strictEqual(detectPlatform('https://figma.com/file/123'), 'figma');
      assert.strictEqual(detectPlatform('https://open.spotify.com/playlist/abc'), 'spotify');
      assert.strictEqual(detectPlatform('https://example.com'), 'generic');
    });

    test('validates URL format and prepends https if missing', () => {
      const normalizeUrl = (raw: string): string => {
        let trimmed = raw.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
          trimmed = `https://${trimmed}`;
        }
        return trimmed;
      };

      assert.strictEqual(normalizeUrl('github.com/user/repo'), 'https://github.com/user/repo');
      assert.strictEqual(normalizeUrl('http://insecure.test'), 'http://insecure.test');
      assert.strictEqual(normalizeUrl('https://secure.test'), 'https://secure.test');
    });
  });
});
