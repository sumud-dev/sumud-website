"use server";

import { db } from "@/src/lib/db";
import { posts, postTranslations } from "@/src/lib/db/schema";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  translateContentToAllLocales,
  ARTICLE_TRANSLATION_CONFIG,
  type SupportedLocale,
} from "@/src/lib/services/translation.service";
import { getArticles, type ArticleQueryOptions } from "@/src/lib/db/queries/articles";

export interface GetPostsOptions {
  search?: string;
  status?: "draft" | "published" | "archived";
  type?: "article" | "news";
  language?: string;
  page?: number;
  limit?: number;
}

/**
 * Get articles with filters - wrapper around query function
 */
export async function getArticlesAction(options: ArticleQueryOptions = {}) {
  try {
    const result = await getArticles(options);
    return {
      success: true,
      data: result.articles,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : "Failed to fetch articles",
    };
  }
}

export interface PostWithCategory {
  id: string;
  title: string | null;
  slug: string;
  status: string | null;
  published_at: string | null;
  updated_at: string | null;
  excerpt: string | null;
  category?: { name: string } | null;
  type: string | null;
  authorName: string | null;
  featuredImage: string | null;
}

export async function getPosts(options: GetPostsOptions = {}) {
  const {
    search,
    status,
    type,
    language = "en",
    page = 1,
    limit = 50,
  } = options;

  try {
    const offset = (page - 1) * limit;

    // Build conditions based on filters
    const conditions = [];
    
    if (status) {
      conditions.push(eq(language === 'fi' ? posts.status : postTranslations.status, status));
    }
    
    if (type) {
      conditions.push(eq(language === 'fi' ? posts.type : postTranslations.type, type));
    }
    
    if (search) {
      const searchCondition = or(
        like(language === 'fi' ? posts.title : postTranslations.title, `%${search}%`),
        like(language === 'fi' ? posts.excerpt : postTranslations.excerpt, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    // Execute query based on language
    let results;
    
    if (language === 'fi') {
      // For Finnish: Query posts table directly
      // Add language filter for Finnish posts
      conditions.push(eq(posts.language, 'fi'));
      
      const query = db
        .select()
        .from(posts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
        
      results = await query;
    } else {
      // For other languages (en, ar): Query postTranslations table
      conditions.push(eq(postTranslations.language, language));
      
      const query = db
        .select()
        .from(postTranslations)
        .where(and(...conditions))
        .orderBy(desc(postTranslations.publishedAt), desc(postTranslations.createdAt))
        .limit(limit)
        .offset(offset);
        
      results = await query;
    }

    // Transform results to match expected format
    const transformedPosts: PostWithCategory[] = results.map((post) => {
      // Parse categories - it could be a JSON array or object
      let categoryName = "Uncategorized";
      if (post.categories) {
        const cats = post.categories as string[] | { name: string }[];
        if (Array.isArray(cats) && cats.length > 0) {
          categoryName = typeof cats[0] === "string" ? cats[0] : cats[0]?.name || "Uncategorized";
        }
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        published_at: post.publishedAt?.toISOString() ?? null,
        updated_at: post.updatedAt?.toISOString() ?? null,
        excerpt: post.excerpt,
        category: { name: categoryName },
        type: post.type,
        authorName: post.authorName,
        featuredImage: post.featuredImage,
      };
    });

    return { 
      success: true, 
      posts: transformedPosts,
      total: transformedPosts.length,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { 
      success: false, 
      posts: [], 
      error: error instanceof Error ? error.message : "Failed to fetch posts" 
    };
  }
}

export async function getPostBySlug(slug: string, language: string = "en") {
  try {
    let result;
    
    if (language === 'fi') {
      // For Finnish: Query posts table directly
      result = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);
    } else {
      // For other languages: Query postTranslations table
      result = await db
        .select()
        .from(postTranslations)
        .where(
          and(
            eq(postTranslations.slug, slug),
            eq(postTranslations.language, language)
          )
        )
        .limit(1);
    }

    if (result.length === 0) {
      return { success: false, post: null, error: "Post not found" };
    }

    const post = result[0];
    
    return {
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        type: post.type,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        categories: post.categories,
        authorId: post.authorId,
        authorName: post.authorName,
        viewCount: post.viewCount,
        published_at: post.publishedAt?.toISOString() ?? null,
        updated_at: post.updatedAt?.toISOString() ?? null,
      },
    };
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return { 
      success: false, 
      post: null, 
      error: error instanceof Error ? error.message : "Failed to fetch post" 
    };
  }
}

export async function getPostStats(language: string = "en") {
  try {
    let allPosts;
    
    if (language === 'fi') {
      // For Finnish: Query posts table
      allPosts = await db
        .select({
          status: posts.status,
        })
        .from(posts)
        .where(eq(posts.language, 'fi'));
    } else {
      // For other languages: Query postTranslations table
      allPosts = await db
        .select({
          status: postTranslations.status,
        })
        .from(postTranslations)
        .where(eq(postTranslations.language, language));
    }

    const stats = {
      total: allPosts.length,
      published: allPosts.filter((p) => p.status === "published").length,
      drafts: allPosts.filter((p) => p.status === "draft").length,
      archived: allPosts.filter((p) => p.status === "archived").length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Error fetching post stats:", error);
    return { 
      success: false, 
      stats: { total: 0, published: 0, drafts: 0, archived: 0 },
      error: error instanceof Error ? error.message : "Failed to fetch stats" 
    };
  }
}

export async function deletePost(slug: string) {
  try {
    // Delete from posts table (Finnish posts)
    await db.delete(posts).where(eq(posts.slug, slug));
    
    // Delete from postTranslations table (other language translations)
    await db.delete(postTranslations).where(eq(postTranslations.slug, slug));

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete post" 
    };
  }
}

export async function updatePost(
  slug: string, 
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    status?: "draft" | "published" | "archived";
    featured_image?: string | null;
    meta_description?: string | null;
  },
  language: string = "en"
) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured_image !== undefined) updateData.featuredImage = data.featured_image;

    // Update in the appropriate table based on language
    if (language === "fi") {
      await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.slug, slug));
    } else {
      await db
        .update(postTranslations)
        .set(updateData)
        .where(
          and(
            eq(postTranslations.slug, slug),
            eq(postTranslations.language, language)
          )
        );
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update post" 
    };
  }
}

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  language: string;
  featured_image?: string | null;
  categories?: string[];
  authorId?: string;
  authorName?: string;
  autoTranslate?: boolean;
}

export async function createPost(data: CreatePostData) {
  try {
    const now = new Date();
    const publishedAt = data.status === "published" ? now : null;
    const sourceLocale = data.language as SupportedLocale;
    const createdPosts: { language: string; slug: string }[] = [];

    // Base post data for insertion
    const basePostData = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      type: "article" as const,
      status: data.status,
      featuredImage: data.featured_image || null,
      categories: data.categories || [],
      authorId: data.authorId || null,
      authorName: data.authorName || null,
      publishedAt,
      createdAt: now,
      updatedAt: now,
    };

    // Insert the source language post
    if (data.language === "fi") {
      await db.insert(posts).values({
        ...basePostData,
        language: data.language,
      });
    } else {
      await db.insert(postTranslations).values({
        ...basePostData,
        language: data.language,
      });
    }
    createdPosts.push({ language: data.language, slug: data.slug });

    // Auto-translate if enabled
    if (data.autoTranslate) {
      try {
        const contentToTranslate = {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
        };

        const { translations, error: translationError } = await translateContentToAllLocales(
          contentToTranslate,
          sourceLocale,
          ARTICLE_TRANSLATION_CONFIG
        );

        if (translationError) {
          console.warn("Translation warning:", translationError);
        }

        // Insert translated versions for other locales
        const targetLocales = (["en", "fi", "ar"] as SupportedLocale[]).filter(
          (locale) => locale !== sourceLocale
        );

        for (const targetLocale of targetLocales) {
          const translatedContent = translations[targetLocale];
          if (!translatedContent || !translatedContent.title) {
            console.warn(`Skipping ${targetLocale} - no translation available`);
            continue;
          }

          const translatedPostData = {
            ...basePostData,
            language: targetLocale,
            title: translatedContent.title as string,
            content: translatedContent.content as string,
            excerpt: translatedContent.excerpt as string,
          };

          if (targetLocale === "fi") {
            await db.insert(posts).values(translatedPostData);
          } else {
            await db.insert(postTranslations).values(translatedPostData);
          }
          createdPosts.push({ language: targetLocale, slug: data.slug });
        }
      } catch (translationError) {
        console.error("Auto-translation failed:", translationError);
        // Continue without translation - don't fail the entire operation
      }
    }

    // Revalidate paths
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");

    return { 
      success: true, 
      slug: data.slug,
      createdPosts,
      message: createdPosts.length > 1 
        ? `Article created with ${createdPosts.length} language versions`
        : "Article created successfully",
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create post" 
    };
  }
}
