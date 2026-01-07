-- Add missing columns to event_translations to match events table
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "content" text;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "author" text;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "author_name" text;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "date" timestamp;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "start_at" timestamp;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "end_at" timestamp;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "published_at" timestamp;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "featured_image" text;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "alt_texts" jsonb;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "categories" jsonb;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "locations" jsonb;
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "organizers" jsonb;

-- Copy data from linked events to translations
UPDATE event_translations et
SET 
  content = e.content,
  location = e.location,
  author = e.author,
  author_name = e.author_name,
  date = e.date,
  start_at = e.start_at,
  end_at = e.end_at,
  published_at = e.published_at,
  featured_image = e.featured_image,
  alt_texts = e.alt_texts,
  categories = e.categories,
  locations = e.locations,
  organizers = e.organizers
FROM events e
WHERE et.event_id = e.id AND et.event_id IS NOT NULL;
