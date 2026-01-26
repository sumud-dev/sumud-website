-- Clean up invalid content namespaces from ui_translations
-- These should be in dedicated translation tables instead

-- This script safely removes translations that belong in content tables:
-- - pages/page → page_builder_translations
-- - events/event → event_translations  
-- - campaigns/campaign → campaign_translations
-- - posts/post → post_translations

-- Check what would be deleted (DRY RUN)
SELECT 
  namespace,
  language,
  COUNT(*) as translation_count,
  CASE 
    WHEN namespace IN ('pages', 'page') THEN 'Move to page_builder_translations via /admin/page-builder'
    WHEN namespace IN ('events', 'event') THEN 'Move to event_translations via /admin/events'
    WHEN namespace IN ('campaigns', 'campaign') THEN 'Move to campaign_translations via /admin/campaigns'
    WHEN namespace IN ('posts', 'post') THEN 'Move to post_translations via /admin/articles'
  END as action_needed
FROM ui_translations
WHERE namespace IN ('pages', 'page', 'events', 'event', 'campaigns', 'campaign', 'posts', 'post')
GROUP BY namespace, language
ORDER BY namespace, language;

-- If the above query shows results, uncomment and run this to delete:
-- DELETE FROM ui_translations
-- WHERE namespace IN ('pages', 'page', 'events', 'event', 'campaigns', 'campaign', 'posts', 'post');

-- Verify deletion
-- SELECT COUNT(*) as remaining_invalid
-- FROM ui_translations  
-- WHERE namespace IN ('pages', 'page', 'events', 'event', 'campaigns', 'campaign', 'posts', 'post');

-- Expected result: 0 rows
