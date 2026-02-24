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
  upsertEventTranslation,
} from '@/src/lib/db/queries/events.queries';
import {
  translateContentToAllLocales,
  EVENT_TRANSLATION_CONFIG,
  type SupportedLocale,
} from '@/src/lib/services/translation.service';
import { db } from '@/src/lib/db';
import { events, eventTranslations } from '@/src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a URL-friendly slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Check if a slug already exists in the database for a specific language
 */
async function slugExistsForLanguage(slug: string, language: string): Promise<boolean> {
  if (language === 'fi') {
    // Check events table for Finnish events
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);
    if (existing.length > 0) return true;
    
    // Also check eventTranslations table for Finnish events
    const existingTranslation = await db
      .select({ id: eventTranslations.id })
      .from(eventTranslations)
      .where(
        and(
          eq(eventTranslations.slug, slug),
          eq(eventTranslations.language, 'fi')
        )
      )
      .limit(1);
    if (existingTranslation.length > 0) return true;
    
    return false;
  }
  
  // For EN: Check eventTranslations table
  const existingTranslation = await db
    .select({ id: eventTranslations.id })
    .from(eventTranslations)
    .where(
      and(
        eq(eventTranslations.slug, slug),
        eq(eventTranslations.language, language)
      )
    )
    .limit(1);
  
  return existingTranslation.length > 0;
}

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
  language: z.enum(['en', 'fi']).optional().nullable(),
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
  slug: z.string().max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  content: z.string().optional(),
  location: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  author: z.string().optional(),
  authorName: z.string().optional(),
  language: z.enum(['en', 'fi']).default('en'),
  date: z.coerce.date().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  featuredImage: z.string().max(500).optional(),
  altTexts: z.any().optional(),
  categories: z.any().optional(),
  locations: z.any().optional(),
  organizers: z.any().optional(),
  autoTranslate: z.boolean().optional(),
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
    search?: string;
    eventType?: string;
    locationMode?: string;
    upcoming?: boolean;
    featured?: boolean;
    startDate?: string;
    endDate?: string;
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
 * Create a new event with automatic translations to all locales
 */
export async function createEventAction(
  input: z.infer<typeof createEventSchema>
): Promise<ActionResult> {
  try {
    // Check permissions
    await requirePermission('create_events');

    // Validate input
    const validated = createEventSchema.parse(input);
    
    const now = new Date();
    const publishedAt = validated.status === 'published' ? now : undefined;
    const sourceLocale = (validated.language || 'fi') as SupportedLocale;
    const createdEvents: { language: string; slug: string }[] = [];

    // Generate slug from title if not provided
    let finalSlug = validated.slug?.toLowerCase() || generateSlug(validated.title);
    
    // Ensure slug is unique by adding suffix if needed
    let slugSuffix = 1;
    while (await slugExistsForLanguage(finalSlug, validated.language || 'fi')) {
      finalSlug = `${validated.slug?.toLowerCase() || generateSlug(validated.title)}-${slugSuffix}`;
      slugSuffix++;
    }

    // Base event data for insertion
    const baseEventData = {
      slug: finalSlug,
      title: validated.title,
      description: validated.description || undefined,
      content: validated.content || undefined,
      location: validated.location || undefined,
      status: validated.status,
      author: validated.author || undefined,
      authorName: validated.authorName || undefined,
      date: validated.date || undefined,
      startAt: validated.startAt || undefined,
      endAt: validated.endAt || undefined,
      publishedAt,
      featuredImage: validated.featuredImage || undefined,
      altTexts: validated.altTexts || undefined,
      categories: validated.categories || null,
      locations: validated.locations || null,
      organizers: validated.organizers || null,
    };

    // Finnish events go to events table
    // English/Arabic events go to eventTranslations table
    if (validated.language === 'fi') {
      // Create Finnish event in events table
      await createEvent({
        ...baseEventData,
        language: 'fi',
      });
      createdEvents.push({ language: 'fi', slug: finalSlug });
    } else {
      // Create English/Arabic event in eventTranslations table
      await upsertEventTranslation({
        ...baseEventData,
        eventId: undefined,
        language: validated.language!,
      });
      createdEvents.push({ language: validated.language!, slug: finalSlug });
    }

    // Auto-translate to remaining languages if enabled
    if (validated.autoTranslate) {
      try {
        const contentToTranslate: Record<string, unknown> = {
          title: validated.title,
        };
        if (validated.description) contentToTranslate.description = validated.description;
        if (validated.content) contentToTranslate.content = validated.content;
        if (validated.location) contentToTranslate.location = validated.location;

        console.log('[Event Creation] Auto-translating from', sourceLocale, contentToTranslate);
        const { translations, error: translationError } = await translateContentToAllLocales(
          contentToTranslate,
          sourceLocale,
          EVENT_TRANSLATION_CONFIG
        );

        if (translationError) {
          console.warn('[Event Creation] Translation warning:', translationError);
        }
        
        console.log('[Event Creation] All translations:', { en: !!translations.en?.title, fi: !!translations.fi?.title });

        // Insert translated versions for other locales
        const allLocales: SupportedLocale[] = ['en', 'fi'];
        const targetLocales = allLocales.filter((locale) => locale !== sourceLocale);
        
        console.log('[Event Creation] Target locales for translation:', targetLocales);

        for (const targetLocale of targetLocales) {
          const translatedContent = translations[targetLocale];
          if (!translatedContent || !translatedContent.title) {
            console.warn(`[Event Creation] Skipping ${targetLocale} - no translation available`);
            continue;
          }

          // Use the same slug for all language versions
          const translatedSlug = finalSlug;
          console.log(`[Event Creation] Using shared slug for ${targetLocale}:`, translatedSlug);
          
          // Check if this translation already exists
          const translationExists = await slugExistsForLanguage(translatedSlug, targetLocale);
          if (translationExists) {
            console.warn(`[Event Creation] Skipping ${targetLocale} - translation already exists`);
            continue;
          }

          const translatedEventData = {
            ...baseEventData,
            slug: translatedSlug,
            title: translatedContent.title as string,
            description: (translatedContent.description as string) || undefined,
            content: (translatedContent.content as string) || undefined,
            location: (translatedContent.location as string) || undefined,
          };

          console.log(`[Event Creation] Creating ${targetLocale} translation`);
          
          // Finnish events go to events table, others go to eventTranslations table
          if (targetLocale === 'fi') {
            await createEvent({
              ...translatedEventData,
              language: 'fi',
            });
          } else {
            await upsertEventTranslation({
              ...translatedEventData,
              eventId: undefined,
              language: targetLocale,
            });
          }
          
          createdEvents.push({ language: targetLocale, slug: translatedSlug });
        }
      } catch (translationError) {
        console.error('[Event Creation] Auto-translation failed:', translationError);
        // Continue without translation - don't fail the entire operation
      }
    }

    // Revalidate cache
    revalidatePath('/[locale]/events', 'page');
    revalidatePath('/[locale]/admin/events', 'page');

    return {
      success: true,
      data: { slug: finalSlug, createdEvents },
      message: createdEvents.length > 1
        ? `Event created with ${createdEvents.length} language versions`
        : 'Event created successfully',
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

    // Get the current event to know its language and slug
    const currentEvent = await getEventById(id);
    if (!currentEvent) {
      return {
        success: false,
        error: 'Event not found',
      };
    }

    // Remove null, undefined values, and immutable fields (slug only)
    // Language can be updated, slug cannot
    const updates = Object.fromEntries(
      Object.entries(validated).filter(([key, value]) => 
        value !== null && 
        value !== undefined && 
        key !== 'slug'
      )
    );

    // Update event
    const event = await updateEvent(id, updates);

    // Revalidate cache
    revalidatePath('/[locale]/admin/events', 'page');
    revalidatePath('/[locale]/events', 'page');

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
    revalidatePath('/[locale]/admin/events', 'page');
    revalidatePath('/[locale]/events', 'page');

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
