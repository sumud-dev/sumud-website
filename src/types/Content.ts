import { Tables, TablesInsert, TablesUpdate } from "@/src/lib/database.types";

// Database types from Supabase
export type SiteContent = Tables<"site_content">;
export type SiteContentInsert = TablesInsert<"site_content">;
export type SiteContentUpdate = TablesUpdate<"site_content">;

// Content types for different field kinds
export type ContentType = "text" | "textarea" | "richtext" | "array";

// Locale options
export type Locale = "en" | "ar" | "fi";

// Available namespaces (content sections)
export const CONTENT_NAMESPACES = [
  "common",
  "navigation",
  "homepage",
  "membership",
  "petitions",
  "footer",
  "admin",
  "campaignsPage",
  "articlesPage",
  "about",
  "impact",
  "errors",
  "auth",
  "events",
] as const;

export type ContentNamespace = (typeof CONTENT_NAMESPACES)[number];

// Namespace metadata for display
export const NAMESPACE_INFO: Record<
  ContentNamespace,
  { label: string; description: string; icon: string }
> = {
  common: {
    label: "Common",
    description: "Shared UI labels, buttons, and common text",
    icon: "Globe",
  },
  navigation: {
    label: "Navigation",
    description: "Menu items and navigation links",
    icon: "Menu",
  },
  homepage: {
    label: "Homepage",
    description: "Hero section, stats, features, and homepage content",
    icon: "Home",
  },
  membership: {
    label: "Membership",
    description: "Membership tiers, forms, and registration content",
    icon: "Users",
  },
  petitions: {
    label: "Petitions",
    description: "Campaign and petition page content",
    icon: "FileSignature",
  },
  footer: {
    label: "Footer",
    description: "Footer links, newsletter, and copyright",
    icon: "LayoutTemplate",
  },
  admin: {
    label: "Admin Dashboard",
    description: "Admin panel labels and dashboard content",
    icon: "Settings",
  },
  campaignsPage: {
    label: "Campaigns Page",
    description: "Campaign listing page content",
    icon: "Megaphone",
  },
  articlesPage: {
    label: "Articles Page",
    description: "Articles listing and blog content",
    icon: "FileText",
  },
  about: {
    label: "About Page",
    description: "About us, mission, and values content",
    icon: "Info",
  },
  impact: {
    label: "Impact Page",
    description: "Impact statistics and artisan stories",
    icon: "TrendingUp",
  },
  errors: {
    label: "Error Pages",
    description: "404, 500, and error message content",
    icon: "AlertTriangle",
  },
  auth: {
    label: "Authentication",
    description: "Login, signup, and auth form content",
    icon: "Lock",
  },
  events: {
    label: "Events",
    description: "Events page and calendar content",
    icon: "Calendar",
  },
};

// Grouped content item for editing
export interface ContentItem {
  id: string;
  key: string;
  value: string;
  contentType: ContentType;
  updatedAt: string | null;
}

// Content grouped by namespace
export interface NamespaceContent {
  namespace: ContentNamespace;
  items: ContentItem[];
  locale: Locale;
}

// Response types for server actions
export interface ContentResponse {
  data: SiteContent[] | null;
  error: string | null;
}

export interface ContentUpdateResponse {
  success: boolean;
  error: string | null;
}

// Bulk update payload
export interface BulkContentUpdate {
  id: string;
  value: string;
}
