{
  "blocks": [
    {
      "id": "block-123",
      "type": "hero",
      "content": {
        "en": {
          "title": "Welcome to our site",
          "subtitle": "Best products here"
        },
        "es": {
          "title": "Bienvenido a nuestro sitio",
          "subtitle": "Los mejores productos aquí"
        },
        "fi": {
          "title": "Tervetuloa sivustollemme",
          "subtitle": "Parhaat tuotteet täällä"
        }
      },
      "meta": {
        "defaultLang": "en",
        "autoTranslated": ["es", "fi"],
        "lastTranslated": "2025-01-07T10:00:00Z"
      }
    }
  ]
}
```

---

## Prompt for GitHub Copilot:
```
Create a Next.js 14+ App Router page builder system with multi-language support using Server Actions and DeepL:

**Core Requirements:**

1. Type Definitions (types/page-builder.ts):
   - Block interface with id, type, content (nested: content[locale][fieldName])
   - TranslationMeta with defaultLang, autoTranslated array, timestamps
   - PageData interface containing blocks array and page metadata

2. Server Actions (app/actions/translations.ts):
   - `translateBlock(blockId, sourceLang, targetLang, sourceContent)` - calls DeepL API
   - `translateAllBlocks(pageId, targetLang)` - translates entire page
   - `saveTranslations(blockId, locale, translations)` - persists to JSON/database
   - Use 'use server' directive
   - Secure DeepL API key in environment variables
   - Include revalidatePath() after mutations
   - Add error handling and rate limiting

3. Utilities (lib/i18n-utils.ts):
   - `getBlockContent(block, locale, fallbackLocale)` - retrieves content with fallback chain
   - `isTranslated(block, locale)` - checks translation completeness
   - `getMissingTranslations(blocks, locale)` - identifies untranslated content
   - `formatForDeepL(content)` - prepares content for API

4. Components:
   - Client Component: TranslationButton with useTransition for loading states
   - Server Component: BlockRenderer that reads locale and displays correct content
   - Admin Component: TranslationManager showing translation status per language

5. Data Persistence:
   - Functions to read/write blocks JSON file in /data directory
   - Atomic write operations to prevent corruption
   - Optional: migrate to database schema (Prisma model)

6. Next.js Integration:
   - Use next-intl or similar for routing and locale detection
   - Middleware for locale routing (middleware.ts)
   - Support for dynamic [locale] routes
   - Optimistic updates in UI before server action completes

7. Best Practices:
   - Server-side only DeepL API calls (never expose key)
   - Zod validation for action inputs
   - TypeScript strict mode
   - Cache translations, avoid redundant API calls
   - Loading states with useTransition
   - Toast notifications for translation success/errors

Generate the complete setup with types, actions, utilities, and example components.