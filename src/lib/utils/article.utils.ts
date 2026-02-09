/**
 * Article/Post Utilities
 */

export interface PostWithCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  category?: string | { name?: string };
  status?: string;
  featured?: boolean;
  author?: string;
  coverImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get category name from post
 */
export function getCategoryName(post: PostWithCategory): string {
  if (!post.category) return "Uncategorized";
  if (typeof post.category === "string") return post.category;
  return post.category.name || "Uncategorized";
}

/**
 * Format article slug from title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get reading time in minutes
 */
export function getReadingTime(content?: string): number {
  if (!content) return 0;
  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format article date
 */
export function formatArticleDate(date?: string | Date, locale: string = 'en'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  // Map locale to browser locale format
  const browserLocale = locale === 'fi' ? 'fi-FI' : 'en-US';

  return dateObj.toLocaleDateString(browserLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if article is recent (published within the last 7 days)
 */
export function isRecentArticle(publishDate?: string | Date): boolean {
  if (!publishDate) return false;

  const date = typeof publishDate === 'string' ? new Date(publishDate) : publishDate;
  const now = new Date();
  const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  return daysAgo <= 7;
}
