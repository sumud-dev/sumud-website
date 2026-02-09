"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  Phone,
  Mail,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Globe,
  Heart,
  Ticket,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Progress } from "@/src/components/ui/progress";
import { Separator } from "@/src/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { useEvent } from "@/src/lib/hooks/use-events";
import { usePage } from "@/src/lib/hooks/use-pages";
import type { 
  EventRegistrationFormData,
  EventType,
  EventLocationMode,
} from "@/src/lib/types/event";
import {
  formatEventDate,
  formatEventTime,
  isEventUpcoming,
  isEventOngoing,
  canRegisterForEvent,
  getEventTypeColor,
  EVENT_TYPES,
  EVENT_LOCATION_MODES,
} from "@/src/lib/types/event";
import { markdownToHtml } from "@/src/lib/utils/markdown";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations("eventsDetail");

  const { data: eventResponse, isLoading, error } = useEvent(slug);
  
  // Fetch page builder content for event detail labels
  const { data: pageData } = usePage("event-detail");
  
  // Extract localized content from page builder with message file fallback
  const pageContent = useMemo(() => {
    if (!pageData) return null;
    
    const textBlock = pageData.translations.en?.blocks?.find(
      (b) => b.id === "event-detail-text"
    );
    
    type EventDetailContent = {
      content?: {
        [locale: string]: {
          backToEvents?: string;
          status?: { upcoming?: string; happeningNow?: string; pastEvent?: string };
          eventNotFound?: { title?: string; description?: string };
          sections?: { aboutEvent?: string; eventDetails?: string; organizer?: string; tags?: string };
          details?: { date?: string; time?: string; location?: string; capacity?: string; spotsLeft?: string; soldOut?: string; free?: string; eventType?: string; locationMode?: string };
          buttons?: { register?: string; share?: string; copyLink?: string; linkCopied?: string; addToCalendar?: string; getDirections?: string; joinOnline?: string; viewMore?: string };
          registration?: { title?: string; description?: string; firstName?: string; lastName?: string; email?: string; phone?: string; numberOfAttendees?: string; specialRequirements?: string; specialRequirementsPlaceholder?: string; agreeToTerms?: string; submitButton?: string; successMessage?: string; errorMessage?: string };
          contact?: { title?: string; email?: string; phone?: string; website?: string };
          relatedEvents?: { title?: string; viewAll?: string };
        };
      };
    };
    
    const textContent = (textBlock?.content as EventDetailContent)?.content;
    const localeKey = locale as "en" | "fi";
    
    return textContent?.[localeKey] || textContent?.en || null;
  }, [pageData, locale]);
  
  // Helper to get content from page builder with message file fallback
  const getText = (key: string, fallbackKey?: string): string => {
    // Try page builder content first (nested keys supported with dots)
    if (pageContent) {
      const keys = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = pageContent;
      for (const k of keys) {
        value = value?.[k];
      }
      if (typeof value === "string") return value;
    }
    // Fall back to message file translations
    return t(fallbackKey || key);
  };

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [registrationForm, setRegistrationForm] =
    useState<EventRegistrationFormData>({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      numberOfAttendees: 1,
      specialRequirements: "",
      agreeToTerms: false,
    });

  const event = eventResponse;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.content?.substring(0, 100) || "Check out this event!",
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const getEventStatus = () => {
    if (!event) return { label: "Unknown", color: "bg-gray-500" };
    const eventDate = event.start_date || event.date || event.startAt;
    if (isEventUpcoming(eventDate)) {
      return { label: getText("status.upcoming"), color: "bg-green-500" };
    }
    if (isEventOngoing(eventDate, event.end_date || event.endAt)) {
      return { label: getText("status.happeningNow"), color: "bg-blue-500 animate-pulse" };
    }
    return { label: getText("status.pastEvent"), color: "bg-gray-500" };
  };

  const getCapacityPercentage = () => {
    if (!event?.max_capacity) return 0;
    return Math.min(((event.current_registrations || 0) / event.max_capacity) * 100, 100);
  };

  // Loading State
  if (isLoading) {
    return (
      <>
        {/* Hero Skeleton */}
        <section className="relative py-20 bg-linear-to-br from-[#1A1D14] via-[#2D3320] to-[#3E442B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-white/20 rounded w-32" />
              <div className="h-12 bg-white/20 rounded w-3/4" />
              <div className="h-6 bg-white/20 rounded w-1/2" />
              <div className="flex gap-4">
                <div className="h-10 bg-white/20 rounded w-40" />
                <div className="h-10 bg-white/20 rounded w-40" />
              </div>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-pulse h-96 bg-gray-200 rounded-2xl" />
              <div className="animate-pulse h-48 bg-gray-200 rounded-2xl" />
            </div>
            <div className="animate-pulse h-80 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <>
        <section className="relative py-20 bg-linear-to-br from-[#1A1D14] via-[#2D3320] to-[#3E442B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeInUp}>
              <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
                <Calendar className="h-12 w-12 text-white/60" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {getText("eventNotFound.title")}
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
                {getText("eventNotFound.description")}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#781D32] hover:bg-[#5E1727] text-white"
              >
                <Link href="/events">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {getText("backToEvents")}
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  const status = getEventStatus();
  const typeColor = getEventTypeColor(event.event_type);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-linear-to-br from-[#1A1D14] via-[#2D3320] to-[#3E442B]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(120,29,50,0.15)_0%,transparent_50%,rgba(85,97,60,0.15)_100%)]" />
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#781D32]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#55613C]/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              asChild
              className="text-white/80 hover:text-white hover:bg-white/10 -ml-4"
            >
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {getText("backToEvents")}
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Event Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`${typeColor.bg} ${typeColor.text} ${typeColor.border} border px-3 py-1 text-sm font-semibold`}
                >
                  {EVENT_TYPES[event.event_type as EventType] || 'Event'}
                </Badge>
                <Badge className={`${status.color} text-white px-3 py-1`}>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-white ${status.label === getText("status.happeningNow") ? "animate-pulse" : ""}`} />
                    {status.label}
                  </span>
                </Badge>
                {event.is_featured && (
                  <Badge className="bg-linear-to-r from-yellow-400 to-yellow-500 text-white border-0 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {getText("badges.featured")}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                {event.title}
              </h1>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">{t("quickInfo.date")}</p>
                    <p className="font-medium">{formatEventDate(event.start_date || event.date || event.startAt, locale)}</p>
                  </div>
                </div>
                
                {(event.start_time || event.startAt) && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">{t("quickInfo.time")}</p>
                      <p className="font-medium">
                        {event.start_time ? formatEventTime(event.start_time) : event.startAt ? new Date(event.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                        {(event.end_time || event.endAt) && ` - ${event.end_time ? formatEventTime(event.end_time) : event.endAt ? new Date(event.endAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    {event.location_mode === "virtual" ? (
                      <Video className="h-5 w-5" />
                    ) : event.location_mode === "hybrid" ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white/60">{t("quickInfo.location")}</p>
                    <p className="font-medium">
                      {event.location_mode === "virtual"
                        ? t("quickInfo.onlineEvent")
                        : event.location_mode === "hybrid"
                          ? t("quickInfo.hybrid")
                          : event.venue_name || t("quickInfo.locationTbd")}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {canRegisterForEvent(event) && (
                  <Button
                    size="lg"
                    onClick={() => setIsRegistrationOpen(true)}
                    className="bg-[#781D32] hover:bg-[#5E1727] text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    {t("buttons.registerNow")}
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  className="border-white/30 text-black hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      {t("buttons.copied")}
                    </>
                  ) : (
                    <>
                      <Share2 className="h-5 w-5 mr-2" />
                      {t("buttons.share")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {(event.featured_image || event.featuredImage) ? (
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                  <Image
                    src={event.featured_image || event.featuredImage || ''}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="aspect-4/3 rounded-2xl bg-linear-to-br from-[#781D32]/30 to-[#2D3320]/30 border-4 border-white/10 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-white/30" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16 bg-linear-to-b from-[#F8F6F0] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="lg:col-span-2 space-y-8"
            >
              {/* About Section */}
              <motion.div variants={fadeInUp}>
                <Card className="border-2 border-[#2D3320]/20 shadow-xl overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-shadow duration-300">
                  <div className="bg-linear-to-r from-[#2D3320] to-[#3E442B] p-8">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Info className="h-6 w-6" />
                      </div>
                      {t("sections.aboutEvent")}
                    </h2>
                  </div>
                  <CardContent className="p-8 lg:p-10">
                    <div className="prose prose-lg max-w-none text-[#1A1D14] leading-relaxed 
                      prose-headings:text-[#1A1D14] prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0
                      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                      prose-p:text-[#3E442B] prose-p:leading-loose prose-p:mb-4
                      prose-a:text-[#781D32] prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-[#1A1D14] prose-strong:font-semibold
                      prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-li:text-[#3E442B]
                      prose-blockquote:border-l-4 prose-blockquote:border-[#781D32] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                      prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
                      prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-gray-900 prose-pre:text-gray-100">
                      {event.content ? (
                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(event.content) }} />
                      ) : event.description ? (
                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(event.description) }} />
                      ) : (
                        <p className="text-gray-500 italic text-center py-8">
                          {t("sections.eventDetailsComingSoon")}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Details Grid */}
              <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date & Time Card */}
                  <Card className="group border-2 border-[#781D32]/20 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-linear-to-br from-white to-[#781D32]/5 hover:border-[#781D32]/40">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-5">
                        <div className="p-4 bg-[#781D32]/15 rounded-2xl group-hover:bg-[#781D32]/25 transition-colors duration-300">
                          <Calendar className="h-7 w-7 text-[#781D32]" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-bold text-[#1A1D14] flex items-center gap-2">
                            {t("sections.dateTime")}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-[#3E442B] font-semibold text-base">
                              {formatEventDate(event.start_date || event.date || event.startAt, locale)}
                            </p>
                            {event.start_time && (
                              <p className="text-[#55613C] text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {formatEventTime(event.start_time)}
                                {event.end_time && ` - ${formatEventTime(event.end_time)}`}
                              </p>
                            )}
                            {event.end_date && event.end_date !== event.start_date && (
                              <p className="text-sm text-[#55613C]">
                                {t("sections.until")} {formatEventDate(event.end_date, locale)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Card */}
                  <Card className="group border-2 border-[#2D3320]/20 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-linear-to-br from-white to-[#2D3320]/5 hover:border-[#2D3320]/40">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-5">
                        <div className="p-4 bg-[#2D3320]/15 rounded-2xl group-hover:bg-[#2D3320]/25 transition-colors duration-300">
                          {event.location_mode === "virtual" ? (
                            <Video className="h-7 w-7 text-[#2D3320]" />
                          ) : event.location_mode === "hybrid" ? (
                            <Globe className="h-7 w-7 text-[#2D3320]" />
                          ) : (
                            <MapPin className="h-7 w-7 text-[#2D3320]" />
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-bold text-[#1A1D14] flex items-center gap-2">
                            {t("sections.location")}
                          </h3>
                          <div className="space-y-1.5">
                            <p className="text-[#3E442B] font-semibold text-base">
                              {EVENT_LOCATION_MODES[event.location_mode as EventLocationMode] || t("sections.location")}
                            </p>
                            {event.venue_name && (
                              <p className="text-[#55613C] font-medium">{event.venue_name}</p>
                            )}
                            {event.venue_address && (
                              <p className="text-sm text-[#55613C] flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                {event.venue_address}
                              </p>
                            )}
                            {event.virtual_link && (
                              <a
                                href={event.virtual_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#781D32] hover:text-[#5E1727] font-medium text-sm mt-3 px-4 py-2 bg-[#781D32]/10 hover:bg-[#781D32]/20 rounded-lg transition-colors duration-200"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {t("sections.joinOnline")}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Contact Info */}
              {(event.contact_email || event.contact_phone) && (
                <motion.div variants={fadeInUp}>
                  <Card className="border-2 border-[#2D3320]/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-linear-to-br from-white to-gray-50">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-[#1A1D14] mb-6 flex items-center gap-3">
                        <div className="p-2 bg-[#781D32]/15 rounded-lg">
                          <Users className="h-5 w-5 text-[#781D32]" />
                        </div>
                        {t("sections.contactInformation")}
                      </h3>
                      <div className="flex flex-col gap-4">
                        {event.contact_email && (
                          <a
                            href={`mailto:${event.contact_email}`}
                            className="flex items-center gap-3 text-[#3E442B] hover:text-[#781D32] transition-colors p-4 bg-gray-50 hover:bg-[#781D32]/10 rounded-xl border border-gray-200 hover:border-[#781D32]/30"
                          >
                            <Mail className="h-5 w-5 text-[#781D32]" />
                            <span className="font-medium">{event.contact_email}</span>
                          </a>
                        )}
                        {event.contact_phone && (
                          <a
                            href={`tel:${event.contact_phone}`}
                            className="flex items-center gap-3 text-[#3E442B] hover:text-[#781D32] transition-colors p-4 bg-gray-50 hover:bg-[#781D32]/10 rounded-xl border border-gray-200 hover:border-[#781D32]/30"
                          >
                            <Phone className="h-5 w-5 text-[#781D32]" />
                            <span className="font-medium">{event.contact_phone}</span>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column - Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Registration Card */}
              <Card className="border-2 border-[#781D32]/20 shadow-xl sticky top-24 overflow-hidden">
                <div className="bg-linear-to-r from-[#781D32] to-[#5E1727] p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    {t("registration.title")}
                  </h3>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Capacity */}
                  {event.max_capacity && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#3E442B]">{t("registration.spotsAvailable")}</span>
                        <span className="font-bold text-[#1A1D14]">
                          {event.max_capacity - (event.current_registrations || 0)} / {event.max_capacity}
                        </span>
                      </div>
                      <Progress
                        value={getCapacityPercentage()}
                        className="h-2"
                      />
                      {getCapacityPercentage() >= 80 && (
                        <p className="text-xs text-[#781D32] font-medium">
                          {t("registration.fillingUpFast")}
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Registration Button */}
                  {canRegisterForEvent(event) ? (
                    <Button
                      size="lg"
                      onClick={() => setIsRegistrationOpen(true)}
                      className="w-full bg-[#781D32] hover:bg-[#5E1727] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {t("buttons.registerNow")}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-center space-y-2">
                      <Button disabled className="w-full">
                        {isEventUpcoming(event.start_date || event.date || event.startAt)
                          ? t("registration.registrationClosed")
                          : t("registration.eventHasEnded")}
                      </Button>
                      {event.registration_deadline && isEventUpcoming(event.start_date || event.date || event.startAt) && (
                        <p className="text-xs text-[#55613C]">
                          {t("registration.registrationClosedOn")} {formatEventDate(event.registration_deadline, locale)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Registration Info */}
                  {event.registration_required && event.registration_deadline && isEventUpcoming(event.registration_deadline) && (
                    <p className="text-sm text-[#55613C] text-center">
                      {t("registration.registerBy")} {formatEventDate(event.registration_deadline, locale)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Share Card */}
              <Card className="border-2 border-[#781D32]/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-linear-to-br from-white to-[#781D32]/5">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-[#1A1D14] mb-6 flex items-center gap-3">
                    <div className="p-2 bg-[#781D32]/15 rounded-lg">
                      <Heart className="h-5 w-5 text-[#781D32]" />
                    </div>
                    {t("share.title")}
                  </h3>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                      className="w-full border-2 border-[#2D3320]/30 hover:bg-[#2D3320] hover:text-white hover:border-[#2D3320] transition-all duration-300 font-semibold"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      {t("buttons.share")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCopyLink}
                      className="w-full border-2 border-[#2D3320]/30 hover:bg-[#2D3320] hover:text-white hover:border-[#2D3320] transition-all duration-300 font-semibold"
                    >
                      {copied ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          {t("buttons.linkCopied")}
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 mr-2" />
                          {t("buttons.copyLink")}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories/Tags */}
              {event.categories && (Array.isArray(event.categories) ? event.categories.length > 0 : true) && (
                <Card className="border-2 border-[#2D3320]/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-linear-to-br from-white to-[#2D3320]/5">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-[#1A1D14] mb-6 flex items-center gap-3">
                      <div className="p-2 bg-[#2D3320]/15 rounded-lg">
                        <Sparkles className="h-5 w-5 text-[#2D3320]" />
                      </div>
                      {t("categories.title")}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(event.categories) 
                        ? event.categories 
                        : typeof event.categories === 'string' 
                          ? event.categories.split(",")
                          : []
                      ).map((category: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-[#2D3320]/10 text-[#2D3320] hover:bg-[#2D3320] hover:text-white border border-[#2D3320]/20 hover:border-[#2D3320] cursor-pointer transition-all duration-300 px-4 py-2 text-sm font-semibold"
                        >
                          {typeof category === 'string' ? category.trim() : category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1A1D14]">
              {t("registrationModal.title")}
            </DialogTitle>
            <DialogDescription className="text-[#3E442B]">
              {t("registrationModal.description", { eventTitle: event.title })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("registrationModal.firstName")} *</Label>
                <Input
                  id="firstName"
                  value={registrationForm.firstName}
                  onChange={(e) =>
                    setRegistrationForm((prev: EventRegistrationFormData) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="border-[#2D3320]/30 focus:border-[#781D32]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("registrationModal.lastName")} *</Label>
                <Input
                  id="lastName"
                  value={registrationForm.lastName}
                  onChange={(e) =>
                    setRegistrationForm((prev: EventRegistrationFormData) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="border-[#2D3320]/30 focus:border-[#781D32]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("registrationModal.email")} *</Label>
              <Input
                id="email"
                type="email"
                value={registrationForm.email}
                onChange={(e) =>
                  setRegistrationForm((prev: EventRegistrationFormData) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("registrationModal.phone")}</Label>
              <Input
                id="phone"
                value={registrationForm.phone}
                onChange={(e) =>
                  setRegistrationForm((prev: EventRegistrationFormData) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfAttendees">{t("registrationModal.numberOfAttendees")}</Label>
              <Input
                id="numberOfAttendees"
                type="number"
                min={1}
                max={10}
                value={registrationForm.numberOfAttendees}
                onChange={(e) =>
                  setRegistrationForm((prev: EventRegistrationFormData) => ({
                    ...prev,
                    numberOfAttendees: parseInt(e.target.value) || 1,
                  }))
                }
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">
                {t("registrationModal.specialRequirements")}
              </Label>
              <Textarea
                id="specialRequirements"
                value={registrationForm.specialRequirements}
                onChange={(e) =>
                  setRegistrationForm((prev: EventRegistrationFormData) => ({
                    ...prev,
                    specialRequirements: e.target.value,
                  }))
                }
                placeholder={t("registrationModal.specialRequirementsPlaceholder")}
                rows={3}
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  // Handle registration submission
                  setIsRegistrationOpen(false);
                }}
                className="flex-1 bg-[#781D32] hover:bg-[#5E1727] text-white"
              >
                {t("registrationModal.completeRegistration")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRegistrationOpen(false)}
                className="border-[#2D3320]/30"
              >
                {t("registrationModal.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
