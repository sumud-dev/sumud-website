import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TranslationsManagement } from "@/src/components/admin/translations/TranslationsManagement";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminSettings.translations");
  
  return {
    title: `${t("title")} | Sumud Admin`,
    description: t("description"),
  };
}

export default async function TranslationsPage() {
  const t = await getTranslations("adminSettings.translations");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>
      
      <TranslationsManagement />
    </div>
  );
}
