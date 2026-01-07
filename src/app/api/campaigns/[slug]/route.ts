import { NextRequest, NextResponse } from 'next/server';
import { getCampaignBySlug } from '@/src/lib/db/queries/campaigns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const language = request.nextUrl.searchParams.get('language') || 'en';

    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slug parameter is required' 
        },
        { status: 400 }
      );
    }

    // Get campaign
    const campaign = await getCampaignBySlug(slug, language);

    if (!campaign) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error('Error in campaign detail API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch campaign' 
      },
      { status: 500 }
    );
  }
}
