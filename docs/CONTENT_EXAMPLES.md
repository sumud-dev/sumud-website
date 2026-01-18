# Content System Usage Examples

This document provides practical examples of using the content system.

## Table of Contents

1. [Basic Page Operations](#basic-page-operations)
2. [Working with Blocks](#working-with-blocks)
3. [Navigation Management](#navigation-management)
4. [Multi-locale Workflows](#multi-locale-workflows)
5. [Validation Examples](#validation-examples)
6. [Migration Examples](#migration-examples)

---

## Basic Page Operations

### Example 1: Create a New Page

```typescript
import ContentService from '@/src/lib/content/service';

async function createAboutPage() {
  const result = await ContentService.createPage('en', {
    slug: 'about',
    title: 'About Us - Sumud',
    description: 'Learn about our mission and values',
    status: 'draft',
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'About Sumud',
          subtitle: 'Our Story',
          description: 'Empowering Palestinian communities worldwide',
          image: '/images/about-hero.jpg',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        content: {
          body: 'Our organization was founded with a clear mission...',
        },
      },
    ],
  });

  if (result.success) {
    console.log('Page created successfully!');
  } else {
    console.error('Error:', result.error);
  }
}
```

### Example 2: Update Existing Page

```typescript
async function updatePageStatus(slug: string) {
  const result = await ContentService.updatePage('en', slug, {
    status: 'published',
  });

  if (result.success) {
    console.log(`Page "${slug}" published!`);
  }
}
```

### Example 3: Get and Display Page

```typescript
import ContentService from '@/src/lib/content/service';

export default async function AboutPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const page = await ContentService.getPage(
    params.locale as 'en' | 'fi' | 'ar',
    'about'
  );

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <div>
      <h1>{page.title}</h1>
      {page.blocks.map((block) => (
        <Block key={block.id} {...block} />
      ))}
    </div>
  );
}
```

---

## Working with Blocks

### Example 4: Add Block to Page

```typescript
async function addBlockToPage(locale: 'en' | 'fi' | 'ar', slug: string) {
  const page = await ContentService.getPage(locale, slug);
  
  if (!page) {
    throw new Error('Page not found');
  }

  const newBlock = {
    id: `block-${Date.now()}`,
    type: 'image-text',
    content: {
      image: '/images/new-image.jpg',
      title: 'New Section',
      body: 'Content goes here...',
    },
  };

  const result = await ContentService.updatePage(locale, slug, {
    blocks: [...page.blocks, newBlock],
  });

  return result;
}
```

### Example 5: Update Specific Block

```typescript
async function updateBlockContent(
  locale: 'en' | 'fi' | 'ar',
  slug: string,
  blockId: string,
  newContent: any
) {
  const page = await ContentService.getPage(locale, slug);
  
  if (!page) {
    throw new Error('Page not found');
  }

  const updatedBlocks = page.blocks.map((block) =>
    block.id === blockId
      ? { ...block, content: { ...block.content, ...newContent } }
      : block
  );

  const result = await ContentService.updatePage(locale, slug, {
    blocks: updatedBlocks,
  });

  return result;
}
```

### Example 6: Remove Block from Page

```typescript
async function removeBlock(
  locale: 'en' | 'fi' | 'ar',
  slug: string,
  blockId: string
) {
  const page = await ContentService.getPage(locale, slug);
  
  if (!page) {
    throw new Error('Page not found');
  }

  const updatedBlocks = page.blocks.filter(
    (block) => block.id !== blockId
  );

  const result = await ContentService.updatePage(locale, slug, {
    blocks: updatedBlocks,
  });

  return result;
}
```

---

## Navigation Management

### Example 7: Update Header Navigation

```typescript
import ContentService from '@/src/lib/content/service';

async function updateHeaderNav(locale: 'en' | 'fi' | 'ar') {
  const result = await ContentService.updateNavigation(locale, {
    id: 'header',
    siteName: 'Sumud',
    logo: '/images/logo.svg',
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
          {
            label: 'Our Mission',
            href: '/about/mission',
          },
        ],
      },
      {
        label: 'Get Involved',
        href: '/get-involved',
      },
    ],
  });

  return result;
}
```

### Example 8: Add Navigation Item

```typescript
async function addNavItem(locale: 'en' | 'fi' | 'ar') {
  const header = await ContentService.getNavigation(locale, 'header');
  
  if (!header || !header.items) {
    throw new Error('Header not found');
  }

  const newItem = {
    label: 'Blog',
    href: '/blog',
  };

  const result = await ContentService.updateNavigation(locale, {
    ...header,
    items: [...header.items, newItem],
  });

  return result;
}
```

---

## Multi-locale Workflows

### Example 9: Copy Page to Another Locale

```typescript
async function createFinnishVersion() {
  // First, copy English version to Finnish
  const copyResult = await ContentService.copyPageToLocale(
    'en',
    'fi',
    'about'
  );

  if (!copyResult.success) {
    console.error('Copy failed:', copyResult.error);
    return;
  }

  // Then update with Finnish translations
  const updateResult = await ContentService.updatePage('fi', 'about', {
    title: 'Tietoa meistä - Sumud',
    description: 'Opi lisää tehtävästämme ja arvoistamme',
  });

  return updateResult;
}
```

### Example 10: Check Page Availability

```typescript
async function checkPageAvailability(slug: string) {
  const status = await ContentService.getPageLocaleStatus(slug);
  
  console.log('Page availability:');
  console.log('- English:', status.en ? '✅' : '❌');
  console.log('- Finnish:', status.fi ? '✅' : '❌');
  console.log('- Arabic:', status.ar ? '✅' : '❌');
  
  return status;
}
```

### Example 11: Sync Page Status Across Locales

```typescript
async function publishPageAllLocales(slug: string) {
  const result = await ContentService.syncPageMetadata(slug, {
    status: 'published',
  });
  
  if (result.success) {
    console.log(`Page "${slug}" published in all locales`);
  }
  
  return result;
}
```

---

## Validation Examples

### Example 12: Validate Before Saving

```typescript
import { validatePageFile } from '@/src/lib/content/validator';

async function validateAndSave(locale: 'en' | 'fi' | 'ar', pageData: any) {
  // Validate first
  const validation = await validatePageFile(locale, pageData, {
    checkLocalization: true,
  });

  if (!validation.valid) {
    console.error('Validation errors:');
    validation.errors.forEach((error) => {
      console.error(`- ${error.field}: ${error.message}`);
    });
    return { success: false, errors: validation.errors };
  }

  // If valid, save
  const result = await ContentService.updatePage(
    locale,
    pageData.slug,
    pageData
  );

  return result;
}
```

### Example 13: Detect Legacy Format

```typescript
import { detectEmbeddedLocales } from '@/src/lib/content/validator';

function checkForLegacyFormat(pageData: any) {
  const embeddedLocales = detectEmbeddedLocales(pageData);
  
  if (embeddedLocales.length > 0) {
    console.warn('Legacy format detected at:');
    embeddedLocales.forEach((path) => {
      console.warn(`- ${path}`);
    });
    return true;
  }
  
  return false;
}
```

### Example 14: Validate Navigation

```typescript
import { validateNavigationConfig } from '@/src/lib/content/validator';

function validateNav(navData: any) {
  const result = validateNavigationConfig(navData);
  
  if (!result.valid) {
    console.error('Navigation validation failed:');
    result.errors.forEach((error) => {
      console.error(`- ${error.field}: ${error.message}`);
    });
  }
  
  return result;
}
```

---

## Migration Examples

### Example 15: Run Migration Script

```bash
# Create backup
npx tsx scripts/migrate-content.ts backup

# Migrate all pages
npx tsx scripts/migrate-content.ts pages

# Verify results
npx tsx scripts/migrate-content.ts verify
```

### Example 16: Manual Page Migration

```typescript
import fs from 'fs/promises';
import path from 'path';
import ContentService from '@/src/lib/content/service';

async function migrateSinglePage(slug: string) {
  // Read legacy file
  const legacyPath = path.join(process.cwd(), 'content', 'pages', `${slug}.json`);
  const legacyData = JSON.parse(await fs.readFile(legacyPath, 'utf-8'));

  // Check if legacy format
  if (!legacyData.translations) {
    console.log('Not in legacy format');
    return;
  }

  // Migrate each locale
  for (const locale of ['en', 'fi', 'ar'] as const) {
    const translation = legacyData.translations[locale];
    
    if (!translation) continue;

    await ContentService.createPage(locale, {
      slug: legacyData.slug,
      title: translation.title,
      description: translation.description,
      status: legacyData.status,
      blocks: translation.blocks,
    });
    
    console.log(`✅ Migrated ${locale}`);
  }
}
```

---

## Helper Function Examples

### Example 17: Generate Slug

```typescript
import { generateSlug, isValidSlug } from '@/src/lib/content/helpers';

const title = 'About Our Team & Mission!';
const slug = generateSlug(title); // 'about-our-team-mission'

if (isValidSlug(slug)) {
  console.log('Valid slug:', slug);
}
```

### Example 18: Format Timestamps

```typescript
import { 
  formatTimestamp, 
  getRelativeTime,
  createTimestamp,
} from '@/src/lib/content/helpers';

const now = createTimestamp();
const formatted = formatTimestamp(now, 'fi'); // '18. tammikuuta 2026'
const relative = getRelativeTime(now, 'en'); // 'Today'
```

### Example 19: Locale Utilities

```typescript
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
  isRTL,
} from '@/src/lib/content/helpers';

const locales: Array<'en' | 'fi' | 'ar'> = ['en', 'fi', 'ar'];

locales.forEach((locale) => {
  console.log(
    getLocaleFlagEmoji(locale),
    getLocaleDisplayName(locale),
    isRTL(locale) ? '(RTL)' : '(LTR)'
  );
});

// Output:
// 🇬🇧 English (LTR)
// 🇫🇮 Suomi (LTR)
// 🇵🇸 العربية (RTL)
```

---

## Server Actions Examples

### Example 20: Create Server Action for Pages

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import ContentService from '@/src/lib/content/service';
import { auth } from '@clerk/nextjs/server';

export async function updatePageAction(
  locale: 'en' | 'fi' | 'ar',
  slug: string,
  updates: any
) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Update page
  const result = await ContentService.updatePage(locale, slug, updates);

  // Revalidate path
  if (result.success) {
    revalidatePath(`/${locale}/${slug}`);
    revalidatePath('/admin/pages');
  }

  return result;
}
```

### Example 21: Create API Route for Pages

```typescript
import { NextRequest, NextResponse } from 'next/server';
import ContentService from '@/src/lib/content/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string; slug: string } }
) {
  try {
    const page = await ContentService.getPage(
      params.locale as 'en' | 'fi' | 'ar',
      params.slug
    );

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Component Examples

### Example 22: Page Renderer Component

```typescript
import ContentService from '@/src/lib/content/service';
import { BlockRenderer } from '@/src/components/blocks/BlockRenderer';

export default async function DynamicPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const page = await ContentService.getPage(
    params.locale as 'en' | 'fi' | 'ar',
    params.slug
  );

  if (!page || page.status !== 'published') {
    return <div>Page not found</div>;
  }

  return (
    <div>
      <h1>{page.title}</h1>
      {page.description && <p>{page.description}</p>}
      
      <div className="blocks">
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
```

### Example 23: Admin Page List

```typescript
import ContentService from '@/src/lib/content/service';
import { formatTimestamp } from '@/src/lib/content/helpers';

export default async function AdminPagesList() {
  const pages = await ContentService.listPages();

  return (
    <div>
      <h1>All Pages</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.slug}>
              <td>{page.title}</td>
              <td>{page.slug}</td>
              <td>{page.status}</td>
              <td>{formatTimestamp(page.updatedAt, 'en')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## See Also

- [Content Management Guide](./CONTENT_MANAGEMENT.md)
- [Content Schema Documentation](./CONTENT_SCHEMA.md)
- [Localization Migration Plan](./localizing-content.md)
