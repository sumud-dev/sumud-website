-- Migration: Fix unique constraint on ui_translations table
-- Date: 2026-01-27
-- Description: Change unique constraint from (key, language) to (namespace, key, language)
--              This allows the same key to be used in different namespaces (e.g., hero.title in campaignsPage, articlesPage, etc.)

-- Drop the old constraint
ALTER TABLE ui_translations DROP CONSTRAINT IF EXISTS ui_translations_key_language_unique;

-- Add the correct constraint (namespace, key, language)
ALTER TABLE ui_translations ADD CONSTRAINT ui_translations_namespace_key_language_unique 
  UNIQUE (namespace, key, language);

-- Ensure the performance index exists
CREATE INDEX IF NOT EXISTS idx_ui_translations_namespace_language 
  ON ui_translations(namespace, language);

-- Note: This fix resolves the issue where translation keys were showing instead of actual translations
-- because keys like 'hero.title', 'search.placeholder', etc. couldn't be added to multiple namespaces.
