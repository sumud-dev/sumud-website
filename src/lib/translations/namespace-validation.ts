/**
 * Translation Namespace Guidelines
 * 
 * This file defines which namespaces should be used in ui_translations table
 * vs dedicated content translation tables.
 * 
 * ⚠️ IMPORTANT: Keep this list in sync with actual database namespaces
 */

/**
 * UI Translation Namespaces
 * These are for interface elements, labels, buttons, messages
 * Store in: ui_translations table
 * 
 * Note the difference:
 * - "campaignsPage" (UI) ✅ vs "campaigns" (content) ❌
 * - "eventsDetail" (UI) ✅ vs "events" (content) ❌
 * - "homepage" (UI) ✅ vs "pages" (content) ❌
 */
export const UI_TRANSLATION_NAMESPACES = [
  'common',           // Common UI elements (buttons, labels, etc.)
  'admin',            // Admin interface
  'adminSettings',    // Admin settings pages
  'errors',           // Error messages
  'navigation',       // Navigation menu labels (NOT navigation content/config)
  'footer',           // Footer UI elements
  'homepage',         // Homepage UI sections (NOT page content)
  'about',            // About page UI (NOT page content)
  'articlesPage',     // Articles listing page UI (NOT article content)
  'campaignsPage',    // Campaigns listing page UI (NOT campaign content)
  'eventsDetail',     // Events detail page UI (NOT event content)
  'membership',       // Membership page UI
  'petitions',        // Petitions page UI
  'impact',           // Impact page UI
  'auth',             // Authentication UI
  'articles',         // Articles general UI (NOT article content)
] as const;

/**
 * INVALID namespaces - These should NEVER be in ui_translations
 * They indicate content that belongs in dedicated translation tables
 */
export const INVALID_UI_NAMESPACES = [
  'pages',            // ❌ Use page_builder_translations
  'page',             // ❌ Use page_builder_translations
  'events',           // ❌ Use event_translations
  'event',            // ❌ Use event_translations
  'campaigns',        // ❌ Use campaign_translations
  'campaign',         // ❌ Use campaign_translations
  'posts',            // ❌ Use post_translations
  'post',             // ❌ Use post_translations
] as const;

/**
 * Content Translation Tables
 * These have dedicated translation tables and should NOT be in ui_translations
 */
export const CONTENT_TRANSLATION_INFO = {
  pages: {
    table: 'page_builder_translations',
    managedAt: '/admin/page-builder',
    description: 'Custom pages and their content',
  },
  events: {
    table: 'event_translations',
    managedAt: '/admin/events',
    description: 'Event titles, descriptions, and details',
  },
  campaigns: {
    table: 'campaign_translations',
    managedAt: '/admin/campaigns',
    description: 'Campaign content and descriptions',
  },
  posts: {
    table: 'post_translations',
    managedAt: '/admin/articles',
    description: 'Article/post content',
  },
  navigationConfig: {
    table: 'navigation_config',
    managedAt: '/admin/content',
    description: 'Header and footer navigation configuration',
  },
} as const;

/**
 * Check if a namespace is valid for UI translations
 */
export function isValidUINamespace(namespace: string): boolean {
  return UI_TRANSLATION_NAMESPACES.includes(namespace as any);
}

/**
 * Check if a namespace is explicitly invalid (content namespace)
 */
export function isInvalidUINamespace(namespace: string): boolean {
  return INVALID_UI_NAMESPACES.includes(namespace as any);
}

/**
 * Check if a namespace should be in a content table instead
 */
export function getContentTableInfo(namespace: string): typeof CONTENT_TRANSLATION_INFO[keyof typeof CONTENT_TRANSLATION_INFO] | null {
  // Check if namespace matches any content type
  const normalizedNamespace = namespace.toLowerCase();
  
  for (const [key, info] of Object.entries(CONTENT_TRANSLATION_INFO)) {
    if (normalizedNamespace.includes(key.toLowerCase())) {
      return info;
    }
  }
  
  return null;
}

/**
 * Validate a translation namespace for ui_translations table
 */
export function validateTranslationNamespace(namespace: string): {
  valid: boolean;
  message?: string;
  suggestion?: string;
} {
  // Check if explicitly invalid
  if (isInvalidUINamespace(namespace)) {
    const contentInfo = getContentTableInfo(namespace);
    return {
      valid: false,
      message: `"${namespace}" should be managed in ${contentInfo?.table || 'a content translation table'}, not ui_translations`,
      suggestion: contentInfo ? `Please use ${contentInfo.managedAt} to manage ${contentInfo.description}` : `Please use the appropriate admin interface to manage this content`,
    };
  }
  
  // Check if it's a valid UI namespace
  if (isValidUINamespace(namespace)) {
    return { valid: true };
  }
  
  // Check if it should be in a content table
  const contentInfo = getContentTableInfo(namespace);
  if (contentInfo) {
    return {
      valid: false,
      message: `"${namespace}" should be managed in ${contentInfo.table}, not ui_translations`,
      suggestion: `Please use ${contentInfo.managedAt} to manage ${contentInfo.description}`,
    };
  }
  
  // It's a new namespace - allow but warn
  return {
    valid: true,
    message: `New namespace "${namespace}" will be created. Make sure this is for UI elements, not content.`,
  };
}
