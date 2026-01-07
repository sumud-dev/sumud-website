import { setRequestLocale } from "next-intl/server";
import { readPage } from "@/src/lib/pages/file-storage";
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
    const page = await readPage("contact");
    if (!page) {
      return {
        title: "Contact Us - Sumud",
      };
    }

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

  // Read contact page content from JSON file
  const page = await readPage("contact");

  // If no page, render empty page
  if (!page) {
    return <main />;
  }

  // Use English blocks as they contain multilingual content
  // PageRenderer will extract the correct locale from each block
  const blocks = page.translations.en?.blocks || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      <PageRenderer blocks={blocks} locale={locale} />
    </main>
  );
}