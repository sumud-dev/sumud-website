/**
 * Page Builder Types
 * 
 * Types for the file-based page builder system.
 * Pages are stored as JSON files in content/pages/ directory.
 */

export const PAGE_BLOCK_TYPES = [
  'hero',
  'stats',
  'campaigns-grid',
  'quote',
  'heading',
  'text',
  'image',
  'carousel',
  'cta',
  'form',
  'video',
  'divider',
  // Section layouts
  'heritage-hero',
  'news-section',
  'events-section',
  'campaigns-section',
  'newsletter-section',
  // Dynamic page sections (uses translation keys)
  'page-hero',
  'mission-section',
  'features-section',
  'values-section',
  'engagement-section',
  'cta-section',
] as const;

export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number];

// Block translation meta - tracks translation status for editable blocks
export interface BlockTranslationMeta {
  defaultLang: 'en' | 'fi' | 'ar';
  autoTranslated?: ('en' | 'fi' | 'ar')[]; // Languages auto-translated (e.g., DeepL)
  manuallyReviewed?: ('en' | 'fi' | 'ar')[]; // Languages reviewed by human
  lastTranslated?: string; // ISO date string
  lastModified?: string; // ISO date string when content was last changed
}

export interface PageBlock {
  id: string;
  type: PageBlockType;
  content: PageBlockContent;
  meta?: BlockTranslationMeta; // Optional translation tracking
}

// Block content types
export interface HeroBlockContent {
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
}

export interface StatsBlockContent {
  items: Array<{ value: string; label: string }>;
}

export interface CampaignsGridBlockContent {
  title: string;
  subtitle: string;
  showCount: number;
}

export interface QuoteBlockContent {
  text: string;
  author: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface HeadingBlockContent {
  text: string;
  level: 'h1' | 'h2' | 'h3';
}

export interface TextBlockContent {
  text: string;
}

export interface ImageBlockContent {
  src: string;
  alt: string;
  caption?: string;
}

export interface CarouselBlockContent {
  slides: Array<{ image: string; caption: string }>;
}

export interface CtaBlockContent {
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
}

export interface FormFieldConfig {
  type: 'text' | 'email' | 'textarea' | 'checkbox' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}

export interface FormBlockContent {
  fields: FormFieldConfig[];
  submitText?: string;
  successMessage?: string;
}

export interface VideoBlockContent {
  url: string;
  autoplay: boolean;
}

export interface DividerBlockContent {
  style: 'line' | 'dashed' | 'space';
}

// Section Layout Block Content
export interface HeritageHeroBlockContent {
  title: string;
  subtitle: string;
  description: string;
  tagline: string;
  joinButtonText: string;
  joinButtonUrl: string;
  learnButtonText: string;
  learnButtonUrl: string;
  image: string;
}

export interface NewsSectionBlockContent {
  title: string;
  showCount: number;
}

export interface EventsSectionBlockContent {
  title: string;
  showCount: number;
}

export interface CampaignsSectionBlockContent {
  title: string;
  subtitle: string;
  showCount: number;
}

export interface NewsletterSectionBlockContent {
  variant: 'default' | 'compact';
}

// ========================================
// Editable Page Section Block Content
// Content is locale-nested for direct editing
// ========================================

// Locale-nested content wrapper
export type LocaleContent<T> = {
  en: T;
  fi?: T;
  ar?: T;
};

// Page Hero Block - editable hero section
export interface PageHeroContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface PageHeroBlockContent {
  icon?: string; // Lucide icon name e.g., "Globe", "Heart"
  image?: string;
  content: LocaleContent<PageHeroContent>;
}

// Mission Section Block - editable mission statement
export interface MissionContent {
  title: string;
  description: string;
}

export interface MissionSectionBlockContent {
  content: LocaleContent<MissionContent>;
}

// Features Section Block - editable features grid
export interface FeatureItemContent {
  title: string;
  description: string;
}

export interface FeatureItem {
  key: string;
  icon: string;
  color: string;
  content: LocaleContent<FeatureItemContent>;
}

export interface FeaturesHeaderContent {
  title: string;
  subtitle: string;
}

export interface FeaturesSectionBlockContent {
  header: LocaleContent<FeaturesHeaderContent>;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}

// Values Section Block - editable values display
export interface ValueItemContent {
  title: string;
  description: string;
}

export interface ValueItem {
  key: string;
  icon: string;
  content: LocaleContent<ValueItemContent>;
}

export interface ValuesHeaderContent {
  title: string;
  subtitle: string;
}

export interface ValuesSectionBlockContent {
  header: LocaleContent<ValuesHeaderContent>;
  items: ValueItem[];
}

// Engagement Section Block - editable engagement cards
export interface EngagementItemContent {
  title: string;
  description: string;
  action: string;
}

export interface EngagementItem {
  key: string;
  icon: string;
  href?: string;
  content: LocaleContent<EngagementItemContent>;
}

export interface EngagementHeaderContent {
  title: string;
  subtitle: string;
}

export interface EngagementSectionBlockContent {
  header: LocaleContent<EngagementHeaderContent>;
  items: EngagementItem[];
}

// CTA Section Block - editable call-to-action
export interface CtaSectionContent {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

export interface CtaSectionBlockContent {
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
  content: LocaleContent<CtaSectionContent>;
}

export type PageBlockContent =
  | HeroBlockContent
  | StatsBlockContent
  | CampaignsGridBlockContent
  | QuoteBlockContent
  | HeadingBlockContent
  | TextBlockContent
  | ImageBlockContent
  | CarouselBlockContent
  | CtaBlockContent
  | FormBlockContent
  | VideoBlockContent
  | DividerBlockContent
  | HeritageHeroBlockContent
  | NewsSectionBlockContent
  | EventsSectionBlockContent
  | CampaignsSectionBlockContent
  | NewsletterSectionBlockContent
  | PageHeroBlockContent
  | MissionSectionBlockContent
  | FeaturesSectionBlockContent
  | ValuesSectionBlockContent
  | EngagementSectionBlockContent
  | CtaSectionBlockContent;

// Default content for each block type
export const DEFAULT_BLOCK_CONTENT: Record<PageBlockType, PageBlockContent> = {
  hero: {
    title: 'Welcome',
    subtitle: 'Your subtitle here',
    image: '',
    buttonText: 'Learn More',
    buttonUrl: '/campaigns',
  } as HeroBlockContent,
  stats: {
    items: [
      { value: '100+', label: 'Campaigns' },
      { value: '50K', label: 'Supporters' },
      { value: '25', label: 'Countries' },
    ],
  } as StatsBlockContent,
  'campaigns-grid': {
    title: 'Our Campaigns',
    subtitle: 'Explore our initiatives',
    showCount: 6,
  } as CampaignsGridBlockContent,
  quote: {
    text: 'Your inspiring quote here',
    author: 'Author Name',
    buttonText: '',
    buttonUrl: '',
  } as QuoteBlockContent,
  heading: {
    text: 'New Heading',
    level: 'h2',
  } as HeadingBlockContent,
  text: {
    text: 'Enter your text content here...',
  } as TextBlockContent,
  image: {
    src: '',
    alt: '',
    caption: '',
  } as ImageBlockContent,
  carousel: {
    slides: [{ image: '', caption: '' }],
  } as CarouselBlockContent,
  cta: {
    text: 'Click Here',
    url: '',
    style: 'primary',
  } as CtaBlockContent,
  form: {
    fields: [{ type: 'text', label: 'Name', placeholder: '', required: true }],
    submitText: 'Submit',
    successMessage: 'Thank you for your submission!',
  } as FormBlockContent,
  video: {
    url: '',
    autoplay: false,
  } as VideoBlockContent,
  divider: {
    style: 'line',
  } as DividerBlockContent,
  'heritage-hero': {
    title: 'Preserving Our Heritage',
    subtitle: 'Building Our Future',
    description: 'Through art, culture, and community',
    tagline: 'Join us in celebrating and preserving Palestinian heritage through meaningful initiatives that connect communities, support artisans, and educate future generations about our rich cultural traditions.',
    joinButtonText: 'Join Our Movement',
    joinButtonUrl: '/join',
    learnButtonText: 'Visit Our Shop',
    learnButtonUrl: 'https://shop.sumud.fi',
    image: '/images/hero-embroidery.jpg',
  } as HeritageHeroBlockContent,
  'news-section': {
    title: 'Latest News & Updates',
    showCount: 4,
  } as NewsSectionBlockContent,
  'events-section': {
    title: 'Upcoming Events',
    showCount: 3,
  } as EventsSectionBlockContent,
  'campaigns-section': {
    title: 'Active Campaigns',
    subtitle: 'Join our movement for change',
    showCount: 6,
  } as CampaignsSectionBlockContent,
  'newsletter-section': {
    variant: 'default',
  } as NewsletterSectionBlockContent,
  // Editable page section defaults
  'page-hero': {
    icon: 'Globe',
    content: {
      en: { title: 'Page Title', subtitle: 'Subtitle', description: 'Description...' },
    },
  } as PageHeroBlockContent,
  'mission-section': {
    content: {
      en: { title: 'Our Mission', description: 'Enter mission description...' },
    },
  } as MissionSectionBlockContent,
  'features-section': {
    header: {
      en: { title: 'What We Do', subtitle: 'Our key activities' },
    },
    items: [
      { 
        key: 'feature-1', 
        icon: 'BookOpen', 
        color: 'bg-[#781D32]',
        content: { en: { title: 'Feature', description: 'Description...' } },
      },
    ],
    columns: 4,
  } as FeaturesSectionBlockContent,
  'values-section': {
    header: {
      en: { title: 'Our Values', subtitle: 'What guides us' },
    },
    items: [
      { 
        key: 'value-1', 
        icon: 'Heart',
        content: { en: { title: 'Value', description: 'Description...' } },
      },
    ],
  } as ValuesSectionBlockContent,
  'engagement-section': {
    header: {
      en: { title: 'Get Involved', subtitle: 'Ways to engage' },
    },
    items: [
      { 
        key: 'engage-1', 
        icon: 'FileText', 
        href: '/campaigns',
        content: { en: { title: 'Action', description: 'Description...', action: 'Learn More' } },
      },
    ],
  } as EngagementSectionBlockContent,
  'cta-section': {
    primaryButtonHref: '/membership',
    secondaryButtonHref: '/about',
    content: {
      en: { 
        title: 'Ready to Join?', 
        description: 'Join our community...',
        primaryButtonText: 'Join Now',
        secondaryButtonText: 'Learn More',
      },
    },
  } as CtaSectionBlockContent,
};

// Page translation for a specific locale
export interface PageTranslation {
  title: string;
  description: string;
  blocks: PageBlock[];
}

// Complete page data structure (stored in JSON file)
export interface PageData {
  slug: string;
  path: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  translations: {
    en?: PageTranslation;
    ar?: PageTranslation;
    fi?: PageTranslation;
  };
}

// Page summary for listings (without full block content)
export interface PageSummary {
  slug: string;
  path: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  title: string; // From default locale
}

// Supported locales
export type PageLocale = 'en' | 'ar' | 'fi';

export const SUPPORTED_LOCALES: PageLocale[] = ['en', 'ar', 'fi'];

export const DEFAULT_LOCALE: PageLocale = 'en';
