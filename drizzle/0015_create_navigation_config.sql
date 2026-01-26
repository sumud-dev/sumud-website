-- Navigation Configuration Table Migration
-- Stores header and footer navigation configurations in the database

CREATE TABLE IF NOT EXISTS navigation_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Config type: 'header' | 'footer'
  config_type TEXT NOT NULL,
  
  -- Language for this configuration
  language TEXT NOT NULL DEFAULT 'fi',
  
  -- Site name (for header)
  site_name TEXT,
  
  -- Logo URL
  logo TEXT,
  
  -- Navigation items (main navigation links for header)
  navigation_items JSONB,
  
  -- Footer-specific link groups
  quick_links JSONB,
  get_involved_links JSONB,
  resource_links JSONB,
  legal_links JSONB,
  
  -- Social links (footer)
  social_links JSONB,
  
  -- Newsletter configuration (footer)
  newsletter_title TEXT,
  newsletter_subtitle TEXT,
  
  -- Copyright text (footer)
  copyright TEXT,
  
  -- Description (footer)
  description TEXT,
  
  -- Contact information (footer)
  contact_email TEXT,
  contact_phone TEXT,
  contact_location TEXT,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on config type + language
  CONSTRAINT navigation_config_type_language_unique UNIQUE (config_type, language)
);

-- Indexes
CREATE INDEX IF NOT EXISTS navigation_config_type_idx ON navigation_config(config_type);
CREATE INDEX IF NOT EXISTS navigation_config_language_idx ON navigation_config(language);
CREATE INDEX IF NOT EXISTS navigation_config_active_idx ON navigation_config(is_active);
