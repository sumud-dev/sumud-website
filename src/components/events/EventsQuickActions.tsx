"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Calendar, Sparkles, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export interface EventsQuickActionsProps {
  showUpcomingOnly: boolean;
  isFeatured: boolean;
  selectedDate: Date | null;
  onUpcomingToggle: () => void;
  onFeaturedToggle: () => void;
  onDateClear: () => void;
}

/**
 * Quick actions sidebar card for the events page.
 * Provides toggles for upcoming/featured filters and selected date display.
 */
export function EventsQuickActions({
  showUpcomingOnly,
  isFeatured,
  selectedDate,
  onUpcomingToggle,
  onFeaturedToggle,
  onDateClear,
}: EventsQuickActionsProps) {
  const t = useTranslations("events");

  return (
    <Card className="mt-6 glass-cream blur-transition border-2 border-[#2D3320]/30 shadow-lg hover:shadow-xl gpu-accelerated rounded-xl transition-all duration-200">
      <CardHeader className="bg-linear-to-br from-[#F8F6F0] to-white border-b-2 border-[#2D3320]/20">
        <CardTitle className="flex items-center gap-2 text-lg text-[#1A1D14] font-bold">
          <Sparkles className="h-5 w-5 text-[#781D32]" />
          {t("quickActions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        <Button
          variant={showUpcomingOnly ? "default" : "outline"}
          size="sm"
          onClick={onUpcomingToggle}
          className={`w-full ${
            showUpcomingOnly
              ? "bg-[#781D32] text-white hover:bg-[#5E1727] border-2 border-[#781D32] shadow-md font-semibold"
              : "border-2 border-[#2D3320]/40 hover:bg-[#781D32]/10 hover:border-[#781D32]/50 text-[#1A1D14] font-medium"
          } transition-all duration-200`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {showUpcomingOnly ? t("quickActions.upcomingActive") : t("quickActions.upcoming")}
        </Button>
        <Button
          variant={isFeatured ? "default" : "outline"}
          size="sm"
          onClick={onFeaturedToggle}
          className={`w-full ${
            isFeatured
              ? "bg-[#781D32] text-white hover:bg-[#5E1727] border-2 border-[#781D32] shadow-md font-semibold"
              : "border-2 border-[#2D3320]/40 hover:bg-[#781D32]/10 hover:border-[#781D32]/50 text-[#1A1D14] font-medium"
          } transition-all duration-200`}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isFeatured ? t("quickActions.featuredActive") : t("quickActions.featured")}
        </Button>

        {selectedDate && (
          <div className="pt-3 border-t-2 border-[#2D3320]/20">
            <p className="text-sm text-[#1A1D14] font-bold mb-2">
              {t("quickActions.selectedDate")}
            </p>
            <div className="flex items-center justify-between p-3 bg-[#781D32]/10 rounded-md border border-[#781D32]/30 shadow-sm">
              <span className="text-sm text-[#781D32] font-semibold" suppressHydrationWarning>
                {selectedDate.toLocaleDateString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDateClear}
                className="h-7 w-7 p-0 text-[#781D32] hover:bg-[#781D32] hover:text-white rounded-full transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
