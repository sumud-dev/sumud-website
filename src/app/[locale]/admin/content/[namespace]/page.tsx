"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
import { getContentByNamespace } from "@/src/actions/content.actions";
import {
  NAMESPACE_INFO,
  type ContentNamespace,
  type Locale,
  type SiteContent,
} from "@/src/types/Content";

interface NamespacePageProps {
  params: Promise<{ namespace: string }>;
}

const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fi: "Suomi",
};

export default function NamespaceEditorPage({ params }: NamespacePageProps) {
  const searchParams = useSearchParams();
  const [resolvedParams, setResolvedParams] = React.useState<{ namespace: string } | null>(null);
  
  const initialLocale = (searchParams.get("locale") as Locale) || "en";
  const [activeLocale, setActiveLocale] = React.useState<Locale>(initialLocale);
  const [content, setContent] = React.useState<Record<Locale, SiteContent[]>>({
    en: [],
    ar: [],
    fi: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Resolve params
  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const namespace = resolvedParams?.namespace as ContentNamespace;
  const namespaceInfo = namespace ? NAMESPACE_INFO[namespace] : null;

  // Load content for all locales
  React.useEffect(() => {
    async function loadContent() {
      if (!namespace) return;
      
      setIsLoading(true);
      try {
        const [enResult, arResult, fiResult] = await Promise.all([
          getContentByNamespace(namespace, "en"),
          getContentByNamespace(namespace, "ar"),
          getContentByNamespace(namespace, "fi"),
        ]);

        setContent({
          en: enResult.data || [],
          ar: arResult.data || [],
          fi: fiResult.data || [],
        });
      } catch (error) {
        console.error("Error loading content:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [namespace]);

  // Handle locale change
  const handleLocaleChange = (locale: string) => {
    setActiveLocale(locale as Locale);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("locale", locale);
    window.history.pushState({}, "", url);
  };

  // Refresh content after save
  const handleSaveSuccess = async () => {
    if (!namespace) return;
    
    const result = await getContentByNamespace(namespace, activeLocale);
    if (result.data) {
      setContent((prev) => ({
        ...prev,
        [activeLocale]: result.data || [],
      }));
    }
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
            Back to Content
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
              {namespaceInfo?.description || `Edit ${namespace} content`}
            </p>
          </div>
        </div>
      </div>

      {/* Locale Tabs */}
      <Tabs value={activeLocale} onValueChange={handleLocaleChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          {(["en", "ar", "fi"] as Locale[]).map((locale) => (
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
            {(["en", "ar", "fi"] as Locale[]).map((locale) => (
              <TabsContent key={locale} value={locale} className="mt-6">
                {content[locale].length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No content found</h3>
                    <p className="text-sm">
                      No content exists for {localeNames[locale]} in this section.
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
