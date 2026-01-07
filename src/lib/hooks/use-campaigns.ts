'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { queryKeys } from '@/src/lib/react-query/query-keys';
import type { CampaignFilters } from '@/src/lib/react-query/query-keys';
import type { CampaignType, CampaignParticipationStep, CampaignResource, CampaignSuccessStory } from '@/src/types/Campaigns';

// Description can be a string or JSONB object from the database
export type CampaignDescription = string | { type: 'blocks' | 'markdown' | 'html'; data: unknown } | null;

export interface Campaign {
  id: string;
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
}

/**
 * Helper function to extract text from JSONB description field
 */
export function getDescriptionText(description: CampaignDescription): string {
  if (!description) return '';
  
  // If it's already a string, return it
  if (typeof description === 'string') return description;
  
  // If it's a JSONB object with data property
  if (typeof description === 'object' && 'data' in description) {
    if (typeof description.data === 'string') {
      return description.data;
    }
    // For blocks type, try to extract text from blocks
    if (description.type === 'blocks' && Array.isArray(description.data)) {
      return description.data.map((block: { text?: string }) => block.text || '').join(' ');
    }
  }
  
  return '';
}

/**
 * Hook to fetch campaigns with filters
 * Automatically includes the current locale in the request
 */
export function useCampaigns(filters?: CampaignFilters) {
  const locale = useLocale();
  
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.campaigns.list({ ...filters, language: filters?.language || locale }),
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.campaignType) params.append('campaignType', filters.campaignType);
      if (filters?.status) params.append('status', filters.status);
      // Use the locale if no language filter is specified
      const language = filters?.language || locale;
      params.append('language', language);
      if (filters?.isFeatured) params.append('isFeatured', String(filters.isFeatured));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const result = await response.json();
      return result.success ? result : { data: [] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: (data ?? { data: [] }) as { data: Campaign[] },
    isLoading,
    error: isError ? error : null,
  };
}

/**
 * Hook to fetch a single campaign by slug
 * Automatically includes the current locale in the request
 */
export function useCampaign(slug: string) {
  const locale = useLocale();
  
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.campaigns.detail(slug),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('language', locale);
      
      const response = await fetch(`/api/campaigns/${slug}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      
      const result = await response.json();
      return result.success ? result.data : null;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: data as Campaign | null,
    isLoading,
    error: isError ? error : null,
  };
}
