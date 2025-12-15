"use client";

import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";

// Lazy load scroll reveal components
const ScrollReveal = lazy(() =>
  import("@/src/components/ui/scroll-reveals").then((m) => ({
    default: m.ScrollReveal,
  }))
);
const TypewriterOnScroll = lazy(() =>
  import("@/src/components/ui/scroll-reveals").then((m) => ({
    default: m.TypewriterOnScroll,
  }))
);

export interface EventsEmptyStateProps {
  selectedDate: Date | null;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

// Floating emoji icons for the empty state
const FLOATING_EMOJIS = ["🤝", "📅", "🌍", "✊", "💪", "🎯", "🌱", "⭐"];

/**
 * Empty state component for when no events match the current filters.
 * Includes encouraging message and animated floating elements.
 */
export function EventsEmptyState({
  selectedDate,
  hasActiveFilters,
  onClearFilters,
}: EventsEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center py-16 relative bg-gradient-to-br from-[#F8F6F0] to-white rounded-2xl border-2 border-[#2D3320]/20 shadow-lg"
    >
      {/* Animated calendar icon */}
      <motion.div
        animate={{
          y: [-5, 5, -5],
          rotate: [0, 2, -2, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-[#781D32]/20 to-[#2D3320]/20 rounded-full flex items-center justify-center shadow-xl border-2 border-[#781D32]/30">
          <motion.span
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📅
          </motion.span>
        </div>
      </motion.div>

      <Suspense fallback={<div className="h-20" />}>
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="h-7 w-7 text-[#781D32]" />
            <h3 className="text-3xl font-bold text-[#1A1D14]">
              <TypewriterOnScroll
                text={
                  selectedDate
                    ? "Let's find events for another date!"
                    : "Great events are coming soon!"
                }
                speed={80}
              />
            </h3>
          </div>
          <p className="text-[#3E442B] mb-8 max-w-md mx-auto font-medium text-lg">
            {selectedDate
              ? "Our community is always organizing. Try a different date or explore our growing network of events."
              : "We're continuously adding new ways to connect and take action. Check back soon or adjust your search."}
          </p>
        </ScrollReveal>
      </Suspense>

      <Suspense fallback={<div className="h-16" />}>
        <ScrollReveal direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasActiveFilters && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onClearFilters}
                  className="bg-[#781D32] text-white hover:bg-[#5E1727] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-base px-6 py-6 border-2 border-white/30"
                >
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-2 inline-block"
                  >
                    🔄
                  </motion.span>
                  Clear Filters & Explore
                </Button>
              </motion.div>
            )}

            <motion.p
              className="text-sm text-[#3E442B] italic font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              &ldquo;Every gathering strengthens our solidarity movement.&rdquo;
            </motion.p>
          </div>
        </ScrollReveal>
      </Suspense>

      {/* Floating emoji elements */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute w-10 h-10 opacity-20 pointer-events-none"
          style={{
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </motion.div>
  );
}
