# Content Schema Documentation

## Overview
This document defines the schema for content files in the locale-first structure.

## Directory Structure

```
content/
├── {locale}/
│   ├── pages/
│   │   └── {slug}.json
│   └── navigation/
│       └── {navId}.json
messages/
└── {locale}.json
```

## Supported Locales
- `en` - English
- `fi` - Finnish (default)
- `ar` - Arabic

---

## Page Schema

### File Location
`content/{locale}/pages/{slug}.json`

### Schema Definition

```typescript
interface LocalizedPageData {
  slug: string;                    // URL-friendly identifier
  title: string;                   // Page title (localized)
  description?: string;            // Page description (localized)
  status: 'draft' | 'published' | 'archived';
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
  blocks: PageBlock[];            // Array of content blocks
}

interface PageBlock {
  id: string;                     // Unique block identifier
  type: string;                   // Block type (e.g., 'hero', 'text', 'image')
  content: Record<string, any>;   // Block-specific content (fully localized)
}
```

### Example

```json
{
  "slug": "about",
  "title": "About Us - Sumud",
  "description": "Learn about our mission and values",
  "status": "published",
  "createdAt": "2026-01-06T12:00:00.000Z",
  "updatedAt": "2026-01-15T10:30:00.000Z",
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "About Sumud",
        "subtitle": "Our Story",
        "description": "Empowering Palestinian communities worldwide",
        "image": "/images/about-hero.jpg"
      }
    }
  ]
}
```

### Block Content Guidelines

1. **Fully Localized**: Each locale file should have fully translated content
2. **No Nested Translations**: Avoid `{ en: "text", fi: "teksti" }` structures
3. **Consistent Structure**: Maintain the same block structure across all locales
4. **Asset Paths**: Use absolute paths or CDN URLs for images

---

## Navigation Schema

### File Location
`content/{locale}/navigation/{navId}.json`

Supported navigation IDs:
- `header` - Main site header navigation
- `footer` - Site footer navigation

### Schema Definition

```typescript
interface LocalizedNavigationConfig {
  id: string;                                // Navigation identifier
  siteName?: string;                         // Site name (localized)
  logo?: string;                            // Logo URL
  items?: LocalizedNavItem[];               // Main navigation items
  quickLinks?: LocalizedNavItem[];          // Footer quick links
  getInvolvedLinks?: LocalizedNavItem[];    // Footer get involved section
  resourceLinks?: LocalizedNavItem[];       // Footer resources section
  legalLinks?: LocalizedNavItem[];          // Footer legal links
  newsletter?: {                            // Footer newsletter section
    title?: string;
    subtitle?: string;
  };
  copyright?: string;                       // Copyright text (localized)
  contact?: {                               // Contact information
    email: string;
    phone: string;
    location: string;
  };
  updatedAt: string;                        // ISO 8601 timestamp
}

interface LocalizedNavItem {
  label: string;                            // Display text (localized)
  href: string;                             // Link URL
  children?: LocalizedNavItem[];            // Nested navigation items
}
```

### Example - Header

```json
{
  "id": "header",
  "siteName": "Sumud",
  "logo": "/images/logo.svg",
  "items": [
    {
      "label": "Home",
      "href": "/"
    },
    {
      "label": "About",
      "href": "/about",
      "children": [
        {
          "label": "Our Team",
          "href": "/about/team"
        }
      ]
    }
  ],
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

### Example - Footer

```json
{
  "id": "footer",
  "quickLinks": [
    { "label": "Home", "href": "/" },
    { "label": "About", "href": "/about" }
  ],
  "getInvolvedLinks": [
    { "label": "Volunteer", "href": "/volunteer" },
    { "label": "Donate", "href": "/donate" }
  ],
  "resourceLinks": [
    { "label": "Blog", "href": "/blog" },
    { "label": "Resources", "href": "/resources" }
  ],
  "legalLinks": [
    { "label": "Privacy Policy", "href": "/privacy" },
    { "label": "Terms of Service", "href": "/terms" }
  ],
  "newsletter": {
    "title": "Stay Updated",
    "subtitle": "Subscribe to our newsletter"
  },
  "copyright": "© 2026 Sumud. All rights reserved.",
  "contact": {
    "email": "info@sumud.fi",
    "phone": "+358 XX XXX XXXX",
    "location": "Helsinki, Finland"
  },
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

---

## Messages Schema

### File Location
`messages/{locale}.json`

### Purpose
The messages files contain **UI strings only** - buttons, labels, validation messages, and common text that appears throughout the application interface.

### Schema Definition

```typescript
interface Messages {
  [namespace: string]: {
    [key: string]: string | Messages;
  };
}
```

### Namespaces

Organize messages by feature or component:

- `common` - Shared UI strings (buttons, actions)
- `navigation` - Navigation-specific UI text
- `forms` - Form labels, validation messages
- `errors` - Error messages
- `[component]` - Component-specific messages

### Example

```json
{
  "common": {
    "readMore": "Read More",
    "close": "Close",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "loading": "Loading..."
  },
  "forms": {
    "email": "Email",
    "password": "Password",
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email"
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  }
}
```

### Guidelines

1. **UI Only**: Keep page-specific content in page files
2. **Reuse Keys**: Avoid duplication (e.g., one "Close" translation)
3. **Consistent Namespaces**: Group related strings
4. **No HTML**: Keep translations as plain text
5. **Interpolation**: Use `{variable}` for dynamic values

---

## Content vs Messages

### Use Page Content For:
- Page-specific text and images
- Content managed by content editors
- SEO metadata (titles, descriptions)
- Marketing content that changes frequently
- Locale-specific page structures

### Use Messages For:
- Button labels and UI actions
- Form field labels
- Validation messages
- Error messages
- Navigation link labels (optional)
- Common interface text

---

## Best Practices

### Content Files

1. **Consistent Structure**: Maintain same block order across locales
2. **Unique IDs**: Use descriptive, unique block IDs
3. **Timestamps**: Always update `updatedAt` when modifying
4. **Status Management**: Use `draft` for unpublished content
5. **Asset Management**: Store images in CDN or `/public`

### Localization

1. **Complete Translations**: Ensure all locales have complete content
2. **Fallback Strategy**: English (`en`) serves as fallback
3. **Cultural Adaptation**: Adjust content for local context, not just translation
4. **RTL Support**: Consider text direction for Arabic (`ar`)
5. **URL Structure**: Use locale-appropriate slugs when needed

### File Organization

1. **One Page = One File per Locale**: Each page exists separately in each locale folder
2. **Consistent Naming**: Use same filename across all locales
3. **Version Control**: Commit all locale files together when making structural changes
4. **Documentation**: Document intentional differences between locales

---

## Migration from Legacy Format

### Legacy Format (Deprecated)

```json
{
  "slug": "about",
  "translations": {
    "en": { "title": "About", "blocks": [...] },
    "fi": { "title": "Tietoa", "blocks": [...] }
  }
}
```

### New Format (Current)

```json
// content/en/pages/about.json
{
  "slug": "about",
  "title": "About",
  "blocks": [...]
}

// content/fi/pages/about.json
{
  "slug": "about",
  "title": "Tietoa",
  "blocks": [...]
}
```

### Migration Steps

1. Read legacy file
2. Extract each locale's data
3. Create separate file per locale
4. Verify content integrity
5. Remove legacy file

---

## Validation

### Required Fields

**Pages:**
- `slug` (string, alphanumeric + hyphens)
- `title` (string, non-empty)
- `status` ('draft' | 'published' | 'archived')
- `createdAt` (ISO 8601 string)
- `updatedAt` (ISO 8601 string)
- `blocks` (array)

**Navigation:**
- `id` (string)
- `updatedAt` (ISO 8601 string)

### Validation Rules

1. **Unique Slugs**: Each page slug must be unique within a locale
2. **Valid Timestamps**: Must be valid ISO 8601 format
3. **Block IDs**: Must be unique within a page
4. **URLs**: Must be valid absolute or relative URLs
5. **Status**: Must be one of: draft, published, archived

---

## Tools and Utilities

### Available Functions

```typescript
// Pages
readLocalizedPage(locale, slug): Promise<LocalizedPageData | null>
writeLocalizedPage(locale, page): Promise<void>
readPage(slug): Promise<PageData | null>  // Legacy compatibility
listPages(): Promise<PageSummary[]>
pageExists(slug): Promise<boolean>
deletePage(slug): Promise<boolean>

// Navigation
readLocalizedNavigation(locale, navId): Promise<LocalizedNavigationConfig | null>
writeLocalizedNavigation(locale, config): Promise<void>
readHeaderConfig(): Promise<LegacyHeaderConfig>
readFooterConfig(): Promise<LegacyFooterConfig>
```

### Usage Example

```typescript
import { readLocalizedPage, writeLocalizedPage } from '@/src/lib/pages/file-storage';

// Read a page
const page = await readLocalizedPage('en', 'about');

// Update and save
if (page) {
  page.title = 'Updated Title';
  page.updatedAt = new Date().toISOString();
  await writeLocalizedPage('en', page);
}
```

---

## FAQ

**Q: Should I translate slugs for different locales?**
A: Generally, keep slugs consistent across locales for simpler routing. Use localized content within the page instead.

**Q: What if a page doesn't exist in all locales?**
A: The system will fall back to English. However, best practice is to provide content for all supported locales.

**Q: Can I have different block structures per locale?**
A: Technically yes, but not recommended. Maintain consistent structure for easier maintenance.

**Q: Where should I put reusable content snippets?**
A: Create a shared component or use the messages file for common UI text. For content snippets, consider a dedicated content type.

**Q: How do I handle images with text?**
A: Store locale-specific images separately and reference them in each locale's file, or use overlay text in the page blocks.

---

## See Also

- [i18n Content Structure Migration Plan](./localizing-content.md)
- Page Builder Documentation
- Navigation Builder Documentation
