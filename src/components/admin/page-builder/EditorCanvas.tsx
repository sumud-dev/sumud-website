'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Editor, Frame, Element } from '@craftjs/core';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { TopBar } from './TopBar';
import { 
  Button, Text, Section, ImageBlock, Column, Row, InlineGroup,
  Accordion, CardBlock, Table, Carousel, List, TextArea,
  Badge, Alert, Separator, Container,
  CTABlock, HeroSection, AboutSection, ContactSection, 
  FeaturesSection, StatsSection, TestimonialsSection, TeamSection,
  TimelineSection, PricingSection, GallerySection, FAQSection,
  NewsletterSection as NewsletterBlock, PartnersSection, DonationSection, InfoListCard
} from '@/src/components/blocks';
import { 
  HeritageHero, NewsSection, EventsSection, 
  CampaignsSection, NewsletterSection 
} from '@/src/components/page-builder/sections';
import type { Language } from '@/src/lib/types/page';

interface EditorCanvasProps {
  pageId: string;
  language: Language;
  initialContent?: string;
}

/**
 * EditorCanvas Component
 * Main editor interface using Craft.js
 * Delegates state management and operations to TopBar via Editor context
 */
export function EditorCanvas({ pageId, language, initialContent }: EditorCanvasProps) {
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>('');

  // Fetch page data to get initial status
  const { data: page } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const result = await response.json();
      return result.data;
    },
  });

  // Update status when page data loads
  useEffect(() => {
    if (page?.status) {
      setStatus(page.status);
    }
  }, [page?.status]);

  return (
    <div className="h-screen flex flex-col">
      <Editor
        enabled={true}
        resolver={{ 
          // Basic Blocks
          Button, 
          Text, 
          Section, 
          ImageBlock, 
          Column, 
          Row, 
          InlineGroup,
          Accordion, 
          Table, 
          CardBlock, 
          Carousel, 
          List, 
          TextArea,
          Badge, 
          Alert, 
          Separator, 
          Container,
          
          // Page Templates
          CTABlock,
          HeroSection,
          AboutSection,
          ContactSection,
          FeaturesSection,
          StatsSection,
          TestimonialsSection,
          TeamSection,
          TimelineSection,
          PricingSection,
          GallerySection,
          FAQSection,
          NewsletterBlock,
          PartnersSection,
          DonationSection,
          InfoListCard,
          
          // Page Builder Sections
          HeritageHero,
          NewsSection,
          EventsSection,
          CampaignsSection,
          NewsletterSection,
        }}
        onRender={({ render }) => (
          <div className="craft-renderer">
            {render}
          </div>
        )}
      >
        {/* TopBar handles all editor operations */}
        <TopBar
          pageId={pageId}
          language={language}
          status={status}
          pageTitle={pageTitle}
          pageSlug={pageSlug}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Component Toolbox */}
          <Toolbox />
          
          {/* Main Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <Frame data={initialContent}>
              <Element
                is={Container}
                canvas
                background="#ffffff"
                width="100%"
                height="auto"
                maxWidth="none"
                paddingTop={40}
                paddingBottom={40}
                paddingLeft={40}
                paddingRight={40}
                marginTop={0}
                marginBottom={0}
                marginLeft={0}
                marginRight={0}
              />
            </Frame>
          </div>
          
          {/* Settings Panel */}
          <SettingsPanel 
            pageId={pageId} 
            status={status} 
            onStatusChange={setStatus}
            onTitleChange={setPageTitle}
            onSlugChange={setPageSlug}
          />
        </div>
      </Editor>
    </div>
  );
}