"use server";

import { revalidatePath } from "next/cache";
import {
  findPostBySlugAndLanguage,
  listPostsPaginated,
  getPostStatisticsByLanguage,
  postSlugExists,
} from "@/src/lib/db/queries/posts.queries";
import {   
  type PostQueryFilters,
  type PostPaginationOptions,
  type PaginatedPostResult,
  type PostRecord } from "@/src/lib/types/article";
import {
  createOriginalPost,
  updateOriginalPost,
  deleteOriginalPost,
  deleteTranslation,
} from "@/src/lib/db/queries/posts.mutations";
import { validatePostCreation, validatePostUpdate, shouldApplyAutoTranslation, PostBusinessLogic } from "@/src/lib/services/post.business";
import { PostTranslationService } from "@/src/lib/services/post-translation.service";

// ============================================================================
// QUERY ACTIONS
// ============================================================================

export interface GetPostsOptions {
  search?: string;
  status?: "draft" | "published" | "archived";
  type?: "article" | "news";
  language?: string;
  page?: number;
  limit?: number;
  originalsOnly?: boolean;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export async function getPosts(
  queryOptions: GetPostsOptions = {}
): Promise<
  | { success: true; result: PaginatedPostResult }
  | { success: false; error: string }
> {
  try {
    const postFilters: PostQueryFilters = {
      search: queryOptions.search,
      status: queryOptions.status,
      type: queryOptions.type,
      language: queryOptions.language,
      originalsOnly: queryOptions.originalsOnly,
    };

    const paginationOptions: PostPaginationOptions = {
      page: queryOptions.page,
      limit: queryOptions.limit,
      sortBy: queryOptions.sortBy,
      sortOrder: queryOptions.sortOrder,
    };

    const postResult = await listPostsPaginated(
      postFilters,
      paginationOptions
    );

    return { success: true, result: postResult };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch articles",
    };
  }
}

export async function getPostBySlug(
  postSlug: string,
  articleLanguage: string
): Promise<
  | { success: true; post: PostRecord }
  | { success: false; error: string }
> {
  try {
    const foundPost = await findPostBySlugAndLanguage(postSlug, articleLanguage)

    if (!foundPost) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, post: foundPost };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch article",
    };
  }
}

export async function getPostStatistics(
  statisticsLanguage: string = "fi"
): Promise<
  | {
      success: true;
      statistics: {
        totalArticles: number;
        publishedArticles: number;
        draftArticles: number;
        archivedArticles: number;
        originalArticles: number;
        translatedArticles: number;
      };
    }
  | { success: false; error: string }
> {
  try {
    const postStatistics = await getPostStatisticsByLanguage(
      statisticsLanguage
    );

    return {
      success: true,
      statistics: {
        totalArticles: postStatistics.totalPosts,
        publishedArticles: postStatistics.publishedPosts,
        draftArticles: postStatistics.draftPosts,
        archivedArticles: postStatistics.archivedPosts,
        originalArticles: postStatistics.originalPosts,
        translatedArticles: postStatistics.translatedPosts,
      },
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch statistics",
    };
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

export interface CreatePostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  type?: string;
  status?: string;
  featuredImage?: string | null;
  categories?: string[];
  authorId?: string | null;
  authorName?: string | null;
  autoTranslate?: boolean;
  targetLanguages?: string[];
}

export async function createPost(
  postInput: CreatePostInput
): Promise<
  | {
      success: true;
      originalPost: PostRecord;
      createdTranslations: PostRecord[];
      message: string;
    }
  | { success: false; error: string }
> {
  try {
    // Validate business rules
    const validation = validatePostCreation(postInput);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join("; "),
      };
    }

    // Check if slug exists
    const slugAlreadyExists = await postSlugExists(postInput.slug, postInput.language);
    if (slugAlreadyExists) {
      return {
        success: false,
        error: "An article with this slug already exists",
      };
    }

    // Create the original article
    const createdOriginal = await createOriginalPost({
      slug: postInput.slug,
      title: postInput.title,
      excerpt: postInput.excerpt,
      content: postInput.content,
      language: postInput.language,
      type: postInput.type,
      status: postInput.status,
      featuredImage: postInput.featuredImage,
      categories: postInput.categories,
      authorId: postInput.authorId,
      authorName: postInput.authorName,
    });

    // Revalidate paths immediately for fast UI feedback
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");

    const createdTranslations: PostRecord[] = [];
    let successMessage = "Post created successfully";

    // Handle auto-translation using business logic (non-blocking)
    const translationConfig = shouldApplyAutoTranslation(postInput);
    if (translationConfig.shouldTranslate) {
      // Run translations in background without blocking response
      PostTranslationService.createTranslations({
        originalPost: createdOriginal,
        targetLanguages: translationConfig.targetLanguages,
        sourceLanguage: postInput.language,
      }).then((translationResult) => {
        if (translationResult.success) {
          // Revalidate again after translations complete
          revalidatePath("/[locale]/articles", "page");
          revalidatePath("/[locale]/admin/articles", "page");
        }
        
        // Log any translation errors
        if (translationResult.errors.length > 0) {
          console.warn("Translation errors:", translationResult.errors);
        }
      }).catch((error) => {
        console.error("Background translation failed:", error);
      });
      
      successMessage = "Post created successfully (translations processing in background)";
    }

    return {
      success: true,
      originalPost: createdOriginal,
      createdTranslations,
      message: successMessage,
    };
  } catch (error) {
    console.error("Error creating article:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create article",
    };
  }
}

export async function updatePost(
  postSlug: string,
  updateData: {
    title?: string;
    excerpt?: string;
    content?: string;
    status?: "draft" | "published" | "archived";
    featured_image?: string | null;
    meta_description?: string | null;
    categories?: string[];
    language?: string; // Allow language to be updated
  },
  originalLanguage: string // Language to find the post with
): Promise<
  | { success: true; updatedPost: PostRecord; message: string }
  | { success: false; error: string }
> {
  try {
    const existingPost = await findPostBySlugAndLanguage(postSlug, originalLanguage);
    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    // Validate business rules
    const validation = validatePostUpdate(existingPost, updateData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join("; "),
      };
    }

    // Use business logic to prepare update data
    const { updateData: processedUpdateData, publishedAt } = PostBusinessLogic.prepareForUpdate({
      postSlug,
      updateData,
      language: originalLanguage,
    });

    const updatedPost = await updateOriginalPost(
      existingPost.id,
      {
        title: processedUpdateData.title,
        excerpt: processedUpdateData.excerpt,
        content: processedUpdateData.content,
        status: processedUpdateData.status,
        language: updateData.language || originalLanguage, // Use new language if provided
        featuredImage: processedUpdateData.featuredImage,
        categories: processedUpdateData.categories,
        publishedAt,
      }
    );

    if (!updatedPost) {
      return { success: false, error: "Failed to update post" };
    }

    // Revalidate paths
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");
    revalidatePath(`/[locale]/articles/${postSlug}`, "page");

    return {
      success: true,
      updatedPost,
      message: "Post updated successfully",
    };
  } catch (error) {
    console.error("Error updating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}

export async function deletePost(
  postSlug: string,
  language: string
): Promise<
  | { success: true; deletedCount: number; message: string }
  | { success: false; error: string }
> {
  try {
    const existingPost = await findPostBySlugAndLanguage(postSlug, language);
    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    let deletedCount = 0;

    if (!existingPost.isTranslation) {
      // Delete original (cascades to translations)
      deletedCount = await deleteOriginalPost(existingPost.id);
    } else {
      // Delete single translation
      deletedCount = await deleteTranslation(existingPost.id);
    }

    // Revalidate paths
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");

    return {
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} post(s)`,
    };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}