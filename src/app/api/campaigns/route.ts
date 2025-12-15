import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import type {
  Campaign,
  CampaignType,
  CampaignStatus,
} from "@/src/types/campaign.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "en";
    const status = searchParams.get("status") as CampaignStatus | null;
    const campaignType = searchParams.get("campaignType") as CampaignType | null;
    const isFeatured = searchParams.get("isFeatured");

    const supabase = await createClient();

    // Query campaigns with translations for the specified language
    let query = supabase
      .from("campaigns")
      .select(`
        id,
        slug,
        campaign_type,
        status,
        icon_name,
        featured_image_url,
        is_featured,
        start_date,
        end_date,
        targets,
        demands,
        how_to_participate,
        resources,
        success_stories,
        call_to_action,
        stats,
        created_at,
        updated_at,
        campaigns_translations!inner (
          language,
          title,
          short_description,
          description
        )
      `)
      .eq("campaigns_translations.language", language);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (campaignType) {
      query = query.eq("campaign_type", campaignType);
    }

    if (isFeatured !== null) {
      query = query.eq("is_featured", isFeatured === "true");
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // Transform data to flatten the translation fields
    const campaigns: Campaign[] = (data || []).map((item) => {
      const translation = Array.isArray(item.campaigns_translations)
        ? item.campaigns_translations[0]
        : item.campaigns_translations;

      return {
        id: item.id,
        title: translation?.title || "",
        description: translation?.description || "",
        slug: item.slug,
        campaign_type: item.campaign_type as CampaignType,
        status: item.status as CampaignStatus,
        icon_name: item.icon_name,
        featured_image_url: item.featured_image_url,
        is_featured: item.is_featured,
        language: translation?.language || language,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    return NextResponse.json({
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
