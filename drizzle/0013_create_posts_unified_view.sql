-- drizzle/migrations/0002_create_articles_unified_view.sql

-- Drop view if exists (for safe re-runs)
DROP VIEW IF EXISTS posts_unified_view CASCADE;

-- Create the unified articles view
CREATE VIEW posts_unified_view AS
-- Original user-created articles from posts table
SELECT 
  posts.id,
  posts.slug,
  posts.title,
  posts.excerpt,
  posts.content,
  posts.language,
  posts.type,
  posts.status,
  posts.featured_image,
  posts.categories,
  posts.author_id,
  posts.author_name,
  posts.published_at,
  posts.created_at,
  posts.updated_at,
  posts.view_count,
  false AS post_is_translation,
  NULL::varchar(255) AS post_parent_post_id,
  NULL::varchar(10) AS post_translated_from_language,
  NULL::varchar(20) AS post_translation_quality
FROM posts

UNION ALL

-- AI-translated posts from post_translations table
SELECT 
  post_translations.id,
  post_translations.slug,
  post_translations.title,
  post_translations.excerpt,
  post_translations.content,
  post_translations.language,
  post_translations.type,
  post_translations.status,
  post_translations.featured_image,
  post_translations.categories,
  NULL::varchar(255) AS author_id,
  NULL::varchar(255) AS author_name,
  post_translations.published_at,
  post_translations.created_at,
  post_translations.updated_at,
  post_translations.view_count,
  true AS post_is_translation,
  post_translations.post_id AS post_parent_post_id,
  post_translations.translated_from AS post_translated_from_language,
  post_translations.quality AS post_translation_quality
FROM post_translations;

-- Add comment for documentation
COMMENT ON VIEW posts_unified_view IS 
  'Unified view combining user-created posts and AI-translated posts. Optimized for read operations. post_is_translation distinguishes originals (false) from translations (true).';