import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { transformEventRow } from "@/src/lib/types/event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: transformEventRow(data),
    });
  } catch (error) {
    console.error("Error in event API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    // Find the event first
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.featured_image !== undefined) updateData.featured_image = body.featured_image;
    if (body.alt_texts !== undefined) updateData.alt_texts = body.alt_texts;
    if (body.categories !== undefined) updateData.categories = body.categories;
    if (body.locations !== undefined) updateData.locations = body.locations;
    if (body.organizers !== undefined) updateData.organizers = body.organizers;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.author_name !== undefined) updateData.author_name = body.author_name;

    // Handle status changes
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "published") {
        updateData.published_at = now;
      }
    }

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", existingEvent.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: transformEventRow(data),
    });
  } catch (error) {
    console.error("Error in update event API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    // Find the event first
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", existingEvent.id);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json(
        { error: "Failed to delete event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete event API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
