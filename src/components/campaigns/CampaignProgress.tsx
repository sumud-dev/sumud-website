"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Award,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { type Campaign } from "@/src/lib/types";

interface CampaignProgressProps {
  campaign: Campaign;
}

interface ProgressMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  formatter?: (value: number) => string;
}

export function CampaignProgress({ campaign }: CampaignProgressProps) {
  const progressData =
    (campaign.progress_indicators as Record<string, any>) || {};
  const targetData = (campaign.target_metrics as Record<string, any>) || {};

  const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
  const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
  const now = new Date();

  // Calculate time progress
  let timeProgress = 0;
  let daysLeft = null;
  let totalDays = null;

  if (startDate && endDate) {
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    timeProgress = Math.max(
      0,
      Math.min(100, (elapsedTime / totalDuration) * 100),
    );
    totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

    if (now < endDate) {
      daysLeft = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
  }

  // Define progress metrics
  const metrics: ProgressMetric[] = [];

  // Funding metrics
  if (targetData.funding_target) {
    metrics.push({
      label: "Funding Raised",
      current: progressData.current_funding || 0,
      target: targetData.funding_target,
      unit: "€",
      icon: DollarSign,
      color: "#10B981",
      formatter: (value) => `€${value.toLocaleString()}`,
    });
  }

  // Signature metrics
  if (targetData.signature_target) {
    metrics.push({
      label: "Signatures Collected",
      current: progressData.current_signatures || 0,
      target: targetData.signature_target,
      unit: "",
      icon: Users,
      color: "#3B82F6",
      formatter: (value) => value.toLocaleString(),
    });
  }

  // Participant metrics
  if (targetData.participant_target) {
    metrics.push({
      label: "Participants",
      current: progressData.current_participants || 0,
      target: targetData.participant_target,
      unit: "",
      icon: Users,
      color: "#8B5CF6",
      formatter: (value) => value.toLocaleString(),
    });
  }

  // Event metrics
  if (targetData.event_target) {
    metrics.push({
      label: "Events Organized",
      current: progressData.events_organized || 0,
      target: targetData.event_target,
      unit: "",
      icon: Calendar,
      color: "#F59E0B",
    });
  }

  // Awareness metrics (e.g., social media reach)
  if (targetData.reach_target) {
    metrics.push({
      label: "People Reached",
      current: progressData.current_reach || 0,
      target: targetData.reach_target,
      unit: "",
      icon: TrendingUp,
      color: "#EF4444",
      formatter: (value) => value.toLocaleString(),
    });
  }

  // Calculate overall progress
  const overallProgress =
    metrics.length > 0
      ? metrics.reduce((sum, metric) => {
          const progress = Math.min(
            100,
            (metric.current / metric.target) * 100,
          );
          return sum + progress;
        }, 0) / metrics.length
      : timeProgress;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#10B981"; // Green
    if (progress >= 75) return "#3B82F6"; // Blue
    if (progress >= 50) return "#F59E0B"; // Orange
    if (progress >= 25) return "#EF4444"; // Red
    return "#6B7280"; // Gray
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100)
      return { label: "Completed", color: "bg-green-100 text-green-800" };
    if (progress >= 75)
      return { label: "Excellent", color: "bg-blue-100 text-blue-800" };
    if (progress >= 50)
      return { label: "Good", color: "bg-orange-100 text-orange-800" };
    if (progress >= 25)
      return { label: "Fair", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Starting", color: "bg-gray-100 text-gray-800" };
  };

  const overallStatus = getProgressStatus(overallProgress);

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="border-2 border-[#55613C]/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-[#3E442B] flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-[#781D32]" />
              Campaign Progress
            </CardTitle>
            <Badge className={overallStatus.color}>{overallStatus.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: getProgressColor(overallProgress) }}
              >
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={overallProgress}
              className="h-3"
              style={{
                backgroundColor: `${getProgressColor(overallProgress)}20`,
              }}
            />
          </div>

          {/* Time Progress */}
          {startDate && endDate && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Progress
                </span>
                <span className="text-sm text-gray-600">
                  {daysLeft !== null
                    ? daysLeft > 0
                      ? `${daysLeft} days left`
                      : "Campaign ended"
                    : totalDays
                      ? `${totalDays} days total`
                      : ""}
                </span>
              </div>
              <Progress
                value={timeProgress}
                className="h-2"
                style={{ backgroundColor: "#E5E7EB" }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{startDate.toLocaleDateString()}</span>
                <span>{endDate.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Metrics */}
      {metrics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => {
            const progress = Math.min(
              100,
              (metric.current / metric.target) * 100,
            );
            const status = getProgressStatus(progress);

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-[#55613C]/20 hover:border-[#55613C]/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${metric.color}20` }}
                          >
                            <metric.icon
                              className="h-4 w-4"
                              style={{ color: metric.color }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {metric.label}
                            </p>
                            <Badge variant="secondary" className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[#3E442B]">
                            {metric.formatter
                              ? metric.formatter(metric.current)
                              : `${metric.current.toLocaleString()}${metric.unit}`}
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: metric.color }}
                          >
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        <Progress
                          value={progress}
                          className="h-2"
                          style={{ backgroundColor: `${metric.color}20` }}
                        />

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Current</span>
                          <span>
                            Goal:{" "}
                            {metric.formatter
                              ? metric.formatter(metric.target)
                              : `${metric.target.toLocaleString()}${metric.unit}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Achievements/Milestones */}
      {progressData.milestones && Array.isArray(progressData.milestones) && (
        <Card className="border border-[#55613C]/20">
          <CardHeader>
            <CardTitle className="text-lg text-[#3E442B] flex items-center">
              <Award className="h-5 w-5 mr-2 text-[#781D32]" />
              Milestones Achieved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {progressData.milestones.map((milestone: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">
                      {milestone.title}
                    </p>
                    <p className="text-sm text-green-600">
                      {milestone.description}
                    </p>
                    {milestone.date && (
                      <p className="text-xs text-green-500">
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
