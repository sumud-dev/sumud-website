// Editor Types
export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface ToolbarGroup {
  id: string;
  actions: ToolbarAction[];
}

export interface DialogState {
  link: {
    isOpen: boolean;
    text: string;
    url: string;
  };
  image: {
    isOpen: boolean;
    url: string;
    alt: string;
  };
  table: {
    isOpen: boolean;
    rows: number;
    cols: number;
  };
  video: {
    isOpen: boolean;
    url: string;
  };
  template: {
    isOpen: boolean;
  };
  templateEditor: {
    isOpen: boolean;
    templateType: TemplateType | null;
  };
}

export type TemplateType = 
  | 'card'
  | 'twoColumn'
  | 'threeColumn'
  | 'gridLayout'
  | 'sidebarLayout'
  | 'hero'
  | 'features'
  | 'pricing'
  | 'testimonial'
  | 'faq'
  | 'timeline'
  | 'stats'
  | 'team'
  | 'newsletter'
  | 'cta'
  | 'accordion'
  | 'callout-info'
  | 'callout-warning'
  | 'callout-success'
  | 'callout-error'
  | 'callout-tip'
  | 'checkList'
  | 'stepList'
  | 'iconList'
  | 'comparisonTable';

export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'layout' | 'content' | 'callout' | 'list';
}

export interface ColorOption {
  name: string;
  value: string;
  category: 'text' | 'background' | 'highlight';
}
