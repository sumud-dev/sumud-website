-- Migration: Rename content to description in campaigns tables
-- This migration renames the 'content' JSONB column to 'description' 
-- and drops the old text 'description' column

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================

-- Check if old description column exists and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'description'
    ) THEN
        ALTER TABLE "campaigns" DROP COLUMN "description";
    END IF;
END $$;

-- Rename content column to description
ALTER TABLE "campaigns" RENAME COLUMN "content" TO "description";

-- ============================================
-- CAMPAIGN_TRANSLATIONS TABLE
-- ============================================

-- Check if old description column exists and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_translations' AND column_name = 'description'
    ) THEN
        ALTER TABLE "campaign_translations" DROP COLUMN "description";
    END IF;
END $$;

-- Rename content column to description
ALTER TABLE "campaign_translations" RENAME COLUMN "content" TO "description";
