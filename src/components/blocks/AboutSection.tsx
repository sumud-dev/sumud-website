'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { ImageUpload } from '@/src/components/ui/image-upload';
import { Separator } from '@/src/components/ui/separator';

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  stats?: Array<{ label: string; value: string }>;
  titleColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

const defaultProps: AboutSectionProps = {
  title: 'About Sumud',
  subtitle: 'Standing Together for Palestine',
  description: 'Sumud - Finnish Palestine Network is dedicated to building solidarity between Finland and Palestine. We work through education, advocacy, and community building to support Palestinian rights and promote justice. Our organization connects people who believe in human rights and dignity for all.\n\nThrough cultural events, educational programs, and advocacy campaigns, we raise awareness about Palestinian history, culture, and the ongoing struggle for freedom and self-determination.',
  imageUrl: '/images/olive-branch.jpg',
  imagePosition: 'right',
  stats: [
    { label: 'Years Active', value: '10+' },
    { label: 'Community Members', value: '500+' },
    { label: 'Events Organized', value: '150+' },
  ],
  titleColor: '#3E442B',
  textColor: '#4B5563',
};

export const AboutSection = (props: AboutSectionProps) => {
  const {
    title,
    subtitle,
    description,
    imageUrl,
    imagePosition,
    stats,
    titleColor,
    textColor,
  } = props;

  const { children } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6 bg-gradient-to-br from-[#F4F3F0] to-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className={imagePosition === 'left' ? 'md:order-2' : ''}>
            {subtitle && (
              <p className="text-[#781D32] font-semibold text-sm uppercase tracking-wide mb-2">
                {subtitle}
              </p>
            )}
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: titleColor }}>
              {title}
            </h2>
            
            <div className="text-lg leading-relaxed space-y-4 mb-8" style={{ color: textColor }}>
              {description?.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#55613C]/20">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-[#781D32] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div className={imagePosition === 'left' ? 'md:order-1' : ''}>
            <div 
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #781D32 0%, #55613C 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E442B]/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

// Settings panel
export const AboutSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    description,
    imageUrl,
    imagePosition,
    stats,
    titleColor,
    textColor,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    description: node.data?.props?.description,
    imageUrl: node.data?.props?.imageUrl,
    imagePosition: node.data?.props?.imagePosition,
    stats: node.data?.props?.stats,
    titleColor: node.data?.props?.titleColor,
    textColor: node.data?.props?.textColor,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setProp((props: AboutSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setProp((props: AboutSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setProp((props: AboutSectionProps) => (props.description = e.target.value))}
          rows={6}
          placeholder="Use double line breaks for paragraphs"
        />
      </div>

      <Separator className="my-4" />

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <ImageUpload
          value={imageUrl}
          onChange={(url) => setProp((props: AboutSectionProps) => (props.imageUrl = url))}
          folder="page-builder/about"
          maxSize={5}
        />
      </div>

      <Separator className="my-4" />

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label>Or Enter Image URL</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setProp((props: AboutSectionProps) => (props.imageUrl = e.target.value))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <Label>Image Position</Label>
        <select
          value={imagePosition}
          onChange={(e) => setProp((props: AboutSectionProps) => (props.imagePosition = e.target.value as 'left' | 'right'))}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <Label>Stats (JSON)</Label>
        <Textarea
          value={JSON.stringify(stats, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setProp((props: AboutSectionProps) => (props.stats = parsed));
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={6}
          placeholder='[{"label": "Years Active", "value": "10+"}]'
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={titleColor}
            onChange={(e) => setProp((props: AboutSectionProps) => (props.titleColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={titleColor}
            onChange={(e) => setProp((props: AboutSectionProps) => (props.titleColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((props: AboutSectionProps) => (props.textColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: AboutSectionProps) => (props.textColor = e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

AboutSection.craft = {
  displayName: 'About Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: AboutSectionSettings,
  },
};
