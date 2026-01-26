# Translation System Migration

## Overview

The translation system has been migrated from static JSON files to a database-backed solution. This provides better management capabilities, real-time updates, and a user-friendly admin interface.

**Important**: The `messages/` folder has been removed. All translations are now stored in and loaded from the database.

## What Changed

### Before
- Translations stored in static JSON files: `messages/en.json`, `messages/ar.json`, `messages/fi.json`
- Required code deployment for any translation changes
- No easy way to track translation coverage or manage missing translations

### After
- ✅ Translations stored in `ui_translations` database table
- ✅ Real-time updates through admin interface at `/admin/translations`
- ✅ Easy translation management, comparison, and coverage tracking
- ✅ No JSON files needed - system reads directly from database
- ✅ `messages/` folder has been removed from the codebase

## Database Schema

### Table: `ui_translations`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | TEXT | Dot-notation key (e.g., `common.loading`) |
| language | TEXT | Language code (`en`, `ar`, `fi`) |
| value | TEXT | Translated text |
| namespace | TEXT | Organization category (e.g., `common`, `admin`) |
| metadata | JSONB | Optional metadata (placeholders, context, notes) |
| is_active | BOOLEAN | Whether translation is active |
| needs_review | BOOLEAN | Flag for translations needing review |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| created_by | UUID | Creator user ID |
| updated_by | UUID | Last updater user ID |

**Unique Constraint**: `(key, language)` - ensures one translation per key per language

**Indexes**:
- `key` - for quick key lookups
- `language` - for language filtering
- `namespace` - for namespace filtering
- `(namespace, language)` - composite for combined queries
- `is_active` - for filtering active translations

## File Structure

### Core Files

```
src/
├── lib/db/schema/translations.ts       # Database schema definition
├── lib/db/queries/translations.ts      # Query functions
├── actions/translations.ts              # Server actions for admin UI
├── components/admin/translations/
│   └── TranslationsManagement.tsx      # Admin UI component
├── app/[locale]/admin/translations/
│   └── page.tsx                        # Admin page
└── i18n/request.ts                     # Updated to fetch from DB

drizzle/
└── 0016_create_ui_translations_table.sql  # Migration SQL

scripts/
└── migrate-translations-to-db.ts       # Migration script
```

## Usage

### For Developers

#### Accessing Translations (No Change)
```typescript
// In Server Components
import { getTranslations } from "next-intl/server";
const t = await getTranslations("common");
const loadingText = t("loading");

// In Client Components
import { useTranslations } from "next-intl";
const t = useTranslations("common");
const loadingText = t("loading");
```

#### Adding New Translations (Database)
```typescript
import { upsertTranslationAction } from "@/src/actions/translations";

await upsertTranslationAction({
  key: "common.newKey",
  language: "en",
  value: "New Translation",
  namespace: "common",
});
```

### For Admins

1. **Access Admin Interface**
   - Navigate to `/admin/translations` (or `/en/admin/translations`)
   
2. **View Translations**
   - Select language and namespace from dropdown filters
   - Search by key or value
   - View translation statistics

3. **Edit Translation**
   - Click pencil icon on any translation
   - Update the value
   - Save changes (live immediately)

4. **Create Translation**
   - Click "Add Translation" button
   - Fill in key, value, namespace, and language
   - Save (validates uniqueness)

5. **Compare Languages**
   - Click "Compare" button
   - Enter target language code
   - View coverage percentage and missing keys

## API Reference

### Query Functions

```typescript
// Get all translations for a language
getTranslationsByLanguage(language: string): Promise<UITranslation[]>

// Get translations by namespace
getTranslationsByNamespace(namespace: string, language: string): Promise<UITranslation[]>

// Get single translation
getTranslationByKey(key: string, language: string): Promise<UITranslation | null>

// Get as nested object (for next-intl)
getTranslationsObject(language: string): Promise<TranslationData>

// Create or update
upsertTranslation(data: {...}): Promise<UITranslation>

// Bulk upsert
bulkUpsertTranslations(translations: [...], updatedBy?: string): Promise<void>

// Statistics
getTranslationStats(language: string): Promise<{...}>
```

### Server Actions

All query functions have corresponding server actions in `src/actions/translations.ts`:
- `getTranslationsAction`
- `getTranslationsByNamespaceAction`
- `upsertTranslationAction`
- `bulkUpsertTranslationsAction`
- `compareTranslationsAction`
- etc.

## Migration Guide

### Initial Migration (Already Completed)

```bash
# 1. Create database table
psql $DATABASE_URL -f drizzle/0016_create_ui_translations_table.sql

# 2. Migrate JSON to database
npx tsx scripts/migrate-translations-to-db.ts
```

### Current Translation Counts

- English (en): 941 translations
- Arabic (ar): 620 translations  
- Finnish (fi): 864 translations

## Backup & Recovery

### Backup Current Database Translations

```bash
# Export all translations to JSON
source .env.local && psql "$DATABASE_URL" -c "
  SELECT json_build_object(
    'language', language,
    'translations', json_agg(
      json_build_object(
        'key', key,
        'value', value,
        'namespace', namespace
      )
    )
  )
  FROM ui_translations
  WHERE is_active = true
  GROUP BY language
" > backup-translations-all.json
```

### Restore from Database Backup

To restore translations, use the bulk upsert function or the admin interface at `/admin/translations`.

**Note**: The JSON files in `messages/` folder have been permanently removed. All translation data exists only in the database.

## Best Practices

1. **Naming Keys**: Use dot notation (e.g., `namespace.section.key`)
2. **Namespaces**: Group related translations (common, admin, errors, etc.)
3. **Placeholders**: Document in metadata: `{ placeholders: ["{count}", "{name}"] }`
4. **Review Flag**: Mark translations needing review with `needs_review: true`
5. **Testing**: Always test in all languages after updates

## Troubleshooting

### Translations Not Showing

1. Check database connection
2. Verify translation exists: `psql $DATABASE_URL -c "SELECT * FROM ui_translations WHERE key = 'your.key' AND language = 'en';"`
3. Check `is_active` flag
4. Clear Next.js cache: `rm -rf .next && npm run build`

### Add Missing Translation

Use the admin UI at `/admin/translations` or run:
```typescript
await upsertTranslationAction({
  key: "namespace.key",
  language: "en",
  value: "Translation text",
  namespace: "namespace",
});
```

## Future Enhancements

- [ ] Translation history/versioning
- [ ] Auto-translation suggestions (AI-powered)
- [ ] Import/export translations (CSV, JSON)
- [ ] Translation approval workflow
- [ ] Context screenshots for translators
- [ ] Pluralization support
- [ ] RTL language optimizations

## Support

For issues or questions:
1. Check this documentation
2. Review code in `src/lib/db/queries/translations.ts`
3. Contact the development team
