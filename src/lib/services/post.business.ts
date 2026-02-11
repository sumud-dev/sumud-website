/**
 * Post business logic service
 * Handles business rules and validation for post operations
 * Separates business logic from database operations and actions
 */

import type { PostRecord } from "@/src/lib/types/article";
import type { CreatePostInput } from "@/src/actions/posts.actions";

export interface PostBusinessValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PostUpdateInput {
  title?: string;
  excerpt?: string;
  content?: string;
  status?: "draft" | "published" | "archived";
  featuredImage?: string | null;
  metaDescription?: string | null;
  categories?: string[];
}

export interface PostCreationParams {
  postData: CreatePostInput;
  shouldAutoTranslate: boolean;
  targetLanguages: string[];
}

export interface PostUpdateParams {
  postSlug: string;
  updateData: PostUpdateInput;
  language: string;
}

/**
 * Validates post creation data
 */
export function validatePostCreation(postData: CreatePostInput): PostBusinessValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!postData.title?.trim()) {
    errors.push("Title is required");
  } else if (postData.title.length > 200) {
    errors.push("Title must be 200 characters or less");
  }

  // Excerpt validation
  if (!postData.excerpt?.trim()) {
    errors.push("Excerpt is required");
  } else if (postData.excerpt.length > 500) {
    errors.push("Excerpt must be 500 characters or less");
  }

  // Content validation
  if (!postData.content?.trim()) {
    errors.push("Content is required");
  }

  // Language validation
  if (!['en', 'fi'].includes(postData.language)) {
    errors.push("Language must be 'en' or 'fi'");
  }

  // Slug validation
  if (!postData.slug?.trim()) {
    errors.push("Slug is required");
  } else if (!/^[a-z0-9-]+$/.test(postData.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates post update data
 */
export function validatePostUpdate(
  existingPost: PostRecord, 
  updateData: PostUpdateInput
): PostBusinessValidationResult {
  const errors: string[] = [];

  // Title validation (if provided)
  if (updateData.title !== undefined) {
    if (!updateData.title?.trim()) {
      errors.push("Title cannot be empty");
    } else if (updateData.title.length > 200) {
      errors.push("Title must be 200 characters or less");
    }
  }

  // Excerpt validation (if provided)
  if (updateData.excerpt !== undefined) {
    if (!updateData.excerpt?.trim()) {
      errors.push("Excerpt cannot be empty");
    } else if (updateData.excerpt.length > 500) {
      errors.push("Excerpt must be 500 characters or less");
    }
  }

  // Content validation (if provided)
  if (updateData.content !== undefined && !updateData.content?.trim()) {
    errors.push("Content cannot be empty");
  }

  // Business rule: Cannot update translations directly
  if (existingPost.isTranslation) {
    errors.push("Cannot update translations directly. Edit the original post instead.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Determines if auto-translation should be applied
 */
export function shouldApplyAutoTranslation(
  postData: CreatePostInput
): { shouldTranslate: boolean; targetLanguages: string[] } {
  if (!postData.autoTranslate || !postData.targetLanguages?.length) {
    return { shouldTranslate: false, targetLanguages: [] };
  }

  // Filter out the source language
  const validTargetLanguages = postData.targetLanguages.filter(
    lang => lang !== postData.language && ['en', 'fi'].includes(lang)
  );

  return {
    shouldTranslate: validTargetLanguages.length > 0,
    targetLanguages: validTargetLanguages
  };
}

/**
 * Validates deletion permissions
 */
export function validatePostDeletion(post: PostRecord): PostBusinessValidationResult {
  const errors: string[] = [];
  
  // No specific business rules for deletion at the moment
  // This is where we would add rules like "cannot delete published posts" if needed
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Determines status change implications
 */
export function getStatusChangeImplications(
  currentStatus: string,
  newStatus: string
): {
  requiresPublishDate: boolean;
  requiresValidation: boolean;
  message?: string;
} {
  if (currentStatus === 'draft' && newStatus === 'published') {
    return {
      requiresPublishDate: true,
      requiresValidation: true,
      message: 'Publishing article will make it visible to users'
    };
  }

  if (currentStatus === 'published' && newStatus === 'archived') {
    return {
      requiresPublishDate: false,
      requiresValidation: false,
      message: 'Archiving will hide the article from users'
    };
  }

  return {
    requiresPublishDate: false,
    requiresValidation: false
  };
}

/**
 * Post business logic class for complex operations
 */
export class PostBusinessLogic {
  /**
   * Prepare post data for creation
   */
  static prepareForCreation(params: PostCreationParams): {
    postData: CreatePostInput;
    translationConfig: {
      shouldTranslate: boolean;
      targetLanguages: string[];
    };
  } {
    const { postData, shouldAutoTranslate, targetLanguages } = params;
    
    // Apply business rules
    const translationConfig = shouldAutoTranslate 
      ? shouldApplyAutoTranslation({ ...postData, autoTranslate: true, targetLanguages })
      : { shouldTranslate: false, targetLanguages: [] };

    return {
      postData,
      translationConfig
    };
  }

  /**
   * Prepare post data for update
   */
  static prepareForUpdate(params: PostUpdateParams): {
    updateData: PostUpdateInput;
    publishedAt?: Date | null;
  } {
    const { updateData } = params;
    
    // Determine if publishedAt needs to be set
    const publishedAt = updateData.status === 'published' ? new Date() : null;

    return {
      updateData,
      publishedAt
    };
  }
}