/**
 * Block Renderer Components
 * 
 * These components render each block type for the frontend pages.
 * They use existing components from the codebase where possible.
 */

"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils/utils";
import { 
  Heart, 
  ShoppingBag, 
  Globe, 
  BookOpen, 
  Megaphone, 
  HandshakeIcon, 
  Shield, 
  Users, 
  FileText, 
  ArrowRight,
  Calendar,
  MapPin,
  ChevronRight,
  Flag,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Church,
  LucideIcon 
} from "lucide-react";
import NewsletterSignup from "@/src/components/ui/newsletter-signup";
import { useTranslations } from "next-intl";
import { useEvents } from "@/src/lib/hooks/use-events";
import { useArticles } from "@/src/lib/hooks/use-articles";
import { useCampaigns } from "@/src/lib/hooks/use-campaigns";
import type {
  PageBlock,
  HeroBlockContent,
  StatsBlockContent,
  CampaignsGridBlockContent,
  QuoteBlockContent,
  HeadingBlockContent,
  TextBlockContent,
  ImageBlockContent,
  CarouselBlockContent,
  CtaBlockContent,
  FormBlockContent,
  VideoBlockContent,
  DividerBlockContent,
  HeritageHeroBlockContent,
  NewsSectionBlockContent,
  EventsSectionBlockContent,
  CampaignsSectionBlockContent,
  NewsletterSectionBlockContent,
  PageHeroBlockContent,
  MissionSectionBlockContent,
  FeaturesSectionBlockContent,
  ValuesSectionBlockContent,
  EngagementSectionBlockContent,
  CtaSectionBlockContent,
} from "@/src/lib/types/page";

// Icon map for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Globe,
  Heart,
  BookOpen,
  Megaphone,
  HandshakeIcon,
  Shield,
  Users,
  FileText,
  ArrowRight,
  ShoppingBag,
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Hero Block
export function HeroBlock({ content }: { content: HeroBlockContent }) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {content.image && (
        <div className="absolute inset-0">
          <Image
            src={content.image}
            alt={content.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4"
          {...fadeInUp}
        >
          {content.title}
        </motion.h1>
        {content.subtitle && (
          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            {content.subtitle}
          </motion.p>
        )}
        {content.buttonText && content.buttonUrl && (
          <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
            <Button asChild size="lg" className="text-lg">
              <Link href={content.buttonUrl}>{content.buttonText}</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Stats Block
export function StatsBlock({ content }: { content: StatsBlockContent }) {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {content.items.map((item, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {item.value}
              </div>
              <div className="text-muted-foreground">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Campaigns Grid Block (placeholder - integrates with campaigns)
export function CampaignsGridBlock({ content }: { content: CampaignsGridBlockContent }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {content.title && (
          <h2 className="text-3xl font-bold text-center mb-4">{content.title}</h2>
        )}
        {content.subtitle && (
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        )}
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
          <p>Campaigns Grid</p>
          <p className="text-sm">Showing {content.showCount} campaigns</p>
        </div>
      </div>
    </section>
  );
}

// Quote Block
export function QuoteBlock({ content }: { content: QuoteBlockContent }) {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.blockquote
          className="text-2xl md:text-3xl font-medium italic mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          &ldquo;{content.text}&rdquo;
        </motion.blockquote>
        {content.author && (
          <p className="text-muted-foreground text-lg">— {content.author}</p>
        )}
        {content.buttonText && content.buttonUrl && (
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href={content.buttonUrl}>{content.buttonText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// Heading Block
export function HeadingBlock({ content }: { content: HeadingBlockContent }) {
  const sizeClasses = {
    h1: "text-4xl md:text-5xl",
    h2: "text-3xl md:text-4xl",
    h3: "text-2xl md:text-3xl",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {content.level === "h1" && (
        <h1 className={cn("font-bold", sizeClasses.h1)}>{content.text}</h1>
      )}
      {content.level === "h2" && (
        <h2 className={cn("font-bold", sizeClasses.h2)}>{content.text}</h2>
      )}
      {content.level === "h3" && (
        <h3 className={cn("font-bold", sizeClasses.h3)}>{content.text}</h3>
      )}
    </div>
  );
}

// Text Block
export function TextBlock({ content }: { content: TextBlockContent }) {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground leading-relaxed">{content.text}</p>
      </div>
    </div>
  );
}

// Image Block
export function ImageBlock({ content }: { content: ImageBlockContent }) {
  if (!content.src) return null;

  return (
    <figure className="container mx-auto px-4 py-8">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image
          src={content.src}
          alt={content.alt || ""}
          fill
          className="object-cover"
        />
      </div>
      {content.caption && (
        <figcaption className="text-center text-muted-foreground mt-4">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Carousel Block
export function CarouselBlock({ content }: { content: CarouselBlockContent }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!content.slides || content.slides.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        {content.slides[currentIndex]?.image && (
          <Image
            src={content.slides[currentIndex].image}
            alt={content.slides[currentIndex].caption || ""}
            fill
            className="object-cover transition-opacity"
          />
        )}
        {content.slides[currentIndex]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center">
            {content.slides[currentIndex].caption}
          </div>
        )}
      </div>
      {content.slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {content.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// CTA Block
export function CtaBlock({ content }: { content: CtaBlockContent }) {
  const variantMap = {
    primary: "default",
    secondary: "secondary",
    outline: "outline",
  } as const;

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Button
        asChild
        variant={variantMap[content.style]}
        size="lg"
      >
        <Link href={content.url}>{content.text}</Link>
      </Button>
    </div>
  );
}

// Form Block (placeholder)
export function FormBlock({ content }: { content: FormBlockContent }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <form className="space-y-4">
        {content.fields.map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
              />
            ) : field.type === "checkbox" ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  required={field.required}
                  className="rounded border-input"
                />
                <span className="text-sm">{field.placeholder}</span>
              </div>
            ) : (
              <input
                type={field.type}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
        <Button type="submit" className="w-full">
          {content.submitText || "Submit"}
        </Button>
      </form>
    </div>
  );
}

// Video Block
export function VideoBlock({ content }: { content: VideoBlockContent }) {
  if (!content.url) return null;

  // Parse YouTube/Vimeo URLs
  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}${content.autoplay ? "?autoplay=1" : ""}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}${content.autoplay ? "?autoplay=1" : ""}`;
    }

    return url;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={getEmbedUrl(content.url)}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// Divider Block
export function DividerBlock({ content }: { content: DividerBlockContent }) {
  if (content.style === "space") {
    return <div className="h-16" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <hr
        className={cn(
          "border-t",
          content.style === "dashed" ? "border-dashed" : "border-solid"
        )}
      />
    </div>
  );
}

// Section Layout Blocks

// Heritage Hero Section Block
export function HeritageHeroSectionBlock({ content }: { content: HeritageHeroBlockContent }) {
  return (
    <section className="relative min-h-screen bg-linear-to-br from-[#F4F3F0] via-[#FAF9F6] to-[#F0EDE5] overflow-hidden flex items-center">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-[#55613C] rounded-full" />
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-[#781D32] rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#3E442B] rounded-full" />
      </div>

      {/* Main content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text Content */}
          <motion.div
            className="space-y-8 lg:space-y-12 text-center lg:text-left"
            variants={{
              initial: {},
              animate: { transition: { staggerChildren: 0.15 } },
            }}
            initial="initial"
            animate="animate"
          >
            {/* Small decorative element */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center lg:justify-start"
            >
              <div className="w-16 h-1 bg-linear-to-r from-[#55613C] via-[#781D32] to-[#55613C] rounded-full" />
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              variants={{ 
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="block text-[#3E442B] mb-2">{content.title}</span>
              <span className="block text-[#55613C]">{content.subtitle}</span>
            </motion.h1>

            {/* Elegant tagline */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl font-serif italic text-[#55613C] leading-relaxed"
              variants={fadeInUp}
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              {content.description}
            </motion.p>

            {/* Decorative divider */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center lg:justify-start items-center space-x-4"
            >
              <div className="w-12 h-px bg-[#55613C] opacity-40" />
              <div className="w-2 h-2 bg-[#781D32] rounded-full" />
              <div className="w-12 h-px bg-[#55613C] opacity-40" />
            </motion.div>

            {/* Description paragraph */}
            <motion.p
              className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              variants={fadeInUp}
            >
              {content.tagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={fadeInUp}
            >
              <Link href={content.joinButtonUrl} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#781D32] hover:bg-[#5C1625] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  {content.joinButtonText}
                  <Heart className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </Link>

              <Link href={content.learnButtonUrl} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#3E442B] text-[#3E442B] hover:bg-[#3E442B] hover:text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  {content.learnButtonText}
                  <ShoppingBag className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            className="relative"
            variants={{
              initial: { opacity: 0, x: 40 },
              animate: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            initial="initial"
            animate="animate"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {content.image && (
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={content.image}
                    alt={content.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#3E442B]/20 to-transparent" />
                </div>
              )}
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-4 border-[#781D32] rounded-full -z-10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-[#55613C] rounded-full -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// News Section Block - Fetches articles from database using TanStack Query
export function NewsSectionBlock({ content }: { content: NewsSectionBlockContent }) {
  const { data: articles = [], isLoading } = useArticles({
    status: "published",
    limit: content.showCount || 3,
  });

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#F5F5F4] via-[#FAFAF9] to-[#E7E5E4]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: "#722F37" }}>
            {content.title || "Latest News & Updates"}
          </h2>
          <div
            className="w-24 h-1 mx-auto rounded-full"
            style={{
              background: "linear-gradient(90deg, rgba(107, 142, 35, 0) 0%, rgba(107, 142, 35, 1) 50%, rgba(107, 142, 35, 0) 100%)",
            }}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {Array.from({ length: content.showCount || 2 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white/50 backdrop-blur-md animate-pulse"
                style={{
                  border: "0.5px solid rgba(232, 220, 196, 0.4)",
                }}
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg backdrop-blur-md bg-white/50">
            <p className="text-lg">No articles available</p>
            <p className="text-sm">Check back soon for new content</p>
          </div>
        ) : (
          <motion.div
            className="grid lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {articles.slice(0, content.showCount || 2).map((article, index) => {
              const isHighlighted = index === 1; // Second article is highlighted
              
              return (
                <motion.div key={article.id} variants={fadeInUp}>
                  <div
                    className={`h-full backdrop-blur-xl rounded-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden group ${
                      isHighlighted ? "hover:shadow-2xl" : "hover:shadow-xl"
                    }`}
                    style={{
                      background: isHighlighted
                        ? "rgba(255, 240, 242, 0.85)"
                        : "rgba(255, 248, 240, 0.8)",
                      border: isHighlighted
                        ? "0.5px solid rgba(120, 29, 50, 0.25)"
                        : "0.5px solid rgba(232, 220, 196, 0.4)",
                      boxShadow: isHighlighted
                        ? "0 10px 15px -3px rgba(120, 29, 50, 0.12), 0 4px 6px -2px rgba(120, 29, 50, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)"
                        : "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    <div className="p-8">
                      <div className="mb-6">
                        <span
                          className="px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md inline-block"
                          style={{
                            backgroundColor: isHighlighted ? "#722F37" : "#6B8E23",
                            color: "white",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {article.category || "Article"}
                        </span>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3
                            className="text-2xl font-bold mb-4 group-hover:text-opacity-90 transition-colors line-clamp-2"
                            style={{ color: "#722F37" }}
                          >
                            {article.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-lg line-clamp-3">
                            {article.excerpt}
                          </p>
                        </div>

                        <div
                          className="flex items-center justify-between pt-6"
                          style={{
                            borderTop: `0.5px solid ${isHighlighted ? "rgba(120, 29, 50, 0.15)" : "rgba(232, 220, 196, 0.5)"}`,
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Calendar
                              className="h-4 w-4"
                              style={{ color: "#6B8E23" }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#6B8E23" }}
                            >
                              {article.publishedAt
                                ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>
                          <Link href={`/articles/${article.slug}`}>
                            <Button
                              variant="ghost"
                              className="font-semibold transition-all duration-200 hover:backdrop-blur-md"
                              style={{
                                color: "#722F37",
                                background: "rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              Read More
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          className="text-center mt-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Link href="/articles">
            <Button
              size="lg"
              className="font-semibold px-8 py-3 rounded-xl transition-all duration-300 backdrop-blur-md hover:backdrop-blur-xl"
              style={{
                border: "0.5px solid rgba(107, 142, 35, 0.4)",
                color: "#6B8E23",
                background: "rgba(255, 248, 240, 0.8)",
                boxShadow: "0 4px 6px -1px rgba(107, 142, 35, 0.1)",
              }}
            >
              View All Articles
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Events Section Block - Fetches events from database using TanStack Query
export function EventsSectionBlock({ content }: { content: EventsSectionBlockContent }) {
  const { data: eventsResponse, isLoading } = useEvents({
    status: "published",
    limit: content.showCount || 3,
  });

  const events = eventsResponse?.data || [];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#E8DCC4]/30 via-[#FFF8F0] to-[#E8DCC4]/30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: "#722F37" }}>
            {content.title || "Upcoming Events"}
          </h2>
          <div
            className="w-24 h-1 mx-auto rounded-full"
            style={{
              background: "linear-gradient(90deg, rgba(120, 29, 50, 0) 0%, rgba(120, 29, 50, 1) 50%, rgba(120, 29, 50, 0) 100%)",
            }}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: content.showCount || 3 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-white/50 backdrop-blur-md animate-pulse"
                style={{
                  border: "0.5px solid rgba(232, 220, 196, 0.4)",
                }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg backdrop-blur-md bg-white/50">
            <p className="text-lg">No upcoming events</p>
            <p className="text-sm">Check back soon for new events</p>
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {events.slice(0, content.showCount || 3).map((event) => {
              // Format date - check various date fields
              const dateValue = event.start_date || event.startDate || (event as { date?: string }).date;
              const eventDate = dateValue
                ? new Date(dateValue).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";

              return (
                <motion.div key={event.id} variants={fadeInUp}>
                  <div
                    className="flex flex-col h-full backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-300 transform hover:scale-105 group"
                    style={{
                      background: "rgba(255, 248, 240, 0.8)",
                      border: "0.5px solid rgba(232, 220, 196, 0.4)",
                      boxShadow:
                        "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                      minHeight: "480px", // Ensure consistent card height
                    }}
                  >
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <Image
                        src={(event as { featuredImage?: string }).featuredImage || event.featured_image || "/images/hero-embroidery.jpg"}
                        alt={event.title || "Event"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      {event.event_type && (
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-md"
                            style={{
                              backgroundColor: "#722F37",
                              color: "white",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            {event.event_type}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="space-y-4 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <h3
                            className="text-lg font-bold mb-2 group-hover:text-opacity-80 transition-colors line-clamp-2 min-h-[3.5rem]"
                            style={{ 
                              color: "#722F37",
                              lineHeight: "1.75rem", // Explicit line height for consistent spacing
                            }}
                          >
                            {event.title}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 min-h-[4rem]">
                            {event.description || event.content}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm text-gray-700 flex-shrink-0">
                          {eventDate && (
                            <div className="flex items-center">
                              <Calendar
                                className="h-4 w-4 mr-2 flex-shrink-0"
                                style={{ color: "#722F37" }}
                              />
                              <span className="truncate">{eventDate}</span>
                            </div>
                          )}
                          {(event.venue_name || event.location) && (
                            <div className="flex items-center">
                              <MapPin
                                className="h-4 w-4 mr-2 flex-shrink-0"
                                style={{ color: "#722F37" }}
                              />
                              <span className="truncate">{event.venue_name || event.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 mt-auto">
                          <Link href={`/events/${event.slug || event.id}`}>
                            <Button
                              className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 backdrop-blur-md"
                              style={{
                                backgroundColor: "#722F37",
                                boxShadow: "0 4px 12px -2px rgba(120, 29, 50, 0.4)",
                              }}
                            >
                              Learn More
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          className="text-center mt-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Link href="/events">
            <Button
              size="lg"
              className="font-semibold px-8 py-3 rounded-xl transition-all duration-300 backdrop-blur-md hover:backdrop-blur-xl"
              style={{
                border: "0.5px solid rgba(120, 29, 50, 0.4)",
                color: "#722F37",
                background: "rgba(255, 248, 240, 0.8)",
                boxShadow: "0 4px 6px -1px rgba(120, 29, 50, 0.1)",
              }}
            >
              View All Events
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Helper function to extract text from campaign description (can be string or rich text object)
function extractCampaignDescriptionText(description: unknown): string {
  if (!description) return '';
  
  // If it's already a string, return it
  if (typeof description === 'string') return description;
  
  // If it's a JSONB object with data property
  if (typeof description === 'object' && description !== null && 'data' in description) {
    const desc = description as { type?: string; data?: unknown };
    if (typeof desc.data === 'string') {
      return desc.data;
    }
    // For blocks type, try to extract text from blocks
    if (desc.type === 'blocks' && Array.isArray(desc.data)) {
      return desc.data.map((block: { text?: string }) => block.text || '').join(' ');
    }
  }
  
  return '';
}

// Campaign type labels for display
const campaignTypeLabels: Record<string, string> = {
  boycott: "Boycott",
  "policy-advocacy": "Policy Advocacy",
  "community-action": "Community Action",
  awareness: "Awareness",
  advocacy: "Advocacy",
  fundraising: "Fundraising",
  community_building: "Community Building",
  education: "Education",
  solidarity: "Solidarity",
  humanitarian: "Humanitarian",
  political: "Political",
  cultural: "Cultural",
  environmental: "Environmental",
};

// Icon mapping helper for campaigns
const getCampaignIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "shield-check": <ShieldCheck className="w-6 h-6" />,
    "shield-off": <ShieldOff className="w-6 h-6" />,
    "shopping-cart": <ShoppingCart className="w-6 h-6" />,
    flag: <Flag className="w-6 h-6" />,
    church: <Church className="w-6 h-6" />,
    megaphone: <Megaphone className="w-6 h-6" />,
    heart: <Heart className="w-6 h-6" />,
    users: <Users className="w-6 h-6" />,
  };
  return iconMap[iconName] || <Flag className="w-6 h-6" />;
};

// Campaigns Section Block - Fetches campaigns from database using TanStack Query
export function CampaignsSectionBlock({ content }: { content: CampaignsSectionBlockContent }) {
  // Fetch campaigns without isFeatured filter (same as campaigns page)
  // Then sort by featured status on frontend
  const { data: campaignsResponse, isLoading } = useCampaigns({});

  // Get campaigns from API response and sort by featured status
  const allCampaigns = campaignsResponse?.data || [];
  const campaigns = [...allCampaigns]
    .sort((a, b) => {
      // Featured campaigns first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    })
    .slice(0, content.showCount || 3);

  // Default campaign color
  const defaultColor = "#722F37";

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#FFF8F0] via-[#E8DCC4]/30 to-[#FFF8F0]" />

      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#781D32]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B8E23]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Glass icon container */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-glass-md backdrop-blur-xl"
            style={{
              background: "rgba(120, 29, 50, 0.15)",
              border: "0.5px solid rgba(120, 29, 50, 0.3)",
            }}
          >
            <Flag className="w-8 h-8 text-[#722F37]" />
          </div>
          <h2
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: "#722F37" }}
          >
            {content.title || "Active Campaigns"}
          </h2>
          {content.subtitle && (
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              {content.subtitle}
            </p>
          )}
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: content.showCount || 3 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-white/50 backdrop-blur-md animate-pulse"
                style={{
                  border: "0.5px solid rgba(232, 220, 196, 0.4)",
                }}
              />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg backdrop-blur-md bg-white/50">
            <p className="text-lg">No active campaigns</p>
            <p className="text-sm">Check back soon for new campaigns</p>
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {campaigns.slice(0, content.showCount || 3).map((campaign) => {
              const campaignColor = defaultColor;
              const iconName = campaign.iconName || "flag";
              const typeLabel = campaignTypeLabels[campaign.campaignType || "awareness"] || "Campaign";
              
              return (
                <motion.div key={campaign.id} variants={fadeInUp}>
                  <div className="h-full group">
                    <div
                      className="h-full backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: "rgba(255, 248, 240, 0.8)",
                        border: "0.5px solid rgba(232, 220, 196, 0.4)",
                        boxShadow:
                          "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      {/* Campaign Featured Image with Icon Overlay */}
                      <div className="relative h-56 overflow-hidden">
                        {(campaign.featuredImage || campaign.image) && (
                          <Image
                            src={campaign.featuredImage || campaign.image || "/images/hero-embroidery.jpg"}
                            alt={campaign.title || "Campaign"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        {/* Gradient overlay for better text/icon visibility */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${campaignColor}40 0%, ${campaignColor}20 50%, transparent 100%)`,
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                      </div>

                      {/* Campaign Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3
                            className="text-xl font-bold mb-3 group-hover:text-opacity-80 transition-colors line-clamp-2"
                            style={{ color: "#722F37" }}
                          >
                            {campaign.title}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                            {extractCampaignDescriptionText(campaign.description) || extractCampaignDescriptionText(campaign.content)}
                          </p>
                        </div>

                        {/* Action Button */}
                        <Link href={`/campaigns/${campaign.slug}`}>
                          <Button
                            className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md"
                            style={{
                              backgroundColor: campaignColor,
                              boxShadow: `0 4px 12px -2px ${campaignColor}40`,
                            }}
                          >
                            Take Action
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View All Campaigns Button */}
        <motion.div
          className="text-center mt-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Link href="/campaigns">
            <Button
              size="lg"
              className="text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md"
              style={{
                backgroundColor: "#722F37",
                boxShadow: "0 10px 15px -3px rgba(120, 29, 50, 0.3)",
              }}
            >
              View All Campaigns
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Newsletter Section Block
export function NewsletterSectionBlock({ content }: { content: NewsletterSectionBlockContent }) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#55613C] to-[#6B8E23]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#781D32]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFF8F0]/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <NewsletterSignup variant={content.variant || "default"} />
      </div>
    </section>
  );
}

// ========================================
// Editable Page Section Blocks (with locale-nested content)
// ========================================

// Helper to get content for current locale with fallback
function getLocalizedContent<T>(content: { en: T; fi?: T; ar?: T }, locale: string): T {
  const localeKey = locale as 'en' | 'fi' | 'ar';
  return content[localeKey] || content.en;
}

// Page Hero Block - Editable hero section
export function PageHeroBlock({ content, locale = 'en' }: { content: PageHeroBlockContent; locale?: string }) {
  const localizedContent = getLocalizedContent(content.content, locale);
  const Icon = content.icon ? iconMap[content.icon] : Globe;

  return (
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
            background: "radial-gradient(circle, rgba(255, 248, 240, 0.15) 0%, rgba(255, 248, 240, 0) 70%)",
            filter: "blur(40px)",
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-[15%] w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(107, 142, 35, 0.2) 0%, rgba(107, 142, 35, 0) 70%)",
            filter: "blur(50px)",
          }}
          animate={{ y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
          {Icon && (
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 backdrop-blur-xl"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "0.5px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>
          )}

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
            {localizedContent.title}
            <span className="block text-3xl lg:text-4xl font-medium opacity-90 mt-3">
              {localizedContent.subtitle}
            </span>
          </h1>

          <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
            {localizedContent.description}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Mission Section Block - Editable mission statement
export function MissionSectionBlock({ content, locale = 'en' }: { content: MissionSectionBlockContent; locale?: string }) {
  const localizedContent = getLocalizedContent(content.content, locale);

  return (
    <motion.section
      className="py-12 relative"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="backdrop-blur-xl rounded-3xl p-12"
          style={{
            background: "rgba(255, 255, 255, 0.90)",
            border: "0.5px solid rgba(232, 220, 196, 0.4)",
            boxShadow: "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
          }}
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-6">
              {localizedContent.title}
            </h2>
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
              {localizedContent.description}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// Features Section Block - Editable features grid
export function FeaturesSectionBlock({ content, locale = 'en' }: { content: FeaturesSectionBlockContent; locale?: string }) {
  const headerContent = getLocalizedContent(content.header, locale);
  const columns = content.columns || 4;

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <motion.section
      className="py-16"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
            {headerContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {headerContent.subtitle}
          </p>
        </motion.div>

        <div className={cn("grid gap-6", gridCols[columns])}>
          {content.items.map((item, index) => {
            const ItemIcon = iconMap[item.icon] || Globe;
            const itemContent = getLocalizedContent(item.content, locale);
            return (
              <motion.div
                key={item.key}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="backdrop-blur-xl rounded-3xl p-6 h-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.80)",
                    border: "0.5px solid rgba(232, 220, 196, 0.4)",
                    boxShadow: "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
                  }}
                >
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", item.color)}>
                    <ItemIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#3E442B] mb-3">
                    {itemContent.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {itemContent.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// Values Section Block - Editable values display
export function ValuesSectionBlock({ content, locale = 'en' }: { content: ValuesSectionBlockContent; locale?: string }) {
  const headerContent = getLocalizedContent(content.header, locale);

  return (
    <motion.section
      className="py-16"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
            {headerContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {headerContent.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {content.items.map((item, index) => {
            const ItemIcon = iconMap[item.icon] || Heart;
            const itemContent = getLocalizedContent(item.content, locale);
            return (
              <motion.div
                key={item.key}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="backdrop-blur-xl rounded-3xl p-8 h-full transition-all duration-300 hover:scale-105 text-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.80)",
                    border: "0.5px solid rgba(232, 220, 196, 0.4)",
                    boxShadow: "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
                  }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #781D32, #55613C)" }}
                    >
                      <ItemIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#3E442B] mb-4">
                    {itemContent.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {itemContent.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// Engagement Section Block - Editable engagement cards
export function EngagementSectionBlock({ content, locale = 'en' }: { content: EngagementSectionBlockContent; locale?: string }) {
  const headerContent = getLocalizedContent(content.header, locale);

  return (
    <motion.section
      className="py-16"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
            {headerContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {headerContent.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {content.items.map((item, index) => {
            const ItemIcon = iconMap[item.icon] || FileText;
            const itemContent = getLocalizedContent(item.content, locale);
            return (
              <motion.div
                key={item.key}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="backdrop-blur-xl rounded-3xl p-8 h-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.80)",
                    border: "0.5px solid rgba(232, 220, 196, 0.4)",
                    boxShadow: "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#781D32]">
                        <ItemIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#3E442B] mb-2">
                        {itemContent.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                        {itemContent.description}
                      </p>
                      {item.href ? (
                        <Link href={item.href} className="text-[#781D32] font-semibold hover:text-[#781D32]/80 transition-colors text-sm">
                          {itemContent.action} →
                        </Link>
                      ) : (
                        <button className="text-[#781D32] font-semibold hover:text-[#781D32]/80 transition-colors text-sm">
                          {itemContent.action} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// CTA Section Block - Editable call-to-action
export function CtaSectionBlock({ content, locale = 'en' }: { content: CtaSectionBlockContent; locale?: string }) {
  const localizedContent = getLocalizedContent(content.content, locale);

  return (
    <motion.section
      className="py-20 relative overflow-hidden"
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#FFF8F0] via-[#E8DCC4]/30 to-[#FFF8F0]" />

      {/* Decorative Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#781D32]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B8E23]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className="backdrop-blur-xl rounded-3xl p-12 text-center transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(212, 175, 55, 0.1) 100%)",
            border: "0.5px solid rgba(212, 175, 55, 0.4)",
            boxShadow: "0 16px 40px rgba(212, 175, 55, 0.15), 0 8px 20px rgba(120, 29, 50, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 0 40px rgba(212, 175, 55, 0.08)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
            style={{
              background: "rgba(120, 29, 50, 0.15)",
              border: "0.5px solid rgba(120, 29, 50, 0.3)",
            }}
          >
            <Heart className="h-10 w-10 text-[#781D32]" />
          </div>

          <h2 className="text-4xl font-bold text-[#3E442B] mb-4">
            {localizedContent.title}
          </h2>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
            {localizedContent.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="backdrop-blur-md rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "#781D32",
                color: "white",
                border: "0.5px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(120, 29, 50, 0.25)",
              }}
            >
              <Link href={content.primaryButtonHref || "/membership"}>
                {localizedContent.primaryButtonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="backdrop-blur-md rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "0.5px solid rgba(85, 97, 60, 0.3)",
                color: "#55613C",
              }}
            >
              <Link href={content.secondaryButtonHref || "/about"}>
                {localizedContent.secondaryButtonText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// Main Block Renderer
export function BlockRenderer({ block, locale = 'en' }: { block: PageBlock; locale?: string }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock content={block.content as HeroBlockContent} />;
    case "stats":
      return <StatsBlock content={block.content as StatsBlockContent} />;
    case "campaigns-grid":
      return <CampaignsGridBlock content={block.content as CampaignsGridBlockContent} />;
    case "quote":
      return <QuoteBlock content={block.content as QuoteBlockContent} />;
    case "heading":
      return <HeadingBlock content={block.content as HeadingBlockContent} />;
    case "text":
      return <TextBlock content={block.content as TextBlockContent} />;
    case "image":
      return <ImageBlock content={block.content as ImageBlockContent} />;
    case "carousel":
      return <CarouselBlock content={block.content as CarouselBlockContent} />;
    case "cta":
      return <CtaBlock content={block.content as CtaBlockContent} />;
    case "form":
      return <FormBlock content={block.content as FormBlockContent} />;
    case "video":
      return <VideoBlock content={block.content as VideoBlockContent} />;
    case "divider":
      return <DividerBlock content={block.content as DividerBlockContent} />;
    // Section Layouts
    case "heritage-hero":
      return <HeritageHeroSectionBlock content={block.content as HeritageHeroBlockContent} />;
    case "news-section":
      return <NewsSectionBlock content={block.content as NewsSectionBlockContent} />;
    case "events-section":
      return <EventsSectionBlock content={block.content as EventsSectionBlockContent} />;
    case "campaigns-section":
      return <CampaignsSectionBlock content={block.content as CampaignsSectionBlockContent} />;
    case "newsletter-section":
      return <NewsletterSectionBlock content={block.content as NewsletterSectionBlockContent} />;
    // Editable page sections (with locale-nested content)
    case "page-hero":
      return <PageHeroBlock content={block.content as PageHeroBlockContent} locale={locale} />;
    case "mission-section":
      return <MissionSectionBlock content={block.content as MissionSectionBlockContent} locale={locale} />;
    case "features-section":
      return <FeaturesSectionBlock content={block.content as FeaturesSectionBlockContent} locale={locale} />;
    case "values-section":
      return <ValuesSectionBlock content={block.content as ValuesSectionBlockContent} locale={locale} />;
    case "engagement-section":
      return <EngagementSectionBlock content={block.content as EngagementSectionBlockContent} locale={locale} />;
    case "cta-section":
      return <CtaSectionBlock content={block.content as CtaSectionBlockContent} locale={locale} />;
    default:
      return null;
  }
}

// Page Renderer - renders all blocks
export function PageRenderer({ blocks, locale = 'en' }: { blocks: PageBlock[]; locale?: string }) {
  return (
    <div className="min-h-screen">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} locale={locale} />
      ))}
    </div>
  );
}
