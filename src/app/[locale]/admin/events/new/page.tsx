"use client";

import * as React from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { EventForm, type EventFormData } from "@/src/components/forms/event-form";
import { createEvent } from "@/src/actions/events.actions";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      const { success, error, id } = await createEvent({
        title: data.title,
        content: data.content,
        status: data.status,
        featured_image: data.featuredImageUrl || undefined,
        alt_texts: data.altTexts || undefined,
        categories: data.categories || undefined,
        locations: data.locations || undefined,
        organizers: data.organizers || undefined,
        language: data.language || "en",
        author_name: data.authorName || undefined,
      });

      if (!success) {
        throw new Error(error || "Failed to create event");
      }

      toast.success("Event created successfully!");

      if (id) {
        router.push(`/admin/events/${id}`);
      } else {
        router.push("/admin/events");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create event. Please try again.",
      );
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
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Event</h1>
            <p className="text-gray-600">
              Create a new event for your community.
            </p>
          </div>
        </div>
      </div>

      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Event"
        submittingLabel="Creating..."
      />
    </div>
  );
}
