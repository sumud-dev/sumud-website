import { pgTable, text, uuid, timestamp, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const languageEnum = pgEnum('language', ['en', 'fi']);
export const pageStatusEnum = pgEnum('page_status', ['draft', 'published']);

// Main pages table
export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  status: pageStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Page content with language support
export const pageContent = pgTable('page_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('page_id').references(() => pages.id, { onDelete: 'cascade' }).notNull(),
  language: languageEnum('language').notNull(),
  content: jsonb('content').notNull(), // Craft.js serialized JSON

  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  featuredImage: text('featured_image'),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Assets table - Currently not in use
 * 
 * This table was designed to store metadata about uploaded assets (images, etc.) 
 * but is currently not being used. The system stores images directly in Cloudinary
 * and references them by URL in the page content JSON.
 * 
 * Consider:
 * - Removing this table if not needed in the future
 * - Or implementing it to track all uploaded assets for better management,
 *   cleanup of unused images, and asset library functionality
 */
export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const pagesRelations = relations(pages, ({ many }) => ({
  content: many(pageContent),
}));

export const pageContentRelations = relations(pageContent, ({ one }) => ({
  page: one(pages, {
    fields: [pageContent.pageId],
    references: [pages.id],
  }),
}));