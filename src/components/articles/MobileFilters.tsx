"use client";

import React from "react";
import { motion } from "framer-motion";
import { Filter, X, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { FloatingActionButton } from "@/src/components/ui/floating-action-button";
import type { ArticleCategory } from "@/src/lib/types/article";

interface MobileFiltersProps {
  categories: { value: ArticleCategory | "all"; label: string }[];
  selectedCategory: ArticleCategory | "all";
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export default function MobileFilters({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  activeFiltersCount,
  onClearFilters,
}: MobileFiltersProps) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <FloatingActionButton
            className="bottom-20 right-4"
            size="md"
            variant="primary"
          >
            <div className="relative">
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-white text-[#781D32] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#781D32]"
                >
                  {activeFiltersCount}
                </motion.div>
              )}
            </div>
          </FloatingActionButton>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[80vh] bg-white">
          <SheetHeader className="border-b border-[#55613C]/10 pb-4">
            <SheetTitle className="text-[#3E442B] text-xl font-bold">
              Filters & Search
            </SheetTitle>
            <SheetDescription className="text-gray-600">
              Find the content you're looking for
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
            {/* Search Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#3E442B] text-lg">Search Articles</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                  className="pl-10 border-[#55613C]/20 focus:border-[#781D32] focus:ring-[#781D32] text-lg py-3"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSearchSubmit}
                  className="w-full bg-[#781D32] text-white hover:bg-[#781D32]/90 border-[#781D32]"
                >
                  Search
                </Button>
              )}
            </div>

            {/* Categories Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#3E442B] text-lg">Categories</h3>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.value}
                    onClick={() => onCategoryChange(category.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      selectedCategory === category.value
                        ? "border-[#781D32] bg-[#781D32]/10 text-[#781D32]"
                        : "border-[#55613C]/20 bg-white text-[#3E442B] hover:border-[#55613C]/40 hover:bg-[#55613C]/5"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.label}</span>
                      {selectedCategory === category.value && (
                        <div className="w-2 h-2 bg-[#781D32] rounded-full" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#55613C]/10">
                <h3 className="font-semibold text-[#3E442B] text-lg">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge
                      variant="secondary"
                      className="bg-[#781D32]/10 text-[#781D32] hover:bg-[#781D32]/20 px-3 py-2 text-sm"
                    >
                      Search: "{searchQuery}"
                      <button
                        onClick={() => onSearchChange("")}
                        className="ml-2 hover:text-[#781D32]/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-[#55613C]/10 text-[#55613C] hover:bg-[#55613C]/20 px-3 py-2 text-sm"
                    >
                      {categories.find((c) => c.value === selectedCategory)?.label}
                      <button
                        onClick={() => onCategoryChange("all")}
                        className="ml-2 hover:text-[#55613C]/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}