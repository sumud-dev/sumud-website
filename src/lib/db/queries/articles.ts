/**
 * Article/Post Queries - Drizzle ORM
 */

import { db } from '@/src/lib/db';
import { posts, postTranslations } from '@/src/lib/db/schema';
import { eq, and, like, desc, or } from 'drizzle-orm';

export interface ArticleQueryOptions {
  search?: string;
  category?: string;
  status?: string;
  language?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

interface ArticleMetadata {
  category?: string;
  status?: string;
  featured?: boolean;
  [key: string]: unknown;
}

/**
 * Get articles with optional filters
 */
export async function getArticles(options: ArticleQueryOptions = {}) {
  const {
    search,
    language = 'en',
    page = 1,
    limit = 10,
  } = options;

  const offset = (page - 1) * limit;

  try {
    // Build the query
    const baseQuery = db
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
        // Translation fields
        title: postTranslations.title,
        excerpt: postTranslations.excerpt,
        content: postTranslations.content,
        language: postTranslations.language,
      })
      .from(posts)
      .innerJoin(
        postTranslations,
        eq(posts.id, postTranslations.postId)
      );

    // Build where condition
    const languageCondition = eq(postTranslations.language, language);
    
    const searchCondition = search
      ? or(
          like(postTranslations.title, `%${search}%`),
          like(postTranslations.excerpt, `%${search}%`)
        )
      : undefined;

    // Combine conditions
    const whereClause = searchCondition
      ? and(languageCondition, searchCondition)
      : languageCondition;

    const query = baseQuery.where(whereClause);

    // Apply pagination and sorting
    const articles = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return articles.map((article) => {
      const categories = article.categories as string[] | null;
      return {
        id: article.id,
        slug: article.slug,
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content,
        category: categories?.[0] || 'uncategorized',
        status: article.status || 'published',
        publishedAt: article.publishedAt || article.createdAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        featured: false,
        image: article.featuredImage,
        author: article.authorId
          ? {
              id: article.authorId,
              name: article.authorName || article.authorId,
            }
          : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string, language: string = 'en') {
  try {
    const article = await db
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

    if (!article || article.length === 0) {
      return null;
    }

    const data = article[0];
    const categories = data.categories as string[] | null;

    return {
      id: data.id,
      slug: data.slug,
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
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}
