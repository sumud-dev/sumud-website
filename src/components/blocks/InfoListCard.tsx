'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Link } from '@/src/i18n/navigation';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';

interface ListItem {
  text: string;
}

interface InfoListCardProps {
  title?: string;
  description?: string;
  items?: ListItem[];
  buttonText?: string;
  buttonLink?: string;
  showButton?: boolean;
  variant?: 'default' | 'gradient';
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

const defaultProps: InfoListCardProps = {
  title: 'Why Support Us',
  description: '',
  items: [
    { text: 'Support Palestinian rights and advocacy' },
    { text: 'Fund educational programs and events' },
    { text: 'Build community connections' },
    { text: 'Amplify Palestinian voices' },
  ],
  buttonText: 'Learn More',
  buttonLink: '/about',
  showButton: false,
  variant: 'gradient',
  primaryColor: '#781D32',
  secondaryColor: '#55613C',
  accentColor: '#3E442B',
};

export const InfoListCard = (props: InfoListCardProps) => {
  const mergedProps = { ...defaultProps, ...props };
  const {
    title,
    description,
    items,
    buttonText,
    buttonLink,
    showButton,
    variant,
    primaryColor,
    secondaryColor,
    accentColor,
  } = mergedProps;

  const {
    connectors: { connect, drag },
  } = useNode();

  const cardStyle = variant === 'gradient' 
    ? { 
        background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08)` 
      } 
    : {};

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }}>
      <Card 
        className="glass-subtle blur-transition border-glass-glow shadow-glass-md hover:glass-medium hover:shadow-glass-lg gpu-accelerated rounded-2xl"
        style={cardStyle}
      >
        <CardContent className="p-6">
          <h3 className="font-bold mb-4" style={{ color: accentColor }}>
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>
          )}
          
          {items && items.length > 0 && (
            <ul className="space-y-3 text-sm text-gray-600">
              {items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Check 
                    className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" 
                    style={{ color: secondaryColor }}
                  />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          )}
          
          {showButton && buttonText && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full mt-4"
              style={{ 
                borderColor: secondaryColor, 
                color: secondaryColor,
              }}
            >
              <Link href={buttonLink || '/'}>{buttonText}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Panel
export const InfoListCardSettings = () => {
  const {
    actions: { setProp },
    ...props
  } = useNode((node) => ({
    title: node.data?.props?.title,
    description: node.data?.props?.description,
    items: node.data?.props?.items,
    buttonText: node.data?.props?.buttonText,
    buttonLink: node.data?.props?.buttonLink,
    showButton: node.data?.props?.showButton,
    variant: node.data?.props?.variant,
    primaryColor: node.data?.props?.primaryColor,
    secondaryColor: node.data?.props?.secondaryColor,
    accentColor: node.data?.props?.accentColor,
  }));

  const itemsText = props.items?.map((item: ListItem) => item.text).join('\n') || '';

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label className="text-sm font-medium">Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((p: InfoListCardProps) => (p.title = e.target.value))}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Description (optional)</Label>
        <Textarea
          value={props.description || ''}
          onChange={(e) => setProp((p: InfoListCardProps) => (p.description = e.target.value))}
          rows={2}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">List Items (one per line)</Label>
        <Textarea
          value={itemsText}
          onChange={(e) => {
            const items = e.target.value
              .split('\n')
              .filter(text => text.trim())
              .map(text => ({ text: text.trim() }));
            setProp((p: InfoListCardProps) => (p.items = items));
          }}
          rows={5}
          placeholder="Item 1&#10;Item 2&#10;Item 3"
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="showButton"
            checked={props.showButton || false}
            onChange={(e) => setProp((p: InfoListCardProps) => (p.showButton = e.target.checked))}
          />
          <Label htmlFor="showButton" className="text-sm font-medium">Show Button</Label>
        </div>
        
        {props.showButton && (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Button Text</Label>
              <Input
                value={props.buttonText || ''}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.buttonText = e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Button Link</Label>
              <Input
                value={props.buttonLink || ''}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.buttonLink = e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-medium">Variant</Label>
        <select
          value={props.variant || 'gradient'}
          onChange={(e) => setProp((p: InfoListCardProps) => (p.variant = e.target.value as 'default' | 'gradient'))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        >
          <option value="default">Default</option>
          <option value="gradient">Gradient Background</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Colors</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.primaryColor || '#781D32'}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.primaryColor = e.target.value))}
                className="w-12 h-8"
              />
              <Input
                value={props.primaryColor || ''}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.primaryColor = e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.secondaryColor || '#55613C'}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.secondaryColor = e.target.value))}
                className="w-12 h-8"
              />
              <Input
                value={props.secondaryColor || ''}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.secondaryColor = e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.accentColor || '#3E442B'}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.accentColor = e.target.value))}
                className="w-12 h-8"
              />
              <Input
                value={props.accentColor || ''}
                onChange={(e) => setProp((p: InfoListCardProps) => (p.accentColor = e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

InfoListCard.craft = {
  displayName: 'Info List Card',
  props: defaultProps,
  related: {
    settings: InfoListCardSettings,
  },
};
