/**
 * Next.js Server Actions for Events
 * 
 * Server Actions provide a simpler alternative to API routes
 * for mutations and form submissions with better type safety.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/src/lib/auth/server-auth';
import {
  getAllEvents,
  getEventBySlug,
  getEventById,
  getPublishedEvents,
  getUpcomingEvents,
  getEventsByCategory,
  searchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/src/lib/db/queries/events';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const eventBaseSchema = z.object({
  slug: z.string().max(200).regex(/^[a-z0-9-]*$/, 'Slug must be lowercase alphanumeric with hyphens').optional().nullable(),
  title: z.string().max(500).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  content: z.string().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional().nullable(),
  author: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  language: z.enum(['en', 'fi', 'ar']).optional().nullable(),
  date: z.coerce.date().optional().nullable(),
  startAt: z.coerce.date().optional().nullable(),
  endAt: z.coerce.date().optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
  featuredImage: z.string().max(500).optional().nullable(),
  altTexts: z.any().optional().nullable(),
  categories: z.any().optional().nullable(),
  locations: z.any().optional().nullable(),
  organizers: z.any().optional().nullable(),
});

const createEventSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  content: z.string().optional(),
  location: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  author: z.string().optional(),
  authorName: z.string().optional(),
  language: z.enum(['en', 'fi', 'ar']).default('en'),
  date: z.coerce.date().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  featuredImage: z.string().max(500).optional(),
  altTexts: z.any().optional(),
  categories: z.any().optional(),
  locations: z.any().optional(),
  organizers: z.any().optional(),
});

// ============================================
// RESULT TYPE
// ============================================

type ActionResult<T = unknown> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; errors?: Record<string, string[]> };

// ============================================
// EVENT ACTIONS - READ
// ============================================

/**
 * Fetch all events (public read access - no auth required)
 * This allows anyone to view events regardless of status
 */
export async function fetchAllEventsAdminAction(
  filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    status?: string;
    language?: string;
    locale?: string;
  }
): Promise<ActionResult> {
  try {
    // No permission check - public read access allowed
    const page = filters?.page || 1;
    const limit = filters?.limit || 16;
    const offset = filters?.offset ?? (page - 1) * limit;
    
    const result = await getAllEvents({
      ...filters,
      page,
      limit,
      offset,
    });
    
    return {
      success: true,
      data: {
        events: result.events,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching all events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}

/**
 * Fetch all published events with optional filters
 */
export async function fetchPublishedEventsAction(
  filters?: {
    limit?: number;
    offset?: number;
    language?: string;
  }
): Promise<ActionResult> {
  try {
    const events = await getPublishedEvents(filters);
    
    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error('Error fetching published events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}

/**
 * Fetch upcoming events
 */
export async function fetchUpcomingEventsAction(
  filters?: {
    limit?: number;
    language?: string;
  }
): Promise<ActionResult> {
  try {
    const events = await getUpcomingEvents(filters);
    
    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch upcoming events',
    };
  }
}

/**
 * Fetch event by slug
 */
export async function fetchEventBySlugAction(
  slug: string
): Promise<ActionResult> {
  try {
    if (!slug) {
      return {
        success: false,
        error: 'Slug is required',
      };
    }

    const event = await getEventBySlug(slug);
    
    if (!event) {
      return {
        success: false,
        error: 'Event not found',
      };
    }

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event',
    };
  }
}

/**
 * Fetch event by ID
 */
export async function fetchEventByIdAction(
  id: string
): Promise<ActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID is required',
      };
    }

    const event = await getEventById(id);
    
    if (!event) {
      return {
        success: false,
        error: 'Event not found',
      };
    }

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event',
    };
  }
}

/**
 * Fetch events by category
 */
export async function fetchEventsByCategoryAction(
  category: string,
  filters?: {
    limit?: number;
    offset?: number;
    language?: string;
  }
): Promise<ActionResult> {
  try {
    if (!category) {
      return {
        success: false,
        error: 'Category is required',
      };
    }

    const events = await getEventsByCategory(category, filters);
    
    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error('Error fetching events by category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}

/**
 * Search events
 */
export async function searchEventsAction(
  query: string,
  filters?: {
    limit?: number;
    language?: string;
  }
): Promise<ActionResult> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error: 'Search query is required',
      };
    }

    const events = await searchEvents(query, filters);
    
    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error('Error searching events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search events',
    };
  }
}

/**
 * Get event count
 */
export async function getEventCountAction(
  status?: string,
  language?: string
): Promise<ActionResult> {
  try {
    const { db } = await import('@/src/lib/db');
    const { events } = await import('@/src/lib/db/schema');
    const { eq, and, sql } = await import('drizzle-orm');
    
    const whereConditions: ReturnType<typeof eq>[] = [];
    if (language) {
      whereConditions.push(eq(events.language, language));
    }
    if (status) {
      whereConditions.push(eq(events.status, status));
    }
    
    const baseQuery = db.select({ count: sql<number>`count(*)` }).from(events);
    const result = whereConditions.length > 0
      ? await baseQuery.where(and(...whereConditions))
      : await baseQuery;
    
    const count = result[0]?.count || 0;
    
    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error('Error getting event count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get event count',
    };
  }
}

// ============================================
// EVENT ACTIONS - WRITE (Admin Only)
// ============================================

/**
 * Create a new event
 */
export async function createEventAction(
  input: z.infer<typeof createEventSchema>
): Promise<ActionResult> {
  try {
    // Check permissions
    await requirePermission('create_events');

    // Validate input
    const validated = createEventSchema.parse(input);

    // Create event
    const event = await createEvent({
      ...validated,
      slug: validated.slug.toLowerCase(),
    });

    // Revalidate cache
    revalidatePath('/admin/events');
    revalidatePath('/events');

    return {
      success: true,
      data: event,
      message: 'Event created successfully',
    };
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return {
        success: false,
        error: 'Validation failed',
        errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    };
  }
}

/**
 * Update an event
 */
export async function updateEventAction(
  id: string,
  input: z.infer<typeof eventBaseSchema>
): Promise<ActionResult> {
  try {
    // Check permissions
    await requirePermission('edit_events');

    if (!id) {
      return {
        success: false,
        error: 'Event ID is required',
      };
    }

    // Validate input
    const validated = eventBaseSchema.parse(input);

    // Remove null values to match updateEvent's expected type
    const updates = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== null)
    );

    // Update event
    const event = await updateEvent(id, updates);

    // Revalidate cache
    revalidatePath('/admin/events');
    revalidatePath('/events');
    if (input.slug) {
      revalidatePath(`/events/${input.slug}`);
    }

    return {
      success: true,
      data: event,
      message: 'Event updated successfully',
    };
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return {
        success: false,
        error: 'Validation failed',
        errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    };
  }
}

/**
 * Delete an event
 */
export async function deleteEventAction(
  id: string
): Promise<ActionResult> {
  try {
    // Check permissions
    await requirePermission('delete_events');

    if (!id) {
      return {
        success: false,
        error: 'Event ID is required',
      };
    }

    // Delete event
    await deleteEvent(id);

    // Revalidate cache
    revalidatePath('/admin/events');
    revalidatePath('/events');

    return {
      success: true,
      data: null,
      message: 'Event deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event',
    };
  }
}

// ============================================
// TYPE EXPORTS
// ============================================

export type { Event, EventStatus } from '@/src/lib/db/schema';
