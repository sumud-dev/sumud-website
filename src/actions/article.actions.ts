"use server";

import { db } from "@/src/lib/db";
import { posts, postTranslations } from "@/src/lib/db/schema";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  translateContentToAllLocales,
  translateText,
  ARTICLE_TRANSLATION_CONFIG,
  type SupportedLocale,
} from "@/src/lib/services/translation.service";
import { getArticles, type ArticleQueryOptions } from "@/src/lib/db/queries/articles";

/**
 * Generate a URL-friendly slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Check if a slug already exists in the database for a specific language
 */
async function slugExistsForLanguage(slug: string, language: string): Promise<boolean> {
  if (language === "fi") {
    // Check posts table for Finnish articles
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    if (existing.length > 0) return true;
    
    // Also check postTranslations table for Finnish articles
    const existingTranslation = await db
      .select({ id: postTranslations.id })
      .from(postTranslations)
      .where(
        and(
          eq(postTranslations.slug, slug),
          eq(postTranslations.language, "fi")
        )
      )
      .limit(1);
    if (existingTranslation.length > 0) return true;
    
    return false;
  }
  
  // For EN/AR: Check postTranslations table
  const existingTranslation = await db
    .select({ id: postTranslations.id })
    .from(postTranslations)
    .where(
      and(
        eq(postTranslations.slug, slug),
        eq(postTranslations.language, language)
      )
    )
    .limit(1);
  
  return existingTranslation.length > 0;
}

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
      data: result,
      total: result.length,
      page: options.page || 1,
      limit: options.limit || 10,
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
      // For Finnish: Query both posts table and postTranslations table
      // First, get from posts table
      const postsConditions = [...conditions, eq(posts.language, 'fi')];
      const postsResults = await db
        .select()
        .from(posts)
        .where(postsConditions.length > 0 ? and(...postsConditions) : undefined)
        .orderBy(desc(posts.publishedAt), desc(posts.createdAt));
      
      // Also get from postTranslations table (for Finnish articles created there)
      const translationsConditions = [];
      if (status) {
        translationsConditions.push(eq(postTranslations.status, status));
      }
      if (type) {
        translationsConditions.push(eq(postTranslations.type, type));
      }
      if (search) {
        const searchCondition = or(
          like(postTranslations.title, `%${search}%`),
          like(postTranslations.excerpt, `%${search}%`)
        );
        if (searchCondition) translationsConditions.push(searchCondition);
      }
      translationsConditions.push(eq(postTranslations.language, 'fi'));
      
      const translationsResults = await db
        .select()
        .from(postTranslations)
        .where(and(...translationsConditions))
        .orderBy(desc(postTranslations.publishedAt), desc(postTranslations.createdAt));

      // Combine and deduplicate results by slug, then sort and paginate
      const slugMap = new Map();
      
      // Add posts table results first (give priority to posts table)
      postsResults.forEach(post => {
        if (post.slug) {
          slugMap.set(post.slug, post);
        }
      });
      
      // Add translations that don't already exist
      translationsResults.forEach(translation => {
        if (translation.slug && !slugMap.has(translation.slug)) {
          slugMap.set(translation.slug, translation);
        }
      });
      
      // Convert map to array and sort by publishedAt/createdAt
      const combined = Array.from(slugMap.values()).sort((a, b) => {
        const aDate = a.publishedAt || a.createdAt;
        const bDate = b.publishedAt || b.createdAt;
        return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
      });
      
      // Apply pagination after combining and sorting
      results = combined.slice(offset, offset + limit);
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
    const transformedPosts: PostWithCategory[] = results
      .filter((post) => post.slug && post.title) // Filter out posts without slug or title
      .map((post) => {
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
          slug: post.slug!,
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
      // For Finnish: Check posts table first, then postTranslations
      result = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);
      
      // If not found in posts table, check postTranslations
      if (result.length === 0) {
        result = await db
          .select()
          .from(postTranslations)
          .where(
            and(
              eq(postTranslations.slug, slug),
              eq(postTranslations.language, 'fi')
            )
          )
          .limit(1);
      }
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
        coverImage: post.featuredImage, // Map to coverImage for UI consistency
        featuredImage: post.featuredImage,
        categories: post.categories,
        authorId: post.authorId,
        authorName: post.authorName,
        author_name: post.authorName, // Map to author_name for UI consistency
        language: language, // Include the language used to fetch the post
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
      // For Finnish: Query both posts table and postTranslations table
      const postsResults = await db
        .select({
          slug: posts.slug,
          status: posts.status,
        })
        .from(posts)
        .where(eq(posts.language, 'fi'));
      
      const translationsResults = await db
        .select({
          slug: postTranslations.slug,
          status: postTranslations.status,
        })
        .from(postTranslations)
        .where(eq(postTranslations.language, 'fi'));
      
      // Deduplicate by slug (prioritize posts table)
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
      
      allPosts = Array.from(slugMap.values());
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

    // Revalidate paths for all locales
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");
    revalidatePath(`/[locale]/articles/${slug}`, "page");

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
    language?: string;
    autoTranslate?: boolean;
  },
  language: string = "en"
) {
  try {
    const now = new Date();
    const updateData: any = {
      updatedAt: now,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured_image !== undefined) updateData.featuredImage = data.featured_image;

    // Use the language from data if provided, otherwise use the parameter
    const targetLanguage = data.language || language;

    // For Finnish: Update posts table
    // For English/Arabic: Update postTranslations table
    if (targetLanguage === "fi") {
      // Check if Finnish post exists in posts table
      const [existingPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existingPost) {
        await db
          .update(posts)
          .set(updateData)
          .where(eq(posts.slug, slug));
      } else {
        // Check postTranslations for Finnish version (legacy data)
        const [existingTranslation] = await db
          .select()
          .from(postTranslations)
          .where(
            and(
              eq(postTranslations.slug, slug),
              eq(postTranslations.language, "fi")
            )
          )
          .limit(1);

        if (existingTranslation) {
          await db
            .update(postTranslations)
            .set(updateData)
            .where(
              and(
                eq(postTranslations.slug, slug),
                eq(postTranslations.language, "fi")
              )
            );
        } else {
          return { success: false, error: "Finnish post not found" };
        }
      }
    } else {
      // For English/Arabic: Update postTranslations table
      const [existingTranslation] = await db
        .select()
        .from(postTranslations)
        .where(
          and(
            eq(postTranslations.slug, slug),
            eq(postTranslations.language, targetLanguage)
          )
        )
        .limit(1);

      if (existingTranslation) {
        await db
          .update(postTranslations)
          .set(updateData)
          .where(
            and(
              eq(postTranslations.slug, slug),
              eq(postTranslations.language, targetLanguage)
            )
          );
      } else {
        // Create new translation - need to find base post or any existing translation for metadata
        const [basePost] = await db
          .select()
          .from(posts)
          .where(eq(posts.slug, slug))
          .limit(1);

        // If no base post, look for any existing translation
        let metadata = basePost;
        if (!metadata) {
          const [anyTranslation] = await db
            .select()
            .from(postTranslations)
            .where(eq(postTranslations.slug, slug))
            .limit(1);
          metadata = anyTranslation as any;
        }

        if (!metadata) {
          return { success: false, error: "No existing article found to update" };
        }

        await db.insert(postTranslations).values({
          postId: basePost?.id || null,
          slug,
          language: targetLanguage,
          title: data.title || metadata.title || "",
          excerpt: data.excerpt || metadata.excerpt || "",
          content: data.content || metadata.content || "",
          type: "article",
          status: data.status || metadata.status || "draft",
          featuredImage: data.featured_image !== undefined ? data.featured_image : metadata.featuredImage,
          categories: metadata.categories || [],
          authorId: metadata.authorId,
          authorName: metadata.authorName,
          publishedAt: data.status === "published" ? now : metadata.publishedAt,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Ensure Finnish version exists - check both tables
      const [finnishPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      const [finnishTranslation] = await db
        .select()
        .from(postTranslations)
        .where(eq(postTranslations.language, "fi"))
        .limit(1);

      // Also check by original slug
      const [finnishBySlug] = await db
        .select()
        .from(postTranslations)
        .where(
          and(
            eq(postTranslations.slug, slug),
            eq(postTranslations.language, "fi")
          )
        )
        .limit(1);

      // If no Finnish version exists anywhere, create it in postTranslations
      if (!finnishPost && !finnishBySlug) {
        const sourceData = {
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
        };

        // Try to get Finnish translation
        let finnishContent = sourceData;
        let finnishSlug = slug; // Default to same slug
        
        if (data.autoTranslate && data.title && data.content && data.excerpt) {
          try {
            const { translations } = await translateContentToAllLocales(
              { title: data.title, content: data.content, excerpt: data.excerpt },
              targetLanguage as SupportedLocale,
              ARTICLE_TRANSLATION_CONFIG
            );
            if (translations.fi?.title) {
              finnishContent = {
                title: translations.fi.title as string,
                excerpt: translations.fi.excerpt as string,
                content: translations.fi.content as string,
              };
              // Generate Finnish slug from translated title
              finnishSlug = generateSlug(translations.fi.title as string);
            }
          } catch (e) {
            console.warn("Failed to translate to Finnish:", e);
          }
        }

        // Check if Finnish translation with new slug already exists
        const finnishExists = await slugExistsForLanguage(finnishSlug, "fi");
        if (!finnishExists) {
          await db.insert(postTranslations).values({
            postId: null,
            slug: finnishSlug,
            language: "fi",
            title: finnishContent.title || `[FI] ${data.title}`,
            excerpt: finnishContent.excerpt || data.excerpt || "",
            content: finnishContent.content || data.content || "",
            type: "article",
            status: data.status || "draft",
            featuredImage: data.featured_image || null,
            categories: [],
            authorId: null,
            authorName: null,
            publishedAt: data.status === "published" ? now : null,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // Handle auto-translation for other languages if requested
    if (data.autoTranslate && data.title && data.content && data.excerpt) {
      try {
        const sourceLocale = targetLanguage as SupportedLocale;
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

        // Update translations for other locales
        const targetLocales = (["en", "fi", "ar"] as SupportedLocale[]).filter(
          (locale) => locale !== sourceLocale
        );

        for (const locale of targetLocales) {
          const translatedContent = translations[locale];
          if (!translatedContent || !translatedContent.title) {
            console.warn(`Skipping ${locale} - no translation available`);
            continue;
          }

          const translatedUpdateData = {
            updatedAt: now,
            title: translatedContent.title as string,
            content: translatedContent.content as string,
            excerpt: translatedContent.excerpt as string,
            status: data.status,
          };

          if (locale === "fi") {
            // Update Finnish in posts table if exists, otherwise postTranslations
            const [finnishPost] = await db
              .select()
              .from(posts)
              .where(eq(posts.slug, slug))
              .limit(1);

            if (finnishPost) {
              await db
                .update(posts)
                .set(translatedUpdateData)
                .where(eq(posts.slug, slug));
            } else {
              // Check/update postTranslations - look for existing Finnish translation
              const [existing] = await db
                .select()
                .from(postTranslations)
                .where(eq(postTranslations.language, "fi"))
                .limit(1);

              // Find by any existing translation with same source slug
              const [existingBySlug] = await db
                .select()
                .from(postTranslations)
                .where(
                  and(
                    eq(postTranslations.slug, slug),
                    eq(postTranslations.language, "fi")
                  )
                )
                .limit(1);

              if (existingBySlug) {
                await db
                  .update(postTranslations)
                  .set(translatedUpdateData)
                  .where(
                    and(
                      eq(postTranslations.slug, slug),
                      eq(postTranslations.language, "fi")
                    )
                  );
              } else {
                // Generate Finnish slug from translated title
                const finnishSlug = generateSlug(translatedContent.title as string);
                
                // Check if Finnish translation with new slug already exists
                const finnishExists = await slugExistsForLanguage(finnishSlug, "fi");
                if (!finnishExists) {
                  await db.insert(postTranslations).values({
                    postId: null,
                    slug: finnishSlug,
                    language: "fi",
                    type: "article",
                    featuredImage: data.featured_image || null,
                    categories: [],
                    authorId: null,
                    authorName: null,
                    publishedAt: data.status === "published" ? now : null,
                    createdAt: now,
                    ...translatedUpdateData,
                  });
                }
              }
            }
          } else {
            // Update English/Arabic in postTranslations
            const [existing] = await db
              .select()
              .from(postTranslations)
              .where(
                and(
                  eq(postTranslations.slug, slug),
                  eq(postTranslations.language, locale)
                )
              )
              .limit(1);

            if (existing) {
              await db
                .update(postTranslations)
                .set(translatedUpdateData)
                .where(
                  and(
                    eq(postTranslations.slug, slug),
                    eq(postTranslations.language, locale)
                  )
                );
            } else {
              // Generate translated slug from translated title
              const translatedSlug = generateSlug(translatedContent.title as string);
              
              // Check if translation already exists
              const translationExists = await slugExistsForLanguage(translatedSlug, locale);
              if (!translationExists) {
                await db.insert(postTranslations).values({
                  postId: null,
                  slug: translatedSlug,
                  language: locale,
                  type: "article",
                  featuredImage: data.featured_image || null,
                  categories: [],
                  authorId: null,
                  authorName: null,
                  publishedAt: data.status === "published" ? now : null,
                  createdAt: now,
                  ...translatedUpdateData,
                });
              }
            }
          }
        }
      } catch (translationError) {
        console.error("Auto-translation failed:", translationError);
        // Continue without translation - don't fail the entire operation
      }
    }

    // Revalidate paths for all locales
    revalidatePath("/[locale]/articles", "page");
    revalidatePath("/[locale]/admin/articles", "page");
    revalidatePath(`/[locale]/articles/${slug}`, "page");

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

    // Finnish articles go to posts table
    // English/Arabic articles go to postTranslations table
    if (data.language === "fi") {
      // Check if Finnish article already exists
      const exists = await slugExistsForLanguage(data.slug, "fi");
      if (exists) {
        return { success: false, error: "An article with this slug already exists" };
      }
      
      // Create Finnish article in posts table
      await db.insert(posts).values({
        ...basePostData,
        language: "fi",
      });
      createdPosts.push({ language: "fi", slug: data.slug });
    } else {
      // Check if article already exists for this language
      const exists = await slugExistsForLanguage(data.slug, data.language);
      if (exists) {
        return { success: false, error: "An article with this slug already exists" };
      }
      
      // Create English/Arabic article in postTranslations table
      await db.insert(postTranslations).values({
        ...basePostData,
        postId: null,
        language: data.language,
      });
      createdPosts.push({ language: data.language, slug: data.slug });

      // Also create Finnish version in postTranslations (placeholder or translated)
      let finnishContent = {
        title: `[FI] ${data.title}`,
        excerpt: data.excerpt,
        content: data.content,
      };
      let finnishSlug = data.slug; // Default to same slug

      // If auto-translate is enabled, get Finnish translation and generate Finnish slug
      if (data.autoTranslate) {
        try {
          const { translations } = await translateContentToAllLocales(
            { title: data.title, content: data.content, excerpt: data.excerpt },
            sourceLocale,
            ARTICLE_TRANSLATION_CONFIG
          );
          if (translations.fi?.title) {
            finnishContent = {
              title: translations.fi.title as string,
              excerpt: translations.fi.excerpt as string,
              content: translations.fi.content as string,
            };
            // Generate Finnish slug from translated title
            finnishSlug = generateSlug(translations.fi.title as string);
          }
        } catch (e) {
          console.warn("Failed to translate to Finnish:", e);
        }
      }

      // Check if Finnish version already exists before creating
      const finnishExists = await slugExistsForLanguage(finnishSlug, "fi");
      if (!finnishExists) {
        await db.insert(postTranslations).values({
          ...basePostData,
          slug: finnishSlug,
          postId: null,
          language: "fi",
          title: finnishContent.title,
          excerpt: finnishContent.excerpt,
          content: finnishContent.content,
        });
        createdPosts.push({ language: "fi", slug: finnishSlug });
      }
    }

    // Auto-translate to remaining languages if enabled
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
        // Skip source locale and Finnish if already created above
        const allLocales: SupportedLocale[] = ["en", "fi", "ar"];
        const targetLocales = allLocales.filter((locale) => {
          // Skip source locale
          if (locale === sourceLocale) return false;
          // Skip Finnish if already created (when source is EN or AR)
          if (locale === "fi" && sourceLocale !== "fi") return false;
          return true;
        });

        for (const targetLocale of targetLocales) {
          const translatedContent = translations[targetLocale];
          if (!translatedContent || !translatedContent.title) {
            console.warn(`Skipping ${targetLocale} - no translation available`);
            continue;
          }

          // Generate translated slug from translated title
          const translatedSlug = generateSlug(translatedContent.title as string);
          
          // Check if this translation already exists
          const translationExists = await slugExistsForLanguage(translatedSlug, targetLocale);
          if (translationExists) {
            console.warn(`Skipping ${targetLocale} - translation already exists`);
            continue;
          }

          const translatedPostData = {
            ...basePostData,
            slug: translatedSlug,
            postId: null,
            language: targetLocale,
            title: translatedContent.title as string,
            content: translatedContent.content as string,
            excerpt: translatedContent.excerpt as string,
          };

          // All translations go to postTranslations table
          await db.insert(postTranslations).values(translatedPostData);
          createdPosts.push({ language: targetLocale, slug: translatedSlug });
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
