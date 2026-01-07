import { PageBuilderEditor } from "@/src/components/admin/page-builder";
import { getPageAction } from "@/src/actions/pages.actions";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { slug } = await params;
  const result = await getPageAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <PageBuilderEditor initialData={result.data} />;
}
