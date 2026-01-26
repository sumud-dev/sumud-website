# Quick Reference: Adding Translations

## For Admins (Recommended)

1. Navigate to `/admin/translations` (or `/en/admin/translations`)
2. Select the language you want to add a translation for
3. Click "Add Translation" button
4. Fill in the form:
   - **Key**: Use dot notation (e.g., `common.newButton`)
   - **Value**: The translated text
   - **Namespace**: Category (e.g., `common`, `admin`, `navigation`)
   - **Language**: Select the language
5. Click "Create"
6. Changes are live immediately!

## For Developers

### Method 1: Using Server Action (Recommended)

```typescript
import { upsertTranslationAction } from "@/src/actions/translations";

// Single translation
await upsertTranslationAction({
  key: "common.newKey",
  language: "en",
  value: "New Translation",
  namespace: "common",
});

// Bulk translations
await bulkUpsertTranslationsAction([
  {
    key: "common.key1",
    language: "en",
    value: "Translation 1",
    namespace: "common",
  },
  {
    key: "common.key2",
    language: "en",
    value: "Translation 2",
    namespace: "common",
  },
]);
```

### Method 2: Direct Database Query

```typescript
import { upsertTranslation } from "@/src/lib/db/queries/translations";

await upsertTranslation({
  key: "admin.newFeature.title",
  language: "en",
  value: "New Feature",
  namespace: "admin",
});
```

### Method 3: Direct SQL (for bulk operations)

```sql
INSERT INTO ui_translations (key, language, value, namespace)
VALUES 
  ('common.key1', 'en', 'Translation 1', 'common'),
  ('common.key1', 'fi', 'Käännös 1', 'common'),
  ('common.key1', 'ar', 'ترجمة 1', 'common')
ON CONFLICT (key, language) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
```

## Best Practices

### Key Naming
- Use dot notation: `namespace.section.key`
- Keep it descriptive but concise
- Examples:
  - `common.loading` ✅
  - `admin.dashboard.welcomeMessage` ✅
  - `eventsDetail.registration.title` ✅
  - `xyz` ❌ (too vague)

### Namespaces
Common namespaces in use:
- `common` - Shared UI elements (buttons, labels, etc.)
- `admin` - Admin interface specific
- `adminSettings` - Admin settings pages
- `navigation` - Navigation menu labels (UI only, not navigation config)
- `homepage` - Homepage specific content
- `eventsDetail` - Event detail pages
- `errors` - Error messages
- `footer` - Footer content

**⚠️ Important: UI Translations vs Content Translations**

UI translations (stored in `ui_translations` table) are for:
- Interface elements, buttons, labels, messages
- Static page content and UI sections
- Error messages and notifications

Content translations (stored in dedicated tables) are for:
- **Pages** → Managed in Page Builder (`page_builder_translations`)
- **Events** → Managed in Events Manager (`event_translations`)
- **Campaigns** → Managed in Campaigns Manager (`campaign_translations`)
- **Posts/Articles** → Managed in Articles Manager (`post_translations`)
- **Navigation Config** → Managed in Content Settings (`navigation_config`)

Do NOT create translations for content items (pages, events, campaigns, posts) in the UI translations table. Use the respective admin interfaces instead.

### Adding Translations for All Languages

When adding a new key, add it for all supported languages:
- English (en)
- Finnish (fi)
- Arabic (ar)

```typescript
const key = "common.newFeature";
const namespace = "common";

await bulkUpsertTranslationsAction([
  { key, language: "en", value: "New Feature", namespace },
  { key, language: "fi", value: "Uusi ominaisuus", namespace },
  { key, language: "ar", value: "ميزة جديدة", namespace },
]);
```

## Testing Translations

### In Code
```typescript
// Server Component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("common");
const text = t("newKey");

// Client Component
import { useTranslations } from "next-intl";
const t = useTranslations("common");
const text = t("newKey");
```

### Manual Testing
1. Visit `/admin/translations`
2. Search for your new key
3. Verify it appears in all languages
4. Navigate to the page that uses the translation
5. Switch languages using the language selector
6. Verify the translation displays correctly

## Common Issues

### Translation Not Showing
1. Check key exists: `/admin/translations` → search for key
2. Verify `is_active` is true
3. Clear Next.js cache: `rm -rf .next && npm run build`
4. Check browser console for errors

### Adding Missing Translation
```typescript
// Check what's missing
import { compareTranslationsAction } from "@/src/actions/translations";
const result = await compareTranslationsAction("en", "ar");
console.log(result.data.missingInTarget); // Shows missing keys
```

## Migration from JSON (Historical)

The `messages/` folder has been removed. All translations are now in the database. If you need to reference old translations, check git history:

```bash
git show HEAD~10:messages/en.json
```

## Current Translation Counts

- English (en): 941 translations
- Finnish (fi): 864 translations
- Arabic (ar): 620 translations

Use the admin UI to see coverage and find missing translations.
