"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  X,
  FileText,
  PenTool,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
  Hash,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

/**
 * Search result interface
 */
interface SearchResult {
  id: string;
  title: string;
  type: "petition" | "article" | "event" | "page";
  description: string;
  href: string;
  badge?: string;
  date?: string;
  tags?: string[];
  status?: "active" | "completed" | "upcoming";
  signatures?: number;
}

/**
 * Search configuration
 */
interface SearchConfig {
  showKeyboardShortcut?: boolean;
  showTrendingSearches?: boolean;
  showRecentSearches?: boolean;
  showQuickAccess?: boolean;
  placeholder?: string;
  searchDelay?: number;
}

/**
 * Search component props
 */
interface SearchProps {
  config?: SearchConfig;
  onResultClick?: (result: SearchResult) => void;
  customResults?: SearchResult[];
}

// Mock search results - replace with actual search API
const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Understanding Palestinian Culture",
    type: "article",
    description: "A comprehensive guide to Palestinian traditions, art, and cultural heritage.",
    href: "/articles/palestinian-culture",
    date: "2025-08-10",
    tags: ["education", "culture", "history"],
  },
  {
    id: "2",
    title: "Solidarity March Helsinki",
    type: "event",
    description: "Join us for a peaceful march in support of Palestinian rights.",
    href: "/events/solidarity-march-helsinki",
    badge: "Upcoming",
    date: "2025-09-15",
    status: "upcoming",
    tags: ["culture", "festival", "community"],
  },
  {
    id: "3",
    title: "Become a Member",
    type: "page",
    description: "Join our community and help build bridges of solidarity.",
    href: "/membership",
    tags: ["membership", "community"],
  },
  {
    id: "4",
    title: "End Apartheid in Palestine",
    type: "petition",
    description: "Call for international action to end systematic oppression.",
    href: "/petitions/end-apartheid",
    badge: "Urgent",
    date: "2025-07-20",
    tags: ["rights", "politics", "recognition"],
    status: "active",
    signatures: 3456,
  },
];

const trendingSearches = [
  "Palestinian rights",
  "Solidarity events",
  "Educational resources",
  "Join movement",
  "Cultural exchange",
];

const recentSearches = [
  "Palestinian history",
  "Helsinki events",
  "Membership benefits",
  "Solidarity actions",
];

/**
 * Get icon for search result type
 */
const getTypeIcon = (type: SearchResult["type"]) => {
  switch (type) {
    case "petition":
      return PenTool;
    case "article":
      return FileText;
    case "event":
      return Calendar;
    case "page":
      return Users;
    default:
      return Hash;
  }
};

/**
 * Get color for search result type
 */
const getTypeColor = (type: SearchResult["type"]) => {
  switch (type) {
    case "petition":
      return "text-[#781D32] bg-[#781D32]/10";
    case "article":
      return "text-[#55613C] bg-[#55613C]/10";
    case "event":
      return "text-[#3E442B] bg-[#3E442B]/10";
    case "page":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

/**
 * Search dialog component
 */
interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config: Required<SearchConfig>;
  onResultClick?: (result: SearchResult) => void;
  customResults?: SearchResult[];
}

const SearchDialog = React.memo<SearchDialogProps>(function SearchDialog({
  isOpen,
  onOpenChange,
  config,
  onResultClick,
  customResults,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Mock search function - replace with actual search API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, config.searchDelay));
    
    const searchData = customResults || mockResults;
    const filtered = searchData.filter(
      item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setResults(filtered);
    setSelectedIndex(0);
    setIsLoading(false);
  }, [config.searchDelay, customResults]);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(query);
    }, config.searchDelay);

    return () => clearTimeout(delayedSearch);
  }, [query, performSearch, config.searchDelay]);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      router.push(result.href);
    }
    onOpenChange(false);
    setQuery("");
  }, [onResultClick, router, onOpenChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onOpenChange, handleResultClick]);

  const handleTrendingClick = useCallback((trending: string) => {
    setQuery(trending);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
  }, []);

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
      <DialogHeader className="p-4 pb-0">
        <div className="flex items-center gap-3">
          <SearchIcon className="h-5 w-5 text-[#55613C]" />
          <DialogTitle className="text-lg font-semibold text-[#3E442B]">
            Search Sumud
          </DialogTitle>
        </div>
      </DialogHeader>
      
      <div className="p-4">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={config.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-[#55613C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#781D32]/20 focus:border-[#781D32] text-sm"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {!query && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Recent Searches */}
                {config.showRecentSearches && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Recent Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <Button
                          key={search}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrendingClick(search)}
                          className="text-xs h-7 border-gray-200 hover:bg-[#F4F3F0]"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {config.showTrendingSearches && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-[#55613C]" />
                      <span className="text-sm font-medium text-[#3E442B]">Trending</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((trending) => (
                        <Button
                          key={trending}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrendingClick(trending)}
                          className="text-xs border-[#55613C]/20 hover:bg-[#55613C]/10 hover:border-[#55613C]/40"
                        >
                          {trending}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Access */}
                {config.showQuickAccess && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 mb-3 block">Quick Access</span>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="justify-start h-10"
                        onClick={() => router.push("/petitions")}
                      >
                        <PenTool className="h-4 w-4 mr-2" />
                        All Petitions
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-10"
                        onClick={() => router.push("/articles")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        All Articles
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-10"
                        onClick={() => router.push("/events")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Events
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-10"
                        onClick={() => router.push("/membership")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Become a Member
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <div className="w-6 h-6 border-2 border-[#781D32] border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}

            {!isLoading && query && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-gray-400 text-xs">
                  Try different keywords or browse our sections
                </p>
              </motion.div>
            )}

            {!isLoading && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 max-h-96 overflow-y-auto"
              >
                {results.map((result, index) => {
                  const Icon = getTypeIcon(result.type);
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleResultClick(result)}
                        className={`w-full text-left p-3 rounded-lg border transition-all group ${
                          isSelected 
                            ? "border-[#781D32] bg-[#781D32]/5" 
                            : "border-[#55613C]/10 hover:border-[#55613C]/30 hover:bg-[#F4F3F0]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-md ${getTypeColor(result.type)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-[#3E442B] text-sm group-hover:text-[#781D32] transition-colors truncate">
                                {result.title}
                              </h3>
                              {result.badge && (
                                <Badge className="bg-[#781D32]/10 text-[#781D32] text-xs px-1.5 py-0.5">
                                  {result.badge}
                                </Badge>
                              )}
                              {result.signatures && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.signatures} signatures
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {result.description}
                            </p>
                            
                            {result.tags && (
                              <div className="flex items-center gap-1 mb-1">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs border-gray-200"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400 capitalize">
                                {result.type}
                              </span>
                              {result.date && (
                                <>
                                  <span className="text-xs text-gray-300">•</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(result.date).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                              <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-[#781D32] transition-colors ml-auto" />
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      {(results.length > 0 || config.showKeyboardShortcut) && (
        <div className="p-4 pt-0">
          <div className="text-center text-xs text-gray-500">
            {results.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span>{results.length} result{results.length !== 1 ? "s" : ""} found</span>
                <span>Use ↑↓ to navigate, Enter to select</span>
              </div>
            )}
            {config.showKeyboardShortcut && (
              <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd> to close</span>
            )}
          </div>
        </div>
      )}
    </DialogContent>
  );
});

/**
 * Main unified search component
 */
const Search = React.memo<SearchProps>(function Search({
  config = {},
  onResultClick,
  customResults,
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const searchConfig: Required<SearchConfig> = {
    showKeyboardShortcut: true,
    showTrendingSearches: true,
    showRecentSearches: true,
    showQuickAccess: true,
    placeholder: "Search petitions, articles, events...",
    searchDelay: 300,
    ...config,
  };

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    if (!searchConfig.showKeyboardShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchConfig.showKeyboardShortcut]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#3E442B] hover:text-[#781D32] gap-2"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden md:inline text-sm">Search</span>
          {searchConfig.showKeyboardShortcut && (
            <kbd className="hidden md:inline ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
              ⌘K
            </kbd>
          )}
        </Button>
      </DialogTrigger>
      <SearchDialog 
        isOpen={isOpen} 
        onOpenChange={setIsOpen}
        config={searchConfig}
        onResultClick={onResultClick}
        customResults={customResults}
      />
    </Dialog>
  );
});

export default Search;
export { Search, type SearchResult, type SearchConfig, type SearchProps };