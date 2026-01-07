"use client";

import React, { Suspense, lazy, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useEvents } from "@/src/lib/hooks/use-events";
import { useEventFilters } from "@/src/lib/hooks/use-event-filters";
import { useCelebration } from "@/src/components/ui/celebration";
import { usePage } from "@/src/lib/hooks/use-pages";
import { fadeInUp, staggerContainer } from "@/src/lib/utils/animations";
import type { EventsHeroContent } from "@/src/components/events/EventsHero";

// Lazy load components for better performance
const EventCard = lazy(() =>
  import("@/src/components/events/EventCard").then((m) => ({
    default: m.EventCard,
  }))
);
const EventCalendar = lazy(() =>
  import("@/src/components/events/EventCalendar").then((m) => ({
    default: m.EventCalendar,
  }))
);
const CulturalEasterEggs = lazy(() =>
  import("@/src/components/ui/cultural-easter-eggs").then((m) => ({
    default: m.CulturalEasterEggs,
  }))
);
const Celebration = lazy(() =>
  import("@/src/components/ui/celebration").then((m) => ({
    default: m.Celebration,
  }))
);

// Lazy load extracted event components
const EventsHero = lazy(() =>
  import("@/src/components/events/EventsHero").then((m) => ({
    default: m.EventsHero,
  }))
);
const EventsFilters = lazy(() =>
  import("@/src/components/events/EventsFilters").then((m) => ({
    default: m.EventsFilters,
  }))
);
const EventsMobileFilters = lazy(() =>
  import("@/src/components/events/EventsMobileFilters").then((m) => ({
    default: m.EventsMobileFilters,
  }))
);
const EventsQuickActions = lazy(() =>
  import("@/src/components/events/EventsQuickActions").then((m) => ({
    default: m.EventsQuickActions,
  }))
);
const EventsEmptyState = lazy(() =>
  import("@/src/components/events/EventsEmptyState").then((m) => ({
    default: m.EventsEmptyState,
  }))
);
const EventsPagination = lazy(() =>
  import("@/src/components/events/EventsPagination").then((m) => ({
    default: m.EventsPagination,
  }))
);
const EventsSkeletonLoader = lazy(() =>
  import("@/src/components/events/EventsSkeletonLoader").then((m) => ({
    default: m.EventsSkeletonLoader,
  }))
);
const EventsResultsSummary = lazy(() =>
  import("@/src/components/events/EventsResultsSummary").then((m) => ({
    default: m.EventsResultsSummary,
  }))
);

export default function EventsPage() {
  const locale = useLocale();
  // Use the custom hook for all filter state management
  const filterState = useEventFilters();
  const { celebration, completeCelebration } = useCelebration();
  
  // Fetch page builder content for events page
  const { data: pageData } = usePage("events");
  
  // Extract localized content from page builder
  const pageContent = useMemo(() => {
    if (!pageData) return null;
    
    // Get the text block with locale-nested content
    const textBlock = pageData.translations.en?.blocks?.find(
      (b) => b.id === "events-page-text"
    );
    const heroBlock = pageData.translations.en?.blocks?.find(
      (b) => b.id === "events-page-hero"
    );
    
    // Extract locale-specific content
    const textContent = (textBlock?.content as { content?: Record<string, Record<string, string>> })?.content;
    const heroContent = (heroBlock?.content as { content?: Record<string, { title: string; subtitle?: string; description: string }> })?.content;
    
    const localeKey = locale as "en" | "fi" | "ar";
    
    return {
      hero: heroContent?.[localeKey] || heroContent?.en,
      text: textContent?.[localeKey] || textContent?.en,
    };
  }, [pageData, locale]);
  
  // Build hero content from page builder
  const heroContent: EventsHeroContent | undefined = useMemo(() => {
    if (!pageContent?.hero || !pageContent?.text) return undefined;
    return {
      title: pageContent.hero.title,
      subtitle: pageContent.hero.subtitle,
      description: pageContent.hero.description,
      eventsLabel: pageContent.text.eventsLabel || "events",
      globalVirtualLabel: pageContent.text.globalVirtualLabel || "Global & Virtual",
      communityDrivenLabel: pageContent.text.communityDrivenLabel || "Community Driven",
    };
  }, [pageContent]);

  // Helper to format date in local timezone as YYYY-MM-DD
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch all events for calendar display (no date filtering, larger limit)
  const { data: calendarEventsResponse } = useEvents({
    status: "published",
    limit: 100, // Get more events for calendar display
  });

  const calendarEvents = calendarEventsResponse?.data || [];

  // Fetch events with current filters
  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useEvents({
    ...filterState.filters,
    upcoming: filterState.showUpcomingOnly,
    search: filterState.searchInput.trim() || undefined,
    startDate: filterState.selectedDate
      ? formatLocalDate(filterState.selectedDate)
      : undefined,
    endDate: filterState.selectedDate
      ? formatLocalDate(filterState.selectedDate)
      : undefined,
  });

  const events = eventsResponse?.data || [];
  const pagination = eventsResponse?.pagination;

  // Error state
  if (error) {
    const failedText = pageContent?.text?.failedToLoad || "Failed to load events";
    const tryAgainText = pageContent?.text?.tryAgain || "Try Again";
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-8 text-center">
              <p className="text-red-700 font-semibold mb-4 text-lg">
                {failedText}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#781D32] text-white hover:bg-[#5E1727] font-medium"
              >
                {tryAgainText}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <CulturalEasterEggs>
        <>
          {/* Hero Section */}
          <Suspense fallback={<div className="h-64 bg-[#2D3320]" />}>
            <EventsHero
              totalEvents={pagination?.total || 0}
              isLoading={isLoading}
              content={heroContent}
            />
          </Suspense>

          {/* Mobile Filter Bar */}
          <Suspense fallback={null}>
            <EventsMobileFilters
              filters={filterState.filters}
              searchInput={filterState.searchInput}
              showUpcomingOnly={filterState.showUpcomingOnly}
              selectedDate={filterState.selectedDate}
              activeFiltersCount={filterState.activeFiltersCount}
              events={calendarEvents}
              showMobileCalendar={filterState.showMobileCalendar}
              showMobileFilters={filterState.showMobileFilters}
              eventsCount={events.length}
              isLoading={isLoading}
              onMobileCalendarChange={filterState.setShowMobileCalendar}
              onMobileFiltersChange={filterState.setShowMobileFilters}
              onFilterChange={filterState.handleFilterChange}
              onSearchChange={filterState.setSearchInput}
              onSearch={filterState.handleSearch}
              onUpcomingToggle={() =>
                filterState.setShowUpcomingOnly(!filterState.showUpcomingOnly)
              }
              onDateSelect={filterState.handleDateSelect}
              onClearFilters={filterState.handleClearFilters}
            />
          </Suspense>

          {/* Desktop Filters Section */}
          <Suspense fallback={null}>
            <EventsFilters
              filters={filterState.filters}
              searchInput={filterState.searchInput}
              showUpcomingOnly={filterState.showUpcomingOnly}
              selectedDate={filterState.selectedDate}
              activeFiltersCount={filterState.activeFiltersCount}
              onFilterChange={filterState.handleFilterChange}
              onSearchChange={filterState.setSearchInput}
              onSearch={filterState.handleSearch}
              onUpcomingToggle={() =>
                filterState.setShowUpcomingOnly(!filterState.showUpcomingOnly)
              }
              onClearFilters={filterState.handleClearFilters}
              onDateClear={() => filterState.setSelectedDate(null)}
            />
          </Suspense>

          {/* Main Content Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Desktop Calendar Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Suspense fallback={<div>Loading calendar...</div>}>
                      <EventCalendar
                        events={calendarEvents}
                        selectedDate={filterState.selectedDate}
                        onDateSelect={filterState.handleDateSelect}
                      />
                    </Suspense>

                    <Suspense fallback={null}>
                      <EventsQuickActions
                        showUpcomingOnly={filterState.showUpcomingOnly}
                        isFeatured={!!filterState.filters.featured}
                        selectedDate={filterState.selectedDate}
                        onUpcomingToggle={() =>
                          filterState.setShowUpcomingOnly(
                            !filterState.showUpcomingOnly
                          )
                        }
                        onFeaturedToggle={() =>
                          filterState.handleFilterChange(
                            "featured",
                            !filterState.filters.featured
                          )
                        }
                        onDateClear={() => filterState.setSelectedDate(null)}
                      />
                    </Suspense>
                  </motion.div>
                </div>

                {/* Events List */}
                <div className="lg:col-span-2">
                  {/* Results Summary */}
                  <Suspense fallback={null}>
                    <EventsResultsSummary
                      selectedDate={filterState.selectedDate}
                      isLoading={isLoading}
                      eventsCount={events.length}
                      totalCount={pagination?.total || 0}
                    />
                  </Suspense>

                  {/* Events Grid */}
                  {isLoading ? (
                    <Suspense fallback={<div>Loading...</div>}>
                      <EventsSkeletonLoader />
                    </Suspense>
                  ) : events.length === 0 ? (
                    <Suspense fallback={null}>
                      <EventsEmptyState
                        selectedDate={filterState.selectedDate}
                        hasActiveFilters={filterState.activeFiltersCount > 0}
                        onClearFilters={filterState.handleClearFilters}
                      />
                    </Suspense>
                  ) : (
                    <>
                      <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                      >
                        {events.map((event) => (
                          <motion.div
                            key={event.id}
                            variants={fadeInUp}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="transform transition-all duration-200"
                          >
                            <Suspense fallback={<div>Loading event...</div>}>
                              <EventCard
                                event={event}
                                showRegistration={true}
                                showSocialActions={true}
                                showCapacityIndicator={true}
                                className="h-full rounded-2xl border-2 border-[#2D3320]/20 hover:border-[#781D32] hover:shadow-2xl transition-all duration-200"
                              />
                            </Suspense>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Pagination */}
                      <Suspense fallback={null}>
                        <EventsPagination
                          pagination={pagination}
                          onPageChange={filterState.handlePageChange}
                        />
                      </Suspense>

                      {/* Results Summary Footer */}
                      {events.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="text-center mt-8 text-sm text-[#3E442B] font-semibold bg-[#F8F6F0] py-3 px-6 rounded-full inline-block border border-[#2D3320]/20"
                        >
                          {pageContent?.text?.showingText || "Showing"}{" "}
                          {((pagination?.page || 1) - 1) *
                            (pagination?.limit || 12) +
                            1}{" "}
                          to{" "}
                          {Math.min(
                            (pagination?.page || 1) * (pagination?.limit || 12),
                            pagination?.total || 0
                          )}{" "}
                          {pageContent?.text?.ofText || "of"} {pagination?.total || 0} {pageContent?.text?.eventsText || "events"}
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Global Celebration Component */}
          <Suspense fallback={null}>
            <Celebration
              show={celebration.show}
              type={celebration.type}
              message={celebration.message}
              count={celebration.count}
              onComplete={completeCelebration}
            />
          </Suspense>
        </>
      </CulturalEasterEggs>
    </Suspense>
  );
}
