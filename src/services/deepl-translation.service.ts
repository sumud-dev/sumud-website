/**
 * DeepL Translation Service
 * 
 * Optional service for translating page content between languages
 * Requires DEEPL_API_KEY environment variable
 */

import type { SerializedNodes } from '@craftjs/core';
import { extractTranslatableText, applyTranslations } from './page-content-sync.service';

// DeepL API endpoint (from env or default to free tier)
const DEEPL_API_URL = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';

interface DeepLTranslateParams {
  text: string[];
  targetLang: 'EN' | 'FI';
  sourceLang?: 'EN' | 'FI';
}

interface DeepLTranslateResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

/**
 * Check if DeepL is configured
 */
export function isDeepLConfigured(): boolean {
  return !!process.env.DEEPL_API_KEY;
}

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(
  texts: string[],
  targetLang: 'EN' | 'FI',
  sourceLang?: 'EN' | 'FI'
): Promise<string[]> {
  if (!process.env.DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY not configured');
  }

  try {
    const params = new URLSearchParams();
    texts.forEach(text => params.append('text', text));
    params.append('target_lang', targetLang);
    if (sourceLang) {
      params.append('source_lang', sourceLang);
    }

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
    }

    const data: DeepLTranslateResponse = await response.json();
    return data.translations.map(t => t.text);
  } catch (error) {
    console.error('[DeepL] Translation error:', error);
    throw error;
  }
}

/**
 * Convert language code to DeepL format
 */
function toDeepLLanguage(lang: string): 'EN' | 'FI' {
  return lang.toUpperCase() as 'EN' | 'FI';
}

/**
 * Translate page content from one language to another
 * 
 * @param sourceContent - Content in source language
 * @param sourceLang - Source language code ('en' or 'fi')
 * @param targetLang - Target language code ('en' or 'fi')
 * @returns Translated content with same structure
 */
export async function translatePageContent(
  sourceContent: SerializedNodes,
  sourceLang: 'en' | 'fi',
  targetLang: 'en' | 'fi'
): Promise<SerializedNodes> {
  if (!isDeepLConfigured()) {
    throw new Error('DeepL translation not configured. Set DEEPL_API_KEY environment variable.');
  }

  console.log('[translatePageContent] Starting translation:', {
    sourceLang,
    targetLang,
    nodeCount: Object.keys(sourceContent).length,
  });

  // Extract translatable text from content
  const translatableMap = extractTranslatableText(sourceContent);
  
  if (translatableMap.size === 0) {
    console.log('[translatePageContent] No translatable text found');
    return sourceContent;
  }

  console.log('[translatePageContent] Found translatable nodes:', translatableMap.size);

  // Collect all text values to translate
  const textsToTranslate: string[] = [];
  const textMetadata: Array<{ nodeId: string; propKey: string; index: number }> = [];

  for (const [nodeId, props] of translatableMap.entries()) {
    for (const [propKey, value] of Object.entries(props)) {
      if (typeof value === 'string' && value.trim()) {
        textMetadata.push({ nodeId, propKey, index: textsToTranslate.length });
        textsToTranslate.push(value);
      }
    }
  }

  if (textsToTranslate.length === 0) {
    console.log('[translatePageContent] No text values to translate');
    return sourceContent;
  }

  console.log('[translatePageContent] Translating', textsToTranslate.length, 'text values');

  // Translate all texts in batch
  const translatedTexts = await translateWithDeepL(
    textsToTranslate,
    toDeepLLanguage(targetLang),
    toDeepLLanguage(sourceLang)
  );

  // Build translation map
  const translations = new Map<string, Record<string, string>>();
  
  for (const { nodeId, propKey, index } of textMetadata) {
    if (!translations.has(nodeId)) {
      translations.set(nodeId, {});
    }
    const nodeTranslations = translations.get(nodeId)!;
    nodeTranslations[propKey] = translatedTexts[index];
  }

  // Apply translations to content
  const translatedContent = applyTranslations(sourceContent, translations);

  console.log('[translatePageContent] Translation complete');

  return translatedContent;
}

/**
 * Translate missing content for a page
 * 
 * Use case: Page has English content but Finnish is empty/outdated
 * This will translate English to Finnish while preserving existing Finnish text
 * 
 * @param pageId - Page ID
 * @param fromLang - Source language
 * @param toLang - Target language
 */
export async function translateMissingContent(
  sourceContent: SerializedNodes,
  targetContent: SerializedNodes | null,
  sourceLang: 'en' | 'fi',
  targetLang: 'en' | 'fi'
): Promise<SerializedNodes> {
  if (!targetContent) {
    // No target content exists, translate everything
    return translatePageContent(sourceContent, sourceLang, targetLang);
  }

  // Extract what's in target already
  const existingTargetText = extractTranslatableText(targetContent);
  const sourceText = extractTranslatableText(sourceContent);

  // Find nodes that need translation (exist in source but not in target)
  const nodesToTranslate = new Map<string, Record<string, string>>();
  
  for (const [nodeId, sourceProps] of sourceText.entries()) {
    const targetProps = existingTargetText.get(nodeId);
    
    if (!targetProps) {
      // Node doesn't exist in target, needs full translation
      nodesToTranslate.set(nodeId, sourceProps);
    } else {
      // Check which props are missing
      const missingProps: Record<string, string> = {};
      for (const [key, value] of Object.entries(sourceProps)) {
        if (!targetProps[key] || !targetProps[key].trim()) {
          missingProps[key] = value;
        }
      }
      if (Object.keys(missingProps).length > 0) {
        nodesToTranslate.set(nodeId, missingProps);
      }
    }
  }

  if (nodesToTranslate.size === 0) {
    console.log('[translateMissingContent] No missing translations found');
    return targetContent;
  }

  console.log('[translateMissingContent] Translating', nodesToTranslate.size, 'nodes');

  // Translate missing text
  const textsToTranslate: string[] = [];
  const textMetadata: Array<{ nodeId: string; propKey: string; index: number }> = [];

  for (const [nodeId, props] of nodesToTranslate.entries()) {
    for (const [propKey, value] of Object.entries(props)) {
      if (typeof value === 'string' && value.trim()) {
        textMetadata.push({ nodeId, propKey, index: textsToTranslate.length });
        textsToTranslate.push(value);
      }
    }
  }

  const translatedTexts = await translateWithDeepL(
    textsToTranslate,
    toDeepLLanguage(targetLang),
    toDeepLLanguage(sourceLang)
  );

  // Build translation map for missing content only
  const translations = new Map<string, Record<string, string>>();
  
  for (const { nodeId, propKey, index } of textMetadata) {
    if (!translations.has(nodeId)) {
      translations.set(nodeId, {});
    }
    const nodeTranslations = translations.get(nodeId)!;
    nodeTranslations[propKey] = translatedTexts[index];
  }

  // Apply translations to target content
  const updatedContent = applyTranslations(targetContent, translations);

  console.log('[translateMissingContent] Translation complete');

  return updatedContent;
}

/**
 * Get translation status for a page
 */
export function getTranslationStatus(
  sourceContent: SerializedNodes,
  targetContent: SerializedNodes | null
): {
  total: number;
  translated: number;
  missing: number;
  percentage: number;
} {
  const sourceText = extractTranslatableText(sourceContent);
  
  if (sourceText.size === 0) {
    return { total: 0, translated: 0, missing: 0, percentage: 100 };
  }

  if (!targetContent) {
    return { 
      total: sourceText.size, 
      translated: 0, 
      missing: sourceText.size, 
      percentage: 0 
    };
  }

  const targetText = extractTranslatableText(targetContent);
  
  let translated = 0;
  let missing = 0;

  for (const [nodeId, sourceProps] of sourceText.entries()) {
    const targetProps = targetText.get(nodeId);
    
    if (!targetProps) {
      missing++;
    } else {
      // Check if all props are translated
      let nodeTranslated = true;
      for (const key of Object.keys(sourceProps)) {
        if (!targetProps[key] || !targetProps[key].trim()) {
          nodeTranslated = false;
          break;
        }
      }
      if (nodeTranslated) {
        translated++;
      } else {
        missing++;
      }
    }
  }

  const percentage = Math.round((translated / sourceText.size) * 100);

  return {
    total: sourceText.size,
    translated,
    missing,
    percentage,
  };
}