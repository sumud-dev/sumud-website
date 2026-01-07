"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Target,
  Pause,
  Play,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { StatsCard } from "@/src/components/cards";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  deleteCampaignAction,
  updateCampaignAction,
  fetchActiveCampaignsAction,
} from "@/src/actions/campaigns.actions";

// Type definitions
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

interface Campaign {
  id: string;
  campaignId?: string; // For translations, this is the actual campaign ID
  slug: string;
  title: string | null;
  description?: string | null;
  status: CampaignStatus;
  isActive: boolean;
  isFeatured: boolean;
  category?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Status color mapping
const campaignStatusColors: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  paused: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  archived: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
};

// Helper function to extract text from JSONB description field
function extractDescriptionText(description: unknown): string {
  if (!description) return '';
  
  // If it's already a string, return it
  if (typeof description === 'string') return description;
  
  // If it's a JSONB object with data property
  if (typeof description === 'object' && description !== null && 'data' in description) {
    const desc = description as { type?: string; data?: unknown };
    if (typeof desc.data === 'string') {
      return desc.data;
    }
    // For blocks type, try to extract text from blocks
    if (desc.type === 'blocks' && Array.isArray(desc.data)) {
      return desc.data.map((block: { text?: string }) => block.text || '').join(' ');
    }
  }
  
  return '';
}

const CampaignsPage: React.FC = () => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch campaigns from the database
  const fetchCampaignsData = React.useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }
      
      const result = await fetchActiveCampaignsAction(locale);
      
      if (result.success && result.data) {
        setCampaigns(result.data as Campaign[]);
        
        if (showRefreshToast) {
          toast.success("Campaigns refreshed");
        }
      } else {
        toast.error(!result.success ? result.error : "Failed to fetch campaigns");
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      toast.error("An unexpected error occurred while fetching campaigns");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [locale]);

  // Initial fetch
  React.useEffect(() => {
    fetchCampaignsData();
  }, [fetchCampaignsData]);

  // Sort campaigns by createdAt descending (newest first)
  const sortedCampaigns = React.useMemo(() => {
    return [...campaigns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [campaigns]);

  // Filter campaigns based on search
  const filteredCampaigns = React.useMemo(() => {
    if (!searchQuery) return sortedCampaigns;
    return sortedCampaigns.filter((campaign) =>
      campaign.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sortedCampaigns]);

  // Calculate stats from campaigns
  const stats = React.useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === "active").length;
    const drafts = campaigns.filter((c) => c.status === "draft").length;
    const completed = campaigns.filter((c) => c.status === "completed").length;
    return { total, active, drafts, completed };
  }, [campaigns]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const result = await deleteCampaignAction(slug, locale);
      
      if (!result.success) {
        toast.error(`Failed to delete campaign: ${result.error}`);
        return;
      }
      
      toast.success(`"${title}" has been deleted`);
      // Remove from local state
      setCampaigns(prev => prev.filter(c => c.slug !== slug));
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error("An unexpected error occurred while deleting the campaign");
    }
  };

  const handleStatusUpdate = async (
    campaign: Campaign,
    newStatus: CampaignStatus
  ) => {
    // Use campaignId for translations, otherwise use id
    const actualCampaignId = campaign.campaignId || campaign.id;
    
    try {
      const result = await updateCampaignAction(actualCampaignId, campaign.slug, { status: newStatus }, locale);
      
      if (!result.success) {
        toast.error(`Failed to update status: ${result.error}`);
        return;
      }
      
      toast.success(`"${campaign.title ?? 'Campaign'}" status updated to ${newStatus}`);
      // Update local state
      setCampaigns(prev => 
        prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c)
      );
    } catch (err) {
      console.error("Error updating campaign status:", err);
      toast.error("An unexpected error occurred while updating the status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#781D32]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Campaigns
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchCampaignsData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
            <Link href="/admin/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        <StatsCard
          title="Total Campaigns"
          value={stats.total}
          icon={Target}
          iconClassName="text-muted-foreground"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={Play}
          iconClassName="text-green-500"
          valueClassName="text-green-600"
        />
        <StatsCard
          title="Drafts"
          value={stats.drafts}
          icon={Edit}
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={Target}
          iconClassName="text-blue-500"
          valueClassName="text-blue-600"
        />
      </div>

      {/* Campaigns Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-auto">Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No campaigns found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <Link
                              href={`/admin/campaigns/${campaign.slug}`}
                              className="font-medium hover:text-[#781D32] hover:underline transition-colors"
                            >
                              {campaign.title || <span className="text-gray-400">No campaign title</span>}
                            </Link>
                            {campaign.description ? (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {extractDescriptionText(campaign.description)}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 mt-1 italic">
                                No description added
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={campaignStatusColors[campaign.status]}>
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/campaigns/${campaign.slug}`}
                                  target="_blank"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/campaigns/${campaign.slug}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {campaign.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(campaign, "active")}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {campaign.status === "active" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(campaign, "paused")}
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {campaign.status === "paused" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(campaign, "active")}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(campaign.slug, campaign.title ?? "No campaign title")
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignsPage;
