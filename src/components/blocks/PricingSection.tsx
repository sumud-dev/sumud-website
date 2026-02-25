'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Check } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
  highlighted?: boolean;
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  children?: React.ReactNode;
}

const defaultProps: PricingSectionProps = {
  title: 'Support Our Mission',
  subtitle: 'Choose Your Level of Support',
  tiers: [
    {
      name: 'Supporter',
      price: '10',
      period: 'month',
      description: 'Help us sustain our basic operations and community programs.',
      features: [
        'Monthly newsletter',
        'Community event access',
        'Member directory listing',
        'Digital resources',
      ],
      buttonText: 'Become a Supporter',
      buttonUrl: '/support?tier=supporter',
      highlighted: false,
    },
    {
      name: 'Advocate',
      price: '25',
      period: 'month',
      description: 'Amplify our advocacy efforts and educational initiatives.',
      features: [
        'All Supporter benefits',
        'Priority event registration',
        'Quarterly impact reports',
        'Advocacy toolkit access',
        'Member meetups',
      ],
      buttonText: 'Become an Advocate',
      buttonUrl: '/support?tier=advocate',
      highlighted: true,
    },
    {
      name: 'Patron',
      price: '50',
      period: 'month',
      description: 'Make a significant impact on our programs and reach.',
      features: [
        'All Advocate benefits',
        'VIP event access',
        'Direct updates from leadership',
        'Recognition on website',
        'Exclusive webinars',
        'Annual appreciation event',
      ],
      buttonText: 'Become a Patron',
      buttonUrl: '/support?tier=patron',
      highlighted: false,
    },
  ],
  backgroundColor: '#F4F3F0',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
};

export const PricingSection = (props: PricingSectionProps) => {
  const {
    title,
    subtitle,
    tiers,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
  } = props;

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
        <div className="text-center mb-16">
          {subtitle && (
            <p className="font-semibold text-sm uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              {subtitle}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: titleColor }}>
            {title}
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {tiers?.map((tier, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all ${
                tier.highlighted 
                  ? 'bg-gradient-to-br from-white to-[#F4F3F0] ring-2 ring-offset-4 transform md:scale-105' 
                  : 'bg-white'
              }`}
              style={tier.highlighted ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}}
            >
              {tier.highlighted && (
                <div 
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4"
                  style={{ backgroundColor: accentColor }}
                >
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2" style={{ color: titleColor }}>
                {tier.name}
              </h3>

              <div className="mb-4">
                <span className="text-4xl font-bold" style={{ color: accentColor }}>
                  €{tier.price}
                </span>
                <span className="text-gray-600">/{tier.period}</span>
              </div>

              <p className="mb-6" style={{ color: textColor }}>
                {tier.description}
              </p>

              <Button 
                asChild
                className="w-full mb-6"
                style={{ 
                  backgroundColor: tier.highlighted ? accentColor : 'white',
                  color: tier.highlighted ? 'white' : accentColor,
                  border: tier.highlighted ? 'none' : `2px solid ${accentColor}`,
                }}
              >
                <a href={tier.buttonUrl}>{tier.buttonText}</a>
              </Button>

              <div className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check 
                      size={20} 
                      className="shrink-0 mt-0.5"
                      style={{ color: accentColor }}
                    />
                    <span style={{ color: textColor }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
};

PricingSection.craft = {
  displayName: 'Pricing Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: PricingSectionSettings,
  },
};

export function PricingSectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as PricingSectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: PricingSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: PricingSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#F4F3F0'}
          onChange={(e) => setProp((props: PricingSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: PricingSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: PricingSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t">
        <Label className="mb-3 block">Pricing Tiers (Simplified Editor)</Label>
        <p className="text-sm text-gray-600 mb-4">
          Note: Full tier editing requires custom implementation. This shows basic name editing only.
        </p>
        {props.tiers?.map((tier, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div>
              <Label>Tier {index + 1} Name</Label>
              <Input
                value={tier.name}
                onChange={(e) =>
                  setProp((props: PricingSectionProps) => {
                    if (props.tiers) {
                      props.tiers[index].name = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                value={tier.price}
                onChange={(e) =>
                  setProp((props: PricingSectionProps) => {
                    if (props.tiers) {
                      props.tiers[index].price = e.target.value;
                    }
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
