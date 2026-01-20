/**
 * Content Validation Utilities
 * 
 * Validates content files against schema requirements
 */

import type { Locale } from '@/src/lib/pages/file-storage';

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate page data structure
 */
export function validatePageData(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Type guard
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'data',
      message: 'Data must be a valid object',
      value: data,
    });
    return { valid: false, errors };
  }
  
  const pageData = data as Record<string, unknown>;
  
  // Required fields
  if (!pageData.slug || typeof pageData.slug !== 'string') {
    errors.push({
      field: 'slug',
      message: 'Slug is required and must be a string',
      value: pageData.slug,
    });
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageData.slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      value: pageData.slug,
    });
  }
  
  if (!pageData.title || typeof pageData.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Title is required and must be a string',
      value: pageData.title,
    });
  }
  
  if (!pageData.status || !['draft', 'published', 'archived'].includes(pageData.status as string)) {
    errors.push({
      field: 'status',
      message: 'Status must be one of: draft, published, archived',
      value: pageData.status,
    });
  }
  
  if (!pageData.createdAt || !isValidISO8601(pageData.createdAt as string)) {
    errors.push({
      field: 'createdAt',
      message: 'createdAt must be a valid ISO 8601 timestamp',
      value: pageData.createdAt,
    });
  }
  
  if (!pageData.updatedAt || !isValidISO8601(pageData.updatedAt as string)) {
    errors.push({
      field: 'updatedAt',
      message: 'updatedAt must be a valid ISO 8601 timestamp',
      value: pageData.updatedAt,
    });
  }
  
  if (!Array.isArray(pageData.blocks)) {
    errors.push({
      field: 'blocks',
      message: 'Blocks must be an array',
      value: pageData.blocks,
    });
  } else {
    // Validate blocks
    const blockErrors = validateBlocks(pageData.blocks);
    errors.push(...blockErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate blocks array
 */
function validateBlocks(blocks: unknown[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const blockIds = new Set<string>();
  
  blocks.forEach((block, index) => {
    // Type guard
    if (!block || typeof block !== 'object') {
      errors.push({
        field: `blocks[${index}]`,
        message: 'Block must be an object',
        value: block,
      });
      return;
    }
    
    const blockData = block as Record<string, unknown>;
    
    if (!blockData.id || typeof blockData.id !== 'string') {
      errors.push({
        field: `blocks[${index}].id`,
        message: 'Block ID is required and must be a string',
        value: blockData.id,
      });
    } else {
      // Check for duplicate IDs
      if (blockIds.has(blockData.id)) {
        errors.push({
          field: `blocks[${index}].id`,
          message: `Duplicate block ID: ${blockData.id}`,
          value: blockData.id,
        });
      }
      blockIds.add(blockData.id);
    }
    
    if (!blockData.type || typeof blockData.type !== 'string') {
      errors.push({
        field: `blocks[${index}].type`,
        message: 'Block type is required and must be a string',
        value: blockData.type,
      });
    }
    
    if (blockData.content === undefined) {
      errors.push({
        field: `blocks[${index}].content`,
        message: 'Block content is required',
        value: blockData.content,
      });
    }
  });
  
  return errors;
}

/**
 * Validate navigation config
 */
export function validateNavigationConfig(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Type guard
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'data',
      message: 'Data must be a valid object',
      value: data,
    });
    return { valid: false, errors };
  }
  
  const navData = data as Record<string, unknown>;
  
  if (!navData.id || typeof navData.id !== 'string') {
    errors.push({
      field: 'id',
      message: 'Navigation ID is required and must be a string',
      value: navData.id,
    });
  }
  
  if (!navData.updatedAt || !isValidISO8601(navData.updatedAt as string)) {
    errors.push({
      field: 'updatedAt',
      message: 'updatedAt must be a valid ISO 8601 timestamp',
      value: navData.updatedAt,
    });
  }
  
  // Validate navigation items if present
  if (navData.items !== undefined) {
    if (!Array.isArray(navData.items)) {
      errors.push({
        field: 'items',
        message: 'Items must be an array',
        value: navData.items,
      });
    } else {
      const itemErrors = validateNavItems(navData.items, 'items');
      errors.push(...itemErrors);
    }
  }
  
  // Validate other link arrays
  const linkArrays = ['quickLinks', 'getInvolvedLinks', 'resourceLinks', 'legalLinks'];
  for (const field of linkArrays) {
    if (navData[field] !== undefined) {
      if (!Array.isArray(navData[field])) {
        errors.push({
          field,
          message: `${field} must be an array`,
          value: navData[field],
        });
      } else {
        const itemErrors = validateNavItems(navData[field] as unknown[], field);
        errors.push(...itemErrors);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate navigation items
 */
function validateNavItems(items: unknown[], fieldPrefix: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  items.forEach((item, index) => {
    // Type guard
    if (!item || typeof item !== 'object') {
      errors.push({
        field: `${fieldPrefix}[${index}]`,
        message: 'Navigation item must be an object',
        value: item,
      });
      return;
    }
    
    const itemData = item as Record<string, unknown>;
    
    if (!itemData.label || typeof itemData.label !== 'string') {
      errors.push({
        field: `${fieldPrefix}[${index}].label`,
        message: 'Navigation item label is required and must be a string',
        value: itemData.label,
      });
    }
    
    if (!itemData.href || typeof itemData.href !== 'string') {
      errors.push({
        field: `${fieldPrefix}[${index}].href`,
        message: 'Navigation item href is required and must be a string',
        value: itemData.href,
      });
    } else if (!isValidUrl(itemData.href)) {
      errors.push({
        field: `${fieldPrefix}[${index}].href`,
        message: 'Navigation item href must be a valid URL or path',
        value: itemData.href,
      });
    }
    
    // Recursively validate children
    if (itemData.children !== undefined) {
      if (!Array.isArray(itemData.children)) {
        errors.push({
          field: `${fieldPrefix}[${index}].children`,
          message: 'Navigation item children must be an array',
          value: itemData.children,
        });
      } else {
        const childErrors = validateNavItems(itemData.children, `${fieldPrefix}[${index}].children`);
        errors.push(...childErrors);
      }
    }
  });
  
  return errors;
}

/**
 * Validate ISO 8601 timestamp
 */
function isValidISO8601(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return date.toISOString() === timestamp;
  } catch {
    return false;
  }
}

/**
 * Validate URL (absolute or relative)
 */
function isValidUrl(url: string): boolean {
  // Allow relative URLs
  if (url.startsWith('/') || url.startsWith('#')) {
    return true;
  }
  
  // Validate absolute URLs
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate locale code
 */
export function validateLocale(locale: string): locale is Locale {
  return ['en', 'fi'].includes(locale);
}

/**
 * Check for embedded locale keys (legacy format detection)
 */
export function detectEmbeddedLocales(content: unknown): string[] {
  const locales = ['en', 'fi'];
  const found: string[] = [];
  
  function traverse(obj: unknown, path: string = ''): void {
    if (!obj || typeof obj !== 'object') return;
    
    const objData = obj as Record<string, unknown>;
    const keys = Object.keys(objData);
    
    // Check if this object has all locale keys
    if (keys.length > 0 && keys.every(key => locales.includes(key))) {
      found.push(path || 'root');
      return; // Don't traverse deeper
    }
    
    // Recursively check nested objects
    for (const key of keys) {
      const value = objData[key];
      if (value && typeof value === 'object') {
        traverse(value, path ? `${path}.${key}` : key);
      }
    }
  }
  
  traverse(content);
  return found;
}

/**
 * Validate that content is fully localized (no embedded translations)
 */
export function validateFullyLocalized(content: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const embeddedLocales = detectEmbeddedLocales(content);
  
  if (embeddedLocales.length > 0) {
    embeddedLocales.forEach(path => {
      errors.push({
        field: path,
        message: 'Content contains embedded locale keys. Should be fully localized.',
        value: path,
      });
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }
  
  return errors
    .map(error => `- ${error.field}: ${error.message}`)
    .join('\n');
}

/**
 * Validate complete page file
 */
export async function validatePageFile(
  locale: Locale,
  data: unknown,
  options: { checkLocalization?: boolean } = {}
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  
  // Basic structure validation
  const structureResult = validatePageData(data);
  errors.push(...structureResult.errors);
  
  // Optional: Check for embedded locales
  if (options.checkLocalization) {
    const localizationResult = validateFullyLocalized(data);
    errors.push(...localizationResult.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete navigation file
 */
export async function validateNavigationFile(
  locale: Locale,
  data: unknown,
  options: { checkLocalization?: boolean } = {}
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  
  // Basic structure validation
  const structureResult = validateNavigationConfig(data);
  errors.push(...structureResult.errors);
  
  // Optional: Check for embedded locales
  if (options.checkLocalization) {
    const localizationResult = validateFullyLocalized(data);
    errors.push(...localizationResult.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
