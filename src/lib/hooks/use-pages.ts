'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import {
  listPagesAction,
  getPageAction,
  createPageAction,
  updatePageAction,
  deletePageAction,
  duplicatePageAction,
} from '@/src/actions/pages.actions';
import type { PageData, PageSummary } from '@/src/lib/types/page';

// Query keys
export const pageQueryKeys = {
  all: ['pages'] as const,
  lists: () => [...pageQueryKeys.all, 'list'] as const,
  list: () => [...pageQueryKeys.lists()] as const,
  details: () => [...pageQueryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...pageQueryKeys.details(), slug] as const,
};

/**
 * Hook to fetch all pages
 */
export function usePages(locale?: string) {
  return useQuery({
    queryKey: locale ? [...pageQueryKeys.list(), locale] : pageQueryKeys.list(),
    queryFn: async () => {
      const result = await listPagesAction(locale);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as PageSummary[];
    },
  });
}

/**
 * Hook to fetch a single page by slug
 */
export function usePage(slug: string, locale?: 'en' | 'fi') {
  const currentLocale = useLocale() as 'en' | 'fi';
  const lang = locale || currentLocale;
  
  return useQuery({
    queryKey: [...pageQueryKeys.detail(slug), lang],
    queryFn: async () => {
      const result = await getPageAction(slug, lang);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as PageData | null;
    },
    enabled: !!slug,
  });
}

/**
 * Hook to create a new page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof createPageAction>[0]) => {
      const result = await createPageAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.lists() });
    },
  });
}

/**
 * Hook to update a page
 */
export function useUpdatePage() {
  const queryClient = useQueryClient();
  const locale = useLocale() as 'en' | 'fi';
  
  return useMutation({
    mutationFn: async ({
      slug,
      data,
      language,
    }: {
      slug: string;
      data: Parameters<typeof updatePageAction>[1];
      language?: 'en' | 'fi';
    }) => {
      const result = await updatePageAction(slug, data, language || locale);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, { slug }) => {
      // Invalidate all language versions
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.details() });
    },
  });
}

/**
 * Hook to delete a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();
  const locale = useLocale() as 'en' | 'fi';
  
  return useMutation({
    mutationFn: async ({ slug, language }: { slug: string; language?: 'en' | 'fi' }) => {
      const result = await deletePageAction(slug, language || locale);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.details() });
    },
  });
}

/**
 * Hook to duplicate a page
 */
export function useDuplicatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const result = await duplicatePageAction(slug);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.lists() });
    },
  });
}
