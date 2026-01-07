"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Share2,
  Bookmark,
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  ChevronUp,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import Footer from "@/src/components/navigation/footer";
import ArticleCard from "@/src/components/articles/ArticleCard";
import { useArticle, useRelatedArticles } from "@/src/lib/hooks/use-articles";
import { formatArticleDate, getCategoryConfig } from "@/src/lib/types/article";

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
  } = useArticle(slug);

  const { data: relatedArticles = [], isLoading: relatedLoading } =
    useRelatedArticles(article?.category, slug);

  // Scroll tracking for reading progress
  React.useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById("article-content");
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Calculate reading progress
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
    // TODO: Implement actual bookmarking
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement actual liking
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
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The article you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/articles">
            <Button className="bg-[#781D32] hover:bg-[#781D32]/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryStyle = getCategoryConfig(article.category) || {
    label: "Article",
    icon: "Newspaper",
    color: "text-gray-600",
  };

  // Calculate read time based on content (200 words per minute)
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
          {/* Navigation */}
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
              Back to Articles
            </Link>
          </motion.div>

          {/* Article Meta */}
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
                  <span>{formatArticleDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>0 views</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-[#3E442B] leading-tight mb-4">
              {article.title}
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {article.excerpt}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={`transition-colors ${
                    isLiked
                      ? "border-[#781D32] bg-[#781D32]/10 text-[#781D32]"
                      : "border-gray-300 hover:border-[#781D32] hover:text-[#781D32]"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                  />
                  {isLiked ? 1 : 0}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  className={`transition-colors ${
                    isBookmarked
                      ? "border-[#781D32] bg-[#781D32]/10 text-[#781D32]"
                      : "border-gray-300 hover:border-[#781D32] hover:text-[#781D32]"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </Button>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="border-gray-300 hover:border-[#781D32] hover:text-[#781D32]"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  {showShareOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10"
                    >
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <button
                          onClick={() => handleShare("twitter")}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm"
                        >
                          <Twitter className="h-4 w-4 text-blue-400" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare("facebook")}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm"
                        >
                          <Facebook className="h-4 w-4 text-blue-600" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm"
                        >
                          <Linkedin className="h-4 w-4 text-blue-700" />
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare("copy")}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm"
                        >
                          {copySuccess ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copySuccess ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Image */}
        {(() => {
          const imageUrl = (article as any).featuredImage?.url 
            || article.image 
            || "/images/placeholder-article.svg";
          const imageAlt = (article as any).featuredImage?.alt 
            || article.title 
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
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents (placeholder) */}
                <Card className="border border-[#55613C]/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#3E442B] mb-3">
                      In This Article
                    </h3>
                    <div className="space-y-2 text-sm">
                      <a
                        href="#history"
                        className="block text-gray-600 hover:text-[#781D32] transition-colors"
                      >
                        A History of Principled Engagement
                      </a>
                      <a
                        href="#contemporary"
                        className="block text-gray-600 hover:text-[#781D32] transition-colors"
                      >
                        Contemporary Solidarity Movements
                      </a>
                      <a
                        href="#cultural"
                        className="block text-gray-600 hover:text-[#781D32] transition-colors"
                      >
                        Cultural Exchange and Understanding
                      </a>
                      <a
                        href="#challenges"
                        className="block text-gray-600 hover:text-[#781D32] transition-colors"
                      >
                        Challenges and Opportunities
                      </a>
                      <a
                        href="#future"
                        className="block text-gray-600 hover:text-[#781D32] transition-colors"
                      >
                        Looking Forward
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags - Currently not implemented in Article interface */}
                {/* 
                {article.tags && article.tags.length > 0 && (
                  <Card className="border border-[#55613C]/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-[#3E442B] mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-[#55613C]/10 text-[#55613C] hover:bg-[#55613C]/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                */}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                id="article-content"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="prose prose-lg max-w-none prose-headings:text-[#3E442B] prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#781D32] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#3E442B]"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-[#55613C]/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      className={`transition-colors ${
                        isLiked
                          ? "border-[#781D32] bg-[#781D32]/10 text-[#781D32]"
                          : "border-gray-300 hover:border-[#781D32] hover:text-[#781D32]"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                      />
                      {isLiked ? 1 : 0} likes
                    </Button>

                    <Button
                      variant="outline"
                      className="border-gray-300 hover:border-[#781D32] hover:text-[#781D32]"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />0 comments
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleShare("default")}
                    className="bg-[#781D32] hover:bg-[#781D32]/90 text-white"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Article
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
                Related Articles
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Continue exploring our coverage of Palestinian solidarity and
                Finnish civil society engagement
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

      <Footer />
    </div>
  );
}
