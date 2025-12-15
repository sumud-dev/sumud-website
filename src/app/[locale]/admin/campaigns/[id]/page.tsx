"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Target,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Star,
  Loader2,
  Languages,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  Plus,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

import { Progress } from "@/src/components/ui/progress";
import {
  Campaign,
  CampaignStatus,
  campaignStatusColors,
  campaignTypeLabels,
  transformCampaignToUI,
  CampaignWithTranslations,
  CampaignTranslationRow,
} from "@/src/types/Campaigns";
import {
  getCampaignById,
  deleteCampaign,
  updateCampaignStatus,
  toggleCampaignFeatured,
} from "@/src/actions/campaigns.actions";
import { useRouter } from "@/src/i18n/navigation";

interface CampaignDetailsPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

const statusIcons: Record<CampaignStatus, React.ElementType> = {
  draft: Clock,
  active: Play,
  paused: Pause,
  completed: CheckCircle,
  cancelled: XCircle,
  archived: XCircle,
};

// Language labels for display
const languageLabels: Record<string, string> = {
  en: "English",
  fi: "Finnish (Suomi)",
  ar: "Arabic (العربية)",
};

export default function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const router = useRouter();
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [rawCampaign, setRawCampaign] = React.useState<CampaignWithTranslations | null>(null);
  const [translations, setTranslations] = React.useState<CampaignTranslationRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [currentLocale, setCurrentLocale] = React.useState<string>("en");

  // Resolve params and fetch campaign
  React.useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const resolved = await params;
        setCurrentLocale(resolved.locale);

        const { data, error } = await getCampaignById(resolved.id);

        if (error || !data) {
          toast.error(error || "Campaign not found");
          router.push("/admin/campaigns");
          return;
        }

        // Store raw campaign data for translations
        setRawCampaign(data);
        setTranslations(data.translations || []);
        
        const transformedCampaign = transformCampaignToUI(data, resolved.locale);
        setCampaign(transformedCampaign);
      } catch (err) {
        console.error("Error fetching campaign:", err);
        toast.error("Failed to load campaign");
        router.push("/admin/campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [params, router]);

  const handleDelete = async () => {
    if (!campaign) return;

    setIsDeleting(true);
    try {
      const { success, error } = await deleteCampaign(campaign.id);

      if (error) {
        toast.error(`Failed to delete campaign: ${error}`);
        return;
      }

      if (success) {
        toast.success("Campaign deleted successfully");
        router.push("/admin/campaigns");
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: CampaignStatus) => {
    if (!campaign) return;

    setIsUpdatingStatus(true);
    try {
      const { success, error } = await updateCampaignStatus(campaign.id, newStatus);

      if (error) {
        toast.error(`Failed to update status: ${error}`);
        return;
      }

      if (success) {
        toast.success(`Campaign status updated to ${newStatus}`);
        setCampaign(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!campaign) return;

    try {
      const { success, error } = await toggleCampaignFeatured(campaign.id, !campaign.isFeatured);

      if (error) {
        toast.error(`Failed to update featured status: ${error}`);
        return;
      }

      if (success) {
        toast.success(campaign.isFeatured ? "Campaign unfeatured" : "Campaign featured");
        setCampaign(prev => prev ? { ...prev, isFeatured: !prev.isFeatured } : null);
      }
    } catch (err) {
      console.error("Error toggling featured:", err);
      toast.error("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#781D32]" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const StatusIcon = statusIcons[campaign.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/campaigns"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {campaign.title}
              </h1>
              {campaign.isFeatured && (
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <p className="text-gray-600">
              {campaign.shortDescription || campaign.description?.substring(0, 150)}
              {campaign.description && campaign.description.length > 150 ? "..." : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFeatured}
            >
              <Star className={`mr-2 h-4 w-4 ${campaign.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
              {campaign.isFeatured ? "Unfeature" : "Feature"}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={isDeleting}
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${campaign.title}"? This action cannot be undone.`)) {
                  handleDelete();
                }
              }}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Status & Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge className={campaignStatusColors[campaign.status]}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <div className="flex flex-wrap gap-2">
              {campaign.status === "draft" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate("active")}
                  disabled={isUpdatingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Activate
                </Button>
              )}
              {campaign.status === "active" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("paused")}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Pause className="mr-2 h-4 w-4" />
                    )}
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={isUpdatingStatus}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Mark Completed
                  </Button>
                </>
              )}
              {campaign.status === "paused" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate("active")}
                  disabled={isUpdatingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Resume
                </Button>
              )}
              {(campaign.status === "completed" || campaign.status === "cancelled") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("archived")}
                  disabled={isUpdatingStatus}
                >
                  Archive
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              <p className="mt-1">
                <Badge variant="outline">
                  <Target className="mr-1 h-3 w-3" />
                  {campaignTypeLabels[campaign.campaignType]}
                </Badge>
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-muted-foreground">Slug</span>
              <p className="mt-1 font-mono text-sm bg-muted px-2 py-1 rounded">
                {campaign.slug}
              </p>
            </div>

            {campaign.iconName && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Icon</span>
                <p className="mt-1">{campaign.iconName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                <p className="mt-1">
                  {campaign.startDate
                    ? new Date(campaign.startDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">End Date</span>
                <p className="mt-1">
                  {campaign.endDate
                    ? new Date(campaign.endDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created</span>
                <p className="mt-1">
                  {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <p className="mt-1">
                  {new Date(campaign.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {campaign.description || <span className="text-muted-foreground">No description provided.</span>}
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      {campaign.featuredImageUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg border">
              <Image
                src={campaign.featuredImageUrl}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translations Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translations
              </CardTitle>
              <CardDescription>
                Manage campaign content in different languages
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/campaigns/${campaign.id}/edit?tab=translations`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Translation
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {translations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No translations found for this campaign.</p>
              <p className="text-sm">Add translations to make content available in multiple languages.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {translations.map((translation) => (
                <div
                  key={translation.id}
                  className={`p-4 border rounded-lg ${
                    translation.language === currentLocale ? "border-[#781D32] bg-[#781D32]/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={translation.language === currentLocale ? "default" : "outline"}>
                          {languageLabels[translation.language] || translation.language.toUpperCase()}
                        </Badge>
                        {translation.language === currentLocale && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">{translation.title}</h4>
                      {translation.short_description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {translation.short_description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated: {new Date(translation.updated_at || translation.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/campaigns/${campaign.id}/edit?tab=translations&lang=${translation.language}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics & Progress */}
      {campaign.stats && Object.keys(campaign.stats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistics & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Funding Progress (if applicable) */}
            {(campaign.stats.goalAmount || campaign.stats.raisedAmount) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Funding Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {campaign.stats.raisedAmount 
                      ? `€${Number(campaign.stats.raisedAmount).toLocaleString()}` 
                      : "€0"} 
                    {campaign.stats.goalAmount && ` of €${Number(campaign.stats.goalAmount).toLocaleString()}`}
                  </span>
                </div>
                <Progress 
                  value={
                    campaign.stats.goalAmount && campaign.stats.raisedAmount
                      ? Math.min((Number(campaign.stats.raisedAmount) / Number(campaign.stats.goalAmount)) * 100, 100)
                      : 0
                  } 
                  className="h-3"
                />
                {campaign.stats.goalAmount && campaign.stats.raisedAmount && (
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round((Number(campaign.stats.raisedAmount) / Number(campaign.stats.goalAmount)) * 100)}% of goal reached
                  </p>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaign.stats.totalSupporters !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-[#781D32]" />
                  <p className="text-2xl font-bold text-[#781D32]">
                    {Number(campaign.stats.totalSupporters).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Supporters</p>
                </div>
              )}
              {campaign.stats.totalDonations !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-[#55613C]" />
                  <p className="text-2xl font-bold text-[#55613C]">
                    {Number(campaign.stats.totalDonations).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Donations</p>
                </div>
              )}
              {campaign.stats.totalViews !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">
                    {Number(campaign.stats.totalViews).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              )}
              {/* Other custom stats */}
              {Object.entries(campaign.stats)
                .filter(([key]) => !["totalSupporters", "totalDonations", "totalViews", "goalAmount", "raisedAmount"].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-muted rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-2xl font-bold text-gray-700">
                      {typeof value === "number" ? value.toLocaleString() : String(value)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty Stats Placeholder */}
      {(!campaign.stats || Object.keys(campaign.stats).length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No Statistics Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
              Statistics like supporters, donations, and views will appear here once the campaign is active.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Configure Stats
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Targets */}
      {campaign.targets && campaign.targets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Targets</CardTitle>
            <CardDescription>Organizations or entities targeted by this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.targets.map((target, index) => (
                <div key={target.id || index} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{target.name}</h4>
                  {target.description && (
                    <p className="text-sm text-muted-foreground mt-1">{target.description}</p>
                  )}
                  {target.link && typeof target.link === 'string' && (
                    <a
                      href={target.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#781D32] hover:underline mt-2 inline-block"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How to Participate */}
      {campaign.howToParticipate && campaign.howToParticipate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Participate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaign.howToParticipate.map((step, index) => (
                <div key={step.id || index} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 bg-[#781D32] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step || index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {campaign.resources && campaign.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resources</CardTitle>
            <CardDescription>Downloadable materials and useful links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {campaign.resources.map((resource, index) => (
                <a
                  key={resource.id || index}
                  href={resource.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demands */}
      {campaign.demands && campaign.demands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demands</CardTitle>
            <CardDescription>Key demands and objectives of this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.demands.map((demand, index) => (
                <div
                  key={demand.id || index}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${
                    demand.status === "achieved" 
                      ? "bg-green-500" 
                      : demand.status === "in_progress" 
                        ? "bg-yellow-500" 
                        : "bg-gray-400"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{demand.title}</h4>
                      {demand.status && (
                        <Badge variant="outline" className={`text-xs ${
                          demand.status === "achieved" 
                            ? "border-green-500 text-green-700" 
                            : demand.status === "in_progress" 
                              ? "border-yellow-500 text-yellow-700" 
                              : "border-gray-400 text-gray-600"
                        }`}>
                          {demand.status === "in_progress" ? "In Progress" : demand.status.charAt(0).toUpperCase() + demand.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                    {demand.description && (
                      <p className="text-sm text-muted-foreground mt-1">{demand.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-Campaigns / Initiatives */}
      {campaign.subCampaigns && campaign.subCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Initiatives</CardTitle>
            <CardDescription>Sub-campaigns and initiatives under this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.subCampaigns.map((subCampaign, index) => (
                <div
                  key={subCampaign.id || index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#781D32] to-[#55613C] flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{subCampaign.title}</h4>
                      {subCampaign.status && (
                        <Badge className={`mt-1 ${campaignStatusColors[subCampaign.status]}`}>
                          {subCampaign.status.charAt(0).toUpperCase() + subCampaign.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {subCampaign.shortDescription && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {subCampaign.shortDescription}
                    </p>
                  )}
                  {subCampaign.description && !subCampaign.shortDescription && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {subCampaign.description}
                    </p>
                  )}
                  {(subCampaign.startDate || subCampaign.endDate) && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {subCampaign.startDate && new Date(subCampaign.startDate).toLocaleDateString()}
                        {subCampaign.startDate && subCampaign.endDate && " - "}
                        {subCampaign.endDate && new Date(subCampaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Stories */}
      {campaign.successStories && campaign.successStories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Success Stories</CardTitle>
            <CardDescription>Impact and achievements from this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {campaign.successStories.map((story, index) => (
                <div
                  key={story.id || index}
                  className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-white"
                >
                  {story.imageUrl && (
                    <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h4 className="font-medium">{story.title}</h4>
                  {story.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(story.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{story.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {campaign.callToAction && (campaign.callToAction.primaryText || campaign.callToAction.secondaryText) && (
        <Card className="bg-gradient-to-r from-[#781D32] to-[#55613C] text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Call to Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {campaign.callToAction.primaryText && (
                <Button
                  asChild={!!(campaign.callToAction.primaryLink && typeof campaign.callToAction.primaryLink === 'string')}
                  className="bg-white text-[#781D32] hover:bg-white/90"
                >
                  {campaign.callToAction.primaryLink && typeof campaign.callToAction.primaryLink === 'string' ? (
                    <a href={campaign.callToAction.primaryLink} target="_blank" rel="noopener noreferrer">
                      {campaign.callToAction.primaryText}
                    </a>
                  ) : (
                    <span>{campaign.callToAction.primaryText}</span>
                  )}
                </Button>
              )}
              {campaign.callToAction.secondaryText && (
                <Button
                  asChild={!!(campaign.callToAction.secondaryLink && typeof campaign.callToAction.secondaryLink === 'string')}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {campaign.callToAction.secondaryLink && typeof campaign.callToAction.secondaryLink === 'string' ? (
                    <a href={campaign.callToAction.secondaryLink} target="_blank" rel="noopener noreferrer">
                      {campaign.callToAction.secondaryText}
                    </a>
                  ) : (
                    <span>{campaign.callToAction.secondaryText}</span>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Content Summary */}
      {(
        (!campaign.targets || campaign.targets.length === 0) ||
        (!campaign.demands || campaign.demands.length === 0) ||
        (!campaign.howToParticipate || campaign.howToParticipate.length === 0) ||
        (!campaign.resources || campaign.resources.length === 0) ||
        (!campaign.callToAction || (!campaign.callToAction.primaryText && !campaign.callToAction.secondaryText))
      ) && (
        <Card className="border-dashed border-amber-300 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Complete Your Campaign
            </CardTitle>
            <CardDescription className="text-amber-700">
              The following sections are empty and can be configured to make your campaign more effective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(!campaign.targets || campaign.targets.length === 0) && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                  <Target className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">Targets</p>
                    <p className="text-xs text-muted-foreground">Define campaign targets</p>
                  </div>
                </div>
              )}
              {(!campaign.demands || campaign.demands.length === 0) && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">Demands</p>
                    <p className="text-xs text-muted-foreground">Add campaign demands</p>
                  </div>
                </div>
              )}
              {(!campaign.howToParticipate || campaign.howToParticipate.length === 0) && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                  <Users className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">How to Participate</p>
                    <p className="text-xs text-muted-foreground">Add participation steps</p>
                  </div>
                </div>
              )}
              {(!campaign.resources || campaign.resources.length === 0) && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                  <Globe className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">Resources</p>
                    <p className="text-xs text-muted-foreground">Add useful resources</p>
                  </div>
                </div>
              )}
              {(!campaign.callToAction || (!campaign.callToAction.primaryText && !campaign.callToAction.secondaryText)) && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                  <Heart className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">Call to Action</p>
                    <p className="text-xs text-muted-foreground">Add CTA buttons</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
                <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Configure Missing Sections
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
