"use server";

import { revalidatePath } from "next/cache";
import {
  getTranslationsByLanguage,
  getTranslationsByNamespace,
  getTranslationByKey,
  upsertTranslation,
  bulkUpsertTranslations,
  deleteTranslation,
  getAvailableLanguages,
  getTranslationStats,
  buildTranslationObject,
} from "@/src/lib/db/queries/translations";
import { validateTranslationNamespace } from "@/src/lib/translations/namespace-validation";
import type { UITranslation } from "@/src/lib/db/schema/translations";

/**
 * Get all translations for a language
 */
export async function getTranslationsAction(language: string) {
  try {
    const translations = await getTranslationsByLanguage(language);
    return {
      success: true,
      data: translations,
    };
  } catch (error) {
    console.error("Error fetching translations:", error);
    return {
      success: false,
      error: "Failed to fetch translations",
    };
  }
}

/**
 * Get translations by namespace
 */
export async function getTranslationsByNamespaceAction(
  namespace: string,
  language: string
) {
  try {
    const translations = await getTranslationsByNamespace(namespace, language);
    return {
      success: true,
      data: translations,
    };
  } catch (error) {
    console.error("Error fetching translations by namespace:", error);
    return {
      success: false,
      error: "Failed to fetch translations",
    };
  }
}

/**
 * Get translations structured as nested object
 */
export async function getTranslationsObjectAction(language: string) {
  try {
    const translations = await getTranslationsByLanguage(language);
    const structured = buildTranslationObject(translations);
    return {
      success: true,
      data: structured,
    };
  } catch (error) {
    console.error("Error fetching translations object:", error);
    return {
      success: false,
      error: "Failed to fetch translations",
    };
  }
}

/**
 * Get a single translation
 */
export async function getTranslationAction(key: string, language: string) {
  try {
    const translation = await getTranslationByKey(key, language);
    return {
      success: true,
      data: translation,
    };
  } catch (error) {
    console.error("Error fetching translation:", error);
    return {
      success: false,
      error: "Failed to fetch translation",
    };
  }
}

/**
 * Create or update a translation
 */
export async function upsertTranslationAction(data: {
  key: string;
  language: string;
  value: string;
  namespace: string;
  metadata?: any;
  updatedBy?: string;
}) {
  try {
    // Validate namespace
    const validation = validateTranslationNamespace(data.namespace);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.message,
        suggestion: validation.suggestion,
      };
    }
    
    // Show warning for new namespaces
    if (validation.message) {
      console.warn(validation.message);
    }
    
    const translation = await upsertTranslation(data);
    
    // Revalidate relevant paths
    revalidatePath(`/[locale]`, 'layout');
    
    return {
      success: true,
      data: translation,
      warning: validation.message,
    };
  } catch (error) {
    console.error("Error upserting translation:", error);
    return {
      success: false,
      error: "Failed to save translation",
    };
  }
}

/**
 * Bulk create or update translations
 */
export async function bulkUpsertTranslationsAction(
  translations: Array<{
    key: string;
    language: string;
    value: string;
    namespace: string;
    metadata?: any;
  }>,
  updatedBy?: string
) {
  try {
    await bulkUpsertTranslations(translations, updatedBy);
    
    // Revalidate all pages
    revalidatePath(`/[locale]`, 'layout');
    
    return {
      success: true,
      message: `Successfully updated ${translations.length} translations`,
    };
  } catch (error) {
    console.error("Error bulk upserting translations:", error);
    return {
      success: false,
      error: "Failed to save translations",
    };
  }
}

/**
 * Delete a translation
 */
export async function deleteTranslationAction(id: string) {
  try {
    await deleteTranslation(id);
    
    // Revalidate relevant paths
    revalidatePath(`/[locale]`, 'layout');
    
    return {
      success: true,
      message: "Translation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting translation:", error);
    return {
      success: false,
      error: "Failed to delete translation",
    };
  }
}

/**
 * Get available languages
 */
export async function getAvailableLanguagesAction() {
  try {
    const languages = await getAvailableLanguages();
    return {
      success: true,
      data: languages,
    };
  } catch (error) {
    console.error("Error fetching available languages:", error);
    return {
      success: false,
      error: "Failed to fetch languages",
    };
  }
}

/**
 * Get translation statistics
 */
export async function getTranslationStatsAction(language: string) {
  try {
    const stats = await getTranslationStats(language);
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching translation stats:", error);
    return {
      success: false,
      error: "Failed to fetch translation stats",
    };
  }
}

/**
 * Compare translations between languages to find missing keys
 */
export async function compareTranslationsAction(
  sourceLanguage: string,
  targetLanguage: string
) {
  try {
    const sourceTranslations = await getTranslationsByLanguage(sourceLanguage);
    const targetTranslations = await getTranslationsByLanguage(targetLanguage);
    
    const sourceKeys = new Set(sourceTranslations.map(t => t.key));
    const targetKeys = new Set(targetTranslations.map(t => t.key));
    
    const missingInTarget = [...sourceKeys].filter(key => !targetKeys.has(key));
    const extraInTarget = [...targetKeys].filter(key => !sourceKeys.has(key));
    
    return {
      success: true,
      data: {
        missingInTarget,
        extraInTarget,
        sourceCount: sourceTranslations.length,
        targetCount: targetTranslations.length,
        coverage: Math.round((targetTranslations.length / sourceTranslations.length) * 100),
      },
    };
  } catch (error) {
    console.error("Error comparing translations:", error);
    return {
      success: false,
      error: "Failed to compare translations",
    };
  }
}

/**
 * Ensure translation keys exist in the UI translations table.
 * Creates missing keys with default values for all supported languages.
 * Used when adding new blocks, navigation items, or buttons.
 */
export async function ensureTranslationKeysAction(
  keys: Array<{
    key: string;
    namespace: string;
    defaultValues: { en: string; fi: string };
  }>
) {
  try {
    const translations: Array<{
      key: string;
      language: string;
      value: string;
      namespace: string;
    }> = [];

    for (const { key, namespace, defaultValues } of keys) {
      // Check if keys already exist
      const existingEn = await getTranslationByKey(key, 'en');
      const existingFi = await getTranslationByKey(key, 'fi');

      // Only add if not existing
      if (!existingEn) {
        translations.push({
          key,
          language: 'en',
          value: defaultValues.en,
          namespace,
        });
      }
      if (!existingFi) {
        translations.push({
          key,
          language: 'fi',
          value: defaultValues.fi,
          namespace,
        });
      }
    }

    if (translations.length > 0) {
      await bulkUpsertTranslations(translations);
    }

    return {
      success: true,
      message: `Ensured ${keys.length} translation keys exist`,
      created: translations.length,
    };
  } catch (error) {
    console.error("Error ensuring translation keys:", error);
    return {
      success: false,
      error: "Failed to ensure translation keys",
    };
  }
}
