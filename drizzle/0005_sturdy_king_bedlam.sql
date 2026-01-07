CREATE TYPE "public"."post_type" AS ENUM('article', 'news');--> statement-breakpoint
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "permissions" CASCADE;--> statement-breakpoint
DROP TABLE "role_permissions" CASCADE;--> statement-breakpoint
DROP TABLE "roles" CASCADE;--> statement-breakpoint
DROP TABLE "user_roles" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "campaign_translations" DROP CONSTRAINT "campaign_locale_unique";--> statement-breakpoint
ALTER TABLE "campaign_translations" DROP CONSTRAINT "campaign_translations_campaign_id_campaigns_id_fk";
--> statement-breakpoint
ALTER TABLE "event_translations" DROP CONSTRAINT "event_translations_event_id_events_id_fk";
--> statement-breakpoint
DROP INDEX "campaign_translations_locale_idx";--> statement-breakpoint
ALTER TABLE "post_translations" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "post_translations" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "post_translations" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "post_translations" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "campaign_translations" ALTER COLUMN "campaign_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translations" ALTER COLUMN "event_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "type" "post_type" DEFAULT 'article';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "categories" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "language" text NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "status" text DEFAULT 'published';--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "date" timestamp;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "language" text DEFAULT 'fi';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "demands" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "call_to_action" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "how_to_participate" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "resources" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "success_stories" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "targets" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "date" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "language" text NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "status" text DEFAULT 'published';--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "date" timestamp;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "start_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "end_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "alt_texts" jsonb;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "categories" jsonb;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "locations" jsonb;--> statement-breakpoint
ALTER TABLE "event_translations" ADD COLUMN "organizers" jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "date" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "alt_texts" jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "categories" jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "locations" jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "organizers" jsonb;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD CONSTRAINT "campaign_translations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_translations_language_idx" ON "campaign_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "campaigns_language_idx" ON "campaigns" USING btree ("language");--> statement-breakpoint
ALTER TABLE "post_translations" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "author";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "cover_image";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "campaign_translations" DROP COLUMN "locale";--> statement-breakpoint
ALTER TABLE "event_translations" DROP COLUMN "locale";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD CONSTRAINT "campaign_language_unique" UNIQUE("campaign_id","language");