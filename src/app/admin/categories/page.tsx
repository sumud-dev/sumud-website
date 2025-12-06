"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash2, FolderOpen, CheckCircle, XCircle, FileText } from "lucide-react";
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

// Category type
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// Mock data for UI display
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Culture",
    slug: "culture",
    description: "Articles about Palestinian culture, traditions, and heritage",
    articleCount: 24,
    status: "active",
    createdAt: "2024-06-15",
    updatedAt: "2025-01-10",
  },
  {
    id: "2",
    name: "Events",
    slug: "events",
    description: "Community events, gatherings, and celebrations",
    articleCount: 18,
    status: "active",
    createdAt: "2024-06-15",
    updatedAt: "2025-02-01",
  },
  {
    id: "3",
    name: "Food",
    slug: "food",
    description: "Traditional recipes, cooking tips, and culinary stories",
    articleCount: 12,
    status: "active",
    createdAt: "2024-07-20",
    updatedAt: "2025-01-25",
  },
  {
    id: "4",
    name: "Education",
    slug: "education",
    description: "Educational resources, programs, and learning opportunities",
    articleCount: 9,
    status: "active",
    createdAt: "2024-08-01",
    updatedAt: "2025-01-18",
  },
  {
    id: "5",
    name: "News",
    slug: "news",
    description: "Latest news and updates from the community",
    articleCount: 31,
    status: "active",
    createdAt: "2024-06-15",
    updatedAt: "2025-02-05",
  },
  {
    id: "6",
    name: "Art",
    slug: "art",
    description: "Visual arts, music, and creative expressions",
    articleCount: 15,
    status: "active",
    createdAt: "2024-09-10",
    updatedAt: "2025-01-30",
  },
  {
    id: "7",
    name: "History",
    slug: "history",
    description: "Historical articles and documentation",
    articleCount: 8,
    status: "active",
    createdAt: "2024-10-05",
    updatedAt: "2024-12-20",
  },
  {
    id: "8",
    name: "Uncategorized",
    slug: "uncategorized",
    description: "Articles without a specific category",
    articleCount: 3,
    status: "inactive",
    createdAt: "2024-06-15",
    updatedAt: "2024-11-15",
  },
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
};

const CategoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return mockCategories;
    return mockCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate stats from mock data
  const stats = React.useMemo(() => {
    const total = mockCategories.length;
    const active = mockCategories.filter((c) => c.status === "active").length;
    const inactive = mockCategories.filter((c) => c.status === "inactive").length;
    const totalArticles = mockCategories.reduce((sum, c) => sum + c.articleCount, 0);
    return { total, active, inactive, totalArticles };
  }, []);

  const handleDelete = (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;
    // TODO: Connect to backend
    toast.info(`Delete "${name}" - connect to backend`);
  };

  const handleStatusToggle = (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    // TODO: Connect to backend
    toast.info(`Update "${slug}" status to ${newStatus} - connect to backend`);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage article categories and organization</p>
        </div>
        <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        <StatsCard
          title="Total Categories"
          value={stats.total}
          icon={FolderOpen}
          iconClassName="text-muted-foreground"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          iconClassName="text-green-500"
          valueClassName="text-green-600"
        />
        <StatsCard
          title="Inactive"
          value={stats.inactive}
          icon={XCircle}
          iconClassName="text-gray-500"
          valueClassName="text-gray-600"
        />
        <StatsCard
          title="Total Articles"
          value={stats.totalArticles}
          icon={FileText}
          iconClassName="text-[#781D32]"
          valueClassName="text-[#781D32]"
        />
      </div>

      {/* Categories Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search categories..."
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
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-[#781D32]" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[category.status]}>
                          {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.articleCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(category.updatedAt).toLocaleDateString()}
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
                              <Link href={`/categories/${category.slug}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusToggle(category.slug, category.status)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {category.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category.slug, category.name)}
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

export default CategoriesPage;
