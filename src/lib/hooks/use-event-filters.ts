'use client';

import { useState, useCallback, useMemo } from 'react';
import type { EventFilters } from '@/src/lib/react-query/query-keys';

interface UseEventFiltersReturn {
  filters: EventFilters;
  searchInput: string;
  showUpcomingOnly: boolean;
  selectedDate: Date | null;
  activeFiltersCount: number;
  showMobileCalendar: boolean;
  showMobileFilters: boolean;
  setSearchInput: (value: string) => void;
  setShowUpcomingOnly: (value: boolean) => void;
  setSelectedDate: (date: Date | null) => void;
  setShowMobileCalendar: (value: boolean) => void;
  setShowMobileFilters: (value: boolean) => void;
  handleFilterChange: (key: keyof EventFilters, value: string | boolean | undefined) => void;
  handleSearch: () => void;
  handleDateSelect: (date: Date | null) => void;
  handleClearFilters: () => void;
  handlePageChange: (page: number) => void;
}

/**
 * Custom hook for managing event filter state
 * Centralizes all filter-related state and handlers
 */
export function useEventFilters(): UseEventFiltersReturn {
  // Filter state
  const [filters, setFilters] = useState<EventFilters>({
    status: 'published',
    page: 1,
    limit: 12,
  });
  
  // Search input (separate from filters for debouncing)
  const [searchInput, setSearchInput] = useState('');
  
  // Toggle states
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Mobile UI states
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.eventType) count++;
    if (filters.locationMode) count++;
    if (filters.search) count++;
    if (filters.featured) count++;
    if (showUpcomingOnly) count++;
    if (selectedDate) count++;
    return count;
  }, [filters, showUpcomingOnly, selectedDate]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof EventFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  }, []);

  // Handle search submission
  const handleSearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: searchInput.trim() || undefined,
      page: 1,
    }));
  }, [searchInput]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setFilters(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // Handle clearing all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      status: 'published',
      page: 1,
      limit: 12,
    });
    setSearchInput('');
    setShowUpcomingOnly(false);
    setSelectedDate(null);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  }, []);

  return {
    filters,
    searchInput,
    showUpcomingOnly,
    selectedDate,
    activeFiltersCount,
    showMobileCalendar,
    showMobileFilters,
    setSearchInput,
    setShowUpcomingOnly,
    setSelectedDate,
    setShowMobileCalendar,
    setShowMobileFilters,
    handleFilterChange,
    handleSearch,
    handleDateSelect,
    handleClearFilters,
    handlePageChange,
  };
}
