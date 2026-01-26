"use client";

import React, { useState } from "react";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Share2,
  Bookmark,
  Sparkles,
  Heart,
  MoreHorizontal,
  Clock,
  Calendar,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Article as ArticleFromAPI,
  formatArticleDate,
  getCategoryConfig,
} from "@/src/lib/types/article";

// Use the API article type
export type Article = ArticleFromAPI;

interface ArticleCardProps {
  article: Article;
  size?: "default" | "featured" | "compact" | "medium" | "large";
  className?: string;
  showExcerpt?: boolean;
  showSocialActions?: boolean;
  isLoading?: boolean;
  priority?: boolean;
}

// Skeleton loading component for articles - Medium style
function ArticleCardSkeleton({
  size = "default",
}: {
  size?: "default" | "featured" | "compact" | "medium" | "large";
}) {
  if (size === "featured" || size === "large") {
    return (
      <div className="animate-pulse space-y-4">
        <div className="aspect-2/1 bg-gray-200 rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="pt-3 border-t border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div className="animate-pulse space-y-3">
        <div className="aspect-video bg-gray-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-full"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="pt-2 border-t border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (size === "compact") {
    return (
      <div className="animate-pulse flex items-start gap-4 py-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="pt-1">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-3">
      <div className="aspect-video bg-gray-200 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-full"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="pt-2 border-t border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export default function ArticleCard({
  article,
  size = "default",
  className = "",
  showExcerpt = false,
  showSocialActions = true,
  isLoading = false,
  priority = false,
}: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (isLoading) {
    return <ArticleCardSkeleton size={size} />;
  }

  // Safely extract image URL and alt text with fallbacks
  const imageUrl = (article as { featuredImage?: { url?: string } }).featuredImage?.url 
    || article.image 
    || "/images/placeholder-article.svg";
  const imageAlt = (article as { featuredImage?: { alt?: string } }).featuredImage?.alt 
    || article.title 
    || "Article image";

  // Get category style with fallback for unknown categories
  const categoryStyle = getCategoryConfig(article.category) || {
    label: "Article",
    color: "text-gray-600",
    icon: "Newspaper",
  };

  // Calculate read time based on content (200 words per minute)
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  // Mock engagement data (in real app, this would come from API)
  // Use deterministic values based on article ID to avoid hydration errors
  const articleIdHash = article.id ? article.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_AGO = new Date(Date.now() - SEVEN_DAYS_MS);
  
  const engagementData = {
    shares: (articleIdHash % 45) + 5,
    isNew: article.publishedAt
      ? new Date(article.publishedAt) > SEVEN_DAYS_AGO
      : false,
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: `/articles/${article.slug}`,
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Medium-style featured layout (hero)
  if (size === "featured" || size === "large") {
    return (
      <motion.article
        className={`group cursor-pointer ${className}`}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/articles/${article.slug}`} className="block">
          <div className="space-y-4">
            {/* Large Image */}
            <div className="aspect-2/1 relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder-article.svg";
                }}
              />
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Badge Section - Clean horizontal layout */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium text-green-700 bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
                >
                  {categoryStyle.label}
                </Badge>
                {engagementData.isNew && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 font-medium">
                    <Sparkles className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3">
                {article.title}
              </h1>

              {/* Excerpt */}
              {showExcerpt && article.excerpt && (
                <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              )}

              {/* Meta Information & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{readTime} min read</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span suppressHydrationWarning>{formatArticleDate(article.publishedAt)}</span>
                  </div>
                </div>

                {/* Social Actions */}
                {showSocialActions && (
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike();
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 transition-colors ${
                        isBookmarked
                          ? "text-green-600 bg-green-50"
                          : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleBookmark();
                      }}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShare();
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Medium-style standard card
  if (size === "medium") {
    return (
      <motion.article
        className={`group cursor-pointer ${className}`}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/articles/${article.slug}`} className="block">
          <div className="space-y-3">
            {/* Image */}
            <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-article.svg';
                }}
              />
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Badge Section */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium text-green-700 bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
                >
                  {categoryStyle.label}
                </Badge>
                {engagementData.isNew && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 font-medium">
                    <Sparkles className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-bold leading-tight text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                {article.title}
              </h2>

              {/* Excerpt */}
              {showExcerpt && article.excerpt && (
                <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{readTime} min</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span suppressHydrationWarning>{formatArticleDate(article.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Compact layout for sidebar or lists
  if (size === "compact") {
    return (
      <motion.article
        className={`group cursor-pointer ${className}`}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/articles/${article.slug}`} className="block">
          <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors px-3 -mx-3 rounded-lg">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="80px"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-article.svg';
                }}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* Badge Section */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium text-green-700 bg-green-50 border-green-200"
                >
                  {categoryStyle.label}
                </Badge>
                {engagementData.isNew && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5">
                    <Sparkles className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors text-sm leading-tight">
                {article.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{readTime} min</span>
                </div>
                <span>·</span>
                <span suppressHydrationWarning>{formatArticleDate(article.publishedAt)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.preventDefault();
                  handleBookmark();
                }}
              >
                <Bookmark
                  className={`h-3 w-3 ${isBookmarked ? "fill-current" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default Medium-style card
  return (
    <motion.article
      className={`group cursor-pointer ${className}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="space-y-3">
          {/* Image */}
          <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-article.svg';
              }}
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Badge Section */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium text-green-700 bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
              >
                {categoryStyle.label}
              </Badge>
              {engagementData.isNew && (
                <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 font-medium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base md:text-lg font-bold leading-tight text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
              {article.title}
            </h2>

            {/* Excerpt */}
            {showExcerpt && article.excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* Meta Information & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{readTime} min</span>
                </div>
                <span>·</span>
                <span suppressHydrationWarning>{formatArticleDate(article.publishedAt)}</span>
              </div>

              {showSocialActions && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-6 w-6 p-0 transition-colors ${
                      isBookmarked
                        ? "text-green-600"
                        : "text-gray-400 hover:text-green-600"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleBookmark();
                    }}
                  >
                    <Bookmark
                      className={`h-3 w-3 ${isBookmarked ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
