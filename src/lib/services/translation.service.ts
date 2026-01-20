/**
 * Translation Service using DeepL API
 * 
 * A reusable translation service for translating content between
 * supported locales (en, fi) using DeepL.
 */

import * as deepl from "deepl-node";

// Supported locales in the application
export type SupportedLocale = "en" | "fi";

// Map our locale codes to DeepL target language codes
const DEEPL_TARGET_MAP: Record<SupportedLocale, deepl.TargetLanguageCode> = {
  en: "en-US",
  fi: "fi",
};

// Map our locale codes to DeepL source language codes
const DEEPL_SOURCE_MAP: Record<SupportedLocale, deepl.SourceLanguageCode> = {
  en: "en",
  fi: "fi",
};

// Languages that support formality option in DeepL
// Finnish (fi) does NOT support formality
const FORMALITY_SUPPORTED_LOCALES: SupportedLocale[] = [];

// All supported locales
export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "fi"];

/**
 * Get DeepL client instance
 */
function getDeepLClient(): deepl.DeepLClient {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPL_API_KEY environment variable is not set");
  }

  return new deepl.DeepLClient(apiKey);
}

/**
 * Get all target locales except the source locale
 */
export function getTargetLocales(sourceLocale: SupportedLocale): SupportedLocale[] {
  return SUPPORTED_LOCALES.filter((locale) => locale !== sourceLocale);
}

/**
 * Translate a single text from source locale to target locale
 */
export async function translateText(
  text: string,
  sourceLocale: SupportedLocale,
  targetLocale: SupportedLocale
): Promise<{ text: string; error: string | null }> {
  if (!text || text.trim() === "") {
    return { text: "", error: null };
  }

  if (sourceLocale === targetLocale) {
    return { text, error: null };
  }

  try {
    const client = getDeepLClient();
    const sourceLang = DEEPL_SOURCE_MAP[sourceLocale];
    const targetLang = DEEPL_TARGET_MAP[targetLocale];

    // Build translation options
    const options: deepl.TranslateTextOptions = {
      preserveFormatting: true,
    };

    // Add formality only for supported languages (not Finnish)
    if (FORMALITY_SUPPORTED_LOCALES.includes(targetLocale)) {
      options.formality = "prefer_more";
    }

    const result = await client.translateText(text, sourceLang, targetLang, options);
    return { text: result.text, error: null };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

/**
 * Translate multiple texts in a batch (more efficient for multiple strings)
 */
export async function translateBatch(
  texts: string[],
  sourceLocale: SupportedLocale,
  targetLocale: SupportedLocale
): Promise<{ texts: string[]; error: string | null }> {
  if (texts.length === 0) {
    return { texts: [], error: null };
  }

  if (sourceLocale === targetLocale) {
    return { texts, error: null };
  }

  // Filter out empty texts, keeping track of positions
  const nonEmptyIndices: number[] = [];
  const nonEmptyTexts: string[] = [];

  texts.forEach((text, index) => {
    if (text && text.trim() !== "") {
      nonEmptyIndices.push(index);
      nonEmptyTexts.push(text);
    }
  });

  if (nonEmptyTexts.length === 0) {
    return { texts: texts.map(() => ""), error: null };
  }

  try {
    const client = getDeepLClient();
    const sourceLang = DEEPL_SOURCE_MAP[sourceLocale];
    const targetLang = DEEPL_TARGET_MAP[targetLocale];

    const options: deepl.TranslateTextOptions = {
      preserveFormatting: true,
    };

    if (FORMALITY_SUPPORTED_LOCALES.includes(targetLocale)) {
      options.formality = "prefer_more";
    }

    const results = await client.translateText(nonEmptyTexts, sourceLang, targetLang, options);

    // Map results back to original positions
    const translatedTexts = texts.map(() => "");
    const resultsArray = Array.isArray(results) ? results : [results];

    nonEmptyIndices.forEach((originalIndex, resultIndex) => {
      translatedTexts[originalIndex] = resultsArray[resultIndex]?.text || "";
    });

    return { texts: translatedTexts, error: null };
  } catch (error) {
    console.error("Batch translation error:", error);
    return {
      texts: texts.map(() => ""),
      error: error instanceof Error ? error.message : "Batch translation failed",
    };
  }
}

/**
 * Translate text to all other supported locales
 */
export async function translateToAllLocales(
  text: string,
  sourceLocale: SupportedLocale
): Promise<{ translations: Record<SupportedLocale, string>; error: string | null }> {
  const translations: Record<SupportedLocale, string> = {
    en: sourceLocale === "en" ? text : "",
    fi: sourceLocale === "fi" ? text : "",
  };

  const targetLocales = getTargetLocales(sourceLocale);
  const errors: string[] = [];

  await Promise.all(
    targetLocales.map(async (targetLocale) => {
      const { text: translatedText, error } = await translateText(
        text,
        sourceLocale,
        targetLocale
      );
      if (error) {
        errors.push(`${targetLocale}: ${error}`);
      } else {
        translations[targetLocale] = translatedText;
      }
    })
  );

  return {
    translations,
    error: errors.length > 0 ? errors.join("; ") : null,
  };
}

// ============================================
// GENERIC CONTENT TRANSLATION
// ============================================

/**
 * Generic interface for translatable content
 * Use this for any content type (campaigns, events, articles, etc.)
 */
export interface TranslatableContent {
  title: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Configuration for which fields to translate
 */
export interface TranslationConfig {
  /** Fields that contain simple text strings */
  textFields: string[];
  /** Fields that contain arrays of objects with translatable string properties */
  arrayFields?: {
    field: string;
    textProperties: string[];
  }[];
  /** Fields that contain nested objects with translatable string properties */
  objectFields?: {
    field: string;
    textProperties: string[];
  }[];
}

/**
 * Default configuration for campaign translations
 */
export const CAMPAIGN_TRANSLATION_CONFIG: TranslationConfig = {
  textFields: ["title", "description", "seoTitle", "seoDescription"],
  arrayFields: [
    { field: "demands", textProperties: ["title", "description"] },
    { field: "howToParticipate", textProperties: ["title", "description"] },
    { field: "targets", textProperties: ["name", "description"] },
    { field: "resources", textProperties: ["title", "description"] },
    { field: "successStories", textProperties: ["title", "content"] },
  ],
  objectFields: [
    { field: "callToAction", textProperties: ["primary.text", "secondary.text"] },
  ],
};

/**
 * Default configuration for event translations
 */
export const EVENT_TRANSLATION_CONFIG: TranslationConfig = {
  textFields: ["title", "description", "content", "location", "seoTitle", "seoDescription"],
  arrayFields: [],
  objectFields: [],
};

/**
 * Default configuration for article translations
 */
export const ARTICLE_TRANSLATION_CONFIG: TranslationConfig = {
  textFields: ["title", "content", "excerpt", "metaDescription"],
  arrayFields: [],
  objectFields: [],
};

/**
 * Extract a nested property value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Set a nested property value on an object using dot notation
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Translate content according to the provided configuration
 */
export async function translateContent<T extends Record<string, unknown>>(
  content: T,
  sourceLocale: SupportedLocale,
  targetLocale: SupportedLocale,
  config: TranslationConfig
): Promise<{ content: T; error: string | null }> {
  if (sourceLocale === targetLocale) {
    return { content, error: null };
  }

  const translatedContent = JSON.parse(JSON.stringify(content)) as T;
  const textsToTranslate: string[] = [];
  const textPaths: { type: "field" | "array" | "object"; path: string; index?: number }[] = [];

  // Collect text fields
  for (const field of config.textFields) {
    const value = content[field];
    if (typeof value === "string" && value.trim() !== "") {
      textsToTranslate.push(value);
      textPaths.push({ type: "field", path: field });
    }
  }

  // Collect array fields
  if (config.arrayFields) {
    for (const arrayConfig of config.arrayFields) {
      const array = content[arrayConfig.field];
      if (Array.isArray(array)) {
        array.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            for (const prop of arrayConfig.textProperties) {
              const value = (item as Record<string, unknown>)[prop];
              if (typeof value === "string" && value.trim() !== "") {
                textsToTranslate.push(value);
                textPaths.push({
                  type: "array",
                  path: `${arrayConfig.field}.${index}.${prop}`,
                  index,
                });
              }
            }
          }
        });
      }
    }
  }

  // Collect object fields
  if (config.objectFields) {
    for (const objectConfig of config.objectFields) {
      const obj = content[objectConfig.field];
      if (typeof obj === "object" && obj !== null) {
        for (const prop of objectConfig.textProperties) {
          const value = getNestedValue(obj as Record<string, unknown>, prop);
          if (value && value.trim() !== "") {
            textsToTranslate.push(value);
            textPaths.push({ type: "object", path: `${objectConfig.field}.${prop}` });
          }
        }
      }
    }
  }

  if (textsToTranslate.length === 0) {
    return { content: translatedContent, error: null };
  }

  // Translate all texts in batch
  const { texts: translatedTexts, error } = await translateBatch(
    textsToTranslate,
    sourceLocale,
    targetLocale
  );

  if (error) {
    return { content: translatedContent, error };
  }

  // Apply translations back to content
  textPaths.forEach((pathInfo, index) => {
    const translatedText = translatedTexts[index];
    if (!translatedText) return;

    if (pathInfo.type === "field") {
      (translatedContent as Record<string, unknown>)[pathInfo.path] = translatedText;
    } else {
      // For array and object paths, use nested setter
      setNestedValue(translatedContent as Record<string, unknown>, pathInfo.path, translatedText);
    }
  });

  return { content: translatedContent, error: null };
}

/**
 * Translate content to all other supported locales
 */
export async function translateContentToAllLocales<T extends Record<string, unknown>>(
  content: T,
  sourceLocale: SupportedLocale,
  config: TranslationConfig
): Promise<{
  translations: Record<SupportedLocale, T>;
  error: string | null;
}> {
  const translations: Record<SupportedLocale, T> = {
    en: sourceLocale === "en" ? content : ({} as T),
    fi: sourceLocale === "fi" ? content : ({} as T),
  };

  const targetLocales = getTargetLocales(sourceLocale);
  const errors: string[] = [];

  await Promise.all(
    targetLocales.map(async (targetLocale) => {
      const { content: translatedContent, error } = await translateContent(
        content,
        sourceLocale,
        targetLocale,
        config
      );
      if (error) {
        errors.push(`${targetLocale}: ${error}`);
      } else {
        translations[targetLocale] = translatedContent;
      }
    })
  );

  return {
    translations,
    error: errors.length > 0 ? errors.join("; ") : null,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check DeepL API usage/quota
 */
export async function getTranslationUsage(): Promise<{
  characterCount: number;
  characterLimit: number;
  error: string | null;
}> {
  try {
    const client = getDeepLClient();
    const usage = await client.getUsage();

    return {
      characterCount: usage.character?.count ?? 0,
      characterLimit: usage.character?.limit ?? 0,
      error: null,
    };
  } catch (error) {
    console.error("Error getting translation usage:", error);
    return {
      characterCount: 0,
      characterLimit: 0,
      error: error instanceof Error ? error.message : "Failed to get usage",
    };
  }
}
