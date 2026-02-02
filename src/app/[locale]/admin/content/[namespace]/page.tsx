"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Link } from "@/src/i18n/navigation";
import ContentEditor from "@/src/components/admin/content/ContentEditor";

// Mock types
type ContentNamespace = string;
type Locale = "en" | "fi";

interface SiteContent {
  id: string;
  namespace: string;
  key: string;
  value: string;
  locale: Locale;
}

// Mock namespace info
const NAMESPACE_INFO: Record<string, { label: string; description: string }> = {
  common: { label: "Common", description: "Common UI elements and shared content" },
  navigation: { label: "Navigation", description: "Menu items and navigation labels" },
  homepage: { label: "Homepage", description: "Homepage content and sections" },
  about: { label: "About", description: "About page content" },
  team: { label: "Team", description: "Team member information" },
  articles: { label: "Articles", description: "Article-related content" },
};

// Mock data
const createMockContent = (namespace: string, locale: Locale): SiteContent[] => {
  return [
    {
      id: `${namespace}-${locale}-1`,
      namespace,
      key: "title",
      value: locale === "fi" ? "Otsikko" : "Sample Title",
      locale,
    },
    {
      id: `${namespace}-${locale}-2`,
      namespace,
      key: "description",
      value: locale === "fi" ? "Kuvaus sisällöstä" : "Sample description content",
      locale,
    },
    {
      id: `${namespace}-${locale}-3`,
      namespace,
      key: "cta",
      value: locale === "fi" ? "Klikkaa tästä" : "Click here",
      locale,
    },
  ];
};

interface NamespacePageProps {
  params: Promise<{ namespace: string }>;
}

// locale names come from translations

export default function NamespaceEditorPage({ params }: NamespacePageProps) {
  const t = useTranslations("adminSettings.content");
  const localeNames: Record<Locale, string> = {
    en: t("locale.en"),
    fi: t("locale.fi"),
  };
  const searchParams = useSearchParams();
  const [resolvedParams, setResolvedParams] = React.useState<{ namespace: string } | null>(null);
  
  const initialLocale = (searchParams.get("locale") as Locale) || "en";
  const [activeLocale, setActiveLocale] = React.useState<Locale>(initialLocale);
  const [content, setContent] = React.useState<Record<Locale, SiteContent[]>>({
    en: [],
    fi: [],
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Resolve params
  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const namespace = resolvedParams?.namespace as ContentNamespace;
  const namespaceInfo = namespace ? NAMESPACE_INFO[namespace] : null;

  // Load mock content for all locales
  React.useEffect(() => {
    if (!namespace) return;
    
    // Set mock data
    setContent({
      en: createMockContent(namespace, "en"),
      fi: createMockContent(namespace, "fi"),
    });
  }, [namespace]);

  // Handle locale change
  const handleLocaleChange = (locale: string) => {
    setActiveLocale(locale as Locale);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("locale", locale);
    window.history.pushState({}, "", url);
  };

  // Handle save success
  const handleSaveSuccess = () => {
    if (!namespace) return;
    
    // Optionally refresh mock data
    setContent((prev) => ({
      ...prev,
      [activeLocale]: createMockContent(namespace, activeLocale),
    }));
  };

  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToContent")}
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {namespaceInfo?.label || namespace}
              <Badge variant="outline" className="text-sm font-normal">
                {namespace}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              {namespaceInfo?.description || t("editNamespaceContent", { namespace })}
            </p>
          </div>
        </div>
      </div>

      {/* Locale Tabs */}
      <Tabs value={activeLocale} onValueChange={handleLocaleChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          {(["en", "fi"] as Locale[]).map((locale) => (
            <TabsTrigger key={locale} value={locale} className="gap-2">
              <Globe className="h-4 w-4" />
              {localeNames[locale]}
              <Badge variant="secondary" className="ml-1 text-xs">
                {content[locale].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {(["en", "fi"] as Locale[]).map((locale) => (
              <TabsContent key={locale} value={locale} className="mt-6">
                {content[locale].length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{t("noContentFound")}</h3>
                    <p className="text-sm">
                      {t("noContentForLocale", { locale: localeNames[locale] })}
                    </p>
                  </div>
                ) : (
                  <ContentEditor
                    content={content[locale]}
                    namespace={namespace}
                    locale={locale}
                    onSaveSuccess={handleSaveSuccess}
                  />
                )}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>
    </div>
  );
}
