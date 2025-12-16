"use client";

import React, { useState, useMemo } from "react";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Search,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Flag,
  Church,
  Megaphone,
  Target,
  TrendingUp,
  ArrowUpRight,
  Heart,
  Users,
  LucideIcon,
  Filter,
  Loader,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useCampaigns, Campaign } from "@/src/lib/hooks/use-campaigns";
import type { CampaignType } from "@/src/types/Campaigns";

// Campaign type colors matching real data
const campaignTypeColors: Record<CampaignType, string> = {
  awareness: "#059669", // emerald-600
  advocacy: "#dc2626", // red-600
  fundraising: "#ea580c", // orange-600
  community_building: "#16a34a", // green-600
  education: "#0891b2", // cyan-600
  solidarity: "#7c3aed", // violet-600
  humanitarian: "#db2777", // rose-600
  political: "#854d0e", // amber-700
  cultural: "#1e40af", // blue-700
  environmental: "#166534", // green-800
};

// Icon mapping for campaign types
const campaignIconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "shield-off": ShieldOff,
  "shopping-cart": ShoppingCart,
  flag: Flag,
  church: Church,
  megaphone: Megaphone,
};

// Campaign type labels for filtering - now handled by translations
const campaignTypes: CampaignType[] = [
  "awareness",
  "advocacy",
  "fundraising",
  "community_building",
  "education",
  "solidarity",
  "humanitarian",
  "political",
  "cultural",
  "environmental",
];

const SORT_OPTIONS = [
  { value: "featured", labelKey: "sort.featured" },
  { value: "recent", labelKey: "sort.recent" },
];

export default function CampaignsPage() {
  const t = useTranslations("campaignsPage");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Fetch campaigns from API
  const { data: campaignsResponse, isLoading, error } = useCampaigns({
    language: "en",
  });

  // Get campaigns from API response (already typed correctly)
  const campaigns = campaignsResponse?.data ?? [];

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    // Type filter
    if (selectedType !== "All") {
      filtered = filtered.filter((c) => c.campaign_type === selectedType);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query),
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        filtered = [...filtered].sort((a, b) => {
          return a.id.localeCompare(b.id);
        });
        break;
      case "featured":
      default:
        filtered = [...filtered].sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
    }

    return filtered;
  }, [selectedType, searchQuery, sortBy, campaigns]);

  const filterCategories = ["All", ...campaignTypes];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
        {/* Hero Section with Liquid Glass - Petitions Style */}
        <motion.section
          className="relative py-24 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient Background with Decorative Orbs */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#781D32] via-[#722F37] to-[#55613C]" />

          {/* Decorative Glass Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 right-[10%] w-72 h-72 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 248, 240, 0.15) 0%, rgba(255, 248, 240, 0) 70%)",
                filter: "blur(40px)",
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 left-[15%] w-96 h-96 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(107, 142, 35, 0.2) 0%, rgba(107, 142, 35, 0) 70%)",
                filter: "blur(50px)",
              }}
              animate={{
                y: [0, 30, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Dotted Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Glass Icon Container */}
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "0.5px solid rgba(255, 255, 255, 0.3)",
                  boxShadow:
                    "0 8px 16px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <Target className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                {t("hero.title")}
                <span className="block text-3xl lg:text-4xl font-medium opacity-90 mt-3">
                  {t("hero.subtitle")}
                </span>
              </h1>

              <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
                {t("hero.description")}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Search and Filters with Liquid Glass */}
        <motion.section
          className="py-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="backdrop-blur-xl rounded-3xl p-6"
              style={{
                background: "rgba(255, 255, 255, 0.90)",
                border: "0.5px solid rgba(232, 220, 196, 0.4)",
                boxShadow:
                  "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
              }}
            >
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t("search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 backdrop-blur-sm rounded-xl"
                    style={{
                      background: "rgba(255, 248, 240, 0.6)",
                      border: "0.5px solid rgba(232, 220, 196, 0.4)",
                    }}
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-center">
                  <Filter className="h-5 w-5 text-[#722F37]" />
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger
                      className="w-56 h-12 rounded-xl backdrop-blur-sm"
                      style={{
                        background: "rgba(255, 248, 240, 0.6)",
                        border: "0.5px solid rgba(232, 220, 196, 0.4)",
                      }}
                    >
                      <SelectValue placeholder={t("filters.allCampaigns")} />
                    </SelectTrigger>
                    <SelectContent>
                      {filterCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "All"
                            ? t("filters.allCampaigns")
                            : t(`types.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      className="w-48 h-12 rounded-xl backdrop-blur-sm"
                      style={{
                        background: "rgba(255, 248, 240, 0.6)",
                        border: "0.5px solid rgba(232, 220, 196, 0.4)",
                      }}
                    >
                      <SelectValue placeholder={t("filters.sortBy")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Campaigns Grid */}
        <motion.section
          className="py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
                  style={{
                    background: "rgba(120, 29, 50, 0.12)",
                    border: "0.5px solid rgba(120, 29, 50, 0.3)",
                  }}
                >
                  <Loader className="h-12 w-12 text-[#781D32] animate-spin" />
                </div>
                <h3 className="text-3xl font-bold text-[#3E442B] mb-3">
                  {t("loading.title")}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t("loading.message")}
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
                  style={{
                    background: "rgba(220, 38, 38, 0.12)",
                    border: "0.5px solid rgba(220, 38, 38, 0.3)",
                  }}
                >
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-3xl font-bold text-[#3E442B] mb-3">
                  {t("error.title")}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {error instanceof Error ? error.message : t("error.defaultMessage")}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="backdrop-blur-md rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "0.5px solid rgba(85, 97, 60, 0.3)",
                    color: "#55613C",
                  }}
                >
                  {t("error.tryAgain")}
                </Button>
              </motion.div>
            ) : filteredCampaigns.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
                  style={{
                    background: "rgba(107, 142, 35, 0.12)",
                    border: "0.5px solid rgba(107, 142, 35, 0.3)",
                  }}
                >
                  <Search className="h-12 w-12 text-[#6B8E23]" />
                </div>
                <h3 className="text-3xl font-bold text-[#3E442B] mb-3">
                  {t("search.noResults.title")}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {t("search.noResults.message")}
                </p>
                <Button
                  onClick={() => {
                    setSelectedType("All");
                    setSearchQuery("");
                  }}
                  className="backdrop-blur-md rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "0.5px solid rgba(85, 97, 60, 0.3)",
                    color: "#55613C",
                  }}
                >
                  {t("search.noResults.clearButton")}
                </Button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCampaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CampaignCard campaign={campaign} index={index} t={t} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Call to Action with Premium Glass */}
        <motion.section
          className="py-20 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#E8DCC4]/30 to-[#FFF8F0]" />

          {/* Decorative Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#781D32]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B8E23]/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div
              className="backdrop-blur-xl rounded-3xl p-12 text-center transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(212, 175, 55, 0.1) 100%)",
                border: "0.5px solid rgba(212, 175, 55, 0.4)",
                boxShadow:
                  "0 16px 40px rgba(212, 175, 55, 0.15), 0 8px 20px rgba(120, 29, 50, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 0 40px rgba(212, 175, 55, 0.08)",
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
                style={{
                  background: "rgba(120, 29, 50, 0.15)",
                  border: "0.5px solid rgba(120, 29, 50, 0.3)",
                }}
              >
                <Target className="h-10 w-10 text-[#781D32]" />
              </div>

              <h2 className="text-4xl font-bold text-[#3E442B] mb-4">
                {t("cta.title")}
              </h2>

              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
                {t("cta.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="backdrop-blur-md rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: "#781D32",
                    color: "white",
                    border: "0.5px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 12px rgba(120, 29, 50, 0.25)",
                  }}
                >
                  {t("cta.exploreButton")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  className="backdrop-blur-md rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300"
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "0.5px solid rgba(85, 97, 60, 0.3)",
                    color: "#55613C",
                  }}
                >
                  {t("cta.learnMoreButton")}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}

// Campaign Card Component - Standardized Layout
interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  t: ReturnType<typeof useTranslations<"campaignsPage">>;
}

function CampaignCard({ campaign, index, t }: CampaignCardProps) {
  const typeColor = campaignTypeColors[campaign.campaignType] || "#781D32";
  const CampaignIcon = campaignIconMap[campaign.iconName || "megaphone"] || Target;

  // Create gradient background for fallback
  const gradientStyle = {
    background: `linear-gradient(135deg, ${typeColor}15 0%, ${typeColor}05 100%)`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group h-full"
    >
      <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">

        {/* Content Section - Fixed Structure */}
        <div className="p-6 flex flex-col flex-1">
          {/* Title - Fixed Height with 2-line clamp */}
          <h3
            className="text-xl font-semibold text-gray-900 mb-4 line-clamp-2 h-14 leading-7"
            style={{
              color: `var(--hover-color, inherit)`,
            }}
            onMouseEnter={(e) =>
              e.currentTarget.style.setProperty("--hover-color", typeColor)
            }
            onMouseLeave={(e) =>
              e.currentTarget.style.removeProperty("--hover-color")
            }
          >
            {campaign.title}
          </h3>

          {/* Description - Fixed Height with 2-line clamp */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10 leading-5">
            {campaign.description}
          </p>

          {/* Stats Grid - Fixed Height */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200/60 h-16">
            <div className="flex items-center gap-2">
              <CampaignIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 capitalize truncate">
                  {t(`types.${campaign.campaign_type}`)}
                </div>
                <div className="text-xs text-gray-600">{t("card.campaignType")}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {campaign.is_featured ? t("card.featured") : t("card.active")}
                </div>
                <div className="text-xs text-gray-600">{t("card.priority")}</div>
              </div>
            </div>
          </div>

          {/* CTA Button - Fixed Height */}
          <Link href={`/campaigns/${campaign.slug}`} className="block mt-auto">
            <Button
              className="w-full text-white rounded-full h-11 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 group/btn"
              style={{
                backgroundColor: typeColor,
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = typeColor;
                target.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = typeColor;
                target.style.filter = "brightness(1)";
              }}
            >
              {t("card.learnMore")}
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
