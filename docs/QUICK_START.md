# Quick Start - Enhanced Content System

## Overview

This guide helps you start using the enhanced i18n and content management system immediately.

## What's New?

- ✅ Centralized ContentService for all content operations
- ✅ Built-in validation
- ✅ Helper utilities for common tasks
- ✅ Comprehensive documentation

## Basic Usage

### 1. Get a Page (Server Component)

```typescript
import ContentService from '@/src/lib/content/service';

export default async function MyPage({ params }: { params: { locale: string } }) {
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
      <p>{page.description}</p>
    </div>
  );
}
```

### 2. Create or Update a Page (Server Action)

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
  // Check auth
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Update page
  const result = await ContentService.updatePage(locale, slug, updates);

  // Revalidate
  if (result.success) {
    revalidatePath(`/${locale}/${slug}`);
  }

  return result;
}
```

### 3. Validate Content Before Saving

```typescript
import { validatePageFile } from '@/src/lib/content/validator';

const validation = await validatePageFile('en', pageData, {
  checkLocalization: true,
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Proceed with save...
```

### 4. Use Helper Functions

```typescript
import {
  generateSlug,
  formatTimestamp,
  isRTL,
  getLocaleDisplayName,
} from '@/src/lib/content/helpers';

// Generate slug from title
const slug = generateSlug('About Our Team'); // 'about-our-team'

// Format timestamp
const formatted = formatTimestamp(page.updatedAt, 'fi');

// Check if RTL
const isRightToLeft = isRTL('ar'); // true

// Get locale name
const localeName = getLocaleDisplayName('fi'); // 'Suomi'
```

## Common Tasks

### Task 1: List All Pages

```typescript
import ContentService from '@/src/lib/content/service';

const pages = await ContentService.listPages();

pages.forEach(page => {
  console.log(`${page.slug}: ${page.title} (${page.status})`);
});
```

### Task 2: Check Page Availability

```typescript
const status = await ContentService.getPageLocaleStatus('about');

console.log('English:', status.en ? '✅' : '❌');
console.log('Finnish:', status.fi ? '✅' : '❌');
console.log('Arabic:', status.ar ? '✅' : '❌');
```

### Task 3: Copy Page to Another Locale

```typescript
// Copy English to Finnish
const result = await ContentService.copyPageToLocale('en', 'fi', 'about');

if (result.success) {
  // Now update with Finnish translation
  await ContentService.updatePage('fi', 'about', {
    title: 'Tietoa meistä',
    description: 'Lue lisää tehtävästämme',
  });
}
```

### Task 4: Sync Status Across Locales

```typescript
// Publish in all locales at once
await ContentService.syncPageMetadata('about', {
  status: 'published',
});
```

### Task 5: Update Navigation

```typescript
import ContentService from '@/src/lib/content/service';

await ContentService.updateNavigation('en', {
  id: 'header',
  siteName: 'Sumud',
  items: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    {
      label: 'Get Involved',
      href: '/get-involved',
      children: [
        { label: 'Volunteer', href: '/volunteer' },
        { label: 'Donate', href: '/donate' },
      ],
    },
  ],
});
```

## Import Patterns

```typescript
// ContentService - Main API
import ContentService from '@/src/lib/content/service';

// Validators
import {
  validatePageFile,
  validateNavigationFile,
  formatValidationErrors,
} from '@/src/lib/content/validator';

// Helpers
import {
  generateSlug,
  formatTimestamp,
  isRTL,
  getLocaleDisplayName,
  extractLocalizedValue,
} from '@/src/lib/content/helpers';

// Everything at once
import {
  ContentService,
  validatePageFile,
  generateSlug,
  // ... other exports
} from '@/src/lib/content';
```

## Error Handling

```typescript
const result = await ContentService.createPage('en', pageData);

if (!result.success) {
  // Handle error
  console.error('Error:', result.error);
  // Show to user, log, etc.
} else {
  // Success
  console.log('Page created successfully!');
}
```

## TypeScript Types

```typescript
import type { Locale, LocalizedPageData } from '@/src/lib/pages/file-storage';
import type { ValidationResult, ValidationError } from '@/src/lib/content/validator';

// Use in your code
const locale: Locale = 'en';
const page: LocalizedPageData = { /* ... */ };
const validation: ValidationResult = await validatePageFile(locale, page);
```

## Next Steps

1. **Read Full Documentation**
   - [Content Management Guide](./CONTENT_MANAGEMENT.md)
   - [Content Examples](./CONTENT_EXAMPLES.md)
   - [Content Schema](./CONTENT_SCHEMA.md)

2. **Try It Out**
   - Use ContentService in your components
   - Add validation to your forms
   - Use helpers in your utilities

3. **Review Examples**
   - Check [CONTENT_EXAMPLES.md](./CONTENT_EXAMPLES.md) for 23 examples
   - See real-world usage patterns
   - Copy and adapt to your needs

## Tips

### Tip 1: Always Validate

```typescript
// Before saving, always validate
const validation = await validatePageFile(locale, data);
if (!validation.valid) {
  return { success: false, error: formatValidationErrors(validation.errors) };
}
```

### Tip 2: Use Type Guards

```typescript
import { isValidLocale } from '@/src/lib/content/helpers';

if (isValidLocale(userInput)) {
  // TypeScript now knows it's a valid Locale
  const page = await ContentService.getPage(userInput, slug);
}
```

### Tip 3: Handle Missing Content

```typescript
const page = await ContentService.getPage(locale, slug);

if (!page) {
  // Check other locales or show 404
  const status = await ContentService.getPageLocaleStatus(slug);
  // ...
}
```

### Tip 4: Revalidate After Changes

```typescript
import { revalidatePath } from 'next/cache';

await ContentService.updatePage(locale, slug, updates);
revalidatePath(`/${locale}/${slug}`);
```

## Common Patterns

### Pattern: Admin Page Editor

```typescript
'use server';

export async function savePageAction(locale: Locale, slug: string, data: any) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  // 2. Validate
  const validation = await validatePageFile(locale, data);
  if (!validation.valid) {
    return { success: false, error: formatValidationErrors(validation.errors) };
  }

  // 3. Save
  const result = await ContentService.updatePage(locale, slug, data);

  // 4. Revalidate
  if (result.success) {
    revalidatePath(`/${locale}/${slug}`);
  }

  return result;
}
```

### Pattern: Dynamic Page Route

```typescript
export default async function DynamicPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const page = await ContentService.getPage(
    params.locale as Locale,
    params.slug
  );

  if (!page || page.status !== 'published') {
    notFound();
  }

  return <PageRenderer page={page} />;
}
```

### Pattern: Multi-locale Form

```typescript
'use client';

export function MultiLocaleEditor() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  async function handleSave(data: any) {
    const result = await ContentService.updatePage(currentLocale, slug, data);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success('Saved!');
    }
  }

  return (
    <div>
      <LocaleSelector value={currentLocale} onChange={setCurrentLocale} />
      <Editor locale={currentLocale} onSave={handleSave} />
    </div>
  );
}
```

## Support

Need help?
- Check [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) for detailed documentation
- Review [CONTENT_EXAMPLES.md](./CONTENT_EXAMPLES.md) for more examples
- See [CONTENT_SCHEMA.md](./CONTENT_SCHEMA.md) for schema details

Happy coding! 🚀
