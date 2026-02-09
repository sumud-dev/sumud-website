'use client';

import React from 'react';
import Link from 'next/link';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

interface Partner {
  name: string;
  logo: string;
  url?: string;
}

interface PartnersSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  partners?: Partner[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  logoSize?: 'small' | 'medium' | 'large';
}

const defaultProps: PartnersSectionProps = {
  title: 'Our Partners',
  subtitle: 'Building Solidarity Together',
  description: 'We collaborate with organizations across Finland and internationally to advance Palestinian rights and foster cross-cultural understanding.',
  partners: [
    { name: 'Human Rights Watch', logo: '/images/partners/hrw.png', url: '#' },
    { name: 'Amnesty International', logo: '/images/partners/amnesty.png', url: '#' },
    { name: 'Finnish Peace Union', logo: '/images/partners/peace-union.png', url: '#' },
    { name: 'Palestine Solidarity Campaign', logo: '/images/partners/psc.png', url: '#' },
    { name: 'European Coordination', logo: '/images/partners/eccp.png', url: '#' },
    { name: 'BDS Movement', logo: '/images/partners/bds.png', url: '#' },
    { name: 'Addameer', logo: '/images/partners/addameer.png', url: '#' },
    { name: 'Al-Haq', logo: '/images/partners/alhaq.png', url: '#' },
  ],
  backgroundColor: '#ffffff',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
  logoSize: 'medium',
};

export const PartnersSection = (props: PartnersSectionProps) => {
  const {
    title,
    subtitle,
    description,
    partners,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    logoSize,
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  const getLogoSizeClass = () => {
    switch (logoSize) {
      case 'small':
        return 'h-12 w-32';
      case 'large':
        return 'h-24 w-48';
      default:
        return 'h-16 w-40';
    }
  };

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
            <p className="font-semibold text-sm uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              {subtitle}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>
            {title}
          </h2>
          {description && (
            <p className="text-lg" style={{ color: textColor }}>
              {description}
            </p>
          )}
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {partners?.map((partner, index) => (
            <a
              key={index}
              href={partner.url || '#'}
              target={partner.url ? '_blank' : undefined}
              rel={partner.url ? 'noopener noreferrer' : undefined}
              className="group flex items-center justify-center p-6 bg-gradient-to-br from-[#F4F3F0] to-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div 
                className={`${getLogoSizeClass()} bg-gray-200 rounded flex items-center justify-center text-gray-400 font-semibold text-xs text-center px-2 group-hover:scale-105 transition-transform`}
                style={{
                  backgroundImage: partner.logo ? `url(${partner.logo})` : 'none',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {!partner.logo && partner.name}
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg" style={{ color: textColor }}>
            Interested in partnering with us?{' '}
            <Link 
              href="/contact" 
              className="font-bold hover:underline"
              style={{ color: accentColor }}
            >
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

PartnersSection.craft = {
  displayName: 'Partners Section',
  props: defaultProps,
  related: {
    settings: PartnersSectionSettings,
  },
};

export function PartnersSectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as PartnersSectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={props.description || ''}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.description = e.target.value))}
        />
      </div>

      <div>
        <Label>Logo Size</Label>
        <select
          className="w-full p-2 border rounded"
          value={props.logoSize || 'medium'}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.logoSize = e.target.value as 'small' | 'medium' | 'large'))}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: PartnersSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t">
        <Label className="mb-3 block">Partners</Label>
        {props.partners?.map((partner, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div>
              <Label>Partner {index + 1} Name</Label>
              <Input
                value={partner.name}
                onChange={(e) =>
                  setProp((props: PartnersSectionProps) => {
                    if (props.partners) {
                      props.partners[index].name = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={partner.logo}
                onChange={(e) =>
                  setProp((props: PartnersSectionProps) => {
                    if (props.partners) {
                      props.partners[index].logo = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input
                value={partner.url || ''}
                onChange={(e) =>
                  setProp((props: PartnersSectionProps) => {
                    if (props.partners) {
                      props.partners[index].url = e.target.value;
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
