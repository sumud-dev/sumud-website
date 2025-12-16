"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Home,
  ChevronRight,
  Share2,
  Facebook,
  Twitter,
  Mail,
  Copy,
  Check,
  Clock,
  Users,
  Target,
  Heart,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  MessageCircle,
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils/utils";
import { GlassBreadcrumb } from "@/src/components/navigation/breadcrumb";
import MilestoneTimeline from "./MilestoneTimeline";
import ShareButtons from "./ShareButtons";
import RelatedCampaignCard from "./RelatedCampaignCard";

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  category: "Humanitarian" | "Advocacy" | "Cultural" | "Fundraising";
  status: "active" | "urgent" | "completed";
  goal: number;
  raised: number;
  currency: "EUR";
  supporters: number;
  daysLeft: number;
  impact: {
    familiesSupported?: number;
    peopleReached?: number;
    description: string;
  };
  startDate: Date;
  endDate: Date;
  organizer: string;
  location: string;
  featured: boolean;
}

interface CampaignDetail extends Campaign {
  fullDescription: string;
  updates: Array<{
    id: string;
    title: string;
    content: string;
    date: Date;
    author: string;
  }>;
  milestones: Array<{
    amount: number;
    description: string;
    achieved: boolean;
  }>;
  gallery: string[];
}

interface CampaignDetailClientProps {
  campaign: CampaignDetail;
  relatedCampaigns: Campaign[];
}

const STATUS_CONFIG = {
  urgent: {
    label: "Urgent",
    color: "bg-red-500 text-white",
    icon: Clock,
  },
  active: {
    label: "Active",
    color: "bg-green-500 text-white",
    icon: TrendingUp,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500 text-white",
    icon: Target,
  },
};

export default function CampaignDetailClient({
  campaign,
  relatedCampaigns,
}: CampaignDetailClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const StatusIcon = STATUS_CONFIG[campaign.status].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfbfd] via-white to-[#f5f5f7]">
      {/* Hero Section with Glassmorphism */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Hero Image with Parallax */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </motion.div>

        {/* Glass Breadcrumb Navigation */}
        <div className="absolute top-6 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-lg"
            >
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#781D32] transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                href="/campaigns"
                className="text-sm text-gray-700 hover:text-[#781D32] transition-colors"
              >
                Campaigns
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {campaign.title.length > 30
                  ? campaign.title.substring(0, 30) + "..."
                  : campaign.title}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end pb-12 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white max-w-3xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
                <Badge
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm border-0 flex items-center gap-2",
                    STATUS_CONFIG[campaign.status].color,
                  )}
                >
                  <StatusIcon className="w-4 h-4" />
                  {STATUS_CONFIG[campaign.status].label}
                </Badge>
                <Badge className="px-4 py-1.5 text-sm font-medium rounded-full bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg border-0">
                  {campaign.category}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-tight leading-tight">
                {campaign.title}
              </h1>

              {/* Short Description */}
              <p className="text-xl sm:text-2xl text-gray-200 mb-8 font-light leading-relaxed">
                {campaign.shortDescription}
              </p>

              {/* Glass Share Button */}
              <ShareButtons campaign={campaign} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campaign Description Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8"
              >
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                  About This Campaign
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {campaign.fullDescription
                    .split("\n\n")
                    .map((paragraph, i) => (
                      <p key={i} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </motion.div>

              {/* Impact Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#781D32]/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#781D32]" />
                  </div>
                  <h2 className="text-3xl font-semibold text-gray-900">
                    Impact
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {campaign.impact.familiesSupported && (
                    <div className="bg-[#f5f5f7] rounded-2xl p-6">
                      <div className="text-4xl font-bold text-[#781D32] mb-2">
                        {campaign.impact.familiesSupported}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        Families Supported
                      </div>
                    </div>
                  )}
                  {campaign.impact.peopleReached && (
                    <div className="bg-[#f5f5f7] rounded-2xl p-6">
                      <div className="text-4xl font-bold text-[#55613C] mb-2">
                        {campaign.impact.peopleReached}+
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        People Reached
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {campaign.impact.description}
                </p>
              </motion.div>

              {/* Milestones Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <MilestoneTimeline
                  milestones={campaign.milestones}
                  formatCurrency={formatCurrency}
                />
              </motion.div>

              {/* Organizer Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Organizer
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#781D32] to-[#55613C] flex items-center justify-center text-white text-2xl font-bold">
                    {campaign.organizer.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {campaign.organizer}
                    </h4>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{campaign.location}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    >
                      Contact Organizer
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Tabs: Updates / Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-8"
              >
                <Tabs defaultValue="updates" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  </TabsList>
                  <TabsContent value="updates" className="space-y-6">
                    {campaign.updates.map((update, index) => (
                      <motion.div
                        key={update.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border-l-4 border-[#781D32] pl-6 py-2"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {update.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {update.date.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          {update.content}
                        </p>
                        <p className="text-sm text-gray-500">
                          By {update.author}
                        </p>
                      </motion.div>
                    ))}
                  </TabsContent>
                  <TabsContent value="gallery">
                    <div className="grid grid-cols-2 gap-4">
                      {campaign.gallery.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="aspect-video rounded-2xl overflow-hidden bg-gray-100 hover:shadow-xl transition-shadow duration-300"
                        >
                          <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Campaign Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Campaign Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Started</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {campaign.startDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ends</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {campaign.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {campaign.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Campaigns */}
      {relatedCampaigns.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-semibold text-gray-900 mb-8">
                Related Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCampaigns.map((relatedCampaign, index) => (
                  <RelatedCampaignCard
                    key={relatedCampaign.id}
                    campaign={relatedCampaign}
                    index={index}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
