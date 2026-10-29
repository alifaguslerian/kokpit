CREATE TABLE `idea_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "idea_collections_position_check" CHECK("idea_collections"."position" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idea_collections_user_name_idx` ON `idea_collections` (`user_id`,`name_key`);--> statement-breakpoint
CREATE INDEX `idea_collections_user_position_idx` ON `idea_collections` (`user_id`,`position`,`id`);--> statement-breakpoint
ALTER TABLE `ideas` ADD `is_favorite` integer DEFAULT 0 NOT NULL CONSTRAINT `ideas_favorite_check` CHECK (`is_favorite` IN (0, 1));
--> statement-breakpoint
ALTER TABLE `ideas` ADD `collection_id` text REFERENCES `idea_collections`(`id`) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE `ideas` ADD `cover_r2_key` text;
--> statement-breakpoint
ALTER TABLE `ideas` ADD `cover_mime_type` text;
--> statement-breakpoint
ALTER TABLE `ideas` ADD `cover_size_bytes` integer CONSTRAINT `ideas_cover_check` CHECK ((`cover_r2_key` IS NULL AND `cover_mime_type` IS NULL AND `cover_size_bytes` IS NULL) OR (`cover_r2_key` IS NOT NULL AND `cover_mime_type` IS NOT NULL AND `cover_size_bytes` IS NOT NULL AND `cover_mime_type` IN ('image/png', 'image/jpeg', 'image/webp') AND `cover_size_bytes` BETWEEN 1 AND 52428800));
--> statement-breakpoint
CREATE INDEX `ideas_user_favorite_idx` ON `ideas` (`user_id`, `is_favorite`, `updated_at` DESC, `id` DESC);
--> statement-breakpoint
CREATE INDEX `ideas_user_collection_idx` ON `ideas` (`user_id`, `collection_id`, `is_pinned`, `created_at` DESC, `id` DESC);
