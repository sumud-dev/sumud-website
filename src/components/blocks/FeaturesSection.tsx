'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Heart, Users, BookOpen, Megaphone } from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  titleColor?: string;
  textColor?: string;
}

const defaultProps: FeaturesSectionProps = {
  title: 'What We Do',
  subtitle: 'Our Mission',
  features: [
    {
      icon: 'Heart',
      title: 'Solidarity Actions',
      description: 'Building bridges between communities through solidarity events and cultural exchanges.',
    },
    {
      icon: 'Users',
      title: 'Community Building',
      description: 'Creating spaces for Palestinians and supporters to connect, share, and grow together.',
    },
    {
      icon: 'BookOpen',
      title: 'Education',
      description: 'Raising awareness about Palestinian history, culture, and current realities through workshops and events.',
    },
    {
      icon: 'Megaphone',
      title: 'Advocacy',
      description: 'Amplifying Palestinian voices and advocating for justice, rights, and self-determination.',
    },
  ],
  titleColor: '#3E442B',
  textColor: '#6B7280',
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Users,
  BookOpen,
  Megaphone,
};

export const FeaturesSection = (props: FeaturesSectionProps) => {
  const { title, subtitle, features, titleColor, textColor } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {subtitle && (
            <p className="text-[#781D32] font-semibold text-sm uppercase tracking-wide mb-2">
              {subtitle}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: titleColor }}>
            {title}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features?.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Heart;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-gradient-to-br from-[#F4F3F0] to-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#781D32]/20"
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#781D32] to-[#55613C] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: titleColor }}>
                  {feature.title}
                </h3>
                <p className="leading-relaxed" style={{ color: textColor }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Settings panel
export const FeaturesSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    features,
    titleColor,
    textColor,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    features: node.data?.props?.features,
    titleColor: node.data?.props?.titleColor,
    textColor: node.data?.props?.textColor,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setProp((props: FeaturesSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setProp((props: FeaturesSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Features (JSON)</Label>
        <Textarea
          value={JSON.stringify(features, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setProp((props: FeaturesSectionProps) => (props.features = parsed));
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={12}
          placeholder='[{"icon": "Heart", "title": "Feature", "description": "Description"}]'
        />
        <p className="text-xs text-gray-500 mt-1">
          Available icons: Heart, Users, BookOpen, Megaphone
        </p>
      </div>

      <div>
        <Label>Title Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={titleColor}
            onChange={(e) => setProp((props: FeaturesSectionProps) => (props.titleColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={titleColor}
            onChange={(e) => setProp((props: FeaturesSectionProps) => (props.titleColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((props: FeaturesSectionProps) => (props.textColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: FeaturesSectionProps) => (props.textColor = e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

FeaturesSection.craft = {
  displayName: 'Features Section',
  props: defaultProps,
  related: {
    settings: FeaturesSectionSettings,
  },
};
