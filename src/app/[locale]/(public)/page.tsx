import { setRequestLocale } from "next-intl/server";
import { getPublicPageAction } from "@/src/actions/pages.actions";
import { PageRenderer } from "@/src/components/blocks";
import type { PageLocale } from "@/src/lib/types/page";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for the homepage
export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;

  try {
    const result = await getPublicPageAction("home", locale as 'en' | 'fi');
    
    if (!result.success || !result.data) {
      return {
        title: "Home - Sumud",
      };
    }

    const page = result.data;
    const translation = page.translations[locale as PageLocale] || page.translations.en;

    return {
      title: translation?.title || "Home - Sumud",
      description: translation?.description || "",
    };
  } catch {
    return {
      title: "Home - Sumud",
    };
  }
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Read homepage content from database
  const result = await getPublicPageAction("home", locale as 'en' | 'fi');

  // Get translation for current locale, fallback to English
  const page = result.success ? result.data : null;
  const translation = page?.translations[locale as PageLocale] || page?.translations.en;

  // If no page or translation, render empty page
  if (!page || !translation) {
    return <main />;
  }

  return (
    <main>
      <PageRenderer blocks={translation.blocks || []} locale={locale} />
    </main>
  );
}
