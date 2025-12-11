import { Database } from "@/src/lib/database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

// Posts have categories stored as a string[] directly in the posts table
export type PostWithCategory = Post;

export type ArticleStats = {
  total: number;
  published: number;
  drafts: number;
  archived: number;
};

/**
 * Calculate stats from posts
 */
export function calculateStats(posts: PostWithCategory[]): ArticleStats {
  return {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    archived: posts.filter((p) => p.status === "archived").length,
  };
}

/**
 * Get category name from post
 */
export function getCategoryName(post: PostWithCategory): string {
  // Categories are stored as string[] directly in the posts table
  const categories = post.categories;
  if (!categories || categories.length === 0) {
    return "N/A";
  }
  return categories[0];
}
