-- Migration: Convert campaigns.description from JSONB to TEXT (for TipTap HTML editor)
-- 
-- The TipTap editor documentation recommends using TEXT/LONGTEXT with HTML instead of JSON.
-- This migration converts the description field from jsonb to text for both campaigns table
-- and campaign_translations table.

-- =============================================================================
-- PART 1: campaigns table
-- =============================================================================

-- Step 1: Add new temporary text column
ALTER TABLE "campaigns" ADD COLUMN "description_text" text;

-- Step 2: Convert existing JSONB data to text
-- If description was stored as a JSONB object with structure like {type: 'html', data: '...'}
-- we extract the actual content. If it's already a string, we use it directly.
UPDATE "campaigns" 
SET "description_text" = CASE 
  WHEN jsonb_typeof("description") = 'object' AND "description"->>'data' IS NOT NULL 
    THEN "description"->>'data'
  WHEN jsonb_typeof("description") = 'string' 
    THEN "description"#>>'{}'
  ELSE NULL
END
WHERE "description" IS NOT NULL;

-- Step 3: Drop the old JSONB column
ALTER TABLE "campaigns" DROP COLUMN "description";

-- Step 4: Rename the new column to description
ALTER TABLE "campaigns" RENAME COLUMN "description_text" TO "description";

-- =============================================================================
-- PART 2: campaign_translations table (if it exists)
-- =============================================================================

-- Check if campaign_translations table exists and has a description column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'campaign_translations'
  ) THEN
    -- Step 1: Add new temporary text column
    ALTER TABLE "campaign_translations" ADD COLUMN "description_text" text;
    
    -- Step 2: Convert existing JSONB data to text
    UPDATE "campaign_translations" 
    SET "description_text" = CASE 
      WHEN jsonb_typeof("description") = 'object' AND "description"->>'data' IS NOT NULL 
        THEN "description"->>'data'
      WHEN jsonb_typeof("description") = 'string' 
        THEN "description"#>>'{}'
      ELSE NULL
    END
    WHERE "description" IS NOT NULL;
    
    -- Step 3: Drop the old JSONB column
    ALTER TABLE "campaign_translations" DROP COLUMN "description";
    
    -- Step 4: Rename the new column to description
    ALTER TABLE "campaign_translations" RENAME COLUMN "description_text" TO "description";
  END IF;
END $$;
