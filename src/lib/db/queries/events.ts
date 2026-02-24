/**
 * Event Queries - Drizzle ORM (Refactored)
 * 
 * Handles bilingual events:
 * - Finnish events (fi) stored in events table
 * - English events (en) stored in event_translations table
 */

import { db } from '@/src/lib/db';
import { events, eventTranslations, type Event as EventType, type EventTranslation } from '@/src/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { buildEventConditions, mergeAndPaginate } from './event-filters';

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

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get Finnish events from both tables
 */
async function getFinnishEvents(
  options: EventQueryOptions,
  offset: number,
  limit: number,
  page: number
): Promise<EventsResult> {
  const eventsConditions = buildEventConditions(events, options, 'fi');
  const translationsConditions = buildEventConditions(eventTranslations, options, 'fi');

  // Get counts
  const [eventsCount, translationsCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(...eventsConditions)),
    db.select({ count: sql<number>`count(*)` })
      .from(eventTranslations)
      .where(and(...translationsConditions)),
  ]);

  const total = Number(eventsCount[0]?.count || 0) + Number(translationsCount[0]?.count || 0);

  // Fetch data
  const [eventsResult, translationsResult] = await Promise.all([
    db.select().from(events)
      .where(and(...eventsConditions))
      .orderBy(desc(events.createdAt)),
    db.select().from(eventTranslations)
      .where(and(...translationsConditions))
      .orderBy(desc(eventTranslations.createdAt)),
  ]);

  const paginatedEvents = mergeAndPaginate(
    eventsResult as (EventType | EventTranslation)[],
    translationsResult as (EventType | EventTranslation)[],
    offset,
    limit
  );

  return {
    events: paginatedEvents,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get English events from translations table
 */
async function getEnglishEvents(
  options: EventQueryOptions,
  offset: number,
  limit: number,
  page: number
): Promise<EventsResult> {
  const conditions = buildEventConditions(eventTranslations, options, 'en');

  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(eventTranslations)
    .where(and(...conditions));
  
  const total = Number(countResult[0]?.count || 0);

  const result = await db.select()
    .from(eventTranslations)
    .where(and(...conditions))
    .orderBy(desc(eventTranslations.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    events: result,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get events based on locale
 */
export async function getEvents(options: EventQueryOptions = {}): Promise<EventsResult> {
  const {
    language = 'en',
    page = 1,
    limit = 10,
    offset,
  } = options;

  const actualOffset = offset ?? (page - 1) * limit;

  try {
    if (language === 'fi') {
      return await getFinnishEvents(options, actualOffset, limit, page);
    } else {
      return await getEnglishEvents(options, actualOffset, limit, page);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

/**
 * Get all events (admin view)
 */
export async function getAllEvents(filters?: {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  language?: string;
  locale?: string;
}) {
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
 */
export async function getEventBySlug(slug: string, language: string = 'en') {
  try {
    if (language === 'fi') {
      const [eventsResult, translationsResult] = await Promise.all([
        db.select().from(events)
          .where(and(eq(events.slug, slug), eq(events.language, 'fi')))
          .limit(1),
        db.select().from(eventTranslations)
          .where(and(eq(eventTranslations.slug, slug), eq(eventTranslations.language, 'fi')))
          .limit(1),
      ]);
      return eventsResult[0] || translationsResult[0] || null;
    } else {
      const result = await db.select()
        .from(eventTranslations)
        .where(and(eq(eventTranslations.slug, slug), eq(eventTranslations.language, 'en')))
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
 */
export async function getEventById(id: string): Promise<EventType | EventTranslation | null> {
  try {
    const eventResult = await db.select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (eventResult[0]) {
      return eventResult[0];
    }

    const translationResult = await db.select()
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
  const limit = filters?.limit || 10;
  const offset = filters?.offset || 0;
  
  try {
    if (language === 'fi') {
      const categoryCondition = sql`${events.categories}::jsonb @> ${JSON.stringify([category])}`;
      const translationCategoryCondition = sql`${eventTranslations.categories}::jsonb @> ${JSON.stringify([category])}`;

      const [eventsResult, translationsResult] = await Promise.all([
        db.select().from(events)
          .where(and(eq(events.language, 'fi'), categoryCondition))
          .orderBy(desc(events.createdAt)),
        db.select().from(eventTranslations)
          .where(and(eq(eventTranslations.language, 'fi'), translationCategoryCondition))
          .orderBy(desc(eventTranslations.createdAt)),
      ]);

      return mergeAndPaginate(
        eventsResult as (EventType | EventTranslation)[],
        translationsResult as (EventType | EventTranslation)[],
        offset,
        limit
      );
    } else {
      const categoryCondition = sql`${eventTranslations.categories}::jsonb @> ${JSON.stringify([category])}`;
      
      const result = await db.select()
        .from(eventTranslations)
        .where(and(eq(eventTranslations.language, 'en'), categoryCondition))
        .orderBy(desc(eventTranslations.createdAt))
        .limit(limit)
        .offset(offset);

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

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new event based on language
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
    // Check if slug already exists in either table
    const [existingEvent, existingTranslation] = await Promise.all([
      db.select({ slug: events.slug })
        .from(events)
        .where(eq(events.slug, data.slug))
        .limit(1),
      db.select({ slug: eventTranslations.slug })
        .from(eventTranslations)
        .where(eq(eventTranslations.slug, data.slug))
        .limit(1),
    ]);

    if (existingEvent[0] || existingTranslation[0]) {
      throw new Error('An event with this slug already exists');
    }

    const targetTable = language === 'fi' ? events : eventTranslations;
    const result = await db.insert(targetTable)
      .values({ ...data, language })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating event:', error);
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
 * Update an event and sync common fields across all language versions
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
    // Find the event
    const { event: currentEvent, isInEventsTable } = await findEventById(id);
    
    if (!currentEvent || !currentEvent.slug) {
      throw new Error('Event not found');
    }

    const currentSlug = currentEvent.slug;

    // Separate fields
    const { filteredData, commonFields } = categorizeFields(data);

    // Update the current event
    await updateCurrentEvent(id, filteredData, isInEventsTable);

    // Sync common fields to all language versions
    if (Object.keys(commonFields).length > 0) {
      await syncCommonFields(commonFields, currentSlug, id);
    }

    // Return updated event
    return await fetchUpdatedEvent(id, isInEventsTable);
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
    const { event: currentEvent } = await findEventById(id);
    
    if (!currentEvent || !currentEvent.slug) {
      throw new Error('Event not found');
    }

    await Promise.all([
      db.delete(events).where(eq(events.slug, currentEvent.slug)),
      db.delete(eventTranslations).where(eq(eventTranslations.slug, currentEvent.slug)),
    ]);

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
    const result = await db.insert(eventTranslations)
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
    const result = await db.select()
      .from(eventTranslations)
      .where(and(
        eq(eventTranslations.eventId, eventId),
        eq(eventTranslations.language, language)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error fetching event translation:', error);
    throw new Error('Failed to fetch event translation');
  }
}

// ============================================================================
// UPDATE HELPER FUNCTIONS
// ============================================================================

async function findEventById(id: string) {
  const eventCheck = await db.select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (eventCheck[0]) {
    return { event: eventCheck[0], isInEventsTable: true };
  }

  const translationCheck = await db.select()
    .from(eventTranslations)
    .where(eq(eventTranslations.id, id))
    .limit(1);

  return { event: translationCheck[0] || null, isInEventsTable: false };
}

function categorizeFields(data: Record<string, unknown>) {
  const languageSpecificFields = ['title', 'description', 'content', 'location'];
  const immutableFields = ['slug', 'language'];
  const commonFields: Record<string, unknown> = {};

  const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
    if (!immutableFields.includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  Object.entries(filteredData).forEach(([key, value]) => {
    if (!languageSpecificFields.includes(key)) {
      commonFields[key] = value;
    }
  });

  return { filteredData, commonFields };
}

async function updateCurrentEvent(id: string, filteredData: Record<string, unknown>, isInEventsTable: boolean) {
  const updateData = { ...filteredData, updatedAt: new Date() };
  
  if (isInEventsTable) {
    await db.update(events).set(updateData).where(eq(events.id, id));
  } else {
    await db.update(eventTranslations).set(updateData).where(eq(eventTranslations.id, id));
  }
}

async function syncCommonFields(commonFields: Record<string, unknown>, currentSlug: string, currentId: string) {
  const updateData = { ...commonFields, updatedAt: new Date() };

  await Promise.all([
    db.update(events).set(updateData)
      .where(and(eq(events.slug, currentSlug), sql`${events.id} != ${currentId}`)),
    db.update(eventTranslations).set(updateData)
      .where(and(eq(eventTranslations.slug, currentSlug), sql`${eventTranslations.id} != ${currentId}`)),
  ]);
}

async function fetchUpdatedEvent(id: string, isInEventsTable: boolean) {
  if (isInEventsTable) {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  } else {
    const result = await db.select().from(eventTranslations).where(eq(eventTranslations.id, id)).limit(1);
    return result[0];
  }
}