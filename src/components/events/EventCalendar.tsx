"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import type { BaseEvent } from "@/src/lib/types/event";
import { 
  getEventTypeColor,
  getEventTypeHexColor,
  EVENT_TYPES, 
  formatEventDate,
  isEventUpcoming
} from "@/src/lib/types/event";

interface EventCalendarProps {
  events: BaseEvent[];
  selectedDate?: Date | null;
  onDateSelect: (date: Date | null) => void;
  compact?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: BaseEvent[];
  hasUpcomingEvents: boolean;
  eventCount: number;
}

export function EventCalendar({
  events,
  selectedDate,
  onDateSelect,
  compact = false,
}: EventCalendarProps) {
  const t = useTranslations("events");
  // Initialize with a fixed date to avoid hydration mismatch
  const [currentDate, setCurrentDate] = useState(() => {
    // Use a stable initial date
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Update to actual current date after mount to avoid hydration issues
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Helper to get local date string (YYYY-MM-DD) for consistent comparison
  const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to get event start date from various possible field names
  const getEventStartDate = (event: BaseEvent): string | undefined => {
    // Check all possible date field names (API returns different formats)
    return event.start_date || event.startDate || event.date || event.startAt;
  };

  // Get events grouped by date (using local date for consistency)
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, BaseEvent[]> = {};
    events.forEach((event) => {
      // Parse the event date and get local date key
      const dateStr = getEventStartDate(event);
      if (!dateStr) return; // Skip events without a date
      const eventDate = new Date(dateStr);
      if (isNaN(eventDate.getTime())) return; // Skip invalid dates
      const dateKey = getLocalDateKey(eventDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const todayKey = getLocalDateKey(new Date());
    const selectedKey = selectedDate ? getLocalDateKey(selectedDate) : null;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateKey = getLocalDateKey(d);
      const dayEvents = eventsByDate[dateKey] || [];
      const upcomingEvents = dayEvents.filter(event => isEventUpcoming(getEventStartDate(event)));

      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === month,
        isToday: dateKey === todayKey,
        isSelected: selectedKey ? dateKey === selectedKey : false,
        events: dayEvents,
        hasUpcomingEvents: upcomingEvents.length > 0,
        eventCount: dayEvents.length,
      });
    }

    return days;
  }, [currentDate, eventsByDate, selectedDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isSelected) {
      onDateSelect(null);
    } else {
      onDateSelect(day.date);
    }
  };

  const getTodaysEvents = () => {
    const today = getLocalDateKey(new Date());
    return eventsByDate[today] || [];
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    const dateKey = getLocalDateKey(selectedDate);
    return eventsByDate[dateKey] || [];
  };

  const getHoveredDateEvents = () => {
    if (!hoveredDate) return [];
    const dateKey = getLocalDateKey(hoveredDate);
    return eventsByDate[dateKey] || [];
  };

  const monthNames = [
    t("calendar.january"),
    t("calendar.february"),
    t("calendar.march"),
    t("calendar.april"),
    t("calendar.may"),
    t("calendar.june"),
    t("calendar.july"),
    t("calendar.august"),
    t("calendar.september"),
    t("calendar.october"),
    t("calendar.november"),
    t("calendar.december"),
  ];

  const dayNames = [
    t("calendar.sunday"),
    t("calendar.monday"),
    t("calendar.tuesday"),
    t("calendar.wednesday"),
    t("calendar.thursday"),
    t("calendar.friday"),
    t("calendar.saturday"),
  ];

  return (
    <div className="w-full space-y-4">
      <Card className="border-[#55613C]/20 shadow-lg">
        <CardHeader className={`${compact ? 'pb-2' : 'pb-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#781D32]" />
              <CardTitle className="text-lg font-bold text-[#3E442B]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 p-0 border-[#55613C]/20 hover:bg-[#55613C]/10 hover:border-[#55613C]/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0 border-[#55613C]/20 hover:bg-[#55613C]/10 hover:border-[#55613C]/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-[#55613C] py-2 uppercase tracking-wide"
              >
                {compact ? day.charAt(0) : day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <motion.button
                key={index}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoveredDate(day.date)}
                onMouseLeave={() => setHoveredDate(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative h-12 w-full rounded-lg border-2 transition-all duration-200 group
                  ${
                    day.isCurrentMonth
                      ? "hover:shadow-md border-transparent hover:border-[#55613C]/30"
                      : "text-gray-300 border-transparent"
                  }
                  ${
                    day.isToday
                      ? "bg-linear-to-br from-[#55613C]/10 to-[#55613C]/5 border-[#55613C]/40 font-bold text-[#3E442B] shadow-sm"
                      : "bg-white hover:bg-gray-50"
                  }
                  ${
                    day.isSelected
                      ? "bg-linear-to-br from-[#781D32] to-[#781D32]/90 text-white border-[#781D32] shadow-lg"
                      : ""
                  }
                  ${
                    day.hasUpcomingEvents && !day.isSelected
                      ? "ring-2 ring-[#781D32]/20"
                      : ""
                  }
                `}
              >
                <span className={`text-sm ${day.isSelected ? 'font-bold' : day.isToday ? 'font-semibold' : ''}`}>
                  {day.date.getDate()}
                </span>

                {/* Event indicators */}
                {day.events.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    {day.eventCount <= 3 ? (
                      <div className="flex gap-0.5">
                        {day.events.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                              day.isSelected ? 'opacity-80' : ''
                            }`}
                            style={{
                              backgroundColor: day.isSelected 
                                ? 'white' 
                                : getEventTypeHexColor(event.event_type),
                            }}
                            title={`${event.title}${event.event_type ? ` (${(EVENT_TYPES as any)[event.event_type]})` : ''}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        day.isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-[#781D32] text-white'
                      }`}>
                        {day.eventCount}
                      </div>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {!compact && (
            <>
              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-[#55613C]/10">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-[#3E442B] font-medium">{t("calendar.eventTypes")}</span>
                  {Object.entries(EVENT_TYPES).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{
                          backgroundColor: getEventTypeHexColor(
                            key as keyof typeof EVENT_TYPES,
                          ),
                        }}
                      />
                      <span className="text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Event Preview for Selected/Hovered Date */}
      <AnimatePresence>
        {(selectedDate || hoveredDate) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-[#55613C]/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-[#781D32]" />
                  <h3 className="font-semibold text-[#3E442B]">
                    {selectedDate 
                      ? `${t("calendar.eventsOn")} ${selectedDate.toLocaleDateString()}`
                      : hoveredDate
                      ? `${t("calendar.eventsOn")} ${hoveredDate.toLocaleDateString()}`
                      : t("calendar.todaysEvents")
                    }
                  </h3>
                </div>
                
                {(() => {
                  const displayEvents = selectedDate 
                    ? getSelectedDateEvents() 
                    : hoveredDate 
                    ? getHoveredDateEvents()
                    : getTodaysEvents();
                  
                  if (displayEvents.length === 0) {
                    return (
                      <p className="text-gray-500 text-sm italic">
                        {t("calendar.noEventsScheduled")}
                      </p>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      {displayEvents.slice(0, 3).map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: getEventTypeHexColor(event.event_type),
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#3E442B] line-clamp-1">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatEventDate(getEventStartDate(event))}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-[#55613C]/20 text-[#55613C]"
                          >
                            {event.event_type ? (EVENT_TYPES as any)[event.event_type] : t("card.event")}
                          </Badge>
                        </motion.div>
                      ))}
                      
                      {displayEvents.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{displayEvents.length - 3} {t("calendar.moreEvents")}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}