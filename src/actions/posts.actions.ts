"use server";

import { revalidatePath } from "next/cache";
import {
  listPostsPaginated,
  findPostBySlug,
  findPostBySlugAndLanguage,
  getPostStatisticsByLanguage,
  postSlugExists,
  type PostQueryFilters,
  type PostPaginationOptions,
  type PaginatedPostResult,
  type PostRecord,
} from "@/src/lib/db/queries/posts.queries";
import {
  createOriginalPost,
  updateOriginalPost,
  deleteOriginalPost,
  deleteTranslation,
  createTranslationForPost,
} from "@/src/lib/db/queries/posts.mutations";
import {
  translateContent,
  ARTICLE_TRANSLATION_CONFIG,
  type SupportedLocale,
} from "@/src/lib/services/translation.service";
import { generateSlug } from "@/src/lib/utils/utils";

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
  articleLanguage?: string
): Promise<
  | { success: true; post: PostRecord }
  | { success: false; error: string }
> {
  try {
    const foundPost = articleLanguage
      ? await findPostBySlugAndLanguage(postSlug, articleLanguage)
      : await findPostBySlug(postSlug);

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
    // Check if slug exists
    const slugAlreadyExists = await postSlugExists(postInput.slug);
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

    const createdTranslations: PostRecord[] = [];

    // Auto-translate if requested
    if (postInput.autoTranslate && postInput.targetLanguages?.length) {
      const sourceLocale = postInput.language as SupportedLocale;
      const contentToTranslate = {
        title: postInput.title,
        content: postInput.content,
        excerpt: postInput.excerpt,
      };

      for (const targetLang of postInput.targetLanguages) {
        try {
          const { content: translatedContent, error: translationError } = await translateContent(
            contentToTranslate,
            sourceLocale,
            targetLang as SupportedLocale,
            ARTICLE_TRANSLATION_CONFIG
          );

          if (translationError) {
            console.warn(`Translation error for ${targetLang}:`, translationError);
            continue;
          }

          if (!translatedContent.title || !translatedContent.content || !translatedContent.excerpt) {
            console.warn(`Incomplete translation for ${targetLang}, skipping`);
            continue;
          }

          // Generate unique slug from translated title
          const translatedSlug = generateSlug(translatedContent.title as string);
          
          // Check if this slug already exists
          const slugExists = await postSlugExists(translatedSlug);
          if (slugExists) {
            console.warn(`Slug ${translatedSlug} already exists for ${targetLang}, skipping`);
            continue;
          }

          const translation = await createTranslationForPost({
            parentPostId: createdOriginal.id,
            slug: translatedSlug,
            title: translatedContent.title as string,
            excerpt: translatedContent.excerpt as string,
            content: translatedContent.content as string,
            language: targetLang,
            translatedFromLanguage: sourceLocale,
            type: postInput.type || 'article',
            status: postInput.status || 'draft',
            featuredImage: postInput.featuredImage,
            categories: postInput.categories || [],
            publishedAt: postInput.status === 'published' ? new Date() : null,
          });

          createdTranslations.push(translation);
        } catch (error) {
          console.error(`Failed to create translation for ${targetLang}:`, error);
        }
      }
    }

    // Revalidate paths
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");

    const successMessage =
      createdTranslations.length > 0
        ? `Post created with ${createdTranslations.length} translation(s)`
        : "Post created successfully";

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
    autoTranslate?: boolean;
    categories?: string[];
  },
  language: string 
): Promise<
  | { success: true; updatedPost: PostRecord; message: string }
  | { success: false; error: string }
> {
  try {
    const existingPost = await findPostBySlug(postSlug);
    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    // Only allow updating originals, not translations
    if (existingPost.isTranslation) {
      return {
        success: false,
        error: "Cannot update translations directly. Edit the original post instead.",
      };
    }

    const updatedPost = await updateOriginalPost(
      existingPost.id,
      {
        title: updateData.title,
        excerpt: updateData.excerpt,
        content: updateData.content,
        status: updateData.status,
        language: language,
        featuredImage: updateData.featured_image,
        categories: updateData.categories,
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
  postSlug: string
): Promise<
  | { success: true; deletedCount: number; message: string }
  | { success: false; error: string }
> {
  try {
    const existingPost = await findPostBySlug(postSlug);
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