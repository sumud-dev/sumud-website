# Events Page Builder Integration

## Overview
Added the events page hero section to the page builder system while preserving all existing functionality (events list, calendar, filters, and search).

## What Was Done

### 1. Created Migration Script
**File:** [`scripts/add-events-hero-to-builder.ts`](../scripts/add-events-hero-to-builder.ts)

- Adds/updates the events page in the `pages` table
- Creates Craft.js content structure with only the hero section
- Adds bilingual content (English & Finnish) to `page_content` table
- Uses the `HeroSection` component from the page builder

### 2. Updated Events Page Component
**File:** [`src/app/[locale]/(public)/events/page.tsx`](../src/app/[locale]/(public)/events/page.tsx)

**Changes Made:**
- Simplified hero content extraction to use `HeroSection` block from page builder
- Removed complex nested content structure and database translation fetching
- Kept all existing functionality intact:
  - Events list fetching via API
  - Filter by event type, category, location
  - Search functionality
  - Calendar view (desktop & mobile)
  - Date selection
  - Sort options
  - Event cards with full functionality
  - Quick actions sidebar

**What's Editable in Page Builder:**
- Hero title
- Hero subtitle (optional)
- Hero description
- Background image (optional)
- Text alignment
- Primary/secondary buttons (optional)

**What Stays in Code:**
- Entire events list section
- Search and filter UI
- Calendar functionality
- Event cards rendering
- API integration
- Sorting and filtering logic
- Quick stats badges (totalEvents, global/virtual, community driven)

### 3. Updated EventsHero Component
**File:** [`src/components/events/EventsHero.tsx`](../src/components/events/EventsHero.tsx)

- Updated `content` prop to accept `null` for proper typing
- Keeps fallback content if page builder data is not available

### 4. Content Structure

The hero section uses Craft.js `SerializedNodes` format:

```typescript
{
  ROOT: {
    type: { resolvedName: 'Container' },
    nodes: ['events-hero'],
    ...
  },
  'events-hero': {
    type: { resolvedName: 'HeroSection' },
    props: {
      title: 'Events Calendar',
      subtitle: '',
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
   - `usePage("events")` hook fetches page data
   - Hook calls `getPublishedPage()` action with current locale
   - Action retrieves Craft.js content from database
   - `extractBlocksFromContent()` converts SerializedNodes to flat blocks array
   - Component extracts `HeroSection` props for display

2. **Fallback:**
   - If page builder content is not available, falls back to i18n translations
   - Pattern: `{props.title || t("hero.title")}`
   - Ensures page always displays properly

3. **Bilingual Support:**
   - Each language has its own `page_content` entry
   - Hook automatically uses current locale
   - No manual language switching needed in component

4. **Dynamic Stats:**
   - Total events count, "Global & Virtual", and "Community Driven" badges are still dynamic
   - These use translations from the events namespace, not page builder
   - This ensures they stay up-to-date with the actual data

## Running the Script

```bash
npx tsx scripts/add-events-hero-to-builder.ts
```

**Output:**
```
✓ Found existing events page
✓ Updated en hero content
✓ Updated fi hero content
✅ Successfully added events hero to page builder!
```

## Editing in Admin Panel

1. Navigate to Admin Panel → Page Builder
2. Find "Events" page
3. Click Edit
4. The hero section will be visible and editable
5. All changes are language-specific
6. Save and publish

## Key Benefits

✅ **Minimal Changes**: Only hero section moved to page builder  
✅ **Preserves Functionality**: List, calendar, filters, search remain unchanged  
✅ **Consistency**: Uses same `HeroSection` component as other pages  
✅ **Fallback Support**: i18n translations as backup  
✅ **Type-Safe**: Fully typed with TypeScript  
✅ **Bilingual**: English and Finnish content supported  
✅ **Pattern Match**: Follows exact same approach as campaigns page

## Comparison with Campaigns Integration

Both Events and Campaigns pages now follow the same pattern:
- Only hero section in page builder
- All dynamic content (lists, filters) remains in code
- Uses `HeroSection` component from page builder
- Bilingual support via separate `page_content` entries
- Fallback to i18n translations

## Future Enhancements

If needed, additional sections can be added to page builder:
- Search/filter UI customization
- Event type descriptions
- Calendar header customization

However, the events list and calendar should remain dynamic (fetched from API) to show real-time data.
