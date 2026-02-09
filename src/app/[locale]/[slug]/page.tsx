import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { PageRenderer } from '@/src/components/renderer/PageRenderer';
import { getPublishedPage, getAllPages } from '@/src/actions/pages.actions';
import MainHeader from '@/src/components/navigation/main-header';
import Footer from '@/src/components/navigation/footer';
import type { Locale } from '@/src/actions/navigation.actions';
import type { SerializedNodes } from '@craftjs/core';

interface DynamicPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Reserved routes that should not be caught by this dynamic route
const RESERVED_ROUTES = [
  'admin',
  'about',
  'articles',
  'auth',
  'campaigns',
  'contact',
  'events',
  'join',
  'membership',
  'privacy-policy',
  'pages',
  'p',
  'api',
  'sign-in',
];

// Generate static params for all published pages
export async function generateStaticParams() {
  try {
    const pages = await getAllPages();
    
    return pages
      .filter((p) => p.status === 'published' && !RESERVED_ROUTES.includes(p.slug))
      .map((page) => ({
        slug: page.slug,
      }));
  } catch (error) {
    console.error('[root/[slug]] Error generating static params:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: DynamicPageProps) {
  const { locale, slug } = await params;
  
  // Skip metadata for reserved routes
  if (RESERVED_ROUTES.includes(slug)) {
    return { title: 'Not Found' };
  }
  
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

export default async function DynamicPageRoute({ params }: DynamicPageProps) {
  const { locale, slug } = await params;

  // Skip reserved routes - let them 404
  if (RESERVED_ROUTES.includes(slug)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
  
  const data = await getPublishedPage(slug, locale as 'en' | 'fi');

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <main className="flex-1">
        <h1 className="sr-only">{data.page.title}</h1>
        <PageRenderer content={data.content as SerializedNodes} />
      </main>
      <Footer locale={locale as Locale} />
    </div>
  );
}
