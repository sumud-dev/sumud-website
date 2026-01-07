/**
 * Event Queries - Drizzle ORM
 * 
 * Handles bilingual events:
 * - Finnish events (fi) stored in events table
 * - English translations (en) stored in event_translations table
 */

import { db } from '@/src/lib/db';
import { events, eventTranslations, type Event as EventType, type EventTranslation } from '@/src/lib/db/schema';
import { eq, and, like, desc, or, gte, lte, sql } from 'drizzle-orm';

export interface EventQueryOptions {
  search?: string;
  eventType?: string;
  locationMode?: string;
  status?: string;
  language?: string;
  upcoming?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface EventsResult {
  events: (EventType | EventTranslation)[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Get events based on locale
 * - For 'fi' (Finnish): Returns events directly from events table
 * - For 'en' (English): Returns translations from event_translations table, with base data from events
 */
export async function getEvents(options: EventQueryOptions = {}): Promise<EventsResult> {
  const {
    search,
    status,
    language,
    upcoming = false,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    offset,
  } = options;

  const actualOffset = offset ?? (page - 1) * limit;
  
  // Default to 'en' if no language specified
  const actualLanguage = language || 'en';

  try {
    if (actualLanguage === 'fi') {
      // For Finnish: Query events table directly

      // Apply filters
      const conditions = [eq(events.language, 'fi')];
      
      if (status) {
        conditions.push(eq(events.status, status));
      }

      if (upcoming) {
        conditions.push(gte(events.date, new Date()));
      }

      if (search) {
        conditions.push(
          or(
            like(events.title, `%${search}%`),
            like(events.description, `%${search}%`)
          )!
        );
      }

      // Date range filtering
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        conditions.push(gte(events.date, start));
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(events.date, end));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(and(...conditions));
      const total = Number(countResult[0]?.count) || 0;

      const result = await db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(desc(events.date))
        .limit(limit)
        .offset(actualOffset);

      return {
        events: result,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } else {
      // For English: Query event_translations table directly (has all columns now)
      const conditions = [eq(eventTranslations.language, 'en')];

      if (status) {
        conditions.push(eq(eventTranslations.status, status));
      }

      if (upcoming) {
        conditions.push(gte(eventTranslations.date, new Date()));
      }

      if (search) {
        conditions.push(
          or(
            like(eventTranslations.title, `%${search}%`),
            like(eventTranslations.description, `%${search}%`)
          )!
        );
      }

      // Date range filtering
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        conditions.push(gte(eventTranslations.date, start));
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(eventTranslations.date, end));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(eventTranslations)
        .where(and(...conditions));
      const total = Number(countResult[0]?.count) || 0;

      const result = await db
        .select()
        .from(eventTranslations)
        .where(and(...conditions))
        .orderBy(desc(eventTranslations.date))
        .limit(limit)
        .offset(actualOffset);

      return {
        events: result,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

/**
 * Get all events (admin view)
 * Always requires a locale/language to be specified
 */
export async function getAllEvents(filters?: {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  language?: string;
  locale?: string;
}) {
  // Use locale or language, default to 'en' if neither specified
  const language = filters?.locale || filters?.language || 'en';
  const limit = filters?.limit || 16;
  const page = filters?.page || 1;
  
  return getEvents({
    ...filters,
    language,
    page,
    limit,
    offset: filters?.offset,
  });
}

/**
 * Get published events
 */
export async function getPublishedEvents(filters?: {
  limit?: number;
  offset?: number;
  language?: string;
}) {
  return getEvents({
    ...filters,
    status: 'published',
    language: filters?.language || 'en',
    limit: filters?.limit || 10,
    offset: filters?.offset || 0,
  });
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(filters?: {
  limit?: number;
  language?: string;
}) {
  return getEvents({
    ...filters,
    status: 'published',
    upcoming: true,
    language: filters?.language || 'en',
    limit: filters?.limit || 10,
  });
}

/**
 * Get event by slug
 * - For 'fi': Looks up in events table
 * - For 'en': Looks up in event_translations table
 */
export async function getEventBySlug(slug: string, language: string = 'en') {
  try {
    if (language === 'fi') {
      // Query events table directly for Finnish
      const result = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.slug, slug),
            eq(events.language, 'fi')
          )
        )
        .limit(1);

      return result[0] || null;
    } else {
      // Query event_translations for English (has all columns now)
      const result = await db
        .select()
        .from(eventTranslations)
        .where(
          and(
            eq(eventTranslations.slug, slug),
            eq(eventTranslations.language, 'en')
          )
        )
        .limit(1);

      return result[0] || null;
    }
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    throw new Error('Failed to fetch event');
  }
}

/**
 * Get event by ID
 * Checks both events table (Finnish) and event_translations table (English)
 * Returns EventType | EventTranslation
 */
export async function getEventById(id: string): Promise<EventType | EventTranslation | null> {
  try {
    // First try events table (Finnish events)
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (eventResult[0]) {
      return eventResult[0];
    }

    // If not found, try event_translations table (English events)
    const translationResult = await db
      .select()
      .from(eventTranslations)
      .where(eq(eventTranslations.id, id))
      .limit(1);

    return translationResult[0] || null;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new Error('Failed to fetch event');
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(
  category: string,
  filters?: {
    limit?: number;
    offset?: number;
    language?: string;
  }
) {
  const language = filters?.language || 'en';
  
  try {
    if (language === 'fi') {
      // Query Finnish events
      const result = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.language, 'fi'),
            sql`${events.categories}::jsonb @> ${JSON.stringify([category])}`
          )
        )
        .orderBy(desc(events.date))
        .limit(filters?.limit || 10)
        .offset(filters?.offset || 0);

      return result;
    } else {
      // Query English translations (has all columns now)
      const result = await db
        .select()
        .from(eventTranslations)
        .where(
          and(
            eq(eventTranslations.language, 'en'),
            sql`${eventTranslations.categories}::jsonb @> ${JSON.stringify([category])}`
          )
        )
        .orderBy(desc(eventTranslations.date))
        .limit(filters?.limit || 10)
        .offset(filters?.offset || 0);

      return result;
    }
  } catch (error) {
    console.error('Error fetching events by category:', error);
    throw new Error('Failed to fetch events by category');
  }
}

/**
 * Search events
 */
export async function searchEvents(
  query: string,
  filters?: {
    limit?: number;
    language?: string;
  }
) {
  return getEvents({
    search: query,
    language: filters?.language || 'en',
    limit: filters?.limit || 10,
  });
}

/**
 * Create a new event (Finnish only)
 */
export async function createEvent(data: {
  slug: string;
  title: string;
  description?: string;
  content?: string;
  location?: string;
  status?: string;
  author?: string;
  authorName?: string;
  date?: Date;
  startAt?: Date;
  endAt?: Date;
  publishedAt?: Date;
  featuredImage?: string;
  altTexts?: unknown;
  categories?: unknown;
  locations?: unknown;
  organizers?: unknown;
}) {
  try {
    const result = await db
      .insert(events)
      .values({
        ...data,
        language: 'fi', // Always create Finnish events in events table
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

/**
 * Update an event
 */
export async function updateEvent(id: string, data: Partial<{
  slug: string;
  title: string;
  description: string;
  content: string;
  location: string;
  status: string;
  author: string;
  authorName: string;
  date: Date;
  startAt: Date;
  endAt: Date;
  publishedAt: Date;
  featuredImage: string;
  altTexts: unknown;
  categories: unknown;
  locations: unknown;
  organizers: unknown;
}>) {
  try {
    const result = await db
      .update(events)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string) {
  try {
    await db
      .delete(events)
      .where(eq(events.id, id));

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
}

/**
 * Create or update event translation
 */
export async function upsertEventTranslation(data: {
  eventId?: string;
  language: string;
  slug?: string;
  title: string;
  description?: string;
  excerpt?: string;
  content?: string;
  location?: string;
  status?: string;
  author?: string;
  authorName?: string;
  date?: Date;
  startAt?: Date;
  endAt?: Date;
  publishedAt?: Date;
  featuredImage?: string;
  altTexts?: unknown;
  categories?: unknown;
  locations?: unknown;
  organizers?: unknown;
}) {
  try {
    const result = await db
      .insert(eventTranslations)
      .values(data)
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting event translation:', error);
    throw new Error('Failed to upsert event translation');
  }
}

/**
 * Get event translation by event ID and language
 */
export async function getEventTranslation(eventId: string, language: string) {
  try {
    const result = await db
      .select()
      .from(eventTranslations)
      .where(
        and(
          eq(eventTranslations.eventId, eventId),
          eq(eventTranslations.language, language)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error fetching event translation:', error);
    throw new Error('Failed to fetch event translation');
  }
}
