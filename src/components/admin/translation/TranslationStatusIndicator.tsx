"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Languages,
  CheckCircle2,
  AlertCircle,
  Bot,
  User,
  RefreshCw,
} from "lucide-react";
import type { BlockTranslationMeta } from "@/src/lib/types/page";

const SUPPORTED_LOCALES = ["en", "fi"] as const;

const localeLabels: Record<string, string> = {
  en: "EN",
  fi: "FI",
};

interface TranslationStatusIndicatorProps {
  meta?: BlockTranslationMeta;
  availableLocales?: ("en" | "fi")[];
  onTriggerTranslation?: (targetLocales: ("en" | "fi")[]) => void;
  isTranslating?: boolean;
  compact?: boolean;
}

/**
 * Shows translation status for a block with locale-nested content.
 * Indicates which languages are auto-translated vs manually reviewed.
 */
export function TranslationStatusIndicator({
  meta,
  availableLocales = ["en"],
  onTriggerTranslation,
  isTranslating = false,
  compact = false,
}: TranslationStatusIndicatorProps) {
  const defaultLang = meta?.defaultLang || "en";
  const autoTranslated = meta?.autoTranslated || [];
  const manuallyReviewed = meta?.manuallyReviewed || [];

  const getLocaleStatus = (locale: string) => {
    if (locale === defaultLang) return "source";
    if (manuallyReviewed.includes(locale as "en" | "fi")) return "reviewed";
    if (autoTranslated.includes(locale as "en" | "fi")) return "auto";
    if (availableLocales.includes(locale as "en" | "fi")) return "available";
    return "missing";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "source":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "reviewed":
        return <User className="h-3 w-3 text-blue-600" />;
      case "auto":
        return <Bot className="h-3 w-3 text-amber-600" />;
      case "available":
        return <CheckCircle2 className="h-3 w-3 text-gray-400" />;
      default:
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "source":
        return "bg-green-100 text-green-800 border-green-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "auto":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "available":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "source":
        return "Source";
      case "reviewed":
        return "Reviewed";
      case "auto":
        return "Auto-translated";
      case "available":
        return "Available";
      default:
        return "Missing";
    }
  };

  const missingLocales = SUPPORTED_LOCALES.filter(
    (locale) => getLocaleStatus(locale) === "missing"
  );

  const needsReviewLocales = SUPPORTED_LOCALES.filter(
    (locale) => getLocaleStatus(locale) === "auto"
  );

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {SUPPORTED_LOCALES.map((locale) => {
            const status = getLocaleStatus(locale);
            return (
              <Tooltip key={locale}>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium border ${getStatusColor(
                      status
                    )}`}
                  >
                    {localeLabels[locale]}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {localeLabels[locale]}: {getStatusLabel(status)}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Translations</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUPPORTED_LOCALES.map((locale) => {
          const status = getLocaleStatus(locale);
          return (
            <TooltipProvider key={locale}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)}
                    {localeLabels[locale]}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">{getStatusLabel(status)}</p>
                    {status === "auto" && (
                      <p className="text-muted-foreground">
                        Auto-translated, needs review
                      </p>
                    )}
                    {meta?.lastTranslated && status === "auto" && (
                      <p className="text-muted-foreground">
                        Last translated: {new Date(meta.lastTranslated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Translation action button */}
      {onTriggerTranslation && missingLocales.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerTranslation(missingLocales)}
          disabled={isTranslating}
          className="mt-2"
        >
          {isTranslating ? (
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Bot className="h-3 w-3 mr-1" />
          )}
          Translate to {missingLocales.map((l) => localeLabels[l]).join(", ")}
        </Button>
      )}

      {/* Review needed indicator */}
      {needsReviewLocales.length > 0 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {needsReviewLocales.length} translation(s) need review
        </p>
      )}
    </div>
  );
}

// Legend component for explaining status indicators
export function TranslationStatusLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-green-600" /> Source
      </span>
      <span className="flex items-center gap-1">
        <User className="h-3 w-3 text-blue-600" /> Reviewed
      </span>
      <span className="flex items-center gap-1">
        <Bot className="h-3 w-3 text-amber-600" /> Auto-translated
      </span>
      <span className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3 text-red-500" /> Missing
      </span>
    </div>
  );
}
