"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Globe,
  Home,
  Users,
  FileText,
  Menu,
  Settings,
  Megaphone,
  Info,
  TrendingUp,
  AlertTriangle,
  Lock,
  Calendar,
  LayoutTemplate,
  FileSignature,
  Search,
  Languages,
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/i18n/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import HeaderMenuEditor from "@/src/components/admin/content/HeaderMenuEditor";
import FooterEditor from "@/src/components/admin/content/FooterEditor";
import ButtonsEditor from "@/src/components/admin/content/ButtonsEditor";

// Mock types
type Locale = "en" | "fi";
type ContentNamespace = string;

// Mock namespace info
const NAMESPACE_INFO: Record<string, { label: string; description: string; icon: string }> = {
  common: { label: "common.label", description: "common.description", icon: "Globe" },
  navigation: { label: "navigation.label", description: "navigation.description", icon: "Menu" },
  homepage: { label: "homepage.label", description: "homepage.description", icon: "Home" },
  about: { label: "about.label", description: "about.description", icon: "Info" },
  team: { label: "team.label", description: "team.description", icon: "Users" },
  articles: { label: "articles.label", description: "articles.description", icon: "FileText" },
};

// Icon mapping for namespaces
const iconMap: Record<string, React.ElementType> = {
  Globe,
  Home,
  Users,
  FileText,
  Menu,
  Settings,
  Megaphone,
  Info,
  TrendingUp,
  AlertTriangle,
  Lock,
  Calendar,
  LayoutTemplate,
  FileSignature,
};

const localeNames: Record<Locale, string> = {
  en: "locale.en",
  fi: "locale.fi",
};

interface NamespaceCardProps {
  namespace: ContentNamespace;
  locale: Locale;
  itemCount?: number;
  t: (key: string) => string;
}

function NamespaceCard({ namespace, locale, itemCount, t }: NamespaceCardProps) {
  const info = NAMESPACE_INFO[namespace];
  const IconComponent = iconMap[info?.icon] || Globe;

  return (
    <Link href={`/admin/content/${namespace}?locale=${locale}`}>
      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            {itemCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {itemCount} keys
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-3">{t(`namespaces.${info?.label}`)}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {t(`namespaces.${info?.description}`)}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

// Mock data
const mockNamespaces = ["common", "navigation", "homepage", "about", "team", "articles"];
const mockStats = [
  { locale: "en", count: 145, namespaces: 6 },
  { locale: "fi", count: 138, namespaces: 6 },
];

export default function AdminContentPage() {
  const t = useTranslations("adminSettings.content");
  const [activeLocale, setActiveLocale] = React.useState<Locale>("en");
  const [activeSection, setActiveSection] = React.useState<"translations" | "header" | "footer" | "buttons">("header");
  const [namespaces] = React.useState<string[]>(mockNamespaces);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [stats] = React.useState<
    { locale: string; count: number; namespaces: number }[]
  >(mockStats);
  const [isLoading] = React.useState(false);

  const filteredNamespaces = namespaces.filter((ns) =>
    ns.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Languages className="h-8 w-8" />
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>
      </div>

      {/* Main Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)}>
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="header" className="gap-2">
            <Menu className="h-4 w-4" />
            {t("tabs.headerMenu")}
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            {t("tabs.footer")}
          </TabsTrigger>
          <TabsTrigger value="buttons" className="gap-2">
            <FileSignature className="h-4 w-4" />
            {t("tabs.buttons")}
          </TabsTrigger>
        </TabsList>

        {/* Translations Tab Content */}
        <TabsContent value="translations" className="mt-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["en", "fi"] as Locale[]).map((locale) => {
              const localeStats = stats.find((s) => s.locale === locale);
              return (
                <Card
                  key={locale}
                  className={`cursor-pointer transition-all ${
                    activeLocale === locale
                      ? "border-primary ring-2 ring-primary/20"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setActiveLocale(locale)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {t(localeNames[locale])}
                      <Badge variant={activeLocale === locale ? "default" : "outline"}>
                        {locale.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{localeStats?.count || 0} {t("mainPage.keys")}</span>
                      <span>{localeStats?.namespaces || 0} {t("mainPage.sections")}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchSections")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" asChild>
              <Link href={`/admin/content/search?locale=${activeLocale}`}>
                <Search className="h-4 w-4 mr-2" />
                {t("searchAllContent")}
              </Link>
            </Button>
          </div>

          {/* Namespaces Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-[140px] animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="h-5 w-24 bg-muted rounded mt-3" />
                    <div className="h-4 w-full bg-muted rounded mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredNamespaces.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">{t("noContentFound")}</h3>
                <p className="text-sm">
                  {searchQuery
                    ? t("noSearchResults", { query: searchQuery })
                    : t("noContentMessage")}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNamespaces.map((namespace) => (
                <NamespaceCard
                  key={namespace}
                  namespace={namespace as ContentNamespace}
                  locale={activeLocale}
                  t={t}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Header Menu Tab Content */}
        <TabsContent value="header" className="mt-6 space-y-6">
          {/* Locale Selector for Header */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t("selectLanguage")}:</span>
            <div className="flex gap-2">
              {(["en", "fi"] as Locale[]).map((locale) => (
                <Button
                  key={locale}
                  variant={activeLocale === locale ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveLocale(locale)}
                  className="gap-2"
                >
                  <Globe className="h-3 w-3" />
                  {t(localeNames[locale])}
                </Button>
              ))}
            </div>
          </div>
          <HeaderMenuEditor locale={activeLocale} />
        </TabsContent>

        {/* Footer Tab Content */}
        <TabsContent value="footer" className="mt-6 space-y-6">
          {/* Locale Selector for Footer */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t("selectLanguage")}:</span>
            <div className="flex gap-2">
              {(["en", "fi"] as Locale[]).map((locale) => (
                <Button
                  key={locale}
                  variant={activeLocale === locale ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveLocale(locale)}
                  className="gap-2"
                >
                  <Globe className="h-3 w-3" />
                  {t(localeNames[locale])}
                </Button>
              ))}
            </div>
          </div>
          <FooterEditor locale={activeLocale} />
        </TabsContent>

        {/* Buttons Tab Content */}
        <TabsContent value="buttons" className="mt-6 space-y-6">
          {/* Locale Selector for Buttons */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t("selectLanguage")}:</span>
            <div className="flex gap-2">
              {(["en", "fi"] as Locale[]).map((locale) => (
                <Button
                  key={locale}
                  variant={activeLocale === locale ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveLocale(locale)}
                  className="gap-2"
                >
                  <Globe className="h-3 w-3" />
                  {t(localeNames[locale])}
                </Button>
              ))}
            </div>
          </div>
          <ButtonsEditor locale={activeLocale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
