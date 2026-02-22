import { setRequestLocale } from "next-intl/server";
import { getPublishedPage } from "@/src/actions/pages.actions";
import { PageRenderer } from '@/src/components/renderer/PageRenderer';

interface MembershipPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: MembershipPageProps) {
  const { locale } = await params;

  try {
    const data = await getPublishedPage("membership", locale as 'en' | 'fi');

    if (!data) {
      return {
        title: "Membership - Sumud",
      };
    }

    return {
      title: data.page.title || "Membership - Sumud",
    };
  } catch {
    return {
      title: "Membership - Sumud",
    };
  }
}

export default async function MembershipPage({ params }: MembershipPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const data = await getPublishedPage("membership", locale as 'en' | 'fi');

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
