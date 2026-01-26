-- Migration: Add parentId to campaigns table for translation relationship
-- Same pattern as pages: Finnish in primary, English as children with parentId

-- Add parent_id column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES campaigns(id) ON DELETE CASCADE;

-- Create index for parent_id
CREATE INDEX IF NOT EXISTS campaigns_parent_id_idx ON campaigns(parent_id);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.parent_id IS 'Parent campaign ID for translations (null for primary language)';
