CREATE TABLE `app_state` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL,
	`locale` text DEFAULT 'id-ID' NOT NULL,
	`clock_format` text DEFAULT '24h' NOT NULL,
	`quote_rotation_minutes` integer DEFAULT 60 NOT NULL,
	`news_refresh_preference_minutes` integer,
	`music_volume` real DEFAULT 0.7 NOT NULL,
	`sidebar_collapsed` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `idea_tag_links` (
	`idea_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`idea_id`, `tag_id`),
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `idea_tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `idea_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idea_tags_user_name_idx` ON `idea_tags` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`is_pinned` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ideas_user_created_idx` ON `ideas` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `ideas_user_pinned_idx` ON `ideas` (`user_id`,`is_pinned`,`created_at`);--> statement-breakpoint
CREATE TABLE `quick_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`icon_type` text NOT NULL,
	`icon_value` text,
	`group_name` text,
	`position` integer NOT NULL,
	`is_favorite` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quick_links_user_position_idx` ON `quick_links` (`user_id`,`position`);--> statement-breakpoint
CREATE INDEX `quick_links_user_favorite_idx` ON `quick_links` (`user_id`,`is_favorite`,`position`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`semester_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`lecturer` text,
	`accent_key` text,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `courses_semester_position_idx` ON `courses` (`semester_id`,`position`);--> statement-breakpoint
CREATE INDEX `courses_user_semester_idx` ON `courses` (`user_id`,`semester_id`);--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`week_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`original_filename` text,
	`mime_type` text,
	`size_bytes` integer,
	`r2_key` text,
	`external_url` text,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_opened_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`week_id`) REFERENCES `weeks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `materials_week_position_idx` ON `materials` (`week_id`,`position`);--> statement-breakpoint
CREATE INDEX `materials_user_week_idx` ON `materials` (`user_id`,`week_id`);--> statement-breakpoint
CREATE INDEX `materials_last_opened_idx` ON `materials` (`user_id`,`last_opened_at`);--> statement-breakpoint
CREATE TABLE `semesters` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`academic_year` text,
	`term_number` integer,
	`is_active` integer DEFAULT 0 NOT NULL,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `semesters_user_position_idx` ON `semesters` (`user_id`,`position`);--> statement-breakpoint
CREATE INDEX `semesters_user_active_idx` ON `semesters` (`user_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `weeks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`week_number` integer NOT NULL,
	`title` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weeks_course_week_number_unique` ON `weeks` (`course_id`,`week_number`);--> statement-breakpoint
CREATE INDEX `weeks_course_number_idx` ON `weeks` (`course_id`,`week_number`);--> statement-breakpoint
CREATE INDEX `weeks_user_course_idx` ON `weeks` (`user_id`,`course_id`);--> statement-breakpoint
CREATE TABLE `playlist_tracks` (
	`playlist_id` text NOT NULL,
	`track_id` text NOT NULL,
	`position` integer NOT NULL,
	`added_at` text NOT NULL,
	PRIMARY KEY(`playlist_id`, `track_id`),
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `playlist_tracks_order_idx` ON `playlist_tracks` (`playlist_id`,`position`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover_r2_key` text,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `playlists_user_position_idx` ON `playlists` (`user_id`,`position`);--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`artist` text,
	`album` text,
	`duration_seconds` real,
	`audio_r2_key` text NOT NULL,
	`audio_mime_type` text NOT NULL,
	`audio_size_bytes` integer NOT NULL,
	`cover_r2_key` text,
	`source_type` text DEFAULT 'upload' NOT NULL,
	`source_reference` text,
	`is_favorite` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_played_at` text,
	`play_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tracks_user_created_idx` ON `tracks` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `tracks_user_favorite_idx` ON `tracks` (`user_id`,`is_favorite`);--> statement-breakpoint
CREATE INDEX `tracks_user_last_played_idx` ON `tracks` (`user_id`,`last_played_at`);--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`external_id` text,
	`dedup_key` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`why_it_matters` text,
	`url` text NOT NULL,
	`image_url` text,
	`category` text,
	`relevance_score` real DEFAULT 0 NOT NULL,
	`published_at` text,
	`fetched_at` text NOT NULL,
	`ai_enriched` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `news_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_articles_dedup_key_unique` ON `news_articles` (`dedup_key`);--> statement-breakpoint
CREATE INDEX `news_articles_feed_idx` ON `news_articles` (`relevance_score`,`published_at`);--> statement-breakpoint
CREATE INDEX `news_articles_source_idx` ON `news_articles` (`source_id`,`published_at`);--> statement-breakpoint
CREATE INDEX `news_articles_category_idx` ON `news_articles` (`category`,`published_at`);--> statement-breakpoint
CREATE TABLE `news_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`feed_url` text,
	`site_url` text,
	`category` text,
	`priority` integer DEFAULT 50 NOT NULL,
	`is_enabled` integer DEFAULT 1 NOT NULL,
	`last_fetched_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `news_sources_enabled_idx` ON `news_sources` (`is_enabled`,`priority`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`mood` text NOT NULL,
	`language` text NOT NULL,
	`source_type` text NOT NULL,
	`author` text,
	`source_url` text,
	`content_hash` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`last_shown_at` text,
	`show_count` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "quotes_language_check" CHECK(language IN ('en', 'id'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_content_hash_unique` ON `quotes` (`content_hash`);--> statement-breakpoint
CREATE INDEX `quotes_rotation_idx` ON `quotes` (`is_active`,`last_shown_at`,`show_count`);--> statement-breakpoint
CREATE INDEX `quotes_mood_idx` ON `quotes` (`mood`,`is_active`);