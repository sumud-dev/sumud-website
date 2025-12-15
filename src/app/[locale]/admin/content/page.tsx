"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { getContentStats, getNamespaces } from "@/src/actions/content.actions";
import {
  NAMESPACE_INFO,
  type ContentNamespace,
  type Locale,
} from "@/src/types/Content";
import { Link } from "@/src/i18n/navigation";

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
  en: "English",
  ar: "العربية",
  fi: "Suomi",
};

interface NamespaceCardProps {
  namespace: ContentNamespace;
  locale: Locale;
  itemCount?: number;
}

function NamespaceCard({ namespace, locale, itemCount }: NamespaceCardProps) {
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
          <CardTitle className="text-lg mt-3">{info?.label || namespace}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {info?.description || `Manage ${namespace} content`}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function AdminContentPage() {
  const [activeLocale, setActiveLocale] = React.useState<Locale>("en");
  const [namespaces, setNamespaces] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [stats, setStats] = React.useState<
    { locale: string; count: number; namespaces: number }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load namespaces and stats
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [namespacesResult, statsResult] = await Promise.all([
          getNamespaces(activeLocale),
          getContentStats(),
        ]);

        if (namespacesResult.data) {
          setNamespaces(namespacesResult.data);
        }
        if (statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error("Error loading content data:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeLocale]);

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
            Content Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Edit translatable content across all pages and locales
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["en", "ar", "fi"] as Locale[]).map((locale) => {
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
                  {localeNames[locale]}
                  <Badge variant={activeLocale === locale ? "default" : "outline"}>
                    {locale.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{localeStats?.count || 0} keys</span>
                  <span>{localeStats?.namespaces || 0} sections</span>
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
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/content/search?locale=${activeLocale}`}>
            <Search className="h-4 w-4 mr-2" />
            Search All Content
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
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-sm">
              {searchQuery
                ? `No sections matching "${searchQuery}"`
                : "No content has been seeded yet. Run the seed script to populate the database."}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
