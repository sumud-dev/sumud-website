"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Database, Json } from "@/src/lib/database.types";

// Database types
type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];
type CampaignTranslation = Database["public"]["Tables"]["campaigns_translations"]["Row"];
type CampaignTranslationInsert = Database["public"]["Tables"]["campaigns_translations"]["Insert"];
type CampaignTranslationUpdate = Database["public"]["Tables"]["campaigns_translations"]["Update"];
type SubCampaign = Database["public"]["Tables"]["sub_campaigns"]["Row"];
type SubCampaignTranslation = Database["public"]["Tables"]["sub_campaigns_translations"]["Row"];
type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
type CampaignType = Database["public"]["Enums"]["campaign_type"];

// Re-export types for consumers
export type {
  Campaign,
  CampaignInsert,
  CampaignUpdate,
  CampaignTranslation,
  SubCampaign,
  SubCampaignTranslation,
  CampaignStatus,
  CampaignType,
};

// Sub-campaign with translations
export type SubCampaignWithTranslations = SubCampaign & {
  translations?: SubCampaignTranslation[];
};

// Campaign with translations
export type CampaignWithTranslations = Campaign & {
  translations?: CampaignTranslation[];
  sub_campaigns?: SubCampaignWithTranslations[];
};

// Response types
export interface ActionResponse<T> {
  data: T | null;
  error: string | null;
}

export interface MutationResponse {
  success: boolean;
  error: string | null;
}

// Input types for creating/updating campaigns
export interface CreateCampaignData {
  slug: string;
  campaign_type: CampaignType;
  status?: CampaignStatus;
  is_featured?: boolean;
  featured_image_url?: string | null;
  icon_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  stats?: Json | null;
  targets?: Json | null;
  demands?: Json | null;
  resources?: Json | null;
  how_to_participate?: Json | null;
  call_to_action?: Json | null;
  success_stories?: Json | null;
  // Initial translation (required)
  title: string;
  description: string;
  short_description?: string;
  language: string;
}

export interface UpdateCampaignData {
  slug?: string;
  campaign_type?: CampaignType;
  status?: CampaignStatus;
  is_featured?: boolean;
  featured_image_url?: string | null;
  icon_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  stats?: Json | null;
  targets?: Json | null;
  demands?: Json | null;
  resources?: Json | null;
  how_to_participate?: Json | null;
  call_to_action?: Json | null;
  success_stories?: Json | null;
}

export interface CreateTranslationData {
  campaign_id: string;
  language: string;
  title: string;
  description: string;
  short_description?: string;
}

export interface UpdateTranslationData {
  title?: string;
  description?: string;
  short_description?: string | null;
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ============================================
// READ OPERATIONS (using regular client with RLS)
// ============================================

/**
 * Fetch all campaigns with their translations
 */
export async function getCampaigns(): Promise<ActionResponse<CampaignWithTranslations[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns:", error);
      return { data: null, error: error.message };
    }

    return { data: data as CampaignWithTranslations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching campaigns:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch active campaigns only (for public pages)
 */
export async function getActiveCampaigns(): Promise<ActionResponse<CampaignWithTranslations[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active campaigns:", error);
      return { data: null, error: error.message };
    }

    return { data: data as CampaignWithTranslations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching active campaigns:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch featured campaigns
 */
export async function getFeaturedCampaigns(): Promise<ActionResponse<CampaignWithTranslations[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*)
      `)
      .eq("is_featured", true)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching featured campaigns:", error);
      return { data: null, error: error.message };
    }

    return { data: data as CampaignWithTranslations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching featured campaigns:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single campaign by ID with translations and sub-campaigns
 */
export async function getCampaignById(
  id: string
): Promise<ActionResponse<CampaignWithTranslations>> {
  if (!id || typeof id !== "string") {
    return { data: null, error: "Invalid campaign ID" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*),
        sub_campaigns!sub_campaigns_parent_campaign_id_fkey(
          *,
          translations:sub_campaigns_translations(*)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching campaign by ID:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Campaign not found" };
    }

    return { data: data as CampaignWithTranslations, error: null };
  } catch (err) {
    console.error("Unexpected error fetching campaign:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single campaign by slug with translations and sub-campaigns
 */
export async function getCampaignBySlug(
  slug: string
): Promise<ActionResponse<CampaignWithTranslations>> {
  if (!slug || typeof slug !== "string") {
    return { data: null, error: "Invalid slug" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*),
        sub_campaigns!sub_campaigns_parent_campaign_id_fkey(
          *,
          translations:sub_campaigns_translations(*)
        )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching campaign by slug:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Campaign not found" };
    }

    return { data: data as CampaignWithTranslations, error: null };
  } catch (err) {
    console.error("Unexpected error fetching campaign:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch campaigns by type
 */
export async function getCampaignsByType(
  campaignType: CampaignType
): Promise<ActionResponse<CampaignWithTranslations[]>> {
  if (!campaignType) {
    return { data: null, error: "Invalid campaign type" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*)
      `)
      .eq("campaign_type", campaignType)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns by type:", error);
      return { data: null, error: error.message };
    }

    return { data: data as CampaignWithTranslations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching campaigns by type:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch campaigns by status
 */
export async function getCampaignsByStatus(
  status: CampaignStatus
): Promise<ActionResponse<CampaignWithTranslations[]>> {
  if (!status) {
    return { data: null, error: "Invalid status" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        translations:campaigns_translations(*)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns by status:", error);
      return { data: null, error: error.message };
    }

    return { data: data as CampaignWithTranslations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching campaigns by status:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// ============================================
// WRITE OPERATIONS (using admin client to bypass RLS)
// ============================================

/**
 * Create a new campaign with initial translation
 */
export async function createCampaign(
  data: CreateCampaignData
): Promise<MutationResponse & { id?: string; slug?: string }> {
  // Validate required fields
  if (!data.title?.trim()) {
    return { success: false, error: "Title is required" };
  }

  if (!data.description?.trim()) {
    return { success: false, error: "Description is required" };
  }

  if (!data.campaign_type) {
    return { success: false, error: "Campaign type is required" };
  }

  if (!data.language?.trim()) {
    return { success: false, error: "Language is required" };
  }

  try {
    const supabase = createAdminClient();

    const slug = data.slug?.trim() || generateSlug(data.title);
    const now = new Date().toISOString();

    // Check if slug already exists
    const { data: existingCampaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingCampaign) {
      return { success: false, error: "A campaign with this slug already exists" };
    }

    // Insert campaign
    const campaignInsert: CampaignInsert = {
      slug,
      campaign_type: data.campaign_type,
      status: data.status || "draft",
      is_featured: data.is_featured || false,
      featured_image_url: data.featured_image_url || null,
      icon_name: data.icon_name || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      stats: data.stats || null,
      targets: data.targets || null,
      demands: data.demands || null,
      resources: data.resources || null,
      how_to_participate: data.how_to_participate || null,
      call_to_action: data.call_to_action || null,
      success_stories: data.success_stories || null,
      created_at: now,
      updated_at: now,
    };

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert(campaignInsert)
      .select()
      .single();

    if (campaignError) {
      console.error("Error creating campaign:", campaignError);
      return { success: false, error: campaignError.message };
    }

    // Insert initial translation
    const translationInsert: CampaignTranslationInsert = {
      campaign_id: campaign.id,
      language: data.language.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      short_description: data.short_description?.trim() || null,
      created_at: now,
      updated_at: now,
    };

    const { error: translationError } = await supabase
      .from("campaigns_translations")
      .insert(translationInsert);

    if (translationError) {
      console.error("Error creating campaign translation:", translationError);
      // Rollback campaign creation
      await supabase.from("campaigns").delete().eq("id", campaign.id);
      return { success: false, error: translationError.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null, id: campaign.id, slug };
  } catch (err) {
    console.error("Unexpected error creating campaign:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(
  id: string,
  data: UpdateCampaignData
): Promise<MutationResponse & { slug?: string }> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid campaign ID" };
  }

  try {
    const supabase = createAdminClient();

    // Verify campaign exists
    const { data: existingCampaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching campaign for update:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!existingCampaign) {
      return { success: false, error: `Campaign with ID ${id} not found` };
    }

    // Check for slug conflicts if updating slug
    if (data.slug && data.slug !== existingCampaign.slug) {
      const { data: slugConflict } = await supabase
        .from("campaigns")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", id)
        .maybeSingle();

      if (slugConflict) {
        return { success: false, error: "A campaign with this slug already exists" };
      }
    }

    const updateData: CampaignUpdate = {
      updated_at: new Date().toISOString(),
    };

    // Only update provided fields
    if (data.slug !== undefined) updateData.slug = data.slug.trim();
    if (data.campaign_type !== undefined) updateData.campaign_type = data.campaign_type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
    if (data.featured_image_url !== undefined) updateData.featured_image_url = data.featured_image_url;
    if (data.icon_name !== undefined) updateData.icon_name = data.icon_name;
    if (data.start_date !== undefined) updateData.start_date = data.start_date;
    if (data.end_date !== undefined) updateData.end_date = data.end_date;
    if (data.stats !== undefined) updateData.stats = data.stats;
    if (data.targets !== undefined) updateData.targets = data.targets;
    if (data.demands !== undefined) updateData.demands = data.demands;
    if (data.resources !== undefined) updateData.resources = data.resources;
    if (data.how_to_participate !== undefined) updateData.how_to_participate = data.how_to_participate;
    if (data.call_to_action !== undefined) updateData.call_to_action = data.call_to_action;
    if (data.success_stories !== undefined) updateData.success_stories = data.success_stories;

    const { data: result, error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating campaign:", error);
      return { success: false, error: error.message };
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Update failed. You may not have permission to update this campaign.",
      };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");
    if (data.slug || existingCampaign.slug) {
      revalidatePath(`/campaigns/${data.slug || existingCampaign.slug}`);
    }

    return { success: true, error: null, slug: data.slug || existingCampaign.slug || undefined };
  } catch (err) {
    console.error("Unexpected error updating campaign:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
  id: string,
  newStatus: CampaignStatus
): Promise<MutationResponse> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid campaign ID" };
  }

  const validStatuses: CampaignStatus[] = ["active", "completed", "draft", "paused", "cancelled", "archived"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: "Invalid status" };
  }

  try {
    const supabase = createAdminClient();

    const updateData: CampaignUpdate = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("campaigns").update(updateData).eq("id", id);

    if (error) {
      console.error("Error updating campaign status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error updating campaign status:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle campaign featured status
 */
export async function toggleCampaignFeatured(
  id: string,
  isFeatured: boolean
): Promise<MutationResponse> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid campaign ID" };
  }

  try {
    const supabase = createAdminClient();

    const updateData: CampaignUpdate = {
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("campaigns").update(updateData).eq("id", id);

    if (error) {
      console.error("Error toggling campaign featured status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error toggling campaign featured status:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a campaign by ID (also deletes related translations via cascade)
 */
export async function deleteCampaign(id: string): Promise<MutationResponse> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid campaign ID" };
  }

  try {
    const supabase = createAdminClient();

    // Verify campaign exists before deleting
    const { data: existingCampaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching campaign for deletion:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!existingCampaign) {
      return { success: false, error: "Campaign not found" };
    }

    // Delete translations first (in case cascade is not set)
    await supabase.from("campaigns_translations").delete().eq("campaign_id", id);

    // Delete campaign
    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) {
      console.error("Error deleting campaign:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting campaign:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete multiple campaigns by IDs
 */
export async function deleteCampaigns(ids: string[]): Promise<MutationResponse> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, error: "No campaign IDs provided" };
  }

  // Validate all IDs
  if (!ids.every((id) => typeof id === "string" && id.trim())) {
    return { success: false, error: "Invalid campaign IDs" };
  }

  try {
    const supabase = createAdminClient();

    // Delete translations first
    await supabase.from("campaigns_translations").delete().in("campaign_id", ids);

    // Delete campaigns
    const { error } = await supabase.from("campaigns").delete().in("id", ids);

    if (error) {
      console.error("Error deleting campaigns:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting campaigns:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================
// TRANSLATION OPERATIONS
// ============================================

/**
 * Add a translation to a campaign
 */
export async function addCampaignTranslation(
  data: CreateTranslationData
): Promise<MutationResponse & { id?: string }> {
  if (!data.campaign_id?.trim()) {
    return { success: false, error: "Campaign ID is required" };
  }

  if (!data.language?.trim()) {
    return { success: false, error: "Language is required" };
  }

  if (!data.title?.trim()) {
    return { success: false, error: "Title is required" };
  }

  if (!data.description?.trim()) {
    return { success: false, error: "Description is required" };
  }

  try {
    const supabase = createAdminClient();

    // Check if translation already exists for this language
    const { data: existingTranslation } = await supabase
      .from("campaigns_translations")
      .select("id")
      .eq("campaign_id", data.campaign_id)
      .eq("language", data.language)
      .maybeSingle();

    if (existingTranslation) {
      return {
        success: false,
        error: `Translation already exists for language: ${data.language}`,
      };
    }

    const now = new Date().toISOString();

    const translationInsert: CampaignTranslationInsert = {
      campaign_id: data.campaign_id,
      language: data.language.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      short_description: data.short_description?.trim() || null,
      created_at: now,
      updated_at: now,
    };

    const { data: translation, error } = await supabase
      .from("campaigns_translations")
      .insert(translationInsert)
      .select()
      .single();

    if (error) {
      console.error("Error adding campaign translation:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null, id: translation.id };
  } catch (err) {
    console.error("Unexpected error adding campaign translation:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update a campaign translation
 */
export async function updateCampaignTranslation(
  translationId: string,
  data: UpdateTranslationData
): Promise<MutationResponse> {
  if (!translationId || typeof translationId !== "string") {
    return { success: false, error: "Invalid translation ID" };
  }

  try {
    const supabase = createAdminClient();

    const updateData: CampaignTranslationUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.short_description !== undefined) {
      updateData.short_description = data.short_description?.trim() || null;
    }

    const { error } = await supabase
      .from("campaigns_translations")
      .update(updateData)
      .eq("id", translationId);

    if (error) {
      console.error("Error updating campaign translation:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error updating campaign translation:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a campaign translation
 */
export async function deleteCampaignTranslation(
  translationId: string
): Promise<MutationResponse> {
  if (!translationId || typeof translationId !== "string") {
    return { success: false, error: "Invalid translation ID" };
  }

  try {
    const supabase = createAdminClient();

    // Check that this is not the only translation for the campaign
    const { data: translation, error: fetchError } = await supabase
      .from("campaigns_translations")
      .select("campaign_id")
      .eq("id", translationId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching translation:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!translation) {
      return { success: false, error: "Translation not found" };
    }

    const { count } = await supabase
      .from("campaigns_translations")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", translation.campaign_id);

    if (count !== null && count <= 1) {
      return {
        success: false,
        error: "Cannot delete the only translation. A campaign must have at least one translation.",
      };
    }

    const { error } = await supabase
      .from("campaigns_translations")
      .delete()
      .eq("id", translationId);

    if (error) {
      console.error("Error deleting campaign translation:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting campaign translation:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get translation for a specific language
 */
export async function getCampaignTranslation(
  campaignId: string,
  language: string
): Promise<ActionResponse<CampaignTranslation>> {
  if (!campaignId || typeof campaignId !== "string") {
    return { data: null, error: "Invalid campaign ID" };
  }

  if (!language || typeof language !== "string") {
    return { data: null, error: "Invalid language" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns_translations")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("language", language)
      .maybeSingle();

    if (error) {
      console.error("Error fetching campaign translation:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Translation not found" };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching campaign translation:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// ============================================
// SUB-CAMPAIGN OPERATIONS
// ============================================

/**
 * Fetch all sub-campaigns for a parent campaign
 */
export async function getSubCampaignsByParentId(
  parentCampaignId: string
): Promise<ActionResponse<SubCampaignWithTranslations[]>> {
  if (!parentCampaignId || typeof parentCampaignId !== "string") {
    return { data: null, error: "Invalid parent campaign ID" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sub_campaigns")
      .select(`
        *,
        translations:sub_campaigns_translations(*)
      `)
      .eq("parent_campaign_id", parentCampaignId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sub-campaigns:", error);
      return { data: null, error: error.message };
    }

    return { data: data as SubCampaignWithTranslations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching sub-campaigns:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single sub-campaign by ID with translations
 */
export async function getSubCampaignById(
  id: string
): Promise<ActionResponse<SubCampaignWithTranslations>> {
  if (!id || typeof id !== "string") {
    return { data: null, error: "Invalid sub-campaign ID" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sub_campaigns")
      .select(`
        *,
        translations:sub_campaigns_translations(*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching sub-campaign by ID:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Sub-campaign not found" };
    }

    return { data: data as SubCampaignWithTranslations, error: null };
  } catch (err) {
    console.error("Unexpected error fetching sub-campaign:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single sub-campaign by slug with translations
 */
export async function getSubCampaignBySlug(
  slug: string
): Promise<ActionResponse<SubCampaignWithTranslations>> {
  if (!slug || typeof slug !== "string") {
    return { data: null, error: "Invalid slug" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sub_campaigns")
      .select(`
        *,
        translations:sub_campaigns_translations(*)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching sub-campaign by slug:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Sub-campaign not found" };
    }

    return { data: data as SubCampaignWithTranslations, error: null };
  } catch (err) {
    console.error("Unexpected error fetching sub-campaign:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Input types for creating/updating sub-campaigns
export interface CreateSubCampaignData {
  parent_campaign_id: string;
  slug: string;
  campaign_type?: string;
  status?: string;
  featured_image_url?: string | null;
  icon_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  stats?: Json | null;
  // Initial translation (required)
  title: string;
  description?: string;
  short_description?: string;
  language: string;
}

export interface UpdateSubCampaignData {
  slug?: string;
  campaign_type?: string;
  status?: string;
  featured_image_url?: string | null;
  icon_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  stats?: Json | null;
}

/**
 * Create a new sub-campaign with initial translation
 */
export async function createSubCampaign(
  data: CreateSubCampaignData
): Promise<ActionResponse<SubCampaignWithTranslations>> {
  const { 
    parent_campaign_id, 
    slug, 
    title, 
    description, 
    short_description, 
    language, 
    ...subCampaignData 
  } = data;

  if (!parent_campaign_id) {
    return { data: null, error: "Parent campaign ID is required" };
  }

  if (!slug) {
    return { data: null, error: "Slug is required" };
  }

  if (!title) {
    return { data: null, error: "Title is required for initial translation" };
  }

  if (!language) {
    return { data: null, error: "Language is required for initial translation" };
  }

  try {
    const supabase = createAdminClient();

    // Check if parent campaign exists
    const { data: parentCampaign, error: parentError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", parent_campaign_id)
      .maybeSingle();

    if (parentError || !parentCampaign) {
      return { data: null, error: "Parent campaign not found" };
    }

    // Check if slug is unique
    const { data: existing } = await supabase
      .from("sub_campaigns")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return { data: null, error: "A sub-campaign with this slug already exists" };
    }

    // Create sub-campaign
    const { data: newSubCampaign, error: insertError } = await supabase
      .from("sub_campaigns")
      .insert({
        parent_campaign_id,
        slug,
        title,
        description,
        short_description,
        status: subCampaignData.status || "active",
        campaign_type: subCampaignData.campaign_type,
        featured_image_url: subCampaignData.featured_image_url,
        icon_name: subCampaignData.icon_name,
        start_date: subCampaignData.start_date,
        end_date: subCampaignData.end_date,
        stats: subCampaignData.stats,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating sub-campaign:", insertError);
      return { data: null, error: insertError.message };
    }

    // Create initial translation
    const { error: translationError } = await supabase
      .from("sub_campaigns_translations")
      .insert({
        sub_campaign_id: newSubCampaign.id,
        language,
        title,
        description: description || "",
        short_description: short_description || null,
      });

    if (translationError) {
      console.error("Error creating sub-campaign translation:", translationError);
      // Rollback: delete the sub-campaign
      await supabase.from("sub_campaigns").delete().eq("id", newSubCampaign.id);
      return { data: null, error: translationError.message };
    }

    // Fetch and return the complete sub-campaign with translations
    const { data: completeSubCampaign, error: fetchError } = await supabase
      .from("sub_campaigns")
      .select(`
        *,
        translations:sub_campaigns_translations(*)
      `)
      .eq("id", newSubCampaign.id)
      .single();

    if (fetchError) {
      console.error("Error fetching created sub-campaign:", fetchError);
      return { data: null, error: fetchError.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { data: completeSubCampaign as SubCampaignWithTranslations, error: null };
  } catch (err) {
    console.error("Unexpected error creating sub-campaign:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Update a sub-campaign
 */
export async function updateSubCampaign(
  id: string,
  data: UpdateSubCampaignData
): Promise<ActionResponse<SubCampaign>> {
  if (!id || typeof id !== "string") {
    return { data: null, error: "Invalid sub-campaign ID" };
  }

  try {
    const supabase = createAdminClient();

    // If updating slug, check uniqueness
    if (data.slug) {
      const { data: existing } = await supabase
        .from("sub_campaigns")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return { data: null, error: "A sub-campaign with this slug already exists" };
      }
    }

    const { data: updated, error } = await supabase
      .from("sub_campaigns")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating sub-campaign:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { data: updated, error: null };
  } catch (err) {
    console.error("Unexpected error updating sub-campaign:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a sub-campaign
 */
export async function deleteSubCampaign(id: string): Promise<MutationResponse> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid sub-campaign ID" };
  }

  try {
    const supabase = createAdminClient();

    // Delete translations first
    const { error: translationsError } = await supabase
      .from("sub_campaigns_translations")
      .delete()
      .eq("sub_campaign_id", id);

    if (translationsError) {
      console.error("Error deleting sub-campaign translations:", translationsError);
      return { success: false, error: translationsError.message };
    }

    // Delete sub-campaign
    const { error } = await supabase
      .from("sub_campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting sub-campaign:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting sub-campaign:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================
// SUB-CAMPAIGN TRANSLATION OPERATIONS
// ============================================

export interface CreateSubCampaignTranslationData {
  sub_campaign_id: string;
  language: string;
  title: string;
  description?: string;
  short_description?: string;
}

export interface UpdateSubCampaignTranslationData {
  title?: string;
  description?: string;
  short_description?: string | null;
}

/**
 * Create a new translation for a sub-campaign
 */
export async function createSubCampaignTranslation(
  data: CreateSubCampaignTranslationData
): Promise<ActionResponse<SubCampaignTranslation>> {
  const { sub_campaign_id, language, title, description, short_description } = data;

  if (!sub_campaign_id) {
    return { data: null, error: "Sub-campaign ID is required" };
  }

  if (!language) {
    return { data: null, error: "Language is required" };
  }

  if (!title) {
    return { data: null, error: "Title is required" };
  }

  try {
    const supabase = createAdminClient();

    // Check if translation already exists for this language
    const { data: existing } = await supabase
      .from("sub_campaigns_translations")
      .select("id")
      .eq("sub_campaign_id", sub_campaign_id)
      .eq("language", language)
      .maybeSingle();

    if (existing) {
      return { data: null, error: `Translation for language '${language}' already exists` };
    }

    const { data: newTranslation, error } = await supabase
      .from("sub_campaigns_translations")
      .insert({
        sub_campaign_id,
        language,
        title,
        description: description || "",
        short_description: short_description || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating sub-campaign translation:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { data: newTranslation, error: null };
  } catch (err) {
    console.error("Unexpected error creating sub-campaign translation:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Update a sub-campaign translation
 */
export async function updateSubCampaignTranslation(
  translationId: string,
  data: UpdateSubCampaignTranslationData
): Promise<ActionResponse<SubCampaignTranslation>> {
  if (!translationId || typeof translationId !== "string") {
    return { data: null, error: "Invalid translation ID" };
  }

  try {
    const supabase = createAdminClient();

    const { data: updated, error } = await supabase
      .from("sub_campaigns_translations")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", translationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating sub-campaign translation:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { data: updated, error: null };
  } catch (err) {
    console.error("Unexpected error updating sub-campaign translation:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a sub-campaign translation
 */
export async function deleteSubCampaignTranslation(
  translationId: string
): Promise<MutationResponse> {
  if (!translationId || typeof translationId !== "string") {
    return { success: false, error: "Invalid translation ID" };
  }

  try {
    const supabase = createAdminClient();

    // Check that this is not the only translation for the sub-campaign
    const { data: translation, error: fetchError } = await supabase
      .from("sub_campaigns_translations")
      .select("sub_campaign_id")
      .eq("id", translationId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching translation:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!translation) {
      return { success: false, error: "Translation not found" };
    }

    const { count } = await supabase
      .from("sub_campaigns_translations")
      .select("*", { count: "exact", head: true })
      .eq("sub_campaign_id", translation.sub_campaign_id);

    if (count !== null && count <= 1) {
      return {
        success: false,
        error: "Cannot delete the only translation. A sub-campaign must have at least one translation.",
      };
    }

    const { error } = await supabase
      .from("sub_campaigns_translations")
      .delete()
      .eq("id", translationId);

    if (error) {
      console.error("Error deleting sub-campaign translation:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/campaigns");
    revalidatePath("/campaigns");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting sub-campaign translation:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get translation for a specific language
 */
export async function getSubCampaignTranslation(
  subCampaignId: string,
  language: string
): Promise<ActionResponse<SubCampaignTranslation>> {
  if (!subCampaignId || typeof subCampaignId !== "string") {
    return { data: null, error: "Invalid sub-campaign ID" };
  }

  if (!language || typeof language !== "string") {
    return { data: null, error: "Invalid language" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sub_campaigns_translations")
      .select("*")
      .eq("sub_campaign_id", subCampaignId)
      .eq("language", language)
      .maybeSingle();

    if (error) {
      console.error("Error fetching sub-campaign translation:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Translation not found" };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching sub-campaign translation:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}