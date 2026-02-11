"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Eye, Languages, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { RichTextEditor } from "@/src/lib/tipTap-editor/RichTextEditor";
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
import { createPost } from "@/src/actions/posts.actions";
import { useQueryClient } from "@tanstack/react-query";
import { postQueryKeys } from "@/src/lib/hooks/use-posts";
import { ArticleUIService } from "@/src/lib/services/article-ui.service";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt too long"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]),
  language: z.enum(["en", "fi"]),
  featuredImageUrl: z.string().optional(),
  tags: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description too long").optional(),
  autoTranslate: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

  // use translations for language labels

export default function NewArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("admin.articles.new");
  const locale = useLocale() as "en" | "fi";
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      status: "published",
      language: locale,
      featuredImageUrl: "",
      tags: "",
      metaDescription: "",
      autoTranslate: false,
    },
  });

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    if (data.autoTranslate) {
      setIsTranslating(true);
    }

    console.log('[Frontend] Form submission data:', {
      autoTranslate: data.autoTranslate,
      language: data.language,
      title: data.title
    });

    try {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .trim();

      // Prepare article data
      const articleData = {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        language: data.language,
        featuredImage: data.featuredImageUrl || null,
        categories: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        autoTranslate: data.autoTranslate,
        // Add target languages when auto-translate is enabled
        targetLanguages: data.autoTranslate
          ? ["en", "fi"].filter((lang) => lang !== data.language)
          : undefined,
      };

      console.log('[Frontend] Prepared article data:', {
        autoTranslate: articleData.autoTranslate,
        targetLanguages: articleData.targetLanguages,
        language: articleData.language
      });

      const result = await createPost(articleData);

      console.log('[Frontend] Result from createPost:', {
        success: result.success,
        translationsCount: result.success ? result.createdTranslations?.length : 0
      });

      if (!result.success) {
        toast.error(result.error || "Failed to create article");
        return;
      }

      // Use business logic service for success handling
      const translationsCount = result.createdTranslations?.length || 0;
      const navigationStrategy = ArticleUIService.getNavigationStrategy('create', true, {
        hasTranslations: translationsCount > 0
      });
      const successMessage = ArticleUIService.getSuccessMessage('create', {
        translationsCount
      });

      toast.success(successMessage);
      
      // Invalidate React Query cache to refresh the articles list
      if (navigationStrategy.shouldInvalidateCache) {
        queryClient.invalidateQueries({ queryKey: postQueryKeys.allPosts });
      }
      
      // Navigate using business logic strategy
      if (navigationStrategy.shouldRedirect) {
        router.push(navigationStrategy.redirectPath);
      }
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create article. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setIsTranslating(false);
    }
  };

  const handlePreview = () => {
    const formData = form.getValues();
    // Here you would typically open a preview modal or new tab
    console.log("Preview data:", formData);
    toast.info(t("previewNote"));
  };

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
            <p className="text-gray-600">{t("description")}</p>
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
                            placeholder={t("placeholders.content") ?? "Write your article content here..."}
                            className="min-h-[300px]"
                          />
                        </FormControl>
                        <FormDescription>{t("contentDescription")}</FormDescription>
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
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t("languageLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                        <FormDescription>{t("languageDescription") ?? "The primary language of this article"}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <FormDescription className="text-xs">
                            {t("autoTranslateDescription") ?? "Automatically translate to all languages (EN, FI)"}
                          </FormDescription>
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("statusLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isTranslating ? t("translating") : t("saving")}
                          </>
                        ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t("saveButton")}
                        </>
                      )}
                    </Button>
                    {form.watch("autoTranslate") && (
                      <p className="text-xs text-muted-foreground text-center">
                        {t("autoTranslateNote", { count: 2 })}
                      </p>
                    )}
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
                          {t("featuredImageDescription", { maxSize: 5 })}
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
                            placeholder="https://example.com/image.jpg"
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

              {/* Tags and SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("tagsAndSeo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("tags") ?? "Tags"}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("placeholders.tags")}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("tagsHint")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("metaDescription")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("metaDescriptionPlaceholder") ?? "SEO meta description..."}
                            className="min-h-[80px]"
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