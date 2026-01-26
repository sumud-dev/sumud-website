import { pgTable, text, timestamp, uuid, boolean, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================
// CORE PAGE BUILDER TABLE
// ============================================
export const pageBuilder = pgTable('page_builder', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  
  // Path for nested routing (e.g., '/about/team', '/contact')
  path: text('path').notNull(),
  
  // Parent page ID for translations (null for primary language)
  parentId: uuid('parent_id')
    .references((): any => pageBuilder.id, { onDelete: 'cascade' }),
  
  // Language (primary language for this page - typically 'fi')
  language: text('language').default('fi'),
  
  // Core content (translatable fields stored here for primary language)
  title: text('title').notNull(),
  
  // Rich content using blocks/markdown/html structure
  content: jsonb('content').$type<{
    type: 'blocks' | 'markdown' | 'html';
    data: unknown;
  }>(),
  
  // Page metadata
  metadata: jsonb('metadata').$type<{
    description?: string;
    image?: string;
    keywords?: string[];
    customFields?: Record<string, unknown>;
  }>(),
  
  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  
  // Visual & UI
  featuredImage: text('featured_image'),
  
  // Layout configuration
  layout: text('layout').default('default'), // default, full-width, sidebar, etc.
  
  // Page settings
  showInMenu: boolean('show_in_menu').default(false).notNull(),
  menuOrder: text('menu_order'),
  
  // Author info
  author: text('author'),
  authorName: text('author_name'),
  
  // Status flags
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: text('status').default('draft').notNull(), // draft, published, archived
  
  // Dates
  publishedAt: timestamp('published_at'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (t) => ({
  // Indexes for common queries
  statusIdx: index('page_builder_status_idx').on(t.status),
  activeIdx: index('page_builder_active_idx').on(t.isActive),
  languageIdx: index('page_builder_language_idx').on(t.language),
  pathIdx: index('page_builder_path_idx').on(t.path),
  parentIdx: index('page_builder_parent_idx').on(t.parentId),
  // Unique constraint on slug+language combination
  slugLanguageUnique: unique('page_builder_slug_language_unique').on(t.slug, t.language),
  pathLanguageUnique: unique('page_builder_path_language_unique').on(t.path, t.language),
}));

// ============================================
// PAGE BUILDER TRANSLATIONS
// ============================================
export const pageBuilderTranslations = pgTable('page_builder_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id')
    .references(() => pageBuilder.id, { onDelete: 'set null' }),
  language: text('language').notNull(), // e.g., 'en', 'fi'
  
  // Core content (same fields as pageBuilder table)
  slug: text('slug'),
  path: text('path'),
  title: text('title').notNull(),
  
  // Rich content
  content: jsonb('content').$type<{
    type: 'blocks' | 'markdown' | 'html';
    data: unknown;
  }>(),
  
  // Page metadata
  metadata: jsonb('metadata').$type<{
    description?: string;
    image?: string;
    keywords?: string[];
    customFields?: Record<string, unknown>;
  }>(),
  
  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  
  // Visual & UI (can be different per translation)
  featuredImage: text('featured_image'),
  
  // Layout configuration
  layout: text('layout'),
  
  // Author info
  author: text('author'),
  authorName: text('author_name'),
  
  // Status
  status: text('status').default('published'),
  
  // Dates
  publishedAt: timestamp('published_at'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  pageLanguageUnique: unique('page_language_unique').on(t.pageId, t.language),
  languageIdx: index('page_builder_translations_language_idx').on(t.language),
  pageIdx: index('page_builder_translations_page_idx').on(t.pageId),
}));

// ============================================
// TYPE EXPORTS
// ============================================
export type PageBuilder = typeof pageBuilder.$inferSelect;
export type NewPageBuilder = typeof pageBuilder.$inferInsert;

export type PageBuilderTranslation = typeof pageBuilderTranslations.$inferSelect;
export type NewPageBuilderTranslation = typeof pageBuilderTranslations.$inferInsert;

// ============================================
// UNIFIED VIEW FOR OPTIMIZED QUERIES
// ============================================
export const pagesUnifiedView = pgTable('pages_unified_view', {
  pageId: uuid('page_id').notNull(),
  pageSlug: text('page_slug').notNull(),
  pagePath: text('page_path').notNull(),
  pageTitle: text('page_title').notNull(),
  pageContent: jsonb('page_content').$type<{
    type: 'blocks' | 'markdown' | 'html';
    data: unknown;
  } | null>(),
  pageMetadata: jsonb('page_metadata').$type<{
    description?: string;
    image?: string;
    keywords?: string[];
    customFields?: Record<string, unknown>;
  } | null>(),
  pageSeoTitle: text('page_seo_title'),
  pageSeoDescription: text('page_seo_description'),
  pageFeaturedImage: text('page_featured_image'),
  pageLayout: text('page_layout'),
  pageShowInMenu: boolean('page_show_in_menu'),
  pageMenuOrder: text('page_menu_order'),
  pageAuthor: text('page_author'),
  pageAuthorName: text('page_author_name'),
  pageIsActive: boolean('page_is_active'),
  pageIsFeatured: boolean('page_is_featured'),
  pageStatus: text('page_status'),
  pageLanguage: text('page_language'),
  pagePublishedAt: timestamp('page_published_at'),
  pageCreatedAt: timestamp('page_created_at'),
  pageUpdatedAt: timestamp('page_updated_at'),
  pageCreatedBy: uuid('page_created_by'),
  pageUpdatedBy: uuid('page_updated_by'),
  pageIsTranslation: boolean('page_is_translation'),
  pageParentId: uuid('page_parent_id'),
  pageTranslationLanguage: text('page_translation_language'),
});

export type PageUnifiedView = typeof pagesUnifiedView.$inferSelect;

// ============================================
// HELPER TYPES FOR QUERIES
// ============================================
export type PageBuilderWithTranslations = PageBuilder & {
  translations: PageBuilderTranslation[];
};

export type LocalizedPageBuilder = PageBuilder & {
  translation: PageBuilderTranslation;
};
