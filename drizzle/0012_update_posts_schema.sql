-- Migration: Update posts and post_translations schema
-- This migration aligns posts with the events/campaigns pattern:
-- - Finnish content goes in posts table (language = 'fi')
-- - English translations go in post_translations with post_id FK (language = 'en')
-- - Both tables have the same fields for content

-- Step 1: Add new columns to posts table (content fields that were only in translations)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fi';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content TEXT;

-- Step 2: Create index for language column on posts
CREATE INDEX IF NOT EXISTS posts_language_idx ON posts(language);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at);

-- Step 3: Rename locale to language in post_translations
ALTER TABLE post_translations RENAME COLUMN locale TO language;

-- Step 4: Add new columns to post_translations (to mirror posts table)
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'article';
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS categories JSONB;
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Step 5: Make post_id nullable (allows orphaned translations like events/campaigns)
ALTER TABLE post_translations ALTER COLUMN post_id DROP NOT NULL;

-- Step 6: Change onDelete behavior from CASCADE to SET NULL
ALTER TABLE post_translations DROP CONSTRAINT IF EXISTS post_translations_post_id_posts_id_fk;
ALTER TABLE post_translations 
  ADD CONSTRAINT post_translations_post_id_posts_id_fk 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL;

-- Step 7: Update indexes
DROP INDEX IF EXISTS post_translations_locale_idx;
CREATE INDEX IF NOT EXISTS post_translations_language_idx ON post_translations(language);
CREATE INDEX IF NOT EXISTS post_translations_post_idx ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS post_translations_status_idx ON post_translations(status);

-- Step 8: Copy Finnish translation data into posts table for posts that have Finnish content
UPDATE posts p
SET 
  title = pt.title,
  excerpt = pt.excerpt,
  content = pt.content,
  language = 'fi'
FROM post_translations pt
WHERE pt.post_id = p.id 
  AND pt.language = 'fi';

-- Step 9: For posts without Finnish translation, set language to 'en' if they have English translation
UPDATE posts p
SET language = 'en'
WHERE p.language IS NULL
  AND EXISTS (
    SELECT 1 FROM post_translations pt 
    WHERE pt.post_id = p.id AND pt.language = 'en'
  );

