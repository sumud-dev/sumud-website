import { db } from "@/src/lib/db";
import { eq, and, desc, asc, sql, count, or, ilike } from "drizzle-orm";
import { posts } from "@/src/lib/db/schema/posts";
import type { 
  PostRecord, 
  PostQueryFilters,
  PostPaginationOptions, 
  PaginatedPostResult 
} from "@/src/lib/types/article";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database post record to PostRecord
 */
function normalizePost(post: typeof posts.$inferSelect): PostRecord {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    language: post.language,
    type: post.type,
    status: post.status,
    featuredImage: post.featuredImage,
    categories: post.categories || [],
    authorId: post.authorId,
    authorName: post.authorName,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    isTranslation: post.isTranslation,
    parentPostId: post.parentPostId,
    translatedFromLanguage: post.translatedFrom,
    translationQuality: null,
  };
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

  // Build WHERE conditions
  const conditions = [];
  
  if (filters.language) {
    conditions.push(eq(posts.language, filters.language));
  }
  
  if (filters.status) {
    conditions.push(eq(posts.status, filters.status));
  }
  
  if (filters.type) {
    conditions.push(eq(posts.type, filters.type));
  }
  
  if (filters.originalsOnly) {
    conditions.push(eq(posts.isTranslation, false));
  }
  
  if (filters.translationsOnly) {
    conditions.push(eq(posts.isTranslation, true));
  }
  
  if (filters.search) {
    conditions.push(
      or(
        ilike(posts.title, `%${filters.search}%`),
        ilike(posts.excerpt, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count with filters 
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(posts)
    .where(whereClause);
    
  const totalItems = Number(totalCount);
  const totalPages = Math.ceil(totalItems / pageSize);

  // Determine sort column and order
  const sortColumn = paginationOptions.sortBy || 'publishedAt';
  const sortOrder = paginationOptions.sortOrder || 'desc';
  
  const orderByClause = sortOrder === 'asc' 
    ? asc(posts[sortColumn]) 
    : desc(posts[sortColumn]);

  // Get paginated results with filters
  const postResults = await db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(pageSize)
    .offset(offset);

  return {
    posts: postResults.map(normalizePost),
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
 * Find post by slug and language
 */
export async function findPostBySlugAndLanguage(
  postSlug: string,
  postLanguage: string
): Promise<PostRecord | null> {
  const [postResult] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, postSlug),
        eq(posts.language, postLanguage)
      )
    )
    .limit(1);

  return postResult ? normalizePost(postResult) : null;
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
    .from(posts)
    .where(
      and(
        eq(posts.language, postLanguage),
        eq(posts.status, 'published'),
        sql`to_tsvector('simple', ${posts.title} || ' ' || ${posts.excerpt}) 
            @@ plainto_tsquery('simple', ${searchQuery})`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(searchLimit);

  return searchResults.map(normalizePost);
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
      publishedPosts: sql<number>`COUNT(*) FILTER (WHERE ${posts.status} = 'published')`,
      draftPosts: sql<number>`COUNT(*) FILTER (WHERE ${posts.status} = 'draft')`,
      archivedPosts: sql<number>`COUNT(*) FILTER (WHERE ${posts.status} = 'archived')`,
      originalPosts: sql<number>`COUNT(*) FILTER (WHERE ${posts.isTranslation} = false)`,
      translatedPosts: sql<number>`COUNT(*) FILTER (WHERE ${posts.isTranslation} = true)`,
    })
    .from(posts)
    .where(eq(posts.language, postLanguage));

  return {
    totalPosts: Number(statisticsResult.totalPosts),
    publishedPosts: Number(statisticsResult.publishedPosts),
    draftPosts: Number(statisticsResult.draftPosts),
    archivedPosts: Number(statisticsResult.archivedPosts),
    originalPosts: Number(statisticsResult.originalPosts),
    translatedPosts: Number(statisticsResult.translatedPosts),
  };
}

export async function postSlugExists(
  slug: string,
  postLanguage: string
): Promise<boolean> {
  const [result] = await db
    .select({ count: count() })
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.language, postLanguage)
      )
    );

  return Number(result.count) > 0;
}