import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const quickLinks = sqliteTable(
  'quick_links',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    iconType: text('icon_type').notNull(),
    iconValue: text('icon_value'),
    groupName: text('group_name'),
    position: integer('position').notNull(),
    isFavorite: integer('is_favorite').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('quick_links_user_position_idx').on(table.userId, table.position),
    index('quick_links_user_favorite_idx').on(table.userId, table.isFavorite, table.position),
  ],
);
