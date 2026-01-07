-- Remove cascade delete from event_translations foreign key
-- First drop the existing constraint
ALTER TABLE event_translations DROP CONSTRAINT IF EXISTS event_translations_event_id_events_id_fk;

-- Make event_id nullable
ALTER TABLE event_translations ALTER COLUMN event_id DROP NOT NULL;

-- Re-add the constraint with SET NULL instead of CASCADE
ALTER TABLE event_translations 
ADD CONSTRAINT event_translations_event_id_events_id_fk 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
