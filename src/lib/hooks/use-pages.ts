'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
export function usePages() {
  return useQuery({
    queryKey: pageQueryKeys.list(),
    queryFn: async () => {
      const result = await listPagesAction();
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
export function usePage(slug: string) {
  return useQuery({
    queryKey: pageQueryKeys.detail(slug),
    queryFn: async () => {
      const result = await getPageAction(slug);
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

  return useMutation({
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string;
      data: Parameters<typeof updatePageAction>[1];
    }) => {
      const result = await updatePageAction(slug, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pageQueryKeys.detail(slug) });
    },
  });
}

/**
 * Hook to delete a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const result = await deletePageAction(slug);
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
