import { redirect } from 'next/navigation';

interface NewPagePageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewPagePage({ params }: NewPagePageProps) {
  const { locale } = await params;
  
  // Redirect to page builder list - pages are now created via dialog
  redirect(`/${locale}/admin/page-builder`);
}
