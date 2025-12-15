"use client";

import * as React from "react";
import { useRouter, Link } from "@/src/i18n/navigation";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import {
  getEventById,
  updateEvent,
  type Event,
} from "@/src/actions/events.actions";
import { EventForm, type EventFormData } from "@/src/components/forms/event-form";

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

  // Resolve params and fetch event data
  React.useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);

        // Properly unwrap the params Promise
        const resolvedParams = await params;
        const eventId = resolvedParams.id;
        setCurrentId(eventId);

        const { data, error } = await getEventById(eventId);

        if (error) {
          console.error("Error fetching event:", error);
          toast.error("Failed to load event");
          router.push("/admin/events");
          return;
        }

        if (!data) {
          toast.error("Event not found");
          router.push("/admin/events");
          return;
        }

        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
        router.push("/admin/events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params, router]);

  const handleSubmit = async (data: EventFormData) => {
    if (!event) {
      console.error("No event loaded");
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

      const { success, error } = await updateEvent(event.id, {
        title: data.title,
        slug: shouldUpdateSlug ? newSlug : undefined,
        content: data.content,
        status: data.status,
        featured_image: data.featuredImageUrl,
        alt_texts: data.altTexts,
        categories: data.categories,
        locations: data.locations,
        organizers: data.organizers,
        language: data.language || "en",
        author_name: data.authorName,
      });

      if (error) {
        throw new Error(error);
      }

      if (success) {
        toast.success("Event updated successfully!");
        router.push("/admin/events");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update event. Please try again.",
      );
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
