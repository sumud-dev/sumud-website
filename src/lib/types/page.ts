import { SerializedNodes } from '@craftjs/core';

export type Language = 'en' | 'fi';
export type PageStatus = 'draft' | 'published';

export interface Page {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContent {
  id: string;
  pageId: string;
  language: Language;
  content: SerializedNodes; // Craft.js format
  updatedAt: Date;
}

export interface BlockProps<T = any> {
  children?: React.ReactNode;
  data?: T;
}

// Supported locales
export type PageLocale = 'en' | 'fi';

export const SUPPORTED_LOCALES: PageLocale[] = ['en', 'fi'];

export const DEFAULT_LOCALE: PageLocale = 'en';

// Translation metadata for blocks
export interface BlockTranslationMeta {
  defaultLang: Language;
  autoTranslated?: Language[];
  manuallyReviewed?: Language[];
  lastTranslated?: string | Date;
}
