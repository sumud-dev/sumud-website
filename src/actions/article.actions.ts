"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { PostWithCategory } from "@/src/lib/article.utils";

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
