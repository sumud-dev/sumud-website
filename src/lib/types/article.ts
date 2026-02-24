/**
 * Article Types and Utilities
 */

export interface PostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  type: string;
  status: string;
  featuredImage: string | null;
  categories: string[];
  authorId: string | null;
  authorName: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  isTranslation: boolean;
  parentPostId: string | null;
  translatedFromLanguage: string | null;
  translationQuality: string | null;
}

/**
 * Input type for creating an original post
 */
export interface CreateOriginalPostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  type?: string;
  status?: string;
  featuredImage?: string | null;
  categories?: string[];
  authorId?: string | null;
  authorName?: string | null;
}

/**
 * Input type for creating a post translation
 */
export interface CreateTranslationPostInput {
  parentPostId: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  translatedFromLanguage: string;
  type: string;
  status: string;
  featuredImage?: string | null;
  categories: string[];
  publishedAt?: Date | null;
}

/**
 * Input type for updating an original post
 */
export type UpdateOriginalPostInput = Partial<Pick<PostRecord, 'title' | 'excerpt' | 'content' | 'status' | 'language' | 'featuredImage' | 'categories' | 'publishedAt'>>;

export interface PostQueryFilters {
  status?: 'draft' | 'published' | 'archived';
  type?: 'article' | 'news';
  language?: string;
  search?: string;
  originalsOnly?: boolean; // Only user-created articles
  translationsOnly?: boolean; // Only AI translations
}

export interface PostPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPostResult {
  posts: PostRecord[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

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
export function formatArticleDate(date: string | Date | undefined, locale: string = 'en'): string {
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

  // Map locale to browser locale format
  const browserLocale = locale === 'fi' ? 'fi-FI' : 'en-US';

  if (isToday) {
    return dateObj.toLocaleTimeString(browserLocale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale === 'en',
    });
  }

  if (isYesterday) {
    return locale === 'fi' ? 'Eilen' : 'Yesterday';
  }

  return dateObj.toLocaleDateString(browserLocale, {
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
