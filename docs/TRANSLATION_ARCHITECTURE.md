# Translation Architecture: UI vs Content

## Overview

The application uses two distinct translation systems to prevent conflicts and maintain data integrity:

1. **UI Translations** - Interface elements (stored in `ui_translations` table)
2. **Content Translations** - Dynamic content (stored in dedicated translation tables)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Translation System                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             │
            ┌────────────────┴────────────────┐
            │                                  │
            ▼                                  ▼
┌──────────────────────┐          ┌───────────────────────────┐
│  UI Translations     │          │  Content Translations      │
│  (ui_translations)   │          │  (Dedicated Tables)        │
└──────────────────────┘          └───────────────────────────┘
            │                                  │
            │                                  │
            ▼                                  ▼
   Managed at:                        Managed at:
   /admin/translations                - /admin/page-builder
                                      - /admin/events
   Used for:                          - /admin/campaigns
   - Buttons                          - /admin/articles
   - Labels                           - /admin/content
   - Messages
   - Static UI text                   Used for:
                                      - Page content
   Examples:                          - Event details
   - common.loading                   - Campaign descriptions
   - admin.dashboard.title            - Article bodies
   - errors.notFound                  - Navigation menus
```

## 1. UI Translations

### Purpose
Interface elements that remain consistent across the application.

### Storage
`ui_translations` table with columns:
- `key` - dot notation (e.g., `common.loading`)
- `language` - language code (en, fi, ar)
- `value` - translated text
- `namespace` - organizational category

### Valid Namespaces
- `common` - Shared UI elements
- `admin` - Admin interface
- `adminSettings` - Admin settings pages
- `navigation` - Menu labels (NOT menu content)
- `errors` - Error messages
- `footer` - Footer UI elements
- `homepage` - Homepage UI sections
- `about`, `articlesPage`, `campaignsPage`, `eventsDetail`, etc.

### Management
- **Admin UI**: `/admin/translations`
- **API**: Server actions in `src/actions/translations.ts`
- **Validation**: Automatic namespace validation prevents content conflicts

### Example Keys
```typescript
common.loading = "Loading..."
common.save = "Save"
admin.dashboard.title = "Dashboard"
errors.notFound = "Page not found"
navigation.home = "Home"  // Just the label, not the link config
```

## 2. Content Translations

### Purpose
Dynamic, user-managed content that changes frequently.

### Storage Tables

| Content Type | Translation Table | Managed At |
|-------------|-------------------|------------|
| Custom Pages | `page_builder_translations` | `/admin/page-builder` |
| Events | `event_translations` | `/admin/events` |
| Campaigns | `campaign_translations` | `/admin/campaigns` |
| Articles/Posts | `post_translations` | `/admin/articles` |
| Navigation Config | `navigation_config` | `/admin/content` |

### Management
Each content type has its own admin interface with:
- Built-in translation management
- Language switching
- Draft/publish workflow
- Rich text editing

### Example Content
```typescript
// Page (page_builder_translations)
{
  title: "About Us",
  content: "<rich HTML content>",
  language: "en"
}

// Event (event_translations)
{
  title: "Community Gathering",
  description: "Join us for...",
  language: "fi"
}

// Campaign (campaign_translations)
{
  title: "Support Palestine",
  content: "Full campaign description...",
  language: "ar"
}
```

## Key Differences

| Aspect | UI Translations | Content Translations |
|--------|----------------|---------------------|
| **Nature** | Static interface text | Dynamic user content |
| **Storage** | Single table (`ui_translations`) | Multiple dedicated tables |
| **Format** | Simple key-value pairs | Rich structured data |
| **Management** | `/admin/translations` | Content-specific admin pages |
| **Examples** | Buttons, labels, messages | Pages, events, campaigns |
| **Validation** | Namespace validation | Content-specific validation |

## Why Separate Systems?

### 1. Prevents Conflicts
Content managers shouldn't accidentally modify UI translations, and developers shouldn't interfere with content.

### 2. Different Workflows
- UI: Batch updates, developer-driven, structured keys
- Content: Rich editing, WYSIWYG, version control

### 3. Performance
Content tables are optimized for complex queries with relations, while UI translations are optimized for quick key lookups.

### 4. Access Control
Different permission levels:
- Content managers → Content translations
- Developers/Admins → UI translations

## Validation System

### Automatic Protection
The system validates namespaces to prevent mistakes:

```typescript
// ✅ ALLOWED
upsertTranslation({
  key: "common.newButton",
  namespace: "common",  // Valid UI namespace
  value: "Click Me"
});

// ❌ BLOCKED
upsertTranslation({
  key: "events.myEvent",
  namespace: "events",  // Content namespace - blocked!
  value: "Event Title"
});
// Error: "events" should be managed in event_translations
// Suggestion: Please use /admin/events to manage Event details
```

### Implementation
See `src/lib/translations/namespace-validation.ts` for:
- `validateTranslationNamespace()` - Check if namespace is valid
- `isValidUINamespace()` - Validate UI namespaces
- `getContentTableInfo()` - Get content table info

## Best Practices

### For UI Translations
1. Use descriptive dot-notation keys
2. Group by namespace logically
3. Add all languages when creating new keys
4. Test in all supported languages

### For Content Translations
1. Use the content-specific admin interface
2. Utilize draft/publish workflow
3. Preview before publishing
4. Keep translations synchronized

### For Developers
1. Always check namespace validity before inserting
2. Use the admin UI for UI translations
3. Use content managers for content translations
4. Don't mix the two systems

## Migration Notes

Previously, all translations were in JSON files. Now:
- ✅ UI translations → `ui_translations` table
- ✅ Content managed → Dedicated translation tables
- ❌ JSON files → Removed (historical backups only)

## Troubleshooting

### "My translation isn't showing"
1. Check if it's UI or content
2. UI → Check `/admin/translations`
3. Content → Check respective admin page
4. Verify `is_active` flag is true

### "I can't add a translation for 'pages'"
This is intentional! Pages are content, not UI. Use `/admin/page-builder` instead.

### "Namespace validation failed"
The system is protecting you from creating translations in the wrong place. Follow the suggestion message to use the correct admin interface.

## See Also

- [TRANSLATION_SYSTEM.md](./TRANSLATION_SYSTEM.md) - Complete technical documentation
- [ADDING_TRANSLATIONS.md](./ADDING_TRANSLATIONS.md) - Quick reference guide
- `src/lib/translations/namespace-validation.ts` - Validation implementation
