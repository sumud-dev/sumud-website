"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash2, Eye, FileText, CheckCircle, Archive, Loader2 } from "lucide-react";
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
import {
  getPosts,
  deletePost,
  updatePostStatus,
} from "@/src/actions/article.actions";
import {
  calculateStats,
  getCategoryName,
  type PostWithCategory,
} from "@/src/lib/article.utils";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

const ArticlesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [posts, setPosts] = React.useState<PostWithCategory[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch posts from server action
  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await getPosts();

    if (error) {
      toast.error("Failed to fetch articles");
      console.error(error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts based on search
  const filteredPosts = React.useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, posts]);

  // Calculate stats from posts
  const stats = React.useMemo(() => calculateStats(posts), [posts]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const { success, error } = await deletePost(id);

    if (error) {
      toast.error("Failed to delete article");
      console.error(error);
    } else if (success) {
      toast.success(`"${title}" deleted successfully`);
      fetchPosts();
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: "draft" | "published" | "archived") => {
    const { success, error } = await updatePostStatus(id, newStatus);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else if (success) {
      toast.success(`Status updated to ${newStatus}`);
      fetchPosts();
    }
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
                  <TableHead>Title</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No articles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium truncate max-w-xs">
                            {post.title}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusColors[post.status] || statusColors.draft} text-xs`}>
                              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">
                              {getCategoryName(post)}
                            </Badge>
                          </div>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {post.status === "published" && post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
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
                              <Link href={`/admin/articles/${post.slug}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/articles/${post.slug}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {post.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(post.id, "published")}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {post.status === "published" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(post.id, "draft")}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(post.id, post.title)}
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