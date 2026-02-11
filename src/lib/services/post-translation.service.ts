/**
 * Post translation service
 * Handles all translation-related operations for posts
 * Decoupled from main post operations for better maintainability
 */

import {
  translateContent,
  ARTICLE_TRANSLATION_CONFIG,
  type SupportedLocale,
} from "@/src/lib/services/translation.service";
import { createTranslationForPost } from "@/src/lib/db/queries/posts.mutations";
import { postSlugExists } from "@/src/lib/db/queries/posts.queries";
import { generateSlug } from "@/src/lib/utils/utils";
import type { PostRecord } from "@/src/lib/types/article";

export interface TranslationRequest {
  originalPost: PostRecord;
  targetLanguages: string[];
  sourceLanguage: string;
}

export interface TranslationResult {
  success: boolean;
  createdTranslations: PostRecord[];
  errors: string[];
}

export interface TranslationContent {
  title: string;
  excerpt: string;
  content: string;
}

/**
 * Service class for handling post translations
 */
export class PostTranslationService {
  /**
   * Create translations for a post in multiple languages
   */
  static async createTranslations(request: TranslationRequest): Promise<TranslationResult> {
    const { originalPost, targetLanguages, sourceLanguage } = request;
    const createdTranslations: PostRecord[] = [];
    const errors: string[] = [];

    const sourceLocale = sourceLanguage as SupportedLocale;
    const contentToTranslate: TranslationContent = {
      title: originalPost.title,
      content: originalPost.content,
      excerpt: originalPost.excerpt,
    };

    for (const targetLang of targetLanguages) {
      try {
        const translationResult = await this.createSingleTranslation(
          originalPost,
          contentToTranslate,
          sourceLocale,
          targetLang
        );

        if (translationResult.success && translationResult.translation) {
          createdTranslations.push(translationResult.translation);
        } else {
          errors.push(`Failed to create translation for ${targetLang}: ${translationResult.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Exception creating translation for ${targetLang}: ${errorMessage}`);
      }
    }

    return {
      success: createdTranslations.length > 0,
      createdTranslations,
      errors
    };
  }

  /**
   * Create a single translation for a post
   */
  private static async createSingleTranslation(
    originalPost: PostRecord,
    contentToTranslate: TranslationContent,
    sourceLocale: SupportedLocale,
    targetLanguage: string
  ): Promise<{ success: boolean; translation?: PostRecord; error?: string }> {
    try {
      // Translate content
      const contentRecord: Record<string, unknown> = {
        title: contentToTranslate.title,
        content: contentToTranslate.content,
        excerpt: contentToTranslate.excerpt,
      };
      
      const { content: translatedContent, error: translationError } = await translateContent(
        contentRecord,
        sourceLocale,
        targetLanguage as SupportedLocale,
        ARTICLE_TRANSLATION_CONFIG
      );

      if (translationError) {
        return { success: false, error: `Translation error: ${translationError}` };
      }

      if (!translatedContent.title || !translatedContent.content || !translatedContent.excerpt) {
        return { success: false, error: 'Incomplete translation received' };
      }

      // Generate unique slug from translated title
      const translatedSlug = generateSlug(translatedContent.title as string);
      
      // Check if this slug already exists
      const slugExists = await postSlugExists(translatedSlug);
      if (slugExists) {
        return { success: false, error: `Slug ${translatedSlug} already exists` };
      }

      // Create translation record
      const translation = await createTranslationForPost({
        parentPostId: originalPost.id,
        slug: translatedSlug,
        title: translatedContent.title as string,
        excerpt: translatedContent.excerpt as string,
        content: translatedContent.content as string,
        language: targetLanguage,
        translatedFromLanguage: sourceLocale,
        type: originalPost.type,
        status: originalPost.status,
        featuredImage: originalPost.featuredImage,
        categories: originalPost.categories || [],
        publishedAt: originalPost.status === 'published' ? new Date() : null,
      });

      return { success: true, translation };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Validate translation request
   */
  static validateTranslationRequest(request: TranslationRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.originalPost) {
      errors.push('Original post is required');
    }

    if (!request.targetLanguages || request.targetLanguages.length === 0) {
      errors.push('Target languages are required');
    }

    if (!request.sourceLanguage) {
      errors.push('Source language is required');
    }

    // Validate language codes
    const validLanguages = ['en', 'fi'];
    if (!validLanguages.includes(request.sourceLanguage)) {
      errors.push(`Invalid source language: ${request.sourceLanguage}`);
    }

    const invalidTargetLanguages = request.targetLanguages?.filter(
      lang => !validLanguages.includes(lang)
    ) || [];

    if (invalidTargetLanguages.length > 0) {
      errors.push(`Invalid target languages: ${invalidTargetLanguages.join(', ')}`);
    }

    // Check for duplicate languages
    const hasDuplicates = request.targetLanguages?.includes(request.sourceLanguage);
    if (hasDuplicates) {
      errors.push('Target languages cannot include source language');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available target languages for a source language
   */
  static getAvailableTargetLanguages(sourceLanguage: string): string[] {
    const allLanguages = ['en', 'fi'];
    return allLanguages.filter(lang => lang !== sourceLanguage);
  }

  /**
   * Check if translation is supported for language pair
   */
  static isTranslationSupported(sourceLanguage: string, targetLanguage: string): boolean {
    const supportedLanguages = ['en', 'fi'];
    return supportedLanguages.includes(sourceLanguage) && 
           supportedLanguages.includes(targetLanguage) &&
           sourceLanguage !== targetLanguage;
  }
}