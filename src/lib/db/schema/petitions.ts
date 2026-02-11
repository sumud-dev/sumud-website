import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// PETITIONS TABLE (Single-table translation pattern with parentId)
// ============================================
export const petitions = pgTable('petitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(), // Format: "petition-name-locale"

  // Parent petition ID for translations (null for primary Finnish petitions)
  parentId: uuid('parent_id')
    .references((): any => petitions.id, { onDelete: 'cascade' }),

  // Language (primary language for this petition - typically 'fi')
  language: text('language').default('fi'),

  // Core content (translatable fields)
  title: text('title'),

  // Rich content - HTML from TipTap editor
  description: text('description'),

  // Petition specific fields
  goal: text('goal'), // What the petition aims to achieve
  recipient: text('recipient'), // Who receives the petition (e.g., "Finnish Parliament", "Ministry of Justice")
  targetSignatures: integer('target_signatures').default(1000),

  // Status flags
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: text('status').default('draft').notNull(), // draft, active, closed, successful

  // Categorization
  category: text('category'), // e.g., "human-rights", "environment", "education"

  // Visual & UI
  featuredImage: text('featured_image'),

  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),

  // Metadata
  metadata: jsonb('metadata').$type<{
    image?: string;
    video?: string;
    tags?: string[];
    customFields?: Record<string, unknown>;
  }>(),

  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'), // Optional: track creator (references users table)
  updatedBy: uuid('updated_by'), // Optional: track last editor (references users table)
}, (t) => ({
  // Indexes for common queries
  languageIdx: index('petitions_language_idx').on(t.language),
  statusIdx: index('petitions_status_idx').on(t.status),
  activeIdx: index('petitions_active_idx').on(t.isActive),
  featuredIdx: index('petitions_featured_idx').on(t.isFeatured),
  parentIdIdx: index('petitions_parent_id_idx').on(t.parentId),
}));

// ============================================
// PETITION SIGNATURES TABLE
// ============================================
export const petitionSignatures = pgTable('petition_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  petitionId: uuid('petition_id')
    .notNull()
    .references(() => petitions.id, { onDelete: 'cascade' }),

  // Signer information
  name: text('name').notNull(),
  email: text('email').notNull(),
  country: text('country'),
  comment: text('comment'),

  // Privacy & verification
  isPublic: boolean('is_public').default(true), // Whether name/comment can be displayed publicly
  isVerified: boolean('is_verified').default(false), // Email verification status

  // Tracking (for duplicate prevention and analytics)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Locale of the signer (for analytics)
  locale: text('locale'),

  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  // Indexes for common queries
  petitionIdx: index('petition_signatures_petition_idx').on(t.petitionId),
  emailIdx: index('petition_signatures_email_idx').on(t.email),
  createdAtIdx: index('petition_signatures_created_at_idx').on(t.createdAt),
}));

// ============================================
// RELATIONS
// ============================================
export const petitionsRelations = relations(petitions, ({ one, many }) => ({
  // Self-referencing relation for translations
  parent: one(petitions, {
    fields: [petitions.parentId],
    references: [petitions.id],
    relationName: 'translations',
  }),
  translations: many(petitions, {
    relationName: 'translations',
  }),
  // Signatures relation
  signatures: many(petitionSignatures),
}));

export const petitionSignaturesRelations = relations(petitionSignatures, ({ one }) => ({
  petition: one(petitions, {
    fields: [petitionSignatures.petitionId],
    references: [petitions.id],
  }),
}));

// ============================================
// TYPE EXPORTS
// ============================================
export type Petition = typeof petitions.$inferSelect;
export type NewPetition = typeof petitions.$inferInsert;

export type PetitionSignature = typeof petitionSignatures.$inferSelect;
export type NewPetitionSignature = typeof petitionSignatures.$inferInsert;

// ============================================
// HELPER TYPES FOR QUERIES
// ============================================
export type PetitionWithTranslations = Petition & {
  translations: Petition[];
};

export type PetitionWithSignatures = Petition & {
  signatures: PetitionSignature[];
  signatureCount?: number;
};

export type LocalizedPetition = Petition & {
  translation?: Petition;
};
