"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { ArrowLeft, Save, Eye, Loader2, Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { RichTextEditor } from "@/src/components/ui/rich-text-editor";
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
import { getPostBySlug, updatePost } from "@/src/actions/article.actions";
import type { PostWithCategory } from "@/src/lib/utils/article.utils";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt too long"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]),
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [article, setArticle] = React.useState<PostWithCategory | null>(null);
  const [currentSlug, setCurrentSlug] = React.useState<string>("");
  const [articleLanguage, setArticleLanguage] = React.useState<string>("en");

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
      featuredImageUrl: "",
      metaDescription: "",
      autoTranslate: false,
    },
  });

  React.useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const resolvedParams = await params;
        setCurrentSlug(resolvedParams.slug);
        
        // Try fetching in different languages (en, fi, ar)
        const languages = ["en", "fi", "ar"];
        let foundPost = null;
        let foundLanguage = "en";
        
        for (const lang of languages) {
          const result = await getPostBySlug(resolvedParams.slug, lang);
          if (result.success && result.post) {
          foundPost = result.post as any;
            break;
          }
        }
        
        if (foundPost) {
          setArticle(foundPost);
          setArticleLanguage(foundLanguage);
          
          // Update form with fetched data
          form.reset({
            title: foundPost.title || "",
            excerpt: foundPost.excerpt || "",
            content: foundPost.content || "",
            status: (foundPost.status as "draft" | "published" | "archived") || "draft",
            featuredImageUrl: foundPost.featuredImage || "",
            metaDescription: "",
            autoTranslate: false,
          });
        } else {
          toast.error("Failed to load article");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error("Failed to load article");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params, form]);

  const onSubmit = async (data: ArticleFormData) => {
    if (!article) {
      console.error("No article loaded");
      toast.error("No article loaded");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePost(
        currentSlug,
        {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          status: data.status,
          featured_image: data.featuredImageUrl || null,
          meta_description: data.metaDescription || null,
          autoTranslate: data.autoTranslate,
        },
        articleLanguage
      );

      if (result.success) {
        toast.success("Article updated successfully");
        
        // Generate new slug from title if title changed
        const newSlug = data.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .trim();

        const shouldUpdateSlug = newSlug !== currentSlug;

        // Redirect to the updated slug if it changed
        if (shouldUpdateSlug) {
          router.push(`/admin/articles/${newSlug}/edit`);
        } else {
          router.push("/admin/articles");
        }
      } else {
        toast.error(result.error || "Failed to update article");
      }
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!article || !currentSlug) return;

    // Open admin article detail page in new tab
    window.open(`/admin/articles/${currentSlug}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading article...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Article Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The article you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/articles">Back to Articles</Link>
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
              Back to Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-600">Update article: {article.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
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
                  <CardTitle>Article Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter article title..."
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
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the article..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be shown in article previews and search
                          results.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Write your article content..."
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
                  <CardTitle>Publishing</CardTitle>
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
                            Auto-translate
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Automatically translate to all languages (EN, AR, FI)
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
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
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
                      {isSubmitting ? "Updating..." : "Update Article"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featuredImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image</FormLabel>
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
                        <FormLabel>Or enter image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Alternatively, paste an image URL directly.
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
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO meta description..."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optimal length: 120-160 characters
                        </FormDescription>
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
