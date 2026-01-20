"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Eye, Languages, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { RichTextEditor } from "@/src/components/ui/rich-text-editor";
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
import { createPost } from "@/src/actions/article.actions";

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

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  fi: "Suomi (Finnish)",
};

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      status: "published",
      language: "en",
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
        featured_image: data.featuredImageUrl || null,
        categories: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        autoTranslate: data.autoTranslate,
      };

      const result = await createPost(articleData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create article");
      }

      const createdCount = result.createdPosts?.length || 1;
      toast.success(
        data.autoTranslate
          ? `Article created and translated to ${createdCount} language(s)!`
          : "Article created successfully!"
      );
      router.push("/admin/articles");
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
    toast.info("Preview functionality would be implemented here");
  };

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
            <h1 className="text-2xl font-bold text-gray-900">New Article</h1>
            <p className="text-gray-600">Create a new article or blog post</p>
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
                            placeholder="Write your article content here..."
                            className="min-h-[300px]"
                          />
                        </FormControl>
                        <FormDescription>
                          The main content of your article.
                        </FormDescription>
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
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">{LANGUAGE_LABELS.en}</SelectItem>
                            <SelectItem value="fi">{LANGUAGE_LABELS.fi}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The primary language of this article
                        </FormDescription>
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
                          defaultValue={field.value}
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
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isTranslating ? "Translating..." : "Saving..."}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Article
                        </>
                      )}
                    </Button>
                    {form.watch("autoTranslate") && (
                      <p className="text-xs text-muted-foreground text-center">
                        Will create versions in all 3 languages
                      </p>
                    )}
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

              {/* Tags and SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags & SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="culture, heritage, community..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Separate tags with commas
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
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO meta description..."
                            className="min-h-[80px]"
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