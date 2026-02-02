"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Save, Loader2, Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";
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
import { ImageUpload } from "@/src/components/ui/image-upload";
import type { Event } from "@/src/lib/db/schema";

type EventStatus = "draft" | "published" | "archived";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]),
  featuredImageUrl: z.string().optional(),
  altTexts: z.string().optional(),
  categories: z.string().optional(),
  locations: z.string().optional(),
  organizers: z.string().optional(),
  language: z.string().optional(),
  authorName: z.string().optional(),
  autoTranslate: z.boolean().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
}

export function EventForm({
  event,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
}: EventFormProps) {
  const tForm = useTranslations("admin.events.form");
  const t = useTranslations("admin.events");

  // default labels from translations when not passed in
  submitLabel = submitLabel ?? tForm("save.default");
  submittingLabel = submittingLabel ?? tForm("save.saving");
  // Helper to convert jsonb fields to string
  const jsonbToString = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      content: event?.content || "",
      status: (event?.status as EventStatus) ?? "draft",
      featuredImageUrl: event?.featuredImage || "",
      altTexts: jsonbToString(event?.altTexts),
      categories: jsonbToString(event?.categories),
      locations: jsonbToString(event?.locations),
      organizers: jsonbToString(event?.organizers),
      language: event?.language || "en",
      authorName: event?.authorName || "",
      autoTranslate: false,
    },
  });

  // Reset form when event changes
  React.useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || "",
        content: event.content || "",
        status: (event.status as EventStatus) ?? "draft",
        featuredImageUrl: event.featuredImage || "",
        altTexts: jsonbToString(event.altTexts),
        categories: jsonbToString(event.categories),
        locations: jsonbToString(event.locations),
        organizers: jsonbToString(event.organizers),
        language: event.language || "en",
        authorName: event.authorName || "",
      });
    }
  }, [event, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{tForm("section.details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("title.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("title.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("content.label")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={tForm("content.placeholder")}
                          className="min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("categories.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("categories.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {tForm("categories.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location & Organizer Info */}
            <Card>
                <CardHeader>
                <CardTitle>{tForm("section.locationOrganizer")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="locations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("location.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("location.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("organizers.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("organizers.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("author.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("author.placeholder")}
                          {...field}
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
                <CardTitle>{tForm("publishing.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("status.label")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tForm("status.placeholder")} />
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

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("language.label")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tForm("language.placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">{tForm("language.en")}</SelectItem>

                          <SelectItem value="fi">{tForm("language.fi")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {tForm("language.description")}
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
                          {tForm("autoTranslate.label")}
                        </FormLabel>
                        <FormDescription className="text-xs">
                          {tForm("autoTranslate.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
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
                    {isSubmitting ? submittingLabel : submitLabel}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>{tForm("featuredImage.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="featuredImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("featuredImage.title")}</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                          folder="events"
                          maxSize={5}
                        />
                      </FormControl>
                      <FormDescription>
                        {tForm("featuredImage.description")}
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
                      <FormLabel>{tForm("featuredImage.orUrl")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("featuredImage.placeholder")}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        {tForm("featuredImage.alternativeDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altTexts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("alt.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("alt.placeholder")}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        {tForm("alt.description")}
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
  );
}
