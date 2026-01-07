'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/react-query/query-keys';
import type { ArticleFilters } from '@/src/lib/react-query/query-keys';
import type { Article } from '@/src/lib/types/article';

export type { Article };

/**
 * Hook to fetch articles with filters
 */
export function useArticles(filters?: ArticleFilters) {
  const { data = [], isLoading, error, isError } = useQuery({
    queryKey: queryKeys.articles.list(filters),
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.language) params.append('language', filters.language);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await fetch(`/api/articles?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: data as Article[],
    isLoading,
    error: isError ? error : null,
  };
}

/**
 * Hook to fetch a single article by slug
 */
export function useArticle(slug: string) {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.articles.detail(slug),
    queryFn: async () => {
      const response = await fetch(`/api/articles/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      return response.json() as Promise<Article>;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: data || null,
    isLoading,
    error: isError ? error : null,
  };
}

/**
 * Hook to fetch related articles
 */
export function useRelatedArticles(category?: string, currentSlug?: string) {
  const { data = [], isLoading, error, isError } = useQuery({
    queryKey: ['relatedArticles', category, currentSlug],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (currentSlug) params.append('excludeSlug', currentSlug);
      params.append('limit', '3');

      const response = await fetch(`/api/articles?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related articles');
      }
      
      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    },
    enabled: !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    data: data as Article[],
    isLoading,
    error: isError ? error : null,
  };
}
