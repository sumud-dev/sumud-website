/**
 * Server Actions for Navigation Configuration
 * 
 * Server actions for CRUD operations on header and footer configuration files.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import {
  readHeaderConfig as readHeaderConfigFromStorage,
  readFooterConfig as readFooterConfigFromStorage,
  writeHeaderConfig as writeHeaderConfigToStorage,
  writeFooterConfig as writeFooterConfigToStorage,
  type LegacyHeaderConfig,
  type LegacyFooterConfig,
  type SocialLink as StorageSocialLink,
} from '@/src/lib/navigation/file-storage';
import { listPages } from '@/src/lib/pages/file-storage';

// Re-export types for compatibility
export type Locale = 'en' | 'ar' | 'fi';
export type HeaderConfig = LegacyHeaderConfig;
export type FooterConfig = LegacyFooterConfig;
export type SocialLink = StorageSocialLink;

export interface TranslatedText {
  en: string;
  ar: string;
  fi: string;
}

export interface NavLink {
  labelKey: string;
  labels: TranslatedText;
  href: string;
  children?: NavLink[];
}

// ============================================
// RESULT TYPE
// ============================================

type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

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
// HEADER ACTIONS
// ============================================

/**
 * Get header configuration
 */
export async function getHeaderConfig(): Promise<ActionResult<HeaderConfig>> {
  try {
    const config = await readHeaderConfigFromStorage();
    return { success: true, data: config };
  } catch (error) {
    console.error('Error reading header config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read header config',
    };
  }
}

/**
 * Update header configuration
 */
export async function updateHeaderConfig(
  config: Omit<HeaderConfig, 'updatedAt'>
): Promise<ActionResult<HeaderConfig>> {
  try {
    await requireAuth();

    await writeHeaderConfigToStorage(config);

    // Revalidate all pages that use the header
    revalidatePath('/', 'layout');

    const updatedConfig: HeaderConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedConfig,
      message: 'Header configuration updated successfully',
    };
  } catch (error) {
    console.error('Error updating header config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update header config',
    };
  }
}

// ============================================
// FOOTER ACTIONS
// ============================================

/**
 * Get footer configuration
 */
export async function getFooterConfig(): Promise<ActionResult<FooterConfig>> {
  try {
    const config = await readFooterConfigFromStorage();
    return { success: true, data: config };
  } catch (error) {
    console.error('Error reading footer config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read footer config',
    };
  }
}

/**
 * Update footer configuration
 */
export async function updateFooterConfig(
  config: Omit<FooterConfig, 'updatedAt'>
): Promise<ActionResult<FooterConfig>> {
  try {
    await requireAuth();

    await writeFooterConfigToStorage(config);

    // Revalidate all pages that use the footer
    revalidatePath('/', 'layout');

    const updatedConfig: FooterConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedConfig,
      message: 'Footer configuration updated successfully',
    };
  } catch (error) {
    console.error('Error updating footer config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update footer config',
    };
  }
}

// ============================================
// AVAILABLE PAGES FOR NAVIGATION
// ============================================

export interface AvailablePage {
  slug: string;
  path: string;
  title: string;
}

/**
 * Get available pages for navigation menus
 * Returns published pages from the content/pages directory
 */
export async function getAvailablePages(): Promise<ActionResult<AvailablePage[]>> {
  try {
    const allPages = await listPages();
    
    // Only include published pages
    const publishedPages = allPages.filter(page => page.status === 'published');
    
    // Map to AvailablePage format
    const pages: AvailablePage[] = publishedPages.map(page => ({
      slug: page.slug,
      path: page.path,
      title: page.title,
    }));
    
    // Sort alphabetically by title
    return { 
      success: true, 
      data: pages.sort((a, b) => a.title.localeCompare(b.title)) 
    };
  } catch (error) {
    console.error('Error getting available pages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get available pages',
    };
  }
}