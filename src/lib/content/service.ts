/**
 * Content Service
 * 
 * Centralized service for content operations with support for locale-first structure
 */

import { 
  readLocalizedPage, 
  writeLocalizedPage, 
  readPage,
  listPages,
  deletePage as deletePageFile,
  pageExists,
  type Locale,
  type LocalizedPageData,
} from '@/src/lib/pages/file-storage';
import {
  readLocalizedNavigation,
  writeLocalizedNavigation,
  type LocalizedNavigationConfig,
} from '@/src/lib/navigation/file-storage';
import { 
  normalizeBlockContent,
  extractLocalizedValue,
  createTimestamp,
} from '@/src/lib/content/helpers';
import {
  validatePageFile,
  validateNavigationFile,
} from '@/src/lib/content/validator';

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
    page.blocks = normalizeBlockContent(page.blocks, locale);
    
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
