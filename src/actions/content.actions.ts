"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type {
  SiteContent,
  ContentResponse,
  ContentUpdateResponse,
  BulkContentUpdate,
  Locale,
  ContentNamespace,
} from "@/src/types/Content";
import { translateToAllLocales } from "@/src/lib/services/translation.service";

// Define locales inline to avoid importing constants in "use server" file
const LOCALES: Locale[] = ["en", "ar", "fi"];

/**
 * Get admin client lazily to avoid initialization errors
 * This ensures environment variables are available when the client is created
 */
function getSupabaseAdmin() {
  return createAdminClient();
}

/**
 * Fetch all content for a specific locale
 * Uses admin client to bypass RLS for content management
 */
export async function getContentByLocale(
  locale: Locale
): Promise<ContentResponse> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("locale", locale)
    .order("namespace", { ascending: true })
    .order("key", { ascending: true });

  if (error) {
    console.error("Error fetching content:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SiteContent[], error: null };
}

/**
 * Fetch content for a specific namespace and locale
 * Uses admin client to bypass RLS for content management
 */
export async function getContentByNamespace(
  namespace: ContentNamespace,
  locale: Locale
): Promise<ContentResponse> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("locale", locale)
    .eq("namespace", namespace)
    .order("key", { ascending: true });

  if (error) {
    console.error("Error fetching content by namespace:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SiteContent[], error: null };
}

/**
 * Get all available namespaces for a locale
 * Uses admin client to bypass RLS for content management
 */
export async function getNamespaces(
  locale: Locale
): Promise<{ data: string[] | null; error: string | null }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_content")
    .select("namespace")
    .eq("locale", locale)
    .order("namespace", { ascending: true });

  if (error) {
    console.error("Error fetching namespaces:", error);
    return { data: null, error: error.message };
  }

  // Get unique namespaces
  const namespaces = [...new Set(data.map((item) => item.namespace).filter(Boolean))] as string[];

  return { data: namespaces, error: null };
}

/**
 * Update a single content item
 */
export async function updateContent(
  id: string,
  value: string
): Promise<ContentUpdateResponse> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("site_content")
    .update({
      value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating content:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content");
  return { success: true, error: null };
}

/**
 * Bulk update multiple content items
 */
export async function bulkUpdateContent(
  updates: BulkContentUpdate[]
): Promise<ContentUpdateResponse> {
  const supabase = getSupabaseAdmin();
  // Process updates in parallel
  const results = await Promise.all(
    updates.map(async ({ id, value }) => {
      const { error } = await supabase
        .from("site_content")
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return { id, error };
    })
  );

  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error("Errors updating content:", errors);
    return {
      success: false,
      error: `Failed to update ${errors.length} item(s)`,
    };
  }

  revalidatePath("/admin/content");
  return { success: true, error: null };
}

/**
 * Create a new content item
 */
export async function createContent(
  locale: Locale,
  namespace: string,
  key: string,
  value: string,
  contentType: string = "text"
): Promise<ContentUpdateResponse> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_content").insert({
    locale,
    namespace,
    key,
    value,
    content_type: contentType,
  });

  if (error) {
    console.error("Error creating content:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content");
  return { success: true, error: null };
}

/**
 * Create content with automatic translation to all locales
 */
export async function createContentWithTranslation(
  sourceLocale: Locale,
  namespace: string,
  key: string,
  value: string,
  contentType: string = "text"
): Promise<ContentUpdateResponse & { translatedLocales?: Locale[] }> {
  // First translate to all locales
  const { translations, error: translationError } = await translateToAllLocales(
    value,
    sourceLocale
  );

  if (translationError) {
    console.error("Translation error:", translationError);
    // Continue with just the source content if translation fails
    const result = await createContent(sourceLocale, namespace, key, value, contentType);
    return { ...result, translatedLocales: [sourceLocale] };
  }

  // Insert content for all locales
  const insertData = LOCALES.map((locale) => ({
    locale,
    namespace,
    key,
    value: translations[locale],
    content_type: contentType,
  }));

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_content").insert(insertData);

  if (error) {
    console.error("Error creating translated content:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content");
  return { success: true, error: null, translatedLocales: LOCALES };
}

/**
 * Update content and optionally translate to other locales
 */
export async function updateContentWithTranslation(
  id: string,
  value: string,
  sourceLocale: Locale,
  namespace: string,
  key: string,
  translateToOthers: boolean = false
): Promise<ContentUpdateResponse & { translatedLocales?: Locale[] }> {
  const supabase = getSupabaseAdmin();
  // Update the source content first
  const { error: updateError } = await supabase
    .from("site_content")
    .update({
      value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating content:", updateError);
    return { success: false, error: updateError.message };
  }

  if (!translateToOthers) {
    revalidatePath("/admin/content");
    return { success: true, error: null, translatedLocales: [sourceLocale] };
  }

  // Translate and update other locales
  const { translations, error: translationError } = await translateToAllLocales(
    value,
    sourceLocale
  );

  if (translationError) {
    console.error("Translation error:", translationError);
    revalidatePath("/admin/content");
    return { 
      success: true, 
      error: `Content saved but translation failed: ${translationError}`,
      translatedLocales: [sourceLocale]
    };
  }

  // Update other locales
  const targetLocales = LOCALES.filter((l) => l !== sourceLocale);
  const updateErrors: string[] = [];

  await Promise.all(
    targetLocales.map(async (locale) => {
      // Check if content exists for this locale
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("locale", locale)
        .eq("namespace", namespace)
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("site_content")
          .update({
            value: translations[locale],
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) {
          updateErrors.push(`${locale}: ${error.message}`);
        }
      } else {
        // Create new
        const { error } = await supabase.from("site_content").insert({
          locale,
          namespace,
          key,
          value: translations[locale],
          content_type: "text",
        });

        if (error) {
          updateErrors.push(`${locale}: ${error.message}`);
        }
      }
    })
  );

  revalidatePath("/admin/content");

  if (updateErrors.length > 0) {
    return {
      success: true,
      error: `Some translations failed: ${updateErrors.join("; ")}`,
      translatedLocales: [sourceLocale],
    };
  }

  return { success: true, error: null, translatedLocales: LOCALES };
}

/**
 * Delete a content item
 */
export async function deleteContent(id: string): Promise<ContentUpdateResponse> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_content").delete().eq("id", id);

  if (error) {
    console.error("Error deleting content:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content");
  return { success: true, error: null };
}

/**
 * Search content by key or value
 * Uses admin client to bypass RLS for content management
 */
export async function searchContent(
  query: string,
  locale?: Locale
): Promise<ContentResponse> {
  const supabase = getSupabaseAdmin();
  let queryBuilder = supabase
    .from("site_content")
    .select("*")
    .or(`key.ilike.%${query}%,value.ilike.%${query}%`);

  if (locale) {
    queryBuilder = queryBuilder.eq("locale", locale);
  }

  const { data, error } = await queryBuilder.order("namespace", { ascending: true });

  if (error) {
    console.error("Error searching content:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SiteContent[], error: null };
}

/**
 * Get content statistics
 * Uses admin client to bypass RLS for content management
 */
export async function getContentStats(): Promise<{
  data: { locale: string; count: number; namespaces: number }[] | null;
  error: string | null;
}> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("site_content").select("locale, namespace");

  if (error) {
    console.error("Error fetching content stats:", error);
    return { data: null, error: error.message };
  }

  // Group by locale and count
  const stats = data.reduce(
    (acc, item) => {
      const locale = item.locale || "unknown";
      if (!acc[locale]) {
        acc[locale] = { count: 0, namespaces: new Set() };
      }
      acc[locale].count++;
      if (item.namespace) {
        acc[locale].namespaces.add(item.namespace);
      }
      return acc;
    },
    {} as Record<string, { count: number; namespaces: Set<string> }>
  );

  const result = Object.entries(stats).map(([locale, data]) => ({
    locale,
    count: data.count,
    namespaces: data.namespaces.size,
  }));

  return { data: result, error: null };
}
