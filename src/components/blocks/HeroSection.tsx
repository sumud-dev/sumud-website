'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { ImageUpload } from '@/src/components/ui/image-upload';
import { Separator } from '@/src/components/ui/separator';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
  overlay?: boolean;
  textAlign?: 'left' | 'center';
  textColor?: string;
  primaryButtonColor?: string;
  primaryButtonHoverColor?: string;
  buttonTextColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonHoverColor?: string;
  secondaryButtonTextColor?: string;
}

const defaultProps: HeroSectionProps = {
  title: 'Building Bridges of Solidarity',
  subtitle: 'Sumud - Finnish Palestine Network',
  description: 'Join our movement supporting Palestinian rights through education, advocacy, and community building.',
  primaryButtonText: 'Join Us',
  primaryButtonUrl: '/join',
  secondaryButtonText: 'Learn More',
  secondaryButtonUrl: '/about',
  backgroundImage: '/images/olive-branch.jpg',
  overlay: true,
  textAlign: 'center',
  textColor: '#ffffff',
  primaryButtonColor: '#ffffff',
  primaryButtonHoverColor: '#f5f5f5',
  buttonTextColor: '#781D32',
  secondaryButtonColor: '#55613C',
  secondaryButtonHoverColor: '#3E442B',
  secondaryButtonTextColor: '#ffffff',
};

export const HeroSection = (props: HeroSectionProps) => {
  const {
    title,
    subtitle,
    description,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    backgroundImage,
    overlay,
    textAlign,
    textColor,
    primaryButtonColor,
    primaryButtonHoverColor,
    buttonTextColor,
    secondaryButtonColor,
    secondaryButtonHoverColor,
    secondaryButtonTextColor,
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="relative min-h-[600px] flex items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #781D32 0%, #55613C 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#781D32]/90 to-[#55613C]/80" />
      )}
      
      <div className={`relative z-10 max-w-7xl mx-auto px-6 py-20 ${textAlign === 'center' ? 'text-center' : 'text-left'}`}>
        {subtitle && (
          <p className="text-lg mb-4 font-medium" style={{ color: textColor, opacity: 0.9 }}>{subtitle}</p>
        )}
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: textColor }}>
          {title}
        </h1>
        
        {description && (
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: textColor, opacity: 0.9 }}>
            {description}
          </p>
        )}
        
        <div className={`flex flex-wrap gap-4 ${textAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
          {primaryButtonText && (
            <Button 
              asChild
              size="lg"
              className="text-lg px-8 transition-colors"
              style={{ 
                backgroundColor: primaryButtonColor,
                color: buttonTextColor,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryButtonHoverColor || ''}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryButtonColor || ''}
            >
              <a href={primaryButtonUrl || '#'}>{primaryButtonText}</a>
            </Button>
          )}
          {secondaryButtonText && (
            <Button 
              asChild
              size="lg"
              className="text-lg px-8 transition-colors"
              style={{ 
                backgroundColor: secondaryButtonColor,
                color: secondaryButtonTextColor,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = secondaryButtonHoverColor || ''}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = secondaryButtonColor || ''}
            >
              <a href={secondaryButtonUrl || '#'}>{secondaryButtonText}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings panel
export const HeroSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    description,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    backgroundImage,
    overlay,
    textAlign,
    textColor,
    primaryButtonColor,
    primaryButtonHoverColor,
    buttonTextColor,
    secondaryButtonColor,
    secondaryButtonHoverColor,
    secondaryButtonTextColor,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    description: node.data?.props?.description,
    primaryButtonText: node.data?.props?.primaryButtonText,
    primaryButtonUrl: node.data?.props?.primaryButtonUrl,
    secondaryButtonText: node.data?.props?.secondaryButtonText,
    secondaryButtonUrl: node.data?.props?.secondaryButtonUrl,
    backgroundImage: node.data?.props?.backgroundImage,
    overlay: node.data?.props?.overlay,
    textAlign: node.data?.props?.textAlign,
    textColor: node.data?.props?.textColor,
    primaryButtonColor: node.data?.props?.primaryButtonColor,
    primaryButtonHoverColor: node.data?.props?.primaryButtonHoverColor,
    buttonTextColor: node.data?.props?.buttonTextColor,
    secondaryButtonColor: node.data?.props?.secondaryButtonColor,
    secondaryButtonHoverColor: node.data?.props?.secondaryButtonHoverColor,
    secondaryButtonTextColor: node.data?.props?.secondaryButtonTextColor,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Text Alignment</Label>
        <Select
          value={textAlign}
          onValueChange={(value) => setProp((props: HeroSectionProps) => (props.textAlign = value as any))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.description = e.target.value))}
          rows={3}
        />
      </div>

      <div>
        <Label>Primary Button Text</Label>
        <Input
          value={primaryButtonText}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.primaryButtonText = e.target.value))}
        />
      </div>

      <div>
        <Label>Primary Button URL</Label>
        <Input
          value={primaryButtonUrl}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.primaryButtonUrl = e.target.value))}
        />
      </div>

      <div>
        <Label>Secondary Button Text</Label>
        <Input
          value={secondaryButtonText}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonText = e.target.value))}
        />
      </div>

      <div>
        <Label>Secondary Button URL</Label>
        <Input
          value={secondaryButtonUrl}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonUrl = e.target.value))}
        />
      </div>

      <Separator className="my-4" />

      {/* Background Image Upload Section */}
      <div className="space-y-2">
        <Label>Upload Background Image</Label>
        <ImageUpload
          value={backgroundImage}
          onChange={(url) => setProp((props: HeroSectionProps) => (props.backgroundImage = url))}
          folder="page-builder/hero"
          maxSize={5}
        />
      </div>

      <Separator className="my-4" />

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label>Or Enter Background Image URL</Label>
        <Input
          value={backgroundImage}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.backgroundImage = e.target.value))}
          placeholder="https://example.com/hero.jpg"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="overlay"
          checked={overlay}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.overlay = e.target.checked))}
          className="rounded"
        />
        <Label htmlFor="overlay">Show Dark Overlay</Label>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.textColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.textColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Primary Button Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={primaryButtonColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.primaryButtonColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={primaryButtonColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.primaryButtonColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Primary Button Hover Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={primaryButtonHoverColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.primaryButtonHoverColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={primaryButtonHoverColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.primaryButtonHoverColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Button Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={buttonTextColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.buttonTextColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={buttonTextColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.buttonTextColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Secondary Button Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondaryButtonColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={secondaryButtonColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Secondary Button Hover Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondaryButtonHoverColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonHoverColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={secondaryButtonHoverColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonHoverColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Secondary Button Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondaryButtonTextColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonTextColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={secondaryButtonTextColor}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.secondaryButtonTextColor = e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

HeroSection.craft = {
  displayName: 'Hero Section',
  props: defaultProps,
  related: {
    settings: HeroSectionSettings,
  },
};
