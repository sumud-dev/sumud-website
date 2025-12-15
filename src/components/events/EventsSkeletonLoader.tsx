"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/src/components/ui/card";

/**
 * Optimized skeleton loader for events grid.
 * Displays 6 placeholder cards with animated pulse effect.
 */
export const EventsSkeletonLoader = React.memo(function EventsSkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 * index }}
        >
          <Card className="h-full overflow-hidden border border-[#2D3320]/20 shadow-md">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-full" />
              </div>
              <div className="h-6 w-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse" />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-gray-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});
