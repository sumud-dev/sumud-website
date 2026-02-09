import { setRequestLocale } from "next-intl/server";
import { getPublishedPage } from "@/src/actions/pages.actions";
import { PageRenderer } from '@/src/components/renderer/PageRenderer';
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
    const data = await getPublishedPage("contact", locale as 'en' | 'fi');
    
    if (!data) {
      return {
        title: "Contact Us - Sumud",
      };
    }

    return {
      title: data.page.title || "Contact Us - Sumud",
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
  const data = await getPublishedPage("contact", locale as 'en' | 'fi');

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