import { pgTable, text, timestamp, uuid, boolean, jsonb, unique, index } from 'drizzle-orm/pg-core';

// ============================================
// CORE CAMPAIGNS TABLE
// ============================================
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  
  // Language (primary language for this campaign - typically 'fi')
  language: text('language').default('fi'),
  
  // Core content (translatable fields stored here for primary language)
  title: text('title'),
  
  // Rich content (renamed from 'content')
  description: jsonb('description').$type<{
    type: 'blocks' | 'markdown' | 'html';
    data: unknown;
  }>(),
  
  demands: jsonb('demands').$type<Array<{
    id: string;
    title: string;
    description?: string;
    order?: number;
  }>>(),
  
  callToAction: jsonb('call_to_action').$type<{
    primary?: { text: string; url?: string; action?: string };
    secondary?: { text: string; url?: string; action?: string };
  }>(),
  
  howToParticipate: jsonb('how_to_participate').$type<Array<{
    id: string;
    title: string;
    description: string;
    order?: number;
    icon?: string;
  }>>(),
  
  resources: jsonb('resources').$type<Array<{
    id: string;
    title: string;
    type: 'link' | 'document' | 'video';
    url: string;
    description?: string;
  }>>(),
  
  successStories: jsonb('success_stories').$type<Array<{
    id: string;
    title: string;
    content: string;
    date?: string;
    image?: string;
  }>>(),
  
  targets: jsonb('targets').$type<Array<{
    id: string;
    name: string;
    type?: string;
    contact?: string;
    description?: string;
  }>>(),
  
  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  
  // Categorization
  category: text('category'), // Consider ENUM if fixed set
  campaignType: text('campaign_type'), // Consider ENUM
  
  // Visual & UI
  iconName: text('icon_name'),
  featuredImage: text('featured_image'),
  
  // Author info
  author: text('author'),
  authorName: text('author_name'),
  
  // Status flags
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: text('status').default('draft').notNull(), // draft, active, archived
  
  // Metadata
  metadata: jsonb('metadata').$type<{
    image?: string;
    video?: string;
    tags?: string[];
    customFields?: Record<string, unknown>;
  }>(),
  
  // Dates
  date: timestamp('date'),
  publishedAt: timestamp('published_at'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'), // Optional: track creator
  updatedBy: uuid('updated_by'), // Optional: track last editor
}, (t) => ({
  // Indexes for common queries
  categoryIdx: index('campaigns_category_idx').on(t.category),
  statusIdx: index('campaigns_status_idx').on(t.status),
  activeIdx: index('campaigns_active_idx').on(t.isActive),
  featuredIdx: index('campaigns_featured_idx').on(t.isFeatured),
  languageIdx: index('campaigns_language_idx').on(t.language),
}));

// ============================================
// CAMPAIGN TRANSLATIONS
// ============================================
export const campaignTranslations = pgTable('campaign_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id')
    .references(() => campaigns.id, { onDelete: 'set null' }),
  language: text('language').notNull(), // e.g., 'en', 'fi', 'ar'
  
  // Core content (same fields as campaigns table)
  slug: text('slug'),
  title: text('title').notNull(),
  
  // Rich content (renamed from 'content')
  description: jsonb('description').$type<{
    type: 'blocks' | 'markdown' | 'html';
    data: unknown;
  }>(),
  
  demands: jsonb('demands').$type<Array<{
    id: string;
    title: string;
    description?: string;
    order?: number;
  }>>(),
  
  callToAction: jsonb('call_to_action').$type<{
    primary?: { text: string; url?: string; action?: string };
    secondary?: { text: string; url?: string; action?: string };
  }>(),
  
  howToParticipate: jsonb('how_to_participate').$type<Array<{
    id: string;
    title: string;
    description: string;
    order?: number;
    icon?: string;
  }>>(),
  
  resources: jsonb('resources').$type<Array<{
    id: string;
    title: string;
    type: 'link' | 'document' | 'video';
    url: string;
    description?: string;
  }>>(),
  
  successStories: jsonb('success_stories').$type<Array<{
    id: string;
    title: string;
    content: string;
    date?: string;
    image?: string;
  }>>(),
  
  targets: jsonb('targets').$type<Array<{
    id: string;
    name: string;
    type?: string;
    contact?: string;
    description?: string;
  }>>(),
  
  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  
  // Visual & UI (can be different per translation)
  featuredImage: text('featured_image'),
  
  // Author info
  author: text('author'),
  authorName: text('author_name'),
  
  // Status
  status: text('status').default('published'),
  
  // Dates
  date: timestamp('date'),
  publishedAt: timestamp('published_at'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  campaignLanguageUnique: unique('campaign_language_unique').on(t.campaignId, t.language),
  languageIdx: index('campaign_translations_language_idx').on(t.language),
  campaignIdx: index('campaign_translations_campaign_idx').on(t.campaignId),
}));

// ============================================
// TYPE EXPORTS
// ============================================
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

export type CampaignTranslation = typeof campaignTranslations.$inferSelect;
export type NewCampaignTranslation = typeof campaignTranslations.$inferInsert;

// ============================================
// HELPER TYPES FOR QUERIES
// ============================================
export type CampaignWithTranslations = Campaign & {
  translations: CampaignTranslation[];
};

export type LocalizedCampaign = Campaign & {
  translation: CampaignTranslation;
};