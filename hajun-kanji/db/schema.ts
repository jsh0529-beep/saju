import { sqliteTable,text,integer } from 'drizzle-orm/sqlite-core';
export const cards=sqliteTable('kanji_cards',{id:text('id').primaryKey(),stage:integer('stage').notNull(),due:integer('due').notNull(),firstDay:text('first_day').notNull(),lastDay:text('last_day').notNull(),mistakes:integer('mistakes').notNull(),reviews:integer('reviews').notNull()});
export const events=sqliteTable('mission_events',{id:text('id').primaryKey(),cardId:text('card_id').notNull(),day:text('day').notNull(),xp:integer('xp').notNull(),created:integer('created').notNull()});
