export type Locale = "en" | "ar" | "fi";

export interface SiteContent {
  id: string;
  namespace?: string;
  key?: string;
  value?: string;
  locale?: string;
}
