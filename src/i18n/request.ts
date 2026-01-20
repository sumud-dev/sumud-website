import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/src/i18n/routing";

type Locale = "en" | "fi";
type Messages = Record<string, Record<string, unknown>>;

/**
 * Load messages from JSON files
 */
async function loadMessagesFromJSON(locale: Locale): Promise<Messages> {
  try {
    const messages = (await import(`@/messages/${locale}.json`)).default;
    return messages;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English if the locale file doesn't exist
    if (locale !== "en") {
      return (await import(`@/messages/en.json`)).default;
    }
    return {};
  }
}
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load messages from JSON files
  const messages = await loadMessagesFromJSON(locale as Locale);

  return {
    locale,
    messages,
  };
});
