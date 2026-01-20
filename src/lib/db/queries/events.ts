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
      // For Finnish: Query both events table and event_translations table

      // Apply filters for events table
      const eventsConditions = [eq(events.language, 'fi')];
      
      if (status) {
        eventsConditions.push(eq(events.status, status));
      }

      if (upcoming) {
        eventsConditions.push(gte(events.date, new Date()));
      }

      if (search) {
        eventsConditions.push(
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
        eventsConditions.push(gte(events.date, start));
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        eventsConditions.push(lte(events.date, end));
      }

      // Apply filters for event_translations table
      const translationsConditions = [eq(eventTranslations.language, 'fi')];
      
      if (status) {
        translationsConditions.push(eq(eventTranslations.status, status));
      }

      if (upcoming) {
        translationsConditions.push(gte(eventTranslations.date, new Date()));
      }

      if (search) {
        translationsConditions.push(
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
        translationsConditions.push(gte(eventTranslations.date, start));
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        translationsConditions.push(lte(eventTranslations.date, end));
      }

      // Get counts from both tables
      const [eventsCountResult, translationsCountResult] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(events)
          .where(and(...eventsConditions)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(eventTranslations)
          .where(and(...translationsConditions)),
      ]);
      
      const eventsCount = Number(eventsCountResult[0]?.count) || 0;
      const translationsCount = Number(translationsCountResult[0]?.count) || 0;
      const total = eventsCount + translationsCount;

      // Fetch from both tables
      const [eventsResult, translationsResult] = await Promise.all([
        db
          .select()
          .from(events)
          .where(and(...eventsConditions))
          .orderBy(desc(events.createdAt)),
        db
          .select()
          .from(eventTranslations)
          .where(and(...translationsConditions))
          .orderBy(desc(eventTranslations.createdAt)),
      ]);

      // Merge and sort by createdAt (latest created first)
      const allEvents = [...eventsResult, ...translationsResult]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(actualOffset, actualOffset + limit);

      return {
        events: allEvents,
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
        .orderBy(desc(eventTranslations.createdAt))
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
      // Query both events table and event_translations table for Finnish
      const [eventsResult, translationsResult] = await Promise.all([
        db
          .select()
          .from(events)
          .where(
            and(
              eq(events.slug, slug),
              eq(events.language, 'fi')
            )
          )
          .limit(1),
        db
          .select()
          .from(eventTranslations)
          .where(
            and(
              eq(eventTranslations.slug, slug),
              eq(eventTranslations.language, 'fi')
            )
          )
          .limit(1),
      ]);

      return eventsResult[0] || translationsResult[0] || null;
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
      // Query Finnish events from both tables
      const [eventsResult, translationsResult] = await Promise.all([
        db
          .select()
          .from(events)
          .where(
            and(
              eq(events.language, 'fi'),
              sql`${events.categories}::jsonb @> ${JSON.stringify([category])}`
            )
          )
          .orderBy(desc(events.createdAt)),
        db
          .select()
          .from(eventTranslations)
          .where(
            and(
              eq(eventTranslations.language, 'fi'),
              sql`${eventTranslations.categories}::jsonb @> ${JSON.stringify([category])}`
            )
          )
          .orderBy(desc(eventTranslations.createdAt)),
      ]);

      // Merge and sort by createdAt (latest created first)
      const allEvents = [...eventsResult, ...translationsResult]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10));

      return allEvents;
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
        .orderBy(desc(eventTranslations.createdAt))
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
 * Create a new event based on language
 * - Finnish (fi): Creates in events table
 * - English (en): Creates in event_translations table
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
  language?: string;
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
  const language = data.language || 'fi';
  
  try {
    if (language === 'fi') {
      // Finnish events go to events table
      const result = await db
        .insert(events)
        .values({
          ...data,
          language: 'fi',
        })
        .returning();

      return result[0];
    } else {
      // English/Arabic events go to event_translations table
      const result = await db
        .insert(eventTranslations)
        .values({
          ...data,
          language,
        })
        .returning();

      return result[0];
    }
  } catch (error) {
    console.error('Error creating event:', error);
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        throw new Error('An event with this slug already exists');
      }
      throw new Error(`Failed to create event: ${error.message}`);
    }
    throw new Error('Failed to create event');
  }
}

/**
 * Update an event and optionally sync common fields across all language versions
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
  language: string;
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
    // First, find the event to get its slug
    let currentEvent: EventType | EventTranslation | null = null;
    let isInEventsTable = false;

    // Check events table
    const eventCheck = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (eventCheck[0]) {
      currentEvent = eventCheck[0];
      isInEventsTable = true;
    } else {
      // Check translations table
      const translationCheck = await db
        .select()
        .from(eventTranslations)
        .where(eq(eventTranslations.id, id))
        .limit(1);
      
      if (translationCheck[0]) {
        currentEvent = translationCheck[0];
        isInEventsTable = false;
      }
    }

    if (!currentEvent) {
      throw new Error('Event not found');
    }

    const currentSlug = currentEvent.slug;

    // Separate language-specific fields from common fields
    const languageSpecificFields = ['title', 'description', 'content', 'location'];
    const commonFields: Partial<typeof data> = {};
    const specificFields: Partial<typeof data> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (languageSpecificFields.includes(key)) {
        specificFields[key as keyof typeof data] = value;
      } else {
        commonFields[key as keyof typeof data] = value;
      }
    });

    // Update the current event with all fields
    if (isInEventsTable) {
      await db
        .update(events)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id));
    } else {
      await db
        .update(eventTranslations)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(eventTranslations.id, id));
    }

    // Sync common fields (status, dates, images, etc.) to all language versions with the same slug
    if (Object.keys(commonFields).length > 0) {
      const updateData = {
        ...commonFields,
        updatedAt: new Date(),
      };

      // Update other events in events table with same slug
      await db
        .update(events)
        .set(updateData)
        .where(
          and(
            eq(events.slug, currentSlug),
            sql`${events.id} != ${id}`
          )
        );

      // Update other events in translations table with same slug
      await db
        .update(eventTranslations)
        .set(updateData)
        .where(
          and(
            eq(eventTranslations.slug, currentSlug),
            sql`${eventTranslations.id} != ${id}`
          )
        );
    }

    // Fetch and return the updated event
    if (isInEventsTable) {
      const result = await db
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1);
      return result[0];
    } else {
      const result = await db
        .select()
        .from(eventTranslations)
        .where(eq(eventTranslations.id, id))
        .limit(1);
      return result[0];
    }
  } catch (error) {
    console.error('Error updating event:', error);
    throw error instanceof Error ? error : new Error('Failed to update event');
  }
}

/**
 * Delete an event and all its language versions
 */
export async function deleteEvent(id: string) {
  try {
    // First, find the event to get its slug
    let currentSlug: string | null = null;
    let isInEventsTable = false;

    // Check events table
    const eventCheck = await db
      .select({ slug: events.slug })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (eventCheck[0]) {
      currentSlug = eventCheck[0].slug;
      isInEventsTable = true;
    } else {
      // Check translations table
      const translationCheck = await db
        .select({ slug: eventTranslations.slug })
        .from(eventTranslations)
        .where(eq(eventTranslations.id, id))
        .limit(1);
      
      if (translationCheck[0]) {
        currentSlug = translationCheck[0].slug;
        isInEventsTable = false;
      }
    }

    if (!currentSlug) {
      throw new Error('Event not found');
    }

    // Delete all events with the same slug from both tables (all language versions)
    await db
      .delete(events)
      .where(eq(events.slug, currentSlug));

    await db
      .delete(eventTranslations)
      .where(eq(eventTranslations.slug, currentSlug));

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error instanceof Error ? error : new Error('Failed to delete event');
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
