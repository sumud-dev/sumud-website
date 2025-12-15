"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, CampaignFilters } from "@/src/lib/react-query/query-keys";
import type {
  Campaign,
  CampaignsApiResponse,
  CampaignApiResponse,
  CampaignInsert,
  CampaignUpdate,
} from "@/src/types/campaign.types";

// API fetch functions
async function fetchCampaigns(
  filters?: CampaignFilters
): Promise<CampaignsApiResponse> {
  const params = new URLSearchParams();

  if (filters?.language) params.set("language", filters.language);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.campaignType) params.set("campaignType", filters.campaignType);
  if (filters?.isFeatured !== undefined)
    params.set("isFeatured", String(filters.isFeatured));

  const response = await fetch(`/api/campaigns?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }

  return response.json();
}

async function fetchCampaignBySlug(slug: string): Promise<CampaignApiResponse> {
  const response = await fetch(`/api/campaigns/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch campaign");
  }

  return response.json();
}

async function createCampaign(
  data: CampaignInsert
): Promise<CampaignApiResponse> {
  const response = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create campaign");
  }

  return response.json();
}

async function updateCampaign({
  slug,
  data,
}: {
  slug: string;
  data: CampaignUpdate;
}): Promise<CampaignApiResponse> {
  const response = await fetch(`/api/campaigns/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update campaign");
  }

  return response.json();
}

async function deleteCampaign(slug: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${slug}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete campaign");
  }
}

// Query hooks
export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: queryKeys.campaigns.list(filters),
    queryFn: () => fetchCampaigns(filters),
  });
}

export function useCampaign(slug: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(slug),
    queryFn: () => fetchCampaignBySlug(slug),
    enabled: !!slug,
  });
}

// Mutation hooks
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      // Invalidate all campaign lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: (data, variables) => {
      // Update the specific campaign in cache
      queryClient.setQueryData(
        queryKeys.campaigns.detail(variables.slug),
        data
      );
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      // Invalidate all campaign queries
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

// Re-export types for convenience
export type { Campaign, CampaignsApiResponse, CampaignFilters };
