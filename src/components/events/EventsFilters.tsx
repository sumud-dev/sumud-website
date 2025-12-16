"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
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
import type { EventFilters, EventType, EventLocationMode } from "@/src/lib/types/event";
import { EVENT_TYPES, EVENT_LOCATION_MODES } from "@/src/lib/types/event";

export interface EventsFiltersProps {
  filters: EventFilters;
  searchInput: string;
  showUpcomingOnly: boolean;
  selectedDate: Date | null;
  activeFiltersCount: number;
  onFilterChange: (
    key: keyof EventFilters,
    value: string | boolean | undefined
  ) => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onUpcomingToggle: () => void;
  onClearFilters: () => void;
  onDateClear: () => void;
}

/**
 * Desktop filters section for the events page.
 * Contains search input, type/location dropdowns, and active filter badges.
 */
export function EventsFilters({
  filters,
  searchInput,
  showUpcomingOnly,
  selectedDate,
  activeFiltersCount,
  onFilterChange,
  onSearchChange,
  onSearch,
  onUpcomingToggle,
  onClearFilters,
  onDateClear,
}: EventsFiltersProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section className="hidden md:block relative py-8 border-b-2 border-[#2D3320]/30 overflow-hidden bg-linear-to-r from-[#F8F6F0] to-white shadow-sm w-full">
      <div className="absolute inset-0 glass-subtle gpu-accelerated opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full relative"
      >
        {/* Centered content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Full-width layout with proper spacing for search and filters */}
          <div className="flex items-center gap-6 w-full">
            {/* Desktop Search */}
            <form onSubmit={handleSubmit} className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#781D32]" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchInput}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 border-2 border-[#2D3320]/40 focus:border-[#781D32] focus:ring-2 focus:ring-[#781D32]/30 transition-all duration-200 focus:scale-105 text-[#1A1D14] font-medium placeholder:text-[#3E442B]/60 shadow-sm"
                />
              </div>
            </form>

            {/* Desktop Filter Controls */}
            <div className="flex items-center gap-4 shrink-0">
              <Filter className="h-5 w-5 text-[#781D32]" />
              <Select
                value={filters.eventType || "all"}
                onValueChange={(value) => onFilterChange("eventType", value)}
              >
                <SelectTrigger className="w-52 border-2 border-[#2D3320]/40 focus:border-[#781D32] focus:ring-2 focus:ring-[#781D32]/30 text-[#1A1D14] font-medium shadow-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    All Types
                  </SelectItem>
                  {Object.entries(EVENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="font-medium">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.locationMode || "all"}
                onValueChange={(value) => onFilterChange("locationMode", value)}
              >
                <SelectTrigger className="w-52 border-2 border-[#2D3320]/40 focus:border-[#781D32] focus:ring-2 focus:ring-[#781D32]/30 text-[#1A1D14] font-medium shadow-sm">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    All Locations
                  </SelectItem>
                  {Object.entries(EVENT_LOCATION_MODES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="font-medium">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters - Enhanced Badges */}
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-[#2D3320]/20"
            >
              <span className="text-sm text-[#1A1D14] font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Active filters:
              </span>
              {searchInput.trim() && (
                <Badge
                  variant="secondary"
                  className="bg-[#781D32] text-white hover:bg-[#5E1727] cursor-pointer font-semibold px-3 py-1.5 border-2 border-white/30 shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => onSearchChange("")}
                >
                  Search: &quot;{searchInput.trim()}&quot;
                  <X className="h-3 w-3 ml-1.5" />
                </Badge>
              )}
              {filters.eventType && (
                <Badge
                  variant="secondary"
                  className="bg-[#2D3320] text-white hover:bg-[#1A1D14] cursor-pointer font-semibold px-3 py-1.5 border-2 border-white/30 shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => onFilterChange("eventType", "all")}
                >
                  {EVENT_TYPES[filters.eventType as EventType]}
                  <X className="h-3 w-3 ml-1.5" />
                </Badge>
              )}
              {filters.locationMode && (
                <Badge
                  variant="secondary"
                  className="bg-[#2D3320] text-white hover:bg-[#1A1D14] cursor-pointer font-semibold px-3 py-1.5 border-2 border-white/30 shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => onFilterChange("locationMode", "all")}
                >
                  {EVENT_LOCATION_MODES[filters.locationMode as EventLocationMode]}
                  <X className="h-3 w-3 ml-1.5" />
                </Badge>
              )}
              {showUpcomingOnly && (
                <Badge
                  variant="secondary"
                  className="bg-[#781D32] text-white hover:bg-[#5E1727] cursor-pointer font-semibold px-3 py-1.5 border-2 border-white/30 shadow-md transition-all duration-200 hover:scale-105"
                  onClick={onUpcomingToggle}
                >
                  Upcoming Only
                  <X className="h-3 w-3 ml-1.5" />
                </Badge>
              )}
              {selectedDate && (
                <Badge
                  variant="secondary"
                  className="bg-[#781D32] text-white hover:bg-[#5E1727] cursor-pointer font-semibold px-3 py-1.5 border-2 border-white/30 shadow-md transition-all duration-200 hover:scale-105"
                  onClick={onDateClear}
                >
                  Date: {selectedDate.toLocaleDateString()}
                  <X className="h-3 w-3 ml-1.5" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 text-sm text-[#781D32] hover:text-white hover:bg-[#781D32] font-semibold border border-[#781D32]/40 transition-all duration-200"
              >
                Clear All
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
