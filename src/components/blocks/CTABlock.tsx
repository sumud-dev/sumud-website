'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

interface CTABlockProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  primaryButtonColor?: string;
  primaryButtonHoverColor?: string;
  buttonTextColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonHoverColor?: string;
  secondaryButtonTextColor?: string;
  variant?: 'centered' | 'split' | 'minimal';
  children?: React.ReactNode;
}

const defaultProps: CTABlockProps = {
  title: 'Join Our Movement',
  description: 'Stand with Palestine. Your voice matters in the fight for justice and human rights.',
  primaryButtonText: 'Get Involved',
  primaryButtonUrl: '/join',
  secondaryButtonText: 'Learn More',
  secondaryButtonUrl: '/about',
  backgroundColor: '#781D32',
  textColor: '#ffffff',
  primaryButtonColor: '#ffffff',
  primaryButtonHoverColor: '#f5f5f5',
  buttonTextColor: '#781D32',
  secondaryButtonColor: '#ffffff',
  secondaryButtonHoverColor: '#f5f5f5',
  secondaryButtonTextColor: '#781D32',
  variant: 'centered',
};

export const CTABlock = (props: CTABlockProps) => {
  const {
    title,
    description,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    backgroundColor,
    textColor,
    primaryButtonColor,
    primaryButtonHoverColor,
    buttonTextColor,
    secondaryButtonColor,
    secondaryButtonHoverColor,
    secondaryButtonTextColor,
    variant,
  } = props;

  const { children } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  const renderCentered = () => (
    <div 
      className="relative py-16 px-6 text-center"
      style={{ backgroundColor }}
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>{title}</h2>
        <p className="text-lg mb-8" style={{ color: textColor, opacity: 0.9 }}>{description}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {primaryButtonText && (
            <Button 
              asChild
              size="lg"
              className="transition-colors"
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
              className="transition-colors"
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

  const renderSplit = () => (
    <div 
      className="relative py-16 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div style={{ color: textColor }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg" style={{ opacity: 0.9 }}>{description}</p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          {primaryButtonText && (
            <Button 
              asChild
              size="lg"
              className="transition-colors"
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
              className="transition-colors"
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

  const renderMinimal = () => (
    <div 
      className="relative py-12 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1" style={{ color: textColor }}>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p style={{ opacity: 0.9 }}>{description}</p>
        </div>
        <div className="flex gap-4 shrink-0">
          {primaryButtonText && (
            <Button 
              asChild
              className="transition-colors"
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
              className="transition-colors"
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

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }}>
      {variant === 'centered' && renderCentered()}
      {variant === 'split' && renderSplit()}
      {variant === 'minimal' && renderMinimal()}
      {children}
    </div>
  );
};

// Settings panel for the CTA block
export const CTABlockSettings = () => {
  const {
    actions: { setProp },
    title,
    description,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    backgroundColor,
    textColor,
    primaryButtonColor,
    primaryButtonHoverColor,
    buttonTextColor,
    secondaryButtonColor,
    secondaryButtonHoverColor,
    secondaryButtonTextColor,
    variant,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    description: node.data?.props?.description,
    primaryButtonText: node.data?.props?.primaryButtonText,
    primaryButtonUrl: node.data?.props?.primaryButtonUrl,
    secondaryButtonText: node.data?.props?.secondaryButtonText,
    secondaryButtonUrl: node.data?.props?.secondaryButtonUrl,
    backgroundColor: node.data?.props?.backgroundColor,
    textColor: node.data?.props?.textColor,
    primaryButtonColor: node.data?.props?.primaryButtonColor,
    primaryButtonHoverColor: node.data?.props?.primaryButtonHoverColor,
    buttonTextColor: node.data?.props?.buttonTextColor,
    secondaryButtonColor: node.data?.props?.secondaryButtonColor,
    secondaryButtonHoverColor: node.data?.props?.secondaryButtonHoverColor,
    secondaryButtonTextColor: node.data?.props?.secondaryButtonTextColor,
    variant: node.data?.props?.variant,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Variant</Label>
        <Select
          value={variant}
          onValueChange={(value) => setProp((props: CTABlockProps) => (props.variant = value as 'centered' | 'split' | 'minimal'))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centered">Centered</SelectItem>
            <SelectItem value="split">Split</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setProp((props: CTABlockProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setProp((props: CTABlockProps) => (props.description = e.target.value))}
          rows={3}
        />
      </div>

      <div>
        <Label>Primary Button Text</Label>
        <Input
          value={primaryButtonText}
          onChange={(e) => setProp((props: CTABlockProps) => (props.primaryButtonText = e.target.value))}
        />
      </div>

      <div>
        <Label>Primary Button URL</Label>
        <Input
          value={primaryButtonUrl}
          onChange={(e) => setProp((props: CTABlockProps) => (props.primaryButtonUrl = e.target.value))}
        />
      </div>

      <div>
        <Label>Secondary Button Text</Label>
        <Input
          value={secondaryButtonText}
          onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonText = e.target.value))}
        />
      </div>

      <div>
        <Label>Secondary Button URL</Label>
        <Input
          value={secondaryButtonUrl}
          onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonUrl = e.target.value))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.backgroundColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.backgroundColor = e.target.value))}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1 text-xs rounded bg-[#781D32] text-white"
            onClick={() => setProp((props: CTABlockProps) => (props.backgroundColor = '#781D32'))}
          >
            Burgundy
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-[#55613C] text-white"
            onClick={() => setProp((props: CTABlockProps) => (props.backgroundColor = '#55613C'))}
          >
            Olive
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-[#3E442B] text-white"
            onClick={() => setProp((props: CTABlockProps) => (props.backgroundColor = '#3E442B'))}
          >
            Dark
          </button>
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.textColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.textColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Primary Button Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={primaryButtonColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.primaryButtonColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={primaryButtonColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.primaryButtonColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Primary Button Hover Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={primaryButtonHoverColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.primaryButtonHoverColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={primaryButtonHoverColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.primaryButtonHoverColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Button Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={buttonTextColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.buttonTextColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={buttonTextColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.buttonTextColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Secondary Button Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondaryButtonColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={secondaryButtonColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Secondary Button Hover Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondaryButtonHoverColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonHoverColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={secondaryButtonHoverColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonHoverColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Secondary Button Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondaryButtonTextColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonTextColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={secondaryButtonTextColor}
            onChange={(e) => setProp((props: CTABlockProps) => (props.secondaryButtonTextColor = e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

CTABlock.craft = {
  displayName: 'CTA Block',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: CTABlockSettings,
  },
};
