-- Migration: Update campaigns and campaign_translations schema
-- This migration aligns campaigns with the events pattern:
-- - Finnish content goes in campaigns table
-- - English translations go in campaign_translations with campaign_id FK

-- Step 1: Add new columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fi';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS demands JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS call_to_action JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS how_to_participate JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS resources JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS success_stories JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS targets JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS date TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- Step 2: Create index for language column
CREATE INDEX IF NOT EXISTS campaigns_language_idx ON campaigns(language);

-- Step 3: Rename locale to language in campaign_translations
ALTER TABLE campaign_translations RENAME COLUMN locale TO language;

-- Step 4: Add new columns to campaign_translations (to mirror campaigns)
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS demands JSONB;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS how_to_participate JSONB;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS resources JSONB;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS success_stories JSONB;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS targets JSONB;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS date TIMESTAMP;
ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- Step 5: Make campaign_id nullable (allows orphaned translations like events)
ALTER TABLE campaign_translations ALTER COLUMN campaign_id DROP NOT NULL;

-- Step 6: Change onDelete behavior from CASCADE to SET NULL
ALTER TABLE campaign_translations DROP CONSTRAINT IF EXISTS campaign_translations_campaign_id_campaigns_id_fk;
ALTER TABLE campaign_translations 
  ADD CONSTRAINT campaign_translations_campaign_id_campaigns_id_fk 
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;

-- Step 7: Update unique constraint from campaign_locale_unique to campaign_language_unique
ALTER TABLE campaign_translations DROP CONSTRAINT IF EXISTS campaign_locale_unique;
-- Note: We're not adding a new unique constraint because we want to allow
-- translations without a linked campaign (campaign_id can be null)

-- Step 8: Update indexes
DROP INDEX IF EXISTS campaign_translations_locale_idx;
CREATE INDEX IF NOT EXISTS campaign_translations_language_idx ON campaign_translations(language);
