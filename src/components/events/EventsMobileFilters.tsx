"use client";

import React, { Suspense, lazy, useState, useEffect } from "react";
import { Calendar, SlidersHorizontal, Search, Sparkles } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import type { EventFilters } from "@/src/lib/types/event";
import { EVENT_TYPES, EVENT_LOCATION_MODES } from "@/src/lib/types/event";
import type { BaseEvent } from "@/src/lib/types/event";

// Lazy load calendar component
const EventCalendar = lazy(() =>
  import("@/src/components/events/EventCalendar").then((m) => ({
    default: m.EventCalendar,
  }))
);

export interface EventsMobileFiltersProps {
  filters: EventFilters;
  searchInput: string;
  showUpcomingOnly: boolean;
  selectedDate: Date | null;
  activeFiltersCount: number;
  events: BaseEvent[];
  showMobileCalendar: boolean;
  showMobileFilters: boolean;
  eventsCount: number;
  isLoading: boolean;
  onMobileCalendarChange: (open: boolean) => void;
  onMobileFiltersChange: (open: boolean) => void;
  onFilterChange: (
    key: keyof EventFilters,
    value: string | boolean | undefined
  ) => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onUpcomingToggle: () => void;
  onDateSelect: (date: Date | null) => void;
  onClearFilters: () => void;
}

/**
 * Mobile filters bar and sheets for the events page.
 * Provides calendar and filter sheets for mobile devices.
 */
export function EventsMobileFilters({
  filters,
  searchInput,
  showUpcomingOnly,
  selectedDate,
  activeFiltersCount,
  events,
  showMobileCalendar,
  showMobileFilters,
  eventsCount,
  isLoading,
  onMobileCalendarChange,
  onMobileFiltersChange,
  onFilterChange,
  onSearchChange,
  onSearch,
  onUpcomingToggle,
  onDateSelect,
  onClearFilters,
}: EventsMobileFiltersProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch for Sheet components
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="md:hidden sticky top-16 z-40 bg-white border-b-2 border-[#2D3320]/30 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Calendar Sheet */}
            {mounted && (
              <Sheet open={showMobileCalendar} onOpenChange={onMobileCalendarChange}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-2 border-[#2D3320]/40 text-[#1A1D14] hover:bg-[#781D32] hover:text-white hover:border-[#781D32] font-medium transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]">
                  <SheetHeader>
                    <SheetTitle className="text-[#1A1D14] text-xl font-bold">
                      Event Calendar
                    </SheetTitle>
                    <SheetDescription className="text-[#3E442B] font-medium">
                      Select a date to view events
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <Suspense fallback={<div>Loading calendar...</div>}>
                      <EventCalendar
                        events={events}
                        selectedDate={selectedDate}
                        onDateSelect={(date) => {
                          onDateSelect(date);
                          onMobileCalendarChange(false);
                        }}
                      />
                    </Suspense>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Filters Sheet */}
            {mounted && (
              <Sheet open={showMobileFilters} onOpenChange={onMobileFiltersChange}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-2 border-[#2D3320]/40 text-[#1A1D14] hover:bg-[#781D32] hover:text-white hover:border-[#781D32] font-medium transition-all duration-200"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 bg-[#781D32] text-white text-xs px-2 py-0.5 font-bold border border-white/30 shadow-md">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-[#1A1D14] text-xl font-bold">
                    Filter Events
                  </SheetTitle>
                  <SheetDescription className="text-[#3E442B] font-medium">
                    Customize your event search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Mobile Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1D14]">
                      Search Events
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search events..."
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                        className="flex-1 border-2 border-[#2D3320]/40 focus:border-[#781D32] focus:ring-2 focus:ring-[#781D32]/30 text-[#1A1D14] font-medium"
                      />
                      <Button
                        onClick={onSearch}
                        size="sm"
                        className="bg-[#781D32] hover:bg-[#5E1727] text-white font-semibold shadow-md"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Filters */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#1A1D14]">
                        Event Type
                      </label>
                      <Select
                        value={filters.eventType || "all"}
                        onValueChange={(value) =>
                          onFilterChange("eventType", value)
                        }
                      >
                        <SelectTrigger className="border-2 border-[#2D3320]/40 focus:border-[#781D32] text-[#1A1D14] font-medium">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="font-medium">
                            All Types
                          </SelectItem>
                          {Object.entries(EVENT_TYPES).map(([key, label]) => (
                            <SelectItem
                              key={key}
                              value={key}
                              className="font-medium"
                            >
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#1A1D14]">
                        Location
                      </label>
                      <Select
                        value={filters.locationMode || "all"}
                        onValueChange={(value) =>
                          onFilterChange("locationMode", value)
                        }
                      >
                        <SelectTrigger className="border-2 border-[#2D3320]/40 focus:border-[#781D32] text-[#1A1D14] font-medium">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="font-medium">
                            All Locations
                          </SelectItem>
                          {Object.entries(EVENT_LOCATION_MODES).map(
                            ([key, label]) => (
                              <SelectItem
                                key={key}
                                value={key}
                                className="font-medium"
                              >
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant={showUpcomingOnly ? "default" : "outline"}
                        size="sm"
                        onClick={onUpcomingToggle}
                        className={
                          showUpcomingOnly
                            ? "bg-[#781D32] text-white hover:bg-[#5E1727] w-full font-semibold border-2 border-[#781D32] shadow-md"
                            : "border-2 border-[#2D3320]/40 hover:bg-[#781D32]/10 w-full font-medium text-[#1A1D14]"
                        }
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Upcoming Only
                      </Button>
                      <Button
                        variant={filters.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onFilterChange("featured", !filters.featured)
                        }
                        className={
                          filters.featured
                            ? "bg-[#781D32] text-white hover:bg-[#5E1727] w-full font-semibold border-2 border-[#781D32] shadow-md"
                            : "border-2 border-[#2D3320]/40 hover:bg-[#781D32]/10 w-full font-medium text-[#1A1D14]"
                        }
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Featured Events
                      </Button>
                    </div>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onClearFilters();
                          onMobileFiltersChange(false);
                        }}
                        className="w-full text-[#781D32] hover:bg-[#781D32]/10 font-semibold border border-[#781D32]/30"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            )}
          </div>

          <div className="text-sm text-[#1A1D14] font-bold bg-[#781D32]/10 px-3 py-1.5 rounded-full border border-[#781D32]/30">
            {!isLoading && `${eventsCount} events`}
          </div>
        </div>
      </div>
    </div>
  );
}
