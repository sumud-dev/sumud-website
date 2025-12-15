"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { SubCampaignCard } from "./SubCampaignCard";
import { CampaignScrollspyNav } from "./SubCampaignSection";
import type { Campaign } from "@prisma/client";

interface CampaignWithSubCampaigns extends Campaign {
  category?: {
    id: string;
    name: string;
    slug: string;
    type: string;
  } | null;
  subCampaigns?: Array<
    Campaign & {
      _count?: { updates: number; translations: number; subCampaigns: number };
    }
  >;
  _count?: { updates: number; translations: number; subCampaigns: number };
}

interface CampaignOnePageLayoutProps {
  campaign: CampaignWithSubCampaigns;
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const subCampaigns = campaign.subCampaigns ?? [];

  // Group sub-campaigns by section type
  const heroSection = subCampaigns.find((s) => s.sectionType === "hero");
  const aboutSection = subCampaigns.find((s) => s.sectionType === "about");
  const issuesSection = subCampaigns.filter((s) => s.sectionType === "issues");
  const planSection = subCampaigns.filter((s) => s.sectionType === "plan");
  const ctaSection = subCampaigns.find((s) => s.sectionType === "cta");
  const otherSections = subCampaigns.filter(
    (s) =>
      !s.sectionType ||
      !["hero", "about", "issues", "plan", "cta", "contact"].includes(
        s.sectionType,
      ),
  );

  // Handle scroll for back-to-top button and scrollspy
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Update active section based on scroll position
      let currentSection: string | null = null;
      sectionRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          currentSection = id;
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current.get(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const registerSection = (id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    }
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
      {/* Scrollspy Navigation */}
      {subCampaigns.length > 0 && (
        <CampaignScrollspyNav
          subCampaigns={subCampaigns}
          activeSection={activeSection ?? undefined}
          onSectionClick={scrollToSection}
        />
      )}

      {/* Hero Section */}
      <section
        ref={(el) => registerSection("hero", el)}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        {campaign.bannerImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${campaign.bannerImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#781D32] via-[#5a1626] to-[#3e442b]">
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
          className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20"
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
            {heroSection?.title || campaign.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {heroSection?.description || campaign.description}
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
              Take Action
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10"
              onClick={onShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Campaign
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
      {(aboutSection || campaign.goalsObjectives) && (
        <section
          ref={(el) => registerSection("about", el)}
          className="py-20 bg-white"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto px-4"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="bg-[#55613C]/10 text-[#55613C] mb-4">
                About This Campaign
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3e442b] mb-4">
                {aboutSection?.title || "Our Mission"}
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="prose prose-lg max-w-none text-gray-700"
            >
              {aboutSection?.detailedContent ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: aboutSection.detailedContent,
                  }}
                />
              ) : campaign.goalsObjectives ? (
                <p className="text-lg leading-relaxed">
                  {campaign.goalsObjectives}
                </p>
              ) : (
                <p className="text-lg leading-relaxed">
                  {campaign.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Issues Section */}
      {issuesSection.length > 0 && (
        <section
          ref={(el) => registerSection("issues", el)}
          className="py-20 bg-[#f4f3f0]"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto px-4"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="bg-amber-100 text-amber-800 mb-4">
                Key Issues
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3e442b]">
                Problems We Address
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {issuesSection.map((issue, idx) => (
                <SubCampaignCard
                  key={issue.id}
                  campaign={issue}
                  index={idx}
                  variant="card"
                />
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* The Plan / Initiatives Section */}
      {(planSection.length > 0 || otherSections.length > 0) && (
        <section
          ref={(el) => registerSection("plan", el)}
          className="py-20 bg-white"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto px-4"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="bg-blue-100 text-blue-800 mb-4">Our Plan</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3e442b]">
                Initiatives & Actions
              </h2>
            </motion.div>

            {/* Timeline layout for plan items */}
            <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
              {[...planSection, ...otherSections].map((item, idx) => (
                <SubCampaignCard
                  key={item.id}
                  campaign={item}
                  index={idx}
                  variant="timeline"
                />
              ))}
            </motion.div>

            {/* Accordion for expandable details */}
            {planSection.length > 3 && (
              <motion.div variants={fadeInUp} className="mt-12">
                <Accordion type="single" collapsible>
                  <AccordionItem value="more-initiatives">
                    <AccordionTrigger className="text-[#781D32] hover:text-[#781D32]/80">
                      View All Initiatives ({planSection.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {planSection.slice(3).map((item, idx) => (
                          <SubCampaignCard
                            key={item.id}
                            campaign={item}
                            index={idx + 3}
                            variant="compact"
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* Call to Action Section */}
      <section
        ref={(el) => registerSection("cta", el)}
        className="py-20 bg-gradient-to-r from-[#781D32] to-[#55613C] text-white"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <motion.div variants={fadeInUp}>
            <Target className="w-16 h-16 mx-auto mb-6 opacity-80" />
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            {ctaSection?.title || "Ready to Make a Difference?"}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            {ctaSection?.description ||
              "Join thousands of supporters in our mission. Every action counts."}
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
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Detailed Content Section (if available) */}
      {campaign.detailedContent && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
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
