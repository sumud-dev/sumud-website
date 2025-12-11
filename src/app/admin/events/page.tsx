"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Play,
  Archive,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { StatsCard } from "@/src/components/cards";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  getEvents,
  deleteEvent,
  updateEventStatus,
  type Event,
  type EventStatus,
} from "@/src/actions/events.actions";
import { calculateEventStats } from "@/src/lib/utils/event.utils";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

// Truncate text to a specified number of words
const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch events on mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const { data, error } = await getEvents();
      if (error) {
        toast.error(`Failed to load events: ${error}`);
      } else if (data) {
        setEvents(data);
      }
      setIsLoading(false);
    };
    fetchEvents();
  }, []);

  // Filter events based on search
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.locations?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.categories?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, events]);

  // Calculate stats from actual data
  const stats = React.useMemo(() => calculateEventStats(events), [events]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    const result = await deleteEvent(id);
    if (result.success) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success(`"${title}" deleted successfully`);
    } else {
      toast.error(result.error || "Failed to delete event");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: EventStatus,
    title: string
  ) => {
    const result = await updateEventStatus(id, newStatus);
    if (result.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(`"${title}" status updated to ${newStatus}`);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Events
          </h1>
          <p className="text-gray-600 mt-1">Manage your events and gatherings</p>
        </div>
        <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        <StatsCard
          title="Total Events"
          value={stats.total}
          icon={Calendar}
          iconClassName="text-muted-foreground"
        />
        <StatsCard
          title="Published"
          value={stats.published}
          icon={Play}
          iconClassName="text-green-500"
          valueClassName="text-green-600"
        />
        <StatsCard
          title="Drafts"
          value={stats.drafts}
          icon={FileText}
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
        />
        <StatsCard
          title="Archived"
          value={stats.archived}
          icon={Archive}
          iconClassName="text-gray-500"
          valueClassName="text-gray-600"
        />
      </div>

      {/* Events Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Event</TableHead>
                    <TableHead className="w-32">Published</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        Loading events...
                      </TableCell>
                    </TableRow>
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        No events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50/50">
                        <TableCell className="py-3 max-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {event.title || "Untitled"}
                          </p>
                          {event.content && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {truncateText(event.content, 10)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatDate(event.published_at)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge className={statusColors[event.status || "draft"] || statusColors.draft}>
                            {(event.status || "draft").charAt(0).toUpperCase() +
                              (event.status || "draft").slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {event.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      event.id,
                                      "published",
                                      event.title || "Untitled"
                                    )
                                  }
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {event.status === "published" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      event.id,
                                      "archived",
                                      event.title || "Untitled"
                                    )
                                  }
                                >
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              {event.status === "archived" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      event.id,
                                      "draft",
                                      event.title || "Untitled"
                                    )
                                  }
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Move to Draft
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(event.id, event.title || "Untitled")
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsPage;
