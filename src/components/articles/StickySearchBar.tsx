"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

interface StickySearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  placeholder?: string;
}

export default function StickySearchBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search articles...",
}: StickySearchBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky search when user scrolls past the main search section
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
    setIsExpanded(false);
  };

  const clearSearch = () => {
    onSearchChange("");
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#55613C]/10 shadow-sm md:hidden"
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              {!isExpanded ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2 text-[#3E442B] hover:bg-[#55613C]/10 flex-1 justify-start"
                  >
                    <Search className="h-4 w-4" />
                    <span className="text-gray-500">{placeholder}</span>
                  </Button>
                  {searchQuery && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs text-[#781D32] font-medium">
                        "{searchQuery}"
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearSearch}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-[#781D32]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={placeholder}
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      autoFocus
                      className="pl-10 pr-10 border-[#55613C]/20 focus:border-[#781D32] focus:ring-[#781D32]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#781D32]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}\n                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-500 hover:text-[#781D32]"
                  >
                    Cancel
                  </Button>
                </motion.form>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}