/**
 * Server Actions for Navigation Configuration
 * 
 * Server actions for CRUD operations on header and footer configuration files.
 */

'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

// Base directory for navigation config files
const NAVIGATION_CONFIG_DIR = path.join(process.cwd(), 'content', 'navigation');

// ============================================
// TYPES
// ============================================

export type Locale = 'en' | 'ar' | 'fi';

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

export interface SocialLink {
  platform: string;
  url: string;
}

export interface HeaderConfig {
  siteName: TranslatedText;
  logo?: string;
  navigationLinks: NavLink[];
  updatedAt: string;
}

export interface FooterConfig {
  description: TranslatedText;
  logo?: string;
  quickLinks: NavLink[];
  getInvolvedLinks: NavLink[];
  resourceLinks: NavLink[];
  legalLinks: NavLink[];
  socialLinks: SocialLink[];
  newsletter: {
    title: TranslatedText;
    subtitle: TranslatedText;
  };
  copyright: TranslatedText;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  updatedAt: string;
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

/**
 * Ensure the content/navigation directory exists
 */
async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(NAVIGATION_CONFIG_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get the file path for a config
 */
function getConfigFilePath(configName: 'header' | 'footer'): string {
  return path.join(NAVIGATION_CONFIG_DIR, `${configName}.json`);
}

// ============================================
// HEADER ACTIONS
// ============================================

/**
 * Get header configuration
 */
export async function getHeaderConfig(): Promise<ActionResult<HeaderConfig>> {
  try {
    const filePath = getConfigFilePath('header');
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, data: JSON.parse(content) as HeaderConfig };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Return default config if file doesn't exist
      const defaultConfig: HeaderConfig = {
        siteName: { en: 'Sumud', ar: 'صمود', fi: 'Sumud' },
        navigationLinks: [],
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: defaultConfig };
    }
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
    await ensureConfigDir();

    const updatedConfig: HeaderConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    const filePath = getConfigFilePath('header');
    await fs.writeFile(filePath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    // Revalidate all pages that use the header
    revalidatePath('/', 'layout');

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
    const filePath = getConfigFilePath('footer');
    const content = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(content) as Partial<FooterConfig>;
    
    // Migrate old config files that don't have the contact property
    if (!config.contact) {
      config.contact = {
        email: 'info@sumud.fi',
        phone: '+358 XX XXX XXXX',
        location: 'Helsinki, Finland',
      };
    }
    
    return { success: true, data: config as FooterConfig };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Return default config if file doesn't exist
      const defaultConfig: FooterConfig = {
        description: { en: '', ar: '', fi: '' },
        quickLinks: [],
        getInvolvedLinks: [],
        resourceLinks: [],
        legalLinks: [],
        socialLinks: [],
        newsletter: {
          title: { en: 'Stay Updated', ar: 'ابق على اطلاع', fi: 'Pysy ajan tasalla' },
          subtitle: { en: '', ar: '', fi: '' },
        },
        copyright: { en: '', ar: '', fi: '' },
        contact: {
          email: 'info@sumud.fi',
          phone: '+358 XX XXX XXXX',
          location: 'Helsinki, Finland',
        },
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: defaultConfig };
    }
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
    await ensureConfigDir();

    const updatedConfig: FooterConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    const filePath = getConfigFilePath('footer');
    await fs.writeFile(filePath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    // Revalidate all pages that use the footer
    revalidatePath('/', 'layout');

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
    const pagesDir = path.join(process.cwd(), 'content', 'pages');
    const files = await fs.readdir(pagesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const pages: AvailablePage[] = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(pagesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const page = JSON.parse(content);
        
        // Only include published pages
        if (page.status !== 'published') continue;
        
        // Extract title from English translation or first available
        const translation = page.translations?.en 
          || page.translations?.ar 
          || page.translations?.fi;
        
        pages.push({
          slug: page.slug,
          path: page.path,
          title: translation?.title || page.slug,
        });
      } catch (error) {
        console.error(`Error reading page file ${file}:`, error);
      }
    }
    
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
