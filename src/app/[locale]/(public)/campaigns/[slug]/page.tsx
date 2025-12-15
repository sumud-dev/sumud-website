"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  Download,
  Users,
  Target,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Heart,
  FileText,
  Video,
  BookOpen,
  Shield,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils/utils";
import {
  getCampaignBySlug,
  getRelatedCampaigns,
} from "@/src/lib/data/campaigns";

// Campaign type colors and gradients
const campaignThemes = {
  boycott: {
    color: "#ea580c",
    gradient: "from-orange-500/20 via-orange-400/10 to-transparent",
    badgeClass: "bg-orange-500 text-white",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
    accentClass: "text-orange-600",
    activeTabClass: "bg-orange-600 border-orange-600 text-green-800",
    hoverTabClass: "border-orange-500 bg-orange-50 text-orange-700",
  },
  "policy-advocacy": {
    color: "#dc2626",
    gradient: "from-red-500/20 via-red-400/10 to-transparent",
    badgeClass: "bg-red-500 text-white",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
    accentClass: "text-red-600",
    activeTabClass: "bg-red-600 border-red-600 text-green-800",
    hoverTabClass: "border-red-500 bg-red-50 text-red-700",
  },
  "community-action": {
    color: "#16a34a",
    gradient: "from-green-500/20 via-green-400/10 to-transparent",
    badgeClass: "bg-green-500 text-white",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    accentClass: "text-green-600",
    activeTabClass: "bg-green-600 border-green-600 text-green-800",
    hoverTabClass: "border-green-500 bg-green-50 text-green-700",
  },
  awareness: {
    color: "#059669",
    gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    badgeClass: "bg-emerald-500 text-white",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    accentClass: "text-emerald-600",
    activeTabClass: "bg-emerald-600 border-emerald-600 text-green-800",
    hoverTabClass: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
};

// Resource type icons
const resourceIcons = {
  guide: BookOpen,
  toolkit: FileText,
  article: FileText,
  video: Video,
  petition: Shield,
};

// Sub-campaign tab definitions
interface SubCampaignTab {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// SubCampaignTabs Component
interface SubCampaignTabsProps {
  campaign: ReturnType<typeof getCampaignBySlug>;
  locale: "en" | "fi" | "ar";
  theme: (typeof campaignThemes)[keyof typeof campaignThemes];
}

function SubCampaignTabs({ campaign, theme }: SubCampaignTabsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (!campaign) return null;

  // Generate sub-campaign tabs based on available campaign data
  const subCampaignTabs: SubCampaignTab[] = [];

  if (campaign.targets && campaign.targets.length > 0) {
    subCampaignTabs.push({
      id: "targets",
      title: "Boycott Targets",
      icon: Target,
      description: "Companies and products to boycott",
    });
  }

  if (campaign.demands && campaign.demands.length > 0) {
    subCampaignTabs.push({
      id: "demands",
      title: "Our Demands",
      icon: CheckCircle2,
      description: "Key demands of this campaign",
    });
  }

  if (campaign.howToParticipate && campaign.howToParticipate.length > 0) {
    subCampaignTabs.push({
      id: "participate",
      title: "Take Action",
      icon: Users,
      description: "Ways to get involved",
    });
  }

  if (campaign.resources && campaign.resources.length > 0) {
    subCampaignTabs.push({
      id: "resources",
      title: "Resources",
      icon: Download,
      description: "Guides, toolkits and materials",
    });
  }

  if (campaign.successStories && campaign.successStories.length > 0) {
    subCampaignTabs.push({
      id: "impact",
      title: "Impact",
      icon: TrendingUp,
      description: "Success stories and achievements",
    });
  }

  if (subCampaignTabs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Campaign Initiatives
        </h2>
        <p className="text-gray-600">
          Explore different aspects of this campaign
        </p>
      </div>

      <Tabs defaultValue={subCampaignTabs[0]?.id} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto p-2">
          {subCampaignTabs.map((tab, idx) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                data-theme={idx}
                className={cn(
                  "px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 border-2",
                  "bg-white text-gray-700 border-gray-300",
                  "hover:shadow-md hover:scale-[1.02]",
                  "active:scale-100",
                  "data-[state=active]:shadow-xl data-[state=active]:scale-105",
                  theme.activeTabClass.split(" ").map(cls => `data-[state=active]:${cls}`).join(" "),
                  theme.hoverTabClass.split(" ").map(cls => `hover:${cls}`).join(" ")
                )}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        {subCampaignTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tab.id === "targets" &&
                    campaign.targets?.map((target, index) => (
                      <SubCampaignCard
                        key={index}
                        title={target.split(" - ")[0] || target}
                        description={target.split(" - ")[1] || "Target for boycott"}
                        icon={Target}
                        theme={theme}
                        index={index}
                        isExpanded={expandedCard === `target-${index}`}
                        onToggle={() =>
                          setExpandedCard(
                            expandedCard === `target-${index}` ? null : `target-${index}`
                          )
                        }
                        expandedContent={
                          <div className="space-y-3">
                            <p className="text-gray-700">{target}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200"
                            >
                              Learn Why
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        }
                      />
                    ))}

                  {tab.id === "demands" &&
                    campaign.demands?.map((demand, index) => (
                      <SubCampaignCard
                        key={index}
                        title={`Demand ${index + 1}`}
                        description={demand}
                        icon={CheckCircle2}
                        theme={theme}
                        index={index}
                        isExpanded={expandedCard === `demand-${index}`}
                        onToggle={() =>
                          setExpandedCard(
                            expandedCard === `demand-${index}` ? null : `demand-${index}`
                          )
                        }
                        expandedContent={
                          <div className="space-y-3">
                            <p className="text-gray-700">{demand}</p>
                          </div>
                        }
                      />
                    ))}

                  {tab.id === "participate" &&
                    campaign.howToParticipate?.map((step, index) => (
                      <SubCampaignCard
                        key={index}
                        title={`Step ${index + 1}`}
                        description={step.substring(0, 80) + (step.length > 80 ? "..." : "")}
                        icon={Users}
                        theme={theme}
                        index={index}
                        isExpanded={expandedCard === `step-${index}`}
                        onToggle={() =>
                          setExpandedCard(
                            expandedCard === `step-${index}` ? null : `step-${index}`
                          )
                        }
                        expandedContent={
                          <div className="space-y-3">
                            <p className="text-gray-700">{step}</p>
                          </div>
                        }
                      />
                    ))}

                  {tab.id === "resources" &&
                    campaign.resources?.map((resource, index) => {
                      const Icon = resourceIcons[resource.type] || FileText;
                      return (
                        <SubCampaignCard
                          key={index}
                          title={resource.title}
                          description={`${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} resource`}
                          icon={Icon}
                          theme={theme}
                          index={index}
                          isExpanded={expandedCard === `resource-${index}`}
                          onToggle={() =>
                            setExpandedCard(
                              expandedCard === `resource-${index}` ? null : `resource-${index}`
                            )
                          }
                          expandedContent={
                            <div className="space-y-3">
                              <p className="text-gray-700">{resource.title}</p>
                              <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open Resource
                                  <ExternalLink className="w-4 h-4 ml-1" />
                                </a>
                              </Button>
                            </div>
                          }
                        />
                      );
                    })}

                  {tab.id === "impact" &&
                    campaign.successStories?.map((story, index) => (
                      <SubCampaignCard
                        key={index}
                        title={`Achievement ${index + 1}`}
                        description={story.substring(0, 80) + (story.length > 80 ? "..." : "")}
                        icon={TrendingUp}
                        theme={theme}
                        index={index}
                        isExpanded={expandedCard === `story-${index}`}
                        onToggle={() =>
                          setExpandedCard(
                            expandedCard === `story-${index}` ? null : `story-${index}`
                          )
                        }
                        expandedContent={
                          <div className="space-y-3">
                            <p className="text-gray-700">{story}</p>
                          </div>
                        }
                      />
                    ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// SubCampaignCard Component
interface SubCampaignCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  theme: (typeof campaignThemes)[keyof typeof campaignThemes];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  expandedContent: React.ReactNode;
}

function SubCampaignCard({
  title,
  description,
  icon: IconComponent,
  theme,
  index,
  isExpanded,
  onToggle,
  expandedContent,
}: SubCampaignCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-300 overflow-hidden",
          "border-2",
          isExpanded
            ? "ring-2 ring-gray-900 shadow-xl border-gray-900 bg-gray-50"
            : "border-gray-200 hover:border-gray-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        )}
        onClick={onToggle}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2.5 rounded-xl shrink-0 transition-all duration-200",
                theme.iconBg,
                isExpanded && "shadow-md scale-110"
              )}>
                <IconComponent className={cn("w-5 h-5", theme.iconColor)} />
              </div>
              <div>
                <h3 className={cn(
                  "font-semibold line-clamp-1 transition-colors",
                  isExpanded ? "text-gray-900" : "text-gray-800 group-hover:text-gray-900"
                )}>
                  {title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {description}
                </p>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "w-5 h-5 shrink-0 transition-all duration-200",
                isExpanded
                  ? "rotate-90 text-gray-900"
                  : "text-gray-400 group-hover:text-gray-600"
              )}
            />
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 pb-4 border-t border-gray-100 mt-2">
                <div className="pt-4">{expandedContent}</div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

interface CampaignDetailPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const resolvedParams = React.use(params);
  
  if (!resolvedParams || !resolvedParams.slug) {
    notFound();
  }
  
  const slug = resolvedParams.slug;
  const localeParam = resolvedParams.locale || "en";

  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const campaignType = campaign.type as keyof typeof campaignThemes;
  const theme = campaignThemes[campaignType] || campaignThemes["awareness"];
  const relatedCampaigns = getRelatedCampaigns(campaign.id);
  const locale = (localeParam || "en") as "en" | "fi" | "ar";

  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-[#fbfbfd] via-white to-[#f5f5f7]">
        {/* Back Navigation */}
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 pt-8">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Campaigns
          </Link>
        </div>

        {/* Hero Section with Gradient Background */}
        <section className="relative overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-br",
              theme.gradient
            )}
          />

          <div className="relative max-w-[980px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Campaign Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                {campaign.title[locale]}
              </h1>

              {/* Short Description */}
              <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-4xl font-light leading-relaxed">
                {campaign.shortDescription[locale]}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className={cn(
                    "rounded-full px-6 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
                    "bg-gray-900 hover:bg-gray-800 text-white hover:scale-105 active:scale-95"
                  )}
                >
                  <a
                    href={campaign.callToAction.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {campaign.callToAction.primary}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 h-12 text-base font-medium border-2 border-gray-400 text-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Campaign
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sub-Campaigns Tabs Section */}
        <section className="max-w-[980px] mx-auto px-4 sm:px-6 py-12">
          <SubCampaignTabs campaign={campaign} locale={locale} theme={theme} />
        </section>

        {/* Main Content */}
        <section className="max-w-[980px] mx-auto px-4 sm:px-6 pb-12 space-y-12">

          {/* Related Campaigns */}
          {relatedCampaigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8 sm:p-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Related Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCampaigns.map((related, index) => {
                  return (
                    <Link
                      key={related.id}
                      href={`/campaigns/${related.slug}`}
                      className="group"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="p-5 bg-linear-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-300 hover:shadow-xl hover:border-gray-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {related.title[locale]}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {related.shortDescription[locale]}
                        </p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Call-to-Action Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700/60 shadow-2xl p-10 sm:p-12 text-center"
          >
            <div
              className={cn(
                "inline-flex items-center justify-center w-16 h-16 rounded-full mb-6",
                theme.iconBg
              )}
            >
              <Heart className={cn("w-8 h-8", theme.iconColor)} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Take Action?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of supporters working for Palestinian freedom and
              justice. Every action counts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="rounded-full px-8 h-12 text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <a
                  href={campaign.callToAction.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {campaign.callToAction.primary}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              {campaign.callToAction.secondary && (
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-medium border-2 border-gray-600 text-black hover:bg-white/10 transition-all duration-200"
                >
                  {campaign.callToAction.secondary}
                </Button>
              )}
            </div>

            {/* Social Share Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-700/60">
              <p className="text-sm text-gray-400 mb-4">Share this campaign</p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
