"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { 
  LayoutPanelTop, 
  Filter, 
  Calendar, 
  Grid3x3, 
  AlertCircle,
  ChevronRight,
  Search,
  Clock,
  MapPin,
  Loader2
} from "lucide-react";
import { cn } from "@/src/lib/utils/utils";
import { useEvents } from "@/src/lib/hooks/use-events";
import { getTranslationsAction } from "@/src/actions/translations";
import Image from "next/image";

interface EventsPagePreviewProps {
  selectedLocale: "en" | "fi";
  onSectionClick?: (section: string) => void;
  highlightedSection?: string;
}

interface PreviewBlock {
  id: string;
  section: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  translationKeys: string[];
  preview: React.ReactNode;
}

export function EventsPagePreview({ 
  selectedLocale, 
  onSectionClick,
  highlightedSection 
}: EventsPagePreviewProps) {
  const t = useTranslations("adminSettings.events.preview");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState(true);
  
  // Fetch real events data
  const { data: eventsResponse, isLoading } = useEvents({
    status: "published",
    limit: 1,
    language: selectedLocale,
  });
  
  const sampleEvent = eventsResponse?.events?.[0];
  const totalEvents = eventsResponse?.events?.length || 0;
  
  // Fetch translations from database
  useEffect(() => {
    const loadTranslations = async () => {
      setLoadingTranslations(true);
      try {
        const result = await getTranslationsAction(selectedLocale);
        if (result.success && result.data) {
          const translationsMap: Record<string, string> = {};
          result.data
            .filter((t) => t.namespace === "events")
            .forEach((t) => {
              translationsMap[t.key] = t.value;
            });
          setTranslations(translationsMap);
        }
      } catch (error) {
        console.error("Failed to load translations:", error);
      } finally {
        setLoadingTranslations(false);
      }
    };
    loadTranslations();
  }, [selectedLocale]);
  
  // Helper to get translation value with fallback
  const getTranslation = (key: string, fallback: string) => {
    return translations[key] || fallback;
  };
  
  const blocks: PreviewBlock[] = [
    {
      id: "hero",
      section: "hero",
      icon: <LayoutPanelTop className="h-5 w-5" />,
      title: t("blocks.hero.title"),
      description: t("blocks.hero.description"),
      translationKeys: ["hero.badge", "hero.title", "hero.subtitle", "hero.description", "hero.eventsCount"],
      preview: loadingTranslations ? (
        <div className="bg-linear-to-r from-[#2D3320] to-[#3d4430] text-white p-6 rounded-lg flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="bg-linear-to-r from-[#2D3320] to-[#3d4430] text-white p-6 rounded-lg">
          <Badge className="mb-3 bg-[#781D32]">
            {getTranslation("hero.badge", selectedLocale === "en" ? "Events" : "Tapahtumat")}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            {getTranslation("hero.title", selectedLocale === "en" ? "Discover Palestinian Events" : "Löydä palestiinalaisia tapahtumia")}
          </h1>
          <p className="text-gray-300 mb-4">
            {getTranslation("hero.subtitle", selectedLocale === "en" 
              ? "Join us in celebrating culture, community, and heritage" 
              : "Liity meihin juhlimaan kulttuuria, yhteisöä ja perintöä")}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin inline" />
              ) : (
                getTranslation("hero.eventsCount", selectedLocale === "en" ? `${totalEvents} Events` : `${totalEvents} tapahtumaa`).replace("{count}", String(totalEvents))
              )}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "filters",
      section: "filters",
      icon: <Filter className="h-5 w-5" />,
      title: t("blocks.filters.title"),
      description: t("blocks.filters.description"),
      translationKeys: [
        "filters.search.placeholder",
        "filters.search.button",
        "filters.type.label",
        "filters.location.label",
        "filters.upcomingOnly",
        "filters.clearAll"
      ],
      preview: loadingTranslations ? (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 border rounded-md px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
              <Search className="h-4 w-4" />
              {getTranslation("filters.search.placeholder", selectedLocale === "en" ? "Search events..." : "Etsi tapahtumia...")}
            </div>
            <button className="px-4 py-2 bg-[#781D32] text-white rounded-md text-sm">
              {getTranslation("filters.search.button", selectedLocale === "en" ? "Search" : "Hae")}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="border rounded-md px-3 py-2 text-sm">
              {getTranslation("filters.type.label", selectedLocale === "en" ? "Event Type" : "Tapahtuman tyyppi")}
            </div>
            <div className="border rounded-md px-3 py-2 text-sm">
              {getTranslation("filters.location.label", selectedLocale === "en" ? "Location" : "Sijainti")}
            </div>
            <div className="border rounded-md px-3 py-2 text-sm flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              {getTranslation("filters.upcomingOnly", selectedLocale === "en" ? "Upcoming Only" : "Vain tulevat")}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "calendar",
      section: "calendar",
      icon: <Calendar className="h-5 w-5" />,
      title: t("blocks.calendar.title"),
      description: t("blocks.calendar.description"),
      translationKeys: [
        "calendar.title",
        "calendar.viewMode",
        "calendar.months",
        "calendar.days"
      ],
      preview: loadingTranslations ? (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {getTranslation("calendar.title", selectedLocale === "en" ? "Event Calendar" : "Tapahtumakalenteri")}
            </h3>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-xs border rounded">{getTranslation("calendar.viewMode.month", selectedLocale === "en" ? "Month" : "Kuukausi")}</button>
              <button className="px-2 py-1 text-xs border rounded">{getTranslation("calendar.viewMode.week", selectedLocale === "en" ? "Week" : "Viikko")}</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="font-semibold py-1">{day}</div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "aspect-square flex items-center justify-center rounded",
                  i === 15 && "bg-[#781D32] text-white font-bold",
                  i === 8 && "bg-[#2D3320] text-white",
                  "hover:bg-gray-100 cursor-pointer"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "eventCard",
      section: "card",
      icon: <Grid3x3 className="h-5 w-5" />,
      title: t("blocks.eventCard.title"),
      description: t("blocks.eventCard.description"),
      translationKeys: [
        "card.virtualEvent",
        "card.freeEvent",
        "card.viewDetails",
        "card.register",
        "card.status.upcoming",
        "card.status.ongoing",
        "card.status.past"
      ],
      preview: isLoading ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      ) : sampleEvent ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          {sampleEvent.featuredImage && (
            <div className="relative aspect-video w-full">
              <Image 
                src={sampleEvent.featuredImage} 
                alt={sampleEvent.title || ""} 
                fill
                className="object-cover"
              />
            </div>
          )}
          {!sampleEvent.featuredImage && (
            <div className="aspect-video bg-linear-to-br from-[#781D32] to-[#2D3320]" />
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold line-clamp-2">
                {sampleEvent.title || (selectedLocale === "en" ? "Untitled Event" : "Nimetön tapahtuma")}
              </h4>
              {sampleEvent.categories && Array.isArray(sampleEvent.categories) && sampleEvent.categories.length > 0 && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {sampleEvent.categories[0]}
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {sampleEvent.date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(sampleEvent.date).toLocaleDateString(
                      selectedLocale === "en" ? "en-US" : "fi-FI",
                      { year: 'numeric', month: selectedLocale === "en" ? "short" : "numeric", day: 'numeric' }
                    )}
                  </span>
                </div>
              )}
              {sampleEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{sampleEvent.location}</span>
                </div>
              )}
            </div>
            <button className="w-full py-2 bg-[#781D32] text-white rounded-md text-sm font-medium flex items-center justify-center gap-2">
              {getTranslation("card.viewDetails", selectedLocale === "en" ? "View Details" : "Näytä tiedot")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="aspect-video bg-linear-to-br from-[#781D32] to-[#2D3320]" />
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold line-clamp-2">
                {selectedLocale === "en" ? "No events available" : "Ei tapahtumia saatavilla"}
              </h4>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "emptyState",
      section: "empty",
      icon: <AlertCircle className="h-5 w-5" />,
      title: t("blocks.emptyState.title"),
      description: t("blocks.emptyState.description"),
      translationKeys: [
        "empty.noEvents",
        "empty.noResults",
        "empty.tryAdjusting",
        "empty.clearFilters"
      ],
      preview: loadingTranslations ? (
        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">
            {getTranslation("empty.noEvents", selectedLocale === "en" ? "No Events Found" : "Tapahtumia ei löytynyt")}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {getTranslation("empty.tryAdjusting", selectedLocale === "en" 
              ? "Try adjusting your filters or search terms" 
              : "Kokeile muuttaa suodattimia tai hakuehtojas")}
          </p>
          <button className="px-4 py-2 border rounded-md text-sm">
            {getTranslation("empty.clearFilters", selectedLocale === "en" ? "Clear Filters" : "Tyhjennä suodattimet")}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <Card
            key={block.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              highlightedSection === block.section && "ring-2 ring-[#781D32] shadow-lg"
            )}
            onClick={() => onSectionClick?.(block.section)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-[#2D3320] text-white rounded-lg">
                  {block.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{block.title}</h4>
                  <p className="text-sm text-muted-foreground">{block.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {block.translationKeys.map((key) => (
                    <Badge key={key} variant="secondary" className="text-xs font-mono">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                {block.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
