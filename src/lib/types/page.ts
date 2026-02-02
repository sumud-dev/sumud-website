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
  'contact-info',
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
  // WordPress/Elementor-style blocks
  'accordion',
  'testimonials',
  'tabs',
  'team-members',
  'icon-box',
  'pricing-table',
  'spacer',
  'alert',
  'button-group',
  'social-icons',
] as const;

export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number];

// Block translation meta - tracks translation status for editable blocks
export interface BlockTranslationMeta {
  defaultLang: 'en' | 'fi';
  autoTranslated?: ('en' | 'fi')[]; // Languages auto-translated (e.g., DeepL)
  manuallyReviewed?: ('en' | 'fi')[]; // Languages reviewed by human
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

export interface ContactInfoBlockContent {
  items: Array<{
    icon: string;
    label: string;
    value: string;
    href?: string;
  }>;
}

// WordPress/Elementor-style Block Content
export interface AccordionBlockContent {
  items: Array<{
    title: string;
    content: string;
    isOpen?: boolean;
  }>;
  allowMultiple?: boolean;
}

export interface TestimonialBlockContent {
  items: Array<{
    name: string;
    role: string;
    company?: string;
    image?: string;
    quote: string;
    rating?: number;
  }>;
  layout?: 'grid' | 'slider' | 'single';
  columns?: 2 | 3;
}

export interface TabBlockContent {
  tabs: Array<{
    title: string;
    content: string;
    icon?: string;
  }>;
  defaultTab?: number;
}

export interface TeamMemberBlockContent {
  members: Array<{
    name: string;
    role: string;
    bio?: string;
    image?: string;
    email?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  }>;
  columns?: 2 | 3 | 4;
}

export interface IconBoxBlockContent {
  icon: string;
  title: string;
  description: string;
  linkText?: string;
  linkUrl?: string;
  style?: 'default' | 'bordered' | 'filled';
  iconPosition?: 'top' | 'left';
}

export interface PricingTableBlockContent {
  plans: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    buttonText: string;
    buttonUrl: string;
    highlighted?: boolean;
    badge?: string;
  }>;
  columns?: 2 | 3 | 4;
}

export interface SpacerBlockContent {
  height: number; // in pixels
}

export interface AlertBlockContent {
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  icon?: string;
}

export interface ButtonGroupBlockContent {
  buttons: Array<{
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
    icon?: string;
  }>;
  alignment?: 'left' | 'center' | 'right';
  stack?: boolean;
}

export interface SocialIconsBlockContent {
  platforms: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  style?: 'default' | 'rounded' | 'square';
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
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
  | ContactInfoBlockContent
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
  | CtaSectionBlockContent
  | AccordionBlockContent
  | TestimonialBlockContent
  | TabBlockContent
  | TeamMemberBlockContent
  | IconBoxBlockContent
  | PricingTableBlockContent
  | SpacerBlockContent
  | AlertBlockContent
  | ButtonGroupBlockContent
  | SocialIconsBlockContent;

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
  'contact-info': {
    items: [
      { icon: 'mail', label: 'Email', value: 'info@example.com', href: 'mailto:info@example.com' },
      { icon: 'phone', label: 'Phone', value: '+358 123 456 789', href: 'tel:+358123456789' },
      { icon: 'message', label: 'Message', value: 'Send us a message' },
    ],
  } as ContactInfoBlockContent,
  'heritage-hero': {
    title: '',
    subtitle: '',
    description: '',
    tagline: '',
    joinButtonText: '',
    joinButtonUrl: '/join',
    learnButtonText: '',
    learnButtonUrl: '',
    image: '',
  } as HeritageHeroBlockContent,
  'news-section': {
    title: '',
    showCount: 4,
  } as NewsSectionBlockContent,
  'events-section': {
    title: '',
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
      fi: { title: 'Sivun otsikko', subtitle: 'Alaotsikko', description: 'Kuvaus...' },
    },
  } as PageHeroBlockContent,
  'mission-section': {
    content: {
      en: { title: 'Our Mission', description: 'Enter mission description...' },
      fi: { title: 'Tehtävämme', description: 'Syötä tehtävän kuvaus...' },
    },
  } as MissionSectionBlockContent,
  'features-section': {
    header: {
      en: { title: 'What We Do', subtitle: 'Our key activities' },
      fi: { title: 'Mitä me teemme', subtitle: 'Keskeiset toimintamme' },
    },
    items: [
      { 
        key: 'feature-1', 
        icon: 'BookOpen', 
        color: 'bg-[#781D32]',
        content: { 
          en: { title: 'Feature', description: 'Description...' },
          fi: { title: 'Ominaisuus', description: 'Kuvaus...' },
        },
      },
    ],
    columns: 4,
  } as FeaturesSectionBlockContent,
  'values-section': {
    header: {
      en: { title: 'Our Values', subtitle: 'What guides us' },
      fi: { title: 'Arvomme', subtitle: 'Mikä ohjaa meitä' },
    },
    items: [
      { 
        key: 'value-1', 
        icon: 'Heart',
        content: { 
          en: { title: 'Value', description: 'Description...' },
          fi: { title: 'Arvo', description: 'Kuvaus...' },
        },
      },
    ],
  } as ValuesSectionBlockContent,
  'engagement-section': {
    header: {
      en: { title: 'Get Involved', subtitle: 'Ways to engage' },
      fi: { title: 'Osallistu', subtitle: 'Tapoja osallistua' },
    },
    items: [
      { 
        key: 'engage-1', 
        icon: 'FileText', 
        href: '/campaigns',
        content: { 
          en: { title: 'Action', description: 'Description...', action: 'Learn More' },
          fi: { title: 'Toiminta', description: 'Kuvaus...', action: 'Lue lisää' },
        },
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
      fi: { 
        title: 'Valmis liittymään?', 
        description: 'Liity yhteisöömme...',
        primaryButtonText: 'Liity nyt',
        secondaryButtonText: 'Lue lisää',
      },
    },
  } as CtaSectionBlockContent,
  // WordPress/Elementor-style blocks
  accordion: {
    items: [
      { title: 'Question 1', content: 'Answer to question 1...', isOpen: true },
      { title: 'Question 2', content: 'Answer to question 2...', isOpen: false },
    ],
    allowMultiple: false,
  } as AccordionBlockContent,
  testimonials: {
    items: [
      {
        name: 'John Doe',
        role: 'CEO',
        company: 'Company Inc',
        image: '',
        quote: 'This organization made a real difference...',
        rating: 5,
      },
    ],
    layout: 'grid',
    columns: 3,
  } as TestimonialBlockContent,
  tabs: {
    tabs: [
      { title: 'Tab 1', content: 'Content for tab 1...', icon: 'FileText' },
      { title: 'Tab 2', content: 'Content for tab 2...', icon: 'Image' },
    ],
    defaultTab: 0,
  } as TabBlockContent,
  'team-members': {
    members: [
      {
        name: 'Jane Smith',
        role: 'Director',
        bio: 'Brief bio...',
        image: '',
        email: 'jane@example.com',
        social: {
          linkedin: '',
          twitter: '',
        },
      },
    ],
    columns: 3,
  } as TeamMemberBlockContent,
  'icon-box': {
    icon: 'Heart',
    title: 'Our Service',
    description: 'Description of the service or feature...',
    linkText: 'Learn More',
    linkUrl: '',
    style: 'default',
    iconPosition: 'top',
  } as IconBoxBlockContent,
  'pricing-table': {
    plans: [
      {
        name: 'Basic',
        price: '$10',
        period: 'month',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        buttonText: 'Choose Plan',
        buttonUrl: '/join',
        highlighted: false,
      },
      {
        name: 'Premium',
        price: '$25',
        period: 'month',
        features: ['All Basic features', 'Feature 4', 'Feature 5', 'Priority support'],
        buttonText: 'Choose Plan',
        buttonUrl: '/join',
        highlighted: true,
        badge: 'Popular',
      },
    ],
    columns: 3,
  } as PricingTableBlockContent,
  spacer: {
    height: 50,
  } as SpacerBlockContent,
  alert: {
    title: 'Important Notice',
    message: 'Your alert message here...',
    type: 'info',
    dismissible: true,
    icon: 'Info',
  } as AlertBlockContent,
  'button-group': {
    buttons: [
      { text: 'Primary Action', url: '/action', style: 'primary', icon: 'ArrowRight' },
      { text: 'Secondary Action', url: '/more', style: 'secondary' },
    ],
    alignment: 'center',
    stack: false,
  } as ButtonGroupBlockContent,
  'social-icons': {
    platforms: [
      { name: 'Facebook', url: 'https://facebook.com', icon: 'Facebook' },
      { name: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
      { name: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' },
    ],
    style: 'rounded',
    size: 'md',
    alignment: 'center',
  } as SocialIconsBlockContent,
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
    fi?: PageTranslation;
  };
  metadata?: {
    en?: {
      uiTranslations?: boolean;
      uiTranslationsNamespace?: string;
      [key: string]: any;
    };
    fi?: {
      uiTranslations?: boolean;
      uiTranslationsNamespace?: string;
      [key: string]: any;
    };
  };
}

// Page summary for listings (without full block content)
export interface PageSummary {
  slug: string;
  path: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  title: string; // From default locale
}

// Supported locales
export type PageLocale = 'en' | 'fi';

export const SUPPORTED_LOCALES: PageLocale[] = ['en', 'fi'];

export const DEFAULT_LOCALE: PageLocale = 'en';
