"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { 
  LayoutPanelTop, 
  Filter, 
  Target, 
  Grid3x3, 
  AlertCircle,
  ChevronRight,
  Search,
  Heart,
  Users,
  Loader2
} from "lucide-react";
import { cn } from "@/src/lib/utils/utils";
import { useCampaigns } from "@/src/lib/hooks/use-campaigns";
import { getTranslationsAction } from "@/src/actions/translations";
import Image from "next/image";

interface CampaignsPagePreviewProps {
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

export function CampaignsPagePreview({ 
  selectedLocale, 
  onSectionClick,
  highlightedSection 
}: CampaignsPagePreviewProps) {
  const t = useTranslations("adminSettings.campaigns.preview");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState(true);
  
  // Fetch real campaigns data
  const { data: campaignsResponse, isLoading } = useCampaigns({
    status: "published",
    limit: 1,
    language: selectedLocale,
  });
  
  const sampleCampaign = campaignsResponse?.[0];
  const totalCampaigns = campaignsResponse?.length || 0;
  
  // Fetch translations from database
  useEffect(() => {
    const loadTranslations = async () => {
      setLoadingTranslations(true);
      try {
        const result = await getTranslationsAction(selectedLocale);
        if (result.success && result.data) {
          const translationsMap: Record<string, string> = {};
          result.data
            .filter((t) => t.namespace === "campaigns")
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
      translationKeys: ["hero.badge", "hero.title", "hero.subtitle", "hero.description", "hero.campaignsCount"],
      preview: loadingTranslations ? (
        <div className="bg-linear-to-r from-[#2D3320] to-[#3d4430] text-white p-6 rounded-lg flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="bg-linear-to-r from-[#2D3320] to-[#3d4430] text-white p-6 rounded-lg">
          <Badge className="mb-3 bg-[#781D32]">
            {getTranslation("hero.badge", selectedLocale === "en" ? "Campaigns" : "Kampanjat")}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            {getTranslation("hero.title", selectedLocale === "en" ? "Join Our Campaigns" : "Liity kampanjoihimme")}
          </h1>
          <p className="text-gray-300 mb-4">
            {getTranslation("hero.subtitle", selectedLocale === "en" 
              ? "Stand with Palestine through action and advocacy" 
              : "Seiso Palestiinan rinnalla teoilla ja edunvalvonnalla")}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            <span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin inline" />
              ) : (
                getTranslation("hero.campaignsCount", selectedLocale === "en" ? `${totalCampaigns} Active Campaigns` : `${totalCampaigns} aktiivista kampanjaa`).replace("{count}", String(totalCampaigns))
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
        "filters.category.label",
        "filters.activeOnly",
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
              {getTranslation("filters.search.placeholder", selectedLocale === "en" ? "Search campaigns..." : "Etsi kampanjoita...")}
            </div>
            <button className="px-4 py-2 bg-[#781D32] text-white rounded-md text-sm">
              {getTranslation("filters.search.button", selectedLocale === "en" ? "Search" : "Hae")}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="border rounded-md px-3 py-2 text-sm">
              {getTranslation("filters.type.label", selectedLocale === "en" ? "Campaign Type" : "Kampanjan tyyppi")}
            </div>
            <div className="border rounded-md px-3 py-2 text-sm">
              {getTranslation("filters.category.label", selectedLocale === "en" ? "Category" : "Kategoria")}
            </div>
            <div className="border rounded-md px-3 py-2 text-sm flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              {getTranslation("filters.activeOnly", selectedLocale === "en" ? "Active Only" : "Vain aktiiviset")}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "categories",
      section: "categories",
      icon: <Target className="h-5 w-5" />,
      title: t("blocks.categories.title"),
      description: t("blocks.categories.description"),
      translationKeys: [
        "categories.title",
        "categories.advocacy",
        "categories.boycott",
        "categories.humanitarian"
      ],
      preview: loadingTranslations ? (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-4">
            {getTranslation("categories.title", selectedLocale === "en" ? "Campaign Categories" : "Kampanjatyypit")}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {["advocacy", "boycott", "humanitarian"].map((category) => (
              <div 
                key={category}
                className="border rounded-md px-3 py-2 text-center text-sm hover:bg-gray-50 cursor-pointer"
              >
                {getTranslation(`categories.${category}`, category)}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "campaignCard",
      section: "card",
      icon: <Grid3x3 className="h-5 w-5" />,
      title: t("blocks.campaignCard.title"),
      description: t("blocks.campaignCard.description"),
      translationKeys: [
        "card.featured",
        "card.active",
        "card.viewDetails",
        "card.participate",
        "card.status.active",
        "card.status.upcoming",
        "card.status.completed"
      ],
      preview: isLoading ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      ) : sampleCampaign ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          {sampleCampaign.featuredImage && (
            <div className="relative aspect-video w-full">
              <Image 
                src={sampleCampaign.featuredImage} 
                alt={sampleCampaign.title || ""} 
                fill
                className="object-cover"
              />
            </div>
          )}
          {!sampleCampaign.featuredImage && (
            <div className="aspect-video bg-linear-to-br from-[#781D32] to-[#2D3320]" />
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold line-clamp-2">
                {sampleCampaign.title || (selectedLocale === "en" ? "Untitled Campaign" : "Nimetön kampanja")}
              </h4>
              {sampleCampaign.category && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {sampleCampaign.category}
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {sampleCampaign.campaignType && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{sampleCampaign.campaignType}</span>
                </div>
              )}
              {sampleCampaign.isActive && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{getTranslation("card.active", selectedLocale === "en" ? "Active" : "Aktiivinen")}</span>
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
                {selectedLocale === "en" ? "No campaigns available" : "Ei kampanjoita saatavilla"}
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
        "empty.noCampaigns",
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
            {getTranslation("empty.noCampaigns", selectedLocale === "en" ? "No Campaigns Found" : "Kampanjoita ei löytynyt")}
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
