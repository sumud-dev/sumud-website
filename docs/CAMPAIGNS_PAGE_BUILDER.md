# Campaigns Page Builder Integration

## Overview
Added the campaigns page hero section to the page builder system while preserving all existing functionality (campaigns list, filters, and search).

## What Was Done

### 1. Created Migration Script
**File:** [`scripts/add-campaigns-hero-to-builder.ts`](scripts/add-campaigns-hero-to-builder.ts)

- Adds/updates the campaigns page in the `pages` table
- Creates Craft.js content structure with only the hero section
- Adds bilingual content (English & Finnish) to `page_content` table
- Uses the `HeroSection` component from the page builder

### 2. Updated Campaigns Page Component
**File:** [`src/app/[locale]/(public)/campaigns/page.tsx`](src/app/[locale]/(public)/campaigns/page.tsx)

**Changes Made:**
- Simplified hero content extraction to use `HeroSection` block from page builder
- Removed complex nested content structure
- Kept all existing functionality intact:
  - Campaigns list fetching via API
  - Filter by campaign type
  - Search functionality
  - Sort options (featured/recent)
  - Campaign cards with full functionality

**What's Editable in Page Builder:**
- Hero title
- Hero subtitle
- Hero description
- Background image (optional)
- Text alignment
- Primary/secondary buttons (optional)

**What Stays in Code:**
- Entire campaigns list section
- Search and filter UI
- Campaign cards rendering
- API integration
- Sorting logic

### 3. Content Structure

The hero section uses Craft.js `SerializedNodes` format:

```typescript
{
  ROOT: {
    type: { resolvedName: 'Container' },
    nodes: ['campaigns-hero'],
    ...
  },
  'campaigns-hero': {
    type: { resolvedName: 'HeroSection' },
    props: {
      title: 'Our Campaigns',
      subtitle: 'Make Your Voice Heard',
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
   - `usePage("campaigns")` hook fetches page data
   - Hook calls `getPublishedPage()` action with current locale
   - Action retrieves Craft.js content from database
   - `extractBlocksFromContent()` converts SerializedNodes to flat blocks array
   - Component extracts `HeroSection` props for display

2. **Fallback:**
   - If page builder content is not available, falls back to i18n translations
   - Pattern: `{heroContent?.title || t("hero.title")}`

3. **Bilingual Support:**
   - Each language has its own `page_content` entry
   - Hook automatically uses current locale
   - No manual language switching needed in component

## Running the Script

```bash
npx tsx scripts/add-campaigns-hero-to-builder.ts
```

**Output:**
```
✓ Found existing campaigns page
✓ Updated en hero content
✓ Updated fi hero content
✅ Successfully added campaigns hero to page builder!
```

## Editing in Admin Panel

1. Navigate to Admin Panel → Page Builder
2. Find "Campaigns" page
3. Click Edit
4. The hero section will be visible and editable
5. All changes are language-specific
6. Save and publish

## Key Benefits

✅ **Minimal Changes**: Only hero section moved to page builder  
✅ **Preserves Functionality**: List, filters, search remain unchanged  
✅ **Consistency**: Uses same `HeroSection` component as other pages  
✅ **Fallback Support**: i18n translations as backup  
✅ **Type-Safe**: Fully typed with TypeScript  
✅ **Bilingual**: English and Finnish content supported

## Future Enhancements

If needed, additional sections can be added to page builder:
- Search/filter UI customization
- Campaign type descriptions
- Campaign grid layout options

However, the campaigns list should remain dynamic (fetched from API) to show real-time data.
