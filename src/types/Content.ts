export type Locale = "en" | "fi";

export interface SiteContent {
  id: string;
  namespace?: string;
  key?: string;
  value?: string;
  locale?: string;
}
