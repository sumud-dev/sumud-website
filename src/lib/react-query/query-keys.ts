// Query key factory for type-safe and consistent query keys
// Following TanStack Query best practices for key management

export interface CampaignFilters {
  language?: string;
  status?: string;
  campaignType?: string;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
}

export interface ArticleFilters {
  language?: string;
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EventFilters {
  status?: string;
  eventType?: string;
  locationMode?: string;
  language?: string;
  search?: string;
  upcoming?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const queryKeys = {
  // Campaigns
  campaigns: {
    all: ["campaigns"] as const,
    lists: () => [...queryKeys.campaigns.all, "list"] as const,
    list: (filters?: CampaignFilters) =>
      [...queryKeys.campaigns.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.campaigns.all, "detail"] as const,
    detail: (slug: string) => [...queryKeys.campaigns.details(), slug] as const,
  },

  // Articles / Posts
  articles: {
    all: ["articles"] as const,
    lists: () => [...queryKeys.articles.all, "list"] as const,
    list: (filters?: ArticleFilters) =>
      [...queryKeys.articles.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.articles.all, "detail"] as const,
    detail: (slug: string) => [...queryKeys.articles.details(), slug] as const,
  },

  // Events
  events: {
    all: ["events"] as const,
    lists: () => [...queryKeys.events.all, "list"] as const,
    list: (filters?: EventFilters) =>
      [...queryKeys.events.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.events.all, "detail"] as const,
    detail: (slug: string) => [...queryKeys.events.details(), slug] as const,
  },
} as const;
