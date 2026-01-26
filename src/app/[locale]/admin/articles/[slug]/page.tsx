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
  MapPin,
  Users,
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
import { Separator } from "@/src/components/ui/separator";
import { getPostBySlug, deletePost } from "@/src/actions/posts.actions";
import { getCategoryName, type PostWithCategory } from "@/src/lib/utils/article.utils";
import { markdownToHtml } from "@/src/lib/utils/markdown";

// Allow flexible article structure for compatibility with different data sources
type Article = PostWithCategory & Record<string, any>;

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
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const result = await getPostBySlug(resolvedParams.slug);
        console.log(result)
        if (result.success && result.post) {
          setArticle(result.post as any);
        } else if (!result.success) {
          toast.error(result.error || t("toast.loadError"));
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error(t("toast.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params]);

  const handleDelete = async () => {
    if (!article) return;
    if (!confirm(t("delete.confirm", { title: article.title }))) return;

    setDeleting(true);
    
    try {
      const resolvedParams = await params;
      await deletePost(resolvedParams.slug);
      toast.success(t("toast.deleteSuccess"));
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error(t("toast.deleteError"));
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("placeholders.notSet");
    return new Date(dateString).toLocaleDateString("en-US", {
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
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
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
                <p className="text-muted-foreground">{article.excerpt}</p>
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
                      {article.author_name || t("placeholders.unknown")}
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
                    {formatDate(article.published_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("labels.created")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("labels.lastUpdated")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.updated_at)}
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

          {/* Locations */}
          {article.locations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("sections.locations")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{article.locations}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizers */}
          {article.organizers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("sections.organizers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{article.organizers}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
