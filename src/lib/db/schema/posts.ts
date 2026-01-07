import { pgTable, text, timestamp, uuid, jsonb, integer, pgEnum, index } from 'drizzle-orm/pg-core';

// Enums for posts (matching database values)
export const postTypeEnum = pgEnum('post_type', ['article', 'news']);

// ============================================
// CORE POSTS TABLE
// ============================================
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  
  // Language (primary language for this post - typically 'fi')
  language: text('language').default('fi'),
  
  // Core content (translatable fields stored here for primary language)
  title: text('title'),
  excerpt: text('excerpt'),
  content: text('content'),
  
  // Post metadata
  type: postTypeEnum('type').default('article'),
  status: text('status').default('draft'),
  featuredImage: text('featured_image'),
  categories: jsonb('categories'),
  
  // Author info
  authorId: text('author_id'),
  authorName: text('author_name'),
  
  // Stats
  viewCount: integer('view_count').default(0),
  
  // Dates
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // Indexes for common queries
  languageIdx: index('posts_language_idx').on(t.language),
  statusIdx: index('posts_status_idx').on(t.status),
  publishedAtIdx: index('posts_published_at_idx').on(t.publishedAt),
}));

// ============================================
// POST TRANSLATIONS
// ============================================
export const postTranslations = pgTable('post_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
  language: text('language').notNull(), // e.g., 'en', 'fi', 'ar'
  
  // Core content (same fields as posts table)
  slug: text('slug'),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  
  // Post metadata (can be different per translation)
  type: text('type').default('article'),
  status: text('status').default('published'),
  featuredImage: text('featured_image'),
  categories: jsonb('categories'),
  
  // Author info
  authorId: text('author_id'),
  authorName: text('author_name'),
  
  // Stats
  viewCount: integer('view_count').default(0),
  
  // Dates
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  languageIdx: index('post_translations_language_idx').on(t.language),
  postIdx: index('post_translations_post_idx').on(t.postId),
  statusIdx: index('post_translations_status_idx').on(t.status),
}));

// ============================================
// TYPE EXPORTS
// ============================================
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostTranslation = typeof postTranslations.$inferSelect;
export type NewPostTranslation = typeof postTranslations.$inferInsert;

// ============================================
// HELPER TYPES FOR QUERIES
// ============================================
export type PostWithTranslations = Post & {
  translations: PostTranslation[];
};

export type LocalizedPost = Post & {
  translation: PostTranslation;
};

// Union type for posts that can come from either table
export type PostOrTranslation = Post | PostTranslation;
