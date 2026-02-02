"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { EventForm, type EventFormData } from "@/src/components/forms/event-form";
import { createEventAction } from "@/src/actions/events.actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function NewEventPage() {
  const router = useRouter();
  const t = useTranslations("admin.events.new");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      // Generate slug from title with unique suffix to avoid conflicts
      const baseSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const uniqueSuffix = Date.now().toString(36).slice(-4);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      // Parse JSONB fields if they contain JSON strings
      const parseJsonField = (value: string | undefined): unknown => {
        if (!value) return undefined;
        try {
          return JSON.parse(value);
        } catch {
          // If not valid JSON, return as array with single item or undefined
          return value.trim() ? [value.trim()] : undefined;
        }
      };

      const result = await createEventAction({
        slug,
        title: data.title,
        content: data.content,
        status: data.status,
        language: (data.language || "en") as "en" | "fi",
        featuredImage: data.featuredImageUrl || undefined,
        authorName: data.authorName || undefined,
        altTexts: parseJsonField(data.altTexts),
        categories: parseJsonField(data.categories),
        locations: parseJsonField(data.locations),
        organizers: parseJsonField(data.organizers),
        autoTranslate: data.autoTranslate,
      });

      if (result.success) {
        const createdCount = (result.data as { createdEvents?: { language: string; slug: string }[] })?.createdEvents?.length || 1;
        toast.success(
          data.autoTranslate
            ? t("createSuccessMultiple", { count: createdCount })
            : t("createSuccess")
        );
        router.push("/admin/events");
      } else {
        console.error("Failed to create event:", result.error, result.errors);
        toast.error(result.error || t("createError"));
      }
    } catch (err) {
      console.error("Error creating event:", err);
      const errorMessage = err instanceof Error ? err.message : t("unexpectedError");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToEvents")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={t("submitLabel")}
        submittingLabel={t("submittingLabel")}
      />
    </div>
  );
}
