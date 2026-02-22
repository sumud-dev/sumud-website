"use client";

import React from "react";
import { notFound } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
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
  AlertCircle,
  Zap,
  Heart,
  FileText,
  Video,
  BookOpen,
  Shield,
  Loader,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useCampaign } from "@/src/lib/hooks/use-campaigns";
import { getDescriptionHtml } from "@/src/lib/utils/markdown";
import { type CampaignType, type CampaignParticipationStep, type CampaignResource, type CampaignSuccessStory } from "@/src/types/Campaigns";

// Campaign type colors matching the main page
const campaignTypeColors: Record<CampaignType, string> = {
  awareness: "#059669", // emerald-600
  advocacy: "#dc2626", // red-600
  fundraising: "#ea580c", // orange-600
  community_building: "#16a34a", // green-600
  education: "#0891b2", // cyan-600
  solidarity: "#7c3aed", // violet-600
  humanitarian: "#db2777", // rose-600
  political: "#854d0e", // amber-700
  cultural: "#1e40af", // blue-700
  environmental: "#166534", // green-800
};

// Icon mapping for campaign types
const campaignIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "shield-check": Shield,
  "shield-off": Shield,
  "shopping-cart": Download,
  flag: Target,
  church: Heart,
  megaphone: TrendingUp,
};

// Resource type icons
const resourceIcons: Record<CampaignResource['type'], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  guide: BookOpen,
  toolkit: FileText,
  article: FileText,
  video: Video,
  petition: Shield,
};

interface CampaignDetailPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const t = useTranslations("campaigns");
  const tCommon = useTranslations("common");

  const resolvedParams = React.use(params);
  if (!resolvedParams || !resolvedParams.slug) {
    notFound();
  }
  const slug = resolvedParams.slug;

  // Fetch campaign data
  const { data: campaign, isLoading, error } = useCampaign(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#fbfbfd] via-white to-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-[#781D32] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">{t("loading.title")}</h2>
          <p className="text-gray-600 mt-2">{t("loading.message")}</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#fbfbfd] via-white to-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">{t("error.title")}</h2>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : t("error.defaultMessage")}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            {t("error.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  const typeColor = (campaign.campaignType && campaignTypeColors[campaign.campaignType]) || "#781D32";
  const CampaignIcon = campaignIconMap[campaign.iconName || "megaphone"] || Target;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fbfbfd] via-white to-[#f5f5f7]">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t("detail.backToCampaigns")}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${typeColor}20 0%, ${typeColor}05 100%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Campaign Type Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge
                className="px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm border-0 flex items-center gap-2"
                style={{
                  backgroundColor: typeColor,
                  color: "white",
                }}
              >
                <CampaignIcon className="w-4 h-4" />
                {campaign.campaignType ? t(`types.${campaign.campaignType}`) : t("card.general")}
              </Badge>
              {campaign.isFeatured && (
                <Badge className="px-4 py-1.5 text-sm font-medium rounded-full bg-yellow-400 text-gray-900 shadow-lg backdrop-blur-sm border-0 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  {t("detail.featured")}
                </Badge>
              )}
            </div>

            {/* Campaign Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              {campaign.title}
            </h1>

            {/* Short Description */}
            <div 
              className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-4xl font-light leading-relaxed line-clamp-2"
              dangerouslySetInnerHTML={{ __html: getDescriptionHtml(campaign.description) }}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                className="rounded-full px-6 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  backgroundColor: typeColor,
                  color: "white",
                }}
              >
                {tCommon("buttons.joinCampaign")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-6 h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {tCommon("buttons.shareCampaign")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="participate">{t("tabs.participate")}</TabsTrigger>
            <TabsTrigger value="resources">{t("tabs.resources")}</TabsTrigger>
            <TabsTrigger value="impact">{t("tabs.impact")}</TabsTrigger>
            <TabsTrigger value="action">{t("tabs.action")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8 sm:p-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <Target style={{ color: typeColor }} className="w-6 h-6" />
                </div>
                {t("detail.aboutTitle")}
              </h2>
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: getDescriptionHtml(campaign.description) }}
              />
            </motion.div>
          </TabsContent>

          {/* How to Participate Tab */}
          <TabsContent value="participate" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8 sm:p-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <Users style={{ color: typeColor }} className="w-6 h-6" />
                </div>
                {t("detail.participateTitle")}
              </h2>
              <div className="space-y-4">
                {campaign.howToParticipate && Array.isArray(campaign.howToParticipate) && campaign.howToParticipate.length > 0 ? (
                  campaign.howToParticipate.map((step: CampaignParticipationStep | string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-5 bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200/60 hover:shadow-md transition-shadow duration-200"
                    >
                      <div
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                        style={{
                          backgroundColor: `${typeColor}15`,
                          color: typeColor,
                        }}
                      >
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1.5">
                        {typeof step === 'string' ? step : step.title || step.description || 'Step details'}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600">{t("detail.participatePlaceholder")}</p>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8 sm:p-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <Download style={{ color: typeColor }} className="w-6 h-6" />
                </div>
                {t("detail.resourcesTitle")}
              </h2>
              {campaign.resources && Array.isArray(campaign.resources) && campaign.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.resources!.map((resource: CampaignResource, index: number) => {
                    const Icon = resourceIcons[resource.type] || FileText;
                    return (
                      <motion.a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-5 bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200/60 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2.5 rounded-xl"
                              style={{ backgroundColor: `${typeColor}15` }}
                            >
                              <Icon style={{ color: typeColor }} className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                {resource.title}
                              </h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {resource.type}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">{t("detail.resourcesPlaceholder")}</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8 sm:p-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <TrendingUp style={{ color: typeColor }} className="w-6 h-6" />
                </div>
                {t("detail.impactTitle")}
              </h2>
              {campaign.successStories && Array.isArray(campaign.successStories) && campaign.successStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.successStories!.map((story: CampaignSuccessStory | string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200/60"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2
                          style={{ color: typeColor }}
                          className="w-5 h-5 shrink-0 mt-0.5"
                        />
                        <p className="text-gray-700 leading-relaxed">
                          {typeof story === 'string' ? story : story.title || story.content || 'Success story'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">{t("detail.impactPlaceholder")}</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Call to Action Tab */}
          <TabsContent value="action" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700/60 shadow-2xl p-10 sm:p-12 text-center"
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{ backgroundColor: `${typeColor}20` }}
              >
                <Heart style={{ color: typeColor }} className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {tCommon("buttons.readyToTakeAction")}
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                {t("detail.joinMessage")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  className="rounded-full px-8 h-12 text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {tCommon("buttons.joinCampaign")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-medium border-2 border-gray-600 text-white hover:bg-white/10 transition-all duration-200"
                >
                  {tCommon("buttons.learnMore")}
                </Button>
              </div>

              {/* Social Share Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-700/60">
                <p className="text-sm text-gray-400 mb-4">{t("detail.shareThis")}</p>
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
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}