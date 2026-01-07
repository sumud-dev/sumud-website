# Events Schema & Data Migration Documentation

## Summary
Updated the events database schema to match the JSON export structure. The schema now properly handles all event data fields with metadata stored in JSONB format for flexibility.

## Key Changes

### Schema Updates
**File:** [src/lib/db/schema/events.ts](src/lib/db/schema/events.ts)

#### Events Table
- **id**: Changed from UUID to text (uses slug as primary key)
- **Added columns:**
  - `author` (text) - Event author/creator
  - `status` (text) - Publication status (e.g., 'publish')
  - `date` (timestamp) - Event date
  - `language` (text) - Event language (e.g., 'en', 'fi')
- **Removed columns:**
  - `location` (now in metadata.locations array)
  - `start_date`, `end_date` (date field covers event date)
- **metadata** (jsonb) - Stores:
  - `categories`: Array of event categories
  - `locations`: Array of location strings
  - `organizers`: Array of organizer names
  - `images`: Object with `featured` URL and `altTexts` array
  - `author`: Author reference

#### Event Translations Table
- **Added column:**
  - `excerpt` (text) - Short description of the event

### Database Migration
**File:** `drizzle/0003_fluffy_chat.sql`

Migration script handles:
1. Converting event IDs from UUID to text
2. Adding new columns: author, status, date, language
3. Removing old columns: location, start_date, end_date
4. Adding excerpt to translations
5. Updating foreign key references

## JSON to Database Mapping

```
JSON Field          → Database Location
─────────────────────────────────────────
id                  → (not stored, slug used as id)
title               → event_translations.title
content             → event_translations.description
excerpt             → event_translations.excerpt
slug                → events.slug
author              → events.author
status              → events.status
date                → events.date
language            → events.language
categories[]        → events.metadata.categories
locations[]         → events.metadata.locations
organizers[]        → events.metadata.organizers
images              → events.metadata.images
```

## Data Migration Script
**File:** `scripts/migrate-events.ts`

The migration script:
1. Reads the JSON export file
2. Validates required fields (slug, title, content)
3. Creates event records with slug as ID
4. Creates corresponding translation records
5. Stores flexible data (categories, locations, organizers, images) in metadata JSONB
6. Reports success/error counts

### Usage
```bash
npm run ts-node scripts/migrate-events.ts
```

## Benefits

✓ **Flexibility**: JSONB metadata can handle future event fields without schema changes
✓ **Multilingual**: Event translations support multiple languages via locale field
✓ **Consistency**: Matches existing campaign and post schema patterns
✓ **Data Preservation**: All JSON data fields are preserved in the schema
✓ **Minimal Changes**: Follows existing codebase conventions

## Notes

- Uses slug as primary key for simplicity and URL consistency
- Metadata JSONB allows schema evolution without migrations
- Event translations table ensures language-specific content
- Maintains consistency with existing campaigns and posts tables
