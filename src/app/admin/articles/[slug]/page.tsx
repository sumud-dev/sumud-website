"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { getPostBySlug, deletePost } from "@/src/actions/article.actions";
import { getCategoryName, type PostWithCategory } from "@/src/lib/article.utils";

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
  const [article, setArticle] = React.useState<PostWithCategory | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const { data, error } = await getPostBySlug(resolvedParams.slug);

        if (error) {
          toast.error("Failed to fetch article");
          console.error(error);
          return;
        }

        if (!data) {
          toast.error("Article not found");
          router.push("/admin/articles");
          return;
        }

        setArticle(data);
      } catch (err) {
        console.error("Error fetching article:", err);
        toast.error("An error occurred while fetching the article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params, router]);

  const handleDelete = async () => {
    if (!article) return;
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    setDeleting(true);
    const { success, error } = await deletePost(article.id);

    if (error) {
      toast.error("Failed to delete article");
      console.error(error);
      setDeleting(false);
    } else if (success) {
      toast.success(`"${article.title}" deleted successfully`);
      router.push("/admin/articles");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
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
        <p className="text-muted-foreground">Article not found</p>
        <Button asChild variant="outline">
          <Link href="/admin/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
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
              Edit
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
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {article.featured_image && (
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={article.featured_image}
                    alt={article.alt_texts?.[0] || article.title}
                    fill
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
                <CardTitle className="text-lg">Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{article.excerpt}</p>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent>
              {article.content ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <p className="text-muted-foreground italic">No content available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={statusColors[article.status] || statusColors.draft}>
                  {article.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Author</p>
                    <p className="text-sm text-muted-foreground">
                      {article.author_name || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(article)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">
                      {article.language || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.published_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
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
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {article.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locations */}
          {article.locations && article.locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {article.locations.map((location, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{location}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizers */}
          {article.organizers && article.organizers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {article.organizers.map((organizer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organizer}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
