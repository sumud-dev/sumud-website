/**
 * Event Types and Utilities
 * Complete event interface with all properties
 */

export interface BaseEvent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  eventType?: string;
  status?: string;
  // Extended properties (snake_case from API)
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  event_type?: string;
  location_mode?: string;
  is_featured?: boolean;
  featured_image?: string;
  venue_name?: string;
  venue_address?: string;
  virtual_link?: string;
  virtual_platform?: string;
  contact_email?: string;
  contact_phone?: string;
  categories?: string | string[];
  registration_required?: boolean;
  registration_deadline?: string;
  max_capacity?: number;
  current_registrations?: number;
  // CamelCase variants from API
  featuredImage?: string;
  date?: string;
  startAt?: string;
  endAt?: string;
}

export type EventType = 'online' | 'offline' | 'hybrid';
export type EventLocationMode = 'physical' | 'online' | 'hybrid';

export const EVENT_TYPES: Record<EventType, string> = {
  online: 'Online Event',
  offline: 'In-Person Event',
  hybrid: 'Hybrid Event',
};

export const EVENT_LOCATION_MODES: Record<EventLocationMode, string> = {
  physical: 'Physical Location',
  online: 'Online Only',
  hybrid: 'Hybrid Format',
};

/**
 * Get event type label
 */
export function getEventTypeLabel(eventType?: string): string {
  return EVENT_TYPES[eventType as EventType] || 'Event';
}

/**
 * Get location mode label
 */
export function getLocationModeLabel(mode?: string): string {
  return EVENT_LOCATION_MODES[mode as EventLocationMode] || 'Location';
}

/**
 * Format event date range
 */
export function formatEventDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return '';

  if (!endDate) {
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const end = new Date(endDate);
  if (isNaN(end.getTime())) {
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const sameDay = start.toDateString() === end.toDateString();
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameDay) {
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} - ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/**
 * Check if event is ongoing
 */
export function isEventOngoing(startDate?: string, endDate?: string): boolean {
  if (!startDate) return false;

  const now = new Date();
  const start = new Date(startDate);

  if (isNaN(start.getTime())) return false;

  if (now < start) return false;

  if (!endDate) return true;

  const end = new Date(endDate);
  if (isNaN(end.getTime())) return true;

  return now <= end;
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(startDate?: string): boolean {
  if (!startDate) return false;

  const now = new Date();
  const start = new Date(startDate);

  if (isNaN(start.getTime())) return false;

  return now < start;
}

/**
 * Format event date (single date)
 */
export function formatEventDate(date?: string): string {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format event time
 */
export function formatEventTime(time?: string): string {
  if (!time) return '';
  
  // Handle time string (e.g., "14:30:00" or ISO datetime)
  try {
    // Try parsing as a full datetime first
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    // If it's just a time string (HH:MM:SS), parse it manually
    const [hours, minutes] = time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const tempDate = new Date();
      tempDate.setHours(hours, minutes, 0);
      return tempDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch {
    // Fall through to return empty string
  }

  return '';
}

/**
 * Check if event accepts registrations
 */
export function canRegisterForEvent(event: BaseEvent): boolean {
  // @ts-ignore - Extended event properties
  const registrationRequired = event.registration_required;
  // @ts-ignore - Extended event properties
  const registrationDeadline = event.registration_deadline;
  // @ts-ignore - Extended event properties
  const maxCapacity = event.max_capacity;
  // @ts-ignore - Extended event properties
  const currentRegistrations = event.current_registrations || 0;

  if (!registrationRequired) return false;

  // Check if event hasn't started
  // @ts-ignore - Extended event properties
  if (!isEventUpcoming(event.start_date)) return false;

  // Check registration deadline
  if (registrationDeadline && !isEventUpcoming(registrationDeadline)) {
    return false;
  }

  // Check capacity
  if (maxCapacity && currentRegistrations >= maxCapacity) {
    return false;
  }

  return true;
}

/**
 * Get event type color classes
 */
export function getEventTypeColor(eventType?: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (eventType) {
    case 'online':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'offline':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    case 'hybrid':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
  }
}

/**
 * Get event type hex color
 */
export function getEventTypeHexColor(eventType?: string): string {
  switch (eventType) {
    case 'online':
      return '#3B82F6'; // blue
    case 'offline':
      return '#10B981'; // green
    case 'hybrid':
      return '#8B5CF6'; // purple
    default:
      return '#6B7280'; // gray
  }
}

/**
 * Event registration form data
 */
export interface EventRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberOfAttendees: number;
  specialRequirements: string;
  agreeToTerms: boolean;
}
