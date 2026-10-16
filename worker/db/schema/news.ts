import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const newsSources = sqliteTable(
  'news_sources',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    feedUrl: text('feed_url'),
    siteUrl: text('site_url'),
    category: text('category'),
    priority: integer('priority').notNull().default(50),
    isEnabled: integer('is_enabled').notNull().default(1),
    lastFetchedAt: text('last_fetched_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('news_sources_enabled_idx').on(table.isEnabled, table.priority)],
);

export const newsArticles = sqliteTable(
  'news_articles',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id')
      .notNull()
      .references(() => newsSources.id, { onDelete: 'cascade' }),
    externalId: text('external_id'),
    dedupKey: text('dedup_key').notNull().unique(),
    title: text('title').notNull(),
    summary: text('summary'),
    whyItMatters: text('why_it_matters'),
    url: text('url').notNull(),
    imageUrl: text('image_url'),
    category: text('category'),
    relevanceScore: real('relevance_score').notNull().default(0),
    publishedAt: text('published_at'),
    fetchedAt: text('fetched_at').notNull(),
    aiEnriched: integer('ai_enriched').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('news_articles_feed_idx').on(table.relevanceScore, table.publishedAt),
    index('news_articles_source_idx').on(table.sourceId, table.publishedAt),
    index('news_articles_category_idx').on(table.category, table.publishedAt),
  ],
);
