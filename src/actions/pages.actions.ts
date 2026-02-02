/**
 * Server Actions for Pages
 * 
 * Server actions for CRUD operations on database-backed pages.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import {
  listPagesPaginated,
  findPageBySlugAndLanguage,
  findTranslationsForPage,
  createPage,
  createPageTranslation,
  updatePage,
  deletePage,
  pageSlugExists,
  pagePathExists,
  type PageRecord,
} from '@/src/lib/db/queries/pages.queries';
import type { PageData } from '@/src/lib/types/page';
import { PAGE_BLOCK_TYPES, type PageBlock, type PageBlockType } from '@/src/lib/types/page';
import {
  translateBatch,
  type SupportedLocale,
} from '@/src/lib/services/translation.service';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const blockMetaSchema = z.object({
  defaultLang: z.enum(['en', 'fi']),
  autoTranslated: z.array(z.enum(['en', 'fi'])).optional(),
  manuallyReviewed: z.array(z.enum(['en', 'fi'])).optional(),
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
// CONVERSION HELPERS: DB <-> PageData
// ============================================

/**
 * Convert database PageRecord to a single translation object
 */
function pageRecordToTranslation(record: PageRecord) {
  // Handle UI translations pages - check metadata for ui-translations marker
  const isUITranslationsPage = record.metadata?.customFields?.uiTranslations === true;
  const namespace = record.metadata?.customFields?.uiTranslationsNamespace as string | undefined;
  
  if (isUITranslationsPage && namespace) {
    // For UI translations pages, return empty blocks
    // The actual UI will be rendered by the UI translations editor
    return {
      title: record.title,
      description: record.metadata?.description || '',
      blocks: [],
    };
  }

  // Fallback: Check old content structure for backwards compatibility
  // This handles cases where migration hasn't run yet
  const content = record.content as any;
  const isOldUITranslations = 
    content?.type === 'ui-translations' || 
    content?.data?.[0]?.content?.type === 'ui-translations';
    
  if (isOldUITranslations) {
    return {
      title: record.title,
      description: record.metadata?.description || '',
      blocks: [],
    };
  }

  return {
    title: record.title,
    description: record.metadata?.description || '',
    blocks: (record.content?.type === 'blocks' && Array.isArray(record.content.data))
      ? record.content.data as PageBlock[]
      : [],
  };
}

/**
 * Convert database PageRecord to PageData format with a single locale
 */
function pageRecordToPageData(record: PageRecord, locale: 'en' | 'fi'): PageData {
  return {
    slug: record.slug,
    path: record.path,
    status: record.status as 'draft' | 'published',
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    translations: {
      [locale]: pageRecordToTranslation(record),
    },
  };
}

/**
 * Convert primary page and its translations to full PageData
 */
function pageRecordsToPageData(
  primaryPage: PageRecord,
  translations: PageRecord[]
): PageData {
  const pageData: PageData = {
    slug: primaryPage.slug,
    path: primaryPage.path,
    status: primaryPage.status as 'draft' | 'published',
    createdAt: primaryPage.createdAt.toISOString(),
    updatedAt: primaryPage.updatedAt.toISOString(),
    translations: {},
    metadata: {},
  };

  // Add primary page translation (should be Finnish)
  const primaryLocale = (primaryPage.language as 'en' | 'fi') || 'fi'; // Default to 'fi' not 'en'
  pageData.translations[primaryLocale] = pageRecordToTranslation(primaryPage);
  
  // Add primary page metadata
  if (primaryPage.metadata?.customFields) {
    if (!pageData.metadata) pageData.metadata = {};
    pageData.metadata[primaryLocale] = primaryPage.metadata.customFields as any;
  }

  // Add other translations
  translations.forEach(translation => {
    const locale = (translation.language as 'en' | 'fi') || 'en';
    if (locale !== primaryLocale) {
      pageData.translations[locale] = pageRecordToTranslation(translation);
      
      // Add translation metadata
      if (translation.metadata?.customFields) {
        if (!pageData.metadata) pageData.metadata = {};
        pageData.metadata[locale] = translation.metadata.customFields as any;
      }
    }
  });

  return pageData;
}

/**
 * Convert database PageRecord to PageSummary format (for listings)
 */
function pageRecordToPageSummary(record: PageRecord): import('@/src/lib/types/page').PageSummary {
  return {
    slug: record.slug,
    path: record.path,
    status: record.status as 'draft' | 'published' | 'archived',
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    title: record.title,
  };
}

/**
 * Extract blocks from PageData content
 */
function extractBlocks(content: PageRecord['content']): PageBlock[] {
  if (!content || content.type !== 'blocks') return [];
  if (Array.isArray(content.data)) {
    return content.data as PageBlock[];
  }
  return [];
}



// Lines 177-205 (Add helper to sync block structures)
/**
 * Sync block structure between languages (keeps same blocks/IDs but different content)
 */
function syncBlockStructure(
  sourceBlocks: PageBlock[],
  targetBlocks: PageBlock[]
): PageBlock[] {
  // Create a map of target blocks by ID for quick lookup
  const targetMap = new Map(targetBlocks.map(b => [b.id, b]));
  
  // Use source structure but preserve target content where it exists
  return sourceBlocks.map(sourceBlock => {
    const targetBlock = targetMap.get(sourceBlock.id);
    
    if (targetBlock) {
      // Block exists in target, keep its content but sync metadata
      return {
        ...sourceBlock,
        content: targetBlock.content, // Keep target's content
        meta: sourceBlock.meta, // Sync metadata from source
      };
    } else {
      // New block in source, add to target (will need translation)
      return sourceBlock;
    }
  });
}

/**
 * Revalidate all language versions of a page path
 */
function revalidatePagePaths(path: string, additionalPath?: string) {
  revalidatePath('/admin/page-builder');
  revalidatePath(`/fi${path}`);
  revalidatePath(`/en${path}`);
  revalidatePath(path);
  
  if (additionalPath && additionalPath !== path) {
    revalidatePath(`/fi${additionalPath}`);
    revalidatePath(`/en${additionalPath}`);
    revalidatePath(additionalPath);
  }
}

// ============================================
// PAGE ACTIONS
// ============================================

/**
 * List all pages
 */
export async function listPagesAction(locale?: string): Promise<ActionResult> {
  try {
    await requireAuth();
    
    // If no locale specified, default to Finnish (primary pages)
    const language = locale || 'fi';
    
    // Get all pages from database, filtered by language
    const { pages } = await listPagesPaginated(
      { isActive: true, language },
      { limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' }
    );
    
    // Convert to PageSummary format for listings
    const pagesSummary = pages.map(pageRecordToPageSummary);
    
    return { success: true, data: pagesSummary };
  } catch (error) {
    console.error('Error listing pages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list pages',
    };
  }
}

/**
 * List all published pages (public - no auth required)
 * Used for generating static paths
 */
export async function listPublishedPagesAction(): Promise<ActionResult> {
  try {
    // Get published Finnish pages
    const { pages: fiPages } = await listPagesPaginated(
      { isActive: true, status: 'published', language: 'fi' },
      { limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' }
    );
    
    // Get published English pages (translations)
    const { pages: enPages } = await listPagesPaginated(
      { isActive: true, status: 'published', language: 'en' },
      { limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' }
    );
    
    // Combine and convert to PageSummary format
    const pagesSummary = [...fiPages, ...enPages].map(pageRecordToPageSummary);
    
    return { success: true, data: pagesSummary };
  } catch (error) {
    console.error('Error listing published pages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list published pages',
    };
  }
}

/**
 * Get a single page by slug with all translations
 */
export async function getPageAction(
  slug: string,
  locale?: 'en' | 'fi'
): Promise<ActionResult<PageData | null>> {
  try {
    await requireAuth();
    
    // Default to Finnish if no locale specified
    const language = locale || 'fi';
    
    // Find primary page (always Finnish)
    const primaryPage = await findPageBySlugAndLanguage(slug, language);
    
    if (!primaryPage) {
      return { success: true, data: null };
    }
    
    // Get all translations for this page
    const translations = await findTranslationsForPage(primaryPage.id);
    
    // Convert to PageData format with all translations
    const pageData = pageRecordsToPageData(primaryPage, translations);

    // Temporary debug - remove after verifying
    console.log('PageData structure:', {
      slug: pageData.slug,
      availableLanguages: Object.keys(pageData.translations),
      fiTitle: pageData.translations.fi?.title,
      enTitle: pageData.translations.en?.title,
    });
    
    return { success: true, data: pageData };
  } catch (error) {
    console.error('Error getting page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get page',
    };
  }
}

/**
 * Get a page by slug and language (public - no auth required)
 * Used for public page rendering
 */
export async function getPublicPageAction(
  slug: string,
  language: 'en' | 'fi'
): Promise<ActionResult<PageData | null>> {
  try {
    // Only return published pages for public access
    const page = await findPageBySlugAndLanguage(slug, language);
    
    if (!page || page.status !== 'published') {
      return { success: true, data: null };
    }
    
    // Convert to PageData format
    const pageData = pageRecordToPageData(page, language);
    
    return { success: true, data: pageData };
  } catch (error) {
    console.error('Error getting public page:', error);
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
    const userId = await requireAuth();

    // Validate input
    const validated = createPageSchema.parse(data);

    // Check if slug already exists
    if (await pageSlugExists(validated.slug)) {
      return {
        success: false,
        error: `Page with slug "${validated.slug}" already exists`,
      };
    }

    // Check if path already exists
    if (await pagePathExists(validated.path)) {
      return {
        success: false,
        error: `Page with path "${validated.path}" already exists`,
      };
    }

    const now = new Date();
    
    // Determine primary locale (prefer fi, fallback to en if fi not provided)
    const primaryLocale: 'en' | 'fi' = validated.translations.fi ? 'fi' : 'en';
    const primaryTranslation = validated.translations[primaryLocale];
    
    if (!primaryTranslation) {
      return {
        success: false,
        error: 'At least one translation (en or fi) is required',
      };
    }

    // Create primary page record
    const newPage = await createPage({
      slug: validated.slug,
      path: validated.path,
      language: primaryLocale,
      title: primaryTranslation.title,
      content: {
        type: 'blocks',
        data: primaryTranslation.blocks,
      },
      metadata: {
        description: primaryTranslation.description,
      },
      status: validated.status,
      publishedAt: validated.status === 'published' ? now : null,
      isActive: true,
      isFeatured: false,
      showInMenu: false,
    });

    // Create translation for the other locale if provided
    const otherLocale: 'en' | 'fi' = primaryLocale === 'fi' ? 'en' : 'fi';
    const otherTranslation = validated.translations[otherLocale];
    
    if (otherTranslation) {
      await createPageTranslation({
        parentId: newPage.id,
        language: otherLocale,
        slug: validated.slug,
        path: validated.path,
        title: otherTranslation.title,
        content: {
          type: 'blocks',
          data: otherTranslation.blocks,
        },
        metadata: {
          description: otherTranslation.description,
        },
        status: validated.status,
        publishedAt: validated.status === 'published' ? now : null,
      });
    }

    // Convert to PageData format
    const pageData = pageRecordToPageData(newPage, primaryLocale);

    revalidatePath('/admin/page-builder');
    revalidatePath(validated.path);

    return {
      success: true,
      data: pageData,
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
 * Updates both primary page and translations if provided
 */
export async function updatePageAction(
  slug: string,
  data: Partial<z.infer<typeof updatePageSchema>>,
  language: 'en' | 'fi' = 'fi'
): Promise<ActionResult<PageData>> {
  try {
    await requireAuth();

    // Find the page being edited in the current language
    const editingPage = await findPageBySlugAndLanguage(slug, language);
    if (!editingPage) {
      return { success: false, error: `Page with slug "${slug}" not found` };
    }

    // Find primary page (Finnish) - needed for translations lookup
    const primaryPage = editingPage.isTranslation && editingPage.parentId
      ? await findPageBySlugAndLanguage(slug, 'fi')
      : editingPage;
    
    if (!primaryPage) {
      return { success: false, error: 'Primary page not found' };
    }

    const translations = await findTranslationsForPage(primaryPage.id);

    // Build common update fields
    const commonFields: Record<string, unknown> = {};
    if (data.path) commonFields.path = data.path;
    if (data.status) {
      commonFields.status = data.status;
      if (data.status === 'published') commonFields.publishedAt = new Date();
    }

    // Update the page being edited
    const translationData = data.translations?.[language];
    if (translationData) {
      const updateData = {
        ...commonFields,
        ...(translationData.title && { title: translationData.title }),
        ...(translationData.description && { 
          metadata: { ...editingPage.metadata, description: translationData.description }
        }),
        ...(translationData.blocks && { 
          content: { type: 'blocks' as const, data: translationData.blocks }
        }),
      };
      await updatePage(editingPage.id, updateData);
    } else if (Object.keys(commonFields).length > 0) {
      await updatePage(editingPage.id, commonFields);
    }

    // If editing Finnish and English translation data provided, update English too
    if (language === 'fi' && data.translations?.en) {
      const enPage = translations.find(t => t.language === 'en');
      const en = data.translations.en;
      
      if (enPage) {
        await updatePage(enPage.id, {
          ...commonFields,
          ...(en.title && { title: en.title }),
          ...(en.description && { metadata: { description: en.description } }),
          ...(en.blocks && { content: { type: 'blocks', data: en.blocks } }),
        });
      } else if (en.title || en.blocks) {
        await createPageTranslation({
          parentId: primaryPage.id,
          language: 'en',
          slug: primaryPage.slug,
          path: data.path || primaryPage.path,
          title: en.title || primaryPage.title,
          content: en.blocks ? { type: 'blocks', data: en.blocks } : primaryPage.content,
          metadata: en.description ? { description: en.description } : primaryPage.metadata,
          status: data.status || primaryPage.status,
          publishedAt: data.status === 'published' ? new Date() : null,
        });
      }
    }

    // Fetch updated data
    const updated = await findPageBySlugAndLanguage(slug, 'fi');
    if (!updated) {
      return { success: false, error: 'Failed to retrieve updated page' };
    }

    const updatedTranslations = await findTranslationsForPage(updated.id);
    const pageData = pageRecordsToPageData(updated, updatedTranslations);

    // Revalidate paths
    revalidatePath('/admin/page-builder');
    revalidatePath(`/fi${editingPage.path}`);
    revalidatePath(`/en${editingPage.path}`);
    revalidatePath(editingPage.path);
    if (data.path && data.path !== editingPage.path) {
      revalidatePath(`/fi${data.path}`);
      revalidatePath(`/en${data.path}`);
      revalidatePath(data.path);
    }

    return { success: true, data: pageData, message: 'Page updated successfully' };
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
export async function deletePageAction(
  slug: string,
  language: 'en' | 'fi' = 'fi' // Add language parameter
): Promise<ActionResult<boolean>> {
  try {
    await requireAuth();

    const page = await findPageBySlugAndLanguage(slug, language);
    if (!page) {
      return {
        success: false,
        error: `Page with slug "${slug}" and language "${language}" not found`,
      };
    }

    let deleted: boolean;
    
    if (page.isTranslation && page.parentId) {
      // Delete only the translation
      const { deletePageTranslation } = await import('@/src/lib/db/queries/pages.queries');
      deleted = await deletePageTranslation(page.id);
    } else {
      // Delete primary page and all its translations
      deleted = await deletePage(page.id);
    }

    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete page',
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
export async function publishPageAction(
  slug: string,
  language: 'en' | 'fi' = 'fi'
): Promise<ActionResult<PageData>> {
  return updatePageAction(slug, { status: 'published' }, language);
}

export async function unpublishPageAction(
  slug: string,
  language: 'en' | 'fi' = 'fi'
): Promise<ActionResult<PageData>> {
  return updatePageAction(slug, { status: 'draft' }, language);
}

/**
 * Duplicate a page
 */
export async function duplicatePageAction(slug: string): Promise<ActionResult<PageData>> {
  try {
    const userId = await requireAuth();

    const originalPage = await findPageBySlugAndLanguage(slug, 'fi');
    if (!originalPage) {
      return {
        success: false,
        error: `Page with slug "${slug}" not found`,
      };
    }

    // Generate new slug
    let newSlug = `${slug}-copy`;
    let counter = 1;
    while (await pageSlugExists(newSlug)) {
      newSlug = `${slug}-copy-${counter}`;
      counter++;
    }

    const newPath = `${originalPage.path}-copy`;
    const now = new Date();

    // Get original blocks
    const originalBlocks = extractBlocks(originalPage.content);
    
    // Update title to indicate it's a copy
    const copyTitle = originalPage.language === 'fi' 
      ? `${originalPage.title} (Kopio)`
      : `${originalPage.title} (Copy)`;

    // Create new page
    const newPage = await createPage({
      slug: newSlug,
      path: newPath,
      language: originalPage.language,
      title: copyTitle,
      content: {
        type: 'blocks',
        data: originalBlocks,
      },
      metadata: originalPage.metadata,
      status: 'draft',
      isActive: true,
      isFeatured: false,
      showInMenu: false,
    });

    // Convert to PageData format
    const pageData = pageRecordToPageData(newPage, (newPage.language as 'en' | 'fi') || 'en');

    revalidatePath('/admin/page-builder');

    return {
      success: true,
      data: pageData,
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
  targetLocales: ('en' | 'fi')[],
  sourceLang: 'en' | 'fi' = 'en'
): Promise<ActionResult<PageData>> {
  try {
    const userId = await requireAuth();

    const page = await findPageBySlugAndLanguage(slug, sourceLang);
    if (!page) {
      return { success: false, error: `Page "${slug}" not found` };
    }

    // Get blocks from content
    const blocks = extractBlocks(page.content);
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex === -1) {
      return { success: false, error: `Block "${blockId}" not found` };
    }

    const block = blocks[blockIndex];
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
    const newAutoTranslated = Array.from(new Set([...existingAutoTranslated, ...targetLocales]));

    // Update the block with translated content and meta
    blocks[blockIndex] = {
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

    // Update page in database
    const updatedPage = await updatePage(page.id, {
      content: {
        type: 'blocks',
        data: blocks,
      },
    });

    if (!updatedPage) {
      return { success: false, error: 'Failed to update page' };
    }

    // Convert to PageData format
    const pageData = pageRecordToPageData(updatedPage, (updatedPage.language as 'en' | 'fi') || 'en');

    revalidatePath('/admin/page-builder');
    revalidatePath(page.path);

    // Collect any translation errors for the response message
    const allErrors = [contentError, itemsError, headerError].filter(Boolean);
    const message = allErrors.length > 0
      ? `Translated to ${targetLocales.join(', ')} with warnings: ${allErrors.join('; ')}`
      : `Successfully translated to ${targetLocales.join(', ')}`;

    return {
      success: true,
      data: pageData,
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
  locale: 'en' | 'fi'
): Promise<ActionResult<PageData>> {
  try {
    const userId = await requireAuth();

    const page = await findPageBySlugAndLanguage(slug, locale);
    if (!page) {
      return { success: false, error: `Page "${slug}" not found` };
    }

    // Get blocks from content
    const blocks = extractBlocks(page.content);
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex === -1) {
      return { success: false, error: `Block "${blockId}" not found` };
    }

    const block = blocks[blockIndex];
    const existingReviewed = block.meta?.manuallyReviewed || [];

    if (!existingReviewed.includes(locale)) {
      blocks[blockIndex] = {
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

      // Update page in database
      const updatedPage = await updatePage(page.id, {
        content: {
          type: 'blocks',
          data: blocks,
        },
      });

      if (!updatedPage) {
        return { success: false, error: 'Failed to update page' };
      }

      // Convert to PageData format
      const pageData = pageRecordToPageData(updatedPage, (updatedPage.language as 'en' | 'fi') || 'en');

      revalidatePath('/admin/page-builder');
      revalidatePath(page.path);

      return {
        success: true,
        data: pageData,
        message: `Block marked as reviewed for ${locale}`,
      };
    }

    // If already reviewed, just return the page
    const pageData = pageRecordToPageData(page, (page.language as 'en' | 'fi') || 'en');
    return {
      success: true,
      data: pageData,
      message: `Block already marked as reviewed for ${locale}`,
    };
  } catch (error) {
    console.error('Error marking block as reviewed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as reviewed',
    };
  }
}
