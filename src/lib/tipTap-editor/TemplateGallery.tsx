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
import { ScrollArea } from "@/src/components/ui/scroll-area";
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
  Grid3x3,
  PanelLeft,
  Zap,
  Target,
  Users,
  TrendingUp,
  Mail,
  Megaphone,
  Clock,
  CheckSquare,
  ListOrdered,
  Star,
  GitCompare,
  Lightbulb,
} from 'lucide-react';
import { TemplateType } from '@/src/lib/types/editor';

interface TemplateGalleryProps {
  isOpen: boolean;
  onSelect: (template: TemplateType) => void;
  onClose: () => void;
}

interface TemplateItem {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'layout' | 'content' | 'callout' | 'list';
  badge?: string;
}

const TEMPLATES: TemplateItem[] = [
  // ==================== LAYOUT TEMPLATES ====================
  {
    id: 'card',
    name: 'Card',
    description: 'Bordered content card with shadow and hover effect',
    icon: Box,
    category: 'layout',
  },
  {
    id: 'twoColumn',
    name: 'Two Columns',
    description: 'Side-by-side layout for comparisons',
    icon: Columns,
    category: 'layout',
  },
  {
    id: 'threeColumn',
    name: 'Three Columns',
    description: 'Three-column grid with numbered sections',
    icon: Layout,
    category: 'layout',
  },
  {
    id: 'gridLayout',
    name: 'Feature Grid',
    description: 'Responsive grid with icon cards',
    icon: Grid3x3,
    category: 'layout',
  },
  {
    id: 'sidebarLayout',
    name: 'Sidebar Layout',
    description: 'Content with sidebar navigation',
    icon: PanelLeft,
    category: 'layout',
  },

  // ==================== CONTENT TEMPLATES ====================
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching header with gradient and CTAs',
    icon: Sparkles,
    category: 'content',
    badge: 'Popular',
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Showcase features with gradient icons',
    icon: Zap,
    category: 'content',
    badge: 'Popular',
  },
  {
    id: 'pricing',
    name: 'Pricing Cards',
    description: 'Three-tier pricing with popular badge',
    icon: CreditCard,
    category: 'content',
    badge: 'Popular',
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer quote with avatar and credentials',
    icon: Quote,
    category: 'content',
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Collapsible questions with clean design',
    icon: ChevronDown,
    category: 'content',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Visual chronological journey',
    icon: Clock,
    category: 'content',
  },
  {
    id: 'stats',
    name: 'Statistics',
    description: 'Key metrics with gradient background',
    icon: TrendingUp,
    category: 'content',
  },
  {
    id: 'team',
    name: 'Team Grid',
    description: 'Team member profiles with gradient avatars',
    icon: Users,
    category: 'content',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email signup with gradient design',
    icon: Mail,
    category: 'content',
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Conversion-focused CTA section',
    icon: Megaphone,
    category: 'content',
  },
  {
    id: 'accordion',
    name: 'Accordion',
    description: 'Collapsible sections for organized content',
    icon: ChevronDown,
    category: 'content',
  },

  // ==================== CALLOUT TEMPLATES ====================
  {
    id: 'callout-info',
    name: 'Info',
    description: 'Informational callout in blue',
    icon: Info,
    category: 'callout',
  },
  {
    id: 'callout-warning',
    name: 'Warning',
    description: 'Important warning in amber',
    icon: AlertTriangle,
    category: 'callout',
  },
  {
    id: 'callout-success',
    name: 'Success',
    description: 'Success message in green',
    icon: CheckCircle,
    category: 'callout',
  },
  {
    id: 'callout-error',
    name: 'Error',
    description: 'Error alert in red',
    icon: XCircle,
    category: 'callout',
  },
  {
    id: 'callout-tip',
    name: 'Pro Tip',
    description: 'Helpful tip in purple',
    icon: Lightbulb,
    category: 'callout',
  },

  // ==================== LIST TEMPLATES ====================
  {
    id: 'checkList',
    name: 'Checklist',
    description: 'Task completion list with checkmarks',
    icon: CheckSquare,
    category: 'list',
  },
  {
    id: 'stepList',
    name: 'Step Guide',
    description: 'Numbered steps with gradient badges',
    icon: ListOrdered,
    category: 'list',
  },
  {
    id: 'iconList',
    name: 'Icon List',
    description: 'Features with colorful icon badges',
    icon: Star,
    category: 'list',
  },
  {
    id: 'comparisonTable',
    name: 'Comparison',
    description: 'Feature comparison table',
    icon: GitCompare,
    category: 'list',
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
  const listTemplates = TEMPLATES.filter(t => t.category === 'list');

  const handleSelect = (template: TemplateType) => {
    onSelect(template);
    onClose();
  };

  const renderTemplateCard = (template: TemplateItem) => {
    const Icon = template.icon;
    return (
      <Button
        key={template.id}
        variant="outline"
        className="h-full min-h-[160px] p-5 flex flex-col items-start gap-3 hover:bg-accent hover:border-primary transition-all group relative"
        onClick={() => handleSelect(template.id)}
      >
        {/* Badge */}
        {template.badge && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold z-10">
            {template.badge}
          </div>
        )}
        
        {/* Icon with gradient background */}
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        <div className="text-left space-y-1.5 w-full flex-1 min-w-0">
          <div className="font-semibold text-base leading-tight line-clamp-1">{template.name}</div>
          <div className="text-sm text-muted-foreground font-normal leading-relaxed line-clamp-3 break-words">
            {template.description}
          </div>
        </div>
      </Button>
    );
  };

  const renderTemplateGrid = (templates: TemplateItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(renderTemplateCard)}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95wh] h-[85vh] flex flex-col p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Content Templates</DialogTitle>
          <DialogDescription className="text-base">
            Choose from our collection of professionally designed templates to enhance your content
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0 mt-4">
          <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
            <TabsTrigger value="all" className="font-medium">All</TabsTrigger>
            <TabsTrigger value="layout" className="font-medium">Layouts</TabsTrigger>
            <TabsTrigger value="content" className="font-medium">Content</TabsTrigger>
            <TabsTrigger value="callout" className="font-medium">Callouts</TabsTrigger>
            <TabsTrigger value="list" className="font-medium">Lists</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4 h-0">
            <TabsContent value="all" className="mt-0 space-y-8 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Layout Templates</h3>
                  <span className="text-sm text-muted-foreground">({layoutTemplates.length})</span>
                </div>
                {renderTemplateGrid(layoutTemplates)}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Content Templates</h3>
                  <span className="text-sm text-muted-foreground">({contentTemplates.length})</span>
                </div>
                {renderTemplateGrid(contentTemplates)}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Callout Templates</h3>
                  <span className="text-sm text-muted-foreground">({calloutTemplates.length})</span>
                </div>
                {renderTemplateGrid(calloutTemplates)}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <List className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">List Templates</h3>
                  <span className="text-sm text-muted-foreground">({listTemplates.length})</span>
                </div>
                {renderTemplateGrid(listTemplates)}
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="mt-0 pb-4">
              {renderTemplateGrid(layoutTemplates)}
            </TabsContent>
            
            <TabsContent value="content" className="mt-0 pb-4">
              {renderTemplateGrid(contentTemplates)}
            </TabsContent>
            
            <TabsContent value="callout" className="mt-0 pb-4">
              {renderTemplateGrid(calloutTemplates)}
            </TabsContent>
            
            <TabsContent value="list" className="mt-0 pb-4">
              {renderTemplateGrid(listTemplates)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};