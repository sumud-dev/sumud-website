import { 
  pgTable,
  varchar, 
  text, 
  timestamp, 
  integer, 
  json,
  boolean, 
  index, 
  uniqueIndex
} from 'drizzle-orm/pg-core';

// Posts table (user-created originals)
export const posts = pgTable('posts', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 255 }).notNull(),
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
  translatedFrom: varchar('translated_from', { length: 10 }),
  parentPostId: varchar('parent_post_id', { length: 255 })
    .references((): any => posts.id, { onDelete: 'cascade' }),
  isTranslation: boolean('is_translation').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  viewCount: integer('view_count').notNull().default(0),
}, (table) => ({
  languageSlugIdx: uniqueIndex('posts_language_slug_idx').on(table.language, table.slug),
  languageStatusPublishedAtIdx: index('posts_language_status_published_at_idx').on(table.language, table.status, table.publishedAt),
  parentPostIdIdx: index('posts_parent_post_id_idx').on(table.parentPostId),
}));

// TypeScript types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
