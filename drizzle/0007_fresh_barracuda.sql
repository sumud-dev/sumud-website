CREATE TABLE "page_builder" (
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
--> statement-breakpoint
CREATE TABLE "page_builder_translations" (
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
--> statement-breakpoint
ALTER TABLE "sub_campaign_translations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sub_campaigns" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sub_campaign_translations" CASCADE;--> statement-breakpoint
DROP TABLE "sub_campaigns" CASCADE;--> statement-breakpoint
ALTER TABLE "post_translations" DROP CONSTRAINT "post_translations_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "post_translations" ALTER COLUMN "post_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_translations" ALTER COLUMN "description" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "description" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "language" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "type" text DEFAULT 'article';--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "status" text DEFAULT 'published';--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "categories" jsonb;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "language" text DEFAULT 'fi';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "page_builder_translations" ADD CONSTRAINT "page_builder_translations_page_id_page_builder_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_builder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_builder_status_idx" ON "page_builder" USING btree ("status");--> statement-breakpoint
CREATE INDEX "page_builder_active_idx" ON "page_builder" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "page_builder_language_idx" ON "page_builder" USING btree ("language");--> statement-breakpoint
CREATE INDEX "page_builder_path_idx" ON "page_builder" USING btree ("path");--> statement-breakpoint
CREATE INDEX "page_builder_translations_language_idx" ON "page_builder_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "page_builder_translations_page_idx" ON "page_builder_translations" USING btree ("page_id");--> statement-breakpoint
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_translations_language_idx" ON "post_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "post_translations_post_idx" ON "post_translations" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_translations_status_idx" ON "post_translations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_language_idx" ON "posts" USING btree ("language");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");--> statement-breakpoint
ALTER TABLE "post_translations" DROP COLUMN "locale";--> statement-breakpoint
ALTER TABLE "campaign_translations" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "content";