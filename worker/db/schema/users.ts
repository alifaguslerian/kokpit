import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  timezone: text('timezone').notNull().default('Asia/Jakarta'),
  locale: text('locale').notNull().default('id-ID'),
  clockFormat: text('clock_format').notNull().default('24h'),
  quoteRotationMinutes: integer('quote_rotation_minutes').notNull().default(60),
  newsRefreshPreferenceMinutes: integer('news_refresh_preference_minutes'),
  musicVolume: real('music_volume').notNull().default(0.7),
  sidebarCollapsed: integer('sidebar_collapsed').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const appState = sqliteTable(
  'app_state',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    valueJson: text('value_json').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.key] })],
);
