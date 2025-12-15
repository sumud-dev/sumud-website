import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/src/i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Locale = "en" | "ar" | "fi";
type Messages = Record<string, Record<string, unknown>>;

/**
 * Unflatten dot-notation keys back into nested object
 */
function unflattenObject(
  flat: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const keys = key.split(".");
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    // Try to parse arrays stored as JSON
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        current[lastKey] = parsed;
      } else {
        current[lastKey] = value;
      }
    } catch {
      current[lastKey] = value;
    }
  }

  return result;
}

/**
 * Fetch translations from database and merge with JSON fallback
 */
async function getMessagesFromDB(locale: Locale): Promise<Messages | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Read-only for this use case
          },
        },
      }
    );

    const { data, error } = await supabase
      .from("site_content")
      .select("namespace, key, value")
      .eq("locale", locale);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Group by namespace and unflatten
    const messages: Messages = {};
    const grouped: Record<string, Record<string, string>> = {};

    for (const item of data) {
      const ns = item.namespace || "common";
      const key = item.key || "";
      const value = item.value || "";

      if (!grouped[ns]) {
        grouped[ns] = {};
      }
      grouped[ns][key] = value;
    }

    for (const [namespace, flat] of Object.entries(grouped)) {
      messages[namespace] = unflattenObject(flat);
    }

    return messages;
  } catch (error) {
    console.error("Error fetching messages from DB:", error);
    return null;
  }
}

/**
 * Deep merge two objects, with source overriding target
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load JSON fallback first
  const jsonMessages = (await import(`@/messages/${locale}.json`)).default;

  // Try to get DB messages (they override JSON)
  const dbMessages = await getMessagesFromDB(locale as Locale);

  // Merge: JSON as fallback, DB overrides
  const messages = dbMessages
    ? deepMerge(jsonMessages, dbMessages as Record<string, unknown>)
    : jsonMessages;

  return {
    locale,
    messages,
  };
});
