/**
 * Article/Post Queries - Drizzle ORM
 */

import { db } from '@/src/lib/db';
import { posts, postTranslations } from '@/src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ArticleQueryOptions {
  search?: string;
  category?: string;
  status?: string;
  language?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

/**
 * Get a single article by slug
 */
interface ArticleData {
  id: string;
  slug: string | null;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  authorId: string | null;
  authorName: string | null;
  featuredImage: string | null;
  status: string | null;
  categories: unknown;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  viewCount: number | null;
  language: string | null;
}

function transformArticleData(data: ArticleData) {
  const categories = Array.isArray(data.categories) 
    ? data.categories as string[] 
    : null;

  return {
    id: data.id,
    slug: data.slug || '',
    title: data.title || '',
    excerpt: data.excerpt || '',
    content: data.content,
    category: categories?.[0] || 'uncategorized',
    status: data.status || 'published',
    publishedAt: data.publishedAt || data.createdAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    featured: false,
    image: data.featuredImage,
    author: data.authorId
      ? {
          id: data.authorId,
          name: data.authorName || data.authorId,
        }
      : undefined,
  };
}

export async function getArticleBySlug(slug: string, language: string = 'en') {
  try {
    if (language === 'fi') {
      // For Finnish: Check posts table first (original Finnish content)
      const postsResult = await db
        .select({
          id: posts.id,
          slug: posts.slug,
          authorId: posts.authorId,
          authorName: posts.authorName,
          featuredImage: posts.featuredImage,
          status: posts.status,
          categories: posts.categories,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          publishedAt: posts.publishedAt,
          viewCount: posts.viewCount,
          title: posts.title,
          excerpt: posts.excerpt,
          content: posts.content,
          language: posts.language,
        })
        .from(posts)
        .where(
          and(
            eq(posts.slug, slug),
            eq(posts.language, 'fi')
          )
        )
        .limit(1);

      if (postsResult.length > 0) {
        return transformArticleData(postsResult[0]);
      }

      // If not found, check postTranslations (Finnish translations of other content)
      const translationsResult = await db
        .select({
          id: postTranslations.id,
          slug: postTranslations.slug,
          authorId: postTranslations.authorId,
          authorName: postTranslations.authorName,
          featuredImage: postTranslations.featuredImage,
          status: postTranslations.status,
          categories: postTranslations.categories,
          createdAt: postTranslations.createdAt,
          updatedAt: postTranslations.updatedAt,
          publishedAt: postTranslations.publishedAt,
          viewCount: postTranslations.viewCount,
          title: postTranslations.title,
          excerpt: postTranslations.excerpt,
          content: postTranslations.content,
          language: postTranslations.language,
        })
        .from(postTranslations)
        .where(
          and(
            eq(postTranslations.slug, slug),
            eq(postTranslations.language, 'fi')
          )
        )
        .limit(1);

      if (translationsResult.length > 0) {
        return transformArticleData(translationsResult[0]);
      }

      return null;
    }

    // For non-Finnish languages (en, ar, etc.)
    // First try: Direct translations in postTranslations table
    const translationOnlyResult = await db
      .select({
        id: postTranslations.id,
        slug: postTranslations.slug,
        authorId: postTranslations.authorId,
        authorName: postTranslations.authorName,
        featuredImage: postTranslations.featuredImage,
        status: postTranslations.status,
        categories: postTranslations.categories,
        createdAt: postTranslations.createdAt,
        updatedAt: postTranslations.updatedAt,
        publishedAt: postTranslations.publishedAt,
        viewCount: postTranslations.viewCount,
        title: postTranslations.title,
        excerpt: postTranslations.excerpt,
        content: postTranslations.content,
        language: postTranslations.language,
      })
      .from(postTranslations)
      .where(
        and(
          eq(postTranslations.slug, slug),
          eq(postTranslations.language, language)
        )
      )
      .limit(1);

    if (translationOnlyResult.length > 0) {
      return transformArticleData(translationOnlyResult[0]);
    }

    // Second try: JOIN query (Finnish posts with translations)
    const joinResult = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        authorId: posts.authorId,
        authorName: posts.authorName,
        featuredImage: posts.featuredImage,
        status: posts.status,
        categories: posts.categories,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        viewCount: posts.viewCount,
        title: postTranslations.title,
        excerpt: postTranslations.excerpt,
        content: postTranslations.content,
        language: postTranslations.language,
      })
      .from(posts)
      .innerJoin(
        postTranslations,
        eq(posts.id, postTranslations.postId)
      )
      .where(
        and(
          eq(posts.slug, slug),
          eq(postTranslations.language, language)
        )
      )
      .limit(1);

    if (joinResult.length > 0) {
      return transformArticleData(joinResult[0]);
    }

    return null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}
