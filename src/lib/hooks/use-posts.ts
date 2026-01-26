// ============================================================================
// STEP 6: React Query Hooks with Descriptive Names
// FILE: src/lib/hooks/use-posts.ts
// ============================================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  getPosts,
  getPostBySlug,
  getPostStatistics,
  createPost,
  updatePost,
  deletePost,
  type GetPostsOptions,
  type CreatePostInput,
} from '@/src/actions/posts.actions';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const postQueryKeys = {
  // Base key for all post queries
  allPosts: ['posts'] as const,
  
  // Post lists with filters
  postLists: () => [...postQueryKeys.allPosts, 'list'] as const,
  postList: (queryOptions: GetPostsOptions) => 
    [...postQueryKeys.postLists(), queryOptions] as const,
  
  // Individual post details
  postDetails: () => [...postQueryKeys.allPosts, 'detail'] as const,
  postDetail: (postSlug: string, postLanguage?: string) =>
    [...postQueryKeys.postDetails(), postSlug, postLanguage || 'any'] as const,
  
  // Post statistics
  postStatistics: () => [...postQueryKeys.allPosts, 'statistics'] as const,
  postStatisticsByLanguage: (statisticsLanguage: string) =>
    [...postQueryKeys.postStatistics(), statisticsLanguage] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch paginated posts with filters
 */
export function usePosts(queryOptions: GetPostsOptions = {}) {
  const currentLocale = useLocale();
  const articleLanguage = queryOptions.language || currentLocale;

  return useQuery({
queryKey: postQueryKeys.postList({ ...queryOptions, language: articleLanguage }),
    queryFn: async () => {
      const queryResult = await getPosts({ 
        ...queryOptions, 
        language: articleLanguage 
      });
      
      if (!queryResult.success) {
        throw new Error(queryResult.error);
      }
      
      return queryResult.result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch only original (user-created) articles
 */
export function useOriginalPosts(queryOptions: Omit<GetPostsOptions, 'originalsOnly'> = {}) {
  return useQuery({
    queryKey: postQueryKeys.postList({ ...queryOptions, originalsOnly: true }),
    queryFn: async () => {
      const queryResult = await getPosts({ 
        ...queryOptions, 
        originalsOnly: true 
      });
      
      if (!queryResult.success) {
        throw new Error(queryResult.error);
      }
      
      return queryResult.result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single post by slug
 */
export function usePostBySlug(postSlug: string, postLanguage?: string) {
  const currentLocale = useLocale();
  const queryLanguage = postLanguage || currentLocale;

  return useQuery({
    queryKey: postQueryKeys.postDetail(postSlug, queryLanguage),
    queryFn: async () => {
      const queryResult = await getPostBySlug(postSlug, queryLanguage);
      
      if (!queryResult.success) {
        throw new Error(queryResult.error);
      }
      
      return queryResult.post;
    },
    enabled: Boolean(postSlug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch post statistics
 */
export function usePostStatistics(statisticsLanguage?: string) {
  const currentLocale = useLocale();
  const queryLanguage = statisticsLanguage || currentLocale;

  return useQuery({
    queryKey: postQueryKeys.postStatisticsByLanguage(queryLanguage),
    queryFn: async () => {
      const queryResult = await getPostStatistics(queryLanguage);
      
      if (!queryResult.success) {
        throw new Error(queryResult.error);
      }
      
      return queryResult.statistics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new post with optional auto-translation
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postInput: CreatePostInput) => {
      const mutationResult = await createPost(postInput);
      
      if (!mutationResult.success) {
        throw new Error(mutationResult.error);
      }
      
      return mutationResult;
    },
    onSuccess: (mutationResult) => {
      // Invalidate all post queries to refresh data
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
      toast.success(mutationResult.message);
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });
}

/**
 * Hook to update an existing post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  const currentLocale = useLocale();

  return useMutation({
    mutationFn: async ({
      postSlug,
      updateData,
      language,
    }: {
      postSlug: string;
      updateData: Parameters<typeof updatePost>[1];
      language?: string;
    }) => {
      const mutationLanguage = language || currentLocale;
      const mutationResult = await updatePost(postSlug, updateData, mutationLanguage);
      
      if (!mutationResult.success) {
        throw new Error(mutationResult.error);
      }
      
      return { ...mutationResult, postSlug };
    },
    onSuccess: (mutationResult) => {
      // Invalidate specific post
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.postDetail(mutationResult.postSlug),
      });
      
      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: postQueryKeys.postLists() });
      queryClient.invalidateQueries({ queryKey: postQueryKeys.postStatistics() });
      
      toast.success(mutationResult.message);
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postSlug: string) => {
      const mutationResult = await deletePost(postSlug);
      
      if (!mutationResult.success) {
        throw new Error(mutationResult.error);
      }
      
      return mutationResult;
    },
    onSuccess: (mutationResult) => {
      // Invalidate all post queries
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
      toast.success(mutationResult.message);
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to prefetch a post (useful for link hover effects)
 */
export function usePrefetchPost() {
  const queryClient = useQueryClient();
  const currentLocale = useLocale();

  return (postSlug: string, postLanguage?: string) => {
    const prefetchLanguage = postLanguage || currentLocale;
    
    queryClient.prefetchQuery({
      queryKey: postQueryKeys.postDetail(postSlug, prefetchLanguage),
      queryFn: async () => {
        const queryResult = await getPostBySlug(postSlug, prefetchLanguage);
        if (!queryResult.success) {
          throw new Error('Post not found');
        }
        return queryResult.post;
      },
    });
  };
}

/**
 * Hook to manually invalidate post cache
 */
export function useInvalidatePostCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAllPosts: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
    },
    invalidatePostLists: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.postLists() });
    },
    invalidatePostDetail: (postSlug: string, postLanguage?: string) => {
      queryClient.invalidateQueries({ 
        queryKey: postQueryKeys.postDetail(postSlug, postLanguage) 
      });
    },
    invalidatePostStatistics: (statisticsLanguage?: string) => {
      if (statisticsLanguage) {
        queryClient.invalidateQueries({ 
          queryKey: postQueryKeys.postStatisticsByLanguage(statisticsLanguage) 
        });
      } else {
        queryClient.invalidateQueries({ 
          queryKey: postQueryKeys.postStatistics() 
        });
      }
    },
  };
}