'use server';

import { db } from '@/src/lib/db/index';
import { pages, pageContent } from '@/src/lib/db/schema/page-builder';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { SerializedNodes } from '@craftjs/core';
import {
  validateContentStructure,
  prepareContentForSync,
  logSyncOperation,
  hasStructuralChanges,
  DEFAULT_SYNC_OPTIONS,
  type SyncStrategy,
} from '@/src/services/page-content-sync.service';

type Language = 'en' | 'fi';
type PageStatus = 'draft' | 'published';

const ALL_LANGUAGES: Language[] = ['en', 'fi'];

// ============================================================================
// QUERIES
// ============================================================================

export async function getPageWithContent(pageId: string, language: Language = 'en') {
  return db.query.pages.findFirst({
    where: eq(pages.id, pageId),
    with: {
      content: {
        where: eq(pageContent.language, language),
      },
    },
  });
}

export async function getPageById(pageId: string) {
  return db.query.pages.findFirst({
    where: eq(pages.id, pageId),
  });
}

export async function getPageWithAllContent(pageId: string) {
  return db.query.pages.findFirst({
    where: eq(pages.id, pageId),
    with: {
      content: true,
    },
  });
}

export async function getPublishedPage(slug: string, language: Language) {
  const [page] = await db
    .select()
    .from(pages)
    .where(and(
      eq(pages.slug, slug),
      eq(pages.status, 'published')
    ))
    .limit(1);

  if (!page) return null;

  const [content] = await db
    .select()
    .from(pageContent)
    .where(and(
      eq(pageContent.pageId, page.id),
      eq(pageContent.language, language)
    ))
    .limit(1);

  if (!content) return null;

  return { page, content: content.content };
}

export async function getAllPages() {
  return db
    .select()
    .from(pages)
    .orderBy(desc(pages.updatedAt));
}

export async function getPublishedPages(language: Language) {
  const publishedPages = await db
    .select({
      slug: pages.slug,
      title: pages.title,
      id: pages.id,
    })
    .from(pages)
    .where(eq(pages.status, 'published'));

  // For each page, get the content in the requested language
  const pagesWithContent = await Promise.all(
    publishedPages.map(async (page) => {
      const [content] = await db
        .select({ title: pageContent.id })
        .from(pageContent)
        .where(and(
          eq(pageContent.pageId, page.id),
          eq(pageContent.language, language)
        ))
        .limit(1);

      // Only include pages that have content in the requested language
      if (!content) return null;

      return {
        slug: page.slug,
        title: page.title,
        path: `/${page.slug}`,
      };
    })
  );

  // Filter out null values (pages without content in the requested language)
  return pagesWithContent.filter((page): page is NonNullable<typeof page> => page !== null);
}

export async function getPageLanguages(pageId: string): Promise<Language[]> {
  const contents = await db
    .select({ language: pageContent.language })
    .from(pageContent)
    .where(eq(pageContent.pageId, pageId));

  return contents.map(c => c.language);
}

export async function slugExists(slug: string, excludePageId?: string) {
  const [existing] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  if (!existing) return false;
  if (excludePageId && existing.id === excludePageId) return false;

  return true;
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create page with default content for all languages
 */
export async function createPage(slug: string, title: string) {
  if (await slugExists(slug)) {
    throw new Error('Slug already exists');
  }

  const [page] = await db
    .insert(pages)
    .values({
      slug,
      title,
      status: 'draft',
    })
    .returning();

  // Create empty content for all languages
  const defaultContent = {} as SerializedNodes;
  
  await Promise.all(
    ALL_LANGUAGES.map(language =>
      db.insert(pageContent).values({
        pageId: page.id,
        language,
        content: defaultContent,
      })
    )
  );

  revalidatePath('/admin/pages');
  return page;
}

/**
 * Update page metadata (title, slug, status)
 */
export async function updatePage(
  pageId: string,
  data: { title?: string; slug?: string; status?: PageStatus }
) {
  if (data.slug && await slugExists(data.slug, pageId)) {
    throw new Error('Slug already exists');
  }

  const [updated] = await db
    .update(pages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pages.id, pageId))
    .returning();

  revalidatePath('/admin/pages');
  revalidatePath(`/editor/${pageId}`);
  return updated;
}

/**
 * Update page content with structure-only sync
 * 
 * CRITICAL: By default, syncs structure while preserving text content per language
 * This prevents overwriting translations when editing in one language
 */
export async function updatePageContent(
  pageId: string,
  language: Language,
  content: SerializedNodes,
  options: { 
    syncAcrossLanguages?: boolean;
    syncStrategy?: SyncStrategy;
  } = {}
) {
  // DEFAULT: Structure-only sync to preserve translations
  const { 
    syncAcrossLanguages = true, 
    syncStrategy = 'structure-only'  // CRITICAL: Default to structure-only
  } = options;

  try {
    console.log('[updatePageContent] Starting update:', {
      pageId,
      language,
      syncAcrossLanguages,
      syncStrategy,
      contentKeys: Object.keys(content || {}),
      hasRootNode: 'ROOT' in (content || {}),
    });

    // Validate content structure
    const validation = validateContentStructure(content);
    if (!validation.valid) {
      throw new Error(`Invalid content: ${validation.errors.join(', ')}`);
    }

    // Save to current language
    const result = await upsertPageContent(pageId, language, content);

    // Sync to other languages with structure-only strategy
    if (syncAcrossLanguages) {
      const otherLanguages = ALL_LANGUAGES.filter(lang => lang !== language);
      
      logSyncOperation(
        pageId,
        language,
        otherLanguages,
        Object.keys(content).length,
        syncStrategy === 'structure-only'
      );

      await syncContentToLanguages(pageId, content, otherLanguages, syncStrategy);
    }

    // Revalidate paths
    await revalidatePagePaths(pageId);

    console.log('[updatePageContent] Update completed successfully');
    return result;
  } catch (error) {
    console.error('[updatePageContent] Error:', {
      pageId,
      language,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Sync content to multiple languages
 * 
 * CRITICAL: Uses structure-only sync by default to preserve translations
 */
async function syncContentToLanguages(
  pageId: string,
  sourceContent: SerializedNodes,
  targetLanguages: Language[],
  syncStrategy: SyncStrategy
) {
  try {
    console.log('[syncContentToLanguages] Starting sync:', {
      pageId,
      targetLanguages,
      syncStrategy,
      nodeCount: Object.keys(sourceContent).length,
    });

    // Get existing content for each target language
    const existingContents = await Promise.all(
      targetLanguages.map(async (lang) => {
        const [existing] = await db
          .select()
          .from(pageContent)
          .where(and(
            eq(pageContent.pageId, pageId),
            eq(pageContent.language, lang)
          ))
          .limit(1);
        
        return { 
          language: lang, 
          content: existing?.content || null 
        };
      })
    );

    // Check if structural changes exist
    const hasChanges = existingContents.some(({ content: existingContent }) => {
      if (!existingContent) return true;
      return hasStructuralChanges(sourceContent, existingContent as SerializedNodes);
    });

    if (!hasChanges) {
      console.log('[syncContentToLanguages] No structural changes detected, skipping sync');
      return;
    }

    // Prepare and upsert content for each language
    const updates = existingContents.map(({ language, content: existingContent }) => {
      // CRITICAL: Preserve text content when syncing structure
      const preparedContent = prepareContentForSync(
        sourceContent,
        existingContent as SerializedNodes | null,
        { 
          strategy: syncStrategy, 
          preserveTextContent: syncStrategy === 'structure-only' 
        }
      );

      console.log(`[syncContentToLanguages] Syncing to ${language}:`, {
        sourceNodes: Object.keys(sourceContent).length,
        existingNodes: existingContent ? Object.keys(existingContent).length : 0,
        resultNodes: Object.keys(preparedContent).length,
      });

      return upsertPageContent(pageId, language, preparedContent);
    });

    await Promise.all(updates);

    console.log('[syncContentToLanguages] Sync completed for languages:', targetLanguages);
  } catch (error) {
    console.error('[syncContentToLanguages] Sync failed:', error);
    // Don't throw - we want the primary save to succeed even if sync fails
  }
}

/**
 * Upsert page content (internal helper)
 */
async function upsertPageContent(
  pageId: string,
  language: Language,
  content: SerializedNodes
) {
  const [existing] = await db
    .select()
    .from(pageContent)
    .where(and(
      eq(pageContent.pageId, pageId),
      eq(pageContent.language, language)
    ))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(pageContent)
      .set({ content, updatedAt: new Date() })
      .where(and(
        eq(pageContent.pageId, pageId),
        eq(pageContent.language, language)
      ))
      .returning();

    if (!updated) {
      throw new Error(`Failed to update content for ${language}`);
    }

    console.log(`[upsertPageContent] Updated ${language}:`, {
      id: updated.id,
      nodeCount: Object.keys(content).length,
    });
    return updated;
  }

  const [created] = await db
    .insert(pageContent)
    .values({
      pageId,
      language,
      content,
    })
    .returning();

  if (!created) {
    throw new Error(`Failed to create content for ${language}`);
  }

  console.log(`[upsertPageContent] Created ${language}:`, {
    id: created.id,
    nodeCount: Object.keys(content).length,
  });
  return created;
}

/**
 * Revalidate all paths for a page
 */
async function revalidatePagePaths(pageId: string) {
  try {
    revalidatePath(`/editor/${pageId}`);
    
    const [page] = await db
      .select({ slug: pages.slug })
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);
    
    if (page) {
      ALL_LANGUAGES.forEach(lang => {
        if (page.slug === '/') {
          revalidatePath(`/${lang}`);
        } else {
          revalidatePath(`/${lang}/${page.slug}`);
        }
      });
      
      console.log('[revalidatePagePaths] Paths revalidated for slug:', page.slug);
    }
  } catch (error) {
    console.warn('[revalidatePagePaths] Revalidation failed:', error);
  }
}

/**
 * Publish page
 */
export async function publishPage(pageId: string) {
  const [updated] = await db
    .update(pages)
    .set({
      status: 'published',
      updatedAt: new Date()
    })
    .where(eq(pages.id, pageId))
    .returning();

  ALL_LANGUAGES.forEach(lang => {
    if (updated.slug === '/') {
      revalidatePath(`/${lang}`);
    } else {
      revalidatePath(`/${lang}/${updated.slug}`);
    }
  });
  
  revalidatePath('/');
  revalidatePath(`/editor/${pageId}`);
  
  return updated;
}

/**
 * Unpublish page
 */
export async function unpublishPage(pageId: string) {
  const [updated] = await db
    .update(pages)
    .set({
      status: 'draft',
      updatedAt: new Date()
    })
    .where(eq(pages.id, pageId))
    .returning();

  ALL_LANGUAGES.forEach(lang => {
    if (updated.slug === '/') {
      revalidatePath(`/${lang}`);
    } else {
      revalidatePath(`/${lang}/${updated.slug}`);
    }
  });
  
  revalidatePath('/');
  revalidatePath(`/editor/${pageId}`);
  
  return updated;
}

/**
 * Delete page (cascade deletes all pageContent)
 */
export async function deletePage(pageId: string) {
  await db
    .delete(pages)
    .where(eq(pages.id, pageId));

  revalidatePath('/admin/pages');
  revalidatePath('/');
}

/**
 * Delete specific language content
 */
export async function deletePageLanguage(pageId: string, language: Language) {
  const languages = await getPageLanguages(pageId);
  
  if (languages.length <= 1) {
    throw new Error('Cannot delete the last language');
  }

  await db
    .delete(pageContent)
    .where(and(
      eq(pageContent.pageId, pageId),
      eq(pageContent.language, language)
    ));

  revalidatePath(`/editor/${pageId}`);
}

/**
 * Manually sync content from one language to another
 * Uses structure-only sync to preserve target language text
 */
export async function syncLanguageContent(
  pageId: string,
  fromLanguage: Language,
  toLanguage: Language,
  options: { preserveText?: boolean } = {}
) {
  const { preserveText = true } = options;

  const [sourceContent] = await db
    .select()
    .from(pageContent)
    .where(and(
      eq(pageContent.pageId, pageId),
      eq(pageContent.language, fromLanguage)
    ))
    .limit(1);

  if (!sourceContent) {
    throw new Error(`Source content not found for language: ${fromLanguage}`);
  }

  const [targetContent] = await db
    .select()
    .from(pageContent)
    .where(and(
      eq(pageContent.pageId, pageId),
      eq(pageContent.language, toLanguage)
    ))
    .limit(1);

  // Prepare content with appropriate strategy
  const preparedContent = prepareContentForSync(
    sourceContent.content as SerializedNodes,
    (targetContent?.content as SerializedNodes) || null,
    {
      strategy: preserveText ? 'structure-only' : 'full-override',
      preserveTextContent: preserveText,
    }
  );

  await upsertPageContent(pageId, toLanguage, preparedContent);
  await revalidatePagePaths(pageId);

  console.log(`[syncLanguageContent] Synced ${fromLanguage} → ${toLanguage}`, {
    preserveText,
  });
}