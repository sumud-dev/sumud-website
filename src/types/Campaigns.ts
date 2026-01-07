/**
 * Campaign Types Definition
 *
 * Shared type definitions for campaigns across the application
 */

export type CampaignType =
  | 'awareness'
  | 'advocacy'
  | 'fundraising'
  | 'community_building'
  | 'education'
  | 'solidarity'
  | 'humanitarian'
  | 'political'
  | 'cultural'
  | 'environmental';

export const CAMPAIGN_TYPES: CampaignType[] = [
  'awareness',
  'advocacy',
  'fundraising',
  'community_building',
  'education',
  'solidarity',
  'humanitarian',
  'political',
  'cultural',
  'environmental',
];

export type CampaignDescription = string | { type: 'blocks' | 'markdown' | 'html'; data: unknown } | null;

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: CampaignDescription;
  content?: string;
  category?: string;
  campaignType: CampaignType | null;
  status?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  iconName?: string;
  image?: string;
  featuredImage?: string;
  language?: string;
  featured?: boolean;
  demands?: unknown;
  callToAction?: unknown;
  howToParticipate?: CampaignParticipationStep[] | string[];
  resources?: CampaignResource[];
  successStories?: CampaignSuccessStory[] | string[];
  targets?: unknown;
  stats?: unknown;
  endDate?: string | Date;
  startDate?: string | Date;
  createdAt?: string | Date;
}

export interface CampaignParticipationStep {
  title?: string;
  description?: string;
}

export interface CampaignResource {
  type: 'guide' | 'toolkit' | 'article' | 'video' | 'petition';
  title: string;
  url: string;
}

export interface CampaignSuccessStory {
  title?: string;
  content?: string;
}
