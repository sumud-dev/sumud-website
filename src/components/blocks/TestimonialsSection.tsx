'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
}

const defaultProps: TestimonialsSectionProps = {
  title: 'Voices of Solidarity',
  subtitle: 'What our community members say',
  testimonials: [
    {
      quote: 'Sumud has created a welcoming space for everyone who cares about justice and human rights. Their events are both educational and inspiring.',
      author: 'Laila Hassan',
      role: 'Community Volunteer',
    },
    {
      quote: 'The cultural programs have helped me connect with my Palestinian heritage and share it with the Finnish community.',
      author: 'Omar Khalil',
      role: 'Cultural Committee Member',
    },
    {
      quote: 'Through Sumud, I learned about the rich history and resilient spirit of the Palestinian people. This organization truly makes a difference.',
      author: 'Sofia Virtanen',
      role: 'Supporter',
    },
  ],
  backgroundColor: '#F4F3F0',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
};

export const TestimonialsSection = (props: TestimonialsSectionProps) => {
  const {
    title,
    subtitle,
    testimonials,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
  } = props;

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

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials?.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative flex flex-col h-[320px]"
            >
              <Quote 
                className="absolute top-6 right-6 opacity-10 shrink-0" 
                size={48}
                style={{ color: accentColor }}
              />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Quote - Fixed height with line clamp */}
                <p className="text-lg mb-1 leading-relaxed line-clamp-6 flex-1" style={{ color: textColor }}>
                  &quot;{testimonial.quote}&quot;
                </p>
                
                {/* Author info - Fixed position at bottom */}
                <div className="flex items-center gap-4 mt-auto pt-2 shrink-0">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate" style={{ color: titleColor }}>
                      {testimonial.author}
                    </div>
                    <div className="text-sm line-clamp-2" style={{ color: textColor, opacity: 0.7 }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

TestimonialsSection.craft = {
  displayName: 'Testimonials Section',
  props: defaultProps,
  related: {
    settings: TestimonialsSectionSettings,
  },
};

export function TestimonialsSectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as TestimonialsSectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: TestimonialsSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: TestimonialsSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#F4F3F0'}
          onChange={(e) => setProp((props: TestimonialsSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: TestimonialsSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: TestimonialsSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t">
        <Label className="mb-3 block">Testimonials</Label>
        {props.testimonials?.map((testimonial, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div>
              <Label>Quote {index + 1}</Label>
              <Textarea
                value={testimonial.quote}
                onChange={(e) =>
                  setProp((props: TestimonialsSectionProps) => {
                    if (props.testimonials) {
                      props.testimonials[index].quote = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input
                value={testimonial.author}
                onChange={(e) =>
                  setProp((props: TestimonialsSectionProps) => {
                    if (props.testimonials) {
                      props.testimonials[index].author = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={testimonial.role}
                onChange={(e) =>
                  setProp((props: TestimonialsSectionProps) => {
                    if (props.testimonials) {
                      props.testimonials[index].role = e.target.value;
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
