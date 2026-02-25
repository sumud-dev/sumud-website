'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { CompactRichTextEditor } from '@/src/lib/tipTap-editor/CompactRichTextEditor';
import { Calendar } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface TimelineSectionProps {
  title?: string;
  subtitle?: string;
  events?: TimelineEvent[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  lineColor?: string;
  children?: React.ReactNode;
}

const defaultProps: TimelineSectionProps = {
  title: 'Our Journey',
  subtitle: 'A Timeline of Solidarity',
  events: [
    {
      year: '2013',
      title: 'Foundation',
      description: 'Sumud - Finnish Palestine Network was established by activists and community members dedicated to Palestinian solidarity.',
    },
    {
      year: '2015',
      title: 'Cultural Exchange',
      description: 'Launched our first cultural exchange program, bringing Palestinian artists to Finland and fostering mutual understanding.',
    },
    {
      year: '2017',
      title: 'Advocacy Milestone',
      description: 'Successfully campaigned for municipal resolutions supporting Palestinian human rights in multiple Finnish cities.',
    },
    {
      year: '2019',
      title: 'Educational Programs',
      description: 'Established comprehensive educational initiatives, reaching thousands of students with Palestinian history and culture.',
    },
    {
      year: '2021',
      title: 'Community Growth',
      description: 'Expanded to 500+ active members, becoming the leading Palestinian solidarity organization in Finland.',
    },
    {
      year: '2023',
      title: 'International Partnerships',
      description: 'Formed strategic partnerships with solidarity organizations across Europe, amplifying our collective impact.',
    },
  ],
  backgroundColor: '#ffffff',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
  lineColor: '#55613C',
};

export const TimelineSection = (props: TimelineSectionProps) => {
  const {
    title,
    subtitle,
    events,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    lineColor,
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
      <div className="max-w-5xl mx-auto">
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

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full"
            style={{ backgroundColor: lineColor, opacity: 0.3 }}
          />

          {/* Events */}
          <div className="space-y-12">
            {events?.map((event, index) => (
              <div 
                key={index}
                className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                  <div className="bg-gradient-to-br from-[#F4F3F0] to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3"
                      style={{ backgroundColor: accentColor, color: 'white' }}
                    >
                      <Calendar size={14} />
                      {event.year}
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: titleColor }}>
                      {event.title}
                    </h3>
                    <div 
                      className="prose prose-sm" 
                      style={{ color: textColor }}
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  </div>
                </div>

                {/* Center Dot */}
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10"
                  style={{ backgroundColor: accentColor }}
                />

                {/* Spacer */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

TimelineSection.craft = {
  displayName: 'Timeline Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: TimelineSectionSettings,
  },
};

export function TimelineSectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as TimelineSectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: TimelineSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: TimelineSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: TimelineSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: TimelineSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: TimelineSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Line Color</Label>
        <Input
          type="color"
          value={props.lineColor || '#55613C'}
          onChange={(e) => setProp((props: TimelineSectionProps) => (props.lineColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t">
        <Label className="mb-3 block">Timeline Events</Label>
        {props.events?.map((event, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div>
              <Label>Year {index + 1}</Label>
              <Input
                value={event.year}
                onChange={(e) =>
                  setProp((props: TimelineSectionProps) => {
                    if (props.events) {
                      props.events[index].year = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={event.title}
                onChange={(e) =>
                  setProp((props: TimelineSectionProps) => {
                    if (props.events) {
                      props.events[index].title = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <CompactRichTextEditor
                value={event.description || ''}
                onChange={(value) =>
                  setProp((props: TimelineSectionProps) => {
                    if (props.events) {
                      props.events[index].description = value;
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
