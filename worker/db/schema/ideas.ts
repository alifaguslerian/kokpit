import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

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
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('ideas_user_created_idx').on(table.userId, table.createdAt),
    index('ideas_user_pinned_idx').on(table.userId, table.isPinned, table.createdAt),
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
