/**
 * Next.js Server Actions for Campaigns (Refactored)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/src/lib/auth/server-auth';
import {
  createCampaign as createCampaignQuery,
  updateCampaign,
  updateCampaignTranslation,
  deleteCampaign,
  getCampaignBySlug,
  deleteCampaignTranslation,
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
  description: z.string().optional(),
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
// HELPER FUNCTIONS (eliminates duplication)
// ============================================

/**
 * Wrapper for action error handling
 */
async function safeAction<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Action failed'
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error(`[${errorMessage}]`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
    };
  }
}

/**
 * Validate data with Zod and return formatted errors
 */
function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ActionResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
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
      error: 'Invalid data',
    };
  }
}

/**
 * Revalidate campaign pages
 */
function revalidateCampaignPages(locale: string, slug?: string) {
  if (slug) {
    revalidatePath(`/${locale}/campaigns/${slug}`);
  }
  revalidatePath(`/${locale}/campaigns`);
  revalidatePath(`/${locale}`);
}

/**
 * Auto-translate campaign content (extracted from createCampaignAction)
 */
async function autoTranslateCampaign(
  sourceTranslation: z.infer<typeof translationSchema>,
  sourceLocale: SupportedLocale
): Promise<z.infer<typeof translationSchema> | null> {
  const targetLocale: SupportedLocale = sourceLocale === 'en' ? 'fi' : 'en';

  try {
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
      return null;
    }

    return {
      locale: targetLocale,
      title: translatedContent.title as string,
      description: translatedContent.description,
      demands: translatedContent.demands,
      callToAction: translatedContent.callToAction,
      howToParticipate: translatedContent.howToParticipate,
      resources: sourceTranslation.resources,
      successStories: sourceTranslation.successStories,
      targets: translatedContent.targets,
      seoTitle: translatedContent.seoTitle as string,
      seoDescription: translatedContent.seoDescription as string,
    };
  } catch (error) {
    console.error('Auto-translation failed:', error);
    return null;
  }
}

// ============================================
// CAMPAIGN ACTIONS
// ============================================

/**
 * Fetch all campaigns for a specific locale
 */
export async function fetchActiveCampaignsAction(
  locale: string = 'en',
  activeOnly: boolean = false
): Promise<ActionResult> {
  return safeAction(
    () => getActiveCampaigns(locale, activeOnly),
    'Failed to fetch campaigns'
  );
}

/**
 * Fetch campaign by slug and locale
 */
export async function fetchCampaignsAction(
  slug: string,
  locale: string = 'fi'
): Promise<ActionResult> {
  return safeAction(async () => {
    const campaign = await getCampaignBySlug(slug, locale);
    
    if (!campaign) {
      throw new Error(`Campaign not found for slug "${slug}" in locale "${locale}"`);
    }

    return campaign;
  }, 'Failed to fetch campaign');
}

/**
 * Create a new campaign with translations
 */
export async function createCampaignAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Check permission
    await requirePermission('create_campaigns');

    // Parse form data
    const rawData = {
      slug: formData.get('slug'),
      category: formData.get('category'),
      campaignType: formData.get('campaignType'),
      iconName: formData.get('iconName'),
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      status: formData.get('status') || 'draft',
      translations: JSON.parse(formData.get('translations') as string),
      autoTranslate: formData.get('autoTranslate') !== 'false', // default true
    };

    // Validate
    const validationResult = validateData(createCampaignSchema, rawData);
    if (!validationResult.success) {
      return validationResult;
    }

    const validatedData = validationResult.data;
    const sourceTranslation = validatedData.translations[0];
    const sourceLocale = sourceTranslation.locale as SupportedLocale;
    const allTranslations = [...validatedData.translations];

    // Auto-translate if enabled and target locale doesn't exist
    if (rawData.autoTranslate) {
      const targetLocale: SupportedLocale = sourceLocale === 'en' ? 'fi' : 'en';
      const hasTargetTranslation = validatedData.translations.some(
        t => t.locale === targetLocale
      );

      if (!hasTargetTranslation) {
        const translated = await autoTranslateCampaign(sourceTranslation, sourceLocale);
        if (translated) {
          allTranslations.push(translated);
        }
      }
    }

    // Create campaign
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

    // Revalidate
    revalidateCampaignPages(sourceLocale);

    return {
      success: true,
      data: newCampaign,
      message: allTranslations.length > 1
        ? `Campaign created with ${allTranslations.length} language versions`
        : 'Campaign created successfully',
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create campaign',
    };
  }
}

/**
 * Update campaign
 */
export async function updateCampaignAction(
  campaignId: string,
  slug: string,
  data: Partial<z.infer<typeof campaignBaseSchema>> & Partial<z.infer<typeof translationSchema>>,
  locale: string = 'en'
): Promise<ActionResult> {
  return safeAction(async () => {
    const updated = await updateCampaign(campaignId, data);

    if (!updated) {
      throw new Error('Campaign not found');
    }

    revalidateCampaignPages(locale, slug);

    return updated;
  }, 'Failed to update campaign');
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
    // Validate
    const validationResult = validateData(translationSchema.partial(), data);
    if (!validationResult.success) {
      return validationResult;
    }

    const updated = await updateCampaignTranslation(
      campaignId,
      locale,
      validationResult.data
    );

    if (!updated) {
      return {
        success: false,
        error: 'Translation not found',
      };
    }

    revalidateCampaignPages(locale, slug);

    return {
      success: true,
      data: updated,
      message: 'Translation updated successfully',
    };
  } catch (error) {
    console.error('Error updating translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update translation',
    };
  }
}

/**
 * Delete campaign
 */
export async function deleteCampaignAction(
  slug: string,
  locale: string = 'fi'
): Promise<ActionResult> {
  return safeAction(async () => {
    const campaign = await getCampaignBySlug(slug, locale);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Delete translation or entire campaign
    if ('campaignId' in campaign && campaign.campaignId) {
      await deleteCampaignTranslation(campaign.id);
    } else {
      await deleteCampaign(campaign.id);
    }

    revalidateCampaignPages(locale);

    return null;
  }, 'Failed to delete campaign');
}