import * as deepl from "deepl-node";
import type { Locale } from "@/src/types/Content";

// Map our locale codes to DeepL language codes
const DEEPL_LANGUAGE_MAP: Record<Locale, deepl.TargetLanguageCode> = {
  en: "en-US",
  ar: "ar",
  fi: "fi",
};

// Source language codes for DeepL (can be null for auto-detect)
const DEEPL_SOURCE_MAP: Record<Locale, deepl.SourceLanguageCode> = {
  en: "en",
  ar: "ar",
  fi: "fi",
};

// Languages that support formality option in DeepL
// Finnish (fi) does NOT support formality
const FORMALITY_SUPPORTED_LOCALES: Locale[] = ["ar"];

// All supported locales
export const SUPPORTED_LOCALES: Locale[] = ["en", "ar", "fi"];

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
 * Translate a single text from source locale to target locale
 */
export async function translateText(
  text: string,
  sourceLocale: Locale,
  targetLocale: Locale
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
    const targetLang = DEEPL_LANGUAGE_MAP[targetLocale];

    // Only use formality for languages that support it
    const options: deepl.TranslateTextOptions = {
      preserveFormatting: true,
    };
    
    // Add formality only for supported languages (not Finnish, etc.)
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
 * Translate multiple texts in a batch
 */
export async function translateBatch(
  texts: string[],
  sourceLocale: Locale,
  targetLocale: Locale
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
    const targetLang = DEEPL_LANGUAGE_MAP[targetLocale];

    // Only use formality for languages that support it
    const options: deepl.TranslateTextOptions = {
      preserveFormatting: true,
    };
    
    if (FORMALITY_SUPPORTED_LOCALES.includes(targetLocale)) {
      options.formality = "prefer_more";
    }

    const results = await client.translateText(nonEmptyTexts, sourceLang, targetLang, options);

    // Reconstruct the full array with translated texts in correct positions
    const translatedTexts = texts.map(() => "");
    nonEmptyIndices.forEach((originalIndex, resultIndex) => {
      translatedTexts[originalIndex] = results[resultIndex].text;
    });

    return { texts: translatedTexts, error: null };
  } catch (error) {
    console.error("Batch translation error:", error);
    return {
      texts: [],
      error: error instanceof Error ? error.message : "Batch translation failed",
    };
  }
}

/**
 * Translate content to all other locales
 */
export async function translateToAllLocales(
  text: string,
  sourceLocale: Locale
): Promise<{ translations: Record<Locale, string>; error: string | null }> {
  const translations: Record<Locale, string> = {
    en: "",
    ar: "",
    fi: "",
  };

  // Set the source text for the source locale
  translations[sourceLocale] = text;

  if (!text || text.trim() === "") {
    return { translations, error: null };
  }

  // Get target locales (all except source)
  const targetLocales = SUPPORTED_LOCALES.filter((l) => l !== sourceLocale);

  try {
    // Translate to all target locales in parallel
    const results = await Promise.all(
      targetLocales.map(async (targetLocale) => {
        const result = await translateText(text, sourceLocale, targetLocale);
        return { locale: targetLocale, ...result };
      })
    );

    // Check for errors and collect translations
    const errors: string[] = [];
    results.forEach(({ locale, text: translatedText, error }) => {
      if (error) {
        errors.push(`${locale}: ${error}`);
      } else {
        translations[locale] = translatedText;
      }
    });

    if (errors.length > 0) {
      return { translations, error: errors.join("; ") };
    }

    return { translations, error: null };
  } catch (error) {
    console.error("Translate to all locales error:", error);
    return {
      translations,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

export interface ArticleTranslation {
  title: string;
  content: string;
  excerpt: string;
}

/**
 * Translate article content (title, content, excerpt) to a target locale
 */
export async function translateArticle(
  article: ArticleTranslation,
  sourceLocale: Locale,
  targetLocale: Locale
): Promise<{ article: ArticleTranslation; error: string | null }> {
  if (sourceLocale === targetLocale) {
    return { article, error: null };
  }

  const { texts, error } = await translateBatch(
    [article.title, article.content, article.excerpt],
    sourceLocale,
    targetLocale
  );

  if (error) {
    return {
      article: { title: "", content: "", excerpt: "" },
      error,
    };
  }

  return {
    article: {
      title: texts[0] || "",
      content: texts[1] || "",
      excerpt: texts[2] || "",
    },
    error: null,
  };
}

/**
 * Translate article to all locales
 */
export async function translateArticleToAllLocales(
  article: ArticleTranslation,
  sourceLocale: Locale
): Promise<{
  translations: Record<Locale, ArticleTranslation>;
  error: string | null;
}> {
  const emptyArticle: ArticleTranslation = { title: "", content: "", excerpt: "" };
  const translations: Record<Locale, ArticleTranslation> = {
    en: emptyArticle,
    ar: emptyArticle,
    fi: emptyArticle,
  };

  // Set the source article
  translations[sourceLocale] = article;

  // Get target locales
  const targetLocales = SUPPORTED_LOCALES.filter((l) => l !== sourceLocale);

  try {
    const results = await Promise.all(
      targetLocales.map(async (targetLocale) => {
        const result = await translateArticle(article, sourceLocale, targetLocale);
        return { locale: targetLocale, ...result };
      })
    );

    const errors: string[] = [];
    results.forEach(({ locale, article: translatedArticle, error }) => {
      if (error) {
        errors.push(`${locale}: ${error}`);
      } else {
        translations[locale] = translatedArticle;
      }
    });

    if (errors.length > 0) {
      return { translations, error: errors.join("; ") };
    }

    return { translations, error: null };
  } catch (error) {
    console.error("Translate article to all locales error:", error);
    return {
      translations,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

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
