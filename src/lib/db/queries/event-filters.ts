/**
 * Event Filter Utilities
 * Shared filter logic for events and event_translations tables
 */

import { SQL, eq, and, like, or, gte, lte } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { EventQueryOptions } from './events.queries';

export interface FilterableEventTable {
  language: PgColumn;
  status: PgColumn;
  date: PgColumn;
  title: PgColumn;
  description: PgColumn;
  createdAt: PgColumn;
  slug: PgColumn;
  categories: PgColumn;
}

/**
 * Build common filter conditions for events
 */
export function buildEventConditions<T extends FilterableEventTable>(
  table: T,
  options: EventQueryOptions,
  language: string
): SQL[] {
  const conditions: SQL[] = [eq(table.language, language)];

  if (options.status) {
    conditions.push(eq(table.status, options.status));
  }

  if (options.upcoming) {
    conditions.push(gte(table.date, new Date()));
  }

  if (options.search) {
    conditions.push(
      or(
        like(table.title, `%${options.search}%`),
        like(table.description, `%${options.search}%`)
      )!
    );
  }

  if (options.startDate) {
    const start = new Date(options.startDate);
    start.setHours(0, 0, 0, 0);
    conditions.push(gte(table.date, start));
  }

  if (options.endDate) {
    const end = new Date(options.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(table.date, end));
  }

  return conditions;
}

/**
 * Merge results from both tables and apply pagination
 */
export function mergeAndPaginate<T>(
  eventsResult: T[],
  translationsResult: T[],
  offset: number,
  limit: number
): T[] {
  return [...eventsResult, ...translationsResult]
    .sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(offset, offset + limit);
}