"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  views: number;
}

interface TrendingBannerProps {
  articles: TrendingArticle[];
  className?: string;
}

export default function TrendingBanner({ 
  articles, 
  className = "" 
}: TrendingBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate through trending articles
  useEffect(() => {
    if (articles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [articles.length]);

  if (!articles.length || !isVisible) return null;

  const currentArticle = articles[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`bg-gradient-to-r from-[#781D32]/10 via-[#55613C]/10 to-[#3E442B]/10 border border-[#781D32]/20 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp className="h-5 w-5 text-[#781D32]" />
              </motion.div>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium px-2 py-1 text-xs">
                Trending Now
              </Badge>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-w-0"
              >
                <Link 
                  href={`/articles/${currentArticle.slug}`}
                  className="block group"
                >
                  <p className="text-[#3E442B] font-medium truncate group-hover:text-[#781D32] transition-colors duration-200">
                    {currentArticle.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentArticle.views.toLocaleString()} views • {currentArticle.category}
                  </p>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 ml-3">
            <Link href={`/articles/${currentArticle.slug}`}>
              <Button
                size="sm"
                variant="ghost"
                className="text-[#781D32] hover:bg-[#781D32]/10 p-1 h-8 w-8"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress indicator for multiple articles */}
        {articles.length > 1 && (
          <div className="flex gap-1 mt-3">
            {articles.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1 rounded-full flex-1 ${
                  index === currentIndex ? 'bg-[#781D32]' : 'bg-[#781D32]/20'
                }`}
                animate={{
                  scaleX: index === currentIndex ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}