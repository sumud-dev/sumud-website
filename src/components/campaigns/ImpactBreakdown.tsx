"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift, Check } from "lucide-react";

interface ImpactBreakdownProps {
  donationBreakdown: Array<{
    amount: number;
    provides: string;
  }>;
  formatCurrency: (amount: number) => string;
}

export default function ImpactBreakdown({
  donationBreakdown,
  formatCurrency,
}: ImpactBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#55613C]/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-[#55613C]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          What Your Donation Provides
        </h3>
      </div>
      <div className="space-y-3">
        {donationBreakdown.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-[#f5f5f7] hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#55613C] flex items-center justify-center mt-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {formatCurrency(item.amount)}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {item.provides}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
