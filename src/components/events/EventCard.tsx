"use client";

import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Globe, 
  Video,
  Share2,
  CalendarPlus,
  ExternalLink,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import type { BaseEvent } from "@/src/lib/types/event";
import {
  formatEventDate,
  isEventUpcoming,
  canRegisterForEvent,
  getEventTypeColor,
  getEventTypeHexColor,
  EVENT_TYPES,
  EVENT_LOCATION_MODES,
} from "@/src/lib/types/event";

interface EventCardProps {
  event: BaseEvent;
  showRegistration?: boolean;
  showSocialActions?: boolean;
  showCapacityIndicator?: boolean;
  onRegister?: (event: BaseEvent) => void | Promise<void>;
  className?: string;
}

export function EventCard({
  event,
  showRegistration = false,
  showSocialActions = false,
  showCapacityIndicator = false,
  onRegister,
  className = "",
}: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isUpcoming = isEventUpcoming(event.start_date);
  const canRegister = canRegisterForEvent(event);
  const eventTypeColor = getEventTypeColor(event.event_type);
  const eventTypeHexColor = getEventTypeHexColor(event.event_type);

  const formatCapacity = () => {
    const currentRegs = event.current_registrations ?? 0;
    if (event.max_capacity) {
      return `${currentRegs}/${event.max_capacity}`;
    }
    return currentRegs.toString();
  };

  const getLocationIcon = () => {
    switch (event.location_mode) {
      case "virtual":
        return <Video className="h-4 w-4" />;
      case "hybrid":
        return <Globe className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getLocationText = () => {
    if (event.location_mode === "virtual") {
      return event.virtual_platform || "Online Event";
    }
    if (event.location_mode === "hybrid") {
      return `${event.venue_name || "TBD"} + Online`;
    }
    return event.venue_name || "Location TBD";
  };

  const getCapacityPercentage = () => {
    if (!event.max_capacity || event.max_capacity === 0) return 0;
    const currentRegs = event.current_registrations ?? 0;
    return Math.min((currentRegs / event.max_capacity) * 100, 100);
  };

  const getEventStatus = () => {
    if (!event.start_date) return "upcoming";
    
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;
    
    if (now < startDate) return "upcoming";
    if (now >= startDate && now <= endDate) return "live";
    return "past";
  };

  const getStatusIcon = () => {
    const status = getEventStatus();
    switch (status) {
      case "live":
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case "upcoming":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "past":
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    const status = getEventStatus();
    switch (status) {
      case "live":
        return (
          <Badge className="bg-red-500 text-white border-red-500 animate-pulse">
            🔴 LIVE NOW
          </Badge>
        );
      case "upcoming":
        return null;
      case "past":
        return (
          <Badge variant="secondary" className="text-gray-600 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Past Event
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleShare = async (platform: string) => {
    const eventUrl = `${window.location.origin}/events/${event.slug}`;
    const text = `Join us for ${event.title} - ${formatEventDate(event.start_date)}`;
    
    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(`${text} - ${eventUrl}`);
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
          // Fallback for older browsers or when clipboard API is not available
          try {
            const textArea = document.createElement('textarea');
            textArea.value = `${text} - ${eventUrl}`;
            document.body.appendChild(textArea);
            textArea.select();
            // Use deprecated method as fallback
             
            document.execCommand('copy');
            document.body.removeChild(textArea);
          } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
          }
        }
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const handleAddToCalendar = () => {
    if (!event.start_date) return;
    
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const googleCalendarUrl = [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      `&text=${encodeURIComponent(event.title)}`,
      `&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `&details=${encodeURIComponent(event.content || '')}`,
      `&location=${encodeURIComponent(getLocationText())}`,
    ].join('');
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleRegistration = async () => {
    if (!canRegister || !onRegister) return;
    
    setIsRegistering(true);
    try {
      await onRegister(event);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group ${className}`}
    >
      <Card className="h-full border border-[#55613C]/20 hover:border-[#781D32]/30 hover:shadow-xl transition-all duration-300 overflow-hidden bg-linear-to-br from-white to-gray-50/30">
        <CardHeader className="p-0 relative">
          {event.featured_image && (
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={event.featured_image}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {event.is_featured && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge className="bg-linear-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </motion.div>
                )}
                
                {getStatusBadge()}
              </div>
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <Badge
                  className="text-white border-white/20 backdrop-blur-sm shadow-lg"
                  style={{ backgroundColor: `${eventTypeColor}CC` }}
                >
                  {event.event_type ? (EVENT_TYPES as any)[event.event_type] : 'Event'}
                </Badge>
                
                {showSocialActions && (
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                        isLiked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                    
                    <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                        >
                          <Share2 className="h-4 w-4" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-[#55613C]/20">
                        <DropdownMenuItem onClick={() => handleShare('twitter')}>
                          Share on Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('facebook')}>
                          Share on Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('copy')}>
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6 flex flex-col h-full">
          <div className="space-y-4 grow">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link
                  href={`/events/${event.slug}`}
                  className="group-hover:text-[#781D32] transition-colors flex-1"
                >
                  <h3 className="text-xl font-bold line-clamp-2 text-[#3E442B] group-hover:text-[#781D32] transition-colors">
                    {event.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                {event.content}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-[#f4f3f0] border border-[#55613C]/10">
                <Calendar className="h-4 w-4 shrink-0 text-[#781D32]" />
                <span className="font-medium text-[#3E442B]">
                  {formatEventDate(event.start_date)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-1.5 rounded-md bg-[#55613C]/10">
                  {getLocationIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {event.location_mode ? (EVENT_LOCATION_MODES as any)[event.location_mode] : 'Location'}
                  </p>
                  <p className="font-medium text-[#3E442B] line-clamp-1">
                    {getLocationText()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="h-4 w-4 shrink-0 text-[#781D32]" />
                    <span className="font-medium">
                      {formatCapacity()} registered
                    </span>
                  </div>
                  
                  {event.max_capacity && showCapacityIndicator && (
                    <div className="text-xs text-gray-500">
                      {getCapacityPercentage().toFixed(0)}% full
                    </div>
                  )}
                </div>
                
                {event.max_capacity && showCapacityIndicator && (
                  <div className="space-y-1">
                    <Progress 
                      value={getCapacityPercentage()} 
                      className="h-2 bg-gray-200"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Available spots</span>
                      <span>
                        {Math.max(0, event.max_capacity - (event.current_registrations ?? 0))} remaining
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!event.registration_required ? (
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                    Free Event
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-[#781D32]/30 text-[#781D32]">
                    Registration Required
                  </Badge>
                )}
                
                {event.max_capacity && (event.current_registrations ?? 0) >= event.max_capacity && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                    Sold Out
                  </Badge>
                )}
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#55613C]/10 mt-auto">
            <div className="flex gap-2">
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="flex-1 border-[#55613C]/20 hover:bg-[#55613C]/10 hover:border-[#55613C]/30 transition-all duration-200"
              >
                <Link href={`/events/${event.slug}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
              
              {showRegistration && (
                <>
                  {canRegister && onRegister ? (
                    <Button 
                      onClick={handleRegistration}
                      size="sm"
                      disabled={isRegistering}
                      className={`flex-1 text-white transition-all duration-200 hover:shadow-lg ${
                        isRegistering ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      style={{ backgroundColor: eventTypeHexColor }}
                    >
                      {isRegistering ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Registering...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Register Now
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      disabled 
                      className="flex-1 bg-gray-100 text-gray-500"
                    >
                      {event.max_capacity && (event.current_registrations ?? 0) >= event.max_capacity
                        ? "Event Full"
                        : !isUpcoming
                        ? "Event Ended" 
                        : "Registration Closed"}
                    </Button>
                  )}
                </>
              )}
            </div>

            {(showSocialActions || isUpcoming) && (
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {isUpcoming && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddToCalendar}
                      className="h-8 px-2 text-[#55613C] hover:bg-[#55613C]/10"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {showSocialActions && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{(event.current_registrations ?? 0) > 10 ? Math.floor((event.current_registrations ?? 0) / 5) : 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}