import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
export const rsvps = pgTable('rsvps', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  attendance: text('attendance', {enum:['yes','no']}).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', {withTimezone:true}).notNull().defaultNow(),
});
