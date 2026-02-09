'use client';
import { Editor, Frame } from '@craftjs/core';
import { Button, Text, Section, ImageBlock, Column, Row, InlineGroup, Accordion, Carousel, Table, List, TextArea, Badge, Alert, Separator, CardBlock, Container, CTABlock, HeroSection, AboutSection, ContactSection, FeaturesSection, StatsSection, TestimonialsSection, TeamSection, TimelineSection, PricingSection, GallerySection, FAQSection, NewsletterSection as NewsletterBlock, PartnersSection } from '@/src/components/blocks';
import { HeritageHero, NewsSection, EventsSection, CampaignsSection, NewsletterSection } from '@/src/components/page-builder/sections';
import type { SerializedNodes } from '@craftjs/core';

interface PageRendererProps {
  content: SerializedNodes;
}

export function PageRenderer({ content }: PageRendererProps) {
  // Validate content structure
  if (!content || typeof content !== 'object' || !content.ROOT) {
    console.error('Invalid content structure:', content);
    return null;
  }

  // Define resolver
  const resolver = {
    Button, Text, Section, ImageBlock, Column, Row, InlineGroup,
    Accordion, CardBlock, Table, Carousel, List, TextArea,
    Badge, Alert, Separator, Container,
    CTABlock, HeroSection, AboutSection, ContactSection,
    FeaturesSection, StatsSection, TestimonialsSection, TeamSection,
    TimelineSection, PricingSection, GallerySection, FAQSection,
    NewsletterBlock, PartnersSection,
    HeritageHero,
    NewsSection,
    EventsSection,
    CampaignsSection,
    NewsletterSection,
  };

  // Validate that all components in content exist in resolver
  try {
    Object.values(content).forEach((node: any) => {
      if (node?.type?.resolvedName && !resolver[node.type.resolvedName as keyof typeof resolver]) {
        console.error(`Component "${node.type.resolvedName}" not found in resolver`);
      }
    });
  } catch (error) {
    console.error('Error validating content:', error);
  }

  return (
    <Editor
      resolver={resolver}
      enabled={false}
    >
      <Frame data={JSON.stringify(content)}>
        <div />
      </Frame>
    </Editor>
  );
}