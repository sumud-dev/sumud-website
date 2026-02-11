/**
 * Next.js Server Actions for Campaigns
 * 
 * File: lib/actions/campaigns.ts
 * 
 * Server Actions provide a simpler alternative to API routes
 * for mutations and form submissions with better type safety.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/src/lib/auth/server-auth';
import { db } from '@/src/lib/db';
import { campaigns } from '@/src/lib/db/schema/campaigns';
import {
  createCampaign as createCampaignQuery,
  updateCampaign,
  updateCampaignTranslation,
  deleteCampaign,
  getCampaignBySlug,
  deleteCampaignTranslation,
  toggleCampaignActive,
  getActiveCampaigns,
} from '@/src/lib/db/queries/campaigns.queries';
import {
  translateContent,
  CAMPAIGN_TRANSLATION_CONFIG,
  type SupportedLocale,
} from '@/src/lib/services/translation.service';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const campaignBaseSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.string().optional(),
  campaignType: z.string().optional(),
  iconName: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).default('draft'),
  metadata: z.any().optional(),
});

const translationSchema = z.object({
  locale: z.enum(['en', 'fi']),
  title: z.string().min(1).max(200),
  description: z.string().optional(), // HTML string from TipTap editor
  demands: z.any().optional(),
  callToAction: z.any().optional(),
  howToParticipate: z.any().optional(),
  resources: z.any().optional(),
  successStories: z.any().optional(),
  targets: z.any().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

const createCampaignSchema = campaignBaseSchema.extend({
  translations: z.array(translationSchema).min(1, 'At least one translation required'),
});

// ============================================
// RESULT TYPE
// ============================================

type ActionResult<T = unknown> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; errors?: Record<string, string[]> };

// ============================================
// CAMPAIGN ACTIONS
// ============================================

/**
 * Fetch all campaigns for a specific locale
 * @param locale - The locale to fetch campaigns for
 * @param activeOnly - If true, only return active campaigns (for public pages)
 */
export async function fetchActiveCampaignsAction(
  locale: string = 'en',
  activeOnly: boolean = false
): Promise<ActionResult> {
  try {
    const campaigns = await getActiveCampaigns(locale, activeOnly);
    
    return {
      success: true,
      data: campaigns,
    };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
    };
  }
}

/**
 * Fetch campaign by slug and locale
 */
// Lines 117-131
export async function fetchCampaigns(
  slug: string,
  locale: string = 'fi'
): Promise<ActionResult> {
  try {
    const campaign = await getCampaignBySlug(slug, locale);
        
    if (!campaign) {
      return {
        success: false,
        error: `Campaign not found for slug "${slug}" in locale "${locale}"`,
      };
    }

    return {
      success: true,
      data: campaign,
    };
  } catch (error) {
    console.error('[fetchCampaigns] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaign',
    };
  }
}

/**
 * Create a new campaign with translations
 * Automatically translates content to the other locale (en <-> fi)
 */
export async function createCampaignAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Check permission
    await requirePermission('create_campaigns');

    // Extract and parse form data
    const rawData = {
      slug: formData.get('slug'),
      category: formData.get('category'),
      campaignType: formData.get('campaignType'),
      iconName: formData.get('iconName'),
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      status: formData.get('status') || 'draft',
      translations: JSON.parse(formData.get('translations') as string),
      autoTranslate: formData.get('autoTranslate') === 'true',
    };

    // Validate
    const validatedData = createCampaignSchema.parse(rawData);
    
    // Get source translation (the one provided by the user)
    const sourceTranslation = validatedData.translations[0];
    const sourceLocale = sourceTranslation.locale as SupportedLocale;
    
    // Prepare all translations (starting with source as primary)
    const allTranslations = [...validatedData.translations];
    
    // Auto-translate if enabled (default: true for en/fi pair)
    const shouldAutoTranslate = rawData.autoTranslate !== false;
    
    if (shouldAutoTranslate) {
      // Determine target locale (en <-> fi)
      const targetLocale: SupportedLocale = sourceLocale === 'en' ? 'fi' : 'en';
      
      // Check if translation for target locale already exists
      const hasTargetTranslation = validatedData.translations.some(
        t => t.locale === targetLocale
      );
      
      if (!hasTargetTranslation) {
        try {
          // Prepare content for translation
          const contentToTranslate = {
            title: sourceTranslation.title,
            description: typeof sourceTranslation.description === 'string' 
              ? sourceTranslation.description 
              : '',
            seoTitle: sourceTranslation.seoTitle || '',
            seoDescription: sourceTranslation.seoDescription || '',
            demands: sourceTranslation.demands || [],
            howToParticipate: sourceTranslation.howToParticipate || [],
            targets: sourceTranslation.targets || [],
            callToAction: sourceTranslation.callToAction || {},
          };
          
          const { content: translatedContent, error: translationError } = await translateContent(
            contentToTranslate,
            sourceLocale,
            targetLocale,
            CAMPAIGN_TRANSLATION_CONFIG
          );
          
          if (translationError) {
            console.warn('Translation warning:', translationError);
            // Continue without translation - don't fail the entire operation
          } else {
            // Add translated content to translations
            allTranslations.push({
              locale: targetLocale,
              title: translatedContent.title as string,
              description: translatedContent.description,
              demands: translatedContent.demands,
              callToAction: translatedContent.callToAction,
              howToParticipate: translatedContent.howToParticipate,
              resources: sourceTranslation.resources, // Keep same as source
              successStories: sourceTranslation.successStories, // Keep same as source
              targets: translatedContent.targets,
              seoTitle: translatedContent.seoTitle as string,
              seoDescription: translatedContent.seoDescription as string,
            });
          }
        } catch (translationError) {
          console.error('Auto-translation failed:', translationError);
          // Continue without translation
        }
      }
    }

    // Create campaign with all translations
    const newCampaign = await createCampaignQuery(
      {
        slug: validatedData.slug,
        category: validatedData.category,
        campaignType: validatedData.campaignType,
        iconName: validatedData.iconName,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        status: validatedData.status,
        metadata: validatedData.metadata,
      },
      allTranslations
    );

    // Revalidate relevant paths
    revalidatePath('/[locale]/campaigns', 'page');
    revalidatePath('/', 'page');

    const translationCount = allTranslations.length;
    return {
      success: true,
      data: newCampaign,
      message: translationCount > 1 
        ? `Campaign created with ${translationCount} language versions`
        : 'Campaign created successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    
    console.error('Error creating campaign:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create campaign',
    };
  }
}

/**
 * Update campaign - handles all fields (base + content) in single table approach
 */
export async function updateCampaignAction(
  campaignId: string,
  slug: string,
  data: Partial<z.infer<typeof campaignBaseSchema>> & Partial<z.infer<typeof translationSchema>>,
  locale: string = 'en'
): Promise<ActionResult> {
  try {
    // Ensure slug has locale suffix
    const baseSlug = slug.replace(/-(?:en|fi)$/, ''); // Remove locale suffix if present
    const currentSlug = `${baseSlug}-${locale}`;
    
    // Update campaign with all provided fields
    const updated = await updateCampaign(campaignId, {
      ...data,
      slug: currentSlug, // Ensure slug has locale suffix
    });

    if (!updated) {
      return {
        success: false,
        error: 'Campaign not found',
      };
    }

    // Revalidate paths
    revalidatePath(`/${locale}/campaigns/${currentSlug}`);
    revalidatePath(`/${locale}/campaigns`);

    return {
      success: true,
      data: updated,
      message: 'Campaign updated successfully',
    };
  } catch (error) {
    console.error('Error updating campaign:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update campaign',
    };
  }
}

/**
 * Update campaign translation
 */
export async function updateCampaignTranslationAction(
  campaignId: string,
  slug: string,
  locale: string,
  data: Partial<z.infer<typeof translationSchema>>
): Promise<ActionResult> {
  try {
    // Validate translation data
    const partialSchema = translationSchema.partial();
    const validatedData = partialSchema.parse(data);

    const updated = await updateCampaignTranslation(
      campaignId,
      locale,
      validatedData
    );

    if (!updated) {
      return {
        success: false,
        error: 'Translation not found',
      };
    }

    // Revalidate
    revalidatePath(`/${locale}/campaigns/${slug}`);
    revalidatePath(`/${locale}/campaigns`);

    return {
      success: true,
      data: updated,
      message: 'Translation updated successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update translation',
    };
  }
}

/**
 * Delete campaign
 */
// Lines 283-309
export async function deleteCampaignAction(
  slug: string,
  locale: string = 'fi'
): Promise<ActionResult> {
  try {
    // Get campaign
    const campaign = await getCampaignBySlug(slug, locale);
    
    if (!campaign) {
      return {
        success: false,
        error: 'Campaign not found',
      };
    }

    // If it's a translation, delete only the translation
    // If it's primary, deleteCampaign will CASCADE delete translations
    // Check if campaign has campaignId (meaning it's a translation)
    if ('campaignId' in campaign && campaign.campaignId) {
      await deleteCampaignTranslation(campaign.id);
    } else {
      await deleteCampaign(campaign.id);
    }

    // Revalidate
    revalidatePath(`/${locale}/campaigns`);
    revalidatePath(`/${locale}`);

    return {
      success: true,
      data: null,
      message: 'Campaign deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete campaign',
    };
  }
}

/**
 * Toggle campaign active status
 */
export async function toggleCampaignActiveAction(
  campaignId: string,
  slug: string,
  locale: string = 'en'
): Promise<ActionResult> {
  try {
    const updated = await toggleCampaignActive(campaignId);

    if (!updated) {
      return {
        success: false,
        error: 'Campaign not found',
      };
    }

    // Revalidate
    revalidatePath(`/${locale}/campaigns/${slug}`);
    revalidatePath(`/${locale}/campaigns`);

    return {
      success: true,
      data: updated,
      message: `Campaign ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle campaign status',
    };
  }
}

// ============================================
// UTILITY ACTIONS
// ============================================

/**
 * Duplicate campaign
 */
export async function duplicateCampaignAction(
  sourceSlug: string,
  newSlug: string,
  locale: string = 'en'
): Promise<ActionResult> {
  try {
    // Get source campaign
    const source = await getCampaignBySlug(sourceSlug, locale);
    
    if (!source) {
      return { success: false, error: 'Source campaign not found' };
    }

    // Create duplicate
    const duplicate = await createCampaignQuery(
      {
        slug: newSlug,
        category: source.category,
        campaignType: source.campaignType,
        iconName: source.iconName,
        isActive: false, // Start as inactive
        isFeatured: false,
        status: 'draft',
      },
      [
        {
          locale,
          title: `${source.title} (Copy)`,
          description: source.description ?? undefined,
          demands: source.demands ?? undefined,
          callToAction: source.callToAction ?? undefined,
          howToParticipate: source.howToParticipate ?? undefined,
          resources: source.resources ?? undefined,
          successStories: source.successStories ?? undefined,
          targets: source.targets ?? undefined,
        },
      ]
    );

    revalidatePath(`/${locale}/campaigns`);

    return {
      success: true,
      data: duplicate,
      message: 'Campaign duplicated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate campaign',
    };
  }
}

/**
 * Publish campaign (activate and set status to active)
 */
export async function publishCampaignAction(
  campaignId: string,
  slug: string,
  locale: string = 'en'
): Promise<ActionResult> {
  try {
    const updated = await updateCampaign(campaignId, {
      isActive: true,
      status: 'active',
    });

    if (!updated) {
      return { success: false, error: 'Campaign not found' };
    }

    revalidatePath(`/${locale}/campaigns/${slug}`);
    revalidatePath(`/${locale}/campaigns`);
    revalidatePath(`/${locale}`); // Revalidate homepage for featured

    return {
      success: true,
      data: updated,
      message: 'Campaign published successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish campaign',
    };
  }
}

/**
 * Archive campaign
 */
export async function archiveCampaignAction(
  campaignId: string,
  slug: string,
  locale: string = 'en'
): Promise<ActionResult> {
  try {
    const updated = await updateCampaign(campaignId, {
      isActive: false,
      status: 'archived',
    });

    if (!updated) {
      return { success: false, error: 'Campaign not found' };
    }

    revalidatePath(`/${locale}/campaigns/${slug}`);
    revalidatePath(`/${locale}/campaigns`);

    return {
      success: true,
      data: updated,
      message: 'Campaign archived successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive campaign',
    };
  }
}