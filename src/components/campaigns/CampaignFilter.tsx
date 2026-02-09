"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Search } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import type { CampaignType } from "@/src/types/Campaigns";
import type { CampaignFilters } from "@/src/lib/react-query/query-keys";

interface CampaignFilterProps {
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
  totalResults?: number;
  loading?: boolean;
}

const campaignTypes: {
  value: CampaignType | "all";
  label: string;
  color: string;
}[] = [
  { value: "all", label: "All Types", color: "#55613C" },
  { value: "awareness", label: "Awareness", color: "#3E442B" },
  { value: "advocacy", label: "Advocacy", color: "#781D32" },
  { value: "fundraising", label: "Fundraising", color: "#55613C" },
  {
    value: "community_building",
    label: "Community Building",
    color: "#781D32",
  },
  { value: "education", label: "Education", color: "#3E442B" },
  { value: "solidarity", label: "Solidarity", color: "#781D32" },
  { value: "humanitarian", label: "Humanitarian", color: "#55613C" },
  { value: "political", label: "Political", color: "#781D32" },
  { value: "cultural", label: "Cultural", color: "#3E442B" },
  { value: "environmental", label: "Environmental", color: "#55613C" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

// Sort options for future implementation
// const sortOptions = [
//   { value: "newest", label: "Newest First" },
//   { value: "oldest", label: "Oldest First" },
//   { value: "progress", label: "Most Progress" },
//   { value: "deadline", label: "Ending Soon" },
//   { value: "featured", label: "Featured First" },
// ];

export default function CampaignFilter({
  filters,
  onFiltersChange,
  totalResults = 0,
  loading = false,
}: CampaignFilterProps) {
  const updateFilter = (key: keyof CampaignFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.campaignType ||
    filters.status ||
    filters.isFeatured !== undefined,
  );

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.campaignType) count++;
    if (filters.status && filters.status !== "active") count++;
    if (filters.isFeatured !== undefined) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#3E442B]">
          Search Campaigns
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, description..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 border-[#55613C]/20 focus:border-[#781D32] focus:ring-[#781D32]"
          />
        </div>
      </div>

      {/* Campaign Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#3E442B]">
          Campaign Type
        </label>
        <Select
          value={filters.campaignType || "all"}
          onValueChange={(value) =>
            updateFilter("campaignType", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="border-[#55613C]/20">
            <SelectValue placeholder="Select campaign type" />
          </SelectTrigger>
          <SelectContent>
            {campaignTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#3E442B]">Status</label>
        <Select
          value={filters.status || "active"}
          onValueChange={(value) =>
            updateFilter("status", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="border-[#55613C]/20">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Featured Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#3E442B]">
          Featured Campaigns
        </label>
        <div className="flex gap-2">
          <Button
            variant={filters.isFeatured === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("isFeatured", undefined)}
            className={
              filters.isFeatured === undefined
                ? "bg-[#781D32] text-white"
                : "border-[#55613C]/20"
            }
          >
            All
          </Button>
          <Button
            variant={filters.isFeatured === true ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("isFeatured", true)}
            className={
              filters.isFeatured === true
                ? "bg-[#781D32] text-white"
                : "border-[#55613C]/20"
            }
          >
            Featured Only
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="pt-4 border-t border-[#55613C]/10">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {loading ? "Loading..." : `${totalResults} campaigns found`}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-[#781D32] hover:text-[#781D32]/80 hover:bg-[#781D32]/10"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-3xl border border-[#55613C]/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#3E442B]" />
            <h3 className="font-semibold text-[#3E442B]">Filter Campaigns</h3>
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white rounded-3xl border border-[#55613C]/10 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {totalResults} campaigns
            </span>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="bg-[#781D32]/10 text-[#781D32]"
              >
                {getActiveFilterCount()} filters
              </Badge>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-[#55613C]/20"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-[#3E442B]">
                  Filter Campaigns
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-[#55613C]/10 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#3E442B]">
                Active Filters:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[#781D32] hover:text-[#781D32]/80 hover:bg-[#781D32]/10 h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge
                  variant="secondary"
                  className="bg-[#781D32]/10 text-[#781D32] pr-1"
                >
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("search", "")}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.campaignType && (
                <Badge
                  variant="secondary"
                  className="bg-[#55613C]/10 text-[#55613C] pr-1"
                >
                  {
                    campaignTypes.find((t) => t.value === filters.campaignType)
                      ?.label
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("campaignType", undefined)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.status && filters.status !== "active" && (
                <Badge
                  variant="secondary"
                  className="bg-[#3E442B]/10 text-[#3E442B] pr-1"
                >
                  Status:{" "}
                  {statusOptions.find((s) => s.value === filters.status)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("status", "active")}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.isFeatured === true && (
                <Badge
                  variant="secondary"
                  className="bg-[#781D32]/10 text-[#781D32] pr-1"
                >
                  Featured Only
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("isFeatured", undefined)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
