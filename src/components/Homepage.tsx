"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Calendar,
  ArrowRight,
  ChevronRight,
  MapPin,
  Clock,
  Flag,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Church,
  Megaphone,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import NewsletterSignup from "@/src/components/ui/newsletter-signup";
import { PalestinianHeritageHero } from "@/src/components/heritage";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Featured news items - keys for translation
const featuredNewsKeys = [
  {
    id: 1,
    key: "winterReport",
    isHighlighted: false,
  },
  {
    id: 2,
    key: "voiceMatters",
    isHighlighted: true,
  },
];

// Icon mapping helper
const getCampaignIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "shield-check": <ShieldCheck className="w-6 h-6" />,
    "shield-off": <ShieldOff className="w-6 h-6" />,
    "shopping-cart": <ShoppingCart className="w-6 h-6" />,
    flag: <Flag className="w-6 h-6" />,
    church: <Church className="w-6 h-6" />,
    megaphone: <Megaphone className="w-6 h-6" />,
  };
  return iconMap[iconName] || <Flag className="w-6 h-6" />;
};

// Campaign type labels for display
const campaignTypeLabels: Record<string, string> = {
  boycott: "Boycott",
  "policy-advocacy": "Policy Advocacy",
  "community-action": "Community Action",
  awareness: "Awareness",
  advocacy: "Advocacy",
};

// Icon mapping for campaign icons
const campaignIconMap: Record<string, string> = {
  "ban": "shield-off",
  "shield-off": "shield-off",
  "shield-check": "shield-check",
  "book-x": "flag",
  "shopping-cart": "shopping-cart",
  "music-off": "megaphone",
};

// Mock campaigns data - same as API route
const featuredCampaigns = [
  {
    id: "1",
    title: { en: "Justice Not Arms" },
    shortDescription: { en: "Demand Finland to end all arms trade and military cooperation with Israel." },
    slug: "justice-not-arms",
    type: "advocacy",
    status: "active",
    icon: "shield-off",
    image: "/images/hero-embroidery.jpg",
    color: "#722F37",
    callToAction: { primary: "Take Action" },
  },
  {
    id: "2",
    title: { en: "BDS Movement" },
    shortDescription: { en: "Join the global movement for Palestinian rights through economic pressure on companies profiting from occupation." },
    slug: "bds-movement",
    type: "advocacy",
    status: "active",
    icon: "shield-off",
    image: "/images/hero-embroidery.jpg",
    color: "#6B8E23",
    callToAction: { primary: "Join Movement" },
  },
  {
    id: "3",
    title: { en: "Apartheid Free Zone" },
    shortDescription: { en: "Join us in declaring your community, institution, or organization as an Apartheid Free Zone - committed to opposing Israeli apartheid." },
    slug: "apartheid-free-zone",
    type: "advocacy",
    status: "active",
    icon: "shield-check",
    image: "/images/hero-embroidery.jpg",
    color: "#722F37",
    callToAction: { primary: "Declare Your Zone" },
  },
  {
    id: "4",
    title: { en: "Cultural & Academic Boycott" },
    shortDescription: { en: "Join the Palestinian-led campaign for cultural and academic boycott of Israeli institutions." },
    slug: "cultural-academic-boycott",
    type: "advocacy",
    status: "active",
    icon: "flag",
    image: "/images/hero-embroidery.jpg",
    color: "#6B8E23",
    callToAction: { primary: "Learn More" },
  },
  {
    id: "5",
    title: { en: "Israeli Products Out of Shops" },
    shortDescription: { en: "Campaign to remove Israeli products from Finnish stores through consumer boycotts and advocacy." },
    slug: "israeli-products-out-of-shops",
    type: "advocacy",
    status: "active",
    icon: "shopping-cart",
    image: "/images/hero-embroidery.jpg",
    color: "#722F37",
    callToAction: { primary: "Take Action" },
  },
  {
    id: "6",
    title: { en: "Boycott Israel in Eurovision" },
    shortDescription: { en: "Join the campaign to boycott Israel's participation in Eurovision due to its violations of international law." },
    slug: "israel-boikottiin-euroviisuissa",
    type: "advocacy",
    status: "urgent",
    icon: "megaphone",
    image: "/images/hero-embroidery.jpg",
    color: "#dc2626",
    callToAction: { primary: "Sign Petition" },
  },
];

// Event type from database
type Event = {
  id: string;
  title: string | null;
  slug: string | null;
  content: string | null;
  featured_image: string | null;
  categories: string | null;
  locations: string | null;
  published_at: string | null;
  status: string | null;
};

interface HomepageProps {
  events?: Event[];
}

const Homepage = React.memo(function Homepage({ events = [] }: HomepageProps) {
  const t = useTranslations("homepage");
  const tCommon = useTranslations("common");
  
  return (
    <>
      {/* Palestinian Heritage Hero Section - NEW */}
      <PalestinianHeritageHero />

      {/* Latest News & Updates */}
      <section className="py-20 relative overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F5F4] via-[#FAFAF9] to-[#E7E5E4]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {/* Glass icon container */}
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 backdrop-blur-xl"
              style={{
                background: "rgba(120, 29, 50, 0.15)",
                border: "0.5px solid rgba(120, 29, 50, 0.3)",
                boxShadow:
                  "0 4px 6px -1px rgba(120, 29, 50, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <svg
                className="w-8 h-8 text-[#722F37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: "#722F37" }}
            >
              {t("newsUpdates.title")}
            </h2>
            <div
              className="w-24 h-1 mx-auto rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(107, 142, 35, 0) 0%, rgba(107, 142, 35, 1) 50%, rgba(107, 142, 35, 0) 100%)",
              }}
            ></div>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {featuredNewsKeys.map((news) => (
              <motion.div key={news.id} variants={fadeInUp}>
                <div
                  className={`h-full backdrop-blur-xl rounded-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden group ${
                    news.isHighlighted ? "hover:shadow-2xl" : "hover:shadow-xl"
                  }`}
                  style={{
                    background: news.isHighlighted
                      ? "rgba(255, 240, 242, 0.85)"
                      : "rgba(255, 248, 240, 0.8)",
                    border: news.isHighlighted
                      ? "0.5px solid rgba(120, 29, 50, 0.25)"
                      : "0.5px solid rgba(232, 220, 196, 0.4)",
                    boxShadow: news.isHighlighted
                      ? "0 10px 15px -3px rgba(120, 29, 50, 0.12), 0 4px 6px -2px rgba(120, 29, 50, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)"
                      : "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <div className="p-8">
                    <div className="mb-6">
                      <Badge
                        className="px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md"
                        style={{
                          backgroundColor: news.isHighlighted
                            ? "#722F37"
                            : "#6B8E23",
                          color: "white",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {t(`newsUpdates.${news.key}.category`)}
                      </Badge>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3
                          className="text-2xl font-bold mb-4 group-hover:text-opacity-90 transition-colors"
                          style={{ color: "#722F37" }}
                        >
                          {t(`newsUpdates.${news.key}.title`)}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {t(`newsUpdates.${news.key}.excerpt`)}
                        </p>
                      </div>

                      <div
                        className="flex items-center justify-between pt-6"
                        style={{
                          borderTop: `0.5px solid ${news.isHighlighted ? "rgba(120, 29, 50, 0.15)" : "rgba(232, 220, 196, 0.5)"}`,
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock
                            className="h-4 w-4"
                            style={{ color: "#6B8E23" }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: "#6B8E23" }}
                          >
                            {t(`newsUpdates.${news.key}.readTime`)}
                          </span>
                        </div>
                        <Link href="/articles">
                          <Button
                            variant="ghost"
                            className="font-semibold transition-all duration-200 hover:backdrop-blur-md"
                            style={{
                              color: "#722F37",
                              background: "rgba(255, 255, 255, 0.3)",
                            }}
                          >
                            {t("newsUpdates.readFullReport")}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      {news.isHighlighted && (
                        <div className="flex gap-4 pt-4">
                          <Button
                            className="flex-1 text-white font-semibold py-3 rounded-xl transition-all duration-300 backdrop-blur-md"
                            style={{
                              backgroundColor: "#6B8E23",
                              boxShadow:
                                "0 4px 12px -2px rgba(107, 142, 35, 0.4)",
                            }}
                          >
                            {t("newsUpdates.getInvolved")}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 font-semibold py-3 rounded-xl transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-md"
                            style={{
                              borderColor: "#722F37",
                              borderWidth: "0.5px",
                              color: "#722F37",
                              background: "rgba(255, 255, 255, 0.5)",
                            }}
                          >
                            {t("newsUpdates.learnMore")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 relative overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF9] via-[#F5F5F4] to-[#E7E5E4]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: "#722F37" }}
            >
              {t("events.title")}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t("events.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {events.slice(0, 3).map((event) => {
              // Parse locations JSON if available
              const locationData = event.locations ? JSON.parse(event.locations) : null;
              const locationName = locationData?.name || locationData?.venue || '';
              const city = locationData?.city || '';
              
              // Format date
              const eventDate = event.published_at 
                ? new Date(event.published_at).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : '';
              
              return (
              <motion.div key={event.id} variants={fadeInUp}>
                <div
                  className="h-full backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-300 transform hover:scale-105 group"
                  style={{
                    background: "rgba(255, 248, 240, 0.8)",
                    border: "0.5px solid rgba(232, 220, 196, 0.4)",
                    boxShadow:
                      "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.featured_image || "/images/hero-embroidery.jpg"}
                      alt={event.title || "Event"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge
                        className="backdrop-blur-md font-semibold"
                        style={{
                          backgroundColor: "#722F37",
                          color: "white",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {event.categories || "Event"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3
                          className="text-lg font-bold mb-2 group-hover:text-opacity-80 transition-colors"
                          style={{ color: "#722F37" }}
                        >
                          {event.title}
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {event.content}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        {eventDate && (
                        <div className="flex items-center">
                          <Calendar
                            className="h-4 w-4 mr-2"
                            style={{ color: "#722F37" }}
                          />
                          {eventDate}
                        </div>
                        )}
                        {(locationName || city) && (
                        <div className="flex items-center">
                          <MapPin
                            className="h-4 w-4 mr-2"
                            style={{ color: "#722F37" }}
                          />
                          {locationName}{locationName && city ? ', ' : ''}{city}
                        </div>
                        )}
                      </div>

                      <Link href={`/events/${event.slug || event.id}`}>
                        <Button
                          className="w-full mt-4 text-white font-semibold py-3 rounded-xl transition-all duration-300 backdrop-blur-md"
                          style={{
                            backgroundColor: "#722F37",
                            boxShadow: "0 4px 12px -2px rgba(120, 29, 50, 0.4)",
                          }}
                        >
                          {t("events.registerNow")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </motion.div>

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
                {t("events.viewAll")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Active Campaigns Section - REAL Sumud.fi Campaigns (NO DONATIONS) */}
      <section className="py-20 relative overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#E8DCC4]/30 to-[#FFF8F0]" />

        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#781D32]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B8E23]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              {t("campaigns.title")}
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              {t("campaigns.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {featuredCampaigns.slice(0, 3).map((campaign) => (
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
                      {campaign.image && (
                        <Image
                          src={campaign.image}
                          alt={campaign.title.en}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      {/* Gradient overlay for better text/icon visibility */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${campaign.color}40 0%, ${campaign.color}20 50%, transparent 100%)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Icon and Badge positioned on the image */}
                      <div className="absolute inset-0 p-5 flex flex-col justify-between">
                        {/* Top: Icon */}
                        <div className="flex items-start justify-between">
                          <div
                            className="p-3 rounded-xl backdrop-blur-md shadow-lg"
                            style={{
                              background: `${campaign.color}90`,
                              border: `0.5px solid rgba(255, 255, 255, 0.3)`,
                            }}
                          >
                            <div className="text-white">
                              {getCampaignIcon(campaign.icon)}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge
                            className="px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-lg"
                            style={{
                              backgroundColor:
                                campaign.status === "urgent"
                                  ? "#dc2626"
                                  : campaign.color,
                              color: "white",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            {campaign.status === "urgent"
                              ? "URGENT"
                              : campaignTypeLabels[campaign.type]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3
                          className="text-xl font-bold mb-3 group-hover:text-opacity-80 transition-colors"
                          style={{ color: "#722F37" }}
                        >
                          {campaign.title.en}
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {campaign.shortDescription.en}
                        </p>
                      </div>

                      {/* Action Button - NO DONATION LANGUAGE */}
                      <Link href={`/campaigns/${campaign.slug}`}>
                        <Button
                          className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md"
                          style={{
                            backgroundColor: campaign.color,
                            boxShadow: `0 4px 12px -2px ${campaign.color}40`,
                          }}
                        >
                          {campaign.callToAction.primary}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

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
                {t("campaigns.viewAll")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Shop Section - Temporarily Disabled */}
      {/* <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#E8DCC4]/20 to-[#FFF8F0]" />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6B8E23]/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <h2
                className="text-4xl lg:text-5xl font-bold"
                style={{ color: "#722F37" }}
              >
                New in the
                <br />
                Sumud Shop
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Support our mission and show your solidarity with our carefully
                curated collection of meaningful merchandise.
              </p>
              <Link href="/shop">
                <Button
                  size="lg"
                  className="text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 backdrop-blur-md"
                  style={{
                    backgroundColor: "#722F37",
                    boxShadow: "0 10px 15px -3px rgba(120, 29, 50, 0.3)",
                  }}
                >
                  Shop
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <div
                className="relative h-96 rounded-3xl overflow-hidden backdrop-blur-xl"
                style={{
                  border: "0.5px solid rgba(232, 220, 196, 0.4)",
                  boxShadow:
                    "0 20px 25px -5px rgba(120, 29, 50, 0.12), 0 10px 10px -5px rgba(120, 29, 50, 0.06)",
                }}
              >
                <Image
                  src="/images/hero-embroidery.jpg"
                  alt="Sumud merchandise showcase"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Newsletter Signup */}
      <section className="py-20 relative overflow-hidden">
        {/* Olive gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#55613C] to-[#6B8E23]" />

        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#781D32]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFF8F0]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <NewsletterSignup variant="default" />
        </div>
      </section>
    </>
  );
});

export default Homepage;
