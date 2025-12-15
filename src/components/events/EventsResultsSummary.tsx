"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";

export interface EventsResultsSummaryProps {
  selectedDate: Date | null;
  isLoading: boolean;
  eventsCount: number;
  totalCount: number;
}

/**
 * Results summary header for the events list.
 * Shows the current view title and count badge.
 */
export function EventsResultsSummary({
  selectedDate,
  isLoading,
  eventsCount,
  totalCount,
}: EventsResultsSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#2D3320]/20"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold text-[#1A1D14] drop-shadow-sm">
          {selectedDate
            ? `Events for ${selectedDate.toLocaleDateString()}`
            : "All Events"}
        </h2>
        {!isLoading && (
          <Badge className="bg-[#781D32] text-white font-bold text-base px-3 py-1.5 shadow-md border border-white/30">
            {totalCount} total
          </Badge>
        )}
      </div>

      {!isLoading && eventsCount > 0 && (
        <p className="text-[#3E442B] text-sm font-semibold bg-[#F8F6F0] px-3 py-1.5 rounded-full border border-[#2D3320]/20">
          Showing {eventsCount} of {totalCount}
          {selectedDate && ` for ${selectedDate.toLocaleDateString()}`}
        </p>
      )}
    </motion.div>
  );
}
