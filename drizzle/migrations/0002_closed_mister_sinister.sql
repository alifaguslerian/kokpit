CREATE TABLE `course_schedule_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`start_minute` integer NOT NULL,
	`end_minute` integer NOT NULL,
	`room` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "course_schedule_weekday_check" CHECK("course_schedule_entries"."weekday" BETWEEN 1 AND 7),
	CONSTRAINT "course_schedule_minutes_check" CHECK("course_schedule_entries"."start_minute" >= 0 AND "course_schedule_entries"."start_minute" < "course_schedule_entries"."end_minute" AND "course_schedule_entries"."end_minute" <= 1440)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_schedule_interval_unique` ON `course_schedule_entries` (`course_id`,`weekday`,`start_minute`,`end_minute`);--> statement-breakpoint
CREATE INDEX `course_schedule_user_day_idx` ON `course_schedule_entries` (`user_id`,`weekday`,`start_minute`,`id`);--> statement-breakpoint
CREATE INDEX `course_schedule_course_idx` ON `course_schedule_entries` (`course_id`,`weekday`,`start_minute`,`id`);--> statement-breakpoint
ALTER TABLE `courses` ADD `description` text;