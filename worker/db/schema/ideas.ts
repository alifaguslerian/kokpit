import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/sqlite-core';
import { desc, sql } from 'drizzle-orm';
import { users } from './users';

export const ideaCollections = sqliteTable(
  'idea_collections',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    nameKey: text('name_key').notNull(),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('idea_collections_user_name_idx').on(table.userId, table.nameKey),
    index('idea_collections_user_position_idx').on(table.userId, table.position, table.id),
    check('idea_collections_position_check', sql`${table.position} >= 0`),
  ],
);

export const ideas = sqliteTable(
  'ideas',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    content: text('content').notNull(),
    isPinned: integer('is_pinned').notNull().default(0),
    isFavorite: integer('is_favorite').notNull().default(0),
    collectionId: text('collection_id').references(() => ideaCollections.id, {
      onDelete: 'set null',
    }),
    coverR2Key: text('cover_r2_key'),
    coverMimeType: text('cover_mime_type'),
    coverSizeBytes: integer('cover_size_bytes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('ideas_user_created_idx').on(table.userId, table.createdAt),
    index('ideas_user_pinned_idx').on(table.userId, table.isPinned, table.createdAt),
    index('ideas_user_favorite_idx').on(
      table.userId,
      table.isFavorite,
      desc(table.updatedAt),
      desc(table.id),
    ),
    index('ideas_user_collection_idx').on(
      table.userId,
      table.collectionId,
      table.isPinned,
      desc(table.createdAt),
      desc(table.id),
    ),
    check('ideas_favorite_check', sql`${table.isFavorite} IN (0, 1)`),
    check(
      'ideas_cover_check',
      sql`(${table.coverR2Key} IS NULL AND ${table.coverMimeType} IS NULL AND ${table.coverSizeBytes} IS NULL) OR (${table.coverR2Key} IS NOT NULL AND ${table.coverMimeType} IS NOT NULL AND ${table.coverSizeBytes} IS NOT NULL AND ${table.coverMimeType} IN ('image/png', 'image/jpeg', 'image/webp') AND ${table.coverSizeBytes} BETWEEN 1 AND 52428800)`,
    ),
  ],
);

export const ideaTags = sqliteTable(
  'idea_tags',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [uniqueIndex('idea_tags_user_name_idx').on(table.userId, table.name)],
);

export const ideaTagLinks = sqliteTable(
  'idea_tag_links',
  {
    ideaId: text('idea_id')
      .notNull()
      .references(() => ideas.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => ideaTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.ideaId, table.tagId] })],
);
