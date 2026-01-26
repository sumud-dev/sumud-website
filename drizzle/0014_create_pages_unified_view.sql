-- ============================================
-- Create Unified View for Pages
-- ============================================
-- This view combines page_builder and page_builder_translations tables
-- Similar to posts_unified_view for optimized querying
-- Both en and fi pages are stored as primary records (no parent relationship)

CREATE OR REPLACE VIEW pages_unified_view AS
-- Primary pages
SELECT 
  pb.id as page_id,
  pb.slug as page_slug,
  pb.path as page_path,
  pb.title as page_title,
  pb.content as page_content,
  pb.metadata as page_metadata,
  pb.seo_title as page_seo_title,
  pb.seo_description as page_seo_description,
  pb.featured_image as page_featured_image,
  pb.layout as page_layout,
  pb.show_in_menu as page_show_in_menu,
  pb.menu_order as page_menu_order,
  pb.author as page_author,
  pb.author_name as page_author_name,
  pb.is_active as page_is_active,
  pb.is_featured as page_is_featured,
  pb.status as page_status,
  pb.language as page_language,
  pb.published_at as page_published_at,
  pb.created_at as page_created_at,
  pb.updated_at as page_updated_at,
  pb.created_by as page_created_by,
  pb.updated_by as page_updated_by,
  false as page_is_translation,
  NULL::uuid as page_parent_id,
  NULL::text as page_translation_language
FROM page_builder pb

UNION ALL

-- Translations
SELECT
  pbt.id as page_id,
  pbt.slug as page_slug,
  pbt.path as page_path,
  pbt.title as page_title,
  pbt.content as page_content,
  pbt.metadata as page_metadata,
  pbt.seo_title as page_seo_title,
  pbt.seo_description as page_seo_description,
  pbt.featured_image as page_featured_image,
  pbt.layout as page_layout,
  COALESCE(pb.show_in_menu, false) as page_show_in_menu,
  pb.menu_order as page_menu_order,
  pbt.author as page_author,
  pbt.author_name as page_author_name,
  COALESCE(pb.is_active, true) as page_is_active,
  COALESCE(pb.is_featured, false) as page_is_featured,
  pbt.status as page_status,
  pbt.language as page_language,
  pbt.published_at as page_published_at,
  pbt.created_at as page_created_at,
  pbt.updated_at as page_updated_at,
  pb.created_by as page_created_by,
  pb.updated_by as page_updated_by,
  true as page_is_translation,
  pbt.page_id as page_parent_id,
  pbt.language as page_translation_language
FROM page_builder_translations pbt
LEFT JOIN page_builder pb ON pbt.page_id = pb.id;

-- ============================================
-- Add comments for documentation
-- ============================================

COMMENT ON VIEW pages_unified_view IS 'Unified view combining page_builder and page_builder_translations for optimized queries. Primary pages (en, fi) are stored as separate records, not parent-child relationships.';
