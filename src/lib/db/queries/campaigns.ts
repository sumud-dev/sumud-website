/**
 * Campaign Queries - Drizzle ORM
 * 
 * Handles bilingual campaigns:
 * - Finnish campaigns (fi) stored in campaigns table
 * - English translations (en) stored in campaign_translations table
 */

import { db } from '@/src/lib/db';
import { 
  campaigns, 
  campaignTranslations,
  type NewCampaign,
  type Campaign,
  type CampaignTranslation,
} from '@/src/lib/db/schema';
import { eq, and, desc, asc, like, sql, or } from 'drizzle-orm';

// ============================================
// CAMPAIGN - SELECT Queries
// ============================================

/**
 * Get all campaigns for a specific locale (includes all statuses for admin)
 * - For 'fi' (Finnish): Returns campaigns directly from campaigns table
 * - For other locales: Returns translations from campaign_translations table
 * @param locale - The locale to fetch campaigns for
 * @param activeOnly - If true, only return active campaigns (for public pages)
 */
export async function getActiveCampaigns(locale: string = 'en', activeOnly: boolean = false) {
  // First, try to get campaigns from campaigns table with matching language
  const baseCampaigns = await db
    .select({
      id: campaigns.id,
      campaignId: campaigns.id,
      slug: campaigns.slug,
      title: campaigns.title,
      description: campaigns.description,
      demands: campaigns.demands,
      callToAction: campaigns.callToAction,
      howToParticipate: campaigns.howToParticipate,
      resources: campaigns.resources,
      successStories: campaigns.successStories,
      targets: campaigns.targets,
      featuredImage: campaigns.featuredImage,
      seoTitle: campaigns.seoTitle,
      seoDescription: campaigns.seoDescription,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      status: campaigns.status,
      category: campaigns.category,
      campaignType: campaigns.campaignType,
      iconName: campaigns.iconName,
      isFeatured: campaigns.isFeatured,
      isActive: campaigns.isActive,
    })
    .from(campaigns)
    .where(
      activeOnly 
        ? and(eq(campaigns.language, locale), eq(campaigns.isActive, true))
        : eq(campaigns.language, locale)
    )
    .orderBy(desc(campaigns.isFeatured), desc(campaigns.createdAt));

  // Then, get campaigns from campaign_translations table
  const translatedCampaigns = await db
    .select({
      id: campaignTranslations.id,
      campaignId: campaignTranslations.campaignId,
      slug: campaigns.slug,
      title: campaignTranslations.title,
      description: campaignTranslations.description,
      demands: campaignTranslations.demands,
      callToAction: campaignTranslations.callToAction,
      howToParticipate: campaignTranslations.howToParticipate,
      resources: campaignTranslations.resources,
      successStories: campaignTranslations.successStories,
      targets: campaignTranslations.targets,
      featuredImage: campaignTranslations.featuredImage,
      seoTitle: campaignTranslations.seoTitle,
      seoDescription: campaignTranslations.seoDescription,
      createdAt: campaignTranslations.createdAt,
      updatedAt: campaignTranslations.updatedAt,
      status: campaigns.status,
      category: campaigns.category,
      campaignType: campaigns.campaignType,
      iconName: campaigns.iconName,
      isFeatured: campaigns.isFeatured,
      isActive: campaigns.isActive,
    })
    .from(campaignTranslations)
    .innerJoin(campaigns, eq(campaignTranslations.campaignId, campaigns.id))
    .where(
      activeOnly 
        ? and(eq(campaignTranslations.language, locale), eq(campaigns.isActive, true))
        : eq(campaignTranslations.language, locale)
    )
    .orderBy(desc(campaignTranslations.createdAt));
  
  // Combine both results
  return [...baseCampaigns, ...translatedCampaigns];
}

/**
 * Get featured campaigns only
 * - For 'fi': From campaigns table
 * - For 'en': From campaign_translations table
 */
export async function getFeaturedCampaigns(locale: string = 'en') {
  if (locale === 'fi') {
    return await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.isActive, true),
          eq(campaigns.isFeatured, true)
        )
      )
      .orderBy(desc(campaigns.createdAt))
      .limit(3);
  } else {
    // For English, we need to join to get featured status from campaigns
    return await db
      .select({
        id: campaignTranslations.id,
        campaignId: campaignTranslations.campaignId,
        slug: campaignTranslations.slug,
        title: campaignTranslations.title,
        description: campaignTranslations.description,
        demands: campaignTranslations.demands,
        callToAction: campaignTranslations.callToAction,
        howToParticipate: campaignTranslations.howToParticipate,
        resources: campaignTranslations.resources,
        successStories: campaignTranslations.successStories,
        targets: campaignTranslations.targets,
        featuredImage: campaignTranslations.featuredImage,
        status: campaignTranslations.status,
        createdAt: campaignTranslations.createdAt,
        // From campaigns table
        iconName: campaigns.iconName,
        category: campaigns.category,
        campaignType: campaigns.campaignType,
        isFeatured: campaigns.isFeatured,
        isActive: campaigns.isActive,
      })
      .from(campaignTranslations)
      .leftJoin(campaigns, eq(campaignTranslations.campaignId, campaigns.id))
      .where(
        and(
          eq(campaignTranslations.language, 'en'),
          eq(campaigns.isActive, true),
          eq(campaigns.isFeatured, true)
        )
      )
      .orderBy(desc(campaignTranslations.createdAt))
      .limit(3);
  }
}

/**
 * Get campaign by slug with full details
 * - For 'fi': Looks up in campaigns table
 * - For 'en': Looks up in campaigns table and joins with campaign_translations
 * - Falls back to original language if translation not found
 */
export async function getCampaignBySlug(slug: string, locale: string = 'en') {
  if (locale === 'fi') {
    // Query campaigns table directly for Finnish
    const result = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, slug))
      .limit(1);
    
    return result[0] ?? null;
  } else {
    // Query campaign_translations for requested locale with campaign base data
    // Look up by campaign slug (not translation slug) for consistency
    const result = await db
      .select({
        // Translation fields
        id: campaignTranslations.id,
        campaignId: campaignTranslations.campaignId,
        slug: campaigns.slug, // Use campaign slug for consistency
        title: campaignTranslations.title,
        description: campaignTranslations.description,
        demands: campaignTranslations.demands,
        callToAction: campaignTranslations.callToAction,
        howToParticipate: campaignTranslations.howToParticipate,
        resources: campaignTranslations.resources,
        successStories: campaignTranslations.successStories,
        targets: campaignTranslations.targets,
        featuredImage: campaignTranslations.featuredImage,
        seoTitle: campaignTranslations.seoTitle,
        seoDescription: campaignTranslations.seoDescription,
        createdAt: campaignTranslations.createdAt,
        updatedAt: campaignTranslations.updatedAt,
        // Campaign base fields
        status: campaigns.status,
        category: campaigns.category,
        campaignType: campaigns.campaignType,
        iconName: campaigns.iconName,
        isFeatured: campaigns.isFeatured,
        isActive: campaigns.isActive,
      })
      .from(campaignTranslations)
      .innerJoin(campaigns, eq(campaignTranslations.campaignId, campaigns.id))
      .where(
        and(
          eq(campaigns.slug, slug),
          eq(campaignTranslations.language, locale)
        )
      )
      .limit(1);

    // If translation not found, fallback to original campaign in campaigns table
    if (!result[0]) {
      const fallbackResult = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.slug, slug))
        .limit(1);
      
      return fallbackResult[0] ?? null;
    }

    return result[0];
  }
}

/**
 * Get campaign with ALL translations (for admin/editing)
 */
export async function getCampaignWithAllTranslations(campaignId: string) {
  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign[0]) return null;

  const translations = await db
    .select()
    .from(campaignTranslations)
    .where(eq(campaignTranslations.campaignId, campaignId));

  return {
    ...campaign[0],
    translations,
  };
}

/**
 * Search campaigns by title/description
 * - For 'fi': Search in campaigns table
 * - For 'en': Search in campaign_translations table
 */
export async function searchCampaigns(query: string, locale: string = 'en') {
  if (locale === 'fi') {
    return await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.isActive, true),
          or(
            like(campaigns.title, `%${query}%`),
            like(campaigns.description, `%${query}%`)
          )
        )
      );
  } else {
    return await db
      .select()
      .from(campaignTranslations)
      .where(
        and(
          eq(campaignTranslations.language, 'en'),
          or(
            like(campaignTranslations.title, `%${query}%`),
            like(campaignTranslations.description, `%${query}%`)
          )
        )
      );
  }
}

/**
 * Get campaigns by category
 * - For 'fi': From campaigns table
 * - For 'en': From campaign_translations with join to get category
 */
export async function getCampaignsByCategory(
  category: string, 
  locale: string = 'en'
) {
  if (locale === 'fi') {
    return await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.category, category),
          eq(campaigns.isActive, true)
        )
      )
      .orderBy(desc(campaigns.createdAt));
  } else {
    return await db
      .select({
        id: campaignTranslations.id,
        campaignId: campaignTranslations.campaignId,
        slug: campaignTranslations.slug,
        title: campaignTranslations.title,
        description: campaignTranslations.description,
        featuredImage: campaignTranslations.featuredImage,
        status: campaignTranslations.status,
        createdAt: campaignTranslations.createdAt,
        iconName: campaigns.iconName,
        category: campaigns.category,
      })
      .from(campaignTranslations)
      .leftJoin(campaigns, eq(campaignTranslations.campaignId, campaigns.id))
      .where(
        and(
          eq(campaigns.category, category),
          eq(campaigns.isActive, true),
          eq(campaignTranslations.language, 'en')
        )
      )
      .orderBy(desc(campaignTranslations.createdAt));
  }
}

// ============================================
// COMPLETE CAMPAIGN
// ============================================

/**
 * Get complete campaign - alias for getCampaignBySlug (sub-campaigns removed)
 * This is the main query for displaying a campaign page
 */
export async function getCompleteCampaign(slug: string, locale: string = 'en') {
  return getCampaignBySlug(slug, locale);
}

// ============================================
// CAMPAIGN - INSERT/CREATE
// ============================================

/**
 * Create a new campaign with translations
 * - Finnish (fi) content is stored in the campaigns table
 * - Other languages are stored in campaign_translations table
 */
export async function createCampaign(
  campaignData: NewCampaign,
  translations: Array<{
    locale: string;
    title: string;
    description?: any;
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
  // Find Finnish translation to store in campaigns table
  const finnishTranslation = translations.find(t => t.locale === 'fi');
  const otherTranslations = translations.filter(t => t.locale !== 'fi');
  
  // Prepare campaign data with Finnish content if available
  const campaignInsertData: NewCampaign = {
    ...campaignData,
    language: 'fi',
    // If Finnish translation exists, use it; otherwise use first translation
    title: finnishTranslation?.title || translations[0]?.title,
    description: finnishTranslation?.description || translations[0]?.description,
    demands: finnishTranslation?.demands || translations[0]?.demands,
    callToAction: finnishTranslation?.callToAction || translations[0]?.callToAction,
    howToParticipate: finnishTranslation?.howToParticipate || translations[0]?.howToParticipate,
    resources: finnishTranslation?.resources || translations[0]?.resources,
    successStories: finnishTranslation?.successStories || translations[0]?.successStories,
    targets: finnishTranslation?.targets || translations[0]?.targets,
    seoTitle: finnishTranslation?.seoTitle || translations[0]?.seoTitle,
    seoDescription: finnishTranslation?.seoDescription || translations[0]?.seoDescription,
  };

  // Insert campaign
  const [newCampaign] = await db
    .insert(campaigns)
    .values(campaignInsertData)
    .returning();

  // Insert non-Finnish translations (including English if Finnish was provided)
  // Also insert Finnish as a translation record for consistency
  const translationRecords = translations.map(t => ({
    campaignId: newCampaign.id,
    language: t.locale,
    slug: campaignData.slug,
    title: t.title,
    description: t.description,
    demands: t.demands,
    callToAction: t.callToAction,
    howToParticipate: t.howToParticipate,
    resources: t.resources,
    successStories: t.successStories,
    targets: t.targets,
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
  }));

  if (translationRecords.length > 0) {
    await db.insert(campaignTranslations).values(translationRecords);
  }

  return newCampaign;
}

// ============================================
// CAMPAIGN - UPDATE
// ============================================

/**
 * Update campaign base fields
 */
export async function updateCampaign(
  id: string, 
  data: Partial<NewCampaign>
) {
  const [updated] = await db
    .update(campaigns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .returning();
  
  return updated ?? null;
}

/**
 * Update campaign translation
 */
export async function updateCampaignTranslation(
  campaignId: string,
  locale: string,
  data: Partial<{
    title: string;
    description: any;
    content: any;
    demands: any;
    callToAction: any;
    howToParticipate: any;
    resources: any;
    successStories: any;
    targets: any;
    seoTitle: string;
    seoDescription: string;
  }>
) {
  const [updated] = await db
    .update(campaignTranslations)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(campaignTranslations.campaignId, campaignId),
        eq(campaignTranslations.language, locale)
      )
    )
    .returning();
  
  return updated ?? null;
}

// ============================================
// CAMPAIGN - DELETE
// ============================================

/**
 * Delete campaign (cascade will delete translations)
 */
export async function deleteCampaign(id: string) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

// ============================================
// UTILITY QUERIES
// ============================================

/**
 * Get available locales for a campaign
 */
export async function getCampaignLocales(campaignId: string) {
  const result = await db
    .select({ language: campaignTranslations.language })
    .from(campaignTranslations)
    .where(eq(campaignTranslations.campaignId, campaignId));
  
  return result.map(r => r.language);
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