"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ArrowRight,
  Users,
  Heart,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import type { Campaign } from "@/src/types/Campaigns";

interface CampaignCardProps {
  campaign: Campaign;
  size?: "default" | "featured";
}

export default function CampaignCard({
  campaign,
  size = "default",
}: CampaignCardProps) {
  const getCampaignTypeColor = (type: string) => {
    const colors = {
      awareness: "#3E442B",
      advocacy: "#781D32",
      fundraising: "#55613C",
      community_building: "#781D32",
      education: "#3E442B",
      solidarity: "#781D32",
      humanitarian: "#55613C",
      political: "#781D32",
      cultural: "#3E442B",
      environmental: "#55613C",
    };
    return colors[type as keyof typeof colors] || "#55613C";
  };

  const formatCampaignType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const calculateProgress = () => {
    if (
      campaign.campaignType === "fundraising" &&
      campaign.stats &&
      campaign.stats
    ) {
      const target = (campaign.stats as any)?.fundingGoal || 0;
      const current = (campaign.stats as any)?.fundsRaised || 0;
      return target > 0 ? Math.min((current / target) * 100, 100) : 0;
    }

    if (campaign.stats && campaign.stats) {
      const target =
        (campaign.stats as any)?.participantTarget ||
        (campaign.stats as any)?.signatureTarget ||
        0;
      const current =
        (campaign.stats as any)?.participants ||
        (campaign.stats as any)?.signatures ||
        0;
      return target > 0 ? Math.min((current / target) * 100, 100) : 0;
    }

    return 0;
  };

  const getProgressStats = () => {
    if (campaign.campaignType === "fundraising") {
      const current = (campaign.stats as any)?.fundsRaised || 0;
      const target = (campaign.stats as any)?.fundingGoal || 0;
      return {
        current: `$${current.toLocaleString()}`,
        target: target > 0 ? `$${target.toLocaleString()}` : null,
        label: "raised",
        icon: DollarSign,
      };
    }

    const participants =
      (campaign.stats as any)?.participants || 0;
    const signatures = (campaign.stats as any)?.signatures || 0;
    const current = participants || signatures;
    const target =
      (campaign.stats as any)?.participantTarget ||
      (campaign.stats as any)?.signatureTarget ||
      0;

    return {
      current: current.toLocaleString(),
      target: target > 0 ? target.toLocaleString() : null,
      label: participants > 0 ? "supporters" : "signatures",
      icon: Users,
    };
  };

  const getDaysLeft = () => {
    if (!campaign.endDate) return null;
    const now = new Date();
    const end = new Date(campaign.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const typeColor = getCampaignTypeColor(campaign.campaignType || 'awareness');
  const progress = calculateProgress();
  const stats = getProgressStats();
  const daysLeft = getDaysLeft();
  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const isNearGoal = progress >= 80;
  const isFeatured = size === "featured";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className={`h-full overflow-hidden border-2 border-[#55613C]/10 hover:border-[#781D32]/30 transition-all duration-300 group ${isFeatured ? "ring-2 ring-[#781D32]/20" : ""}`}
      >
        {/* Featured Image */}
        <div
          className={`relative ${isFeatured ? "h-64" : "h-48"} overflow-hidden`}
        >
          {campaign.featuredImage ? (
            <Image
              src={campaign.featuredImage}
              alt={campaign.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${typeColor}20` }}
            >
              <Target className="h-12 w-12" style={{ color: typeColor }} />
            </div>
          )}

          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {/* Campaign Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              className="text-white border-white/20"
              style={{ backgroundColor: typeColor }}
            >
              {formatCampaignType(campaign.campaignType || 'awareness')}
            </Badge>
          </div>

          {/* Status Badges */}
          {(isUrgent || isNearGoal || isFeatured) && (
            <div className="absolute top-3 right-3 space-y-1">
              {isFeatured && (
                <Badge className="bg-[#781D32] text-white">Featured</Badge>
              )}
              {isUrgent && (
                <Badge className="bg-red-500 text-white flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {isNearGoal && (
                <Badge className="bg-green-500 text-white flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Near Goal
                </Badge>
              )}
            </div>
          )}

          {/* Progress Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <stats.icon className="h-4 w-4 mr-1" />
                  <span className="font-medium">{stats.current}</span>
                  <span className="ml-1 opacity-90">{stats.label}</span>
                </div>
                {progress > 0 && (
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                )}
              </div>

              {progress > 0 && (
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex-1">
            <h3
              className={`font-bold ${isFeatured ? "text-xl" : "text-lg"} text-[#3E442B] mb-3 line-clamp-2 group-hover:text-[#781D32] transition-colors`}
            >
              {campaign.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {typeof campaign.description === 'string' 
                ? campaign.description 
                : campaign.description && typeof campaign.description === 'object' && 'data' in campaign.description
                ? (typeof campaign.description.data === 'string' ? campaign.description.data : '')
                : ''}
            </p>

            {/* Stats Row */}
            <div className="space-y-3 mb-6">
              {/* Progress Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center" style={{ color: typeColor }}>
                  <stats.icon className="h-4 w-4 mr-2" />
                  <span className="font-medium">{stats.current}</span>
                  <span className="text-gray-500 ml-1">{stats.label}</span>
                </div>

                {stats.target && (
                  <div className="text-gray-500">
                    Goal:{" "}
                    <span className="font-medium text-[#3E442B]">
                      {stats.target}
                    </span>
                  </div>
                )}
              </div>

              {/* Time Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Started{" "}
                    {campaign.startDate || campaign.createdAt
                      ? new Date(campaign.startDate || campaign.createdAt!).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>

                {daysLeft !== null && (
                  <div
                    className={`flex items-center ${isUrgent ? "text-red-600" : "text-gray-500"}`}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-medium">
                      {daysLeft === 0 ? "Last day!" : `${daysLeft}d left`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="mb-6">
                <Progress
                  value={progress}
                  className="h-2"
                  style={{
                    // @ts-expect-error Custom CSS properties for progress bar styling
                    "--progress-background": `${typeColor}20`,
                    "--progress-foreground": typeColor,
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            asChild
            size={isFeatured ? "lg" : "default"}
            className="w-full text-white group"
            style={{ backgroundColor: typeColor }}
          >
            <Link href={`/campaigns/${campaign.slug}`}>
              <span>
                {campaign.campaignType === "fundraising" ? (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Support Campaign
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Join Campaign
                  </>
                )}
              </span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
