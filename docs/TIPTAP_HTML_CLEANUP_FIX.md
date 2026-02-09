# TipTap HTML Cleanup Fix

## Problem

Raw HTML tags from TipTap editor were showing up in public pages:

```html
<div data-raw-html="true" data-html="&lt;div style=&quot;border:1px solid #e5e7eb;border-radius:12px;padding:32px;margin:24px">
```

These tags were appearing in:
- Article descriptions
- Event descriptions  
- Campaign descriptions

## Solution

Created a `cleanTipTapHtml()` utility function that:

1. **Removes TipTap wrapper tags**: Strips `<div data-raw-html="true" ...>` tags
2. **Decodes HTML entities**: Converts `&lt;`, `&gt;`, `&quot;`, etc. to proper characters
3. **Handles self-closing tags**: Processes both regular and self-closing TipTap wrappers

## Files Modified

### Core Utilities

1. **`src/lib/utils/markdown.ts`**
   - Added `cleanTipTapHtml()` function
   - Updated `markdownToHtml()` to apply cleaning
   - Updated `getDescriptionHtml()` to apply cleaning to all return paths

2. **`src/lib/hooks/use-campaigns.ts`**
   - Updated `getDescriptionText()` to strip HTML tags and decode entities
   - Now returns clean plain text for filtering/search

### Public Pages (already using the utilities)

All public pages now benefit from the fix since they use the centralized utilities:

- **Articles**: `/src/app/[locale]/(public)/articles/[slug]/page.tsx`
  - Now imports and uses `markdownToHtml()` from utilities
  
- **Events**: `/src/app/[locale]/(public)/events/[slug]/page.tsx`
  - Already uses `markdownToHtml()` correctly
  
- **Campaigns**: `/src/app/[locale]/(public)/campaigns/[slug]/page.tsx`
  - Uses `getDescriptionHtml()` for rendering
  - Uses `getDescriptionText()` for plain text

- **EventCard Component**: `/src/components/events/EventCard.tsx`
  - Strips HTML tags and decodes entities in event preview text

### Admin Pages (now properly cleaning HTML)

All admin pages now clean TipTap HTML tags before display:

- **Campaigns List**: `/src/app/[locale]/admin/campaigns/page.tsx`
  - Updated `extractDescriptionText()` to strip TipTap tags and decode entities
  
- **Campaign Detail**: `/src/app/[locale]/admin/campaigns/[slug]/page.tsx`
  - Updated `renderContent()` to clean TipTap HTML wrappers and decode entities
  
- **Event Detail**: `/src/app/[locale]/admin/events/[id]/page.tsx`
  - Updated `displayValue()` to strip TipTap tags and decode entities

- **Events List**: `/src/app/[locale]/admin/events/page.tsx`
  - Cleans `event.content` before truncating for preview display
  - Strips TipTap wrappers, HTML tags, and decodes entities

- **Articles List**: `/src/app/[locale]/admin/articles/page.tsx`
  - Cleans `post.excerpt` before displaying in table rows
  - Strips TipTap wrappers, HTML tags, and decodes entities

- **Articles Detail**: `/src/app/[locale]/admin/articles/[slug]/page.tsx`
  - Cleans `article.excerpt` before displaying
  - Uses `markdownToHtml()` for content which includes cleaning

## How It Works

### HTML Cleaning Process

```typescript
// Before: Raw TipTap output with encoded HTML
<div data-raw-html="true" data-html="&lt;div style=&quot;border:1px solid #e5e7eb&quot;&gt;Content&lt;/div&gt;"></div>

// After: Clean HTML
<div style="border:1px solid #e5e7eb">Content</div>
```

### Usage Example

```typescript
import { markdownToHtml, getDescriptionHtml } from '@/src/lib/utils/markdown';

// For markdown content
const cleanHtml = markdownToHtml(content);

// For campaign descriptions (handles JSONB format)
const cleanHtml = getDescriptionHtml(campaign.description);

// Render in component
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
```

## Testing

To verify the fix is working:

1. Create or edit content in the admin panel using TipTap editor
2. Add some rich formatting (borders, styles, etc.)
3. View the content on both admin and public pages
4. Confirm that only the actual content appears, not the TipTap wrapper tags

### Admin Pages to Test
- `/admin/campaigns` - List view descriptions
- `/admin/campaigns/[slug]` - Campaign detail view
- `/admin/events` - List view event content previews
- `/admin/events/[id]` - Event detail view
- `/admin/articles` - List view post excerpts
- `/admin/articles/[slug]` - Article detail view (excerpt section)

### Public Pages to Test
- `/articles/[slug]` - Article detail
- `/events/[slug]` - Event detail  
- `/campaigns/[slug]` - Campaign detail
- `/events` - Event cards in listing

## Benefits

✅ Clean, readable content on both public and admin pages  
✅ Proper HTML rendering without visible tags  
✅ Centralized cleaning logic - easy to maintain  
✅ Handles both markdown and HTML content  
✅ Proper text extraction for search/filtering  
✅ Consistent behavior across all pages
