/**
 * Article UI business logic service
 * Handles UI-specific business logic while maintaining separation from database operations
 */

import type { PostRecord } from "@/src/lib/types/article";

export interface ArticleUIState {
  isSubmitting: boolean;
  isTranslating: boolean;
  hasChanges: boolean;
}

export interface ArticleFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ArticleNavigationOptions {
  shouldRedirect: boolean;
  redirectPath: string;
  shouldInvalidateCache: boolean;
}

/**
 * Article UI operations service
 */
export class ArticleUIService {
  /**
   * Validate article form data before submission
   */
  static validateArticleForm(data: {
    title: string;
    excerpt: string;
    content: string;
    status: string;
    language: string;
  }): ArticleFormValidation {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Title validation
    if (!data.title.trim()) {
      errors.title = "Title is required";
    } else if (data.title.length > 200) {
      errors.title = "Title must be 200 characters or less";
    }

    // Excerpt validation  
    if (!data.excerpt.trim()) {
      errors.excerpt = "Excerpt is required";
    } else if (data.excerpt.length > 500) {
      errors.excerpt = "Excerpt must be 500 characters or less";
    }

    // Content validation
    if (!data.content.trim()) {
      errors.content = "Content is required";
    } else if (data.content.length < 100) {
      warnings.content = "Content seems quite short for an article";
    }

    // Status validation
    if (!['draft', 'published', 'archived'].includes(data.status)) {
      errors.status = "Invalid status selected";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Determine navigation strategy after article operations
   */
  static getNavigationStrategy(
    operation: 'create' | 'update' | 'delete',
    success: boolean,
    context?: {
      hasTranslations?: boolean;
      isNewUser?: boolean;
    }
  ): ArticleNavigationOptions {
    if (!success) {
      return {
        shouldRedirect: false,
        redirectPath: '',
        shouldInvalidateCache: false
      };
    }

    switch (operation) {
      case 'create':
        return {
          shouldRedirect: true,
          redirectPath: context?.hasTranslations 
            ? '/admin/articles?success=created-with-translations'
            : '/admin/articles?success=created',
          shouldInvalidateCache: true
        };

      case 'update':
        return {
          shouldRedirect: true,
          redirectPath: '/admin/articles?success=updated',
          shouldInvalidateCache: true
        };

      case 'delete':
        return {
          shouldRedirect: true,
          redirectPath: '/admin/articles?success=deleted',
          shouldInvalidateCache: true
        };

      default:
        return {
          shouldRedirect: false,
          redirectPath: '',
          shouldInvalidateCache: false
        };
    }
  }

  /**
   * Generate success message based on operation and context
   */
  static getSuccessMessage(
    operation: 'create' | 'update' | 'delete',
    context?: {
      translationsCount?: number;
      articleTitle?: string;
    }
  ): string {
    switch (operation) {
      case 'create':
        if (context?.translationsCount && context.translationsCount > 0) {
          return `Article created successfully with ${context.translationsCount} translation(s)!`;
        }
        return 'Article created successfully!';

      case 'update':
        return `Article "${context?.articleTitle || 'Unknown'}" updated successfully!`;

      case 'delete':
        return `Article "${context?.articleTitle || 'Unknown'}" deleted successfully!`;

      default:
        return 'Operation completed successfully!';
    }
  }

  /**
   * Check if form has meaningful changes compared to original
   */
  static hasFormChanges(
    currentData: {
      title: string;
      excerpt: string;
      content: string;
      status: string;
      featuredImageUrl?: string;
    },
    originalArticle: PostRecord
  ): boolean {
    const normalizeString = (str: string) => str?.trim() || '';
    
    return (
      normalizeString(currentData.title) !== normalizeString(originalArticle.title) ||
      normalizeString(currentData.excerpt) !== normalizeString(originalArticle.excerpt) ||
      normalizeString(currentData.content) !== normalizeString(originalArticle.content) ||
      currentData.status !== originalArticle.status ||
      normalizeString(currentData.featuredImageUrl || '') !== normalizeString(originalArticle.featuredImage || '')
    );
  }

  /**
   * Get preview URL for article
   */
  static getPreviewUrl(slug: string, isAdmin: boolean = true): string {
    return isAdmin 
      ? `/admin/articles/${slug}`
      : `/articles/${slug}`;
  }

  /**
   * Optimize form submission state management
   */
  static createSubmissionStateManager() {
    let state: ArticleUIState = {
      isSubmitting: false,
      isTranslating: false,
      hasChanges: false
    };

    return {
      getState: () => ({ ...state }),
      
      setSubmitting: (isSubmitting: boolean, isTranslating: boolean = false) => {
        state = { ...state, isSubmitting, isTranslating };
        return state;
      },
      
      setChanges: (hasChanges: boolean) => {
        state = { ...state, hasChanges };
        return state;
      },
      
      reset: () => {
        state = {
          isSubmitting: false,
          isTranslating: false,
          hasChanges: false
        };
        return state;
      }
    };
  }
}