-- Rename existing description (text) to short_description to avoid conflict
ALTER TABLE campaigns RENAME COLUMN description TO short_description;
ALTER TABLE campaign_translations RENAME COLUMN description TO short_description;

-- Rename content (jsonb) to description
ALTER TABLE campaigns RENAME COLUMN content TO description;
ALTER TABLE campaign_translations RENAME COLUMN content TO description;
