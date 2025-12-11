import { Database } from "@/src/lib/database.types";

// Database row type
type EventRow = Database["public"]["Tables"]["events"]["Row"];

// Re-export for convenience
export type Event = EventRow;

// Event status type
export type EventStatus = "draft" | "published" | "archived";

// Stats type for dashboard
export type EventStats = {
  total: number;
  published: number;
  drafts: number;
  archived: number;
};

// Input type for creating events
export type CreateEventData = {
  title: string;
  slug?: string;
  content: string;
  status?: EventStatus;
  featured_image?: string;
  alt_texts?: string;
  categories?: string;
  locations?: string;
  organizers?: string;
  language?: string;
  author_name?: string;
};

// Input type for updating events (all fields optional)
export type UpdateEventData = Partial<CreateEventData>;

// Response types for consistent API
export type ActionResponse<T> = {
  data: T | null;
  error: string | null;
};

export type MutationResponse = {
  success: boolean;
  error: string | null;
};

/**
 * Calculate stats from events
 */
export function calculateEventStats(events: Event[]): EventStats {
  return {
    total: events.length,
    published: events.filter((e) => e.status === "published").length,
    drafts: events.filter((e) => e.status === "draft").length,
    archived: events.filter((e) => e.status === "archived").length,
  };
}

/**
 * Get category name from event
 */
export function getEventCategoryName(event: Event): string {
  const categories = event.categories;
  if (!categories) {
    return "N/A";
  }
  return categories;
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique ID for new events
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
