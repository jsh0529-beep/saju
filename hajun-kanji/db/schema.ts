import { sqliteTable,text,integer,primaryKey,index } from 'drizzle-orm/sqlite-core';
export const cards=sqliteTable('kanji_cards',{id:text('id').primaryKey(),stage:integer('stage').notNull(),due:integer('due').notNull(),firstDay:text('first_day').notNull(),lastDay:text('last_day').notNull(),mistakes:integer('mistakes').notNull(),reviews:integer('reviews').notNull()});
export const events=sqliteTable('mission_events',{id:text('id').primaryKey(),cardId:text('card_id').notNull(),day:text('day').notNull(),xp:integer('xp').notNull(),created:integer('created').notNull()});

// Keep the original owner's tables intact. Public visitors use separate rows.
export const visitorCards=sqliteTable('visitor_cards',{
 learnerId:text('learner_id').notNull(),id:text('id').notNull(),
 stage:integer('stage').notNull(),due:integer('due').notNull(),
 firstDay:text('first_day').notNull(),lastDay:text('last_day').notNull(),
 mistakes:integer('mistakes').notNull(),reviews:integer('reviews').notNull()
},table=>[primaryKey({columns:[table.learnerId,table.id]})]);
export const visitorEvents=sqliteTable('visitor_events',{
 learnerId:text('learner_id').notNull(),id:text('id').notNull(),
 cardId:text('card_id').notNull(),day:text('day').notNull(),
 xp:integer('xp').notNull(),created:integer('created').notNull()
},table=>[
 primaryKey({columns:[table.learnerId,table.id]}),
 index('idx_visitor_events_learner_day').on(table.learnerId,table.day)
]);
