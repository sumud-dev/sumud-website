-- Migration: Update events table to match current schema
-- Adds missing columns: title, description, content, author_name, start_at, end_at, published_at, featured_image, alt_texts, categories, locations, organizers
-- Renames: start_date -> start_at, end_date -> end_at
-- Updates metadata columns

BEGIN;

-- Drop old columns if they exist (backup important data first if needed)
ALTER TABLE IF EXISTS "events" DROP COLUMN IF EXISTS "start_date" CASCADE;
ALTER TABLE IF EXISTS "events" DROP COLUMN IF EXISTS "end_date" CASCADE;
ALTER TABLE IF EXISTS "events" DROP COLUMN IF EXISTS "metadata" CASCADE;

-- Add new columns
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "content" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "author_name" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "author" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'draft';
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'en';
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "date" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "start_at" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "end_at" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "published_at" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "featured_image" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "alt_texts" jsonb;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "categories" jsonb;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "locations" jsonb;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "organizers" jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "events_date_desc_idx" ON "events" ("date" DESC, "created_at" DESC);
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "events_language_idx" ON "events" ("language");
CREATE INDEX IF NOT EXISTS "events_published_at_idx" ON "events" ("published_at");

COMMIT;
