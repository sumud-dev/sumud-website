"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { postQueryKeys } from "@/src/lib/hooks/use-posts";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Eye, Loader2, Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { RichTextEditor } from "@/src/lib/tipTap-editor/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";
import { getPostBySlug, updatePost } from "@/src/actions/posts.actions";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt too long"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]),
  language: z.enum(["en", "fi"]),  // ADD THIS LINE
  featuredImageUrl: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description too long").optional(),
  autoTranslate: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface EditArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const t = useTranslations("admin.articles.edit");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [resolvedSlug, setResolvedSlug] = React.useState<string>("");

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
      language: "en",  // ADD THIS LINE
      featuredImageUrl: "",
      metaDescription: "",
      autoTranslate: false,
    },
  });

  React.useEffect(() => {
    params.then((p) => setResolvedSlug(p.slug));
  }, [params]);

  const { data: articleData, isLoading } = useQuery({
    queryKey: ["article", resolvedSlug],
    queryFn: async () => {
      if (!resolvedSlug) return null;
      
      const languages = ["en", "fi"];
      for (const lang of languages) {
        const result = await getPostBySlug(resolvedSlug, lang);
        if (result.success && result.post) {
          return { post: result.post, language: lang };
        }
      }
      return null;
    },
    enabled: !!resolvedSlug,
  });

  const article = articleData?.post ?? null;
  const articleLanguage = articleData?.language ?? "en";

  React.useEffect(() => {
    if (article) {
      form.reset({
        title: article.title || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        status: (article.status as "draft" | "published" | "archived") || "draft",
        language: articleLanguage as "en" | "fi",
        featuredImageUrl: article.featuredImage || "",
        metaDescription: "",
        autoTranslate: false,
      });
    }
  }, [article, form, articleLanguage]);

  const onSubmit = async (data: ArticleFormData) => {
    if (!article) {
      console.error("No article loaded");
      toast.error(t("noArticleLoaded"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePost(
        resolvedSlug,
        {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          status: data.status,
          featured_image: data.featuredImageUrl || null,
          meta_description: data.metaDescription || null,
        },
        data.language
      );

      if (result.success) {
        toast.success(t("updateSuccess"));
        
        // Generate new slug from title if title changed
        const newSlug = data.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .trim();

        const shouldUpdateSlug = newSlug !== resolvedSlug;

        // Redirect to the updated slug if it changed
        if (shouldUpdateSlug) {
          queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
          router.push(`/admin/articles/${newSlug}/edit`);
        } else {
          queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
          router.push("/admin/articles");
        }
      } else {
        toast.error(result.error || t("updateError"));
      }
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error(t("updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!article || !resolvedSlug) return;

    // Open admin article detail page in new tab
    window.open(`/admin/articles/${resolvedSlug}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("notFound")}</h2>
        <p className="text-gray-600 mb-4">{t("notFound")}</p>
        <Button asChild>
          <Link href="/admin/articles">{t("backToArticles")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToArticles")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600">{t("description", { title: article.title })}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            {t("preview")}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("articleDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("title")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("placeholders.title") ?? "Enter article title..."}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("excerpt")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("placeholders.excerpt") ?? "Brief description of the article..."}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>{t("excerptDescription")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("content")}</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t("placeholders.content") ?? "Write your article content..."}
                            className="min-h-[300px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("publishing")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="autoTranslate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            {t("autoTranslate")}
                          </FormLabel>
                          <FormDescription className="text-xs">{t("autoTranslateDescription")}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("languageLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectLanguage") ?? "Select language"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">{t("language.en")}</SelectItem>
                            <SelectItem value="fi">{t("language.fi")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("statusLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectStatus") ?? "Select status"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">{t("status.draft")}</SelectItem>
                            <SelectItem value="published">{t("status.published")}</SelectItem>
                            <SelectItem value="archived">{t("status.archived")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#781D32] hover:bg-[#781D32]/90"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isSubmitting ? t("saving") : t("saveButton")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("featuredImage")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featuredImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("featuredImage")}</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                            folder="articles"
                            maxSize={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload an image or provide a URL below. Maximum size: 5MB.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featuredImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("enterImageUrl")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("placeholders.imageUrl")}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("enterImageUrlDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("seo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("metaDescription")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("metaDescriptionPlaceholder") ?? "SEO meta description..."}
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>{t("metaDescriptionHint")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
