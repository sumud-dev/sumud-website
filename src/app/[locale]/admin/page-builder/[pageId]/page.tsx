import { EditorCanvas } from '@/src/components/admin/page-builder/EditorCanvas';
import { getPageWithContent } from '@/src/actions/pages.actions';
import { notFound } from 'next/navigation';

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string; locale: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { pageId, locale } = await params;  // ← FIX: Destructure locale
  const { lang } = await searchParams;
  
  // Priority: 1. searchParams.lang (override), 2. params.locale (route), 3. default 'en'
  const language = (lang || locale || 'en') as 'en' | 'fi';
  
  console.log('[EditorPage] Loading page:', {
    pageId,
    routeLocale: locale,
    queryLang: lang,
    resolvedLanguage: language,
  });
  
  const page = await getPageWithContent(pageId, language);

  if (!page) {
    console.warn('[EditorPage] Page not found:', { pageId, language });
    notFound();
  }

  const content = page.content?.[0]?.content;
  
  // Only pass initialContent if it's a valid non-empty object with ROOT key
  const hasValidContent = content && 
    typeof content === 'object' && 
    Object.keys(content).length > 0 &&
    'ROOT' in content;

  console.log('[EditorPage] Content loaded:', {
    pageId,
    language,
    hasValidContent,
    contentKeys: content ? Object.keys(content).length : 0,
  });

  return (
    <EditorCanvas
      pageId={pageId}
      language={language}
      initialContent={hasValidContent ? JSON.stringify(content) : undefined}
    />
  );
}