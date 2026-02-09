import { setRequestLocale } from "next-intl/server";
import { getPublishedPage } from "@/src/actions/pages.actions";
import { PageRenderer } from '@/src/components/renderer/PageRenderer';
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
    const data = await getPublishedPage("about", locale as 'en' | 'fi');
    
    if (!data) {
      return {
        title: "About Us - Sumud",
      };
    }

    return {
      title: data.page.title || "About Us - Sumud",
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
  const data = await getPublishedPage("about", locale as 'en' | 'fi');

  // If no page, render empty page
  if (!data) {
    return <main />;
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      <h1 className="sr-only">{data.page.title}</h1>
      <PageRenderer content={data.content as any} />
    </main>
  );
}
