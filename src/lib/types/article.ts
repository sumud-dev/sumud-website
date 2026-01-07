/**
 * Article Types and Utilities
 */

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  featured?: boolean;
  image?: string;
  author?: {
    id: string;
    name: string;
    email?: string;
  };
}

export const ARTICLE_CATEGORIES = {
  all: { label: 'All', icon: 'Newspaper', color: 'text-gray-600' },
  news: { label: 'News', icon: 'Zap', color: 'text-blue-600' },
  analysis: { label: 'Analysis', icon: 'BarChart3', color: 'text-purple-600' },
  culture: { label: 'Culture', icon: 'Heart', color: 'text-red-600' },
  history: { label: 'History', icon: 'Clock', color: 'text-amber-600' },
  activism: { label: 'Activism', icon: 'Flame', color: 'text-orange-600' },
  personal: { label: 'Personal', icon: 'User', color: 'text-green-600' },
} as const;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
}

/**
 * Get category configuration by category key
 */
export function getCategoryConfig(category?: string): CategoryConfig {
  const config = ARTICLE_CATEGORIES[category as ArticleCategory] || ARTICLE_CATEGORIES.all;
  return {
    label: config.label,
    icon: config.icon,
    color: config.color,
  };
}

/**
 * Format article date
 */
export function formatArticleDate(date: string | Date | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = dateObj.toDateString() === today.toDateString();
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();

  if (isToday) {
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (isYesterday) {
    return 'Yesterday';
  }

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get reading time estimate
 */
export function getReadingTime(content?: string): number {
  if (!content) return 0;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
