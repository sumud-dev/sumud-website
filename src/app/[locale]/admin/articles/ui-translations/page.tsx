import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArticlesUITranslationsEditor } from "@/src/components/admin/articles/ArticlesUITranslationsEditor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminSettings.articles");
  
  return {
    title: `${t("uiTranslations.title")} | Sumud Admin`,
    description: t("uiTranslations.description"),
  };
}

export default async function ArticlesUITranslationsPage() {
  const t = await getTranslations("adminSettings.articles");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("uiTranslations.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("uiTranslations.description")}</p>
      </div>
      
      <ArticlesUITranslationsEditor />
    </div>
  );
}
