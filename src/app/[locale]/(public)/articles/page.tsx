"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Search, Sparkles, BookOpen, Filter } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import ArticleCard from "@/src/components/articles/ArticleCard";
import { usePosts } from "@/src/lib/hooks/use-posts";
import type { Article } from "@/src/lib/types/article";
import type { GetPostsOptions } from "@/src/actions/posts.actions";

interface ArticleFilters extends GetPostsOptions {
  category?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

// Category keys for translation
const categoryKeys = [
  "all",
  "news",
  "analysis",
  "culture",
  "history",
  "activism",
  "personal",
] as const;

// Petitions-style liquid glass hero with search
function ArticleNavigation({
  filters,
  onFiltersChange,
}: {
  filters: ArticleFilters;
  onFiltersChange: (filters: ArticleFilters) => void;
}) {
  const t = useTranslations("articlesPage");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  // Debounced search - ensure language is always preserved
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        onFiltersChange({ 
          ...filters, 
          search: searchQuery || undefined,
          language: locale, // Explicitly set language to current locale
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, locale, filters, onFiltersChange]);

  return (
    <>
      {/* Hero Section with Liquid Glass - Petitions Style */}
      <motion.section
        className="relative py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Gradient Background with Decorative Orbs */}
        <div className="absolute inset-0 bg-linear-to-br from-[#781D32] via-[#722F37] to-[#55613C]" />

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center space-y-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
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
              <BookOpen className="w-10 h-10 text-white" />
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
      </motion.section>{" "}
      {/* Search and Filters with Liquid Glass */}
      <motion.section
        className="py-8 relative bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      category: value === "all" ? undefined : value,
                      language: locale, // Ensure language is always set to current locale
                    })
                  }
                >
                  <SelectTrigger
                    className="w-56 h-12 rounded-xl backdrop-blur-sm"
                    style={{
                      background: "rgba(255, 248, 240, 0.6)",
                      border: "0.5px solid rgba(232, 220, 196, 0.4)",
                    }}
                  >
                    <SelectValue placeholder={t("filters.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryKeys.map((categoryKey) => (
                      <SelectItem key={categoryKey} value={categoryKey}>
                        {t(`categories.${categoryKey}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}

// Featured Article Section with liquid glass
function FeaturedSection({ articles }: { articles: Article[] }) {
  const t = useTranslations("articlesPage");
  const featuredArticle = articles?.[0];

  if (!featuredArticle || !featuredArticle.image) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 lg:py-20 bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-2 rounded-full bg-[rgba(85,97,60,0.12)] backdrop-blur-sm border border-[rgba(85,97,60,0.2)] shadow-[0_2px_6px_rgba(85,97,60,0.08)] inline-block mb-4"
          >
            <Sparkles className="h-6 w-6 text-green-600" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t("featured.title")}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("featured.subtitle")}
          </p>
        </div>

        {/* Featured Article Card */}
        <div className="max-w-7xl">
          <ArticleCard
            article={featuredArticle}
            size="large"
            showExcerpt
            priority
          />
        </div>
      </div>
    </motion.section>
  );
}

// Main articles grid - Structured 3-column layout
function ArticlesGrid({
  articles,
  isLoading,
}: {
  articles: Article[];
  isLoading: boolean;
}) {
  const t = useTranslations("articlesPage");
  const mainArticles = useMemo(() => articles || [], [articles]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="py-16 bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t("latest.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl">
            {t("latest.subtitle")}
          </p>
        </div>

        {/* Responsive Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ArticleCard
                    key={`loading-${i}`}
                    article={{} as Article}
                    isLoading={true}
                    size="medium"
                    showExcerpt
                  />
                ))
              : mainArticles.map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex" // Ensures consistent height
                  >
                    <ArticleCard
                      article={article}
                      size="medium"
                      showExcerpt
                      className="w-full" // Full width within flex container
                    />
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>

        {/* Empty State when no articles */}
        {!isLoading && mainArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("search.noResults.title")}
            </h3>
            <p className="text-gray-600">
              {t("search.noResults.message")}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

// Newsletter signup - Medium style with glass container
function NewsletterSection() {
  const t = useTranslations("articlesPage");

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 bg-linear-to-b from-white to-[rgba(255,248,240,0.50)] border-t border-[rgba(232,220,196,0.4)] relative overflow-hidden"
    >
      {/* Subtle decorative glass overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-[rgba(85,97,60,0.03)] via-transparent to-[rgba(212,175,55,0.05)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Glass container */}
        <div className="p-8 md:p-12 rounded-3xl bg-[rgba(255,248,240,0.90)] backdrop-blur-lg border border-[rgba(212,175,55,0.3)] shadow-[0_12px_32px_rgba(120,29,50,0.08),0_6px_16px_rgba(85,97,60,0.06),inset_0_2px_0_rgba(255,255,255,0.8)]">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t("newsletter.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("newsletter.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t("newsletter.placeholder")}
              className="flex-1 px-4 py-3 bg-[rgba(255,255,255,0.90)] backdrop-blur-sm border border-[rgba(232,220,196,0.5)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(85,97,60,0.3)] focus:border-[rgba(85,97,60,0.4)] shadow-[0_2px_6px_rgba(120,29,50,0.06)] transition-all hover:bg-white hover:border-[rgba(212,175,55,0.4)]"
            />
            <Button className="bg-[rgba(62,68,43,0.95)] backdrop-blur-md hover:bg-[#3E442B] text-white border border-[rgba(255,255,255,0.2)] px-6 py-3 rounded-md font-medium shadow-[0_4px_12px_rgba(62,68,43,0.25)] transition-all hover:shadow-[0_8px_24px_rgba(62,68,43,0.35)]">
              {t("newsletter.subscribe")}
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            {t("newsletter.joinText")}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// Enhanced Load More Component with glass styling
function LoadMoreSection({
  currentCount,
  onLoadMore,
  isLoading,
}: {
  currentCount: number;
  onLoadMore: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations("articlesPage");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 bg-linear-to-t from-[rgba(255,248,240,0.30)] to-white border-t border-[rgba(232,220,196,0.4)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("loadMore.showing", { count: currentCount })}
          </h3>
          <p className="text-gray-600">
            {t("loadMore.subtitle")}
          </p>
        </div>

        <Button
          size="lg"
          onClick={onLoadMore}
          disabled={isLoading}
          className="bg-[rgba(62,68,43,0.95)] backdrop-blur-md hover:bg-[#3E442B] text-white border border-[rgba(255,255,255,0.2)] px-10 py-4 rounded-full font-medium shadow-[0_4px_12px_rgba(62,68,43,0.25)] transition-all transform hover:scale-105 hover:shadow-[0_8px_24px_rgba(62,68,43,0.35)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-[0_4px_12px_rgba(62,68,43,0.25)]"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
              />
              {t("loadMore.loading")}
            </>
          ) : (
            t("loadMore.button")
          )}
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          {t("loadMore.newArticles")}
        </p>
      </div>
    </motion.section>
  );
}

// Main articles page component
export default function ArticlesPage() {
  const t = useTranslations("articlesPage");
  const locale = useLocale();
  const [filters, setFilters] = useState<ArticleFilters>({
    status: "published",
    page: 1,
    limit: 50,
    language: locale,
  });

  // Ensure language filter always matches current locale
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      language: locale,
    }));
  }, [locale]);

  const { data: postsData, isLoading, error } = usePosts(filters);
  
  // Transform posts to articles format
  const articles = useMemo(() => {
    if (!postsData?.posts) return [];
    return postsData.posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.categories?.[0],
      status: post.status,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      image: post.featuredImage || undefined,
      author: post.authorId ? {
        id: post.authorId,
        name: post.authorName || 'Unknown',
      } : undefined,
    }));
  }, [postsData]);

  // Memoize the filter change handler to prevent infinite loops
  // Ensure language is always preserved and set to current locale
  const handleFiltersChange = useCallback((newFilters: ArticleFilters) => {
    setFilters({ ...newFilters, language: locale });
  }, [locale]);

  return (
      <div className="min-h-screen bg-linear-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
        {/* Navigation & Search */}
        <ArticleNavigation
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Main Articles Grid */}
        <ArticlesGrid articles={articles} isLoading={isLoading} />

        {/* Enhanced Load More Section */}
        {articles.length > 0 && !isLoading && (
          <LoadMoreSection
            currentCount={articles.length}
            onLoadMore={() =>
              setFilters((prev) => ({ ...prev, language: locale, limit: (prev.limit || 12) + 9 }))
            }
            isLoading={isLoading}
          />
        )}

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* Error State */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("error.title")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("error.message")}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[rgba(62,68,43,0.95)] backdrop-blur-md hover:bg-[#3E442B] text-white border border-[rgba(255,255,255,0.2)] px-6 py-3 rounded-full shadow-[0_4px_12px_rgba(62,68,43,0.25)] transition-all hover:shadow-[0_8px_24px_rgba(62,68,43,0.35)]"
              >
                {t("error.tryAgain")}
              </Button>
            </div>
          </div>
        )}
      </div>
  );
}
