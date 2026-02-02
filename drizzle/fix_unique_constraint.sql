-- Fix the unique constraint on ui_translations table
-- Current constraint: UNIQUE (key, language)
-- Required constraint: UNIQUE (namespace, key, language)

-- Drop the old constraint
ALTER TABLE ui_translations DROP CONSTRAINT IF EXISTS ui_translations_key_language_unique;

-- Add the correct constraint
ALTER TABLE ui_translations ADD CONSTRAINT ui_translations_namespace_key_language_unique 
  UNIQUE (namespace, key, language);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_ui_translations_namespace_language 
  ON ui_translations(namespace, language);
