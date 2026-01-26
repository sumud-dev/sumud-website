import { db } from "@/src/lib/db";
import { 
  postsUnifiedView,
  type PostUnifiedView 
} from "@/src/lib/db/schema/posts";
import { eq, and, or, like, desc, asc, sql, count, SQL } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export interface PostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  type: string;
  status: string;
  featuredImage: string | null;
  categories: string[];
  authorId: string | null;
  authorName: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  isTranslation: boolean;
  parentPostId: string | null;
  translatedFromLanguage: string | null;
  translationQuality: string | null;
}

export interface PostQueryFilters {
  status?: 'draft' | 'published' | 'archived';
  type?: 'article' | 'news';
  language?: string;
  search?: string;
  originalsOnly?: boolean; // Only user-created articles
  translationsOnly?: boolean; // Only AI translations
}

export interface PostPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPostResult {
  posts: PostRecord[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database view record to PostRecord
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

/**
 * Build WHERE clause from filters
 */
function buildPostWhereClause(filters: PostQueryFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.language) {
    conditions.push(eq(postsUnifiedView.postLanguage, filters.language));
  }

  if (filters.status) {
    conditions.push(eq(postsUnifiedView.postStatus, filters.status));
  }

  if (filters.type) {
    conditions.push(eq(postsUnifiedView.postType, filters.type));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(postsUnifiedView.postTitle, `%${filters.search}%`),
        like(postsUnifiedView.postExcerpt, `%${filters.search}%`)
      )!
    );
  }

  if (filters.originalsOnly) {
    conditions.push(eq(postsUnifiedView.postIsTranslation, false));
  }

  if (filters.translationsOnly) {
    conditions.push(eq(postsUnifiedView.postIsTranslation, true));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Get ORDER BY clause from pagination options
 */
function buildPostOrderByClause(options: PostPaginationOptions): SQL {
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  const columnMap = {
    createdAt: postsUnifiedView.postCreatedAt,
    publishedAt: postsUnifiedView.postPublishedAt,
    title: postsUnifiedView.postTitle,
    viewCount: postsUnifiedView.postViewCount,
  };

  const sortColumn = columnMap[sortBy];
  return sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
}

// ============================================================================
// OPTIMIZED QUERY FUNCTIONS
// ============================================================================

/**
 * List articles with pagination and filtering
 * Uses database view for optimal performance
 */
export async function listPostsPaginated(
  filters: PostQueryFilters = {},
  paginationOptions: PostPaginationOptions = {}
): Promise<PaginatedPostResult> {
  const currentPage = paginationOptions.page || 1;
  const pageSize = paginationOptions.limit || 50;
  const offset = (currentPage - 1) * pageSize;

  const whereClause = buildPostWhereClause(filters);
  const orderByClause = buildPostOrderByClause(paginationOptions);

  // Get total count (efficient with indexes)
  const countQuery = whereClause
    ? db.select({ totalCount: count() }).from(postsUnifiedView).where(whereClause)
    : db.select({ totalCount: count() }).from(postsUnifiedView);

  const [{ totalCount }] = await countQuery;
  const totalItems = Number(totalCount);
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get paginated results
  const postsQuery = whereClause
    ? db.select()
        .from(postsUnifiedView)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(pageSize)
        .offset(offset)
    : db.select()
        .from(postsUnifiedView)
        .orderBy(orderByClause)
        .limit(pageSize)
        .offset(offset);

  const postResults = await postsQuery;

  return {
    posts: postResults.map(normalizePostFromView),
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
}

/**
 * Find single article by slug
 * Optimized single query using view
 */
export async function findPostBySlug(
  postSlug: string
): Promise<PostRecord | null> {
  const [postResult] = await db
    .select()
    .from(postsUnifiedView)
    .where(eq(postsUnifiedView.postSlug, postSlug))
    .limit(1);

  return postResult ? normalizePostFromView(postResult) : null;
}

/**
 * Find post by slug and language
 */
export async function findPostBySlugAndLanguage(
  postSlug: string,
  postLanguage: string
): Promise<PostRecord | null> {
  const [postResult] = await db
    .select()
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postSlug, postSlug),
        eq(postsUnifiedView.postLanguage, postLanguage)
      )
    )
    .limit(1);

  return postResult ? normalizePostFromView(postResult) : null;
}

/**
 * Get featured articles (by view count)
 */
export async function getFeaturedPosts(
  postLanguage: string,
  postLimit: number = 5
): Promise<PostRecord[]> {
  const featuredResults = await db
    .select()
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postLanguage, postLanguage),
        eq(postsUnifiedView.postStatus, 'published')
      )
    )
    .orderBy(desc(postsUnifiedView.postViewCount))
    .limit(postLimit);
  return featuredResults.map(normalizePostFromView);
}

/**
 * Get recent published posts
 */
export async function getRecentPublishedPosts(
  postLanguage: string,
  postLimit: number = 10
): Promise<PostRecord[]> {
  const recentResults = await db
    .select()
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postLanguage, postLanguage),
        eq(postsUnifiedView.postStatus, 'published')
      )
    )
    .orderBy(desc(postsUnifiedView.postPublishedAt))
    .limit(postLimit);

  return recentResults.map(normalizePostFromView);
}

/**
 * Search articles with full-text search
 * Uses PostgreSQL's built-in full-text search for performance
 */
export async function searchArticlesFullText(
  searchQuery: string,
  postLanguage: string,
  searchLimit: number = 20
): Promise<PostRecord[]> {
  const searchResults = await db
    .select()
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postLanguage, postLanguage),
        eq(postsUnifiedView.postStatus, 'published'),
        sql`to_tsvector('simple', ${postsUnifiedView.postTitle} || ' ' || ${postsUnifiedView.postExcerpt}) 
            @@ plainto_tsquery('simple', ${searchQuery})`
      )
    )
    .orderBy(desc(postsUnifiedView.postPublishedAt))
    .limit(searchLimit);

  return searchResults.map(normalizePostFromView);
}

/**
 * Get post statistics for a language
 * Single efficient query with aggregation
 */
export async function getPostStatisticsByLanguage(
  postLanguage: string
): Promise<{
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  originalPosts: number;
  translatedPosts: number;
}> {
  const [statisticsResult] = await db
    .select({
      totalPosts: count(),
      publishedPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postStatus} = 'published')`,
      draftPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postStatus} = 'draft')`,
      archivedPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postStatus} = 'archived')`,
      originalPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postIsTranslation} = false)`,
      translatedPosts: sql<number>`COUNT(*) FILTER (WHERE ${postsUnifiedView.postIsTranslation} = true)`,
    })
    .from(postsUnifiedView)
    .where(eq(postsUnifiedView.postLanguage, postLanguage));

  return {
    totalPosts: Number(statisticsResult.totalPosts),
    publishedPosts: Number(statisticsResult.publishedPosts),
    draftPosts: Number(statisticsResult.draftPosts),
    archivedPosts: Number(statisticsResult.archivedPosts),
    originalPosts: Number(statisticsResult.originalPosts),
    translatedPosts: Number(statisticsResult.translatedPosts),
  };
}

/**
 * Get all translations for an original post
 */
export async function findTranslationsForOriginalPost(
  originalPostId: string
): Promise<PostRecord[]> {
  const translationResults = await db
    .select()
    .from(postsUnifiedView)
    .where(
      and(
        eq(postsUnifiedView.postParentPostId, originalPostId),
        eq(postsUnifiedView.postIsTranslation, true)
      )
    );

  return translationResults.map(normalizePostFromView);
}

/**
 * Check if article slug exists
 */
export async function postSlugExists(postSlug: string): Promise<boolean> {
  const existingPost = await findPostBySlug(postSlug);
  return existingPost !== null;
}
