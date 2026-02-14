import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/src/lib/db/queries/events.queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const events = await getEvents({
      search: searchParams.get('search') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      locationMode: searchParams.get('locationMode') || undefined,
      status: searchParams.get('status') || 'upcoming',
      language: searchParams.get('language') || 'en',
      upcoming: searchParams.get('upcoming') === 'true',
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
