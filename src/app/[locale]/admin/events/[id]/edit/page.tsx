"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { EventForm, type EventFormData } from "@/src/components/forms/event-form";
import { fetchEventByIdAction, updateEventAction } from "@/src/actions/events.actions";
import { type Event } from "@/src/lib/db/schema";
import { toast } from "sonner";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [event, setEvent] = React.useState<Event | null>(null);
  const [currentId, setCurrentId] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  // Resolve params and fetch event
  React.useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resolvedParams = await params;
        setCurrentId(resolvedParams.id);
        
        const result = await fetchEventByIdAction(resolvedParams.id);
        if (result.success) {
          setEvent(result.data as Event);
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch event";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [params]);

  const handleSubmit = async (data: EventFormData) => {
    if (!event || !currentId) {
      toast.error("No event loaded");
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate new slug from title if title changed
      const newSlug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .trim();

      const shouldUpdateSlug = newSlug !== event.slug;

      // Helper to convert empty strings to undefined
      const cleanValue = (val: string | undefined) => val && val.trim() ? val.trim() : undefined;

      // Helper to parse JSONB fields - keep as strings or parse if JSON array format
      const parseJsonbField = (val: string | undefined) => {
        if (!val || !val.trim()) return undefined;
        const trimmed = val.trim();
        // If it looks like JSON array/object, keep as is for JSONB
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            return JSON.parse(trimmed);
          } catch {
            return trimmed; // Return as string if parse fails
          }
        }
        // For comma-separated values, convert to array
        if (trimmed.includes(',')) {
          return trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }
        return trimmed; // Single value as string
      };

      const result = await updateEventAction(currentId, {
        title: data.title,
        slug: shouldUpdateSlug ? newSlug : undefined,
        content: cleanValue(data.content),
        status: data.status,
        featuredImage: cleanValue(data.featuredImageUrl),
        altTexts: parseJsonbField(data.altTexts),
        categories: parseJsonbField(data.categories),
        locations: parseJsonbField(data.locations),
        organizers: parseJsonbField(data.organizers),
        language: (data.language as "en" | "fi" | "ar") || "en",
        authorName: cleanValue(data.authorName),
      });

      if (result.success) {
        toast.success("Event updated successfully");
        router.push("/admin/events");
      } else {
        toast.error(result.error || "Failed to update event");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!event || !currentId) return;

    // Navigate to admin event detail page
    router.push(`/admin/events/${currentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading event...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Event
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button asChild>
          <Link href="/admin/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Event Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The event you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-600">Update event: {event.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <EventForm
        event={event}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Event"
        submittingLabel="Updating..."
      />
    </div>
  );
}
