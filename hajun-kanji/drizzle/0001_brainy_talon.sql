CREATE TABLE `visitor_cards` (
	`learner_id` text NOT NULL,
	`id` text NOT NULL,
	`stage` integer NOT NULL,
	`due` integer NOT NULL,
	`first_day` text NOT NULL,
	`last_day` text NOT NULL,
	`mistakes` integer NOT NULL,
	`reviews` integer NOT NULL,
	PRIMARY KEY(`learner_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `visitor_events` (
	`learner_id` text NOT NULL,
	`id` text NOT NULL,
	`card_id` text NOT NULL,
	`day` text NOT NULL,
	`xp` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`learner_id`, `id`)
);
--> statement-breakpoint
CREATE INDEX `idx_visitor_events_learner_day` ON `visitor_events` (`learner_id`,`day`);
--> statement-breakpoint
PRAGMA optimize;
