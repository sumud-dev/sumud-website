import type { Database } from "@/src/lib/database.types";

// Database post type from Supabase
export type PostRow = Database["public"]["Tables"]["posts"]["Row"];

// Featured image structure for ArticleCard compatibility
export interface ArticleFeaturedImage {
  url: string;
  alt: string;
}

// Article type for frontend use (mapped from posts table)
export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: "draft" | "published" | "archived";
  category: string; // Primary category for display
  categoryLabel?: string; // Optional category label override
  categories: string[] | null; // All categories from DB
  tags: string[]; // Tags derived from categories
  featuredImage: ArticleFeaturedImage; // Image object for ArticleCard
  authorName: string | null;
  publishedAt: string;
  createdAt: string | null;
  updatedAt: string | null;
  language: string | null;
  readTime: number; // Calculated read time in minutes
}

// Article category configuration
export interface ArticleCategory {
  value: string;
  label: string;
  color?: string;
}

// Default categories
export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { value: "news", label: "Breaking News", color: "red" },
  { value: "analysis", label: "Analysis", color: "blue" },
  { value: "culture", label: "Culture", color: "purple" },
  { value: "history", label: "History", color: "amber" },
  { value: "activism", label: "Activism", color: "green" },
  { value: "personal", label: "Stories", color: "pink" },
];

// API Response types
export interface ArticlesApiResponse {
  data: Article[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleApiResponse {
  data: Article | null;
  error?: string;
}

/**
 * Estimate read time based on content length
 */
function estimateReadTime(content: string | null): number {
  if (!content) return 3; // Default read time
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Map a database post row to the frontend Article type
 */
export function mapPostToArticle(post: PostRow): Article {
  const primaryCategory = post.categories?.[0] || "article";
  const categoryConfig = getCategoryConfig(primaryCategory);
  
  return {
    id: post.id,
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt,
    content: post.content,
    status: (post.status as "draft" | "published" | "archived") || "draft",
    category: primaryCategory,
    categoryLabel: categoryConfig?.label,
    categories: post.categories,
    tags: post.categories || [], // Use categories as tags
    featuredImage: {
      url: post.featured_image || "/images/placeholder-article.svg",
      alt: post.title || "Article image",
    },
    authorName: post.author_name,
    publishedAt: post.published_at || new Date().toISOString(),
    createdAt: post.published_at, // Using published_at as createdAt since there's no created_at
    updatedAt: post.updated_at,
    language: post.language,
    readTime: estimateReadTime(post.content),
  };
}

/**
 * Format article date for display
 */
export function formatArticleDate(dateString: string | null): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Get category configuration by value
 */
export function getCategoryConfig(categoryValue: string): ArticleCategory | undefined {
  return ARTICLE_CATEGORIES.find((cat) => cat.value === categoryValue);
}
