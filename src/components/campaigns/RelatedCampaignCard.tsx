"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/src/i18n/navigation";
import { Clock, Users, ArrowRight, TrendingUp, Target } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils/utils";

interface RelatedCampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    image: string;
    category: string;
    status: "active" | "urgent" | "completed";
    raised: number;
    goal: number;
    supporters: number;
    daysLeft: number;
  };
  index: number;
  formatCurrency: (amount: number) => string;
}

const STATUS_CONFIG = {
  urgent: {
    label: "Urgent",
    color: "bg-red-500 text-white",
    icon: Clock,
  },
  active: {
    label: "Active",
    color: "bg-green-500 text-white",
    icon: TrendingUp,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500 text-white",
    icon: Target,
  },
};

export default function RelatedCampaignCard({
  campaign,
  index,
  formatCurrency,
}: RelatedCampaignCardProps) {
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const StatusIcon = STATUS_CONFIG[campaign.status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/campaigns/${campaign.slug}`}>
        <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <Badge
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm border-0 flex items-center gap-1.5",
                  STATUS_CONFIG[campaign.status].color,
                )}
              >
                <StatusIcon className="w-3 h-3" />
                {STATUS_CONFIG[campaign.status].label}
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg border-0">
                {campaign.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#781D32] transition-colors">
              {campaign.title}
            </h3>

            {/* Short Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {campaign.shortDescription}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#781D32] to-[#55613C] rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(campaign.raised)} raised
                </span>
                <span className="text-gray-600">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200/60">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{campaign.supporters} supporters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{campaign.daysLeft}d left</span>
              </div>
            </div>

            {/* CTA */}
            <Button className="w-full bg-[#06c] hover:bg-[#0077ed] text-white rounded-full h-11 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 group">
              View Campaign
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
