"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/lib/database.types";
import {
  generateSlug,
  generateEventId,
  type Event,
  type EventStatus,
  type CreateEventData,
  type UpdateEventData,
  type ActionResponse,
  type MutationResponse,
} from "@/src/lib/utils/event.utils";

// Re-export types for consumers
export type { Event, EventStatus, CreateEventData, UpdateEventData };

// Database types for internal use
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

// ============================================
// READ OPERATIONS (using regular client with RLS)
// ============================================

/**
 * Fetch all events ordered by published date
 */
export async function getEvents(): Promise<ActionResponse<Event[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching events:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch published events only (for public pages)
 */
export async function getPublishedEvents(): Promise<ActionResponse<Event[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching published events:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching published events:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single event by ID
 */
export async function getEventById(id: string): Promise<ActionResponse<Event>> {
  if (!id || typeof id !== "string") {
    return { data: null, error: "Invalid event ID" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching event by ID:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Event not found" };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching event:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<ActionResponse<Event>> {
  if (!slug || typeof slug !== "string") {
    return { data: null, error: "Invalid slug" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching event by slug:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Event not found" };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching event:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch events by category
 */
export async function getEventsByCategory(
  category: string
): Promise<ActionResponse<Event[]>> {
  if (!category || typeof category !== "string") {
    return { data: null, error: "Invalid category" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .ilike("categories", `%${category}%`)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching events by category:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching events by category:", err);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// ============================================
// WRITE OPERATIONS (using admin client to bypass RLS)
// ============================================

/**
 * Create a new event
 */
export async function createEvent(
  data: CreateEventData
): Promise<MutationResponse & { id?: string; slug?: string }> {
  // Validate required fields
  if (!data.title?.trim()) {
    return { success: false, error: "Title is required" };
  }

  if (!data.content?.trim()) {
    return { success: false, error: "Content is required" };
  }

  try {
    const supabase = createAdminClient();

    const eventId = generateEventId();
    const slug = data.slug?.trim() || generateSlug(data.title);
    const now = new Date().toISOString();

    // Check if slug already exists
    const { data: existingEvent } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingEvent) {
      return { success: false, error: "An event with this slug already exists" };
    }

    const insertData: EventInsert = {
      id: eventId,
      title: data.title.trim(),
      slug,
      content: data.content.trim(),
      status: data.status || "draft",
      featured_image: data.featured_image || null,
      alt_texts: data.alt_texts || null,
      categories: data.categories || null,
      locations: data.locations || null,
      organizers: data.organizers || null,
      language: data.language || "en",
      author_name: data.author_name || null,
      published_at: data.status === "published" ? now : null,
      updated_at: now,
    };

    const { error } = await supabase.from("events").insert(insertData);

    if (error) {
      console.error("Error creating event:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, error: null, id: eventId, slug };
  } catch (err) {
    console.error("Unexpected error creating event:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: string,
  data: UpdateEventData
): Promise<MutationResponse & { slug?: string }> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid event ID" };
  }

  try {
    const supabase = createAdminClient();

    // Verify event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching event for update:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!existingEvent) {
      return { success: false, error: `Event with ID ${id} not found` };
    }

    // Check for slug conflicts if updating slug
    if (data.slug && data.slug !== existingEvent.slug) {
      const { data: slugConflict } = await supabase
        .from("events")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", id)
        .maybeSingle();

      if (slugConflict) {
        return { success: false, error: "An event with this slug already exists" };
      }
    }

    const updateData: EventUpdate = {
      updated_at: new Date().toISOString(),
    };

    // Only update provided fields
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.slug !== undefined) updateData.slug = data.slug.trim();
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.featured_image !== undefined) updateData.featured_image = data.featured_image;
    if (data.alt_texts !== undefined) updateData.alt_texts = data.alt_texts;
    if (data.categories !== undefined) updateData.categories = data.categories;
    if (data.locations !== undefined) updateData.locations = data.locations;
    if (data.organizers !== undefined) updateData.organizers = data.organizers;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.author_name !== undefined) updateData.author_name = data.author_name;

    // Handle status changes
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "published") {
        updateData.published_at = new Date().toISOString();
      } else if (data.status === "draft") {
        updateData.published_at = null;
      }
    }

    const { data: result, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating event:", error);
      return { success: false, error: error.message };
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Update failed. You may not have permission to update this event.",
      };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    if (data.slug || existingEvent.slug) {
      revalidatePath(`/events/${data.slug || existingEvent.slug}`);
    }

    return { success: true, error: null, slug: data.slug || existingEvent.slug || undefined };
  } catch (err) {
    console.error("Unexpected error updating event:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update event status (publish, unpublish, archive)
 */
export async function updateEventStatus(
  id: string,
  newStatus: EventStatus
): Promise<MutationResponse> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid event ID" };
  }

  const validStatuses: EventStatus[] = ["draft", "published", "archived"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: "Invalid status" };
  }

  try {
    const supabase = createAdminClient();

    const updateData: EventUpdate = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "published") {
      updateData.published_at = new Date().toISOString();
    } else if (newStatus === "draft") {
      updateData.published_at = null;
    }

    const { error } = await supabase.from("events").update(updateData).eq("id", id);

    if (error) {
      console.error("Error updating event status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error updating event status:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete an event by ID
 */
export async function deleteEvent(id: string): Promise<MutationResponse> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Invalid event ID" };
  }

  try {
    const supabase = createAdminClient();

    // Verify event exists before deleting
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching event for deletion:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting event:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete multiple events by IDs
 */
export async function deleteEvents(ids: string[]): Promise<MutationResponse> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, error: "No event IDs provided" };
  }

  // Validate all IDs
  if (!ids.every((id) => typeof id === "string" && id.trim())) {
    return { success: false, error: "Invalid event IDs" };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("events").delete().in("id", ids);

    if (error) {
      console.error("Error deleting events:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error deleting events:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
