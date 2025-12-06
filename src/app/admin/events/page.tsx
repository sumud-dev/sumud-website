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
  Pause,
  Play,
  MapPin,
  Users,
  Video,
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
import { Event } from "@/src/types/Events";

// Mock data for UI display
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Community Solidarity Gathering",
    description:
      "Join us for an evening of community support, featuring speakers, cultural performances, and networking opportunities.",
    location: "Community Center Hall",
    address: "123 Main Street, City Center",
    eventDate: "2025-01-15",
    startTime: "18:00",
    endTime: "21:00",
    capacity: 200,
    attendees: 145,
    status: "upcoming",
    imageUrl: null,
    isOnline: false,
    onlineUrl: null,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-15T00:00:00Z",
  },
  {
    id: "2",
    title: "Fundraising Gala Dinner",
    description:
      "An elegant evening to raise funds for humanitarian aid, featuring a silent auction and live entertainment.",
    location: "Grand Hotel Ballroom",
    address: "456 Luxury Avenue",
    eventDate: "2025-02-14",
    startTime: "19:00",
    endTime: "23:00",
    capacity: 150,
    attendees: 150,
    status: "upcoming",
    imageUrl: null,
    isOnline: false,
    onlineUrl: null,
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-12-20T00:00:00Z",
  },
  {
    id: "3",
    title: "Virtual Awareness Webinar",
    description:
      "Online webinar discussing the current humanitarian situation and ways to help from anywhere in the world.",
    location: "Online Event",
    address: null,
    eventDate: "2025-01-20",
    startTime: "14:00",
    endTime: "16:00",
    capacity: 500,
    attendees: 320,
    status: "upcoming",
    imageUrl: null,
    isOnline: true,
    onlineUrl: "https://zoom.us/webinar/example",
    createdAt: "2024-12-10T00:00:00Z",
    updatedAt: "2024-12-18T00:00:00Z",
  },
  {
    id: "4",
    title: "Youth Volunteer Training",
    description:
      "Training session for young volunteers to learn about effective community service and humanitarian work.",
    location: "Youth Center",
    address: "789 Education Street",
    eventDate: "2024-12-20",
    startTime: "10:00",
    endTime: "15:00",
    capacity: 50,
    attendees: 48,
    status: "completed",
    imageUrl: null,
    isOnline: false,
    onlineUrl: null,
    createdAt: "2024-11-01T00:00:00Z",
    updatedAt: "2024-12-20T00:00:00Z",
  },
  {
    id: "5",
    title: "Cultural Heritage Exhibition",
    description:
      "Exhibition showcasing traditional art, crafts, and cultural artifacts to preserve and celebrate heritage.",
    location: "City Art Gallery",
    address: "321 Museum Road",
    eventDate: "2025-03-01",
    startTime: "09:00",
    endTime: "18:00",
    capacity: null,
    attendees: 0,
    status: "draft",
    imageUrl: null,
    isOnline: false,
    onlineUrl: null,
    createdAt: "2024-12-25T00:00:00Z",
    updatedAt: "2024-12-25T00:00:00Z",
  },
  {
    id: "6",
    title: "Emergency Relief Coordination Meeting",
    description:
      "Planning meeting for coordinating emergency relief efforts with partner organizations.",
    location: "Conference Room A",
    address: "Organization HQ",
    eventDate: "2024-11-15",
    startTime: "09:00",
    endTime: "12:00",
    capacity: 30,
    attendees: 25,
    status: "cancelled",
    imageUrl: null,
    isOnline: false,
    onlineUrl: null,
    createdAt: "2024-10-20T00:00:00Z",
    updatedAt: "2024-11-10T00:00:00Z",
  },
];

const statusColors: Record<Event["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  upcoming: "bg-blue-100 text-blue-800",
  ongoing: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter events based on search
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery) return mockEvents;
    return mockEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate stats from mock data
  const stats = React.useMemo(() => {
    const total = mockEvents.length;
    const upcoming = mockEvents.filter((e) => e.status === "upcoming").length;
    const drafts = mockEvents.filter((e) => e.status === "draft").length;
    const completed = mockEvents.filter((e) => e.status === "completed").length;
    return { total, upcoming, drafts, completed };
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    // TODO: Connect to backend
    toast.info(`Delete "${title}" - connect to backend`);
  };

  const handleStatusUpdate = (
    id: string,
    newStatus: Event["status"],
    title: string
  ) => {
    // TODO: Connect to backend
    toast.info(`Update "${title}" status to ${newStatus} - connect to backend`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
          <Link href="/events/new">
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
          title="Upcoming"
          value={stats.upcoming}
          icon={Play}
          iconClassName="text-blue-500"
          valueClassName="text-blue-600"
        />
        <StatsCard
          title="Drafts"
          value={stats.drafts}
          icon={Edit}
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={Calendar}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium flex items-center gap-2">
                            {event.title}
                            {event.isOnline && (
                              <Video className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          {event.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(event.eventDate)}
                          </div>
                          <div className="text-gray-500">
                            {formatTime(event.startTime)}
                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {event.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3 text-gray-400" />
                          {event.attendees}
                          {event.capacity && ` / ${event.capacity}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[event.status]}>
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/events/${event.id}`}
                                target="_blank"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {event.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    event.id,
                                    "upcoming",
                                    event.title
                                  )
                                }
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {event.status === "upcoming" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    event.id,
                                    "ongoing",
                                    event.title
                                  )
                                }
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Start Event
                              </DropdownMenuItem>
                            )}
                            {event.status === "ongoing" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    event.id,
                                    "completed",
                                    event.title
                                  )
                                }
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete(event.id, event.title)
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsPage;
