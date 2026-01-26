"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  User,
  Globe,
  Tag,
  FileText,
  Play,
  Archive,
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
import { fetchEventByIdAction, deleteEventAction, updateEventAction } from "@/src/actions/events.actions";
import { type Event, type EventTranslation } from "@/src/lib/db/schema";

type EventStatus = "draft" | "published" | "archived";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const t = useTranslations("admin.events.detail");
  const [event, setEvent] = React.useState<Event | EventTranslation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch event on mount
  React.useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resolvedParams = await params;
        const result = await fetchEventByIdAction(resolvedParams.id);
        if (result.success) {
          setEvent(result.data as Event);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch event");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [params]);

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm(t("delete.confirm", { title: event.title || "Untitled Event" }))) return;

    try {
      const result = await deleteEventAction(event.id);
      if (result.success) {
        router.push("/admin/events");
      } else {
        console.error(`Error deleting event: ${result.error}`);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleStatusUpdate = async (newStatus: EventStatus) => {
    if (!event) return;

    try {
      const result = await updateEventAction(event.id, { status: newStatus });
      if (result.success) {
        setEvent({ ...event, status: newStatus });
      } else {
        console.error(`Error updating status: ${result.error}`);
      }
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  const formatDate = (dateValue: Date | string | null | undefined) => {
    if (!dateValue) return t("placeholders.notAvailable");
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to display jsonb fields as string
  const displayValue = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      if (value.length === 0) return "";
      return value.join(", ");
    }
    return JSON.stringify(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("loading")}
          </h1>
        </div>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            {t("loadingDetails")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("notFound")}
          </h1>
        </div>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            {error || t("notFoundMessage")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = event.status || "draft";

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("pageTitle")}
            </h1>
            <p className="text-gray-600 mt-1">{t("pageSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 sm:ml-0">
          <Button variant="outline" asChild>
            <Link href={`/admin/events/${event.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("actions.edit")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event Details Card */}
        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl font-semibold">
                {event.title || t("placeholders.untitled")}
              </CardTitle>
              <Badge className={statusColors[currentStatus]}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Featured Image */}
            {event.featuredImage && (
              <div className="rounded-lg overflow-hidden relative h-64">
                <Image
                  src={event.featuredImage}
                  alt={String(event.altTexts || event.title || "Event image")}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            {event.content && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {t("sections.description")}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.content}</p>
              </div>
            )}

            <Separator />

            {/* Meta Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              {displayValue(event.locations) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.location")}</p>
                    <p className="text-gray-700">{displayValue(event.locations)}</p>
                  </div>
                </div>
              )}

              {displayValue(event.categories) && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.category")}</p>
                    <p className="text-gray-700">{displayValue(event.categories)}</p>
                  </div>
                </div>
              )}

              {displayValue(event.organizers) && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.organizer")}</p>
                    <p className="text-gray-700">{displayValue(event.organizers)}</p>
                  </div>
                </div>
              )}

              {event.language && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.language")}</p>
                    <p className="text-gray-700">{event.language}</p>
                  </div>
                </div>
              )}

              {event.authorName && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.author")}</p>
                    <p className="text-gray-700">{event.authorName}</p>
                  </div>
                </div>
              )}

              {event.publishedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.published")}</p>
                    <p className="text-gray-700">{formatDate(event.publishedAt)}</p>
                  </div>
                </div>
              )}

              {event.updatedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t("labels.lastUpdated")}</p>
                    <p className="text-gray-700">{formatDate(event.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">{t("actions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentStatus === "draft" && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusUpdate("published")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t("actions.publish")}
                </Button>
              )}
              {currentStatus === "published" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusUpdate("archived")}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t("actions.archive")}
                </Button>
              )}
              {currentStatus === "archived" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusUpdate("draft")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t("actions.moveToDraft")}
                </Button>
              )}

              <Separator />

              {event.slug && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/events/${event.slug}`} target="_blank">
                    {t("actions.viewPublic")}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Event Info Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">{t("sections.eventInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("labels.id")}</span>
                <span className="font-mono text-xs text-gray-700 truncate max-w-[150px]">
                  {event.id}
                </span>
              </div>
              {event.slug && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("labels.slug")}</span>
                  <span className="text-gray-700 truncate max-w-[150px]">
                    {event.slug}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{t("labels.status")}</span>
                <span className="text-gray-700 capitalize">{currentStatus}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
