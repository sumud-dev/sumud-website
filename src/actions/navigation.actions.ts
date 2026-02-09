/**
 * Server Actions for Navigation Configuration
 * 
 * Server actions for CRUD operations on header and footer configurations.
 * Data is stored in the database via navigation.queries.ts
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import {
  getHeaderConfigFromDb,
  getFooterConfigFromDb,
  saveHeaderConfigToDb,
  saveFooterConfigToDb,
  type Locale as DbLocale,
} from '@/src/lib/db/queries/navigation.queries';
import {
  type HeaderConfigData,
  type FooterConfigData,
  type SocialLink as SchemaSocialLink,
  type LegacyNavLink,
} from '@/src/lib/db/schema/navigation';

// Re-export types for compatibility
export type Locale = DbLocale;
export type HeaderConfig = HeaderConfigData;
export type FooterConfig = FooterConfigData;
export type SocialLink = SchemaSocialLink;
export type NavLink = LegacyNavLink;

export interface TranslatedText {
  en: string;
  fi: string;
  [key: string]: string;
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
    const config = await getHeaderConfigFromDb();
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

    await saveHeaderConfigToDb(config);

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
    const config = await getFooterConfigFromDb();
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

    await saveFooterConfigToDb(config);

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
 * Get available pages for navigation configuration
 */
export async function getAvailablePages(): Promise<ActionResult<AvailablePage[]>> {
  try {
    const { getPublishedPages } = await import('@/src/actions/pages.actions');
    
    // Get published pages for all languages
    const enPages = await getPublishedPages('en');
    const fiPages = await getPublishedPages('fi');
    
    // Combine and deduplicate by slug
    const pageMap = new Map<string, AvailablePage>();
    
    for (const page of [...enPages, ...fiPages]) {
      if (!pageMap.has(page.slug)) {
        pageMap.set(page.slug, {
          slug: page.slug,
          path: page.path,
          title: page.title,
        });
      }
    }
    
    const availablePages = Array.from(pageMap.values());
    
    return { success: true, data: availablePages };
  } catch (error) {
    console.error('Error fetching available pages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch available pages',
    };
  }
}