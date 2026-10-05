CREATE TABLE `kanji_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`stage` integer NOT NULL,
	`due` integer NOT NULL,
	`first_day` text NOT NULL,
	`last_day` text NOT NULL,
	`mistakes` integer NOT NULL,
	`reviews` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mission_events` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`day` text NOT NULL,
	`xp` integer NOT NULL,
	`created` integer NOT NULL
);
