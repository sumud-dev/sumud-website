import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPublicPageAction, listPublishedPagesAction } from "@/src/actions/pages.actions";
import { PageRenderer } from "@/src/components/blocks";
import type { PageLocale } from "@/src/lib/types/page";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Generate static params for all published pages
export async function generateStaticParams() {
  try {
    const result = await listPublishedPagesAction();
    
    if (!result.success) {
      console.error("Error listing published pages:", result.error);
      return [];
    }

    const pages = result.data as Array<{ slug: string; status: string }>;
    return pages
      .filter((p) => p.status === "published")
      .map((page) => ({
        slug: page.slug,
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  
  try {
    const result = await getPublicPageAction(slug, locale as 'en' | 'fi');
    
    if (!result.success || !result.data) {
      return {
        title: "Page Not Found",
      };
    }

    const page = result.data;
    const translation = page.translations[locale as PageLocale] || page.translations.en;

    return {
      title: translation?.title || page.slug,
      description: translation?.description || "",
    };
  } catch {
    return {
      title: "Page Not Found",
    };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Read page from database
  const result = await getPublicPageAction(slug, locale as 'en' | 'fi');
  const page = result.success ? result.data : null;

  // Check if page exists (getPublicPageAction already filters for published status)
  if (!page) {
    notFound();
  }

  // Get translation for current locale, fallback to English
  const translation = page.translations[locale as PageLocale] || page.translations.en;

  if (!translation) {
    notFound();
  }

  return (
    <main>
      <PageRenderer blocks={translation.blocks || []} />
    </main>
  );
}
