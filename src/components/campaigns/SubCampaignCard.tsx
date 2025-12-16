"use client";

import { motion } from "framer-motion";
import {
  Target,
  Flag,
  Users,
  BookOpen,
  Megaphone,
  HandHeart,
  Lightbulb,
  Palette,
  Leaf,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

// Local campaign interface for this component
interface CampaignBase {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  campaignType?: string | null;
  status?: string | null;
  sectionType?: string | null;
  iconName?: string | null;
  featuredImageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  _count?: { updates: number; translations: number; subCampaigns: number };
}

type Campaign = CampaignBase;

// Icon mapping based on sectionType or iconName
const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Flag,
  about: BookOpen,
  issues: Target,
  plan: Lightbulb,
  cta: Megaphone,
  contact: Users,
  // Campaign type icons
  awareness: Megaphone,
  advocacy: Megaphone,
  fundraising: HandHeart,
  community_building: Users,
  education: BookOpen,
  solidarity: HandHeart,
  humanitarian: HandHeart,
  political: Flag,
  cultural: Palette,
  environmental: Leaf,
};

const SECTION_COLORS: Record<string, string> = {
  hero: "from-[#781D32] to-[#5a1626]",
  about: "from-[#55613C] to-[#3e442b]",
  issues: "from-amber-600 to-amber-700",
  plan: "from-blue-600 to-blue-700",
  cta: "from-[#781D32] to-[#55613C]",
  contact: "from-gray-600 to-gray-700",
};

interface SubCampaignCardProps {
  campaign: Campaign & {
    _count?: {
      updates: number;
      translations: number;
      subCampaigns: number;
    };
  };
  index: number;
  onClick?: () => void;
  variant?: "card" | "timeline" | "compact";
}

export function SubCampaignCard({
  campaign,
  index,
  onClick,
  variant = "card",
}: SubCampaignCardProps) {
  const IconComponent =
    SECTION_ICONS[campaign.sectionType ?? ""] ||
    SECTION_ICONS[campaign.campaignType ?? ""] ||
    Target;

  const colorClass =
    SECTION_COLORS[campaign.sectionType ?? ""] || "from-[#55613C] to-[#3e442b]";

  if (variant === "timeline") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="relative pl-8 pb-8 last:pb-0"
      >
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-linear-to-b from-[#781D32] to-[#55613C]" />

        {/* Timeline dot */}
        <div
          className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-linear-to-br ${colorClass} flex items-center justify-center ring-4 ring-white shadow-md`}
        >
          <IconComponent className="w-3 h-3 text-white" />
        </div>

        {/* Content */}
        <Card
          className="ml-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
          onClick={onClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-[#3e442b] group-hover:text-[#781D32] transition-colors">
                {campaign.title}
              </h3>
              {campaign.sectionType && (
                <Badge
                  variant="secondary"
                  className="bg-[#55613C]/10 text-[#55613C]"
                >
                  {campaign.sectionType}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-2">
              {campaign.description}
            </p>
            <div className="mt-3 flex items-center text-sm text-[#781D32] font-medium">
              <span>Learn more</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#781D32]/30 hover:bg-[#f4f3f0]/50 cursor-pointer transition-all group"
        onClick={onClick}
      >
        <div
          className={`w-10 h-10 rounded-lg bg-linear-to-br ${colorClass} flex items-center justify-center shrink-0`}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[#3e442b] truncate group-hover:text-[#781D32] transition-colors">
            {campaign.title}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            {campaign.description}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#781D32] group-hover:translate-x-1 transition-all shrink-0" />
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card
        className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group h-full"
        onClick={onClick}
      >
        {/* Colored header */}
        <div
          className={`h-24 bg-linear-to-r ${colorClass} relative overflow-hidden`}
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 w-20 h-20 border-4 border-white rounded-full" />
            <div className="absolute bottom-2 left-2 w-12 h-12 border-4 border-white rounded-full" />
          </div>

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Number badge */}
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-[#3e442b] group-hover:text-[#781D32] transition-colors line-clamp-2">
              {campaign.title}
            </h3>
          </div>

          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {campaign.description}
          </p>

          <div className="flex items-center justify-between">
            {campaign.sectionType && (
              <Badge
                variant="outline"
                className="border-[#55613C]/30 text-[#55613C]"
              >
                {campaign.sectionType}
              </Badge>
            )}
            <div className="flex items-center text-sm text-[#781D32] font-medium group-hover:underline">
              <span>Explore</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
