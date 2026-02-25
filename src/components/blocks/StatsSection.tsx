'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { CompactRichTextEditor } from '@/src/lib/tipTap-editor/CompactRichTextEditor';
import { TrendingUp } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  description?: string;
}

interface StatsSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: Stat[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

const defaultProps: StatsSectionProps = {
  title: 'Making a Difference Together',
  subtitle: 'Our Impact',
  description: 'Through collective action and solidarity, we\'ve built a strong community dedicated to Palestinian rights and justice.',
  stats: [
    {
      value: '10+',
      label: 'Years Active',
      description: 'Building solidarity',
    },
    {
      value: '500+',
      label: 'Community Members',
      description: 'Growing stronger',
    },
    {
      value: '150+',
      label: 'Events Organized',
      description: 'Raising awareness',
    },
    {
      value: '20+',
      label: 'Partner Organizations',
      description: 'Working together',
    },
  ],
  backgroundColor: '#F4F3F0',
  titleColor: '#3E442B',
  textColor: '#4B5563',
};

export const StatsSection = (props: StatsSectionProps) => {
  const { title, subtitle, description, stats, backgroundColor, titleColor, textColor } = props;

  const { children } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          {subtitle && (
            <p className="text-[#781D32] font-semibold text-sm uppercase tracking-wide mb-2">
              {subtitle}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>
            {title}
          </h2>
          {description && (
            <div 
              className="text-lg prose prose-lg" 
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats?.map((stat, index) => (
            <div
              key={index}
              className="relative group flex"
            >
              <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-[#781D32]/20 flex flex-col w-full">
                {/* Decorative icon */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#781D32]/10 to-[#55613C]/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-[#781D32]" />
                </div>

                {/* Value */}
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#781D32] to-[#55613C] mb-2">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold mb-1" style={{ color: titleColor }}>
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm flex-grow" style={{ color: textColor }}>
                  {stat.description || ''}
                </div>
              </div>

              {/* Decorative line */}
              {index < (stats?.length || 0) - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#781D32]/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
};

// Settings panel
export const StatsSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    description,
    stats,
    backgroundColor,
    titleColor,
    textColor,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    description: node.data?.props?.description,
    stats: node.data?.props?.stats,
    backgroundColor: node.data?.props?.backgroundColor,
    titleColor: node.data?.props?.titleColor,
    textColor: node.data?.props?.textColor,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setProp((props: StatsSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setProp((props: StatsSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <CompactRichTextEditor
          value={description || ''}
          onChange={(value) => setProp((props: StatsSectionProps) => (props.description = value))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setProp((props: StatsSectionProps) => (props.backgroundColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setProp((props: StatsSectionProps) => (props.backgroundColor = e.target.value))}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1 text-xs rounded bg-[#F4F3F0] border"
            onClick={() => setProp((props: StatsSectionProps) => (props.backgroundColor = '#F4F3F0'))}
          >
            Cream
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-white border"
            onClick={() => setProp((props: StatsSectionProps) => (props.backgroundColor = '#ffffff'))}
          >
            White
          </button>
        </div>
      </div>

      <div>
        <Label>Stats (JSON)</Label>
        <Textarea
          value={JSON.stringify(stats, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setProp((props: StatsSectionProps) => (props.stats = parsed));
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={10}
          placeholder='[{"value": "10+", "label": "Years", "description": "Building solidarity"}]'
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={titleColor}
            onChange={(e) => setProp((props: StatsSectionProps) => (props.titleColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={titleColor}
            onChange={(e) => setProp((props: StatsSectionProps) => (props.titleColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((props: StatsSectionProps) => (props.textColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: StatsSectionProps) => (props.textColor = e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

StatsSection.craft = {
  displayName: 'Stats Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: StatsSectionSettings,
  },
};
