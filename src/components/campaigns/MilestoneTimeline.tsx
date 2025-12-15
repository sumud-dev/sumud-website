"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Check, Lock } from "lucide-react";
import { cn } from "@/src/lib/utils/utils";

interface MilestoneTimelineProps {
  milestones: Array<{
    amount: number;
    description: string;
    achieved: boolean;
  }>;
  formatCurrency: (amount: number) => string;
}

export default function MilestoneTimeline({
  milestones,
  formatCurrency,
}: MilestoneTimelineProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#06c]/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-[#06c]" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900">
          Campaign Milestones
        </h2>
      </div>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#781D32] via-[#55613C] to-gray-200" />

        {/* Milestones */}
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Icon */}
              <div
                className={cn(
                  "absolute left-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                  milestone.achieved
                    ? "bg-gradient-to-br from-[#781D32] to-[#55613C] text-white"
                    : "bg-white border-2 border-gray-300 text-gray-400",
                )}
              >
                {milestone.achieved ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "p-6 rounded-2xl transition-all duration-300",
                  milestone.achieved
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
                    : "bg-[#f5f5f7] border-2 border-gray-200",
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      milestone.achieved ? "text-green-700" : "text-gray-700",
                    )}
                  >
                    {formatCurrency(milestone.amount)}
                  </span>
                  {milestone.achieved && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                      Achieved
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    milestone.achieved ? "text-green-900" : "text-gray-700",
                  )}
                >
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
