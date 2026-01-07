import { setRequestLocale } from "next-intl/server";
import { readPage } from "@/src/lib/pages/file-storage";
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
    const page = await readPage("home");
    if (!page) {
      return {
        title: "Home - Sumud",
      };
    }

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

  // Read homepage content from JSON file
  const page = await readPage("home");

  // Get translation for current locale, fallback to English
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
