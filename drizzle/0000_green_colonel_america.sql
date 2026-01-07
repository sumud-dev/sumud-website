CREATE TABLE IF NOT EXISTS "post_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"author" text,
	"cover_image" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" jsonb,
	"demands" jsonb,
	"call_to_action" jsonb,
	"how_to_participate" jsonb,
	"resources" jsonb,
	"success_stories" jsonb,
	"targets" jsonb,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_locale_unique" UNIQUE("campaign_id","locale")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" text,
	"campaign_type" text,
	"icon_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_campaign_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_campaign_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" jsonb,
	"call_to_action" jsonb,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_campaign_locale_unique" UNIQUE("sub_campaign_id","locale")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"type" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_campaign_slug_unique" UNIQUE("campaign_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"location" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'post_translations_post_id_posts_id_fk'
	) THEN
		ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END$$;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'campaign_translations_campaign_id_campaigns_id_fk'
	) THEN
		ALTER TABLE "campaign_translations" ADD CONSTRAINT "campaign_translations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END$$;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'sub_campaign_translations_sub_campaign_id_sub_campaigns_id_fk'
	) THEN
		ALTER TABLE "sub_campaign_translations" ADD CONSTRAINT "sub_campaign_translations_sub_campaign_id_sub_campaigns_id_fk" FOREIGN KEY ("sub_campaign_id") REFERENCES "public"."sub_campaigns"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END$$;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'sub_campaigns_campaign_id_campaigns_id_fk'
	) THEN
		ALTER TABLE "sub_campaigns" ADD CONSTRAINT "sub_campaigns_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END$$;--> statement-breakpoint
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_translations_locale_idx" ON "campaign_translations" USING btree ("locale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_translations_campaign_idx" ON "campaign_translations" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaigns_category_idx" ON "campaigns" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaigns_active_idx" ON "campaigns" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaigns_featured_idx" ON "campaigns" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_campaign_translations_locale_idx" ON "sub_campaign_translations" USING btree ("locale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_campaign_translations_sub_campaign_idx" ON "sub_campaign_translations" USING btree ("sub_campaign_id");--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_campaigns' AND column_name = 'order'
  ) THEN
    ALTER TABLE "sub_campaigns" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;
  END IF;
END$$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_campaigns_campaign_order_idx" ON "sub_campaigns" USING btree ("campaign_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_campaigns_campaign_idx" ON "sub_campaigns" USING btree ("campaign_id");