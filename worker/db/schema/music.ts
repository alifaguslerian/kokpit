import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const tracks = sqliteTable(
  'tracks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    artist: text('artist'),
    album: text('album'),
    durationSeconds: real('duration_seconds'),
    audioR2Key: text('audio_r2_key').notNull(),
    audioMimeType: text('audio_mime_type').notNull(),
    audioSizeBytes: integer('audio_size_bytes').notNull(),
    coverR2Key: text('cover_r2_key'),
    sourceType: text('source_type').notNull().default('upload'),
    sourceReference: text('source_reference'),
    isFavorite: integer('is_favorite').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    lastPlayedAt: text('last_played_at'),
    playCount: integer('play_count').notNull().default(0),
  },
  (table) => [
    index('tracks_user_created_idx').on(table.userId, table.createdAt),
    index('tracks_user_favorite_idx').on(table.userId, table.isFavorite),
    index('tracks_user_last_played_idx').on(table.userId, table.lastPlayedAt),
  ],
);

export const playlists = sqliteTable(
  'playlists',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    coverR2Key: text('cover_r2_key'),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('playlists_user_position_idx').on(table.userId, table.position)],
);

export const playlistTracks = sqliteTable(
  'playlist_tracks',
  {
    playlistId: text('playlist_id')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    trackId: text('track_id')
      .notNull()
      .references(() => tracks.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    addedAt: text('added_at').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.playlistId, table.trackId] }),
    index('playlist_tracks_order_idx').on(table.playlistId, table.position),
  ],
);
