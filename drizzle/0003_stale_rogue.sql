ALTER TABLE `posts` ADD `tags` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `area_key` text DEFAULT '' NOT NULL;