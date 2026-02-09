import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { PageRenderer } from '@/src/components/renderer/PageRenderer';
import { getPublishedPage, getAllPages } from '@/src/actions/pages.actions';

interface PublicPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Generate static params for all published pages
export async function generateStaticParams() {
  try {
    const pages = await getAllPages();
    
    return pages
      .filter((p) => p.status === 'published')
      .map((page) => ({
        slug: page.slug,
      }));
  } catch (error) {
    console.error('[p/[slug]] Error generating static params:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PublicPageProps) {
  const { locale, slug } = await params;
  
  try {
    const data = await getPublishedPage(slug, locale as 'en' | 'fi');
    
    if (!data) {
      return {
        title: 'Page Not Found',
      };
    }

    return {
      title: data.page.title || slug,
    };
  } catch {
    return {
      title: 'Page Not Found',
    };
  }
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { locale, slug } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  
  const data = await getPublishedPage(slug, locale as 'en' | 'fi');

  if (!data) {
    notFound();
  }

  return (
    <main>
      <h1 className="sr-only">{data.page.title}</h1>
      <PageRenderer content={data.content as any} />
    </main>
  );
}
