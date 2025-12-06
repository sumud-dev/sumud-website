"use client";

import * as React from "react";
import Link from "next/link";
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
import { Campaign } from "@/src/types/Campaigns";

// Mock data for UI display
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Relief Fund",
    description:
      "Providing immediate assistance to families affected by the crisis...",
    goal: 50000,
    currentAmount: 32500,
    status: "active",
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    imageUrl: null,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "2",
    title: "Education Support Program",
    description:
      "Supporting students with scholarships and educational materials...",
    goal: 25000,
    currentAmount: 25000,
    status: "completed",
    startDate: "2024-09-01",
    endDate: "2024-12-31",
    imageUrl: null,
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: "2024-12-31T00:00:00Z",
  },
  {
    id: "3",
    title: "Community Center Renovation",
    description:
      "Renovating the community center to provide better facilities...",
    goal: 75000,
    currentAmount: 15000,
    status: "paused",
    startDate: "2025-02-01",
    endDate: "2025-12-31",
    imageUrl: null,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-02-20T00:00:00Z",
  },
  {
    id: "4",
    title: "Healthcare Initiative",
    description:
      "Providing medical supplies and healthcare services to underserved communities...",
    goal: 40000,
    currentAmount: 0,
    status: "draft",
    startDate: null,
    endDate: null,
    imageUrl: null,
    createdAt: "2025-02-25T00:00:00Z",
    updatedAt: "2025-02-25T00:00:00Z",
  },
  {
    id: "5",
    title: "Winter Aid Campaign 2024",
    description:
      "Providing warm clothing and heating assistance during winter months...",
    goal: 30000,
    currentAmount: 28500,
    status: "cancelled",
    startDate: "2024-11-01",
    endDate: "2025-02-28",
    imageUrl: null,
    createdAt: "2024-11-01T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
];

const statusColors: Record<Campaign["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
};



const CampaignsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter campaigns based on search
  const filteredCampaigns = React.useMemo(() => {
    if (!searchQuery) return mockCampaigns;
    return mockCampaigns.filter((campaign) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate stats from mock data
  const stats = React.useMemo(() => {
    const total = mockCampaigns.length;
    const active = mockCampaigns.filter((c) => c.status === "active").length;
    const drafts = mockCampaigns.filter((c) => c.status === "draft").length;
    const completed = mockCampaigns.filter((c) => c.status === "completed").length;
    return { total, active, drafts, completed };
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    // TODO: Connect to backend
    toast.info(`Delete "${title}" - connect to backend`);
  };

  const handleStatusUpdate = (
    id: string,
    newStatus: Campaign["status"],
    title: string
  ) => {
    // TODO: Connect to backend
    toast.info(`Update "${title}" status to ${newStatus} - connect to backend`);
  };

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
        <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
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
                  <TableHead className="w-[300px]">Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
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
                            <div className="font-medium">{campaign.title}</div>
                            {campaign.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[campaign.status]}>
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.startDate
                            ? new Date(campaign.startDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {campaign.endDate
                            ? new Date(campaign.endDate).toLocaleDateString()
                            : "—"}
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
                                  href={`/campaigns/${campaign.id}`}
                                  target="_blank"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/campaigns/${campaign.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {campaign.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      campaign.id,
                                      "active",
                                      campaign.title
                                    )
                                  }
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {campaign.status === "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      campaign.id,
                                      "paused",
                                      campaign.title
                                    )
                                  }
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {campaign.status === "paused" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      campaign.id,
                                      "active",
                                      campaign.title
                                    )
                                  }
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(campaign.id, campaign.title)
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
