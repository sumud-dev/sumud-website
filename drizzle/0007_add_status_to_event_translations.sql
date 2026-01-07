-- Add status column to event_translations table
ALTER TABLE "event_translations" ADD COLUMN "status" text DEFAULT 'published';

-- Update all existing event_translations to have 'published' status
UPDATE "event_translations" SET "status" = 'published' WHERE "status" IS NULL;
