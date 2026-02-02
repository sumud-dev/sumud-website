"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { CampaignForm, type CampaignFormData } from "@/src/components/forms/campaign-form";
import { createCampaignAction } from "@/src/actions/campaigns.actions";
import { slugify } from "@/src/lib/utils/article.utils";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const t = useTranslations("admin.campaigns.new");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    if (data.autoTranslate) {
      setIsTranslating(true);
    }

    try {
      // Generate slug from title
      const slug = slugify(data.title);

      // Prepare FormData for the action
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("category", data.category || "");
      formData.append("campaignType", data.campaignType || "");
      formData.append("iconName", "");
      formData.append("isActive", "true");
      formData.append("isFeatured", String(data.isFeatured ?? false));
      formData.append("status", data.status);
      formData.append("autoTranslate", String(data.autoTranslate ?? true));

      // Get the selected language (default to English)
      const sourceLocale = data.language || "en";

      // Prepare translations array with the source language
      const translations = [
        {
          locale: sourceLocale,
          title: data.title,
          description: data.description,
          demands: data.demands || [],
          callToAction: data.callToAction || {},
          howToParticipate: data.howToParticipate || [],
          resources: [],
          successStories: [],
          targets: data.targets || [],
          seoTitle: data.seoTitle || data.title,
          seoDescription: data.seoDescription || data.description?.substring(0, 160),
        },
      ];

      formData.append("translations", JSON.stringify(translations));

      // Call the server action
      const result = await createCampaignAction(formData);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(result.message || "Campaign created successfully!");
      router.push("/admin/campaigns");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create campaign";
      console.error("Error creating campaign:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToCampaigns")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <CampaignForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={t("submitButton")}
        submittingLabel={isTranslating ? t("translating") : t("submittingButton")}
      />
    </div>
  );
}
