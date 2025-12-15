"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys, type ArticleFilters } from "@/src/lib/react-query/query-keys";
import type { Article, ArticlesApiResponse } from "@/src/lib/types/article";

// API fetch functions
async function fetchArticles(
  filters?: ArticleFilters
): Promise<Article[]> {
  const params = new URLSearchParams();

  if (filters?.language) params.set("language", filters.language);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const response = await fetch(`/api/articles?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }

  const result: ArticlesApiResponse = await response.json();
  return result.data;
}

async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const response = await fetch(`/api/articles/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch article");
  }

  const result = await response.json();
  return result.data;
}

// Query hooks
export function useArticles(filters?: ArticleFilters) {
  return useQuery({
    queryKey: queryKeys.articles.list(filters),
    queryFn: () => fetchArticles(filters),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(slug),
    queryFn: () => fetchArticleBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch related articles (excluding the current article)
 */
export function useRelatedArticles(currentSlug: string, limit: number = 3) {
  return useQuery({
    queryKey: [...queryKeys.articles.all, "related", currentSlug, limit],
    queryFn: async () => {
      // Fetch articles and filter out the current one
      const articles = await fetchArticles({ status: "published", limit: limit + 1 });
      return articles.filter((article) => article.slug !== currentSlug).slice(0, limit);
    },
    enabled: !!currentSlug,
  });
}
