-- Add missing columns to events table and event_translations table
-- This migration updates the events schema to support the JSON import structure

-- Add excerpt column to event_translations table
ALTER TABLE "event_translations" ADD COLUMN IF NOT EXISTS "excerpt" text;

-- Add new columns to events table
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "author" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status" text;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "date" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "language" text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "event_translations_locale_idx" ON "event_translations" USING btree ("locale");
CREATE INDEX IF NOT EXISTS "event_translations_event_idx" ON "event_translations" USING btree ("event_id");
CREATE INDEX IF NOT EXISTS "events_language_idx" ON "events" USING btree ("language");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" USING btree ("status");
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "events" USING btree ("date");

