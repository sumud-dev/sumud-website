import { eq, and } from 'drizzle-orm';
import { db } from '@/src/lib/db';
import { uiTranslations, type UITranslation, type TranslationData } from '@/src/lib/db/schema/translations';

/**
 * Get all translations for a specific language
 */
export async function getTranslationsByLanguage(language: string): Promise<UITranslation[]> {
  try {
    return await db
      .select()
      .from(uiTranslations)
      .where(
        and(
          eq(uiTranslations.language, language),
          eq(uiTranslations.isActive, true)
        )
      );
  } catch (error) {
    console.error(`Error fetching translations for language ${language}:`, error);
    return [];
  }
}

/**
 * Get translations for a specific namespace and language
 */
export async function getTranslationsByNamespace(
  namespace: string,
  language: string
): Promise<UITranslation[]> {
  try {
    return await db
      .select()
      .from(uiTranslations)
      .where(
        and(
          eq(uiTranslations.namespace, namespace),
          eq(uiTranslations.language, language),
          eq(uiTranslations.isActive, true)
        )
      );
  } catch (error) {
    console.error(`Error fetching translations for namespace ${namespace}, language ${language}:`, error);
    return [];
  }
}

/**
 * Get a single translation by key and language
 */
export async function getTranslationByKey(
  key: string,
  language: string
): Promise<UITranslation | null> {
  try {
    const results = await db
      .select()
      .from(uiTranslations)
      .where(
        and(
          eq(uiTranslations.key, key),
          eq(uiTranslations.language, language),
          eq(uiTranslations.isActive, true)
        )
      )
      .limit(1);
    
    return results[0] || null;
  } catch (error) {
    console.error(`Error fetching translation for key ${key}, language ${language}:`, error);
    return null;
  }
}

/**
 * Convert flat translations array to nested object structure
 * e.g., namespace='admin.campaigns.form', key='title' -> { admin: { campaigns: { form: { title: 'Title' } } } }
 * 
 * Handles collisions by preferring deeper namespaces (objects over strings)
 */
export function buildTranslationObject(translations: UITranslation[]): TranslationData {
  const result: TranslationData = {};
  
  // Sort translations so that deeper namespaces come first
  // This ensures objects are created before potentially conflicting string values
  const sortedTranslations = [...translations].sort((a, b) => {
    const aPath = a.namespace ? `${a.namespace}.${a.key}` : a.key;
    const bPath = b.namespace ? `${b.namespace}.${b.key}` : b.key;
    // More dots = deeper nesting, process first
    const aDots = (aPath.match(/\./g) || []).length;
    const bDots = (bPath.match(/\./g) || []).length;
    return bDots - aDots;
  });
  
  for (const translation of sortedTranslations) {
    // Combine namespace and key to form the full path
    const fullPath = translation.namespace ? `${translation.namespace}.${translation.key}` : translation.key;
    const keys = fullPath.split('.');
    let current: any = result;
    let canSet = true;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      } else if (typeof current[key] !== 'object') {
        // Collision: trying to nest into a string value
        // Skip this translation as deeper namespace takes precedence
        canSet = false;
        break;
      }
      current = current[key];
    }
    
    if (canSet) {
      const lastKey = keys[keys.length - 1];
      // Only set if the key doesn't exist or is not an object (don't overwrite nested namespaces)
      if (current[lastKey] === undefined || typeof current[lastKey] !== 'object') {
        current[lastKey] = translation.value;
      }
    }
  }
  
  return result;
}

/**
 * Get all translations for a language as a nested object
 */
export async function getTranslationsObject(language: string): Promise<TranslationData> {
  const translations = await getTranslationsByLanguage(language);
  return buildTranslationObject(translations);
}

/**
 * Create or update a translation
 */
export async function upsertTranslation(data: {
  key: string;
  language: string;
  value: string;
  namespace: string;
  metadata?: any;
  updatedBy?: string;
}): Promise<UITranslation> {
  try {
    // Check if translation exists - must include namespace in the check
    // because unique constraint is on (namespace, key, language)
    const existing = await db
      .select()
      .from(uiTranslations)
      .where(
        and(
          eq(uiTranslations.namespace, data.namespace),
          eq(uiTranslations.key, data.key),
          eq(uiTranslations.language, data.language)
        )
      )
      .limit(1);
    
    if (existing[0]) {
      // Update existing translation
      const updated = await db
        .update(uiTranslations)
        .set({
          value: data.value,
          namespace: data.namespace,
          metadata: data.metadata,
          updatedBy: data.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(uiTranslations.id, existing[0].id))
        .returning();
      
      return updated[0];
    } else {
      // Create new translation
      const created = await db
        .insert(uiTranslations)
        .values({
          key: data.key,
          language: data.language,
          value: data.value,
          namespace: data.namespace,
          metadata: data.metadata,
          createdBy: data.updatedBy,
        })
        .returning();
      
      return created[0];
    }
  } catch (error) {
    console.error('Error upserting translation:', error);
    throw error;
  }
}

/**
 * Bulk create or update translations
 */
export async function bulkUpsertTranslations(
  translations: Array<{
    key: string;
    language: string;
    value: string;
    namespace: string;
    metadata?: any;
  }>,
  updatedBy?: string
): Promise<void> {
  try {
    for (const translation of translations) {
      await upsertTranslation({ ...translation, updatedBy });
    }
  } catch (error) {
    console.error('Error bulk upserting translations:', error);
    throw error;
  }
}

/**
 * Delete a translation
 */
export async function deleteTranslation(id: string): Promise<void> {
  try {
    await db
      .delete(uiTranslations)
      .where(eq(uiTranslations.id, id));
  } catch (error) {
    console.error('Error deleting translation:', error);
    throw error;
  }
}

/**
 * Get all available languages
 */
export async function getAvailableLanguages(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({ language: uiTranslations.language })
      .from(uiTranslations)
      .where(eq(uiTranslations.isActive, true));
    
    return results.map(r => r.language);
  } catch (error) {
    console.error('Error fetching available languages:', error);
    return [];
  }
}

/**
 * Get translation coverage statistics for a language
 */
export async function getTranslationStats(language: string): Promise<{
  total: number;
  needsReview: number;
  byNamespace: Record<string, number>;
}> {
  try {
    const translations = await db
      .select()
      .from(uiTranslations)
      .where(
        and(
          eq(uiTranslations.language, language),
          eq(uiTranslations.isActive, true)
        )
      );
    
    const byNamespace: Record<string, number> = {};
    let needsReview = 0;
    
    for (const translation of translations) {
      byNamespace[translation.namespace] = (byNamespace[translation.namespace] || 0) + 1;
      if (translation.needsReview) {
        needsReview++;
      }
    }
    
    return {
      total: translations.length,
      needsReview,
      byNamespace,
    };
  } catch (error) {
    console.error('Error fetching translation stats:', error);
    return { total: 0, needsReview: 0, byNamespace: {} };
  }
}
