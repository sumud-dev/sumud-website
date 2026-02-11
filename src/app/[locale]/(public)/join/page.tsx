import { setRequestLocale } from "next-intl/server";
import { getPublishedPage } from "@/src/actions/pages.actions";
import { PageRenderer } from '@/src/components/renderer/PageRenderer';

interface JoinPageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for the join page
export async function generateMetadata({ params }: JoinPageProps) {
  const { locale } = await params;

  try {
    const data = await getPublishedPage("join", locale as 'en' | 'fi');
    
    if (!data) {
      return {
        title: "Support Us - Sumud",
        description: "Join our community and support our mission through donations.",
      };
    }

    return {
      title: data.page.title || "Support Us - Sumud",
      description: "Join our community and support our mission through donations.",
    };
  } catch {
    return {
      title: "Support Us - Sumud",
      description: "Join our community and support our mission through donations.",
    };
  }
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Read join page content from database
  const data = await getPublishedPage("join", locale as 'en' | 'fi');

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
