/**
 * Content Service
 * 
 * Centralized service for content operations with support for locale-first structure
 */
import { 
  normalizeBlockContent,
  extractLocalizedValue,
  createTimestamp,
} from '@/src/lib/content/helpers';
import {
  validatePageFile,
  validateNavigationFile,
} from '@/src/lib/content/validator';
import {
  findPageBySlugAndLanguage,
  createPage as dbCreatePage,
  updatePage as dbUpdatePage,
  deletePage as dbDeletePage,
  listPagesPaginated,
} from '@/src/lib/db/queries/pages.queries';
import type { PageRecord } from '@/src/lib/db/queries/pages.queries';

type Locale = 'en' | 'fi';

// Type definitions for page data
export interface LocalizedPageData {
  slug: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  blocks: PageBlock[];
}

export interface PageBlock {
  id: string;
  type: string;
  content: Record<string, any>;
}

export interface LocalizedNavigationConfig {
  id: string;
  siteName?: string;
  logo?: string;
  items?: LocalizedNavItem[];
  quickLinks?: LocalizedNavItem[];
  getInvolvedLinks?: LocalizedNavItem[];
  resourceLinks?: LocalizedNavItem[];
  legalLinks?: LocalizedNavItem[];
  newsletter?: {
    title?: string;
    subtitle?: string;
  };
  copyright?: string;
  contact?: {
    email: string;
    phone: string;
    location: string;
  };
  updatedAt: string;
}

export interface LocalizedNavItem {
  label: string;
  href: string;
  children?: LocalizedNavItem[];
}

// Helper functions for database integration
async function readLocalizedPage(locale: Locale, slug: string): Promise<LocalizedPageData | null> {
  const page = await findPageBySlugAndLanguage(slug, locale);
  if (!page) return null;
  
  return {
    slug: page.slug,
    title: page.title,
    description: page.metadata?.description,
    status: page.status as 'draft' | 'published' | 'archived',
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
    blocks: (page.content?.type === 'blocks' ? page.content.data : []) as PageBlock[],
  };
}

async function writeLocalizedPage(locale: Locale, page: LocalizedPageData): Promise<void> {
  const existingPage = await findPageBySlugAndLanguage(page.slug, locale);
  
  const pageData = {
    slug: page.slug,
    title: page.title,
    status: page.status,
    language: locale,
    content: {
      type: 'blocks' as const,
      data: page.blocks,
    },
    metadata: page.description ? { description: page.description } : null,
  };
  
  if (existingPage) {
    await dbUpdatePage(existingPage.id, pageData);
  } else {
    await dbCreatePage({
      ...pageData,
      path: `/${page.slug}`,
      isActive: page.status === 'published',
    });
  }
}

async function readPage(slug: string): Promise<any> {
  // Legacy compatibility - returns first found page
  const enPage = await findPageBySlugAndLanguage(slug, 'en');
  const fiPage = await findPageBySlugAndLanguage(slug, 'fi');
  
  return {
    slug,
    translations: {
      en: enPage,
      fi: fiPage,
    },
  };
}

async function pageExists(slug: string): Promise<boolean> {
  const enPage = await findPageBySlugAndLanguage(slug, 'en');
  const fiPage = await findPageBySlugAndLanguage(slug, 'fi');
  return !!(enPage || fiPage);
}

async function deletePageFile(slug: string): Promise<boolean> {
  const enPage = await findPageBySlugAndLanguage(slug, 'en');
  const fiPage = await findPageBySlugAndLanguage(slug, 'fi');
  
  let deleted = false;
  if (enPage) {
    await dbDeletePage(enPage.id);
    deleted = true;
  }
  if (fiPage) {
    await dbDeletePage(fiPage.id);
    deleted = true;
  }
  
  return deleted;
}

async function listPages(): Promise<any[]> {
  const result = await listPagesPaginated();
  return result.pages;
}

async function readLocalizedNavigation(locale: Locale, navId: string): Promise<LocalizedNavigationConfig | null> {
  // TODO: Implement navigation reading from database
  return null;
}

async function writeLocalizedNavigation(locale: Locale, config: LocalizedNavigationConfig): Promise<void> {
  // TODO: Implement navigation writing to database
}

export class ContentService {
  /**
   * Get a page for a specific locale
   */
  static async getPage(locale: Locale, slug: string): Promise<LocalizedPageData | null> {
    const page = await readLocalizedPage(locale, slug);
    
    if (!page) {
      return null;
    }
    
    // Normalize blocks to ensure fully localized content
    page.blocks = normalizeBlockContent(page.blocks as unknown as Record<string, unknown>[], locale) as unknown as PageBlock[];
    
    return page;
  }
  
  /**
   * Get a page with all locales (legacy compatibility)
   */
  static async getPageAllLocales(slug: string) {
    return readPage(slug);
  }
  
  /**
   * Create a new page in a specific locale
   */
  static async createPage(
    locale: Locale,
    data: Omit<LocalizedPageData, 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string }> {
    // Check if page already exists
    if (await pageExists(data.slug)) {
      return {
        success: false,
        error: `Page with slug "${data.slug}" already exists`,
      };
    }
    
    const now = createTimestamp();
    const page: LocalizedPageData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    
    // Validate
    const validation = await validatePageFile(locale, page, {
      checkLocalization: true,
    });
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.map(e => e.message).join(', '),
      };
    }
    
    // Write
    await writeLocalizedPage(locale, page);
    
    return { success: true };
  }
  
  /**
   * Update a page in a specific locale
   */
  static async updatePage(
    locale: Locale,
    slug: string,
    updates: Partial<Omit<LocalizedPageData, 'slug' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ success: boolean; error?: string }> {
    const existingPage = await readLocalizedPage(locale, slug);
    
    if (!existingPage) {
      return {
        success: false,
        error: `Page "${slug}" not found for locale "${locale}"`,
      };
    }
    
    const updatedPage: LocalizedPageData = {
      ...existingPage,
      ...updates,
      slug: existingPage.slug, // Preserve slug
      createdAt: existingPage.createdAt, // Preserve creation time
      updatedAt: createTimestamp(),
    };
    
    // Validate
    const validation = await validatePageFile(locale, updatedPage, {
      checkLocalization: true,
    });
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.map(e => e.message).join(', '),
      };
    }
    
    // Write
    await writeLocalizedPage(locale, updatedPage);
    
    return { success: true };
  }
  
  /**
   * Delete a page from all locales
   */
  static async deletePage(slug: string): Promise<{ success: boolean; error?: string }> {
    const deleted = await deletePageFile(slug);
    
    if (!deleted) {
      return {
        success: false,
        error: `Page "${slug}" not found`,
      };
    }
    
    return { success: true };
  }
  
  /**
   * List all pages
   */
  static async listPages() {
    return listPages();
  }
  
  /**
   * Copy a page from one locale to another
   */
  static async copyPageToLocale(
    sourceLocale: Locale,
    targetLocale: Locale,
    slug: string
  ): Promise<{ success: boolean; error?: string }> {
    const sourcePage = await readLocalizedPage(sourceLocale, slug);
    
    if (!sourcePage) {
      return {
        success: false,
        error: `Source page not found for locale "${sourceLocale}"`,
      };
    }
    
    // Check if target already exists
    const targetPage = await readLocalizedPage(targetLocale, slug);
    if (targetPage) {
      return {
        success: false,
        error: `Page already exists in target locale "${targetLocale}"`,
      };
    }
    
    // Create copy with same structure but needs translation
    const newPage: LocalizedPageData = {
      ...sourcePage,
      updatedAt: createTimestamp(),
    };
    
    await writeLocalizedPage(targetLocale, newPage);
    
    return { success: true };
  }
  
  /**
   * Get navigation for a specific locale
   */
  static async getNavigation(
    locale: Locale,
    navId: string
  ): Promise<LocalizedNavigationConfig | null> {
    return readLocalizedNavigation(locale, navId);
  }
  
  /**
   * Update navigation for a specific locale
   */
  static async updateNavigation(
    locale: Locale,
    config: Omit<LocalizedNavigationConfig, 'updatedAt'>
  ): Promise<{ success: boolean; error?: string }> {
    const updatedConfig: LocalizedNavigationConfig = {
      ...config,
      updatedAt: createTimestamp(),
    };
    
    // Validate
    const validation = await validateNavigationFile(locale, updatedConfig);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.map(e => e.message).join(', '),
      };
    }
    
    await writeLocalizedNavigation(locale, updatedConfig);
    
    return { success: true };
  }
  
  /**
   * Extract localized block content
   */
  static extractLocalizedContent<T = unknown>(
    content: T,
    locale: Locale,
    fallbackLocale: Locale = 'en'
  ): T {
    return extractLocalizedValue(content, locale, fallbackLocale) as T;
  }
  
  /**
   * Check if a page exists
   */
  static async pageExists(slug: string): Promise<boolean> {
    return pageExists(slug);
  }
  
  /**
   * Get page status across all locales
   */
  static async getPageLocaleStatus(slug: string): Promise<{
    [K in Locale]: boolean;
  }> {
    const status = {
      en: false,
      fi: false,
    };
    
    for (const locale of ['en', 'fi'] as Locale[]) {
      const page = await readLocalizedPage(locale, slug);
      status[locale] = page !== null;
    }
    
    return status;
  }
  
  /**
   * Sync page metadata across locales (slug, status, timestamps)
   */
  static async syncPageMetadata(
    slug: string,
    updates: Partial<Pick<LocalizedPageData, 'status'>>
  ): Promise<{ success: boolean; error?: string }> {
    const locales: Locale[] = ['en', 'fi'];
    const updatedAt = createTimestamp();
    
    for (const locale of locales) {
      const page = await readLocalizedPage(locale, slug);
      if (page) {
        const updatedPage = {
          ...page,
          ...updates,
          updatedAt,
        };
        await writeLocalizedPage(locale, updatedPage);
      }
    }
    
    return { success: true };
  }
}

export default ContentService;
