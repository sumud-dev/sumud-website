-- Manual migration script to create page_builder tables only
-- Run this if the main migration fails due to existing table issues

CREATE TABLE IF NOT EXISTS "page_builder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"path" text NOT NULL,
	"language" text DEFAULT 'fi',
	"title" text NOT NULL,
	"content" jsonb,
	"metadata" jsonb,
	"seo_title" text,
	"seo_description" text,
	"featured_image" text,
	"layout" text DEFAULT 'default',
	"show_in_menu" boolean DEFAULT false NOT NULL,
	"menu_order" text,
	"author" text,
	"author_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "page_builder_slug_unique" UNIQUE("slug"),
	CONSTRAINT "page_builder_path_unique" UNIQUE("path")
);

CREATE TABLE IF NOT EXISTS "page_builder_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid,
	"language" text NOT NULL,
	"slug" text,
	"path" text,
	"title" text NOT NULL,
	"content" jsonb,
	"metadata" jsonb,
	"seo_title" text,
	"seo_description" text,
	"featured_image" text,
	"layout" text,
	"author" text,
	"author_name" text,
	"status" text DEFAULT 'published',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_language_unique" UNIQUE("page_id","language")
);

DO $$ BEGIN
 ALTER TABLE "page_builder_translations" ADD CONSTRAINT "page_builder_translations_page_id_page_builder_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_builder"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "page_builder_status_idx" ON "page_builder" USING btree ("status");
CREATE INDEX IF NOT EXISTS "page_builder_active_idx" ON "page_builder" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "page_builder_language_idx" ON "page_builder" USING btree ("language");
CREATE INDEX IF NOT EXISTS "page_builder_path_idx" ON "page_builder" USING btree ("path");
CREATE INDEX IF NOT EXISTS "page_builder_translations_language_idx" ON "page_builder_translations" USING btree ("language");
CREATE INDEX IF NOT EXISTS "page_builder_translations_page_idx" ON "page_builder_translations" USING btree ("page_id");
