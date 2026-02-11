# Articles Page Builder Integration

## Overview
Added the articles page hero section to the page builder system while preserving all existing functionality (articles list, search, filters, infinite scroll, and newsletter).

## What Was Done

### 1. Created Migration Script
**File:** [`scripts/add-articles-hero-to-builder.ts`](../scripts/add-articles-hero-to-builder.ts)

- Adds/updates the articles page in the `pages` table
- Creates Craft.js content structure with only the hero section
- Adds bilingual content (English & Finnish) to `page_content` table
- Uses the `HeroSection` component from the page builder

### 2. Updated Articles Page Component
**File:** [`src/app/[locale]/(public)/articles/page.tsx`](../src/app/[locale]/(public)/articles/page.tsx)

**Changes Made:**
- Added `usePage` hook to fetch page builder content
- Extracted hero content from page builder (HeroSection block)
- Updated `ArticleNavigation` component to accept and use hero content
- Kept all existing functionality intact:
  - Articles list with infinite scroll (TanStack Query)
  - Search functionality with debouncing
  - Category filters
  - Manual refresh button
  - Load more button
  - Newsletter section
  - Error handling
  - Article cards with full functionality

**What's Editable in Page Builder:**
- Hero title
- Hero subtitle (optional)
- Hero description
- Background image (optional)
- Text alignment
- Primary/secondary buttons (optional)

**What Stays in Code:**
- Entire articles list section with infinite scroll
- Search and filter UI (category dropdown)
- Article grid rendering
- TanStack Query integration
- Load more functionality
- Newsletter signup section
- Decorative glass orbs and animations

### 3. Content Structure

The hero section uses Craft.js `SerializedNodes` format:

```typescript
{
  ROOT: {
    type: { resolvedName: 'Container' },
    nodes: ['articles-hero'],
    ...
  },
  'articles-hero': {
    type: { resolvedName: 'HeroSection' },
    props: {
      title: 'Articles & Insights',
      subtitle: 'Stories That Matter',
      description: '...',
      backgroundImage: '',
      textAlign: 'center',
      ...
    },
    ...
  }
}
```

## How It Works

1. **Data Flow:**
   - `usePage("articles")` hook fetches page data
   - Hook calls `getPublishedPage()` action with current locale
   - Action retrieves Craft.js content from database
   - `extractBlocksFromContent()` converts SerializedNodes to flat blocks array
   - Component extracts `HeroSection` props for display
   - Props are passed to `ArticleNavigation` component

2. **Fallback:**
   - If page builder content is not available, falls back to i18n translations
   - Pattern: `{heroContent?.title || t("hero.title")}`
   - Ensures page always displays properly

3. **Bilingual Support:**
   - Each language has its own `page_content` entry
   - Hook automatically uses current locale
   - No manual language switching needed in component

4. **UI Consistency:**
   - Maintains the "Petitions-style liquid glass" design
   - Decorative glass orbs with animations preserved
   - Search and filters section remains unchanged
   - All visual styling stays exactly the same

## Running the Script

```bash
npx tsx scripts/add-articles-hero-to-builder.ts
```

**Output:**
```
✓ Found existing articles page
✓ Updated en hero content
✓ Updated fi hero content
✅ Successfully added articles hero to page builder!
```

## Editing in Admin Panel

1. Navigate to Admin Panel → Page Builder
2. Find "Articles" page
3. Click Edit
4. The hero section will be visible and editable
5. All changes are language-specific
6. Save and publish

## Key Benefits

✅ **Minimal Changes**: Only hero section moved to page builder  
✅ **Preserves Functionality**: List, search, filters, infinite scroll remain unchanged  
✅ **Consistency**: Uses same `HeroSection` component as other pages  
✅ **Fallback Support**: i18n translations as backup  
✅ **Type-Safe**: Fully typed with TypeScript  
✅ **Bilingual**: English and Finnish content supported  
✅ **Pattern Match**: Follows exact same approach as campaigns and events pages  
✅ **Performance**: TanStack Query optimization remains intact

## Comparison with Other Pages

All three dynamic pages (Articles, Events, Campaigns) now follow the same pattern:
- Only hero section in page builder
- All dynamic content (lists, filters, search) remains in code
- Uses `HeroSection` component from page builder
- Bilingual support via separate `page_content` entries
- Fallback to i18n translations
- Minimal code changes

## Architecture Details

### ArticleNavigation Component
- Accepts optional `heroContent` prop
- Uses page builder content if available
- Falls back to translations if not
- Renders hero section with decorative glass effects
- Includes search and filters UI (not editable in page builder)

### Main ArticlesPage Component
- Fetches page data with `usePage("articles")`
- Extracts hero content in `useMemo` hook
- Passes content to `ArticleNavigation`
- Maintains all existing state and query logic
- TanStack Query for infinite scroll
- Manual refresh invalidates cache

## Future Enhancements

If needed, additional sections can be added to page builder:
- Search/filter UI customization
- Category descriptions
- Newsletter section text

However, the articles list should remain dynamic (fetched from API with infinite scroll) to show real-time data and maintain performance optimization.
