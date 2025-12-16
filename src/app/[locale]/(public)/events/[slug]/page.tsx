"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
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
import type { EventRegistrationFormData } from "@/src/lib/types/event";
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

  const { data: eventResponse, isLoading, error } = useEvent(slug);

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

  const event = eventResponse?.data;

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
    if (isEventUpcoming(event.start_date)) {
      return { label: "Upcoming", color: "bg-green-500" };
    }
    if (isEventOngoing(event.start_date, event.end_date)) {
      return { label: "Happening Now", color: "bg-blue-500 animate-pulse" };
    }
    return { label: "Past Event", color: "bg-gray-500" };
  };

  const getCapacityPercentage = () => {
    if (!event?.max_capacity) return 0;
    return Math.min((event.current_registrations / event.max_capacity) * 100, 100);
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
                Event Not Found
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
                The event you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#781D32] hover:bg-[#5E1727] text-white"
              >
                <Link href="/events">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Events
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
                Back to Events
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
                  {EVENT_TYPES[event.event_type]}
                </Badge>
                <Badge className={`${status.color} text-white px-3 py-1`}>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-white ${status.label === "Happening Now" ? "animate-pulse" : ""}`} />
                    {status.label}
                  </span>
                </Badge>
                {event.is_featured && (
                  <Badge className="bg-linear-to-r from-yellow-400 to-yellow-500 text-white border-0 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
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
                    <p className="text-sm text-white/60">Date</p>
                    <p className="font-medium">{formatEventDate(event.start_date)}</p>
                  </div>
                </div>
                
                {event.start_time && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Time</p>
                      <p className="font-medium">
                        {formatEventTime(event.start_time)}
                        {event.end_time && ` - ${formatEventTime(event.end_time)}`}
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
                    <p className="text-sm text-white/60">Location</p>
                    <p className="font-medium">
                      {event.location_mode === "virtual"
                        ? "Online Event"
                        : event.location_mode === "hybrid"
                          ? "Hybrid"
                          : event.venue_name || "Location TBD"}
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
                    Register Now
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-5 w-5 mr-2" />
                      Share Event
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
              {event.featured_image ? (
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                  <Image
                    src={event.featured_image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
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
                <Card className="border-2 border-[#2D3320]/10 shadow-lg overflow-hidden">
                  <div className="bg-linear-to-r from-[#2D3320] to-[#3E442B] p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Info className="h-6 w-6" />
                      About This Event
                    </h2>
                  </div>
                  <CardContent className="p-6 lg:p-8">
                    <div className="prose prose-lg max-w-none text-[#1A1D14]">
                      {event.content ? (
                        <div dangerouslySetInnerHTML={{ __html: event.content }} />
                      ) : (
                        <p className="text-gray-600 italic">
                          Event details coming soon...
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
                  <Card className="border-2 border-[#2D3320]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#781D32]/10 rounded-xl">
                          <Calendar className="h-6 w-6 text-[#781D32]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-[#1A1D14]">Date & Time</h3>
                          <p className="text-[#3E442B] font-medium">
                            {formatEventDate(event.start_date)}
                          </p>
                          {event.start_time && (
                            <p className="text-[#55613C]">
                              {formatEventTime(event.start_time)}
                              {event.end_time && ` - ${formatEventTime(event.end_time)}`}
                            </p>
                          )}
                          {event.end_date && event.end_date !== event.start_date && (
                            <p className="text-sm text-[#55613C]">
                              Until {formatEventDate(event.end_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Card */}
                  <Card className="border-2 border-[#2D3320]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#2D3320]/10 rounded-xl">
                          {event.location_mode === "virtual" ? (
                            <Video className="h-6 w-6 text-[#2D3320]" />
                          ) : event.location_mode === "hybrid" ? (
                            <Globe className="h-6 w-6 text-[#2D3320]" />
                          ) : (
                            <MapPin className="h-6 w-6 text-[#2D3320]" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-[#1A1D14]">Location</h3>
                          <p className="text-[#3E442B] font-medium">
                            {EVENT_LOCATION_MODES[event.location_mode]}
                          </p>
                          {event.venue_name && (
                            <p className="text-[#55613C]">{event.venue_name}</p>
                          )}
                          {event.venue_address && (
                            <p className="text-sm text-[#55613C]">{event.venue_address}</p>
                          )}
                          {event.virtual_link && (
                            <a
                              href={event.virtual_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#781D32] hover:underline text-sm mt-2"
                            >
                              Join Online <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Contact Info */}
              {(event.contact_email || event.contact_phone) && (
                <motion.div variants={fadeInUp}>
                  <Card className="border-2 border-[#2D3320]/10 shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-[#1A1D14] mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#781D32]" />
                        Contact Information
                      </h3>
                      <div className="flex flex-wrap gap-6">
                        {event.contact_email && (
                          <a
                            href={`mailto:${event.contact_email}`}
                            className="flex items-center gap-2 text-[#3E442B] hover:text-[#781D32] transition-colors"
                          >
                            <Mail className="h-5 w-5" />
                            {event.contact_email}
                          </a>
                        )}
                        {event.contact_phone && (
                          <a
                            href={`tel:${event.contact_phone}`}
                            className="flex items-center gap-2 text-[#3E442B] hover:text-[#781D32] transition-colors"
                          >
                            <Phone className="h-5 w-5" />
                            {event.contact_phone}
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
                    Registration
                  </h3>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Capacity */}
                  {event.max_capacity && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#3E442B]">Spots Available</span>
                        <span className="font-bold text-[#1A1D14]">
                          {event.max_capacity - event.current_registrations} / {event.max_capacity}
                        </span>
                      </div>
                      <Progress
                        value={getCapacityPercentage()}
                        className="h-2"
                      />
                      {getCapacityPercentage() >= 80 && (
                        <p className="text-xs text-[#781D32] font-medium">
                          ⚡ Filling up fast!
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
                      Register Now
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-center space-y-2">
                      <Button disabled className="w-full">
                        {isEventUpcoming(event.start_date)
                          ? "Registration Closed"
                          : "Event Has Ended"}
                      </Button>
                      {event.registration_deadline && isEventUpcoming(event.start_date) && (
                        <p className="text-xs text-[#55613C]">
                          Registration closed on {formatEventDate(event.registration_deadline)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Registration Info */}
                  {event.registration_required && event.registration_deadline && isEventUpcoming(event.registration_deadline) && (
                    <p className="text-sm text-[#55613C] text-center">
                      Register by {formatEventDate(event.registration_deadline)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Share Card */}
              <Card className="border-2 border-[#2D3320]/10 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#1A1D14] mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#781D32]" />
                    Share This Event
                  </h3>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex-1 border-[#2D3320]/30 hover:bg-[#2D3320] hover:text-white transition-colors"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex-1 border-[#2D3320]/30 hover:bg-[#2D3320] hover:text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories/Tags */}
              {event.categories && (
                <Card className="border-2 border-[#2D3320]/10 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-[#1A1D14] mb-4">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.categories.split(",").map((category, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-[#2D3320]/10 text-[#2D3320] hover:bg-[#2D3320]/20 cursor-pointer"
                        >
                          {category.trim()}
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
              Register for Event
            </DialogTitle>
            <DialogDescription className="text-[#3E442B]">
              Fill out the form below to register for &quot;{event.title}&quot;
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={registrationForm.firstName}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="John"
                  className="border-[#2D3320]/30 focus:border-[#781D32]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={registrationForm.lastName}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Doe"
                  className="border-[#2D3320]/30 focus:border-[#781D32]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={registrationForm.email}
                onChange={(e) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="john@example.com"
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                value={registrationForm.phone}
                onChange={(e) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="+1 234 567 8900"
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfAttendees">Number of Attendees</Label>
              <Input
                id="numberOfAttendees"
                type="number"
                min={1}
                max={10}
                value={registrationForm.numberOfAttendees}
                onChange={(e) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    numberOfAttendees: parseInt(e.target.value) || 1,
                  }))
                }
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">
                Special Requirements or Questions (Optional)
              </Label>
              <Textarea
                id="specialRequirements"
                value={registrationForm.specialRequirements}
                onChange={(e) =>
                  setRegistrationForm((prev) => ({
                    ...prev,
                    specialRequirements: e.target.value,
                  }))
                }
                placeholder="Any dietary restrictions, accessibility needs, or questions?"
                rows={3}
                className="border-[#2D3320]/30 focus:border-[#781D32]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  // Handle registration submission
                  console.log("Registration submitted:", registrationForm);
                  setIsRegistrationOpen(false);
                }}
                className="flex-1 bg-[#781D32] hover:bg-[#5E1727] text-white"
              >
                Complete Registration
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRegistrationOpen(false)}
                className="border-[#2D3320]/30"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
