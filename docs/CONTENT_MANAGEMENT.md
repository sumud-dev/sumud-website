# Content Management System

## Overview

This document provides a comprehensive guide to the content management system, including the i18n (internationalization) architecture and page builder functionality.

## Table of Contents

1. [Architecture](#architecture)
2. [Directory Structure](#directory-structure)
3. [Content Types](#content-types)
4. [Working with Pages](#working-with-pages)
5. [Working with Navigation](#working-with-navigation)
6. [Working with Translations](#working-with-translations)
7. [Content Service API](#content-service-api)
8. [Migration Guide](#migration-guide)
9. [Best Practices](#best-practices)

---

## Architecture

### Locale-First Structure

The content system uses a **locale-first** architecture where each locale has its own complete set of content files. This provides:

- ✅ Complete independence per locale
- ✅ Easier content management
- ✅ Better SEO with locale-specific content
- ✅ Simplified deployment and versioning
- ✅ Flexibility for market-specific content

### Separation of Concerns

```
content/          → Page and navigation content (managed by editors)
messages/         → UI strings and labels (managed by developers)
```

---

## Directory Structure

```
project-root/
├── content/
│   ├── en/                    # English content
│   │   ├── pages/            # Page files
│   │   │   ├── home.json
│   │   │   ├── about.json
│   │   │   └── ...
│   │   └── navigation/       # Navigation configs
│   │       ├── header.json
│   │       └── footer.json
│   ├── fi/                    # Finnish content (same structure)
│   └── ar/                    # Arabic content (same structure)
├── messages/
│   ├── en.json               # English UI strings
│   ├── fi.json               # Finnish UI strings
│   └── ar.json               # Arabic UI strings
├── src/
│   └── lib/
│       ├── content/          # Content utilities
│       │   ├── service.ts    # Content service
│       │   ├── helpers.ts    # Helper functions
│       │   └── validator.ts  # Validation utilities
└── scripts/
    └── migrate-content.ts    # Migration tools
```

---

## Content Types

### 1. Pages

Page files contain the complete content for a single page in a specific locale.

**Location:** `content/{locale}/pages/{slug}.json`

**Schema:**
```typescript
{
  slug: string;              // URL identifier
  title: string;            // Page title
  description?: string;     // Meta description
  status: 'draft' | 'published' | 'archived';
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  blocks: PageBlock[];      // Content blocks
}
```

**Example:**
```json
{
  "slug": "about",
  "title": "About Us",
  "description": "Learn about our mission",
  "status": "published",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z",
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "About Sumud",
        "subtitle": "Our Story"
      }
    }
  ]
}
```

### 2. Navigation

Navigation files define site navigation structures per locale.

**Location:** `content/{locale}/navigation/{navId}.json`

**Supported IDs:** `header`, `footer`

**Schema:**
```typescript
{
  id: string;
  siteName?: string;
  items?: NavItem[];
  quickLinks?: NavItem[];
  // ... other navigation sections
  updatedAt: string;
}
```

### 3. Messages

UI strings for interface elements.

**Location:** `messages/{locale}.json`

**Schema:**
```json
{
  "common": {
    "readMore": "Read More",
    "close": "Close"
  },
  "forms": {
    "submit": "Submit",
    "required": "This field is required"
  }
}
```

---

## Working with Pages

### Reading a Page

```typescript
import ContentService from '@/src/lib/content/service';

// Get page for specific locale
const page = await ContentService.getPage('en', 'about');

// Get page with all locales (legacy)
const allLocales = await ContentService.getPageAllLocales('about');
```

### Creating a Page

```typescript
const result = await ContentService.createPage('en', {
  slug: 'new-page',
  title: 'New Page Title',
  description: 'Page description',
  status: 'draft',
  blocks: [],
});

if (!result.success) {
  console.error(result.error);
}
```

### Updating a Page

```typescript
const result = await ContentService.updatePage('en', 'about', {
  title: 'Updated Title',
  status: 'published',
});
```

### Deleting a Page

```typescript
// Deletes from all locales
const result = await ContentService.deletePage('old-page');
```

### Listing Pages

```typescript
const pages = await ContentService.listPages();
// Returns summaries from default locale
```

### Checking Page Status

```typescript
// Check if page exists in any locale
const exists = await ContentService.pageExists('about');

// Check status across all locales
const status = await ContentService.getPageLocaleStatus('about');
// Returns: { en: true, fi: true, ar: false }
```

### Copying Between Locales

```typescript
// Copy English version to Finnish
const result = await ContentService.copyPageToLocale('en', 'fi', 'about');
```

---

## Working with Navigation

### Reading Navigation

```typescript
// Get header navigation
const header = await ContentService.getNavigation('en', 'header');

// Get footer navigation
const footer = await ContentService.getNavigation('en', 'footer');
```

### Updating Navigation

```typescript
const result = await ContentService.updateNavigation('en', {
  id: 'header',
  siteName: 'Sumud',
  items: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'About',
      href: '/about',
      children: [
        {
          label: 'Our Team',
          href: '/about/team',
        },
      ],
    },
  ],
});
```

---

## Working with Translations

### Using UI Messages

```typescript
// In a client component
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <button>{t('readMore')}</button>
  );
}
```

### Extracting Localized Content

```typescript
import ContentService from '@/src/lib/content/service';

// If content has embedded locales (legacy format)
const content = {
  en: { title: 'English Title' },
  fi: { title: 'Finnish Title' },
};

// Extract for specific locale
const localized = ContentService.extractLocalizedContent(content, 'fi');
// Returns: { title: 'Finnish Title' }
```

### Helper Functions

```typescript
import {
  getLocalizedContent,
  hasEmbeddedLocales,
  normalizeBlockContent,
  isValidLocale,
  getLocaleDisplayName,
  isRTL,
} from '@/src/lib/content/helpers';

// Check if content has embedded locales
if (hasEmbeddedLocales(data)) {
  // Extract specific locale
  const content = getLocalizedContent(data, 'en');
}

// Normalize blocks with embedded translations
const normalizedBlocks = normalizeBlockContent(blocks, 'fi');

// Locale utilities
isValidLocale('en'); // true
getLocaleDisplayName('fi'); // 'Suomi'
isRTL('ar'); // true
```

---

## Content Service API

### ContentService Methods

#### Pages

- `getPage(locale, slug)` - Get page for specific locale
- `getPageAllLocales(slug)` - Get page with all translations
- `createPage(locale, data)` - Create new page
- `updatePage(locale, slug, updates)` - Update existing page
- `deletePage(slug)` - Delete page from all locales
- `listPages()` - List all pages
- `pageExists(slug)` - Check if page exists
- `getPageLocaleStatus(slug)` - Get availability per locale
- `copyPageToLocale(source, target, slug)` - Copy to another locale
- `syncPageMetadata(slug, updates)` - Sync metadata across locales

#### Navigation

- `getNavigation(locale, navId)` - Get navigation config
- `updateNavigation(locale, config)` - Update navigation

#### Content Extraction

- `extractLocalizedContent(content, locale, fallback)` - Extract locale-specific content

---

## Migration Guide

### Migrating from Legacy Format

The project includes migration tools for converting from the old format to the new locale-first structure.

#### Step 1: Create Backup

```bash
npx tsx scripts/migrate-content.ts backup
```

#### Step 2: Migrate Pages

```bash
npx tsx scripts/migrate-content.ts pages
```

#### Step 3: Verify Migration

```bash
npx tsx scripts/migrate-content.ts verify
```

#### Step 4: Full Migration

```bash
npx tsx scripts/migrate-content.ts all
```

### Legacy Format vs New Format

**Legacy (Deprecated):**
```json
{
  "slug": "about",
  "translations": {
    "en": {
      "title": "About",
      "blocks": [...]
    },
    "fi": {
      "title": "Tietoa",
      "blocks": [...]
    }
  }
}
```

**New (Current):**

File: `content/en/pages/about.json`
```json
{
  "slug": "about",
  "title": "About",
  "blocks": [...]
}
```

File: `content/fi/pages/about.json`
```json
{
  "slug": "about",
  "title": "Tietoa",
  "blocks": [...]
}
```

---

## Best Practices

### Content Organization

1. **Keep files small**: Break large pages into components or separate pages
2. **Consistent naming**: Use same filename across all locales
3. **Meaningful slugs**: Use descriptive, SEO-friendly slugs
4. **Status management**: Use `draft` for unpublished content

### Localization

1. **Complete translations**: Ensure all locales have complete content
2. **Cultural adaptation**: Adjust content for local context, not just translate
3. **Avoid embedded locales**: Keep content fully localized per file
4. **Test RTL layouts**: Verify Arabic content displays correctly

### Version Control

1. **Commit together**: Update all locale files in same commit
2. **Document changes**: Explain locale-specific differences
3. **Use branches**: Create feature branches for major content changes
4. **Review carefully**: Check all locales before merging

### Performance

1. **Static generation**: Use static generation for better performance
2. **Incremental updates**: Only revalidate changed pages
3. **Optimize images**: Use CDN and proper image formats
4. **Cache effectively**: Leverage Next.js caching

### Validation

Always validate content before saving:

```typescript
import { validatePageFile } from '@/src/lib/content/validator';

const validation = await validatePageFile('en', pageData, {
  checkLocalization: true,
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Error Handling

```typescript
try {
  const result = await ContentService.updatePage('en', 'about', updates);
  
  if (!result.success) {
    // Handle error
    console.error(result.error);
  }
} catch (error) {
  // Handle exception
  console.error('Unexpected error:', error);
}
```

---

## Troubleshooting

### Page Not Found

```typescript
// Check if page exists
const exists = await ContentService.pageExists('my-page');

// Check locale availability
const status = await ContentService.getPageLocaleStatus('my-page');
```

### Embedded Locale Keys Warning

If you see warnings about embedded locale keys, your content has the old format:

```typescript
// Bad (embedded locales)
{
  "content": {
    "title": {
      "en": "English",
      "fi": "Finnish"
    }
  }
}

// Good (fully localized)
{
  "content": {
    "title": "English"  // In en/pages/
  }
}
```

### Validation Errors

Check validation errors for detailed information:

```typescript
const validation = await validatePageFile('en', data);
if (!validation.valid) {
  validation.errors.forEach(error => {
    console.log(`Field: ${error.field}`);
    console.log(`Error: ${error.message}`);
  });
}
```

---

## See Also

- [Content Schema Documentation](./CONTENT_SCHEMA.md)
- [Localization Migration Plan](./localizing-content.md)
- [Page Builder Guide](../src/components/admin/page-builder/README.md)
- [Navigation Builder Guide](../src/components/admin/navigation-builder/README.md)

---

## Support

For questions or issues:
1. Check existing documentation
2. Review code examples in this guide
3. Consult the schema documentation
4. Check validation error messages
