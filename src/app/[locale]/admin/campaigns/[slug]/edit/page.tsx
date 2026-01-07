"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { CampaignForm, type CampaignFormData } from "@/src/components/forms/campaign-form";
import { updateCampaignAction, updateCampaignTranslationAction, fetchCampaigns } from "@/src/actions/campaigns.actions";
import { toast } from "sonner";

interface EditCampaignPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [campaign, setCampaign] = React.useState<any>(null);
  const [currentSlug, setCurrentSlug] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(async (resolved) => {
      setCurrentSlug(resolved.slug);
      
      // Fetch the campaign from the database
      try {
        const result = await fetchCampaigns(resolved.slug, 'en');
        if (result.success) {
          const dbCampaign = result.data;
          
          // Map database fields to form-compatible fields
          const mappedCampaign = {
            ...dbCampaign,
            // Map featuredImage to featuredImageUrl
            featuredImageUrl: dbCampaign.featuredImage || dbCampaign.featuredImageUrl || "",
            // Extract goal from description if exists (description is now JSONB)
            goal: dbCampaign.description?.goal || dbCampaign.goal || undefined,
            // Ensure description is a string for the form (extract from JSONB if needed)
            description: typeof dbCampaign.description === 'string' 
              ? dbCampaign.description 
              : (dbCampaign.description?.data || dbCampaign.description || ""),
            // Ensure nested fields are properly mapped
            callToAction: dbCampaign.callToAction || { primary: undefined, secondary: undefined },
            targets: dbCampaign.targets || [],
            demands: dbCampaign.demands || [],
            howToParticipate: dbCampaign.howToParticipate || [],
            // SEO fields
            seoTitle: dbCampaign.seoTitle || "",
            seoDescription: dbCampaign.seoDescription || "",
            // Campaign base fields (from joined campaigns table)
            status: dbCampaign.status || "draft",
            category: dbCampaign.category || "",
            campaignType: dbCampaign.campaignType || undefined,
            isFeatured: dbCampaign.isFeatured ?? false,
          };
          
          setCampaign(mappedCampaign);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load campaign");
      } finally {
        setIsLoading(false);
      }
    });
  }, [params]);

  const handleSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the actual campaign ID (not translation ID)
      // For English translations, campaign.campaignId is the real campaign ID
      // For Finnish campaigns, campaign.id is the campaign ID
      const campaignId = campaign.campaignId || campaign.id;
      
      if (!campaignId) {
        setError("Campaign ID not found");
        return;
      }

      // Update the basic campaign information
      const updateResult = await updateCampaignAction(
        campaignId,
        currentSlug,
        {
          status: data.status as any,
          category: data.category,
          campaignType: data.campaignType,
          isFeatured: data.isFeatured,
        }
      );

      if (!updateResult.success) {
        setError(updateResult.error);
        return;
      }

      // Update campaign translation (content in the current locale)
      const translationResult = await updateCampaignTranslationAction(
        campaignId,
        currentSlug,
        'en', // You might want to get the current locale from the router
        {
          title: data.title,
          description: data.description,
          callToAction: data.callToAction,
          demands: data.demands,
          howToParticipate: data.howToParticipate,
          targets: data.targets,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
        }
      );

      if (!translationResult.success) {
        setError(translationResult.error);
        return;
      }

      // Update local campaign state for UI feedback
      setCampaign(prev => ({
        ...prev,
        title: data.title,
        description: data.description,
        campaignType: data.campaignType,
        category: data.category,
        status: data.status,
        featuredImageUrl: data.featuredImageUrl || prev.featuredImageUrl,
        goal: data.goal || prev.goal,
        isFeatured: data.isFeatured,
        callToAction: data.callToAction,
        targets: data.targets,
        demands: data.demands,
        howToParticipate: data.howToParticipate,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      }));

      setSuccessMessage("Campaign updated successfully!");
      toast.success("Campaign updated successfully!");
      // Redirect to campaigns page after a brief delay
      setTimeout(() => {
        router.push('/admin/campaigns');
      }, 1500);
    } catch (err) {
      console.error("Error updating campaign:", err);
      const message = err instanceof Error ? err.message : "Failed to update campaign. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!currentSlug) return;
    window.open(`/admin/campaigns/${currentSlug}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading campaign...</p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && campaign && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/campaigns">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Campaigns
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
                <p className="text-gray-600">Update campaign: {campaign.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <CampaignForm
            campaign={campaign}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Campaign"
            submittingLabel="Updating..."
          />
        </>
      )}
    </div>
  );
}
