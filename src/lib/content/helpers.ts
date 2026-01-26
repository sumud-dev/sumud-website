/**
 * Content Helper Utilities
 * 
 * Utility functions for working with localized content
 */
type Locale = 'en' | 'fi';

/**
 * Get the appropriate locale content with fallback
 */
export function getLocalizedContent<T>(
  content: Record<string, T> | T,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): T | null {
  // If content is not an object with locale keys, return it directly
  if (!content || typeof content !== 'object') {
    return content as T;
  }

  // Check if it's a locale-keyed object
  const localeContent = content as Record<string, T>;
  
  // Try requested locale
  if (locale in localeContent) {
    return localeContent[locale];
  }
  
  // Try fallback locale
  if (fallbackLocale in localeContent) {
    return localeContent[fallbackLocale];
  }
  
  // Return first available locale
  const firstKey = Object.keys(localeContent)[0];
  if (firstKey) {
    return localeContent[firstKey];
  }
  
  return null;
}

/**
 * Check if content has embedded locale keys (legacy format)
 */
export function hasEmbeddedLocales(content: unknown): boolean {
  if (!content || typeof content !== 'object') {
    return false;
  }
  
  const keys = Object.keys(content);
  const locales = ['en', 'fi'];
  
  // Check if all keys are locale codes
  return keys.length > 0 && keys.every(key => locales.includes(key));
}

/**
 * Extract localized value from potentially nested content
 */
export function extractLocalizedValue(
  value: unknown,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): unknown {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }
  
  // Handle primitive types
  if (typeof value !== 'object') {
    return value;
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => extractLocalizedValue(item, locale, fallbackLocale));
  }
  
  // Handle objects with embedded locales
  if (hasEmbeddedLocales(value)) {
    return getLocalizedContent(value, locale, fallbackLocale);
  }
  
  // Handle regular objects - recursively process properties
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = extractLocalizedValue(val, locale, fallbackLocale);
  }
  
  return result;
}

/**
 * Normalize block content to fully localized format
 * 
 * Converts blocks with embedded translations to locale-specific format
 */
export function normalizeBlockContent(
  blocks: Array<Record<string, unknown>>,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): Array<Record<string, unknown>> {
  return blocks.map(block => ({
    ...block,
    content: extractLocalizedValue(block.content, locale, fallbackLocale),
  }));
}

/**
 * Validate locale code
 */
export function isValidLocale(locale: string): locale is Locale {
  return ['en', 'fi'].includes(locale);
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: 'English',
    fi: 'Suomi',
  };
  return names[locale] || locale;
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlagEmoji(locale: Locale): string {
  const flags: Record<Locale, string> = {
    en: '🇬🇧',
    fi: '🇫🇮',
  };
  return flags[locale] || '🌐';
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(
  timestamp: string,
  locale: Locale
): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale === 'fi' ? 'fi-FI' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return timestamp;
  }
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Create a new ISO timestamp
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Compare timestamps
 */
export function isNewerThan(timestamp1: string, timestamp2: string): boolean {
  try {
    return new Date(timestamp1) > new Date(timestamp2);
  } catch {
    return false;
  }
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: string, locale: Locale): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return locale === 'fi' ? 'Tänään' : 'Today';
    } else if (diffDays === 1) {
      return locale === 'fi' ? 'Eilen' : 'Yesterday';
    } else if (diffDays < 7) {
      return locale === 'fi' 
        ? `${diffDays} päivää sitten`
        : `${diffDays} days ago`;
    } else {
      return formatTimestamp(timestamp, locale);
    }
  } catch {
    return timestamp;
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const result = deepClone(target);
  
  for (const source of sources) {
    for (const key in source) {
      const targetValue = result[key];
      const sourceValue = source[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
          result[key] = deepMerge(targetValue, sourceValue);
        } else {
          result[key] = deepClone(sourceValue) as T[Extract<keyof T, string>];
        }
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}
