import { pgTable, uuid, text, timestamp, jsonb, boolean, index, unique } from 'drizzle-orm/pg-core';

// ============================================
// UI TRANSLATIONS TABLE
// ============================================

/**
 * UI Translations table
 * Stores translations for UI elements across the application
 * This includes: common, admin, errors, navigation, footer, etc.
 */
export const uiTranslations = pgTable('ui_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Namespace/category for organization (e.g., 'common', 'admin', 'navigation', 'footer', 'campaignsPage')
  // This comes first to match the unique constraint order
  namespace: text('namespace').notNull(),
  
  // Translation key (e.g., 'loading', 'dashboard.title', 'hero.title')
  // Keys can be reused across different namespaces
  key: text('key').notNull(),
  
  // Language code (e.g., 'en', 'ar', 'fi')
  language: text('language').notNull(),
  
  // Translated value
  value: text('value').notNull(),
  
  // Optional metadata for complex translations
  metadata: jsonb('metadata').$type<{
    placeholders?: string[];  // Variables like {maxSize}, {count}
    context?: string;         // Additional context for translators
    notes?: string;           // Translation notes
  }>(),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  needsReview: boolean('needs_review').default(false).notNull(),
  
  // Audit timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (t) => ({
  // Unique constraint on namespace + key + language (allows same key in different namespaces)
  namespaceKeyLanguageUnique: unique('ui_translations_namespace_key_language_unique').on(t.namespace, t.key, t.language),
  // Indexes for common queries
  keyIdx: index('ui_translations_key_idx').on(t.key),
  languageIdx: index('ui_translations_language_idx').on(t.language),
  namespaceIdx: index('ui_translations_namespace_idx').on(t.namespace),
  namespaceLanguageIdx: index('ui_translations_namespace_language_idx').on(t.namespace, t.language),
  activeIdx: index('ui_translations_active_idx').on(t.isActive),
}));

// ============================================
// TYPE DEFINITIONS
// ============================================

export type UITranslation = typeof uiTranslations.$inferSelect;
export type NewUITranslation = typeof uiTranslations.$inferInsert;

/**
 * Structured translation data type
 * Used to represent nested translation objects
 */
export type TranslationData = Record<string, string | Record<string, any>>;
