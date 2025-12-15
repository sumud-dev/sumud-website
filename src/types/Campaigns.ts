import type { Database } from "@/src/lib/database.types";

// Base database types
export type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignTranslationRow = Database["public"]["Tables"]["campaigns_translations"]["Row"];
export type SubCampaignRow = Database["public"]["Tables"]["sub_campaigns"]["Row"];
export type SubCampaignTranslationRow = Database["public"]["Tables"]["sub_campaigns_translations"]["Row"];
export type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
export type CampaignType = Database["public"]["Enums"]["campaign_type"];

// Sub-campaign with translations (from database)
export interface SubCampaignWithTranslations extends SubCampaignRow {
  translations?: SubCampaignTranslationRow[];
}

// Campaign with translations (from database)
export interface CampaignWithTranslations extends CampaignRow {
  translations?: CampaignTranslationRow[];
  sub_campaigns?: SubCampaignWithTranslations[];
}

// UI-friendly Campaign type (with localized content)
export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  campaignType: CampaignType;
  status: CampaignStatus;
  isFeatured: boolean;
  featuredImageUrl?: string | null;
  iconName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  stats?: CampaignStats | null;
  targets?: CampaignTarget[] | null;
  demands?: CampaignDemand[] | null;
  resources?: CampaignResource[] | null;
  howToParticipate?: HowToParticipate[] | null;
  callToAction?: CallToAction | null;
  successStories?: SuccessStory[] | null;
  subCampaigns?: SubCampaign[] | null;
  createdAt: string;
  updatedAt: string;
}

// Campaign statistics
export interface CampaignStats {
  totalDonations?: number;
  totalSupporters?: number;
  totalViews?: number;
  goalAmount?: number;
  raisedAmount?: number;
  [key: string]: unknown;
}

// Campaign target (e.g., companies to boycott, politicians to contact)
export interface CampaignTarget {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  [key: string]: unknown;
}

// Campaign demand
export interface CampaignDemand {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "achieved" | "in_progress";
  [key: string]: unknown;
}

// Campaign resource (downloadable materials, links, etc.)
export interface CampaignResource {
  id: string;
  title: string;
  type: "document" | "image" | "video" | "link" | "other";
  url: string;
  description?: string;
  [key: string]: unknown;
}

// How to participate steps
export interface HowToParticipate {
  id: string;
  step: number;
  title: string;
  description?: string;
  icon?: string;
  [key: string]: unknown;
}

// Call to action configuration
export interface CallToAction {
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
  [key: string]: unknown;
}

// Success story
export interface SuccessStory {
  id: string;
  title: string;
  description: string;
  date?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

// Sub-campaign (initiative within a parent campaign)
export interface SubCampaign {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  slug?: string;
  status?: CampaignStatus;
  campaignType?: CampaignType;
  iconName?: string;
  featuredImageUrl?: string;
  startDate?: string;
  endDate?: string;
  stats?: CampaignStats;
  [key: string]: unknown;
}

// Form data type for creating/editing campaigns
export interface CampaignFormData {
  title: string;
  description: string;
  shortDescription?: string;
  slug?: string;
  campaignType: CampaignType;
  status: CampaignStatus;
  isFeatured?: boolean;
  featuredImageUrl?: string;
  iconName?: string;
  startDate?: string;
  endDate?: string;
  goal?: number;
  currentAmount?: number;
  imageUrl?: string;
  stats?: CampaignStats;
  targets?: CampaignTarget[];
  demands?: CampaignDemand[];
  resources?: CampaignResource[];
  howToParticipate?: HowToParticipate[];
  callToAction?: CallToAction;
  successStories?: SuccessStory[];
  subCampaigns?: SubCampaign[];
}

// Helper function to transform database sub-campaign to UI sub-campaign
export function transformSubCampaignToUI(
  subCampaign: SubCampaignWithTranslations,
  locale: string = "en"
): SubCampaign {
  // Find translation for the requested locale, fallback to first available
  const translation = subCampaign.translations?.find(t => t.language === locale) 
    || subCampaign.translations?.[0];

  return {
    id: subCampaign.id,
    title: translation?.title || subCampaign.title || "",
    description: translation?.description || subCampaign.description || "",
    shortDescription: translation?.short_description || subCampaign.short_description || undefined,
    slug: subCampaign.slug || undefined,
    status: subCampaign.status as CampaignStatus | undefined,
    campaignType: subCampaign.campaign_type as CampaignType | undefined,
    iconName: subCampaign.icon_name || undefined,
    featuredImageUrl: subCampaign.featured_image_url || undefined,
    startDate: subCampaign.start_date || undefined,
    endDate: subCampaign.end_date || undefined,
    stats: subCampaign.stats as CampaignStats | undefined,
  };
}

// Helper function to transform database campaign to UI campaign
export function transformCampaignToUI(
  campaign: CampaignWithTranslations,
  locale: string = "en"
): Campaign {
  // Find translation for the requested locale, fallback to first available
  const translation = campaign.translations?.find(t => t.language === locale) 
    || campaign.translations?.[0];

  // Transform sub-campaigns if they exist
  const subCampaigns = campaign.sub_campaigns?.map(sc => transformSubCampaignToUI(sc, locale)) || null;

  // Helper to transform demands - handles both string[] and CampaignDemand[] formats
  const transformDemands = (demands: unknown): CampaignDemand[] | null => {
    if (!demands || !Array.isArray(demands)) return null;
    return demands.map((demand, index) => {
      if (typeof demand === 'string') {
        return { id: `demand-${index}`, title: demand, description: '', status: 'pending' as const };
      }
      return demand as CampaignDemand;
    });
  };

  // Helper to transform how to participate - handles both string[] and HowToParticipate[] formats
  const transformHowToParticipate = (steps: unknown): HowToParticipate[] | null => {
    if (!steps || !Array.isArray(steps)) return null;
    return steps.map((step, index) => {
      if (typeof step === 'string') {
        return { id: `step-${index}`, step: index + 1, title: step, description: '' };
      }
      return step as HowToParticipate;
    });
  };

  // Helper to transform targets - handles both string[] and CampaignTarget[] formats
  const transformTargets = (targets: unknown): CampaignTarget[] | null => {
    if (!targets || !Array.isArray(targets)) return null;
    return targets.map((target, index) => {
      if (typeof target === 'string') {
        return { id: `target-${index}`, name: target, description: '' };
      }
      return target as CampaignTarget;
    });
  };

  return {
    id: campaign.id,
    slug: campaign.slug,
    title: translation?.title || "",
    description: translation?.description || "",
    shortDescription: translation?.short_description,
    campaignType: campaign.campaign_type,
    status: campaign.status,
    isFeatured: campaign.is_featured,
    featuredImageUrl: campaign.featured_image_url,
    iconName: campaign.icon_name,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    stats: campaign.stats as CampaignStats | null,
    targets: transformTargets(campaign.targets),
    demands: transformDemands(campaign.demands),
    resources: campaign.resources as CampaignResource[] | null,
    howToParticipate: transformHowToParticipate(campaign.how_to_participate),
    callToAction: campaign.call_to_action as CallToAction | null,
    successStories: campaign.success_stories as SuccessStory[] | null,
    subCampaigns: subCampaigns,
    createdAt: campaign.created_at || new Date().toISOString(),
    updatedAt: campaign.updated_at || new Date().toISOString(),
  };
}

// Helper function to transform multiple campaigns
export function transformCampaignsToUI(
  campaigns: CampaignWithTranslations[],
  locale: string = "en"
): Campaign[] {
  return campaigns.map(campaign => transformCampaignToUI(campaign, locale));
}

// Status colors for UI display
export const campaignStatusColors: Record<CampaignStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
  archived: "bg-slate-100 text-slate-800",
};

// Campaign type labels
export const campaignTypeLabels: Record<CampaignType, string> = {
  awareness: "Awareness",
  advocacy: "Advocacy",
  fundraising: "Fundraising",
  community_building: "Community Building",
  education: "Education",
  solidarity: "Solidarity",
  humanitarian: "Humanitarian",
  political: "Political",
  cultural: "Cultural",
  environmental: "Environmental",
};
