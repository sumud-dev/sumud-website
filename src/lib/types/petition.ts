// Petition types for the application

export type PetitionStatus = "active" | "urgent" | "closed" | "draft";

export type PetitionCategory = 
  | "human_rights"
  | "justice"
  | "humanitarian"
  | "political"
  | "environmental"
  | "cultural"
  | "economic"
  | "other";

export interface Petition {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  issue_details?: string;
  goal: number;
  target_signatures?: number;
  signatures_count: number;
  signature_count: number;
  status: PetitionStatus;
  category: PetitionCategory;
  featured_image_url: string | null;
  is_featured: boolean;
  deadline?: string;
  end_date?: string;
  target?: string;
  created_at: string;
  updated_at: string;
  language: string;
}

export interface PetitionSignatureFormData {
  supporterName: string;
  supporterEmail: string;
  petitionId: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  country?: string;
  city?: string;
  message?: string;
  subscribe_newsletter?: boolean;
  show_name_publicly?: boolean;
}

export interface PetitionSignature {
  id: string;
  petition_id: string;
  first_name: string;
  last_name: string;
  email: string;
  country?: string;
  city?: string;
  message?: string;
  show_name_publicly: boolean;
  created_at: string;
}

export interface PetitionInsert {
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  goal: number;
  status?: PetitionStatus;
  category: PetitionCategory;
  featured_image_url?: string | null;
  is_featured?: boolean;
  deadline?: string;
  target?: string;
  language?: string;
}

export interface PetitionUpdate {
  title?: string;
  slug?: string;
  description?: string;
  long_description?: string;
  goal?: number;
  signatures_count?: number;
  status?: PetitionStatus;
  category?: PetitionCategory;
  featured_image_url?: string | null;
  is_featured?: boolean;
  deadline?: string;
  target?: string;
  language?: string;
}

// API Response types
export interface PetitionsApiResponse {
  data: Petition[];
  count: number;
}

export interface PetitionApiResponse {
  data: Petition;
}

// Filter types
export interface PetitionFilters {
  status?: PetitionStatus;
  category?: PetitionCategory;
  search?: string;
  language?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}
