"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { TemplateType } from '@/src/lib/types/editor';
import { getTemplate } from '@/src/lib/tipTap-editor/templates/editor-templates';
import { getTemplateDefaults } from '@/src/lib/tipTap-editor/templates/template-defaults';

interface TemplateEditorDialogProps {
  isOpen: boolean;
  templateType: TemplateType | null;
  onInsert: (html: string) => void;
  onClose: () => void;
}

export const TemplateEditorDialog: React.FC<TemplateEditorDialogProps> = ({
  isOpen,
  templateType,
  onInsert,
  onClose,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  const [textColor, setTextColor] = useState('#ffffff');

  // Reset form when template type changes
  useEffect(() => {
    if (templateType) {
      setFormData(getDefaultValues(templateType));
      // Set default colors based on template type
      const defaults = getTemplateColors(templateType);
      setBackgroundColor(defaults.background);
      setTextColor(defaults.text);
    }
  }, [templateType]);

  const handleSubmit = () => {
    if (!templateType) return;
    const html = generateTemplateHTML(templateType, formData, backgroundColor, textColor);
    onInsert(html);
    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!templateType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {getTemplateName(templateType)}</DialogTitle>
          <DialogDescription>
            Fill in the fields below to customize your template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Color Controls */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
            <div>
              <Label htmlFor="backgroundColor" className="text-sm font-medium">Background Color</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#667eea"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textColor" className="text-sm font-medium">Text Color</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Template-specific fields */}
          {renderTemplateForm(templateType, formData, updateField)}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Insert Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Template form renderers
function renderTemplateForm(
  type: TemplateType,
  data: Record<string, string>,
  update: (field: string, value: string) => void
) {
  switch (type) {
    case 'hero':
      return (
        <>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={data.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Welcome to Your Page"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder="A beautiful hero section..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="primaryButton">Primary Button Text</Label>
            <Input
              id="primaryButton"
              value={data.primaryButton || ''}
              onChange={(e) => update('primaryButton', e.target.value)}
              placeholder="Get Started"
            />
          </div>
          <div>
            <Label htmlFor="secondaryButton">Secondary Button Text</Label>
            <Input
              id="secondaryButton"
              value={data.secondaryButton || ''}
              onChange={(e) => update('secondaryButton', e.target.value)}
              placeholder="Learn More"
            />
          </div>
        </>
      );

    case 'accordion':
      return (
        <>
          <div>
            <Label htmlFor="item1Title">Item 1 Title</Label>
            <Input
              id="item1Title"
              value={data.item1Title || ''}
              onChange={(e) => update('item1Title', e.target.value)}
              placeholder="Section One"
            />
          </div>
          <div>
            <Label htmlFor="item1Content">Item 1 Content</Label>
            <Textarea
              id="item1Content"
              value={data.item1Content || ''}
              onChange={(e) => update('item1Content', e.target.value)}
              placeholder="Content for the first section..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="item2Title">Item 2 Title</Label>
            <Input
              id="item2Title"
              value={data.item2Title || ''}
              onChange={(e) => update('item2Title', e.target.value)}
              placeholder="Section Two"
            />
          </div>
          <div>
            <Label htmlFor="item2Content">Item 2 Content</Label>
            <Textarea
              id="item2Content"
              value={data.item2Content || ''}
              onChange={(e) => update('item2Content', e.target.value)}
              placeholder="Content for the second section..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="item3Title">Item 3 Title</Label>
            <Input
              id="item3Title"
              value={data.item3Title || ''}
              onChange={(e) => update('item3Title', e.target.value)}
              placeholder="Section Three"
            />
          </div>
          <div>
            <Label htmlFor="item3Content">Item 3 Content</Label>
            <Textarea
              id="item3Content"
              value={data.item3Content || ''}
              onChange={(e) => update('item3Content', e.target.value)}
              placeholder="Content for the third section..."
              rows={2}
            />
          </div>
        </>
      );

    case 'card':
      return (
        <>
          <div>
            <Label htmlFor="title">Card Title</Label>
            <Input
              id="title"
              value={data.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Card Title"
            />
          </div>
          <div>
            <Label htmlFor="content">Card Content</Label>
            <Textarea
              id="content"
              value={data.content || ''}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Add your content here..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="linkText">Link Text</Label>
            <Input
              id="linkText"
              value={data.linkText || ''}
              onChange={(e) => update('linkText', e.target.value)}
              placeholder="Learn more"
            />
          </div>
        </>
      );

    case 'cta':
      return (
        <>
          <div>
            <Label htmlFor="title">CTA Title</Label>
            <Input
              id="title"
              value={data.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ready to Get Started?"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Join thousands of satisfied customers today."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="primaryButton">Primary Button Text</Label>
            <Input
              id="primaryButton"
              value={data.primaryButton || ''}
              onChange={(e) => update('primaryButton', e.target.value)}
              placeholder="Start Free Trial"
            />
          </div>
          <div>
            <Label htmlFor="secondaryButton">Secondary Button Text</Label>
            <Input
              id="secondaryButton"
              value={data.secondaryButton || ''}
              onChange={(e) => update('secondaryButton', e.target.value)}
              placeholder="View Demo"
            />
          </div>
        </>
      );

    case 'testimonial':
      return (
        <>
          <div>
            <Label htmlFor="quote">Quote</Label>
            <Textarea
              id="quote"
              value={data.quote || ''}
              onChange={(e) => update('quote', e.target.value)}
              placeholder="This product has completely transformed..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="author">Author Name</Label>
            <Input
              id="author"
              value={data.author || ''}
              onChange={(e) => update('author', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="position">Author Position</Label>
            <Input
              id="position"
              value={data.position || ''}
              onChange={(e) => update('position', e.target.value)}
              placeholder="CEO at TechCorp"
            />
          </div>
          <div>
            <Label htmlFor="initials">Author Initials</Label>
            <Input
              id="initials"
              value={data.initials || ''}
              onChange={(e) => update('initials', e.target.value)}
              placeholder="JD"
              maxLength={2}
            />
          </div>
        </>
      );

    default:
      return renderGenericTemplateForm(type, data, update);
  }
}

// Get default values for each template
function getDefaultValues(type: TemplateType): Record<string, string> {
  return getTemplateDefaults(type);
}

// Get default colors for each template
function getTemplateColors(type: TemplateType): { background: string; text: string } {
  const colorMap: Record<string, { background: string; text: string }> = {
    hero: { background: '#667eea', text: '#ffffff' },
    cta: { background: '#111827', text: '#ffffff' },
    card: { background: '#ffffff', text: '#111827' },
    testimonial: { background: '#f5f7fa', text: '#374151' },
    accordion: { background: '#ffffff', text: '#111827' },
    'callout-info': { background: '#3b82f6', text: '#ffffff' },
    'callout-warning': { background: '#f59e0b', text: '#ffffff' },
    'callout-success': { background: '#10b981', text: '#ffffff' },
    'callout-error': { background: '#ef4444', text: '#ffffff' },
    'callout-tip': { background: '#8b5cf6', text: '#ffffff' },
  };
  
  return colorMap[type] || { background: '#667eea', text: '#ffffff' };
}

// Get template display name
function getTemplateName(type: TemplateType): string {
  const names: Record<string, string> = {
    hero: 'Hero Section',
    accordion: 'Accordion',
    card: 'Card',
    cta: 'Call to Action',
    testimonial: 'Testimonial',
    twoColumn: 'Two Columns',
    threeColumn: 'Three Columns',
    gridLayout: 'Feature Grid',
    sidebarLayout: 'Sidebar Layout',
    features: 'Features',
    pricing: 'Pricing',
    faq: 'FAQ',
    timeline: 'Timeline',
    stats: 'Statistics',
    team: 'Team',
    newsletter: 'Newsletter',
    'callout-info': 'Info Callout',
    'callout-warning': 'Warning Callout',
    'callout-success': 'Success Callout',
    'callout-error': 'Error Callout',
    'callout-tip': 'Pro Tip Callout',
    checkList: 'Checklist',
    stepList: 'Step Guide',
    iconList: 'Icon List',
    comparisonTable: 'Comparison Table',
  };
  return names[type] || type;
}

// Generate HTML with user input
function generateTemplateHTML(type: TemplateType, data: Record<string, string>, bgColor: string, txtColor: string): string {
  switch (type) {
    case 'hero':
      return `<div style="text-align:center;padding:80px 32px;margin:48px 0;background:${bgColor};border-radius:16px;color:${txtColor};box-shadow:0 10px 40px rgba(102,126,234,0.3)"><h1 style="font-size:3rem;font-weight:900;margin:0 0 20px 0;line-height:1.1;letter-spacing:-0.02em;color:${txtColor}">${data.title}</h1><p style="font-size:1.25rem;margin:0 0 32px 0;opacity:0.95;max-width:600px;margin-left:auto;margin-right:auto;color:${txtColor}">${data.description}</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="#" style="display:inline-block;padding:14px 32px;background:#fff;color:${bgColor};text-decoration:none;border-radius:8px;font-weight:600;box-shadow:0 4px 6px rgba(0,0,0,0.1)">${data.primaryButton}</a><a href="#" style="display:inline-block;padding:14px 32px;background:rgba(255,255,255,0.2);color:${txtColor};text-decoration:none;border-radius:8px;font-weight:600;border:2px solid ${txtColor}">${data.secondaryButton}</a></div></div>`;

    case 'accordion':
      return `<div style="max-width:800px;margin:32px auto"><details open style="padding:20px 24px;border-radius:10px;background:${bgColor};border:1px solid #e5e7eb;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);transition:all 0.2s"><summary style="font-size:1.0625rem;font-weight:600;color:${txtColor};cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">${data.item1Title}</summary><div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(0,0,0,0.1)"><p style="margin:0;color:${txtColor};opacity:0.8;line-height:1.6">${data.item1Content}</p></div></details><details open style="padding:20px 24px;border-radius:10px;background:${bgColor};border:1px solid #e5e7eb;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);transition:all 0.2s"><summary style="font-size:1.0625rem;font-weight:600;color:${txtColor};cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">${data.item2Title}</summary><div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(0,0,0,0.1)"><p style="margin:0;color:${txtColor};opacity:0.8;line-height:1.6">${data.item2Content}</p></div></details><details open style="padding:20px 24px;border-radius:10px;background:${bgColor};border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.05);transition:all 0.2s"><summary style="font-size:1.0625rem;font-weight:600;color:${txtColor};cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">${data.item3Title}</summary><div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(0,0,0,0.1)"><p style="margin:0;color:${txtColor};opacity:0.8;line-height:1.6">${data.item3Content}</p></div></details></div>`;

    case 'card':
      return `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:32px;margin:24px 0;background:${bgColor};box-shadow:0 1px 3px rgba(0,0,0,0.1)"><h3 style="font-size:1.5rem;font-weight:700;margin:0 0 12px 0;color:${txtColor}">${data.title}</h3><p style="color:${txtColor};opacity:0.8;margin:0 0 20px 0;line-height:1.6">${data.content}</p><div style="padding-top:16px;border-top:1px solid rgba(0,0,0,0.1)"><a href="#" style="color:${txtColor};text-decoration:none;font-weight:500;font-size:0.875rem">${data.linkText} →</a></div></div>`;

    case 'cta':
      return `<div style="max-width:800px;margin:48px auto;padding:48px 32px;background:${bgColor};border-radius:16px;text-align:center;position:relative;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.3)"><div style="position:absolute;top:0;left:0;right:0;height:4px;background:${txtColor};opacity:0.3"></div><h2 style="font-size:2.5rem;font-weight:900;margin:0 0 16px 0;color:${txtColor}">${data.title}</h2><p style="font-size:1.25rem;margin:0 0 32px 0;color:${txtColor};opacity:0.8">${data.description}</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="#" style="display:inline-block;padding:16px 40px;background:${txtColor};color:${bgColor};text-decoration:none;border-radius:8px;font-weight:700;font-size:1.125rem;box-shadow:0 4px 6px rgba(0,0,0,0.2)">${data.primaryButton}</a><a href="#" style="display:inline-block;padding:16px 40px;background:transparent;color:${txtColor};text-decoration:none;border-radius:8px;font-weight:600;border:2px solid ${txtColor};font-size:1.125rem">${data.secondaryButton}</a></div></div>`;

    case 'testimonial':
      return `<div style="max-width:800px;margin:48px auto;padding:48px 32px;background:${bgColor};border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.1)"><div style="width:80px;height:80px;margin:0 auto 24px;border-radius:50%;background:${txtColor};opacity:0.2;display:flex;align-items:center;justify-content:center;color:${bgColor};font-size:2rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.2)"><span style="opacity:1;color:${txtColor}">${data.initials}</span></div><blockquote style="margin:0 0 24px 0;font-size:1.25rem;font-style:italic;color:${txtColor};line-height:1.6">"${data.quote}"</blockquote><div style="font-weight:700;color:${txtColor};margin-bottom:4px;font-size:1.125rem">${data.author}</div><div style="color:${txtColor};opacity:0.7;font-size:0.875rem">${data.position}</div></div>`;

    default:
      return applyTemplateDefaults(type, data, bgColor, txtColor);
  }
}

function renderGenericTemplateForm(
  type: TemplateType,
  data: Record<string, string>,
  update: (field: string, value: string) => void
) {
  const defaults = getDefaultValues(type);
  const fields = Object.keys(defaults);

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground space-y-3">
        <p className="text-base">No editable fields found for this template.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const label = formatFieldLabel(field);
        const value = data[field] ?? '';
        const isLongText = /description|content|bio|note|answer/i.test(field);

        return (
          <div key={field}>
            <Label htmlFor={field}>{label}</Label>
            {isLongText ? (
              <Textarea
                id={field}
                value={value}
                onChange={(event) => update(field, event.target.value)}
                rows={3}
              />
            ) : (
              <Input
                id={field}
                value={value}
                onChange={(event) => update(field, event.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function applyTemplateDefaults(type: TemplateType, data: Record<string, string>, bgColor: string, txtColor: string): string {
  const defaults = getDefaultValues(type);
  let html = getTemplate(type);

  Object.entries(defaults).forEach(([key, defaultValue]) => {
    const value = data[key] ?? defaultValue;
    if (!defaultValue) return;
    html = html.split(defaultValue).join(value);
  });

  // Apply color customization to common color patterns
  html = html
    .replace(/background:#667eea/g, `background:${bgColor}`)
    .replace(/background:#111827/g, `background:${bgColor}`)
    .replace(/background:#fff/g, `background:${bgColor}`)
    .replace(/background:#ffffff/g, `background:${bgColor}`)
    .replace(/background:#f5f7fa/g, `background:${bgColor}`)
    .replace(/color:#ffffff/g, `color:${txtColor}`)
    .replace(/color:#fff/g, `color:${txtColor}`)
    .replace(/color:#111827/g, `color:${txtColor}`)
    .replace(/color:#374151/g, `color:${txtColor}`)
    .replace(/color:#1f2937/g, `color:${txtColor}`);

  return html;
}

function formatFieldLabel(value: string): string {
  const normalized = value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\d+/g, (match) => ` ${match}`)
    .replace(/\s+/g, ' ')
    .trim();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
