import { 
  pgTable, 
  pgView,
  varchar, 
  text, 
  timestamp, 
  integer, 
  json,
  boolean, 
  index, 
  uniqueIndex 
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Posts table (user-created originals)
export const posts = pgTable('posts', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  language: varchar('language', { length: 10 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('article'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  featuredImage: text('featured_image'),
  categories: json('categories').$type<string[]>().notNull().default([]),
  authorId: varchar('author_id', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  viewCount: integer('view_count').notNull().default(0),
}, (table) => ({
  slugIndex: uniqueIndex('idx_posts_slug').on(table.slug),
  languageIndex: index('idx_posts_language').on(table.language),
  statusIndex: index('idx_posts_status').on(table.status),
}));

// Post translations table (AI-generated translations)
export const postTranslations = pgTable('post_translations', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: varchar('post_id', { length: 255 })
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  language: varchar('language', { length: 10 }).notNull(),
  translatedFrom: varchar('translated_from', { length: 10 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  featuredImage: text('featured_image'),
  categories: json('categories').$type<string[]>().notNull().default([]),
  translatedAt: timestamp('translated_at').notNull().defaultNow(),
  translationQuality: varchar('quality', { length: 20 }).default('auto'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  viewCount: integer('view_count').notNull().default(0),
}, (table) => ({
  postIdIndex: index('idx_post_translations_post_id').on(table.postId),
  slugIndex: uniqueIndex('idx_post_translations_slug').on(table.slug),
  languageIndex: index('idx_post_translations_language').on(table.language),
}));

// Unified posts view (for optimized queries)
export const postsUnifiedView = pgView('posts_unified_view', {
  postId: varchar('id', { length: 255 }).notNull(),
  postSlug: varchar('slug', { length: 255 }).notNull(),
  postTitle: text('title').notNull(),
  postExcerpt: text('excerpt').notNull(),
  postContent: text('content').notNull(),
  postLanguage: varchar('language', { length: 10 }).notNull(),
  postType: varchar('type', { length: 50 }).notNull(),
  postStatus: varchar('status', { length: 50 }).notNull(),
  postFeaturedImage: text('featured_image'),
  postCategories: json('categories').$type<string[]>(),
  postAuthorId: varchar('author_id', { length: 255 }),
  postAuthorName: varchar('author_name', { length: 255 }),
  postPublishedAt: timestamp('published_at'),
  postCreatedAt: timestamp('created_at').notNull(),
  postUpdatedAt: timestamp('updated_at').notNull(),
  postViewCount: integer('view_count').notNull(),
  postIsTranslation: boolean('post_is_translation').notNull(),
  postParentPostId: varchar('post_parent_post_id', { length: 255 }),
  postTranslatedFromLanguage: varchar('post_translated_from_language', { length: 10 }),
  postTranslationQuality: varchar('post_translation_quality', { length: 20 }),
}).existing();

// TypeScript types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostTranslation = typeof postTranslations.$inferSelect;
export type NewPostTranslation = typeof postTranslations.$inferInsert;
export type PostUnifiedView = typeof postsUnifiedView.$inferSelect;
