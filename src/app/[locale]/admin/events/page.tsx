"use client";

import * as React from "react";
import { Link } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
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
  ChevronLeft,
  ChevronRight,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
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
  fetchAllEventsAdminAction,
  deleteEventAction,
  updateEventAction,
  type Event,
  type EventStatus,
} from "@/src/actions/events.actions";

const ITEMS_PER_PAGE = 16;

interface PaginationData {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

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
  const t = useTranslations("admin.events");
  const locale = useLocale() as "en" | "fi";
  const [searchQuery, setSearchQuery] = React.useState("");
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pagination, setPagination] = React.useState<PaginationData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; title: string } | null>(null);

  // Fetch events with pagination
  const fetchEvents = React.useCallback(async (page: number = 1) => {
    setIsLoading(true);
    const result = await fetchAllEventsAdminAction({ 
      locale, 
      page,
      limit: ITEMS_PER_PAGE,
    });
    if (result.success) {
      const data = result.data as { events: Event[]; pagination: PaginationData };
      setEvents(data.events);
      setPagination(data.pagination);
    } else {
      toast.error(t("loadEventsError", { error: result.error }));
    }
    setIsLoading(false);
  }, [locale]);

  // Fetch events on mount and when page changes
  React.useEffect(() => {
    fetchEvents(currentPage);
  }, [fetchEvents, currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter events based on search
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof event.locations === 'string' && event.locations.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (typeof event.categories === 'string' && event.categories.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, events]);

  // Calculate stats from pagination total
  const stats = React.useMemo(() => ({
    total: pagination?.total || events.length,
    published: events.filter((e) => e.status === "published").length,
    drafts: events.filter((e) => e.status === "draft").length,
    archived: events.filter((e) => e.status === "archived").length,
  }), [events, pagination]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    const result = await deleteEventAction(deleteConfirm.id);
    if (result.success) {
      toast.success(t("deleteSuccess", { title: deleteConfirm.title }));
      setDeleteConfirm(null);
      // Refetch to update pagination
      fetchEvents(currentPage);
    } else {
      toast.error(result.error || t("deleteError"));
    }
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: EventStatus,
    title: string
  ) => {
    const result = await updateEventAction(id, { status: newStatus });
    if (result.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(t("statusUpdateSuccess", { title, status: t(`status.${newStatus}`) }));
    } else {
      toast.error(result.error || t("statusUpdateError"));
    }
  };

  const formatDate = (dateInput: string | Date | null) => {
    if (!dateInput) return t("notAvailable");
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(locale, {
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
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("description")}</p>
        </div>
        <Button asChild className="bg-[#781D32] hover:bg-[#781D32]/90">
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("newButton")}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
        <StatsCard
          title={t("totalEvents")}
          value={stats.total}
          icon={Calendar}
          iconClassName="text-muted-foreground"
        />
        <StatsCard
          title={t("published")}
          value={stats.published}
          icon={Play}
          iconClassName="text-green-500"
          valueClassName="text-green-600"
        />
        <StatsCard
          title={t("drafts")}
          value={stats.drafts}
          icon={FileText}
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
        />
        <StatsCard
          title={t("archived")}
          value={stats.archived}
          icon={Archive}
          iconClassName="text-gray-500"
          valueClassName="text-gray-600"
        />
      </div>

      {/* Events Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{t("allEvents")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder={t("searchPlaceholder")}
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
                    <TableHead>{t("table.event")}</TableHead>
                    <TableHead className="w-32">{t("table.published")}</TableHead>
                    <TableHead className="w-24">{t("table.status")}</TableHead>
                    <TableHead className="w-16">{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        {t("loadingEvents")}
                      </TableCell>
                    </TableRow>
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        {t("noEventsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50/50">
                        <TableCell className="py-3 max-w-0">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="font-medium text-gray-900 truncate block hover:text-[#781D32] hover:underline transition-colors"
                          >
                            {event.title || t("untitledEvent")}
                          </Link>
                          {event.content && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {truncateText(event.content, 10)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatDate(event.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge className={statusColors[event.status || "draft"] || statusColors.draft}>
                            {t(`status.${event.status || "draft"}`)}
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
                                  {t("actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t("actions.edit")}
                                </Link>
                              </DropdownMenuItem>
                              {event.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      event.id,
                                      "published",
                                      event.title || t("untitledEvent")
                                    )
                                  }
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  {t("actions.publish")}
                                </DropdownMenuItem>
                              )}
                              {event.status === "published" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      event.id,
                                      "archived",
                                      event.title || t("untitledEvent")
                                    )
                                  }
                                >
                                  <Archive className="mr-2 h-4 w-4" />
                                  {t("actions.archive")}
                                </DropdownMenuItem>
                              )}
                              {event.status === "archived" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      event.id,
                                      "draft",
                                      event.title || t("untitledEvent")
                                    )
                                  }
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  {t("actions.moveToDraft")}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteConfirm({ id: event.id, title: event.title || t("untitledEvent") })
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("actions.delete")}
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

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-500">
                {t("showing", {
                  from: ((pagination.page - 1) * pagination.limit) + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={pageNum === currentPage ? "bg-[#781D32] hover:bg-[#781D32]/90" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteMessage", { title: deleteConfirm?.title ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventsPage;
