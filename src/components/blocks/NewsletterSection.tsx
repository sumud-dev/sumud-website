'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { CompactRichTextEditor } from '@/src/lib/tipTap-editor/CompactRichTextEditor';
import { Mail, ArrowRight } from 'lucide-react';

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  inputBgColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  variant?: 'centered' | 'split' | 'card';
  children?: React.ReactNode;
}

const defaultProps: NewsletterSectionProps = {
  title: 'Stay Connected',
  subtitle: 'Join Our Newsletter',
  description: 'Get the latest updates on our events, campaigns, and initiatives. Be part of the movement for Palestinian solidarity.',
  placeholder: 'Enter your email address',
  buttonText: 'Subscribe',
  backgroundColor: '#781D32',
  titleColor: '#ffffff',
  textColor: '#ffffff',
  accentColor: '#F4F3F0',
  inputBgColor: '#ffffff',
  buttonColor: '#55613C',
  buttonTextColor: '#ffffff',
  variant: 'centered',
};

export const NewsletterSection = (props: NewsletterSectionProps) => {
  const {
    title,
    subtitle,
    description,
    placeholder,
    buttonText,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    inputBgColor,
    buttonColor,
    buttonTextColor,
    variant,
  } = props;

  const { children } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  const renderCentered = () => (
    <div className="max-w-2xl mx-auto text-center">
      {subtitle && (
        <p className="font-semibold text-sm uppercase tracking-wide mb-2" style={{ color: accentColor, opacity: 0.9 }}>
          {subtitle}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>
        {title}
      </h2>
      {description && (
        <div 
          className="text-lg mb-8 prose prose-lg" 
          style={{ color: textColor, opacity: 0.9 }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      <form className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" size={20} />
          <Input
            type="email"
            placeholder={placeholder}
            className="pl-12 py-6 text-lg"
            style={{ backgroundColor: inputBgColor }}
          />
        </div>
        <Button 
          type="submit"
          size="lg"
          className="px-8 py-6 text-lg font-semibold"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          {buttonText}
          <ArrowRight className="ml-2" size={20} />
        </Button>
      </form>
    </div>
  );

  const renderSplit = () => (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        {subtitle && (
          <p className="font-semibold text-sm uppercase tracking-wide mb-2" style={{ color: accentColor, opacity: 0.9 }}>
            {subtitle}
          </p>
        )}
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>
          {title}
        </h2>
        {description && (
          <div 
            className="text-lg prose prose-lg" 
            style={{ color: textColor, opacity: 0.9 }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
      <div>
        <form className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" size={20} />
            <Input
              type="email"
              placeholder={placeholder}
              className="pl-12 py-6 text-lg"
              style={{ backgroundColor: inputBgColor }}
            />
          </div>
          <Button 
            type="submit"
            size="lg"
            className="w-full py-6 text-lg font-semibold"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            {buttonText}
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </form>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="max-w-3xl mx-auto">
      <div 
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl"
        style={{ border: `1px solid ${accentColor}40` }}
      >
        <div className="text-center mb-8">
          {subtitle && (
            <p className="font-semibold text-sm uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              {subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: titleColor }}>
            {title}
          </h2>
          {description && (
            <div 
              className="text-lg prose prose-lg" 
              style={{ color: textColor, opacity: 0.9 }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" size={20} />
            <Input
              type="email"
              placeholder={placeholder}
              className="pl-12 py-6 text-lg"
              style={{ backgroundColor: inputBgColor }}
            />
          </div>
          <Button 
            type="submit"
            size="lg"
            className="px-8 py-6 text-lg font-semibold"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            {buttonText}
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {variant === 'centered' && renderCentered()}
        {variant === 'split' && renderSplit()}
        {variant === 'card' && renderCard()}
      </div>
      {children}
    </div>
  );
};

NewsletterSection.craft = {
  displayName: 'Newsletter Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: NewsletterSectionSettings,
  },
};

export function NewsletterSectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as NewsletterSectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <CompactRichTextEditor
          value={props.description || ''}
          onChange={(value) => setProp((props: NewsletterSectionProps) => (props.description = value))}
        />
      </div>

      <div>
        <Label>Placeholder Text</Label>
        <Input
          value={props.placeholder || ''}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.placeholder = e.target.value))}
        />
      </div>

      <div>
        <Label>Button Text</Label>
        <Input
          value={props.buttonText || ''}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.buttonText = e.target.value))}
        />
      </div>

      <div>
        <Label>Variant</Label>
        <select
          className="w-full p-2 border rounded"
          value={props.variant || 'centered'}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.variant = e.target.value as 'centered' | 'split' | 'card'))}
        >
          <option value="centered">Centered</option>
          <option value="split">Split</option>
          <option value="card">Card</option>
        </select>
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#781D32'}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#ffffff'}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Button Color</Label>
        <Input
          type="color"
          value={props.buttonColor || '#55613C'}
          onChange={(e) => setProp((props: NewsletterSectionProps) => (props.buttonColor = e.target.value))}
        />
      </div>
    </div>
  );
}
