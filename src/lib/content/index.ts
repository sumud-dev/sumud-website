/**
 * Content Module
 * 
 * Centralized exports for content management utilities
 */

// Helpers
export {
  getLocalizedContent,
  hasEmbeddedLocales,
  extractLocalizedValue,
  normalizeBlockContent,
  isValidLocale,
  getLocaleDisplayName,
  getLocaleFlagEmoji,
  isRTL,
  formatTimestamp,
  generateSlug,
  isValidSlug,
  createTimestamp,
  isNewerThan,
  getRelativeTime,
  deepClone,
  deepMerge,
} from './helpers';

// Validators
export {
  validatePageData,
  validateNavigationConfig,
  validateLocale,
  detectEmbeddedLocales,
  validateFullyLocalized,
  formatValidationErrors,
  validatePageFile,
  validateNavigationFile,
} from './validator';

// Types
export type { ValidationError, ValidationResult } from './validator';
