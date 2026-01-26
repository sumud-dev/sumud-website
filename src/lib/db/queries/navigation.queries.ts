import { db } from "@/src/lib/db";
import { 
  navigationConfig, 
  type NavigationConfig,
  type NewNavigationConfig,
  type NavigationItem,
  type SocialLink,
  type HeaderConfigData,
  type FooterConfigData,
  type LegacyNavLink
} from "@/src/lib/db/schema/navigation";
import { eq, and } from "drizzle-orm";
import { ensureTranslationKeysAction } from "@/src/actions/translations";

// ============================================================================
// CONSTANTS
// ============================================================================

const SUPPORTED_LOCALES = ['en', 'fi'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// ============================================================================
// TYPES
// ============================================================================

export type NavigationQueryResult = 
  | { success: true; data: NavigationConfig }
  | { success: false; error: string };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for navigation items
 */
function generateItemId(): string {
  return `nav-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convert NavigationItem[] to LegacyNavLink[] format
 * Combines items from all locales into the legacy format with labels object
 */
function itemsToLegacyFormat(
  itemsByLocale: Record<Locale, NavigationItem[] | null | undefined>
): LegacyNavLink[] {
  // Use 'en' as the base structure
  const baseItems = itemsByLocale.en || itemsByLocale.fi || [];
  
  return baseItems.map((item, index) => {
    const labels: Record<string, string> = {};
    
    for (const locale of SUPPORTED_LOCALES) {
      const localeItem = itemsByLocale[locale]?.[index];
      labels[locale] = localeItem?.label || item.label;
    }
    
    return {
      labelKey: item.id || item.label.toLowerCase().replace(/\s+/g, '-'),
      labels,
      href: item.href,
      children: item.children && item.children.length > 0
        ? itemsToLegacyFormat(
            Object.fromEntries(
              SUPPORTED_LOCALES.map(loc => [
                loc,
                itemsByLocale[loc]?.[index]?.children,
              ])
            ) as Record<Locale, NavigationItem[] | undefined>
          )
        : undefined,
    };
  });
}

/**
 * Convert LegacyNavLink[] to NavigationItem[] for a specific locale
 */
function legacyToItems(links: LegacyNavLink[], locale: Locale): NavigationItem[] {
  return links.map((link, index) => ({
    id: link.labelKey,
    label: link.labels[locale] || link.labels.en || link.labelKey,
    href: link.href,
    order: index,
    children: link.children ? legacyToItems(link.children, locale) : undefined,
  }));
}

/**
 * Sync navigation link labels to UI translations table.
 * Ensures navigation labels are available in the translations system.
 */
async function syncNavigationTranslations(
  links: LegacyNavLink[],
  namespace: string
): Promise<void> {
  const keys: Array<{
    key: string;
    namespace: string;
    defaultValues: { en: string; fi: string };
  }> = [];

  function extractKeys(items: LegacyNavLink[], prefix: string) {
    for (const link of items) {
      const key = `${prefix}.${link.labelKey}`;
      keys.push({
        key,
        namespace,
        defaultValues: {
          en: link.labels.en || link.labelKey,
          fi: link.labels.fi || link.labels.en || link.labelKey,
        },
      });

      if (link.children && link.children.length > 0) {
        extractKeys(link.children, key);
      }
    }
  }

  extractKeys(links, namespace);

  if (keys.length > 0) {
    await ensureTranslationKeysAction(keys);
  }
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get navigation config by type and language
 */
export async function getNavigationConfig(
  configType: 'header' | 'footer',
  language: Locale
): Promise<NavigationConfig | null> {
  const [result] = await db
    .select()
    .from(navigationConfig)
    .where(
      and(
        eq(navigationConfig.configType, configType),
        eq(navigationConfig.language, language),
        eq(navigationConfig.isActive, true)
      )
    )
    .limit(1);
  
  return result || null;
}

/**
 * Get all navigation configs for a specific type (all languages)
 */
export async function getNavigationConfigsByType(
  configType: 'header' | 'footer'
): Promise<NavigationConfig[]> {
  return db
    .select()
    .from(navigationConfig)
    .where(
      and(
        eq(navigationConfig.configType, configType),
        eq(navigationConfig.isActive, true)
      )
    );
}

/**
 * Get header configuration in legacy format (for backward compatibility)
 */
export async function getHeaderConfigFromDb(): Promise<HeaderConfigData> {
  const configs = await getNavigationConfigsByType('header');
  
  if (configs.length === 0) {
    // Return default if no config exists
    return {
      siteName: { en: 'Sumud', fi: 'Sumud' },
      navigationLinks: [],
      updatedAt: new Date().toISOString(),
    };
  }
  
  // Build siteName from all configs
  const siteName: Record<string, string> = {};
  const itemsByLocale: Record<Locale, NavigationItem[] | undefined> = {} as any;
  let logo: string | undefined;
  let latestUpdate = new Date(0);
  
  for (const config of configs) {
    const locale = config.language as Locale;
    siteName[locale] = config.siteName || 'Sumud';
    itemsByLocale[locale] = config.navigationItems || [];
    
    if (config.logo) logo = config.logo;
    if (config.updatedAt > latestUpdate) {
      latestUpdate = config.updatedAt;
    }
  }
  
  // Fill missing locales with defaults
  for (const locale of SUPPORTED_LOCALES) {
    if (!siteName[locale]) siteName[locale] = 'Sumud';
    if (!itemsByLocale[locale]) itemsByLocale[locale] = [];
  }
  
  return {
    siteName,
    logo,
    navigationLinks: itemsToLegacyFormat(itemsByLocale),
    updatedAt: latestUpdate.toISOString(),
  };
}

/**
 * Get footer configuration in legacy format (for backward compatibility)
 */
export async function getFooterConfigFromDb(): Promise<FooterConfigData> {
  const configs = await getNavigationConfigsByType('footer');
  
  if (configs.length === 0) {
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
  
  // Build all fields from configs
  const description: Record<string, string> = {};
  const copyright: Record<string, string> = {};
  const newsletterTitle: Record<string, string> = {};
  const newsletterSubtitle: Record<string, string> = {};
  
  const quickLinksByLocale: Record<Locale, NavigationItem[] | undefined> = {} as any;
  const getInvolvedLinksByLocale: Record<Locale, NavigationItem[] | undefined> = {} as any;
  const resourceLinksByLocale: Record<Locale, NavigationItem[] | undefined> = {} as any;
  const legalLinksByLocale: Record<Locale, NavigationItem[] | undefined> = {} as any;
  
  let logo: string | undefined;
  let socialLinks: SocialLink[] = [];
  let contact = {
    email: 'info@sumud.fi',
    phone: '+358 XX XXX XXXX',
    location: 'Helsinki, Finland',
  };
  let latestUpdate = new Date(0);
  
  for (const config of configs) {
    const locale = config.language as Locale;
    
    description[locale] = config.description || '';
    copyright[locale] = config.copyright || '';
    newsletterTitle[locale] = config.newsletterTitle || '';
    newsletterSubtitle[locale] = config.newsletterSubtitle || '';
    
    quickLinksByLocale[locale] = config.quickLinks || [];
    getInvolvedLinksByLocale[locale] = config.getInvolvedLinks || [];
    resourceLinksByLocale[locale] = config.resourceLinks || [];
    legalLinksByLocale[locale] = config.legalLinks || [];
    
    if (config.logo) logo = config.logo;
    if (config.socialLinks && config.socialLinks.length > 0) {
      socialLinks = config.socialLinks;
    }
    if (config.contactEmail) {
      contact = {
        email: config.contactEmail,
        phone: config.contactPhone || contact.phone,
        location: config.contactLocation || contact.location,
      };
    }
    if (config.updatedAt > latestUpdate) {
      latestUpdate = config.updatedAt;
    }
  }
  
  // Fill missing locales with defaults
  for (const locale of SUPPORTED_LOCALES) {
    if (!description[locale]) description[locale] = '';
    if (!copyright[locale]) copyright[locale] = '';
    if (!newsletterTitle[locale]) newsletterTitle[locale] = '';
    if (!newsletterSubtitle[locale]) newsletterSubtitle[locale] = '';
  }
  
  return {
    description,
    logo,
    quickLinks: itemsToLegacyFormat(quickLinksByLocale),
    getInvolvedLinks: itemsToLegacyFormat(getInvolvedLinksByLocale),
    resourceLinks: itemsToLegacyFormat(resourceLinksByLocale),
    legalLinks: itemsToLegacyFormat(legalLinksByLocale),
    socialLinks,
    newsletter: {
      title: newsletterTitle,
      subtitle: newsletterSubtitle,
    },
    copyright,
    contact,
    updatedAt: latestUpdate.toISOString(),
  };
}

// ============================================================================
// WRITE QUERIES
// ============================================================================

/**
 * Upsert navigation config for a specific type and language
 */
export async function upsertNavigationConfig(
  configType: 'header' | 'footer',
  language: Locale,
  data: Partial<Omit<NewNavigationConfig, 'id' | 'configType' | 'language' | 'createdAt' | 'updatedAt'>>
): Promise<NavigationConfig> {
  const existing = await getNavigationConfig(configType, language);
  
  if (existing) {
    // Update existing - explicitly set all array fields to ensure proper replacement
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    
    // Ensure array fields are properly set (even if empty) to replace existing values
    if (data.navigationItems !== undefined) updateData.navigationItems = data.navigationItems || [];
    if (data.quickLinks !== undefined) updateData.quickLinks = data.quickLinks || [];
    if (data.getInvolvedLinks !== undefined) updateData.getInvolvedLinks = data.getInvolvedLinks || [];
    if (data.resourceLinks !== undefined) updateData.resourceLinks = data.resourceLinks || [];
    if (data.legalLinks !== undefined) updateData.legalLinks = data.legalLinks || [];
    if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks || [];
    
    const [updated] = await db
      .update(navigationConfig)
      .set(updateData)
      .where(eq(navigationConfig.id, existing.id))
      .returning();
    
    return updated;
  } else {
    // Insert new
    const [inserted] = await db
      .insert(navigationConfig)
      .values({
        configType,
        language,
        ...data,
      })
      .returning();
    
    return inserted;
  }
}

/**
 * Save header configuration from legacy format
 */
export async function saveHeaderConfigToDb(
  config: Omit<HeaderConfigData, 'updatedAt'>
): Promise<void> {
  for (const locale of SUPPORTED_LOCALES) {
    await upsertNavigationConfig('header', locale, {
      siteName: config.siteName[locale] || 'Sumud',
      logo: config.logo,
      navigationItems: legacyToItems(config.navigationLinks, locale),
    });
  }

  // Sync navigation labels to UI translations table
  await syncNavigationTranslations(config.navigationLinks, 'navigation.header');
}

/**
 * Save footer configuration from legacy format
 */
export async function saveFooterConfigToDb(
  config: Omit<FooterConfigData, 'updatedAt'>
): Promise<void> {
  for (const locale of SUPPORTED_LOCALES) {
    await upsertNavigationConfig('footer', locale, {
      description: config.description[locale] || '',
      logo: config.logo,
      quickLinks: legacyToItems(config.quickLinks, locale),
      getInvolvedLinks: legacyToItems(config.getInvolvedLinks, locale),
      resourceLinks: legacyToItems(config.resourceLinks, locale),
      legalLinks: legacyToItems(config.legalLinks, locale),
      socialLinks: config.socialLinks,
      newsletterTitle: config.newsletter.title[locale] || '',
      newsletterSubtitle: config.newsletter.subtitle[locale] || '',
      copyright: config.copyright[locale] || '',
      contactEmail: config.contact.email,
      contactPhone: config.contact.phone,
      contactLocation: config.contact.location,
    });
  }

  // Sync footer link labels to UI translations table
  await syncNavigationTranslations(config.quickLinks, 'navigation.footer.quickLinks');
  await syncNavigationTranslations(config.getInvolvedLinks, 'navigation.footer.getInvolved');
  await syncNavigationTranslations(config.resourceLinks, 'navigation.footer.resources');
  await syncNavigationTranslations(config.legalLinks, 'navigation.footer.legal');
}

/**
 * Delete navigation config
 */
export async function deleteNavigationConfig(
  configType: 'header' | 'footer',
  language: Locale
): Promise<boolean> {
  const result = await db
    .delete(navigationConfig)
    .where(
      and(
        eq(navigationConfig.configType, configType),
        eq(navigationConfig.language, language)
      )
    )
    .returning({ id: navigationConfig.id });
  
  return result.length > 0;
}

/**
 * Soft delete (deactivate) navigation config
 */
export async function deactivateNavigationConfig(
  configType: 'header' | 'footer',
  language: Locale
): Promise<boolean> {
  const result = await db
    .update(navigationConfig)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(
        eq(navigationConfig.configType, configType),
        eq(navigationConfig.language, language)
      )
    )
    .returning({ id: navigationConfig.id });
  
  return result.length > 0;
}
