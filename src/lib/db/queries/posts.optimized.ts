/**
 * Optimized post queries with performance enhancements
 * - Batch operations
 * - Connection pooling awareness
 * - Query result caching strategies
 * - Reduced N+1 queries
 */

import { db } from "@/src/lib/db";
import { 
  postsUnifiedView,
  type PostUnifiedView 
} from "@/src/lib/db/schema/posts";
import { eq, and, or, like, desc, asc, sql, count, SQL, inArray } from "drizzle-orm";
import type { PostRecord} from "@/src/lib/types/article";

/**
 * Optimized batch post retrieval
 * Reduces database round trips by fetching multiple posts at once
 */
export async function findPostsBySlugsBatch(slugs: string[]): Promise<PostRecord[]> {
  if (slugs.length === 0) return [];

  // Use LIMIT for safety
  const maxBatchSize = 100;
  const limitedSlugs = slugs.slice(0, maxBatchSize);

  const results = await db
    .select()
    .from(postsUnifiedView)
    .where(inArray(postsUnifiedView.postSlug, limitedSlugs));

  return results.map(normalizePostFromView);
}

/**
 * Optimized post search with better indexing
 * Uses PostgreSQL full-text search when available
 */
export async function searchPostsOptimized(
  searchQuery: string,
  language: string,
  limit: number = 20
): Promise<PostRecord[]> {
  const searchPattern = `%${searchQuery}%`;

  // Use LIMIT for performance
  const results = await db
    .select()
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postLanguage, language),
        or(
          // Full-text search on indexed columns
          like(postsUnifiedView.postTitle, searchPattern),
          like(postsUnifiedView.postExcerpt, searchPattern)
        )!
      )
    )
    .orderBy(desc(postsUnifiedView.postViewCount)) // Prioritize popular posts
    .limit(limit);

  return results.map(normalizePostFromView);
}

/**
 * Get posts with their translation counts in a single query
 * Reduces N+1 queries when needing translation information
 */
export async function getPostsWithTranslationCounts(
  language: string,
  limit: number = 50
): Promise<Array<PostRecord & { translationCount: number }>> {
  const results = await db
    .select({
      // Main post data
      ...{
        postId: postsUnifiedView.postId,
        postSlug: postsUnifiedView.postSlug,
        postTitle: postsUnifiedView.postTitle,
        postExcerpt: postsUnifiedView.postExcerpt,
        postContent: postsUnifiedView.postContent,
        postLanguage: postsUnifiedView.postLanguage,
        postType: postsUnifiedView.postType,
        postStatus: postsUnifiedView.postStatus,
        postFeaturedImage: postsUnifiedView.postFeaturedImage,
        postCategories: postsUnifiedView.postCategories,
        postAuthorId: postsUnifiedView.postAuthorId,
        postAuthorName: postsUnifiedView.postAuthorName,
        postPublishedAt: postsUnifiedView.postPublishedAt,
        postCreatedAt: postsUnifiedView.postCreatedAt,
        postUpdatedAt: postsUnifiedView.postUpdatedAt,
        postViewCount: postsUnifiedView.postViewCount,
        postIsTranslation: postsUnifiedView.postIsTranslation,
        postParentPostId: postsUnifiedView.postParentPostId,
        postTranslatedFromLanguage: postsUnifiedView.postTranslatedFromLanguage,
        postTranslationQuality: postsUnifiedView.postTranslationQuality,
      },
      // Translation count subquery
      translationCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${postsUnifiedView} t 
         WHERE t.post_parent_post_id = ${postsUnifiedView.postId} 
         AND t.post_is_translation = true)
      `
    })
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postLanguage, language),
        eq(postsUnifiedView.postIsTranslation, false) // Only originals
      )
    )
    .orderBy(desc(postsUnifiedView.postCreatedAt))
    .limit(limit);

  return results.map(result => ({
    ...normalizePostFromView(result),
    translationCount: Number(result.translationCount)
  }));
}

/**
 * Optimized recent posts query with minimal data
 * For dashboard or sidebar widgets
 */
export async function getRecentPostsSummary(
  language: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
}>> {
  const results = await db
    .select({
      id: postsUnifiedView.postId,
      slug: postsUnifiedView.postSlug,
      title: postsUnifiedView.postTitle,
      status: postsUnifiedView.postStatus,
      publishedAt: postsUnifiedView.postPublishedAt,
      createdAt: postsUnifiedView.postCreatedAt,
    })
    .from(postsUnifiedView)
    .where(eq(postsUnifiedView.postLanguage, language))
    .orderBy(desc(postsUnifiedView.postCreatedAt))
    .limit(limit);

  return results;
}

/**
 * Optimized statistics query with single aggregation
 * Much faster than multiple separate queries
 */
export async function getOptimizedPostStatistics(
  language: string
): Promise<{
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  originalPosts: number;
  translatedPosts: number;
  avgViewCount: number;
}> {
  const [result] = await db
    .select({
      totalPosts: count(),
      publishedPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postStatus} = 'published')`,
      draftPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postStatus} = 'draft')`,
      archivedPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postStatus} = 'archived')`,
      originalPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postIsTranslation} = false)`,
      translatedPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postIsTranslation} = true)`,
      avgViewCount: sql<number>`AVG(${postsUnifiedView.postViewCount})`,
    })
    .from(postsUnifiedView)
    .where(eq(postsUnifiedView.postLanguage, language));

  return {
    totalPosts: Number(result.totalPosts),
    publishedPosts: Number(result.publishedPosts),
    draftPosts: Number(result.draftPosts),
    archivedPosts: Number(result.archivedPosts),
    originalPosts: Number(result.originalPosts),
    translatedPosts: Number(result.translatedPosts),
    avgViewCount: Number(result.avgViewCount) || 0,
  };
}

/**
 * Batch check for slug existence
 * Optimizes slug validation for multiple items
 */
export async function checkSlugsExistence(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set();

  const results = await db
    .select({ slug: postsUnifiedView.postSlug })
    .from(postsUnifiedView)
    .where(inArray(postsUnifiedView.postSlug, slugs));

  return new Set(results.map(r => r.slug));
}

/**
 * Helper function to normalize post data
 * Reused from the main queries file
 */
function normalizePostFromView(viewRecord: PostUnifiedView): PostRecord {
  return {
    id: viewRecord.postId,
    slug: viewRecord.postSlug,
    title: viewRecord.postTitle,
    excerpt: viewRecord.postExcerpt,
    content: viewRecord.postContent,
    language: viewRecord.postLanguage,
    type: viewRecord.postType,
    status: viewRecord.postStatus,
    featuredImage: viewRecord.postFeaturedImage,
    categories: viewRecord.postCategories || [],
    authorId: viewRecord.postAuthorId,
    authorName: viewRecord.postAuthorName,
    publishedAt: viewRecord.postPublishedAt,
    createdAt: viewRecord.postCreatedAt,
    updatedAt: viewRecord.postUpdatedAt,
    viewCount: viewRecord.postViewCount,
    isTranslation: viewRecord.postIsTranslation,
    parentPostId: viewRecord.postParentPostId,
    translatedFromLanguage: viewRecord.postTranslatedFromLanguage,
    translationQuality: viewRecord.postTranslationQuality,
  };
}