'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { queryKeys } from '@/src/lib/react-query/query-keys';
import type { EventFilters } from '@/src/lib/react-query/query-keys';
import type { BaseEvent } from '@/src/lib/types/event';

interface EventsResponse {
  data: BaseEvent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Hook to fetch events with filters
 * Automatically includes the current locale in the request
 */
export function useEvents(filters?: EventFilters) {
  const locale = useLocale();
  
  const { data, isLoading, error, isError } = useQuery<EventsResponse>({
    queryKey: queryKeys.events.list({ ...filters, language: filters?.language || locale }),
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.locationMode) params.append('locationMode', filters.locationMode);
      if (filters?.status) params.append('status', filters.status);
      // Use the locale if no language filter is specified
      const language = filters?.language || locale;
      params.append('language', language);
      if (filters?.upcoming) params.append('upcoming', String(filters.upcoming));
      if (filters?.featured) params.append('featured', String(filters.featured));
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await fetch(`/api/events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const result = await response.json();
      
      // Handle API response - normalize to consistent structure
      // API returns { events: [...], total, page, limit, pages }
      if (result.events) {
        return {
          data: result.events as BaseEvent[],
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            pages: result.pages,
          },
        };
      }
      
      // Fallback for array response (shouldn't happen but handle gracefully)
      return {
        data: Array.isArray(result) ? result : [],
        pagination: undefined,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: data ?? { data: [], pagination: undefined },
    isLoading,
    error: isError ? error : null,
  };
}

/**
 * Hook to fetch a single event by slug
 * Automatically includes the current locale in the request
 */
export function useEvent(slug: string) {
  const locale = useLocale();
  
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('language', locale);
      
      const response = await fetch(`/api/events/${slug}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      
      return response.json() as Promise<BaseEvent>;
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
