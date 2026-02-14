"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar,
  Clock,
  Share2,
  ArrowLeft,
  ChevronUp
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import ArticleCard from "@/src/components/articles/ArticleCard";
import { usePostBySlug, usePosts } from "@/src/lib/hooks/use-posts";
import { getCategoryConfig } from "@/src/lib/types/article";
import { cn } from "@/src/lib/utils/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function ArticlePage() {
  const t = useTranslations("articlesPage");
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Use React Query hooks for data fetching
  const {
    data: article,
    isLoading: articleLoading,
    error: articleError,
  } = usePostBySlug(slug);
  
  // Fetch related articles - get recent published articles and filter by category client-side
  const { data: relatedArticlesData } = usePosts({
    status: 'published',
    limit: 10,
  });
  
  // Filter to same category and exclude current article
  const relatedArticles = React.useMemo(() => {
    if (!article || !relatedArticlesData?.posts) return [];
    const articleCategories = article.categories || [];
    return relatedArticlesData.posts
      .filter(post => {
        if (post.slug === slug) return false;
        const postCategories = post.categories || [];
        return postCategories.some(cat => articleCategories.includes(cat));
      })
      .slice(0, 3)
      .map(post => ({
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
  }, [article, relatedArticlesData, slug]);

  // Scroll tracking for reading progress
  React.useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById("article-content");
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const progress = Math.min(
        Math.max(
          ((scrollTop + windowHeight - articleTop) / articleHeight) * 100,
          0,
        ),
        100,
      );

      setReadingProgress(progress);
      setShowBackToTop(scrollTop > 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || "";
    const text = article?.excerpt || "";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
      default:
        if (navigator.share) {
          navigator.share({ title, text, url });
        }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (articleLoading) {
    return (
      <div className="min-h-screen bg-[#F4F3F0]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (articleError || !article) {
    return (
      <div className="min-h-screen bg-[#F4F3F0]">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-[#3E442B] mb-4">
            {t("detail.notFound.title")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("detail.notFound.message")}
          </p>
          <Link href="/articles">
            <Button className="bg-[#781D32] hover:bg-[#781D32]/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("detail.backToArticles")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryStyle = getCategoryConfig(article.categories?.[0]) || {
    label: "Article",
    icon: "Newspaper",
    color: "text-gray-600",
  };

  // Calculate read time based on content
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress
          value={readingProgress}
          className="h-1 rounded-none bg-transparent border-none"
        >
          <div className="h-full bg-linear-to-r from-[#781D32] to-[#55613C] transition-all duration-300"></div>
        </Progress>
      </div>

      {/* Article Header */}
      <section className="relative overflow-hidden bg-white border-b border-[#55613C]/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            variants={fadeInLeft}
            initial="initial"
            animate="animate"
            className="mb-6"
          >
            <Link
              href="/articles"
              className="inline-flex items-center text-[#55613C] hover:text-[#781D32] transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("detail.backToArticles")}
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="mb-6"
          >
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge className={`${categoryStyle.color} font-medium px-3 py-1`}>
                {categoryStyle.label}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span suppressHydrationWarning>
                    {article.publishedAt || article.createdAt
                      ? new Date(article.publishedAt || article.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} {t("card.minRead")}</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-[#3E442B] leading-tight mb-4">
              {article.title}
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {article.excerpt}
            </p>
          </motion.div>
        </div>

        {/* Featured Image */}
        {(() => {
          const imageUrl = article.featuredImage 
            || "/images/placeholder-article.svg";
          const imageAlt = article.title 
            || "Article image";
          
          return (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="relative h-64 lg:h-96 overflow-hidden"
            >
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
            </motion.div>
          );
        })()}
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="">
            <div className="lg:col-span-3">
              <>
                {/* Force prose styles globally within this container */}
                <style dangerouslySetInnerHTML={{ __html: `
                  #article-content h1 { font-size: 2.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #3E442B; }
                  #article-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.875rem; color: #3E442B; }
                  #article-content h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #3E442B; }
                  #article-content p { margin-top: 1rem; margin-bottom: 1rem; line-height: 1.75; color: #374151; }
                  #article-content ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; }
                  #article-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; }
                  #article-content li { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                  #article-content a { color: #781D32; text-decoration: underline; }
                  #article-content strong { font-weight: 600; color: #3E442B; }
                  #article-content blockquote { border-left: 4px solid #781D32; padding-left: 1.5rem; font-style: italic; color: #6B7280; margin: 1.5rem 0; }
                  #article-content code { background-color: #F3F4F6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
                  #article-content pre { background-color: #1F2937; color: #F9FAFB; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; }
                ` }} />
                
                <article
                  id="article-content"
                  style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: article.content || '<p style="color: #9CA3AF;">No content available</p>' 
                  }}
                />
              </>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-[#55613C]/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <Button
                    onClick={() => handleShare("default")}
                    className="bg-[#781D32] hover:bg-[#781D32]/90 text-white"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("detail.shareArticle")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-[#3E442B] mb-4">
                {t("detail.relatedTitle")}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t("detail.relatedSubtitle")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  size="compact"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#781D32] hover:bg-[#781D32]/90 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-40"
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
}