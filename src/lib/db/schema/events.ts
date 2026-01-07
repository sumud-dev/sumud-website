import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title'),
  description: text('description'),
  content: text('content'),
  location: text('location'),
  status: text('status'),
  author: text('author'),
  authorName: text('author_name'),
  language: text('language'),
  date: timestamp('date'),
  startAt: timestamp('start_at'),
  endAt: timestamp('end_at'),
  publishedAt: timestamp('published_at'),
  featuredImage: text('featured_image'),
  altTexts: jsonb('alt_texts'),
  categories: jsonb('categories'),
  locations: jsonb('locations'),
  organizers: jsonb('organizers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const eventTranslations = pgTable('event_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  language: text('language').notNull(),
  slug: text('slug'),
  title: text('title').notNull(),
  description: text('description'),
  excerpt: text('excerpt'),
  content: text('content'),
  location: text('location'),
  status: text('status').default('published'),
  author: text('author'),
  authorName: text('author_name'),
  date: timestamp('date'),
  startAt: timestamp('start_at'),
  endAt: timestamp('end_at'),
  publishedAt: timestamp('published_at'),
  featuredImage: text('featured_image'),
  altTexts: jsonb('alt_texts'),
  categories: jsonb('categories'),
  locations: jsonb('locations'),
  organizers: jsonb('organizers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventTranslation = typeof eventTranslations.$inferSelect;
export type NewEventTranslation = typeof eventTranslations.$inferInsert;
export type EventStatus = 'draft' | 'published' | 'archived';

// Union type for events that can come from either table
export type EventOrTranslation = Event | EventTranslation;