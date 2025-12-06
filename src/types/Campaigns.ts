export type Campaign = {
  id: string;
  title: string;
  description: string;
  goal: number;
  currentAmount: number;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CampaignFormData = {
  title: string;
  description: string;
  goal: number;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  imageUrl?: string;
};
