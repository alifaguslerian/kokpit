import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const quotes = sqliteTable(
  'quotes',
  {
    id: text('id').primaryKey(),
    content: text('content').notNull(),
    mood: text('mood').notNull(),
    language: text('language').notNull(),
    sourceType: text('source_type').notNull(),
    author: text('author'),
    sourceUrl: text('source_url'),
    contentHash: text('content_hash').notNull().unique(),
    isActive: integer('is_active').notNull().default(1),
    createdAt: text('created_at').notNull(),
    lastShownAt: text('last_shown_at'),
    showCount: integer('show_count').notNull().default(0),
  },
  (table) => [
    check('quotes_language_check', sql`language IN ('en', 'id')`),
    index('quotes_rotation_idx').on(table.isActive, table.lastShownAt, table.showCount),
    index('quotes_mood_idx').on(table.mood, table.isActive),
  ],
);
