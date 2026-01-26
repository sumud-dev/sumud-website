import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/src/i18n/routing";
import { getTranslationsObject } from "@/src/lib/db/queries/translations";

type Locale = "en" | "fi";
type Messages = Record<string, Record<string, unknown>>;

/**
 * Load messages from database
 */
async function loadMessagesFromDB(locale: Locale): Promise<Messages> {
  try {
    // Fetch from database
    const dbMessages = await getTranslationsObject(locale);
    
    // If database has translations, use them
    if (Object.keys(dbMessages).length > 0) {
      return dbMessages as Messages;
    }
    
    // Return empty object if no translations found
    console.warn(`No translations found in database for locale ${locale}`);
    return {};
  } catch (error) {
    console.error(`Failed to load messages from database for locale ${locale}:`, error);
    // Return empty object on error
    return {};
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load messages from database
  const messages = await loadMessagesFromDB(locale as Locale);

  return {
    locale,
    messages,
  };
});
