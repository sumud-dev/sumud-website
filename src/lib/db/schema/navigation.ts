import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  jsonb, 
  integer,
  boolean,
  index, 
  unique 
} from 'drizzle-orm/pg-core';

// ============================================
// NAVIGATION CONFIGURATION TABLE
// ============================================

/**
 * Navigation configuration table
 * Stores header and footer navigation configurations
 * Each config type has one row per language
 */
export const navigationConfig = pgTable('navigation_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Config type: 'header' | 'footer'
  configType: text('config_type').notNull(),
  
  // Language for this configuration
  language: text('language').notNull().default('fi'),
  
  // Site name (for header)
  siteName: text('site_name'),
  
  // Logo URL
  logo: text('logo'),
  
  // Navigation items (main navigation links for header)
  navigationItems: jsonb('navigation_items').$type<NavigationItem[]>(),
  
  // Footer-specific link groups
  quickLinks: jsonb('quick_links').$type<NavigationItem[]>(),
  getInvolvedLinks: jsonb('get_involved_links').$type<NavigationItem[]>(),
  resourceLinks: jsonb('resource_links').$type<NavigationItem[]>(),
  legalLinks: jsonb('legal_links').$type<NavigationItem[]>(),
  
  // Social links (footer)
  socialLinks: jsonb('social_links').$type<SocialLink[]>(),
  
  // Newsletter configuration (footer)
  newsletterTitle: text('newsletter_title'),
  newsletterSubtitle: text('newsletter_subtitle'),
  
  // Copyright text (footer)
  copyright: text('copyright'),
  
  // Description (footer)
  description: text('description'),
  
  // Contact information (footer)
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  contactLocation: text('contact_location'),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Audit timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  // Unique constraint on config type + language
  configTypeLanguageUnique: unique('navigation_config_type_language_unique').on(t.configType, t.language),
  // Indexes
  configTypeIdx: index('navigation_config_type_idx').on(t.configType),
  languageIdx: index('navigation_config_language_idx').on(t.language),
  activeIdx: index('navigation_config_active_idx').on(t.isActive),
}));

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Navigation item structure
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  children?: NavigationItem[];
}

/**
 * Social link structure
 */
export interface SocialLink {
  platform: string;
  url: string;
  order?: number;
}

// ============================================
// TYPE EXPORTS
// ============================================

export type NavigationConfig = typeof navigationConfig.$inferSelect;
export type NewNavigationConfig = typeof navigationConfig.$inferInsert;

// ============================================
// HELPER TYPES FOR QUERIES
// ============================================

/**
 * Header configuration (combined from all languages)
 */
export interface HeaderConfigData {
  siteName: Record<string, string>;
  logo?: string;
  navigationLinks: LegacyNavLink[];
  updatedAt: string;
}

/**
 * Footer configuration (combined from all languages)
 */
export interface FooterConfigData {
  description: Record<string, string>;
  logo?: string;
  quickLinks: LegacyNavLink[];
  getInvolvedLinks: LegacyNavLink[];
  resourceLinks: LegacyNavLink[];
  legalLinks: LegacyNavLink[];
  socialLinks: SocialLink[];
  newsletter: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
  };
  copyright: Record<string, string>;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  updatedAt: string;
}

/**
 * Legacy nav link format (for backward compatibility with existing components)
 */
export interface LegacyNavLink {
  labelKey: string;
  labels: Record<string, string>;
  href: string;
  children?: LegacyNavLink[];
}
