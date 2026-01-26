import { setRequestLocale } from "next-intl/server";
import { getPublicPageAction } from "@/src/actions/pages.actions";
import { PageRenderer } from "@/src/components/blocks";
import type { PageLocale } from "@/src/lib/types/page";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for the about page
export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;

  try {
    const result = await getPublicPageAction("about", locale as 'en' | 'fi');
    
    if (!result.success || !result.data) {
      return {
        title: "About Us - Sumud",
      };
    }

    const page = result.data;
    const translation = page.translations[locale as PageLocale] || page.translations.en;

    return {
      title: translation?.title || "About Us - Sumud",
      description: translation?.description || "Learn more about Sumud and our mission",
    };
  } catch {
    return {
      title: "About Us - Sumud",
    };
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Read about page content from database
  const result = await getPublicPageAction("about", locale as 'en' | 'fi');
  const page = result.success ? result.data : null;

  // If no page, render empty page
  if (!page) {
    return <main />;
  }

  // Use current locale blocks or fallback to English
  const translation = page.translations[locale as PageLocale] || page.translations.en;
  const blocks = translation?.blocks || [];

  return (
    <main className="min-h-screen bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      <PageRenderer blocks={blocks} locale={locale} />
    </main>
  );
}
