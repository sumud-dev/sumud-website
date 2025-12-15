// Event Types and Utilities for Supabase Events
import type { Database } from "@/src/lib/database.types";

// Database row type from Supabase
export type EventRow = Database["public"]["Tables"]["events"]["Row"];

// Event Type enum
export type EventType = 
  | "cultural"
  | "activism"
  | "education"
  | "community"
  | "fundraising"
  | "workshop"
  | "protest"
  | "exhibition"
  | "other";

// Event Location Mode
export type EventLocationMode = "in_person" | "virtual" | "hybrid";

// Event Status for public display
export type EventStatus = "draft" | "published" | "archived" | "cancelled";

// Base Event interface for the frontend (extended from Supabase schema)
export interface BaseEvent {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: EventStatus;
  featured_image: string | null;
  alt_texts: string | null;
  categories: string | null;
  locations: string | null;
  organizers: string | null;
  language: string;
  author_name: string | null;
  published_at: string | null;
  updated_at: string | null;
  
  // Extended fields for event-specific functionality
  event_type: EventType;
  location_mode: EventLocationMode;
  venue_name: string | null;
  venue_address: string | null;
  virtual_platform: string | null;
  virtual_link: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_capacity: number | null;
  current_registrations: number;
  is_featured: boolean;
  registration_required: boolean;
  registration_deadline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

// Event filters for API queries
export interface EventFilters {
  status?: EventStatus;
  eventType?: EventType;
  locationMode?: EventLocationMode;
  language?: string;
  search?: string;
  upcoming?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API Response types
export interface EventsApiResponse {
  data: BaseEvent[];
  pagination: PaginationMeta;
}

export interface EventApiResponse {
  data: BaseEvent;
}

// Event registration form data
export interface EventRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  numberOfAttendees: number;
  specialRequirements?: string;
  agreeToTerms: boolean;
}

// Constants for UI dropdowns
export const EVENT_TYPES: Record<EventType, string> = {
  cultural: "Cultural",
  activism: "Activism",
  education: "Education",
  community: "Community",
  fundraising: "Fundraising",
  workshop: "Workshop",
  protest: "Protest",
  exhibition: "Exhibition",
  other: "Other",
} as const;

export const EVENT_LOCATION_MODES: Record<EventLocationMode, string> = {
  in_person: "In Person",
  virtual: "Virtual",
  hybrid: "Hybrid",
} as const;

export const EVENT_STATUSES: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  cancelled: "Cancelled",
} as const;

// Event type colors for badges (Tailwind classes)
const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  cultural: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  activism: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  education: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  community: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  fundraising: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  workshop: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
  protest: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  exhibition: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  other: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
};

// Event type hex colors for calendar dots and inline styles
const EVENT_TYPE_HEX_COLORS: Record<EventType, string> = {
  cultural: "#9333ea",    // purple-600
  activism: "#dc2626",    // red-600
  education: "#2563eb",   // blue-600
  community: "#16a34a",   // green-600
  fundraising: "#ca8a04", // yellow-600
  workshop: "#4f46e5",    // indigo-600
  protest: "#ea580c",     // orange-600
  exhibition: "#db2777",  // pink-600
  other: "#6b7280",       // gray-500
};

// Utility functions
export function getEventTypeColor(eventType: EventType): { bg: string; text: string; border: string } {
  return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.other;
}

export function getEventTypeHexColor(eventType: EventType): string {
  return EVENT_TYPE_HEX_COLORS[eventType] || EVENT_TYPE_HEX_COLORS.other;
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventTime(timeString: string | null): string {
  if (!timeString) return "";
  
  // Handle HH:MM:SS or HH:MM format
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatEventDateTime(startDate: string, startTime: string | null, endTime: string | null): string {
  const formattedDate = formatEventDate(startDate);
  
  if (!startTime) {
    return formattedDate;
  }
  
  const formattedStartTime = formatEventTime(startTime);
  
  if (!endTime) {
    return `${formattedDate} at ${formattedStartTime}`;
  }
  
  const formattedEndTime = formatEventTime(endTime);
  return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
}

export function isEventUpcoming(startDateString: string): boolean {
  const startDate = new Date(startDateString);
  const now = new Date();
  return startDate > now;
}

export function isEventPast(startDateString: string, endDateString: string | null): boolean {
  const endDate = endDateString ? new Date(endDateString) : new Date(startDateString);
  const now = new Date();
  return endDate < now;
}

export function isEventOngoing(startDateString: string, endDateString: string | null): boolean {
  const startDate = new Date(startDateString);
  const endDate = endDateString ? new Date(endDateString) : new Date(startDateString);
  const now = new Date();
  return now >= startDate && now <= endDate;
}

export function canRegisterForEvent(event: BaseEvent): boolean {
  // Check if registration is required and still possible
  if (!event.registration_required) {
    return false;
  }
  
  // Check registration deadline
  if (event.registration_deadline) {
    const deadline = new Date(event.registration_deadline);
    if (new Date() > deadline) {
      return false;
    }
  }
  
  // Check capacity
  if (event.max_capacity && event.current_registrations >= event.max_capacity) {
    return false;
  }
  
  // Check if event is in the future
  if (!isEventUpcoming(event.start_date)) {
    return false;
  }
  
  return true;
}

export function getEventCapacityStatus(event: BaseEvent): "available" | "limited" | "full" | "unlimited" {
  if (!event.max_capacity) {
    return "unlimited";
  }
  
  const percentFilled = (event.current_registrations / event.max_capacity) * 100;
  
  if (percentFilled >= 100) {
    return "full";
  }
  
  if (percentFilled >= 80) {
    return "limited";
  }
  
  return "available";
}

// Transform Supabase row to BaseEvent
export function transformEventRow(row: EventRow): BaseEvent {
  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    content: row.content || "",
    status: (row.status as EventStatus) || "draft",
    featured_image: row.featured_image,
    alt_texts: row.alt_texts,
    categories: row.categories,
    locations: row.locations,
    organizers: row.organizers,
    language: row.language || "en",
    author_name: row.author_name,
    published_at: row.published_at,
    updated_at: row.updated_at,
    
    // Default values for extended fields (can be stored in content JSON or separate columns)
    event_type: "community" as EventType,
    location_mode: "in_person" as EventLocationMode,
    venue_name: row.locations,
    venue_address: null,
    virtual_platform: null,
    virtual_link: null,
    start_date: row.published_at || new Date().toISOString(),
    end_date: null,
    start_time: null,
    end_time: null,
    max_capacity: null,
    current_registrations: 0,
    is_featured: false,
    registration_required: false,
    registration_deadline: null,
    contact_email: null,
    contact_phone: null,
  };
}
