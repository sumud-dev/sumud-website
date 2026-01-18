/**
 * File Storage Utilities for Pages
 * 
 * Handles reading/writing page JSON files in locale-first structure:
 * content/{locale}/pages/{slug}.json
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { PageData, PageSummary } from '@/src/lib/types/page';

// Base directory for content files
const CONTENT_BASE_DIR = path.join(process.cwd(), 'content');
const SUPPORTED_LOCALES = ['en', 'ar', 'fi'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// New locale-first structure
export interface LocalizedPageData {
  slug: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  blocks: any[];
}

/**
 * Ensure the content/{locale}/pages directory exists
 */
async function ensureContentDir(locale: Locale): Promise<void> {
  const dir = path.join(CONTENT_BASE_DIR, locale, 'pages');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get the file path for a page in a specific locale
 */
function getPageFilePath(locale: Locale, slug: string): string {
  return path.join(CONTENT_BASE_DIR, locale, 'pages', `${slug}.json`);
}

/**
 * Read a single localized page
 */
export async function readLocalizedPage(locale: Locale, slug: string): Promise<LocalizedPageData | null> {
  try {
    const filePath = getPageFilePath(locale, slug);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as LocalizedPageData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Read a page with all translations (legacy PageData format for compatibility)
 */
export async function readPage(slug: string): Promise<PageData | null> {
  try {
    // Try to read from all locales
    const translations: any = {};
    let baseData: LocalizedPageData | null = null;
    
    for (const locale of SUPPORTED_LOCALES) {
      const localeData = await readLocalizedPage(locale, slug);
      if (localeData) {
        if (!baseData) {
          baseData = localeData;
        }
        translations[locale] = {
          title: localeData.title,
          description: localeData.description || '',
          blocks: localeData.blocks,
        };
      }
    }
    
    if (!baseData) {
      return null;
    }
    
    // Return in legacy format for compatibility
    return {
      slug: baseData.slug,
      path: `/${baseData.slug === 'home' ? '' : baseData.slug}`,
      status: baseData.status,
      createdAt: baseData.createdAt,
      updatedAt: baseData.updatedAt,
      translations,
    } as PageData;
  } catch (error) {
    console.error(`Error reading page ${slug}:`, error);
    return null;
  }
}

/**
 * Write a localized page to its JSON file
 */
export async function writeLocalizedPage(locale: Locale, page: LocalizedPageData): Promise<void> {
  await ensureContentDir(locale);
  const filePath = getPageFilePath(locale, page.slug);
  const content = JSON.stringify(page, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Write a page with all translations (legacy format compatibility)
 */
export async function writePage(page: PageData): Promise<void> {
  const now = new Date().toISOString();
  
  for (const locale of SUPPORTED_LOCALES) {
    const translation = page.translations[locale as Locale];
    if (translation) {
      const localizedPage: LocalizedPageData = {
        slug: page.slug,
        title: translation.title,
        description: translation.description,
        status: page.status,
        createdAt: page.createdAt,
        updatedAt: now,
        blocks: translation.blocks,
      };
      await writeLocalizedPage(locale as Locale, localizedPage);
    }
  }
}

/**
 * Delete a page from all locales
 */
export async function deletePage(slug: string): Promise<boolean> {
  let deletedAny = false;
  
  for (const locale of SUPPORTED_LOCALES) {
    try {
      const filePath = getPageFilePath(locale, slug);
      await fs.unlink(filePath);
      deletedAny = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
  
  return deletedAny;
}

/**
 * List all pages (returns summaries from default locale)
 */
export async function listPages(): Promise<PageSummary[]> {
  const defaultLocale: Locale = 'en';
  const pagesDir = path.join(CONTENT_BASE_DIR, defaultLocale, 'pages');
  
  try {
    // Ensure directory exists
    await fs.mkdir(pagesDir, { recursive: true });
    
    const files = await fs.readdir(pagesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const pages: PageSummary[] = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(pagesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const page = JSON.parse(content) as LocalizedPageData;
        
        pages.push({
          slug: page.slug,
          path: `/${page.slug === 'home' ? '' : page.slug}`,
          status: page.status,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          title: page.title,
        });
      } catch (error) {
        console.error(`Error reading page file ${file}:`, error);
      }
    }
    
    // Sort by updatedAt descending
    return pages.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error listing pages:', error);
    return [];
  }
}

/**
 * Check if a page slug already exists in any locale
 */
export async function pageExists(slug: string): Promise<boolean> {
  for (const locale of SUPPORTED_LOCALES) {
    try {
      const filePath = getPageFilePath(locale, slug);
      await fs.access(filePath);
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

/**
 * Rename a page (change its slug) across all locales
 */
export async function renamePage(oldSlug: string, newSlug: string): Promise<boolean> {
  try {
    // Check if new slug already exists
    if (await pageExists(newSlug)) {
      throw new Error(`Page with slug "${newSlug}" already exists`);
    }
    
    const now = new Date().toISOString();
    let renamedAny = false;
    
    // Rename in all locales
    for (const locale of SUPPORTED_LOCALES) {
      const page = await readLocalizedPage(locale, oldSlug);
      if (page) {
        page.slug = newSlug;
        page.updatedAt = now;
        await writeLocalizedPage(locale, page);
        
        // Delete old file
        const oldPath = getPageFilePath(locale, oldSlug);
        await fs.unlink(oldPath);
        renamedAny = true;
      }
    }
    
    return renamedAny;
  } catch (error) {
    throw error;
  }
}

/**
 * Get pages by status
 */
export async function getPagesByStatus(status: 'draft' | 'published'): Promise<PageSummary[]> {
  const allPages = await listPages();
  return allPages.filter(p => p.status === status);
}

/**
 * Find page by path
 */
export async function findPageByPath(pagePath: string): Promise<PageData | null> {
  const pages = await listPages();
  const match = pages.find(p => p.path === pagePath);
  
  if (!match) return null;
  
  return readPage(match.slug);
}
