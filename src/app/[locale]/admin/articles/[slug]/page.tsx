"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
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
import { Separator } from "@/src/components/ui/separator";
import { usePostBySlug } from "@/src/lib/hooks/use-posts";
import { useDeletePost } from "@/src/lib/hooks/use-posts";
import { getCategoryName } from "@/src/lib/utils/article.utils";
import { markdownToHtml } from "@/src/lib/utils/markdown";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

interface ArticleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const router = useRouter();
  const t = useTranslations("admin.articles.detail");
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ slug: string; title: string } | null>(null);
  const [resolvedSlug, setResolvedSlug] = React.useState<string>("");
  
  // Resolve params
  React.useEffect(() => {
    params.then(({ slug }) => setResolvedSlug(slug));
  }, [params]);

  // Use React Query hooks
  const { 
    data: article, 
    isLoading: loading,
    error: articleError 
  } = usePostBySlug(resolvedSlug);
  const deletePostMutation = useDeletePost();

  // Show error toast if article fails to load
  React.useEffect(() => {
    if (articleError) {
      toast.error(articleError.message || t("toast.loadError"));
    }
  }, [articleError, t]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    deletePostMutation.mutate(deleteConfirm.slug, {
      onSuccess: () => {
        toast.success(t("toast.deleteSuccess"));
        setDeleteConfirm(null);
        router.push("/admin/articles");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || t("toast.deleteError"));
      },
    });
  };

  const handleDeleteClick = () => {
    if (!article) return;
    setDeleteConfirm({ slug: article.slug, title: article.title || "Untitled" });
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return t("placeholders.notSet");
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/admin/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToArticles")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/articles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{article.title}</h1>
            <p className="text-muted-foreground">/{article.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/articles/${article.slug}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("actions.edit")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={deletePostMutation.isPending}
          >
            {deletePostMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {article.featuredImage && (
            <Card className="p-0">
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={article.featuredImage}
                    alt={article.title ?? "Article image"}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("sections.excerpt")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {article.excerpt
                    .replace(/<div data-raw-html="true"[^>]*>.*?<\/div>/gs, '')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&')
                    .trim()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("sections.content")}</CardTitle>
            </CardHeader>
            <CardContent>
              {article.content ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
                />
              ) : (
                <p className="text-muted-foreground italic">{t("placeholders.noContent")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("sections.statusDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("labels.status")}</span>
                <Badge className={statusColors[article.status ?? "draft"] || statusColors.draft}>
                  {article.status ?? "draft"}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t("labels.author")}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.authorName || t("placeholders.unknown")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t("labels.category")}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(article)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t("labels.language")}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.language || t("placeholders.notSet")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("sections.timeline")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("labels.published")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("labels.created")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("labels.lastUpdated")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Categories (from array field) */}
              {article.categories && article.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("sections.categories")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {article.categories.map((category: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.confirm", { title: "" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.message", { title: deleteConfirm?.title ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
