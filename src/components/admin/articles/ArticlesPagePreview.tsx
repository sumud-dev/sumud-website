"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { 
  LayoutPanelTop, 
  FileText, 
  Grid3x3, 
  AlertCircle,
  ChevronRight,
  Clock,
  User,
  Tag,
  Share2,
  Loader2
} from "lucide-react";
import { cn } from "@/src/lib/utils/utils";
import { usePosts } from "@/src/lib/hooks/use-posts";
import Image from "next/image";

interface ArticlesPagePreviewProps {
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

export function ArticlesPagePreview({ 
  selectedLocale, 
  onSectionClick,
  highlightedSection 
}: ArticlesPagePreviewProps) {
  const t = useTranslations("adminSettings.articles.preview");
  
  // Fetch real articles data
  const { data: articlesResponse, isLoading } = usePosts({
    status: "published",
    limit: 2,
    language: selectedLocale,
  });
  
  const sampleArticle = articlesResponse?.posts?.[0];
  const relatedArticles = articlesResponse?.posts?.slice(0, 2) || [];
  
  const blocks: PreviewBlock[] = [
    {
      id: "hero",
      section: "hero",
      icon: <LayoutPanelTop className="h-5 w-5" />,
      title: t("blocks.hero.title"),
      description: t("blocks.hero.description"),
      translationKeys: ["hero.title", "hero.subtitle", "hero.description"],
      preview: (
        <div className="bg-linear-to-r from-[#2D3320] to-[#3d4430] text-white p-6 rounded-lg">
          <Badge className="mb-3 bg-[#781D32]">{selectedLocale === "en" ? "Articles" : "Artikkelit"}</Badge>
          <h1 className="text-3xl font-bold mb-2">
            {selectedLocale === "en" ? "Stories & Insights" : "Tarinat & Näkemykset"}
          </h1>
          <p className="text-gray-300">
            {selectedLocale === "en" 
              ? "Explore articles about Palestinian culture, history, and community" 
              : "Tutustu artikkeleihin palestiinalaisesta kulttuurista, historiasta ja yhteisöstä"}
          </p>
        </div>
      ),
    },
    {
      id: "articleCard",
      section: "card",
      icon: <Grid3x3 className="h-5 w-5" />,
      title: t("blocks.articleCard.title"),
      description: t("blocks.articleCard.description"),
      translationKeys: [
        "card.readMore",
        "card.minRead",
        "card.publishedOn",
        "card.author"
      ],
      preview: isLoading ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      ) : sampleArticle ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          {sampleArticle.featuredImage && (
            <div className="relative aspect-video w-full">
              <Image 
                src={sampleArticle.featuredImage} 
                alt={sampleArticle.title} 
                fill
                className="object-cover"
              />
            </div>
          )}
          {!sampleArticle.featuredImage && (
            <div className="aspect-video bg-linear-to-br from-[#781D32] to-[#2D3320]" />
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {sampleArticle.categories && sampleArticle.categories.length > 0 && (
                <Badge variant="outline">{sampleArticle.categories[0]}</Badge>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedLocale === "en" ? "5 min read" : "5 min lukuaika"}
              </span>
            </div>
            <h4 className="font-semibold line-clamp-2">
              {sampleArticle.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {sampleArticle.excerpt}
            </p>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>
                  {selectedLocale === "en" ? "By " : "Kirjoittaja: "}
                  {sampleArticle.authorName || (selectedLocale === "en" ? "Unknown" : "Tuntematon")}
                </span>
              </div>
              <button className="text-[#781D32] text-sm font-medium flex items-center gap-1 hover:underline">
                {selectedLocale === "en" ? "Read More" : "Lue lisää"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="aspect-video bg-linear-to-br from-[#781D32] to-[#2D3320]" />
          <div className="p-4 space-y-3">
            <h4 className="font-semibold line-clamp-2">
              {selectedLocale === "en" ? "No articles available" : "Ei artikkeleita saatavilla"}
            </h4>
          </div>
        </div>
      ),
    },
    {
      id: "articleDetail",
      section: "detail",
      icon: <FileText className="h-5 w-5" />,
      title: t("blocks.articleDetail.title"),
      description: t("blocks.articleDetail.description"),
      translationKeys: [
        "detail.backButton",
        "detail.shareArticle",
        "detail.relatedArticles",
        "detail.continueExploring"
      ],
      preview: isLoading ? (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      ) : sampleArticle ? (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ChevronRight className="h-4 w-4 rotate-180" />
            {selectedLocale === "en" ? "Back to Articles" : "Takaisin artikkeleihin"}
          </button>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {sampleArticle.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {sampleArticle.authorName || (selectedLocale === "en" ? "Unknown" : "Tuntematon")}
              </span>
              {sampleArticle.publishedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(sampleArticle.publishedAt).toLocaleDateString(
                    selectedLocale === "en" ? "en-US" : "fi-FI",
                    { year: 'numeric', month: selectedLocale === "en" ? "short" : "numeric", day: 'numeric' }
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Share2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              {selectedLocale === "en" ? "Share Article" : "Jaa artikkeli"}
            </span>
          </div>

          {relatedArticles.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">
                {selectedLocale === "en" ? "Related Articles" : "Liittyvät artikkelit"}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {relatedArticles.map((article) => (
                  <div key={article.id} className="border rounded-md p-2">
                    {article.featuredImage ? (
                      <div className="relative aspect-video rounded mb-2 bg-gray-200">
                        <Image 
                          src={article.featuredImage} 
                          alt={article.title} 
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-200 rounded mb-2" />
                    )}
                    <p className="text-xs font-medium line-clamp-2">
                      {article.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ChevronRight className="h-4 w-4 rotate-180" />
            {selectedLocale === "en" ? "Back to Articles" : "Takaisin artikkeleihin"}
          </button>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {selectedLocale === "en" ? "No article available" : "Ei artikkelia saatavilla"}
            </h2>
          </div>
        </div>
      ),
    },
    {
      id: "filters",
      section: "filters",
      icon: <Tag className="h-5 w-5" />,
      title: t("blocks.filters.title"),
      description: t("blocks.filters.description"),
      translationKeys: [
        "filters.category",
        "filters.sortBy",
        "filters.latest",
        "filters.popular",
        "filters.showAll"
      ],
      preview: (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {selectedLocale === "en" ? "Filter Articles" : "Suodata artikkelit"}
            </h3>
            <button className="text-xs text-[#781D32]">
              {selectedLocale === "en" ? "Clear" : "Tyhjennä"}
            </button>
          </div>
          <div className="space-y-2">
            <div className="border rounded-md px-3 py-2 text-sm">
              {selectedLocale === "en" ? "Category" : "Kategoria"}
            </div>
            <div className="border rounded-md px-3 py-2 text-sm">
              {selectedLocale === "en" ? "Sort By: Latest" : "Järjestä: Uusimmat"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{selectedLocale === "en" ? "Culture" : "Kulttuuri"}</Badge>
            <Badge variant="outline">{selectedLocale === "en" ? "History" : "Historia"}</Badge>
            <Badge variant="outline">{selectedLocale === "en" ? "Community" : "Yhteisö"}</Badge>
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
        "empty.noArticles",
        "empty.noResults",
        "empty.tryAdjusting",
        "empty.clearFilters"
      ],
      preview: (
        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">
            {selectedLocale === "en" ? "No Articles Found" : "Artikkeleita ei löytynyt"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedLocale === "en" 
              ? "Try adjusting your filters or search terms" 
              : "Kokeile muuttaa suodattimia tai hakuehtoja"}
          </p>
          <button className="px-4 py-2 border rounded-md text-sm">
            {selectedLocale === "en" ? "Clear Filters" : "Tyhjennä suodattimet"}
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
