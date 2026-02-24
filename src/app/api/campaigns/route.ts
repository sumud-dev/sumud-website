import { NextRequest, NextResponse } from 'next/server';
import { 
  getActiveCampaigns,
  searchCampaigns, 
  getCampaignsByCategory,
  getFeaturedCampaigns 
} from '@/src/lib/db/queries/campaigns.queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const language = searchParams.get('language') || 'en';
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let campaigns;

    // If searching, use search query
    if (search) {
      const searchResult = await searchCampaigns(search, language);
      campaigns = searchResult;
    }
    // If filtering by category
    else if (category) {
      campaigns = await getCampaignsByCategory(category, language);
    }
    // If only featured
    else if (isFeatured) {
      campaigns = await getFeaturedCampaigns(language);
    }
    // Default: get all active campaigns (public page should only show active)
    else {
      campaigns = await getActiveCampaigns(language, true);
    }

    // Apply limit if specified
    if (limit && Array.isArray(campaigns)) {
      campaigns = campaigns.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error('Error in campaigns API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch campaigns' 
      },
      { status: 500 }
    );
  }
}
