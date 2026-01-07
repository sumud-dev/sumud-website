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
