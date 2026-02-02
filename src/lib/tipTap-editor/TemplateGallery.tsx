"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Box,
  Columns,
  Layout,
  Sparkles,
  Quote,
  ChevronDown,
  List,
  CreditCard,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { TemplateType, Template } from '../types/editor';

interface TemplateGalleryProps {
  isOpen: boolean;
  onSelect: (template: TemplateType) => void;
  onClose: () => void;
}

const TEMPLATES: Template[] = [
  // Layout Templates
  {
    id: 'card',
    name: 'Card',
    description: 'Bordered content card with shadow',
    icon: Box,
    category: 'layout',
  },
  {
    id: 'twoColumn',
    name: 'Two Columns',
    description: 'Side-by-side layout',
    icon: Columns,
    category: 'layout',
  },
  {
    id: 'threeColumn',
    name: 'Three Columns',
    description: 'Three-column grid layout',
    icon: Layout,
    category: 'layout',
  },
  
  // Content Templates
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching header with gradient',
    icon: Sparkles,
    category: 'content',
  },
  {
    id: 'features',
    name: 'Feature Grid',
    description: 'Showcase features with icons',
    icon: Layout,
    category: 'content',
  },
  {
    id: 'pricing',
    name: 'Pricing Cards',
    description: 'Three-tier pricing table',
    icon: CreditCard,
    category: 'content',
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer quote with profile',
    icon: Quote,
    category: 'content',
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Collapsible questions and answers',
    icon: ChevronDown,
    category: 'content',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological events with visual flow',
    icon: List,
    category: 'content',
  },
  
  // Callout Templates
  {
    id: 'callout-info',
    name: 'Info Callout',
    description: 'Highlight helpful information',
    icon: Info,
    category: 'callout',
  },
  {
    id: 'callout-warning',
    name: 'Warning Callout',
    description: 'Emphasize important considerations',
    icon: AlertTriangle,
    category: 'callout',
  },
  {
    id: 'callout-success',
    name: 'Success Callout',
    description: 'Confirm positive outcomes',
    icon: CheckCircle,
    category: 'callout',
  },
  {
    id: 'callout-error',
    name: 'Error Callout',
    description: 'Alert to critical issues',
    icon: XCircle,
    category: 'callout',
  },
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onSelect,
  onClose,
}) => {
  const layoutTemplates = TEMPLATES.filter(t => t.category === 'layout');
  const contentTemplates = TEMPLATES.filter(t => t.category === 'content');
  const calloutTemplates = TEMPLATES.filter(t => t.category === 'callout');

  const handleSelect = (template: TemplateType) => {
    onSelect(template);
    onClose();
  };

  const renderTemplateCard = (template: Template) => {
    const Icon = template.icon;
    return (
      <Button
        key={template.id}
        variant="outline"
        className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent hover:border-primary transition-all"
        onClick={() => handleSelect(template.id)}
      >
        <Icon className="h-6 w-6 text-primary" />
        <div className="text-left space-y-1">
          <div className="font-semibold text-base">{template.name}</div>
          <div className="text-sm text-muted-foreground font-normal">
            {template.description}
          </div>
        </div>
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Content Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-built template to quickly add professional content to your document
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="layout">Layouts</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="callout">Callouts</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="all" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Layout Templates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {layoutTemplates.map(renderTemplateCard)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Content Templates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {contentTemplates.map(renderTemplateCard)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Callout Templates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {calloutTemplates.map(renderTemplateCard)}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {layoutTemplates.map(renderTemplateCard)}
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {contentTemplates.map(renderTemplateCard)}
              </div>
            </TabsContent>
            
            <TabsContent value="callout" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {calloutTemplates.map(renderTemplateCard)}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
