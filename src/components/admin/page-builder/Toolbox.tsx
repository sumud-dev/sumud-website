'use client';

import { Element, useEditor } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { 
  Button, Text, Section, ImageBlock, Column, Row, InlineGroup, Accordion, 
  Carousel, Table, List, TextArea, Badge, Alert, Separator, CardBlock,
  CTABlock, HeroSection, AboutSection, ContactSection, FeaturesSection, StatsSection,
  TestimonialsSection, TeamSection, TimelineSection, PricingSection, GallerySection,
  FAQSection, NewsletterSection, PartnersSection
} from '@/src/components/blocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Button as UIButton } from '@/src/components/ui/button';
import { Separator as UISeparator } from '@/src/components/ui/separator';
import { 
  Type, RectangleHorizontal, LayoutGrid, Columns, Rows3, AlignHorizontalJustifyStart, 
  ImageIcon, ChevronDown, Images, TableIcon, ListIcon, FileText, Tag, AlertCircle, 
  Minus, CreditCard, Megaphone, Sparkles, Users, Mail, Grid3x3, BarChart3, MessageSquareQuote,
  UsersRound, Clock, DollarSign, ImagePlus, HelpCircle, Send, Handshake
} from 'lucide-react';

export function Toolbox() {
  const { connectors } = useEditor();
  const t = useTranslations('adminSettings.pageBuilder');

  const basicBlocks = [
    { name: t('blockNames.text'), component: Text, icon: Type, key: 'text', description: t('blockDescriptions.text') },
    { name: t('blockNames.button'), component: Button, icon: RectangleHorizontal, key: 'button', description: t('blockDescriptions.button') },
    { name: t('blockNames.section'), component: Section, isCanvas: true, icon: LayoutGrid, key: 'section', description: t('blockDescriptions.section') },
    { name: t('blockNames.row'), component: Row, isCanvas: true, icon: Rows3, key: 'row', description: t('blockDescriptions.row') },
    { name: t('blockNames.column'), component: Column, isCanvas: true, icon: Columns, key: 'column', description: t('blockDescriptions.column') },
    { name: t('blockNames.inlineGroup'), component: InlineGroup, isCanvas: true, icon: AlignHorizontalJustifyStart, key: 'inlineGroup', description: t('blockDescriptions.inlineGroup') },
    { name: t('blockNames.image'), component: ImageBlock, icon: ImageIcon, key: 'image', description: t('blockDescriptions.image') },
    { name: t('blockNames.accordion'), component: Accordion, icon: ChevronDown, key: 'accordion', description: t('blockDescriptions.accordion') },
    { name: t('blockNames.carousel'), component: Carousel, icon: Images, key: 'carousel', description: t('blockDescriptions.carousel') },
    { name: t('blockNames.table'), component: Table, icon: TableIcon, key: 'table', description: t('blockDescriptions.table') },
    { name: t('blockNames.list'), component: List, icon: ListIcon, key: 'list', description: t('blockDescriptions.list') },
    { name: t('blockNames.textArea'), component: TextArea, icon: FileText, key: 'textArea', description: t('blockDescriptions.textArea') },
    { name: t('blockNames.badge'), component: Badge, icon: Tag, key: 'badge', description: t('blockDescriptions.badge') },
    { name: t('blockNames.alert'), component: Alert, icon: AlertCircle, key: 'alert', description: t('blockDescriptions.alert') },
    { name: t('blockNames.separator'), component: Separator, icon: Minus, key: 'separator', description: t('blockDescriptions.separator') },
    { name: t('blockNames.card'), component: CardBlock, icon: CreditCard, key: 'card', description: t('blockDescriptions.card') },
  ];

  const pageTemplates = [
    { name: 'CTA Block', component: CTABlock, icon: Megaphone, key: 'ctaBlock', description: 'Call-to-action section with buttons' },
    { name: 'Hero Section', component: HeroSection, icon: Sparkles, key: 'heroSection', description: 'Full-width hero banner with background' },
    { name: 'About Section', component: AboutSection, icon: Users, key: 'aboutSection', description: 'About section with image and stats' },
    { name: 'Contact Section', component: ContactSection, icon: Mail, key: 'contactSection', description: 'Contact form with info cards' },
    { name: 'Features Section', component: FeaturesSection, icon: Grid3x3, key: 'featuresSection', description: 'Grid of feature cards' },
    { name: 'Stats Section', component: StatsSection, icon: BarChart3, key: 'statsSection', description: 'Statistics display section' },
    { name: 'Testimonials Section', component: TestimonialsSection, icon: MessageSquareQuote, key: 'testimonialsSection', description: 'Customer testimonials and reviews' },
    { name: 'Team Section', component: TeamSection, icon: UsersRound, key: 'teamSection', description: 'Team members with photos and bios' },
    { name: 'Timeline Section', component: TimelineSection, icon: Clock, key: 'timelineSection', description: 'Chronological timeline of events' },
    { name: 'Pricing Section', component: PricingSection, icon: DollarSign, key: 'pricingSection', description: 'Pricing tiers and packages' },
    { name: 'Gallery Section', component: GallerySection, icon: ImagePlus, key: 'gallerySection', description: 'Image gallery with lightbox' },
    { name: 'FAQ Section', component: FAQSection, icon: HelpCircle, key: 'faqSection', description: 'Frequently asked questions accordion' },
    { name: 'Newsletter Section', component: NewsletterSection, icon: Send, key: 'newsletterSection', description: 'Email newsletter signup form' },
    { name: 'Partners Section', component: PartnersSection, icon: Handshake, key: 'partnersSection', description: 'Partner and sponsor logos' },
  ];

  const renderBlockButton = (block: { name: string; component: any; icon: any; key: string; description: string; isCanvas?: boolean }) => {
    const Icon = block.icon;
    return (
      <UIButton
        key={block.name}
        ref={(ref) => {
          if (ref) {
            connectors.create(ref, block.isCanvas 
              ? <Element is={block.component} canvas /> 
              : <block.component />
            );
          }
        }}
        variant="outline"
        className="w-full justify-start h-auto py-3 cursor-move hover:bg-accent"
      >
        <div className="flex items-start gap-3 w-full">
          <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-left flex-1">
            <div className="font-medium text-sm">{block.name}</div>
            <div className="text-xs text-muted-foreground font-normal">
              {block.description}
            </div>
          </div>
        </div>
      </UIButton>
    );
  };

  return (
    <div className="w-72 bg-background border-r">
      <ScrollArea className="h-full">
        <Card className="border-0 rounded-none">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">{t('toolbox.title')}</CardTitle>
            <CardDescription>{t('toolbox.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Page Templates Section */}
            <div>
              <h3 className="text-sm font-semibold text-[#781D32] mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Page Templates
              </h3>
              <div className="space-y-2">
                {pageTemplates.map(renderBlockButton)}
              </div>
            </div>

            <UISeparator />

            {/* Basic Blocks Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Basic Blocks
              </h3>
              <div className="space-y-2">
                {basicBlocks.map(renderBlockButton)}
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}