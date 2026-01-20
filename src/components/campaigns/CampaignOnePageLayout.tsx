"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Variants } from "framer-motion";
import {
  ChevronUp,
  Calendar,
  Target,
  Users,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

// Local campaign interface for this component
interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  campaignType: string;
  status: string;
  bannerImageUrl?: string | null;
  featuredImageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  goalsObjectives?: string | null;
  detailedContent?: string | null;
}

interface CampaignOnePageLayoutProps {
  campaign: Campaign;
  onShare?: () => void;
  onTakeAction?: () => void;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function CampaignOnePageLayout({
  campaign,
  onShare,
  onTakeAction,
}: CampaignOnePageLayoutProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const tCommon = useTranslations("common");

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f3f0]">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        {campaign.bannerImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${campaign.bannerImageUrl})` }}
          >
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#781D32] via-[#5a1626] to-[#3e442b]">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-64 h-64 border-8 border-white rounded-full" />
              <div className="absolute bottom-10 left-10 w-48 h-48 border-8 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 border-8 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-7xl mx-auto text-center px-4 py-20"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm">
              {campaign.campaignType.replace("_", " ").toUpperCase()}
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            {campaign.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {campaign.description}
          </motion.p>

          {/* Date badge */}
          {(campaign.startDate || campaign.endDate) && (
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-2 text-white/80 mb-8"
            >
              <Calendar className="w-5 h-5" />
              <span>
                {formatDate(campaign.startDate)}
                {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
              </span>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-white text-[#781D32] hover:bg-white/90 font-semibold px-8"
              onClick={onTakeAction}
            >
              {tCommon("buttons.takeAction")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10"
              onClick={onShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              {tCommon("buttons.shareCampaign")}
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* About / Mission Section */}
      {campaign.goalsObjectives && (
        <section className="py-20 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto px-4"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="bg-[#55613C]/10 text-[#55613C] mb-4">
                About This Campaign
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3e442b] mb-4">
                Our Mission
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="prose prose-lg max-w-none text-gray-700"
            >
              <p className="text-lg leading-relaxed">
                {campaign.goalsObjectives}
              </p>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="py-20 bg-linear-to-r from-[#781D32] to-[#55613C] text-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 text-center"
        >
          <motion.div variants={fadeInUp}>
            <Target className="w-16 h-16 mx-auto mb-6 opacity-80" />
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Make a Difference?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of supporters in our mission. Every action counts.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-white text-[#781D32] hover:bg-white/90 font-semibold px-8"
              onClick={onTakeAction}
            >
              <Users className="w-5 h-5 mr-2" />
              Get Involved
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {tCommon("buttons.learnMore")}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Detailed Content Section (if available) */}
      {campaign.detailedContent && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="prose prose-lg max-w-none prose-headings:text-[#3e442b] prose-a:text-[#781D32]"
              dangerouslySetInnerHTML={{ __html: campaign.detailedContent }}
            />
          </div>
        </section>
      )}

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-[#781D32] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#5a1626] transition-colors z-50"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
