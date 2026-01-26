import { setRequestLocale } from "next-intl/server";
import { getPublicPageAction } from "@/src/actions/pages.actions";
import { PageRenderer } from "@/src/components/blocks";
import type { PageLocale } from "@/src/lib/types/page";

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for the contact page
export async function generateMetadata({ params }: ContactPageProps) {
  const { locale } = await params;

  try {
    const result = await getPublicPageAction("contact", locale as 'en' | 'fi');
    
    if (!result.success || !result.data) {
      return {
        title: "Contact Us - Sumud",
      };
    }

    const page = result.data;
    const translation = page.translations[locale as PageLocale] || page.translations.en;

    return {
      title: translation?.title || "Contact Us - Sumud",
      description: translation?.description || "Get in touch with Sumud",
    };
  } catch {
    return {
      title: "Contact Us - Sumud",
    };
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Read contact page content from database
  const result = await getPublicPageAction("contact", locale as 'en' | 'fi');
  const page = result.success ? result.data : null;

  // If no page, render empty page
  if (!page) {
    return <main />;
  }

  // Get blocks for the current locale, fallback to English if not available
  const translation = page.translations[locale as PageLocale] || page.translations.en;
  const blocks = translation?.blocks || [];

  return (
    <main className="min-h-screen bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      <PageRenderer blocks={blocks} locale={locale} />
    </main>
  );
}