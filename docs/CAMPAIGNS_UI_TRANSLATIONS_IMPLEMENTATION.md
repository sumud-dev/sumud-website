# Campaigns Preview and UI Translations Implementation

## Summary

Successfully implemented preview and UI translations editor for campaigns, following the same pattern used for events. This provides a visual preview of the campaigns page and an editor for managing UI translations in both English and Finnish.

## Files Created

### 1. Components

#### CampaignsPagePreview.tsx
**Location:** `/src/components/admin/campaigns/CampaignsPagePreview.tsx`

- Displays a live preview of the campaigns page with different sections:
  - Hero Section
  - Search & Filters
  - Campaign Categories
  - Campaign Card
  - Empty State
- Fetches real campaign data using `useCampaigns` hook
- Loads translations from the database (namespace: `campaigns`)
- Shows translation keys for each section
- Clickable sections that navigate to the editor

#### CampaignsUITranslationsEditor.tsx
**Location:** `/src/components/admin/campaigns/CampaignsUITranslationsEditor.tsx`

- Full-featured translation editor with two modes:
  - **Preview Mode:** Shows live preview of how translations appear
  - **Editor Mode:** Allows editing translations by section
- Features:
  - Language toggle (English/Finnish)
  - Section-based navigation
  - Edit translations for both languages simultaneously
  - Visual indicators for completed translations
  - Real-time preview updates

### 2. Page Route

#### ui-translations/page.tsx
**Location:** `/src/app/[locale]/admin/campaigns/ui-translations/page.tsx`

- Admin page for campaigns UI translations
- Accessible at: `/admin/campaigns/ui-translations`
- Includes metadata for SEO
- Integrates the `CampaignsUITranslationsEditor` component

### 3. Script

#### add-campaigns-ui-translations.ts
**Location:** `/scripts/add-campaigns-ui-translations.ts`

- Adds all required UI translations to the database
- Creates 128 translation entries across multiple namespaces:
  - `adminSettings.campaigns` - Admin panel labels
  - `adminSettings.campaigns.uiTranslationsEditor` - Editor interface
  - `adminSettings.campaigns.preview` - Preview component
  - `campaigns` - Public-facing campaigns page translations

## Integration Points

### PageBuilderEditor.tsx
**Location:** `/src/components/admin/page-builder/PageBuilderEditor.tsx`

Updated to include campaigns UI translations editor:
```tsx
import { CampaignsUITranslationsEditor } from "@/src/components/admin/campaigns/CampaignsUITranslationsEditor";

// In the render section:
{uiTranslationsNamespace === "campaigns" && <CampaignsUITranslationsEditor />}
```

### Page Builder Configuration
**Script:** `/scripts/configure-campaigns-page-ui-translations.ts`

The campaigns page in `page_builder` table has been configured with a special content structure:
```json
{
  "type": "blocks",
  "data": [{
    "id": "ui-translations-marker",
    "type": "text",
    "content": {
      "type": "ui-translations",
      "namespace": "campaigns"
    }
  }]
}
```

This marker tells the PageBuilderEditor to:
1. Detect that this page uses UI translations
2. Extract the namespace ("campaigns")
3. Render the CampaignsUITranslationsEditor instead of the standard block editor

## Translation Keys Structure

### Admin Settings (adminSettings.campaigns.*)
- `uiTranslations.title` - Page title
- `uiTranslationsEditor.*` - Editor interface labels
- `preview.*` - Preview component labels
- `sections.*` - Section names (hero, filters, categories, card, empty)

### Public Campaigns Page (campaigns.*)
- `hero.*` - Hero section content
- `filters.*` - Search and filter labels
- `categories.*` - Campaign category names
- `card.*` - Campaign card labels and status
- `empty.*` - Empty state messages

## Usage

### Access the UI Translations Editor

There are two ways to access the campaigns UI translations editor:

#### Option 1: Direct Route
1. Navigate to `/admin/campaigns/ui-translations`
2. Switch between Preview and Editor modes
3. In Preview mode, click any section to jump to its editor
4. In Editor mode:
   - Select a language to view (EN or FI)
   - Choose a section (hero, filters, categories, card, empty)
   - Edit translations for both languages
   - Save changes

#### Option 2: Via Page Builder (Recommended)
1. Navigate to `/admin/page-builder/campaigns`
2. The UI translations editor will automatically be shown
3. This provides the same functionality as the direct route
4. Better integration with the page management workflow

### Features
- **Live Preview:** See translations in context
- **Section Navigation:** Jump directly to specific sections
- **Bilingual Editing:** Edit EN and FI simultaneously
- **Visual Feedback:** See which translations are complete
- **Real-time Updates:** Preview updates after saving

## Consistency with Events Implementation

This implementation follows the exact same pattern as events:
- Same component structure and naming convention
- Same UI/UX patterns (Preview + Editor tabs)
- Same translation key organization
- Same database schema usage
- Minimal changes to existing codebase

## Database Translations Added

Total: **128 translation entries**
- Admin interface: 56 translations
- Preview component: 18 translations
- Public campaigns page: 54 translations

All translations are properly namespaced and support both English and Finnish languages.
