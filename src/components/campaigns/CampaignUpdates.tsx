"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Award,
  Megaphone,
  Video,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { type CampaignUpdate } from "@/src/lib/types";

interface CampaignUpdatesProps {
  updates: CampaignUpdate[];
  campaignTitle?: string;
}

interface UpdateWithParsedContent extends CampaignUpdate {
  parsedContent?: {
    summary?: string;
    details?: string;
    links?: Array<{ title: string; url: string }>;
    images?: Array<{ url: string; caption?: string }>;
    metrics?: Record<string, any>;
  };
}

export function CampaignUpdates({
  updates,
  campaignTitle,
}: CampaignUpdatesProps) {
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(
    new Set(),
  );
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const toggleExpanded = (updateId: string) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(updateId)) {
      newExpanded.delete(updateId);
    } else {
      newExpanded.add(updateId);
    }
    setExpandedUpdates(newExpanded);
  };

  const parseUpdateContent = (
    update: CampaignUpdate,
  ): UpdateWithParsedContent => {
    try {
      // Try to parse content as JSON for rich content
      const content = update.content;
      if (content.startsWith("{")) {
        const parsed = JSON.parse(content);
        return { ...update, parsedContent: parsed };
      }
    } catch (e) {
      // If parsing fails, treat as plain text
    }
    return { ...update };
  };

  const getUpdateTypeIcon = (updateType: string = "announcement") => {
    const icons = {
      progress: TrendingUp,
      milestone: Award,
      announcement: Megaphone,
      media: Video,
      event: Calendar,
    };
    return icons[updateType as keyof typeof icons] || FileText;
  };

  const getUpdateTypeColor = (updateType: string = "announcement") => {
    const colors = {
      progress: "#10B981", // Green
      milestone: "#F59E0B", // Amber
      announcement: "#3B82F6", // Blue
      media: "#8B5CF6", // Purple
      event: "#EF4444", // Red
    };
    return colors[updateType as keyof typeof colors] || "#6B7280";
  };

  const getUpdateTypeLabel = (updateType: string = "announcement") => {
    const labels = {
      progress: "Progress Update",
      milestone: "Milestone Reached",
      announcement: "Announcement",
      media: "Media Coverage",
      event: "Event Update",
    };
    return labels[updateType as keyof typeof labels] || "Update";
  };

  const sortedUpdates = [...updates]
    .map(parseUpdateContent)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const displayedUpdates = showAllUpdates
    ? sortedUpdates
    : sortedUpdates.slice(0, 5);

  if (updates.length === 0) {
    return (
      <Card className="border border-[#55613C]/20">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Updates Yet
          </h3>
          <p className="text-gray-400">
            Campaign updates will appear here as they become available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#55613C]/20">
        <CardHeader>
          <CardTitle className="text-xl text-[#3E442B] flex items-center">
            <Clock className="h-6 w-6 mr-2 text-[#781D32]" />
            Campaign Updates
            <Badge variant="secondary" className="ml-2">
              {updates.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {displayedUpdates.map((update, index) => {
                const Icon = getUpdateTypeIcon(update.update_type);
                const typeColor = getUpdateTypeColor(update.update_type);
                const isExpanded = expandedUpdates.has(update.id);
                const hasRichContent = update.parsedContent;

                return (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline line */}
                    {index < displayedUpdates.length - 1 && (
                      <div
                        className="absolute left-6 top-14 w-px h-full bg-gray-200"
                        style={{ height: "calc(100% - 2rem)" }}
                      />
                    )}

                    <Card className="border border-gray-200 hover:border-[#55613C]/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          {/* Icon */}
                          <div
                            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${typeColor}20` }}
                          >
                            <Icon
                              className="h-6 w-6"
                              style={{ color: typeColor }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-[#3E442B] mb-1">
                                  {update.title}
                                </h4>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <Badge
                                    variant="secondary"
                                    className="text-white text-xs"
                                    style={{ backgroundColor: typeColor }}
                                  >
                                    {getUpdateTypeLabel(update.update_type)}
                                  </Badge>
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(
                                      update.created_at,
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  {update.author && (
                                    <span className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {update.author}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {(hasRichContent ||
                                update.content.length > 200) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpanded(update.id)}
                                  className="ml-2 text-[#55613C] hover:text-[#781D32]"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      More
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                              {hasRichContent ? (
                                // Rich content
                                <div className="space-y-3">
                                  {update.parsedContent?.summary && (
                                    <p className="text-gray-700 leading-relaxed">
                                      {update.parsedContent.summary}
                                    </p>
                                  )}

                                  {isExpanded &&
                                    update.parsedContent?.details && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                      >
                                        <Separator />
                                        <div className="prose prose-sm max-w-none">
                                          <div
                                            className="text-gray-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                update.parsedContent.details.replace(
                                                  /\n/g,
                                                  "<br>",
                                                ),
                                            }}
                                          />
                                        </div>

                                        {/* Metrics */}
                                        {update.parsedContent?.metrics && (
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                            {Object.entries(
                                              update.parsedContent.metrics,
                                            ).map(([key, value]) => (
                                              <div
                                                key={key}
                                                className="text-center p-3 bg-gray-50 rounded-lg"
                                              >
                                                <div className="text-lg font-bold text-[#781D32]">
                                                  {typeof value === "number"
                                                    ? value.toLocaleString()
                                                    : value}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                  {key.replace(/_/g, " ")}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Links */}
                                        {update.parsedContent?.links &&
                                          update.parsedContent.links.length >
                                            0 && (
                                            <div className="space-y-2">
                                              <h5 className="font-medium text-[#3E442B]">
                                                Related Links:
                                              </h5>
                                              <div className="space-y-1">
                                                {update.parsedContent.links.map(
                                                  (link, linkIndex) => (
                                                    <a
                                                      key={linkIndex}
                                                      href={link.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center text-[#55613C] hover:text-[#781D32] text-sm"
                                                    >
                                                      <ExternalLink className="h-4 w-4 mr-2" />
                                                      {link.title}
                                                    </a>
                                                  ),
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {/* Images */}
                                        {update.parsedContent?.images &&
                                          update.parsedContent.images.length >
                                            0 && (
                                            <div className="space-y-2">
                                              <h5 className="font-medium text-[#3E442B]">
                                                Images:
                                              </h5>
                                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {update.parsedContent.images.map(
                                                  (image, imageIndex) => (
                                                    <div
                                                      key={imageIndex}
                                                      className="space-y-1"
                                                    >
                                                      <img
                                                        src={image.url}
                                                        alt={
                                                          image.caption ||
                                                          "Campaign update image"
                                                        }
                                                        className="w-full h-24 object-cover rounded-lg"
                                                      />
                                                      {image.caption && (
                                                        <p className="text-xs text-gray-500">
                                                          {image.caption}
                                                        </p>
                                                      )}
                                                    </div>
                                                  ),
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </motion.div>
                                    )}
                                </div>
                              ) : (
                                // Plain text content
                                <div className="space-y-3">
                                  <p className="text-gray-700 leading-relaxed">
                                    {isExpanded
                                      ? update.content
                                      : update.content.length > 200
                                        ? `${update.content.substring(0, 200)}...`
                                        : update.content}
                                  </p>

                                  {isExpanded &&
                                    update.content.length > 200 && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <Separator />
                                        <p className="text-gray-700 leading-relaxed">
                                          {update.content.substring(200)}
                                        </p>
                                      </motion.div>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Show More/Less Button */}
            {updates.length > 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllUpdates(!showAllUpdates)}
                  className="border-[#55613C]/20 text-[#55613C] hover:bg-[#55613C]/10"
                >
                  {showAllUpdates ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show All {updates.length} Updates
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
