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

// Allow dynamic routes that weren't generated at build time
export const dynamicParams = true;

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

    const translation =
      page.translations[locale as PageLocale] || page.translations.en;

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

  // Use English blocks as they contain multilingual content
  // PageRenderer will extract the correct locale from each block
  const blocks = page.translations.en?.blocks || [];

  return (
    <main className="min-h-screen bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      <PageRenderer blocks={blocks} locale={locale} />
    </main>
  );
}