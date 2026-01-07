import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { readPage, listPages } from "@/src/lib/pages/file-storage";
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
    const pages = await listPages();
    const publishedPages = pages.filter((p) => p.status === "published");

    return publishedPages.map((page) => ({
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
    const page = await readPage(slug);
    if (!page || page.status !== "published") {
      return {
        title: "Page Not Found",
      };
    }

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

  // Read page from JSON file
  const page = await readPage(slug);

  // Check if page exists and is published
  if (!page || page.status !== "published") {
    notFound();
  }

  // Get translation for current locale, fallback to English
  const translation =
    page.translations[locale as PageLocale] || page.translations.en;

  if (!translation) {
    notFound();
  }

  return (
    <main>
      <PageRenderer blocks={translation.blocks || []} />
    </main>
  );
}
