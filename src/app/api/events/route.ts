import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import type {
  BaseEvent,
  EventsApiResponse,
  EventType,
  EventLocationMode,
  EventStatus,
} from "@/src/lib/types/event";
import { transformEventRow } from "@/src/lib/types/event";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get("status") as EventStatus | null;
    const eventType = searchParams.get("eventType") as EventType | null;
    const locationMode = searchParams.get("locationMode") as EventLocationMode | null;
    const language = searchParams.get("language") || "en";
    const search = searchParams.get("search");
    const upcoming = searchParams.get("upcoming");
    const isFeatured = searchParams.get("featured");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    // Debug logging for date filtering
    if (startDate || endDate) {
      console.log("[Events API] Date filter params:", { startDate, endDate });
    }

    // Build query
    let query = supabase
      .from("events")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    } else {
      // Default to published events for public API
      query = query.eq("status", "published");
    }

    if (language) {
      query = query.eq("language", language);
    }

    // Search in title and content
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Filter by categories (eventType is stored in categories for now)
    if (eventType) {
      query = query.ilike("categories", `%${eventType}%`);
    }

    // Filter by locations (locationMode is stored in locations for now)
    if (locationMode) {
      query = query.ilike("locations", `%${locationMode}%`);
    }

    // Filter for featured events
    if (isFeatured === "true") {
      // Featured filter - can be stored in categories or a dedicated column
      query = query.ilike("categories", `%featured%`);
    }

    // Filter for upcoming events (published_at is used as start_date)
    if (upcoming === "true") {
      const now = new Date().toISOString();
      query = query.gte("published_at", now);
    }

    // Date range filtering
    // The dates come as YYYY-MM-DD in the user's local timezone
    if (startDate && endDate) {
      // For date filtering, we need to cast published_at to date for comparison
      // This ensures we're comparing just the date portion, ignoring time
      const startDateTime = new Date(`${startDate}T00:00:00`);
      const endDateTime = new Date(`${endDate}T23:59:59.999`);
      
      query = query.gte("published_at", startDateTime.toISOString());
      query = query.lte("published_at", endDateTime.toISOString());
    } else if (startDate) {
      const startDateTime = new Date(`${startDate}T00:00:00`);
      query = query.gte("published_at", startDateTime.toISOString());
    } else if (endDate) {
      const endDateTime = new Date(`${endDate}T23:59:59.999`);
      query = query.lte("published_at", endDateTime.toISOString());
    }

    // Ordering - newest first
    query = query.order("published_at", { ascending: false });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    // Debug logging for results
    if (startDate || endDate) {
      console.log("[Events API] Query results:", { 
        count, 
        dataLength: data?.length,
        firstEventDate: data?.[0]?.published_at,
        startDate,
        endDate
      });
    }

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    // Transform database rows to BaseEvent format
    const events: BaseEvent[] = (data || []).map(transformEventRow);

    const response: EventsApiResponse = {
      data: events,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in events API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Generate unique ID
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const insertData = {
      id,
      title: body.title,
      slug,
      content: body.content,
      status: body.status || "draft",
      featured_image: body.featured_image || null,
      alt_texts: body.alt_texts || null,
      categories: body.categories || body.event_type || null,
      locations: body.locations || body.location_mode || null,
      organizers: body.organizers || null,
      language: body.language || "en",
      author_name: body.author_name || null,
      published_at: body.status === "published" ? now : null,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("events")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: transformEventRow(data),
    });
  } catch (error) {
    console.error("Error in create event API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
