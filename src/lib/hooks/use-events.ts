"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/react-query/query-keys";
import type {
  BaseEvent,
  EventsApiResponse,
  EventApiResponse,
  EventFilters,
} from "@/src/lib/types/event";

// API fetch functions
async function fetchEvents(filters?: EventFilters): Promise<EventsApiResponse> {
  const params = new URLSearchParams();

  if (filters?.status) params.set("status", filters.status);
  if (filters?.eventType) params.set("eventType", filters.eventType);
  if (filters?.locationMode) params.set("locationMode", filters.locationMode);
  if (filters?.language) params.set("language", filters.language);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.upcoming !== undefined) params.set("upcoming", String(filters.upcoming));
  if (filters?.featured !== undefined) params.set("featured", String(filters.featured));
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const response = await fetch(`/api/events?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  return response.json();
}

async function fetchEventBySlug(slug: string): Promise<EventApiResponse> {
  const response = await fetch(`/api/events/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }

  return response.json();
}

async function createEvent(
  data: Partial<BaseEvent>
): Promise<EventApiResponse> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create event");
  }

  return response.json();
}

async function updateEvent({
  slug,
  data,
}: {
  slug: string;
  data: Partial<BaseEvent>;
}): Promise<EventApiResponse> {
  const response = await fetch(`/api/events/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update event");
  }

  return response.json();
}

async function deleteEvent(slug: string): Promise<void> {
  const response = await fetch(`/api/events/${slug}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete event");
  }
}

// Query hooks
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => fetchEvents(filters),
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: () => fetchEventBySlug(slug),
    enabled: !!slug,
  });
}

// Mutation hooks
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      // Invalidate all event lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (data, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(
        queryKeys.events.detail(variables.slug),
        data
      );
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

// Re-export types for convenience
export type { BaseEvent, EventsApiResponse, EventFilters };
