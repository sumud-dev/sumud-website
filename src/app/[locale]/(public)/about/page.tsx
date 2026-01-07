import { setRequestLocale } from "next-intl/server";
import { readPage } from "@/src/lib/pages/file-storage";
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
    const page = await readPage("about");
    if (!page) {
      return {
        title: "About Us - Sumud",
      };
    }

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

  // Read about page content from JSON file
  const page = await readPage("about");

  // If no page, render empty page
  if (!page) {
    return <main />;
  }

  // Use English blocks as they contain multilingual content
  // PageRenderer will extract the correct locale from each block
  const blocks = page.translations.en?.blocks || [];

  return (
    <main className="min-h-screen bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      <PageRenderer blocks={blocks} locale={locale} />
    </main>
  );
}
