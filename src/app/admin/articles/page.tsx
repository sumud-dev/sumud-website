"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash2, Eye, FileText, CheckCircle, Archive } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
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
import { Article } from "@/src/types/Articles";

// Mock data for UI display
const mockArticles: Article[] = [
  {
    id: "1",
    title: "Preserving Palestinian Heritage Through Art",
    slug: "preserving-palestinian-heritage-through-art",
    excerpt: "Exploring how traditional art forms keep cultural identity alive...",
    status: "published",
    category: { name: "Culture" },
    publishedAt: "2025-01-15",
    createdAt: "2025-01-10",
    viewCount: 1250,
  },
  {
    id: "2",
    title: "Community Events This Spring",
    slug: "community-events-spring-2025",
    excerpt: "Join us for exciting community gatherings and celebrations...",
    status: "published",
    category: { name: "Events" },
    publishedAt: "2025-02-01",
    createdAt: "2025-01-28",
    viewCount: 890,
  },
  {
    id: "3",
    title: "Traditional Recipes: A Culinary Journey",
    slug: "traditional-recipes-culinary-journey",
    excerpt: "Discover the rich flavors and stories behind traditional dishes...",
    status: "draft",
    category: { name: "Food" },
    publishedAt: null,
    createdAt: "2025-02-10",
    viewCount: 0,
  },
  {
    id: "4",
    title: "Youth Education Programs",
    slug: "youth-education-programs",
    excerpt: "New initiatives to support young learners in our community...",
    status: "published",
    category: { name: "Education" },
    publishedAt: "2025-01-20",
    createdAt: "2025-01-18",
    viewCount: 567,
  },
  {
    id: "5",
    title: "Archived: 2024 Year in Review",
    slug: "2024-year-in-review",
    excerpt: "A look back at our achievements and milestones from last year...",
    status: "archived",
    category: { name: "News" },
    publishedAt: "2024-12-31",
    createdAt: "2024-12-28",
    viewCount: 2100,
  },
];

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

const ArticlesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter articles based on search
  const filteredArticles = React.useMemo(() => {
    if (!searchQuery) return mockArticles;
    return mockArticles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate stats from mock data
  const stats = React.useMemo(() => {
    const total = mockArticles.length;
    const published = mockArticles.filter((a) => a.status === "published").length;
    const drafts = mockArticles.filter((a) => a.status === "draft").length;
    const archived = mockArticles.filter((a) => a.status === "archived").length;
    return { total, published, drafts, archived };
  }, []);

  const handleDelete = (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    // TODO: Connect to backend
    toast.info(`Delete "${title}" - connect to backend`);
  };

  const handleStatusUpdate = (slug: string, newStatus: string) => {
    // TODO: Connect to backend
    toast.info(`Update "${slug}" status to ${newStatus} - connect to backend`);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage your articles and blog posts</p>
        </div>
        <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        <StatsCard
          title="Total Articles"
          value={stats.total}
          icon={FileText}
          iconClassName="text-muted-foreground"
        />
        <StatsCard
          title="Published"
          value={stats.published}
          icon={CheckCircle}
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
          title="Archived"
          value={stats.archived}
          icon={Archive}
          iconClassName="text-gray-500"
          valueClassName="text-gray-600"
        />
      </div>

      {/* Articles Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">All Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search articles..."
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
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No articles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium">{article.title}</div>
                          {article.excerpt && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[article.status]}>
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {article.category?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {article.status === "published" && article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : new Date(article.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{article.viewCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/articles/${article.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/articles/${article.slug}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {article.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(article.slug, "published")}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {article.status === "published" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(article.slug, "draft")}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(article.slug, article.title)}
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
}

export default ArticlesPage;