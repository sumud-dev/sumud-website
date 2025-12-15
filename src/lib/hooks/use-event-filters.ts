"use client";

import { useState, useMemo, useCallback } from "react";
import type { EventFilters } from "@/src/lib/types/event";

export interface UseEventFiltersOptions {
  initialFilters?: Partial<EventFilters>;
  defaultLimit?: number;
}

export interface UseEventFiltersReturn {
  // State
  filters: EventFilters;
  searchInput: string;
  showUpcomingOnly: boolean;
  selectedDate: Date | null;
  showMobileCalendar: boolean;
  showMobileFilters: boolean;
  activeFiltersCount: number;

  // Setters
  setSearchInput: (value: string) => void;
  setShowUpcomingOnly: (value: boolean) => void;
  setSelectedDate: (date: Date | null) => void;
  setShowMobileCalendar: (open: boolean) => void;
  setShowMobileFilters: (open: boolean) => void;

  // Handlers
  handleFilterChange: (
    key: keyof EventFilters,
    value: string | boolean | undefined
  ) => void;
  handleSearch: () => void;
  handleClearFilters: () => void;
  handleDateSelect: (date: Date | null) => void;
  handlePageChange: (page: number) => void;
}

/**
 * Custom hook for managing event filter state and handlers.
 * Extracts filter logic from the events page for better maintainability.
 */
export function useEventFilters(
  options: UseEventFiltersOptions = {}
): UseEventFiltersReturn {
  const { initialFilters, defaultLimit = 12 } = options;

  // Filter state
  const [filters, setFilters] = useState<EventFilters>({
    status: "published",
    page: 1,
    limit: defaultLimit,
    ...initialFilters,
  });

  // Search state
  const [searchInput, setSearchInput] = useState("");

  // Toggle states
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mobile sheet states
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchInput.trim()) count++;
    if (filters.eventType) count++;
    if (filters.locationMode) count++;
    if (showUpcomingOnly) count++;
    if (selectedDate) count++;
    if (filters.featured) count++;
    return count;
  }, [searchInput, filters, showUpcomingOnly, selectedDate]);

  // Handler: Update a specific filter
  const handleFilterChange = useCallback(
    (key: keyof EventFilters, value: string | boolean | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1, // Reset to first page when filtering
      }));
    },
    []
  );

  // Handler: Trigger search (resets page)
  const handleSearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // Handler: Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "published",
      page: 1,
      limit: defaultLimit,
    });
    setSearchInput("");
    setShowUpcomingOnly(false);
    setSelectedDate(null);
  }, [defaultLimit]);

  // Handler: Select a date
  const handleDateSelect = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // Handler: Change page
  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    // State
    filters,
    searchInput,
    showUpcomingOnly,
    selectedDate,
    showMobileCalendar,
    showMobileFilters,
    activeFiltersCount,

    // Setters
    setSearchInput,
    setShowUpcomingOnly,
    setSelectedDate,
    setShowMobileCalendar,
    setShowMobileFilters,

    // Handlers
    handleFilterChange,
    handleSearch,
    handleClearFilters,
    handleDateSelect,
    handlePageChange,
  };
}
