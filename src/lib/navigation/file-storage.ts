/**
 * Navigation File Storage Utilities
 * 
 * Handles reading/writing navigation JSON files in locale-first structure:
 * content/{locale}/navigation/{navId}.json
 */

import { promises as fs } from 'fs';
import path from 'path';

// Base directory for content files
const CONTENT_BASE_DIR = path.join(process.cwd(), 'content');
const SUPPORTED_LOCALES = ['en', 'fi'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// New locale-first navigation structure
export interface LocalizedNavItem {
  label: string;
  href: string;
  children?: LocalizedNavItem[];
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
  socialLinks?: SocialLink[];
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

// Legacy types for backward compatibility
export interface NavLink {
  labelKey: string;
  labels: Record<Locale, string>;
  href: string;
  children?: NavLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface LegacyHeaderConfig {
  siteName: Record<Locale, string>;
  logo?: string;
  navigationLinks: NavLink[];
  updatedAt: string;
}

export interface LegacyFooterConfig {
  description: Record<Locale, string>;
  logo?: string;
  quickLinks: NavLink[];
  getInvolvedLinks: NavLink[];
  resourceLinks: NavLink[];
  legalLinks: NavLink[];
  socialLinks: SocialLink[];
  newsletter: {
    title: Record<Locale, string>;
    subtitle: Record<Locale, string>;
  };
  copyright: Record<Locale, string>;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  updatedAt: string;
}

/**
 * Ensure the content/{locale}/navigation directory exists
 */
async function ensureNavigationDir(locale: Locale): Promise<void> {
  const dir = path.join(CONTENT_BASE_DIR, locale, 'navigation');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get the file path for a navigation config in a specific locale
 */
function getNavigationFilePath(locale: Locale, navId: string): string {
  return path.join(CONTENT_BASE_DIR, locale, 'navigation', `${navId}.json`);
}

/**
 * Read a single localized navigation config
 */
export async function readLocalizedNavigation(
  locale: Locale,
  navId: string
): Promise<LocalizedNavigationConfig | null> {
  try {
    const filePath = getNavigationFilePath(locale, navId);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as LocalizedNavigationConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write a localized navigation config
 */
export async function writeLocalizedNavigation(
  locale: Locale,
  config: LocalizedNavigationConfig
): Promise<void> {
  await ensureNavigationDir(locale);
  const filePath = getNavigationFilePath(locale, config.id);
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Convert localized nav items to legacy format
 */
function localizedItemsToLegacy(
  items: LocalizedNavItem[] | undefined,
  allLocaleItems: Record<Locale, LocalizedNavItem[] | undefined>
): NavLink[] {
  if (!items) return [];
  
  return items.map((item, index) => {
    const labels: Record<Locale, string> = {} as Record<Locale, string>;
    
    for (const locale of SUPPORTED_LOCALES) {
      const localeItems = allLocaleItems[locale];
      labels[locale] = localeItems?.[index]?.label || item.label;
    }
    
    return {
      labelKey: item.label.toLowerCase().replace(/\s+/g, '-'),
      labels,
      href: item.href,
      children: item.children
        ? localizedItemsToLegacy(
            item.children,
            Object.fromEntries(
              SUPPORTED_LOCALES.map(loc => [
                loc,
                allLocaleItems[loc]?.[index]?.children,
              ])
            ) as Record<Locale, LocalizedNavItem[] | undefined>
          )
        : undefined,
    };
  });
}

/**
 * Read header config in legacy format (for backward compatibility)
 */
export async function readHeaderConfig(): Promise<LegacyHeaderConfig> {
  const configs: Record<Locale, LocalizedNavigationConfig | null> = {} as any;
  
  for (const locale of SUPPORTED_LOCALES) {
    configs[locale] = await readLocalizedNavigation(locale, 'header');
  }
  
  const enConfig = configs.en;
  if (!enConfig) {
    // Return default if no config exists
    return {
      siteName: { en: 'Sumud', fi: 'Sumud' },
      navigationLinks: [],
      updatedAt: new Date().toISOString(),
    };
  }
  
  const siteName: Record<Locale, string> = {} as Record<Locale, string>;
  for (const locale of SUPPORTED_LOCALES) {
    siteName[locale] = configs[locale]?.siteName || enConfig.siteName || 'Sumud';
  }
  
  const allItems: Record<Locale, LocalizedNavItem[] | undefined> = {} as any;
  for (const locale of SUPPORTED_LOCALES) {
    allItems[locale] = configs[locale]?.items;
  }
  
  return {
    siteName,
    logo: enConfig.logo,
    navigationLinks: localizedItemsToLegacy(enConfig.items, allItems),
    updatedAt: enConfig.updatedAt,
  };
}

/**
 * Read footer config in legacy format (for backward compatibility)
 */
export async function readFooterConfig(): Promise<LegacyFooterConfig> {
  const configs: Record<Locale, LocalizedNavigationConfig | null> = {} as any;
  
  for (const locale of SUPPORTED_LOCALES) {
    configs[locale] = await readLocalizedNavigation(locale, 'footer');
  }
  
  const enConfig = configs.en;
  if (!enConfig) {
    // Return default if no config exists
    return {
      description: { en: '', fi: '' },
      quickLinks: [],
      getInvolvedLinks: [],
      resourceLinks: [],
      legalLinks: [],
      socialLinks: [],
      newsletter: {
        title: { en: '', fi: '' },
        subtitle: { en: '', fi: '' },
      },
      copyright: { en: '', fi: '' },
      contact: {
        email: 'info@sumud.fi',
        phone: '+358 XX XXX XXXX',
        location: 'Helsinki, Finland',
      },
      updatedAt: new Date().toISOString(),
    };
  }
  
  const allQuickLinks: Record<Locale, LocalizedNavItem[] | undefined> = {} as any;
  const allGetInvolvedLinks: Record<Locale, LocalizedNavItem[] | undefined> = {} as any;
  const allResourceLinks: Record<Locale, LocalizedNavItem[] | undefined> = {} as any;
  const allLegalLinks: Record<Locale, LocalizedNavItem[] | undefined> = {} as any;
  
  for (const locale of SUPPORTED_LOCALES) {
    allQuickLinks[locale] = configs[locale]?.quickLinks;
    allGetInvolvedLinks[locale] = configs[locale]?.getInvolvedLinks;
    allResourceLinks[locale] = configs[locale]?.resourceLinks;
    allLegalLinks[locale] = configs[locale]?.legalLinks;
  }
  
  const description: Record<Locale, string> = {} as Record<Locale, string>;
  const newsletterTitle: Record<Locale, string> = {} as Record<Locale, string>;
  const newsletterSubtitle: Record<Locale, string> = {} as Record<Locale, string>;
  const copyright: Record<Locale, string> = {} as Record<Locale, string>;
  
  for (const locale of SUPPORTED_LOCALES) {
    description[locale] = configs[locale]?.newsletter?.title || '';
    newsletterTitle[locale] = configs[locale]?.newsletter?.title || '';
    newsletterSubtitle[locale] = configs[locale]?.newsletter?.subtitle || '';
    copyright[locale] = configs[locale]?.copyright || '';
  }
  
  return {
    description,
    logo: enConfig.logo,
    quickLinks: localizedItemsToLegacy(enConfig.quickLinks, allQuickLinks),
    getInvolvedLinks: localizedItemsToLegacy(enConfig.getInvolvedLinks, allGetInvolvedLinks),
    resourceLinks: localizedItemsToLegacy(enConfig.resourceLinks, allResourceLinks),
    legalLinks: localizedItemsToLegacy(enConfig.legalLinks, allLegalLinks),
    socialLinks: enConfig.socialLinks || [],
    newsletter: {
      title: newsletterTitle,
      subtitle: newsletterSubtitle,
    },
    copyright,
    contact: enConfig.contact || {
      email: 'info@sumud.fi',
      phone: '+358 XX XXX XXXX',
      location: 'Helsinki, Finland',
    },
    updatedAt: enConfig.updatedAt,
  };
}

/**
 * Convert legacy nav links to localized format
 */
function legacyItemsToLocalized(items: NavLink[] | undefined, locale: Locale): LocalizedNavItem[] {
  if (!items) return [];
  
  return items.map(item => ({
    label: item.labels[locale] || item.labels.en || item.labelKey,
    href: item.href,
    children: item.children ? legacyItemsToLocalized(item.children, locale) : undefined,
  }));
}

/**
 * Write header config from legacy format
 */
export async function writeHeaderConfig(config: Omit<LegacyHeaderConfig, 'updatedAt'>): Promise<void> {
  const now = new Date().toISOString();
  
  for (const locale of SUPPORTED_LOCALES) {
    const localizedConfig: LocalizedNavigationConfig = {
      id: 'header',
      siteName: config.siteName[locale],
      logo: config.logo,
      items: legacyItemsToLocalized(config.navigationLinks, locale),
      updatedAt: now,
    };
    
    await writeLocalizedNavigation(locale, localizedConfig);
  }
}

/**
 * Write footer config from legacy format
 */
export async function writeFooterConfig(config: Omit<LegacyFooterConfig, 'updatedAt'>): Promise<void> {
  const now = new Date().toISOString();
  
  for (const locale of SUPPORTED_LOCALES) {
    const localizedConfig: LocalizedNavigationConfig = {
      id: 'footer',
      logo: config.logo,
      quickLinks: legacyItemsToLocalized(config.quickLinks, locale),
      getInvolvedLinks: legacyItemsToLocalized(config.getInvolvedLinks, locale),
      resourceLinks: legacyItemsToLocalized(config.resourceLinks, locale),
      legalLinks: legacyItemsToLocalized(config.legalLinks, locale),
      socialLinks: config.socialLinks,
      newsletter: {
        title: config.newsletter.title[locale],
        subtitle: config.newsletter.subtitle[locale],
      },
      copyright: config.copyright[locale],
      contact: config.contact,
      updatedAt: now,
    };
    
    await writeLocalizedNavigation(locale, localizedConfig);
  }
}
