-- Migration: fill NULL slugs in events and enforce NOT NULL + unique constraint
BEGIN;

-- Set slug for rows where it's NULL. Use a stable value based on the id so it's unique.
UPDATE public.events
SET slug = 'event-' || LEFT(id::text, 8)
WHERE slug IS NULL;

-- Make slug NOT NULL
ALTER TABLE public.events
  ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_slug_unique'
  ) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_slug_unique UNIQUE (slug);
  END IF;
END$$;

COMMIT;
