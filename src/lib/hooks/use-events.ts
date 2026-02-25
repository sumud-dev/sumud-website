/**
 * React Query Hooks for Events
 * FILE: src/lib/hooks/use-events.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  fetchAllEventsAdminAction,
  fetchPublishedEventsAction,
  fetchUpcomingEventsAction,
  fetchEventBySlugAction,
  fetchEventByIdAction,
  fetchEventsByCategoryAction,
  searchEventsAction,
  getEventCountAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from '@/src/actions/events.actions';
import type { BaseEvent } from '@/src/lib/types/event';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface EventsResponse {
  events: BaseEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const eventQueryKeys = {
  allEvents: ['events'] as const,
  eventLists: () => [...eventQueryKeys.allEvents, 'list'] as const,
  eventList: (filters?: unknown) => [...eventQueryKeys.eventLists(), filters || {}] as const,
  eventDetails: () => [...eventQueryKeys.allEvents, 'detail'] as const,
  eventDetail: (eventSlug: string, language?: string) => [...eventQueryKeys.eventDetails(), eventSlug, language || 'en'] as const,
  eventDetailById: (eventId: string) => [...eventQueryKeys.eventDetails(), 'id', eventId] as const,
  eventStatistics: () => [...eventQueryKeys.allEvents, 'statistics'] as const,
  eventCount: (status?: string, language?: string) =>
    [...eventQueryKeys.eventStatistics(), 'count', status || 'all', language || 'all'] as const,
};

// ============================================================================
// CACHE HELPERS (extracted duplication)
// ============================================================================

function updateEventList(oldData: any, updater: (events: any[]) => any[]) {
  if (!oldData) return oldData;
  
  // Handle regular paginated data
  if (oldData.events && Array.isArray(oldData.events)) {
    return {
      ...oldData,
      events: updater(oldData.events),
    };
  }
  
  // Handle infinite query data
  if (oldData.pages && Array.isArray(oldData.pages)) {
    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        events: Array.isArray(page.events) ? updater(page.events) : page.events,
      })),
    };
  }
  
  return oldData;
}

function addEventOptimistically(queryClient: any, newEvent: any) {
  queryClient.setQueriesData(
    { queryKey: eventQueryKeys.eventLists() },
    (oldData: any) => updateEventList(oldData, (events) => [newEvent, ...events])
  );
}

function updateEventOptimistically(queryClient: any, eventId: string, updates: any) {
  queryClient.setQueriesData(
    { queryKey: eventQueryKeys.eventLists() },
    (oldData: any) => updateEventList(oldData, (events) =>
      events.map((event: any) =>
        event.id === eventId ? { ...event, ...updates, updatedAt: new Date() } : event
      )
    )
  );
}

function removeEventOptimistically(queryClient: any, eventId: string) {
  queryClient.setQueriesData(
    { queryKey: eventQueryKeys.eventLists() },
    (oldData: any) => updateEventList(oldData, (events) =>
      events.filter((event: any) => event.id !== eventId)
    )
  );
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useEvents(filters?: {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  language?: string;
  locale?: string;
  search?: string;
  eventType?: string;
  locationMode?: string;
  upcoming?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
}) {
  const currentLocale = useLocale();
  const language = filters?.language || filters?.locale || currentLocale;

  return useQuery<EventsResponse>({
    queryKey: eventQueryKeys.eventList({ ...filters, language }),
    queryFn: async () => {
      const result = await fetchAllEventsAdminAction({ ...filters, language });
      if (!result.success) throw new Error(result.error);
      return result.data as EventsResponse;
    },
  });
}

export function usePublishedEvents(filters?: {
  limit?: number;
  offset?: number;
  language?: string;
}) {
  const currentLocale = useLocale();
  const language = filters?.language || currentLocale;

  return useQuery({
    queryKey: eventQueryKeys.eventList({ ...filters, status: 'published', language }),
    queryFn: async () => {
      const result = await fetchPublishedEventsAction({ ...filters, language });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useUpcomingEvents(filters?: {
  limit?: number;
  language?: string;
}) {
  const currentLocale = useLocale();
  const language = filters?.language || currentLocale;

  return useQuery({
    queryKey: eventQueryKeys.eventList({ ...filters, upcoming: true, language }),
    queryFn: async () => {
      const result = await fetchUpcomingEventsAction({ ...filters, language });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useEventBySlug(eventSlug: string, language?: string) {
  return useQuery({
    queryKey: eventQueryKeys.eventDetail(eventSlug, language),
    queryFn: async () => {
      const result = await fetchEventBySlugAction(eventSlug, language);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(eventSlug),
  });
}

export function useEventById(eventId: string) {
  return useQuery({
    queryKey: eventQueryKeys.eventDetailById(eventId),
    queryFn: async () => {
      const result = await fetchEventByIdAction(eventId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(eventId),
  });
}

export function useEventsByCategory(
  category: string,
  filters?: {
    limit?: number;
    offset?: number;
    language?: string;
  }
) {
  const currentLocale = useLocale();
  const language = filters?.language || currentLocale;

  return useQuery({
    queryKey: eventQueryKeys.eventList({ ...filters, category, language }),
    queryFn: async () => {
      const result = await fetchEventsByCategoryAction(category, { ...filters, language });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(category),
  });
}

export function useSearchEvents(
  query: string,
  filters?: {
    limit?: number;
    language?: string;
  }
) {
  const currentLocale = useLocale();
  const language = filters?.language || currentLocale;

  return useQuery({
    queryKey: eventQueryKeys.eventList({ ...filters, search: query, language }),
    queryFn: async () => {
      const result = await searchEventsAction(query, { ...filters, language });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(query?.trim()),
  });
}

export function useEventCount(status?: string, language?: string) {
  const currentLocale = useLocale();
  const eventLanguage = language || currentLocale;

  return useQuery({
    queryKey: eventQueryKeys.eventCount(status, eventLanguage),
    queryFn: async () => {
      const result = await getEventCountAction(status, eventLanguage);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useInfiniteEvents(filters?: {
  limit?: number;
  offset?: number;
  status?: string;
  language?: string;
  locale?: string;
}) {
  const currentLocale = useLocale();
  const language = filters?.language || filters?.locale || currentLocale;

  return useInfiniteQuery({
    queryKey: eventQueryKeys.eventList({ ...filters, language }),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchAllEventsAdminAction({
        ...filters,
        language,
        page: pageParam,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    getNextPageParam: (lastPage: any) => {
      return lastPage.pagination && lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const currentLocale = useLocale();

  return useMutation({
    mutationFn: async (eventInput: Parameters<typeof createEventAction>[0]) => {
      const result = await createEventAction(eventInput);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (eventInput) => {
      await queryClient.cancelQueries({ queryKey: eventQueryKeys.allEvents });

      const optimisticEvent = {
        id: `temp-${Date.now()}`,
        ...eventInput,
        language: eventInput.language || currentLocale,
        status: eventInput.status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addEventOptimistically(queryClient, optimisticEvent);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
      toast.success(result.message || 'Event created successfully');
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
      toast.error(error.message);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      updateData,
    }: {
      eventId: string;
      updateData: Parameters<typeof updateEventAction>[1];
    }) => {
      const result = await updateEventAction(eventId, updateData);
      if (!result.success) throw new Error(result.error);
      return { ...result, eventId };
    },
    onMutate: async ({ eventId, updateData }) => {
      await queryClient.cancelQueries({ queryKey: eventQueryKeys.allEvents });
      updateEventOptimistically(queryClient, eventId, updateData);
    },
    onSuccess: (result) => {
      const statusMessages: Record<string, string> = {
        published: 'Event published successfully',
        draft: 'Event unpublished successfully',
        archived: 'Event archived successfully',
      };

      const event = result.data as { status?: string } | undefined;
      const message = event?.status && statusMessages[event.status]
        ? statusMessages[event.status]
        : result.message || 'Event updated successfully';

      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
      toast.success(message);
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
      toast.error(error.message);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const result = await deleteEventAction(eventId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (eventId: string) => {
      await queryClient.cancelQueries({ queryKey: eventQueryKeys.allEvents });
      removeEventOptimistically(queryClient, eventId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
      toast.success(result.message || 'Event deleted successfully');
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
      toast.error(error.message);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function usePrefetchEvent() {
  const queryClient = useQueryClient();

  return (eventSlug: string, language?: string) => {
    queryClient.prefetchQuery({
      queryKey: eventQueryKeys.eventDetail(eventSlug, language),
      queryFn: async () => {
        const result = await fetchEventBySlugAction(eventSlug, language);
        if (!result.success) throw new Error('Event not found');
        return result.data;
      },
    });
  };
}

export function useInvalidateEventCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAllEvents: () => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.allEvents });
    },
    invalidateEventLists: () => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.eventLists() });
    },
    invalidateEventDetail: (eventSlug: string) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.eventDetail(eventSlug) });
    },
  };
}