/**
 * Campaign Queries - Single Table with parentId pattern
 * Same architecture as pages: Finnish in primary, English as children with parentId
 */

import { db } from '@/src/lib/db';
import { 
  campaigns,
  type NewCampaign,
} from '@/src/lib/db/schema/campaigns';
import { eq, and, desc, like, or, isNull } from 'drizzle-orm';

// ============================================
// CAMPAIGN - SELECT Queries
// ============================================

/**
 * Get all campaigns for a specific locale
 * Returns all campaigns regardless of isActive status by default (for admin)
 */
export async function getActiveCampaigns(locale: string = 'fi', activeOnly: boolean = false) {
  const conditions: any[] = [
    eq(campaigns.language, locale)
  ];
  
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
 * Handles both locale-suffixed slugs (campaign-fi) and non-suffixed slugs (campaign)
 */
export async function getCampaignBySlug(slug: string, locale: string = 'fi') {
  // Try exact slug match first
  let [campaign] = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.slug, slug),
        eq(campaigns.language, locale)
      )
    )
    .limit(1);

  // If not found and slug doesn't end with locale, try with locale suffix
  if (!campaign && !slug.endsWith(`-${locale}`)) {
    const slugWithLocale = `${slug}-${locale}`;
    [campaign] = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.slug, slugWithLocale),
          eq(campaigns.language, locale)
        )
      )
      .limit(1);
  }

  // If still not found and slug ends with locale, try without locale suffix
  if (!campaign && slug.endsWith(`-${locale}`)) {
    const baseSlug = slug.replace(new RegExp(`-${locale}$`), '');
    [campaign] = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.slug, baseSlug),
          eq(campaigns.language, locale)
        )
      )
      .limit(1);
  }

  return campaign ?? null;
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
 * NOTE: slug is explicitly excluded from updates - slug should never change
 */
export async function updateCampaign(id: string, data: Partial<NewCampaign>) {
  // Exclude slug from updates - slug should never change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _slug, ...dataToUpdate } = data;
  
  const [updated] = await db
    .update(campaigns)
    .set({ ...dataToUpdate, updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .returning();
  
  return updated ?? null;
}

/**
 * Update campaign translation (alias for consistency)
 * NOTE: slug is explicitly excluded from updates - slug should never change
 */
export async function updateCampaignTranslation(
  campaignId: string,
  locale: string,
  data: Partial<NewCampaign>
) {
  // Exclude slug from updates - slug should never change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _slug, ...dataToUpdate } = data;
  
  const [updated] = await db
    .update(campaigns)
    .set({ ...dataToUpdate, updatedAt: new Date() })
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