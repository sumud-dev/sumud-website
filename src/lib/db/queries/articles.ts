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
    if (language === 'fi') {
      // For Finnish: Query both posts table and postTranslations table
      // First, get from posts table
      const postsResults = await db
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
            eq(posts.language, 'fi'),
            search
              ? or(
                  like(posts.title, `%${search}%`),
                  like(posts.excerpt, `%${search}%`)
                )
              : undefined
          )
        )
        .orderBy(desc(posts.createdAt));

      // Get from postTranslations table
      const translationsResults = await db
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
            eq(postTranslations.language, 'fi'),
            search
              ? or(
                  like(postTranslations.title, `%${search}%`),
                  like(postTranslations.excerpt, `%${search}%`)
                )
              : undefined
          )
        )
        .orderBy(desc(postTranslations.createdAt));

      // Deduplicate by slug
      const slugMap = new Map();
      postsResults.forEach(post => {
        if (post.slug) {
          slugMap.set(post.slug, post);
        }
      });
      translationsResults.forEach(translation => {
        if (translation.slug && !slugMap.has(translation.slug)) {
          slugMap.set(translation.slug, translation);
        }
      });

      // Sort, paginate, and transform
      const combined = Array.from(slugMap.values())
        .sort((a, b) => {
          const aDate = a.publishedAt || a.createdAt;
          const bDate = b.publishedAt || b.createdAt;
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        })
        .slice(offset, offset + limit);

      return combined.map((article) => {
        const categories = article.categories as string[] | null;
        return {
          id: article.id,
          slug: article.slug!,
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
    }

    // For other languages: use JOIN query
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
    if (language === 'fi') {
      // For Finnish: Check posts table first, then postTranslations
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

      // If found in posts table, return it
      if (postsResult && postsResult.length > 0) {
        const data = postsResult[0];
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
      }

      // If not found in posts table, check postTranslations
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

      if (!translationsResult || translationsResult.length === 0) {
        return null;
      }

      const data = translationsResult[0];
      const categories = data.categories as string[] | null;

      return {
        id: data.id,
        slug: data.slug!,
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

    // For other languages (en, ar): First try postTranslations only (articles created directly in this language)
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

    if (translationOnlyResult && translationOnlyResult.length > 0) {
      const data = translationOnlyResult[0];
      const categories = data.categories as string[] | null;

      return {
        id: data.id,
        slug: data.slug!,
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

    // Then try JOIN query (articles created in Finnish and translated)
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
