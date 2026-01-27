"use client";

import * as React from "react";
import { Link } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  CheckCircle, 
  Archive, 
  Loader2,
  Globe,
  User
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { StatsCard } from "@/src/components/cards";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { getCategoryName } from "@/src/lib/utils/article.utils";

// Import React Query hooks
import { 
  usePosts,
  usePostStatistics,
  useUpdatePost,
  useDeletePost,
} from "@/src/lib/hooks/use-posts";

// Status badge colors
const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const ArticlesPage: React.FC = () => {
  const translationKeys = useTranslations("admin.articles");
  const currentLocale = useLocale() as "en" | "fi";
  
  // Local state for filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const articlesPerPage = 20;
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ slug: string; title: string } | null>(null);

  // React Query hooks - fetch posts with filters
  const { 
    data: paginatedPostData, 
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = usePosts({
    language: currentLocale,
    page: currentPage,
    limit: articlesPerPage,
    status: statusFilter === "all" ? undefined : statusFilter as any,
    search: searchQuery || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // React Query hook - fetch statistics
  const { 
    data: postStatistics,
    isLoading: isLoadingStatistics 
  } = usePostStatistics(currentLocale);

  // React Query mutations
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();

  /**
   * Handle article deletion
   */
  const handleDeletePost = React.useCallback(async () => {
    if (!deleteConfirm) return;

    deletePostMutation.mutate(deleteConfirm.slug, {
      onSuccess: () => {
        toast.success(translationKeys("deleteSuccess"));
        setDeleteConfirm(null);
        refetchPosts();
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || translationKeys("deleteFailed"));
      },
    });
  }, [deletePostMutation, translationKeys, refetchPosts, deleteConfirm]);

  /**
   * Handle status update (publish/unpublish/archive)
   */
  const handleStatusUpdate = React.useCallback(async (
    postSlug: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    updatePostMutation.mutate(
      {
        postSlug: postSlug,
        updateData: { status: newStatus },
      },
      {
        onSuccess: () => {
          const statusMessage = newStatus === "published" 
            ? translationKeys("publishSuccess")
            : newStatus === "archived"
            ? translationKeys("archiveSuccess")
            : translationKeys("unpublishSuccess");
          
          toast.success(statusMessage);
          refetchPosts();
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || translationKeys("statusUpdateFailed"));
        },
      }
    );
  }, [updatePostMutation, translationKeys, refetchPosts]);

  /**
   * Format date for display
   */
  const formatPostDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleDateString(currentLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return "N/A";
    }
  };

  /**
   * Get status badge label
   */
  const getStatusBadgeLabel = (status: string | null): string => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Loading state for statistics
  const displayStatistics = {
    totalArticles: postStatistics?.totalArticles || 0,
    publishedArticles: postStatistics?.publishedArticles || 0,
    draftArticles: postStatistics?.draftArticles || 0,
    archivedArticles: postStatistics?.archivedArticles || 0,
  };

  // Get posts from paginated result
  const displayedPosts = paginatedPostData?.posts || [];
  const paginationInfo = paginatedPostData?.pagination;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {translationKeys("title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {translationKeys("description")}
          </p>
        </div>
        <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            {translationKeys("newButton")}
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        <StatsCard
          title={translationKeys("totalArticles")}
          value={displayStatistics.totalArticles}
          icon={FileText}
          iconClassName="text-muted-foreground"
        />
        <StatsCard
          title={translationKeys("published")}
          value={displayStatistics.publishedArticles}
          icon={CheckCircle}
          iconClassName="text-green-500"
          valueClassName="text-green-600"
        />
        <StatsCard
          title={translationKeys("drafts")}
          value={displayStatistics.draftArticles}
          icon={Edit}
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
        />
        <StatsCard
          title={translationKeys("archived")}
          value={displayStatistics.archivedArticles}
          icon={Archive}
          iconClassName="text-gray-500"
          valueClassName="text-gray-600"
        />
      </div>

      {/* Posts Table Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            {translationKeys("allArticles")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={translationKeys("searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="max-w-sm"
            />
            
            <Select 
              value={statusFilter} 
              onValueChange={(newValue) => {
                setStatusFilter(newValue);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead className="hidden md:table-cell w-32">Author</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading State */}
                {isLoadingPosts && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                      <p className="text-sm text-gray-500 mt-2">Loading posts...</p>
                    </TableCell>
                  </TableRow>
                )}

                {/* Error State */}
                {postsError && !isLoadingPosts && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-red-500">
                      Error loading articles: {postsError.message}
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty State */}
                {!isLoadingPosts && !postsError && displayedPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      {translationKeys("noPostsFound")}
                    </TableCell>
                  </TableRow>
                )}

                {/* Posts List */}
                {!isLoadingPosts && !postsError && displayedPosts.map((post: any) => (
                  <TableRow key={post.id}>
                    {/* Post Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <Link 
                          href={`/admin/articles/${post.slug}`}
                          className="font-medium truncate max-w-xs block hover:text-[#781D32] hover:underline transition-colors"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status Badge */}
                          <Badge className={`${STATUS_BADGE_COLORS[post.status ?? "draft"]} text-xs`}>
                            {getStatusBadgeLabel(post.status)}
                          </Badge>
                          
                          {/* Category Badge */}
                          <Badge variant="outline" className="capitalize text-xs">
                            {getCategoryName(post as any)}
                          </Badge>
                          
                          {/* Translation Badge */}
                          {post.isTranslation && (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Translated
                            </Badge>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Author Column (Hidden on mobile) */}
                    <TableCell className="hidden md:table-cell">
                      {post.isTranslation ? (
                        <div className="flex items-center text-xs text-gray-500">
                          <Globe className="w-3 h-3 mr-1" />
                          AI Translated
                        </div>
                      ) : post.authorName ? (
                        <div className="flex items-center text-sm">
                          <User className="w-3 h-3 mr-1 text-gray-400" />
                          {post.authorName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>

                    {/* Date Column */}
                    <TableCell className="text-sm text-gray-600">
                      {formatPostDate(post.publishedAt?.toString() || post.updatedAt?.toString())}
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* View Details */}
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/articles/${post.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              {translationKeys("viewDetails")}
                            </Link>
                          </DropdownMenuItem>

                          {/* Edit - Only for originals */}
                          {!post.isTranslation && (
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/articles/${post.slug}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {translationKeys("edit")}
                              </Link>
                            </DropdownMenuItem>
                          )}

                          {/* Publish Draft */}
                          {post.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(post.slug, "published")}
                              disabled={updatePostMutation.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {translationKeys("publish")}
                            </DropdownMenuItem>
                          )}

                          {/* Unpublish */}
                          {post.status === "published" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(post.slug, "draft")}
                              disabled={updatePostMutation.isPending}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {translationKeys("unpublish")}
                            </DropdownMenuItem>
                          )}

                          {/* Delete */}
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirm({ slug: post.slug, title: post.title || "Untitled" })}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {translationKeys("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((paginationInfo.currentPage - 1) * paginationInfo.pageSize) + 1} to{' '}
                {Math.min(paginationInfo.currentPage * paginationInfo.pageSize, paginationInfo.totalItems)} of{' '}
                {paginationInfo.totalItems} articles
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!paginationInfo.hasPreviousPage || isLoadingPosts}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === paginationInfo.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        disabled={isLoadingPosts}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(paginationInfo.totalPages, prev + 1))}
                  disabled={!paginationInfo.hasNextPage || isLoadingPosts}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translationKeys("deleteConfirm", { title: "" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {translationKeys("deleteMessage", { title: deleteConfirm?.title ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translationKeys("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {translationKeys("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArticlesPage;