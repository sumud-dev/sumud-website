/**
 * Server Actions for Pages
 * 
 * Server actions for CRUD operations on file-based pages.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import {
  readPage,
  writePage,
  deletePage as deletePageFile,
  listPages as listPagesFromFiles,
  pageExists,
} from '@/src/lib/pages/file-storage';
import type { PageData } from '@/src/lib/types/page';
import { PAGE_BLOCK_TYPES, type PageBlockType, type PageBlock } from '@/src/lib/types/page';
import {
  translateBatch,
  type SupportedLocale,
} from '@/src/lib/services/translation.service';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const blockMetaSchema = z.object({
  defaultLang: z.enum(['en', 'fi', 'ar']),
  autoTranslated: z.array(z.enum(['en', 'fi', 'ar'])).optional(),
  manuallyReviewed: z.array(z.enum(['en', 'fi', 'ar'])).optional(),
  lastTranslated: z.string().optional(),
  lastModified: z.string().optional(),
}).optional();

const blockSchema = z.object({
  id: z.string(),
  type: z.enum(PAGE_BLOCK_TYPES),
  content: z.any(),
  meta: blockMetaSchema,
});

const translationSchema = z.object({
  title: z.string(),
  description: z.string(),
  blocks: z.array(blockSchema),
});

const createPageSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  path: z.string().min(1, 'Path is required'),
  status: z.enum(['draft', 'published']).default('draft'),
  translations: z.object({
    en: translationSchema.optional(),
    ar: translationSchema.optional(),
    fi: translationSchema.optional(),
  }),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updatePageSchema = createPageSchema.partial().extend({
  slug: z.string().min(1),
});

// ============================================
// RESULT TYPE
// ============================================

type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; errors?: Record<string, string[]> };

// ============================================
// HELPER: Check authentication
// ============================================

async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

// ============================================
// PAGE ACTIONS
// ============================================

/**
 * List all pages
 */
export async function listPagesAction(): Promise<ActionResult> {
  try {
    await requireAuth();
    const pages = await listPagesFromFiles();
    return { success: true, data: pages };
  } catch (error) {
    console.error('Error listing pages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list pages',
    };
  }
}

/**
 * Get a single page by slug
 */
export async function getPageAction(slug: string): Promise<ActionResult<PageData | null>> {
  try {
    await requireAuth();
    const page = await readPage(slug);
    return { success: true, data: page };
  } catch (error) {
    console.error('Error getting page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get page',
    };
  }
}

/**
 * Create a new page
 */
export async function createPageAction(
  data: z.infer<typeof createPageSchema>
): Promise<ActionResult<PageData>> {
  try {
    await requireAuth();

    // Validate input
    const validated = createPageSchema.parse(data);

    // Check if slug already exists
    if (await pageExists(validated.slug)) {
      return {
        success: false,
        error: `Page with slug "${validated.slug}" already exists`,
      };
    }

    const now = new Date().toISOString();
    const page: PageData = {
      slug: validated.slug,
      path: validated.path,
      status: validated.status,
      createdAt: now,
      updatedAt: now,
      translations: validated.translations,
    };

    await writePage(page);
    revalidatePath('/admin/page-builder');
    revalidatePath(validated.path);

    return {
      success: true,
      data: page,
      message: 'Page created successfully',
    };
  } catch (error) {
    console.error('Error creating page:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create page',
    };
  }
}

/**
 * Update an existing page
 */
export async function updatePageAction(
  slug: string,
  data: Partial<z.infer<typeof updatePageSchema>>
): Promise<ActionResult<PageData>> {
  try {
    await requireAuth();

    // Get existing page
    const existingPage = await readPage(slug);
    if (!existingPage) {
      return {
        success: false,
        error: `Page with slug "${slug}" not found`,
      };
    }

    // Merge updates
    const updatedPage: PageData = {
      ...existingPage,
      ...data,
      slug: existingPage.slug, // Don't allow slug change through update
      updatedAt: new Date().toISOString(),
      translations: {
        ...existingPage.translations,
        ...data.translations,
      },
    };

    await writePage(updatedPage);
    revalidatePath('/admin/page-builder');
    revalidatePath(existingPage.path);
    if (data.path && data.path !== existingPage.path) {
      revalidatePath(data.path);
    }

    return {
      success: true,
      data: updatedPage,
      message: 'Page updated successfully',
    };
  } catch (error) {
    console.error('Error updating page:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update page',
    };
  }
}

/**
 * Delete a page
 */
export async function deletePageAction(slug: string): Promise<ActionResult<boolean>> {
  try {
    await requireAuth();

    const page = await readPage(slug);
    if (!page) {
      return {
        success: false,
        error: `Page with slug "${slug}" not found`,
      };
    }

    const deleted = await deletePageFile(slug);
    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete page file',
      };
    }

    revalidatePath('/admin/page-builder');
    revalidatePath(page.path);

    return {
      success: true,
      data: true,
      message: 'Page deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete page',
    };
  }
}

/**
 * Publish a page (change status to published)
 */
export async function publishPageAction(slug: string): Promise<ActionResult<PageData>> {
  return updatePageAction(slug, { status: 'published' });
}

/**
 * Unpublish a page (change status to draft)
 */
export async function unpublishPageAction(slug: string): Promise<ActionResult<PageData>> {
  return updatePageAction(slug, { status: 'draft' });
}

/**
 * Duplicate a page
 */
export async function duplicatePageAction(slug: string): Promise<ActionResult<PageData>> {
  try {
    await requireAuth();

    const originalPage = await readPage(slug);
    if (!originalPage) {
      return {
        success: false,
        error: `Page with slug "${slug}" not found`,
      };
    }

    // Generate new slug
    let newSlug = `${slug}-copy`;
    let counter = 1;
    while (await pageExists(newSlug)) {
      newSlug = `${slug}-copy-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newPage: PageData = {
      ...originalPage,
      slug: newSlug,
      path: `${originalPage.path}-copy`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    // Update titles to indicate it's a copy
    if (newPage.translations.en) {
      newPage.translations.en.title = `${newPage.translations.en.title} (Copy)`;
    }
    if (newPage.translations.ar) {
      newPage.translations.ar.title = `${newPage.translations.ar.title} (نسخة)`;
    }
    if (newPage.translations.fi) {
      newPage.translations.fi.title = `${newPage.translations.fi.title} (Kopio)`;
    }

    await writePage(newPage);
    revalidatePath('/admin/page-builder');

    return {
      success: true,
      data: newPage,
      message: 'Page duplicated successfully',
    };
  } catch (error) {
    console.error('Error duplicating page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate page',
    };
  }
}

// ============================================
// BLOCK TRANSLATION HELPERS
// ============================================

/**
 * Extract all translatable string values from a nested object
 * Returns array of { path, value } for each string found
 */
function extractStrings(
  obj: Record<string, unknown>,
  prefix = ''
): { path: string; value: string }[] {
  const results: { path: string; value: string }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string' && value.trim() !== '') {
      results.push({ path, value });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          results.push(...extractStrings(item as Record<string, unknown>, `${path}[${index}]`));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      results.push(...extractStrings(value as Record<string, unknown>, path));
    }
  }

  return results;
}

/**
 * Set a value at a path in a nested object (supports array notation)
 */
function setAtPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(/\.(?![^[]*])/).map(part => {
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      return [arrayMatch[1], parseInt(arrayMatch[2], 10)] as const;
    }
    return part;
  }).flat();

  let current: unknown = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof part === 'number') {
      current = (current as unknown[])[part];
    } else {
      const currentObj = current as Record<string, unknown>;
      if (!currentObj[part]) {
        currentObj[part] = typeof parts[i + 1] === 'number' ? [] : {};
      }
      current = currentObj[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  if (typeof lastPart === 'number') {
    (current as unknown[])[lastPart] = value;
  } else {
    (current as Record<string, unknown>)[lastPart] = value;
  }
}

/**
 * Translate locale-nested block content using DeepL
 */
async function translateBlockContent(
  blockContent: Record<string, unknown>,
  sourceLang: SupportedLocale,
  targetLocales: SupportedLocale[]
): Promise<{ content: Record<string, unknown>; error: string | null }> {
  // Check if this is a locale-nested content structure
  const contentWrapper = blockContent.content as Record<string, unknown> | undefined;
  if (!contentWrapper || typeof contentWrapper !== 'object') {
    return { content: blockContent, error: 'Block does not have locale-nested content' };
  }

  const sourceContent = contentWrapper[sourceLang] as Record<string, unknown> | undefined;
  if (!sourceContent) {
    return { content: blockContent, error: `No source content found for ${sourceLang}` };
  }

  // Extract all strings from source content
  const strings = extractStrings(sourceContent);
  if (strings.length === 0) {
    return { content: blockContent, error: null };
  }

  const errors: string[] = [];
  const updatedContent = JSON.parse(JSON.stringify(blockContent)) as Record<string, unknown>;

  // Translate to each target locale
  for (const targetLocale of targetLocales) {
    if (targetLocale === sourceLang) continue;

    const { texts, error } = await translateBatch(
      strings.map(s => s.value),
      sourceLang,
      targetLocale
    );

    if (error) {
      errors.push(`${targetLocale}: ${error}`);
      continue;
    }

    // Create translated content structure
    const translatedContent = JSON.parse(JSON.stringify(sourceContent)) as Record<string, unknown>;
    strings.forEach((s, index) => {
      if (texts[index]) {
        setAtPath(translatedContent, s.path, texts[index]);
      }
    });

    // Update the content wrapper with translated content
    (updatedContent.content as Record<string, unknown>)[targetLocale] = translatedContent;
  }

  return {
    content: updatedContent,
    error: errors.length > 0 ? errors.join('; ') : null,
  };
}

/**
 * Translate items array in blocks like features-section, values-section
 * These have items with individual locale-nested content
 */
async function translateBlockItems(
  blockContent: Record<string, unknown>,
  sourceLang: SupportedLocale,
  targetLocales: SupportedLocale[]
): Promise<{ content: Record<string, unknown>; error: string | null }> {
  const items = blockContent.items as Array<Record<string, unknown>> | undefined;
  if (!items || !Array.isArray(items)) {
    return { content: blockContent, error: null };
  }

  const errors: string[] = [];
  const updatedContent = JSON.parse(JSON.stringify(blockContent)) as Record<string, unknown>;
  const updatedItems = updatedContent.items as Array<Record<string, unknown>>;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemContent = item.content as Record<string, unknown> | undefined;
    if (!itemContent) continue;

    const sourceItemContent = itemContent[sourceLang] as Record<string, unknown> | undefined;
    if (!sourceItemContent) continue;

    const strings = extractStrings(sourceItemContent);
    if (strings.length === 0) continue;

    for (const targetLocale of targetLocales) {
      if (targetLocale === sourceLang) continue;

      const { texts, error } = await translateBatch(
        strings.map(s => s.value),
        sourceLang,
        targetLocale
      );

      if (error) {
        errors.push(`item[${i}] ${targetLocale}: ${error}`);
        continue;
      }

      const translatedItemContent = JSON.parse(JSON.stringify(sourceItemContent)) as Record<string, unknown>;
      strings.forEach((s, index) => {
        if (texts[index]) {
          setAtPath(translatedItemContent, s.path, texts[index]);
        }
      });

      (updatedItems[i].content as Record<string, unknown>)[targetLocale] = translatedItemContent;
    }
  }

  return {
    content: updatedContent,
    error: errors.length > 0 ? errors.join('; ') : null,
  };
}

// ============================================
// BLOCK TRANSLATION ACTIONS
// ============================================

/**
 * Trigger auto-translation for a specific block's content using DeepL
 * Translates locale-nested content and updates meta tracking
 */
export async function triggerBlockTranslationAction(
  slug: string,
  blockId: string,
  targetLocales: ('en' | 'fi' | 'ar')[],
  sourceLang: 'en' | 'fi' | 'ar' = 'en'
): Promise<ActionResult<PageData>> {
  try {
    await requireAuth();

    const page = await readPage(slug);
    if (!page) {
      return { success: false, error: `Page "${slug}" not found` };
    }

    // Find the block in the source language translation
    const sourceTranslation = page.translations[sourceLang];
    if (!sourceTranslation) {
      return { success: false, error: `No ${sourceLang} translation found` };
    }

    const blockIndex = sourceTranslation.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) {
      return { success: false, error: `Block "${blockId}" not found` };
    }

    const block = sourceTranslation.blocks[blockIndex];
    const blockContent = block.content as unknown as Record<string, unknown>;

    // Translate main content (for blocks like page-hero, mission-section, cta-section)
    const { content: translatedContent, error: contentError } = await translateBlockContent(
      blockContent,
      sourceLang,
      targetLocales
    );

    // Also translate items if present (for blocks like features-section, values-section, engagement-section)
    const { content: finalContent, error: itemsError } = await translateBlockItems(
      translatedContent,
      sourceLang,
      targetLocales
    );

    // Translate header if present (for section blocks)
    let headerError: string | null = null;
    if ((finalContent as Record<string, unknown>).header) {
      const headerWrapper = { content: (finalContent as Record<string, unknown>).header };
      const { content: translatedHeader, error } = await translateBlockContent(
        headerWrapper,
        sourceLang,
        targetLocales
      );
      if (!error) {
        (finalContent as Record<string, unknown>).header = translatedHeader.content;
      }
      headerError = error;
    }

    const now = new Date().toISOString();
    const existingAutoTranslated = block.meta?.autoTranslated || [];
    const newAutoTranslated = [...new Set([...existingAutoTranslated, ...targetLocales])];

    // Update the block with translated content and meta
    sourceTranslation.blocks[blockIndex] = {
      ...block,
      content: finalContent as unknown as PageBlock['content'],
      meta: {
        defaultLang: sourceLang,
        autoTranslated: newAutoTranslated,
        manuallyReviewed: block.meta?.manuallyReviewed,
        lastTranslated: now,
        lastModified: block.meta?.lastModified,
      },
    };

    const updatedPage: PageData = {
      ...page,
      updatedAt: now,
      translations: {
        ...page.translations,
        [sourceLang]: sourceTranslation,
      },
    };

    await writePage(updatedPage);
    revalidatePath('/admin/page-builder');
    revalidatePath(page.path);

    // Collect any translation errors for the response message
    const allErrors = [contentError, itemsError, headerError].filter(Boolean);
    const message = allErrors.length > 0
      ? `Translated to ${targetLocales.join(', ')} with warnings: ${allErrors.join('; ')}`
      : `Successfully translated to ${targetLocales.join(', ')}`;

    return {
      success: true,
      data: updatedPage,
      message,
    };
  } catch (error) {
    console.error('Error triggering translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger translation',
    };
  }
}

/**
 * Mark a block translation as manually reviewed
 */
export async function markBlockAsReviewedAction(
  slug: string,
  blockId: string,
  locale: 'en' | 'fi' | 'ar'
): Promise<ActionResult<PageData>> {
  try {
    await requireAuth();

    const page = await readPage(slug);
    if (!page) {
      return { success: false, error: `Page "${slug}" not found` };
    }

    // Find the block in any translation that has it
    for (const lang of ['en', 'fi', 'ar'] as const) {
      const translation = page.translations[lang];
      if (!translation) continue;

      const blockIndex = translation.blocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) continue;

      const block = translation.blocks[blockIndex];
      const existingReviewed = block.meta?.manuallyReviewed || [];

      if (!existingReviewed.includes(locale)) {
        translation.blocks[blockIndex] = {
          ...block,
          meta: {
            defaultLang: block.meta?.defaultLang || 'en',
            manuallyReviewed: [...existingReviewed, locale],
            // Remove from autoTranslated if present (human-reviewed takes precedence)
            autoTranslated: (block.meta?.autoTranslated || []).filter(l => l !== locale),
            lastTranslated: block.meta?.lastTranslated,
            lastModified: block.meta?.lastModified,
          },
        };

        const updatedPage: PageData = {
          ...page,
          updatedAt: new Date().toISOString(),
          translations: {
            ...page.translations,
            [lang]: translation,
          },
        };

        await writePage(updatedPage);
        revalidatePath('/admin/page-builder');
        revalidatePath(page.path);

        return {
          success: true,
          data: updatedPage,
          message: `Block marked as reviewed for ${locale}`,
        };
      }
    }

    return { success: false, error: `Block "${blockId}" not found` };
  } catch (error) {
    console.error('Error marking block as reviewed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as reviewed',
    };
  }
}
