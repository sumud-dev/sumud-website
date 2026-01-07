/**
 * File Storage Utilities for Pages
 * 
 * Handles reading/writing page JSON files to content/pages/ directory.
 * Each page is stored as {slug}.json with all translations embedded.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { PageData, PageSummary } from '@/src/lib/types/page';

// Base directory for page content files
const PAGES_CONTENT_DIR = path.join(process.cwd(), 'content', 'pages');

/**
 * Ensure the content/pages directory exists
 */
async function ensureContentDir(): Promise<void> {
  try {
    await fs.mkdir(PAGES_CONTENT_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get the file path for a page
 */
function getPageFilePath(slug: string): string {
  return path.join(PAGES_CONTENT_DIR, `${slug}.json`);
}

/**
 * Read a page from its JSON file
 */
export async function readPage(slug: string): Promise<PageData | null> {
  try {
    const filePath = getPageFilePath(slug);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as PageData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write a page to its JSON file
 */
export async function writePage(page: PageData): Promise<void> {
  await ensureContentDir();
  const filePath = getPageFilePath(page.slug);
  const content = JSON.stringify(page, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Delete a page JSON file
 */
export async function deletePage(slug: string): Promise<boolean> {
  try {
    const filePath = getPageFilePath(slug);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * List all pages (returns summaries without full block content)
 */
export async function listPages(): Promise<PageSummary[]> {
  await ensureContentDir();
  
  try {
    const files = await fs.readdir(PAGES_CONTENT_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const pages: PageSummary[] = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(PAGES_CONTENT_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const page = JSON.parse(content) as PageData;
        
        // Extract title from default locale or first available
        const defaultLocale: 'en' | 'ar' | 'fi' = 'en';
        const translation = page.translations[defaultLocale] 
          || page.translations.en 
          || page.translations.ar 
          || page.translations.fi;
        
        pages.push({
          slug: page.slug,
          path: page.path,
          status: page.status,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          title: translation?.title || page.slug,
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
 * Check if a page slug already exists
 */
export async function pageExists(slug: string): Promise<boolean> {
  try {
    const filePath = getPageFilePath(slug);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rename a page (change its slug)
 */
export async function renamePage(oldSlug: string, newSlug: string): Promise<boolean> {
  try {
    const page = await readPage(oldSlug);
    if (!page) return false;
    
    // Check if new slug already exists
    if (await pageExists(newSlug)) {
      throw new Error(`Page with slug "${newSlug}" already exists`);
    }
    
    // Update slug and save to new file
    page.slug = newSlug;
    page.updatedAt = new Date().toISOString();
    await writePage(page);
    
    // Delete old file
    await deletePage(oldSlug);
    
    return true;
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
