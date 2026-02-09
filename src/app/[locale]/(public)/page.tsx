import { setRequestLocale } from "next-intl/server";
import { getPublishedPage } from "@/src/actions/pages.actions";
import { PageRenderer } from '@/src/components/renderer/PageRenderer';
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
    const data = await getPublishedPage("home", locale as 'en' | 'fi');
    
    if (!data) {
      return {
        title: "Home - Sumud",
      };
    }

    return {
      title: data.page.title || "Home - Sumud",
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
  const data = await getPublishedPage("/", locale as 'en' | 'fi');

  // If no page, render empty page
  if (!data) {
    return <main />;
  }

  return (
    <main>
      <h1 className="sr-only">{data.page.title}</h1>
      <PageRenderer content={data.content as any} />
    </main>
  );
}
