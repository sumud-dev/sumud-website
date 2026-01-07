"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useRouter } from "@/src/i18n/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
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
  fetchCampaigns,
  deleteCampaignAction,
  updateCampaignAction,
} from "@/src/actions/campaigns.actions";

// ============================================
// TYPE DEFINITIONS
// ============================================

type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

interface CampaignTarget {
  id?: string;
  name: string;
  description?: string;
  link?: string;
}

interface CampaignDemand {
  id?: string;
  title: string;
  description?: string;
  status?: "pending" | "achieved" | "in_progress";
}

interface CampaignResource {
  id?: string;
  title: string;
  url: string;
  type?: string;
}

interface HowToParticipateStep {
  id?: string;
  step?: number;
  title: string;
  description?: string;
}

interface SuccessStory {
  id?: string;
  title: string;
  description?: string;
  date?: string;
  imageUrl?: string;
}

interface CallToAction {
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
}

interface CampaignStats {
  totalDonations?: number;
  totalSupporters?: number;
  totalViews?: number;
  goalAmount?: number;
  raisedAmount?: number;
  [key: string]: unknown;
}

interface Campaign {
  id: string;
  slug: string;
  title: string | null;
  description: any | null; // JSONB field with type/data structure
  shortDescription?: string | null;
  status: CampaignStatus;
  campaignType: string | null;
  iconName?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  featuredImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  targets?: CampaignTarget[] | null;
  demands?: CampaignDemand[] | null;
  howToParticipate?: HowToParticipateStep[] | null;
  resources?: CampaignResource[] | null;
  callToAction?: CallToAction | null;
  successStories?: SuccessStory[] | null;
  stats?: CampaignStats | null;
}

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<CampaignStatus, { color: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-100 text-gray-800", icon: Clock },
  active: { color: "bg-green-100 text-green-800", icon: Play },
  paused: { color: "bg-yellow-100 text-yellow-800", icon: Pause },
  completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  archived: { color: "bg-gray-100 text-gray-600", icon: XCircle },
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  awareness: "Awareness",
  fundraising: "Fundraising",
  advocacy: "Advocacy",
  event: "Event",
  community_building: "Community Building",
  education: "Education",
  solidarity: "Solidarity",
  humanitarian: "Humanitarian",
  political: "Political",
  cultural: "Cultural",
  environmental: "Environmental",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function renderContent(content: any): string {
  if (!content) return '';
  
  // If content is a structured object with data property
  if (typeof content === 'object' && content !== null && 'data' in content) {
    // Handle different content types
    if (content.type === 'markdown' || content.type === 'html') {
      return String(content.data || '');
    }
    // For blocks or other types, try to extract text
    if (content.type === 'blocks' && Array.isArray(content.data)) {
      return content.data.map((block: any) => block.text || '').join('\n');
    }
    // Fallback: try to stringify data
    return typeof content.data === 'string' ? content.data : JSON.stringify(content.data, null, 2);
  }
  
  // If content is already a string
  if (typeof content === 'string') {
    return content;
  }
  
  // Fallback for other types
  return String(content);
}

// ============================================
// COMPONENTS
// ============================================

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[#781D32]" />
    </div>
  );
}

function ErrorState({ error, slug, locale }: { error: string; slug: string; locale: string }) {
  return (
    <div className="space-y-4">
      <BackLink />
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Failed to Load Campaign</h3>
              <p className="text-sm text-muted-foreground mb-3">{error}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Debug:</strong> Slug: {slug}, Locale: {locale}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/campaigns"
      className="flex items-center text-sm text-muted-foreground hover:text-foreground w-fit"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Campaigns
    </Link>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  
  const { color, icon: Icon } = config;
  return (
    <Badge className={color}>
      <Icon className="mr-1 h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function RichText({ content }: { content: string }) {
  if (!content) return null;

  // Check if content looks like HTML
  const hasHtmlTags = /<\/?(p|div|span|h[1-6]|ul|ol|li|br|strong|em|b|i|a|img|blockquote|table)[^>]*>/i.test(content);

  if (hasHtmlTags) {
    return (
      <div 
        className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground [&>*:first-child]:mt-0"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // For plain text: strict whitespace preservation
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground whitespace-pre-wrap leading-relaxed">
      {content}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CampaignDetailsPage({ params }: PageProps) {
  const router = useRouter();
  
  // State
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [slug, setSlug] = React.useState("");
  const [locale, setLocale] = React.useState("en");

  // Fetch campaign data
  React.useEffect(() => {
    params.then(async (resolved) => {
      setSlug(resolved.slug);
      setLocale(resolved.locale);
      
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchCampaigns(resolved.slug, resolved.locale);
        
        if (result.success && result.data) {
          setCampaign(result.data as Campaign);
        } else {
          setError(!result.success ? result.error : "Failed to load campaign");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    });
  }, [params]);

  // Handlers
  const handleDelete = async () => {
    if (!campaign || !confirm(`Delete "${campaign.title}"? This cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteCampaignAction(campaign.slug, locale);
      if (result.success) {
        router.push("/admin/campaigns");
      } else {
        setError(result.error || "Failed to delete");
        setIsDeleting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: CampaignStatus) => {
    if (!campaign) return;
    
    setIsUpdating(true);
    try {
      const result = await updateCampaignAction(campaign.id, campaign.slug, { status: newStatus }, locale);
      if (result.success) {
        setCampaign({ ...campaign, status: newStatus });
      } else {
        setError(result.error || "Failed to update status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!campaign) return;
    
    try {
      const result = await updateCampaignAction(
        campaign.id,
        campaign.slug,
        { isFeatured: !campaign.isFeatured },
        locale
      );
      if (result.success) {
        setCampaign({ ...campaign, isFeatured: !campaign.isFeatured });
      } else {
        setError(result.error || "Failed to update");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  // Render states
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} slug={slug} locale={locale} />;
  if (!campaign) return null;

  const hasStats = campaign.stats && Object.keys(campaign.stats).length > 0;
  const hasTargets = campaign.targets && campaign.targets.length > 0;
  const hasDemands = campaign.demands && campaign.demands.length > 0;
  const hasSteps = campaign.howToParticipate && campaign.howToParticipate.length > 0;
  const hasResources = campaign.resources && campaign.resources.length > 0;
  const hasStories = campaign.successStories && campaign.successStories.length > 0;
  const hasCTA = campaign.callToAction && (campaign.callToAction.primaryText || campaign.callToAction.secondaryText);
  const hasFeaturedImage = !!campaign.featuredImage;
  const hasMissingSections = !hasTargets || !hasDemands || !hasSteps || !hasResources || !hasCTA || !hasFeaturedImage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <BackLink />
        
        {/* Hero Section with Featured Image */}
        {campaign.featuredImage && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border shadow-lg">
            <Image 
              src={campaign.featuredImage} 
              alt={campaign.title || "Campaign"} 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-4xl font-bold drop-shadow-lg">
                  {campaign.title || "Untitled Campaign"}
                </h1>
                {campaign.isFeatured && (
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                )}
              </div>
              {campaign.shortDescription && (
                <p className="text-lg text-white/90 drop-shadow-md max-w-3xl">
                  {campaign.shortDescription}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Header without featured image */}
        {!campaign.featuredImage && (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {campaign.title || "Untitled Campaign"}
                </h1>
                {campaign.isFeatured && (
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              {campaign.shortDescription && (
                <p className="text-gray-600">{campaign.shortDescription}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleFeatured}>
            <Star className={`mr-2 h-4 w-4 ${campaign.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
            {campaign.isFeatured ? "Unfeature" : "Feature"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/campaigns/${campaign.slug}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/campaigns/${campaign.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View Live
            </Link>
          </Button>
          <Button variant="destructive" size="sm" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <StatusBadge status={campaign.status} />
          {campaign.status === "draft" && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate("active")} disabled={isUpdating} className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50">
              {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />}
              Activate
            </Button>
          )}
          {campaign.status === "active" && (
            <>
              <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate("paused")} disabled={isUpdating} className="h-7">
                <Pause className="mr-1 h-3 w-3" />
                Pause
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate("completed")} disabled={isUpdating} className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <CheckCircle className="mr-1 h-3 w-3" />
                Complete
              </Button>
            </>
          )}
          {campaign.status === "paused" && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate("active")} disabled={isUpdating} className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50">
              <Play className="mr-1 h-3 w-3" />
              Resume
            </Button>
          )}
          {campaign.status === "completed" && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate("archived")} disabled={isUpdating} className="h-7">
              Archive
            </Button>
          )}
        </div>
        
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Type:</span>
          <Badge variant="outline">
            <Target className="mr-1 h-3 w-3" />
            {campaign.campaignType ? CAMPAIGN_TYPE_LABELS[campaign.campaignType] || campaign.campaignType : "Not set"}
          </Badge>
        </div>
        
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          <Badge variant={campaign.isActive ? "default" : "secondary"} className="text-xs">
            {campaign.isActive ? "Yes" : "No"}
          </Badge>
        </div>
        
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Slug:</span>
          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{campaign.slug}</code>
        </div>
        
        {campaign.iconName && (
          <>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Icon:</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{campaign.iconName}</code>
            </div>
          </>
        )}
      </div>

      {/* Timeline - only show if there are dates */}
      {(campaign.startDate || campaign.endDate) && (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/20 rounded-lg border text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {campaign.startDate && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Start:</span>
              <span>{new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          )}
          {campaign.endDate && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">End:</span>
              <span>{new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Created:</span>
            <span>{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Updated:</span>
            <span>{campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
          </div>
        </div>
      )}

      {/* Description */}
      {campaign.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RichText content={renderContent(campaign.description)} />
          </CardContent>
        </Card>
      )}

      {/* Translations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translations
              </CardTitle>
              <CardDescription>Manage content in different languages</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/campaigns/${campaign.slug}/edit?tab=translations`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Translation
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Add translations to make content available in multiple languages.</p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {hasStats ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(campaign.stats?.goalAmount || campaign.stats?.raisedAmount) && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Funding Progress</span>
                  <span className="text-muted-foreground">
                    €{(campaign.stats?.raisedAmount || 0).toLocaleString()} / €{(campaign.stats?.goalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={campaign.stats?.goalAmount ? Math.min((Number(campaign.stats.raisedAmount || 0) / Number(campaign.stats.goalAmount)) * 100, 100) : 0} 
                  className="h-3"
                />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaign.stats?.totalSupporters !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-[#781D32]" />
                  <p className="text-2xl font-bold text-[#781D32]">{Number(campaign.stats.totalSupporters).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Supporters</p>
                </div>
              )}
              {campaign.stats?.totalDonations !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-[#55613C]" />
                  <p className="text-2xl font-bold text-[#55613C]">{Number(campaign.stats.totalDonations).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Donations</p>
                </div>
              )}
              {campaign.stats?.totalViews !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{Number(campaign.stats.totalViews).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No Statistics Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
              Statistics will appear here once the campaign is active.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Targets */}
      {hasTargets && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Targets</CardTitle>
            <CardDescription>Organizations or entities targeted by this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.targets!.map((target, i) => (
                <div key={target.id || i} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{target.name}</h4>
                  {target.description && <p className="text-sm text-muted-foreground mt-1">{target.description}</p>}
                  {target.link && (
                    <a href={target.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#781D32] hover:underline mt-2 inline-block">
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
      {hasSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Participate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaign.howToParticipate!.map((step, i) => (
                <div key={step.id || i} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 bg-[#781D32] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step || i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    {step.description && <p className="text-sm text-muted-foreground mt-1">{step.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {hasResources && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resources</CardTitle>
            <CardDescription>Downloadable materials and useful links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {campaign.resources!.map((resource, i) => (
                <a
                  key={resource.id || i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    {resource.type && <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>}
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demands */}
      {hasDemands && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demands</CardTitle>
            <CardDescription>Key demands and objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.demands!.map((demand, i) => (
                <div key={demand.id || i} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${
                    demand.status === "achieved" ? "bg-green-500" : demand.status === "in_progress" ? "bg-yellow-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{demand.title}</h4>
                      {demand.status && (
                        <Badge variant="outline" className={`text-xs ${
                          demand.status === "achieved" ? "border-green-500 text-green-700" : 
                          demand.status === "in_progress" ? "border-yellow-500 text-yellow-700" : ""
                        }`}>
                          {demand.status === "in_progress" ? "In Progress" : demand.status.charAt(0).toUpperCase() + demand.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                    {demand.description && <p className="text-sm text-muted-foreground mt-1">{demand.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Stories */}
      {hasStories && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Success Stories</CardTitle>
            <CardDescription>Impact and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {campaign.successStories!.map((story, i) => (
                <div key={story.id || i} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-white">
                  {story.imageUrl && (
                    <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg">
                      <Image src={story.imageUrl} alt={story.title || ""} fill className="object-cover" />
                    </div>
                  )}
                  <h4 className="font-medium">{story.title}</h4>
                  {story.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(story.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  {story.description && <p className="text-sm text-muted-foreground mt-2">{story.description}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {hasCTA && (
        <Card className="bg-gradient-to-r from-[#781D32] to-[#55613C] text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Call to Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {campaign.callToAction?.primaryText && (
                <Button
                  asChild={!!campaign.callToAction.primaryLink}
                  className="bg-white text-[#781D32] hover:bg-white/90"
                >
                  {campaign.callToAction.primaryLink ? (
                    <a href={campaign.callToAction.primaryLink} target="_blank" rel="noopener noreferrer">
                      {campaign.callToAction.primaryText}
                    </a>
                  ) : (
                    <span>{campaign.callToAction.primaryText}</span>
                  )}
                </Button>
              )}
              {campaign.callToAction?.secondaryText && (
                <Button
                  asChild={!!campaign.callToAction.secondaryLink}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {campaign.callToAction.secondaryLink ? (
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

      {/* Missing Content Prompt */}
      {hasMissingSections && (
        <Card className="border-dashed border-amber-300 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Complete Your Campaign
            </CardTitle>
            <CardDescription className="text-amber-700">
              Add the following sections to make your campaign more effective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {!hasFeaturedImage && (
                <MissingSectionItem icon={FileText} title="Featured Image" description="Add campaign image" />
              )}
              {!hasTargets && (
                <MissingSectionItem icon={Target} title="Targets" description="Define campaign targets" />
              )}
              {!hasDemands && (
                <MissingSectionItem icon={CheckCircle} title="Demands" description="Add campaign demands" />
              )}
              {!hasSteps && (
                <MissingSectionItem icon={Users} title="Participation" description="Add participation steps" />
              )}
              {!hasResources && (
                <MissingSectionItem icon={Globe} title="Resources" description="Add useful resources" />
              )}
              {!hasCTA && (
                <MissingSectionItem icon={Heart} title="Call to Action" description="Add CTA buttons" />
              )}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
                <Link href={`/admin/campaigns/${campaign.slug}/edit`}>
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

function MissingSectionItem({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
      <Icon className="h-5 w-5 text-amber-600" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
