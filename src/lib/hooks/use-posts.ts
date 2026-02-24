// ============================================================================
// STEP 6: React Query Hooks with Descriptive Names
// FILE: src/lib/hooks/use-posts.ts
// ============================================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useInfiniteQuery } from '@tanstack/react-query';
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
  const currentLocale = useLocale();

  return useMutation({
    mutationFn: async (postInput: CreatePostInput) => {
      const mutationResult = await createPost(postInput);
      
      if (!mutationResult.success) {
        throw new Error(mutationResult.error);
      }
      
      return mutationResult;
    },
    onMutate: async (postInput: CreatePostInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postQueryKeys.allPosts });
      
      // Create optimistic post
      const optimisticPost = {
        id: `temp-${Date.now()}`,
        slug: postInput.slug,
        title: postInput.title,
        excerpt: postInput.excerpt,
        content: postInput.content,
        language: postInput.language || currentLocale,
        type: postInput.type || 'article',
        status: postInput.status || 'draft',
        featuredImage: postInput.featuredImage,
        categories: postInput.categories || [],
        authorId: postInput.authorId,
        authorName: postInput.authorName,
        publishedAt: postInput.status === 'published' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        isTranslation: false,
        parentPostId: null,
        translatedFromLanguage: null,
        translationQuality: null,
      };
      
      // Update both types of query caches
      queryClient.setQueriesData(
        { queryKey: postQueryKeys.postLists() },
        (oldData: any) => {
          if (!oldData?.pages) {
            // Handle regular paginated queries (admin panel)
            if (oldData?.posts) {
              return {
                ...oldData,
                posts: [optimisticPost, ...oldData.posts],
                pagination: {
                  ...oldData.pagination,
                  totalItems: oldData.pagination.totalItems + 1,
                },
              };
            }
            return oldData;
          }
          
          // Handle infinite queries (public pages)
          const newPages = [...oldData.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              posts: [optimisticPost, ...newPages[0].posts],
            };
          }
          
          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
      
      return { optimisticPost };
    },
    onSuccess: (mutationResult) => {
      // Aggressively invalidate all post-related queries for fresh data
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
      toast.success(mutationResult.message);
    },
    onError: (mutationError: Error, postInput, context) => {
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
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
    onMutate: async ({ postSlug, updateData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postQueryKeys.allPosts });
      
      // Optimistically update both types of query caches
      queryClient.setQueriesData(
        { queryKey: postQueryKeys.postLists() },
        (oldData: any) => {
          if (!oldData?.pages) {
            // Handle regular paginated queries (admin panel)
            if (oldData?.posts) {
              return {
                ...oldData,
                posts: oldData.posts.map((post: any) => 
                  post.slug === postSlug 
                    ? { 
                        ...post, 
                        ...updateData,
                        updatedAt: new Date().toISOString(),
                      }
                    : post
                ),
              };
            }
            return oldData;
          }
          
          // Handle infinite queries (public pages)
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => 
              post.slug === postSlug 
                ? { 
                    ...post, 
                    ...updateData,
                    updatedAt: new Date().toISOString(),
                  }
                : post
            ),
          }));
          
          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
      
      return { postSlug };
    },
    onSuccess: (mutationResult) => {
      // Generate appropriate success message
      const statusMessages: { [key: string]: string } = {
        published: 'Post published successfully',
        draft: 'Post unpublished successfully', 
        archived: 'Post archived successfully',
      };
      
      const status = mutationResult.updatedPost?.status;
      const message = status && statusMessages[status] 
        ? statusMessages[status] 
        : mutationResult.message;
      
      // Aggressively invalidate for fresh data
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
      toast.success(message);
    },
    onError: (mutationError: Error, variables, context) => {
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
      toast.error(mutationError.message);
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const currentLocale = useLocale();

  return useMutation({
    mutationFn: async (postSlug: string) => {
      const mutationResult = await deletePost(postSlug, currentLocale);
      
      if (!mutationResult.success) {
        throw new Error(mutationResult.error);
      }
      
      return mutationResult;
    },
    onMutate: async (postSlug: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postQueryKeys.allPosts });
      
      // Optimistically remove from infinite query caches
      queryClient.setQueriesData(
        { queryKey: postQueryKeys.postLists() },
        (oldData: any) => {
          if (!oldData?.pages) {
            // Handle regular paginated queries (admin panel)
            if (oldData?.posts) {
              return {
                ...oldData,
                posts: oldData.posts.filter((post: any) => post.slug !== postSlug),
                pagination: {
                  ...oldData.pagination,
                  totalItems: Math.max(0, oldData.pagination.totalItems - 1),
                },
              };
            }
            return oldData;
          }
          
          // Handle infinite queries (public pages)
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((post: any) => post.slug !== postSlug),
          }));
          
          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
      
      return { postSlug };
    },
    onSuccess: (mutationResult) => {
      // Aggressively invalidate all post queries for consistency
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
      toast.success(mutationResult.message);
    },
    onError: (mutationError: Error, postSlug, context) => {
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      
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

/**
 * Hook to fetch infinite paginated posts (better for "load more" UX)
 */
export function useInfinitePosts(queryOptions: Omit<GetPostsOptions, 'page'> = {}) {
  const currentLocale = useLocale();
  const articleLanguage = queryOptions.language || currentLocale;

  return useInfiniteQuery({
    queryKey: postQueryKeys.postList({ ...queryOptions, language: articleLanguage }),
    queryFn: async ({ pageParam = 1 }) => {
      const queryResult = await getPosts({ 
        ...queryOptions, 
        language: articleLanguage,
        page: pageParam,
      });
      
      if (!queryResult.success) {
        throw new Error(queryResult.error);
      }
      
      return queryResult.result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage 
        ? lastPage.pagination.currentPage + 1 
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // Data considered fresh for 30 seconds
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
    refetchOnWindowFocus: true, // Auto-refetch when user returns to tab
    refetchOnReconnect: true, // Auto-refetch when internet reconnects
    refetchInterval: 5 * 60 * 1000, // Poll for new content every 5 minutes
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });
}