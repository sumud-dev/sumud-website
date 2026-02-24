// Lines 1-220 - Optimized version with TanStack Query
"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { CampaignForm, type CampaignFormData } from "@/src/components/forms/campaign-form";
import { useCampaign, useUpdateCampaign } from "@/src/lib/hooks/use-campaigns";
import { toast } from "sonner";

interface EditCampaignPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const router = useRouter();
  const locale = useLocale() as 'en' | 'fi';
  const t = useTranslations("admin.campaigns.edit");
  const [slug, setSlug] = React.useState<string>("");

  // Get slug from params
  React.useEffect(() => {
    params.then((resolved) => setSlug(resolved.slug));
  }, [params]);

  // Fetch campaign with React Query
  const { data: campaign, isLoading, error } = useCampaign(slug);
  
  // Single mutation for updating campaign
  const updateCampaign = useUpdateCampaign();

  // Map campaign data for form
  const mappedCampaign = React.useMemo(() => {
    if (!campaign) return null;

    const descriptionData = typeof campaign.description === 'string' 
      ? campaign.description 
      : (campaign.description && typeof campaign.description === 'object' && 'data' in campaign.description 
          ? campaign.description.data as string 
          : "");

    return {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      featuredImageUrl: campaign.featuredImage || "",
      description: descriptionData || "",
      callToAction: campaign.callToAction || { primary: undefined, secondary: undefined },
      targets: campaign.targets || [],
      demands: campaign.demands || [],
      howToParticipate: campaign.howToParticipate || [],
      seoTitle: campaign.seoTitle || "",
      seoDescription: campaign.seoDescription || "",
      status: campaign.status || "draft",
      category: campaign.category || "",
      campaignType: campaign.campaignType || undefined,
      isFeatured: campaign.isFeatured ?? false,
    } as any; // Type assertion for form compatibility
  }, [campaign]);

  const handleSubmit = async (data: CampaignFormData) => {
    if (!campaign) return;

    try {
      // Get the campaign ID - use the record's own ID since we're in a single-table system
      const campaignId = campaign.id;

      // Update all campaign fields in one call
      await updateCampaign.mutateAsync({
        campaignId,
        slug,
        data: {
          // Base fields
          status: data.status,
          category: data.category,
          campaignType: data.campaignType,
          isFeatured: data.isFeatured,
          // Content fields (stored directly in the campaign record for current locale)
          title: data.title,
          description: data.description,
          callToAction: data.callToAction,
          demands: data.demands,
          howToParticipate: data.howToParticipate,
          targets: data.targets,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
        },
        language: locale,
        autoTranslate: data.autoTranslate, // Use form value to determine if translation to other locale is needed
      });

      toast.success(t("successMessage"));
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/campaigns');
      }, 1500);
    } catch (err) {
      console.error("Error updating campaign:", err);
      const message = err instanceof Error ? err.message : t("errorUpdating");
      toast.error(message);
    }
  };



  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error.message || t("errorLoading")}
      </div>
    );
  }

  // No campaign found
  if (!mappedCampaign) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
        {t("notFound")}
      </div>
    );
  }

  const isSubmitting = updateCampaign.isPending;

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
            <h1 className="text-2xl font-bold text-gray-900">{t("pageTitle")}</h1>
            <p className="text-gray-600">{t("updateCampaign")} {mappedCampaign.title}</p>
          </div>
        </div>
      </div>

      <CampaignForm
        campaign={mappedCampaign}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={t("submitButton")}
        submittingLabel={t("submittingButton")}
      />
    </div>
  );
}