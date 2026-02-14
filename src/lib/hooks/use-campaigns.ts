'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { 
  updateCampaignAction, 
  updateCampaignTranslationAction,
  deleteCampaignAction 
} from '@/src/actions/campaigns.actions';
import { queryKeys } from '@/src/lib/react-query/query-keys';
import type { CampaignFilters } from '@/src/lib/react-query/query-keys';
import type { CampaignType, CampaignParticipationStep, CampaignResource, CampaignSuccessStory } from '@/src/types/Campaigns';

// ============================================
// TYPES
// ============================================

export type CampaignDescription = string | { type: 'blocks' | 'markdown' | 'html'; data: unknown } | null;

export interface Campaign {
  id: string;
  campaignId?: string;
  parentId?: string;
  title: string;
  slug: string;
  description: CampaignDescription;
  content?: string;
  category?: string;
  campaignType: CampaignType | null;
  status?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  iconName?: string;
  image?: string;
  featuredImage?: string;
  language?: string;
  featured?: boolean;
  demands?: unknown;
  callToAction?: unknown;
  howToParticipate?: CampaignParticipationStep[] | string[];
  resources?: CampaignResource[];
  successStories?: CampaignSuccessStory[] | string[];
  targets?: unknown;
  seoTitle?: string;
  seoDescription?: string;
}

// ============================================
// HELPER FUNCTIONS (eliminates duplication)
// ============================================

/**
 * Fetch data from API and handle errors consistently
 */
async function fetchFromAPI<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }
  
  return result.data || result;
}

/**
 * Build URL with query parameters
 */
function buildCampaignURL(path: string, params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Invalidate campaign cache after mutations
 */
function invalidateCampaignCache(queryClient: ReturnType<typeof useQueryClient>, slug?: string) {
  if (slug) {
    queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(slug) });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
}

/**
 * Extract text from JSONB description field
 */
function extractTextFromDescription(description: CampaignDescription): string {
  if (!description) return '';
  
  let text = '';
  
  if (typeof description === 'string') {
    text = description;
  } else if (typeof description === 'object' && 'data' in description) {
    if (typeof description.data === 'string') {
      text = description.data;
    } else if (description.type === 'blocks' && Array.isArray(description.data)) {
      text = description.data.map((block: { text?: string }) => block.text || '').join(' ');
    }
  }
  
  return text;
}

/**
 * Strip HTML tags and decode entities
 */
function cleanHTML(html: string): string {
  return html
    // Remove TipTap raw HTML wrappers
    .replace(/<div data-raw-html="true"[^>]*>.*?<\/div>/gs, '')
    .replace(/<div data-raw-html="true"[^>]*\/>/g, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Get plain text from description (main exported utility)
 */
export function getDescriptionText(description: CampaignDescription): string {
  const text = extractTextFromDescription(description);
  return cleanHTML(text);
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch campaigns with filters
 */
export function useCampaigns(filters?: CampaignFilters) {
  const locale = useLocale();
  
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.campaigns.list({ ...filters, language: filters?.language || locale }),
    queryFn: () => {
      const url = buildCampaignURL('/api/campaigns', {
        search: filters?.search,
        category: filters?.category,
        campaignType: filters?.campaignType,
        status: filters?.status,
        language: filters?.language || locale,
        isFeatured: filters?.isFeatured,
        page: filters?.page,
        limit: filters?.limit,
      });
      
      return fetchFromAPI<Campaign[]>(url);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data ?? [],
    isLoading,
    error: isError ? error : null,
  };
}

/**
 * Hook to fetch a single campaign by slug
 */
export function useCampaign(slug: string) {
  const locale = useLocale();
  
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.campaigns.detail(slug),
    queryFn: () => {
      const url = buildCampaignURL(`/api/campaigns/${slug}`, {
        language: locale,
      });
      
      return fetchFromAPI<Campaign>(url);
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    error: isError ? error : null,
  };
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to update campaign base fields
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  
  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      slug, 
      data,
      language
    }: { 
      campaignId: string; 
      slug: string; 
      data: Record<string, unknown>;
      language?: string;
    }) => {
      const result = await updateCampaignAction(campaignId, slug, data, language || locale);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (_, { slug }) => {
      invalidateCampaignCache(queryClient, slug);
    },
  });
}

/**
 * Hook to update campaign translation
 */
export function useUpdateCampaignTranslation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      slug, 
      locale, 
      data 
    }: { 
      campaignId: string; 
      slug: string; 
      locale: string; 
      data: Record<string, unknown>;
    }) => {
      const result = await updateCampaignTranslationAction(campaignId, slug, locale, data);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (_, { slug }) => {
      invalidateCampaignCache(queryClient, slug);
    },
  });
}

/**
 * Hook to delete campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  
  return useMutation({
    mutationFn: async ({ slug, language }: { slug: string; language?: string }) => {
      const result = await deleteCampaignAction(slug, language || locale);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: () => {
      invalidateCampaignCache(queryClient);
    },
  });
}