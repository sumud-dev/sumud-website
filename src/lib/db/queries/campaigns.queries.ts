/**
 * Campaign Queries - Single Table with parentId pattern
 * Same architecture as pages: Finnish in primary, English as children with parentId
 */

import { db } from '@/src/lib/db';
import { 
  campaigns,
  type NewCampaign,
} from '@/src/lib/db/schema/campaigns';
import { eq, and, desc, like, or, sql, isNull } from 'drizzle-orm';

// ============================================
// CAMPAIGN - SELECT Queries
// ============================================

/**
 * Get all campaigns for a specific locale
 */
export async function getActiveCampaigns(locale: string = 'fi', activeOnly: boolean = false) {
  const conditions: any[] = [eq(campaigns.language, locale)];
  
  if (activeOnly) {
    conditions.push(eq(campaigns.isActive, true));
  }

  return await db
    .select()
    .from(campaigns)
    .where(and(...conditions))
    .orderBy(desc(campaigns.isFeatured), desc(campaigns.createdAt));
}

/**
 * Get featured campaigns only
 */
export async function getFeaturedCampaigns(locale: string = 'fi') {
  return await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.language, locale),
        eq(campaigns.isActive, true),
        eq(campaigns.isFeatured, true)
      )
    )
    .orderBy(desc(campaigns.createdAt))
    .limit(3);
}

/**
 * Get campaign by slug and language
 */
export async function getCampaignBySlug(slug: string, locale: string = 'fi') {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.slug, slug),
        eq(campaigns.language, locale)
      )
    )
    .limit(1);

  return campaign ?? null;
}

/**
 * Get primary campaign (Finnish) by slug
 */
export async function getPrimaryCampaignBySlug(slug: string) {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.slug, slug),
        isNull(campaigns.parentId) // Only primary campaigns (any language)
      )
    )
    .limit(1);

  return campaign ?? null;
}

/**
 * Get all translations for a campaign
 */
export async function getCampaignTranslations(primaryCampaignId: string) {
  return await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.parentId, primaryCampaignId));
}

/**
 * Get campaign with all translations (for admin)
 */
export async function getCampaignWithAllTranslations(slug: string) {
  const primary = await getPrimaryCampaignBySlug(slug); // Gets primary in any language
  
  if (!primary) return null;

  const translations = await getCampaignTranslations(primary.id);

  return {
    primary,
    translations,
  };
}

/**
 * Get complete campaign - alias for getCampaignBySlug
 */
export async function getCompleteCampaign(slug: string, locale: string = 'fi') {
  return getCampaignBySlug(slug, locale);
}

/**
 * Search campaigns by title/description
 */
export async function searchCampaigns(query: string, locale: string = 'fi') {
  return await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.language, locale),
        eq(campaigns.isActive, true),
        or(
          like(campaigns.title, `%${query}%`),
          like(campaigns.description, `%${query}%`)
        )
      )
    );
}

/**
 * Get campaigns by category
 */
export async function getCampaignsByCategory(category: string, locale: string = 'fi') {
  return await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.language, locale),
        eq(campaigns.category, category),
        eq(campaigns.isActive, true)
      )
    )
    .orderBy(desc(campaigns.createdAt));
}

// ============================================
// CAMPAIGN - INSERT/CREATE
// ============================================

/**
 * Create a new campaign with translations
 */
export async function createCampaign(
  campaignData: NewCampaign,
  translations: Array<{
    locale: string;
    title: string;
    description?: string; // HTML string from TipTap editor
    demands?: any;
    callToAction?: any;
    howToParticipate?: any;
    resources?: any;
    successStories?: any;
    targets?: any;
    seoTitle?: string;
    seoDescription?: string;
  }>
) {
  // Use first translation as primary (can be any language)
  const primaryTranslation = translations[0];
  const primaryLocale = primaryTranslation.locale;
  
  // Helper to convert empty strings to null/undefined for optional fields
  const emptyToNull = <T>(value: T | string | null | undefined): T | null => {
    if (value === '' || value === null || value === undefined) return null;
    return value as T;
  };
  
  // Ensure base slug doesn't have locale suffix
  const baseSlug = campaignData.slug.replace(/-(?:en|fi)$/, '');
  
  // Create primary campaign (whichever language is first) with slug-locale format
  const [newCampaign] = await db
    .insert(campaigns)
    .values({
      slug: `${baseSlug}-${primaryLocale}`, // Add locale suffix to slug
      category: emptyToNull(campaignData.category),
      campaignType: emptyToNull(campaignData.campaignType),
      iconName: emptyToNull(campaignData.iconName),
      isActive: campaignData.isActive,
      isFeatured: campaignData.isFeatured,
      status: campaignData.status,
      metadata: campaignData.metadata,
      // Primary campaign fields
      language: primaryLocale,
      parentId: null, // Explicitly set as null for primary
      title: primaryTranslation.title,
      description: primaryTranslation.description,
      demands: primaryTranslation.demands,
      callToAction: primaryTranslation.callToAction,
      howToParticipate: primaryTranslation.howToParticipate,
      resources: primaryTranslation.resources,
      successStories: primaryTranslation.successStories,
      targets: primaryTranslation.targets,
      seoTitle: emptyToNull(primaryTranslation.seoTitle),
      seoDescription: emptyToNull(primaryTranslation.seoDescription),
    })
    .returning();

  // Create translations (all languages except primary)
  const otherTranslations = translations.slice(1); // Skip first one
  
  if (otherTranslations.length > 0) {
    await db.insert(campaigns).values(
      otherTranslations.map(t => ({
        // Generate unique slug for translation by appending language code
        slug: `${baseSlug}-${t.locale}`,
        category: emptyToNull(campaignData.category),
        campaignType: emptyToNull(campaignData.campaignType),
        iconName: emptyToNull(campaignData.iconName),
        isActive: campaignData.isActive,
        isFeatured: campaignData.isFeatured,
        status: campaignData.status,
        metadata: campaignData.metadata,
        // Translation fields
        parentId: newCampaign.id, // Link to primary campaign
        language: t.locale,
        title: t.title,
        description: t.description,
        demands: t.demands,
        callToAction: t.callToAction,
        howToParticipate: t.howToParticipate,
        resources: t.resources,
        successStories: t.successStories,
        targets: t.targets,
        seoTitle: emptyToNull(t.seoTitle),
        seoDescription: emptyToNull(t.seoDescription),
      }))
    );
  }

  return newCampaign;
}

// ============================================
// CAMPAIGN - UPDATE
// ============================================

/**
 * Update campaign (works for both primary and translations)
 */
export async function updateCampaign(id: string, data: Partial<NewCampaign>) {
  const [updated] = await db
    .update(campaigns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .returning();
  
  return updated ?? null;
}

/**
 * Update campaign translation (alias for consistency)
 */
export async function updateCampaignTranslation(
  campaignId: string,
  locale: string,
  data: Partial<NewCampaign>
) {
  const [updated] = await db
    .update(campaigns)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(campaigns.id, campaignId),
        eq(campaigns.language, locale)
      )
    )
    .returning();
  
  return updated ?? null;
}

// ============================================
// CAMPAIGN - DELETE
// ============================================

/**
 * Delete campaign and all translations (CASCADE handles translations)
 */
export async function deleteCampaign(id: string) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

/**
 * Delete single translation
 */
export async function deleteCampaignTranslation(id: string) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

// ============================================
// UTILITY QUERIES
// ============================================

/**
 * Get available locales for a campaign
 */
export async function getCampaignLocales(campaignId: string) {
  // Get all campaigns with this ID or parentId
  const result = await db
    .select({ language: campaigns.language })
    .from(campaigns)
    .where(
      or(
        eq(campaigns.id, campaignId),
        eq(campaigns.parentId, campaignId)
      )
    );
  
  return result.map(r => r.language).filter(Boolean);
}

/**
 * Count campaigns by status
 */
export async function countCampaignsByStatus() {
  const result = await db
    .select({
      status: campaigns.status,
      count: sql<number>`count(*)`,
    })
    .from(campaigns)
    .groupBy(campaigns.status);
  
  return result;
}

/**
 * Toggle campaign active status
 */
export async function toggleCampaignActive(id: string) {
  const [campaign] = await db
    .select({ isActive: campaigns.isActive })
    .from(campaigns)
    .where(eq(campaigns.id, id));

  if (!campaign) return null;

  const [updated] = await db
    .update(campaigns)
    .set({ 
      isActive: !campaign.isActive,
      updatedAt: new Date() 
    })
    .where(eq(campaigns.id, id))
    .returning();

  return updated;
}

/**
 * Check if campaign slug exists
 */
export async function campaignSlugExists(slug: string, language?: string): Promise<boolean> {
  const conditions = language
    ? and(eq(campaigns.slug, slug), eq(campaigns.language, language))
    : eq(campaigns.slug, slug);

  const [exists] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(conditions)
    .limit(1);

  return !!exists;
}