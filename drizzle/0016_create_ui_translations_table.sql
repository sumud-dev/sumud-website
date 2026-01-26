-- Create UI Translations table
CREATE TABLE IF NOT EXISTS "ui_translations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "namespace" TEXT NOT NULL,
  "metadata" JSONB,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "needs_review" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "created_by" UUID,
  "updated_by" UUID,
  CONSTRAINT "ui_translations_key_language_unique" UNIQUE("key", "language")
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "ui_translations_key_idx" ON "ui_translations" ("key");
CREATE INDEX IF NOT EXISTS "ui_translations_language_idx" ON "ui_translations" ("language");
CREATE INDEX IF NOT EXISTS "ui_translations_namespace_idx" ON "ui_translations" ("namespace");
CREATE INDEX IF NOT EXISTS "ui_translations_namespace_language_idx" ON "ui_translations" ("namespace", "language");
CREATE INDEX IF NOT EXISTS "ui_translations_active_idx" ON "ui_translations" ("is_active");

-- Add comment to table
COMMENT ON TABLE "ui_translations" IS 'Stores UI translations for all application interfaces including common, admin, errors, navigation, footer, etc.';
COMMENT ON COLUMN "ui_translations"."key" IS 'Dot-notation translation key (e.g., common.loading, admin.dashboard.title)';
COMMENT ON COLUMN "ui_translations"."namespace" IS 'Top-level namespace for organization (e.g., common, admin, navigation)';
COMMENT ON COLUMN "ui_translations"."metadata" IS 'Optional metadata including placeholders, context, and translator notes';
