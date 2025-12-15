"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { PostWithCategory } from "@/src/lib/utils/article.utils";
import {
  translateArticleToAllLocales,
  type ArticleTranslation,
} from "@/src/lib/services/translation.service";
import type { Locale } from "@/src/types/Content";

// Define locales inline to avoid importing constants in "use server" file
const LOCALES: Locale[] = ["en", "ar", "fi"];

/**
 * Fetch all posts with their categories
 */
export async function getPosts(): Promise<{
  data: PostWithCategory[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return { data: null, error: error.message };
  }

  return { data: data as PostWithCategory[], error: null };
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(
  slug: string
): Promise<{ data: PostWithCategory | null; error: string | null }> {
  const supabase = await createClient();

  console.log("getPostBySlug called with slug:", slug);

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("getPostBySlug result:", data ? { id: data.id, title: data.title, slug: data.slug } : null);
  console.log("getPostBySlug error:", error);

  if (error) {
    console.error("Error fetching post:", error);
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Post not found" };
  }

  return { data: data as PostWithCategory, error: null };
}

/**
 * Delete a post by ID
 */
export async function deletePost(
  id: number
): Promise<{ success: boolean; error: string | null }> {
  // Use admin client to bypass RLS for admin operations
  const supabase = createAdminClient();

  // Note: categories are stored as string[] directly in posts table, no junction table cleanup needed

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/articles");
  return { success: true, error: null };
}

/**
 * Update post status (publish, unpublish, archive)
 */
export async function updatePostStatus(
  id: number,
  newStatus: "draft" | "published" | "archived"
): Promise<{ success: boolean; error: string | null }> {
  // Use admin client to bypass RLS for admin operations
  const supabase = createAdminClient();

  const updateData: { status: string; published_at?: string | null } = {
    status: newStatus,
  };

  if (newStatus === "published") {
    updateData.published_at = new Date().toISOString();
  } else if (newStatus === "draft") {
    updateData.published_at = null;
  }

  const { error } = await supabase.from("posts").update(updateData).eq("id", id);

  if (error) {
    console.error("Error updating post status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/articles");
  return { success: true, error: null };
}

export type UpdatePostData = {
  title: string;
  slug?: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  featured_image?: string;
  language?: string;
};

/**
 * Update a post by ID
 */
export async function updatePost(
  id: number,
  data: UpdatePostData
): Promise<{ success: boolean; error: string | null; slug?: string }> {
  // Use admin client to bypass RLS for admin operations
  const supabase = createAdminClient();

  console.log("updatePost called with id:", id, "type:", typeof id);
  console.log("updatePost data:", JSON.stringify(data, null, 2));

  // First, verify the post exists
  const { data: existingPost, error: fetchError } = await supabase
    .from("posts")
    .select("id, title, slug")
    .eq("id", id)
    .maybeSingle();

  console.log("Existing post check:", existingPost);
  console.log("Fetch error:", fetchError);

  if (fetchError) {
    console.error("Error fetching post for update:", fetchError);
    return { success: false, error: fetchError.message };
  }

  if (!existingPost) {
    console.error("Post not found with id:", id);
    return { success: false, error: `Post with ID ${id} not found in database` };
  }

  const updateData: Record<string, unknown> = {
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    status: data.status,
    updated_at: new Date().toISOString(),
  };

  // Only update slug if provided
  if (data.slug) {
    updateData.slug = data.slug;
  }

  // Only update featured_image if provided
  if (data.featured_image) {
    updateData.featured_image = data.featured_image;
  }

  // Only update language if provided
  if (data.language) {
    updateData.language = data.language;
  }

  // Update published_at based on status
  if (data.status === "published") {
    updateData.published_at = new Date().toISOString();
  } else if (data.status === "draft") {
    updateData.published_at = null;
  }

  console.log("Updating post with data:", JSON.stringify(updateData, null, 2));

  const { data: result, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", id)
    .select();

  console.log("Update result:", result);
  console.log("Update error:", error);

  if (error) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }

  if (!result || result.length === 0) {
    // Post exists but update returned no rows - likely RLS policy blocking update
    console.error("No rows updated - RLS policy may be blocking the update for post id:", id);
    return { 
      success: false, 
      error: "Update failed. You may not have permission to update this post. Please check RLS policies." 
    };
  }

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${data.slug || ""}`);
  return { success: true, error: null, slug: data.slug };
}

export type CreatePostData = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  featured_image?: string;
  language: Locale;
  categories?: string[];
  author_name?: string;
};

/**
 * Create a new post
 */
export async function createPost(
  data: CreatePostData
): Promise<{ success: boolean; error: string | null; id?: number; slug?: string }> {
  const supabase = createAdminClient();

  // Get the next available ID (workaround for non-auto-increment id column)
  const { data: maxIdResult } = await supabase
    .from("posts")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  const nextId = (maxIdResult?.id ?? 0) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    id: nextId,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    status: data.status,
    language: data.language,
    categories: data.categories || [],
    author_name: data.author_name ?? undefined,
    featured_image: data.featured_image ?? undefined,
    published_at: data.status === "published" ? new Date().toISOString() : undefined,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from("posts")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/articles");
  return { success: true, error: null, id: result.id, slug: result.slug ?? undefined };
}

/**
 * Create a post with automatic translation to all locales
 * Creates separate posts for each locale with translated content
 */
export async function createPostWithTranslation(
  data: CreatePostData,
  autoTranslate: boolean = true
): Promise<{
  success: boolean;
  error: string | null;
  createdPosts: { locale: Locale; id: number; slug: string }[];
}> {
  const createdPosts: { locale: Locale; id: number; slug: string }[] = [];

  // First create the source post
  const sourceResult = await createPost(data);

  if (!sourceResult.success || !sourceResult.id) {
    return {
      success: false,
      error: sourceResult.error || "Failed to create source post",
      createdPosts: [],
    };
  }

  createdPosts.push({
    locale: data.language,
    id: sourceResult.id,
    slug: data.slug,
  });

  if (!autoTranslate) {
    return { success: true, error: null, createdPosts };
  }

  // Translate content to other locales
  const articleContent: ArticleTranslation = {
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
  };

  const { translations, error: translationError } = await translateArticleToAllLocales(
    articleContent,
    data.language
  );

  // Log translation error but continue - we'll create posts for locales that succeeded
  if (translationError) {
    console.error("Translation warning (continuing with available translations):", translationError);
  }

  // Create posts for other locales
  const targetLocales = LOCALES.filter((l) => l !== data.language);
  const errors: string[] = [];

  // Process translations sequentially to avoid race conditions with ID generation
  for (const locale of targetLocales) {
    const translatedArticle = translations[locale];
    
    // Skip if translation is empty (failed)
    if (!translatedArticle.title || !translatedArticle.content || !translatedArticle.excerpt) {
      errors.push(`${locale}: Translation was empty or failed`);
      continue;
    }

    const translatedData: CreatePostData = {
      ...data,
      title: translatedArticle.title,
      content: translatedArticle.content,
      excerpt: translatedArticle.excerpt,
      slug: `${data.slug}-${locale}`,
      language: locale,
    };

    const result = await createPost(translatedData);

    if (result.success && result.id) {
      createdPosts.push({
        locale,
        id: result.id,
        slug: translatedData.slug,
      });
    } else {
      errors.push(`${locale}: ${result.error}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: true,
      error: `Some translations failed: ${errors.join("; ")}`,
      createdPosts,
    };
  }

  return { success: true, error: null, createdPosts };
}

/**
 * Update a post and optionally translate to other locales
 */
export async function updatePostWithTranslation(
  id: number,
  data: UpdatePostData,
  sourceLocale: Locale,
  translateToOthers: boolean = false
): Promise<{
  success: boolean;
  error: string | null;
  updatedPosts: { locale: Locale; slug: string }[];
}> {
  const updatedPosts: { locale: Locale; slug: string }[] = [];

  // Update the source post
  const sourceResult = await updatePost(id, data);

  if (!sourceResult.success) {
    return {
      success: false,
      error: sourceResult.error || "Failed to update source post",
      updatedPosts: [],
    };
  }

  updatedPosts.push({
    locale: sourceLocale,
    slug: data.slug || "",
  });

  if (!translateToOthers) {
    return { success: true, error: null, updatedPosts };
  }

  // Translate content
  const articleContent: ArticleTranslation = {
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
  };

  const { translations, error: translationError } = await translateArticleToAllLocales(
    articleContent,
    sourceLocale
  );

  if (translationError) {
    return {
      success: true,
      error: `Source updated but translation failed: ${translationError}`,
      updatedPosts,
    };
  }

  // Find and update related posts in other locales
  const supabase = createAdminClient();
  const targetLocales = LOCALES.filter((l) => l !== sourceLocale);
  const errors: string[] = [];

  // Get the base slug (remove locale suffix if present)
  const baseSlug = data.slug?.replace(/-(?:en|ar|fi)$/, "") || "";

  await Promise.all(
    targetLocales.map(async (locale) => {
      const targetSlug = `${baseSlug}-${locale}`;

      // Check if a post with this slug exists
      const { data: existingPost } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", targetSlug)
        .maybeSingle();

      const translatedData: UpdatePostData = {
        title: translations[locale].title,
        content: translations[locale].content,
        excerpt: translations[locale].excerpt,
        status: data.status,
        featured_image: data.featured_image,
        language: locale,
        slug: targetSlug,
      };

      if (existingPost) {
        // Update existing post
        const result = await updatePost(existingPost.id, translatedData);
        if (result.success) {
          updatedPosts.push({ locale, slug: targetSlug });
        } else {
          errors.push(`${locale}: ${result.error}`);
        }
      } else {
        // Create new post for this locale
        const createData: CreatePostData = {
          title: translations[locale].title,
          slug: targetSlug,
          content: translations[locale].content,
          excerpt: translations[locale].excerpt,
          status: data.status,
          featured_image: data.featured_image,
          language: locale,
        };

        const result = await createPost(createData);
        if (result.success) {
          updatedPosts.push({ locale, slug: targetSlug });
        } else {
          errors.push(`${locale}: ${result.error}`);
        }
      }
    })
  );

  if (errors.length > 0) {
    return {
      success: true,
      error: `Some translations failed: ${errors.join("; ")}`,
      updatedPosts,
    };
  }

  return { success: true, error: null, updatedPosts };
}
