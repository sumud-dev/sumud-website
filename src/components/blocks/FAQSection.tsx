'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
}

const defaultProps: FAQSectionProps = {
  title: 'Frequently Asked Questions',
  subtitle: 'Got Questions? We Have Answers',
  faqs: [
    {
      question: 'What is Sumud - Finnish Palestine Network?',
      answer: 'Sumud is a Finnish solidarity organization dedicated to supporting Palestinian rights through education, advocacy, and community building. We work to raise awareness about Palestinian history, culture, and the ongoing struggle for justice and self-determination.',
    },
    {
      question: 'How can I get involved with Sumud?',
      answer: 'There are many ways to get involved! You can become a member, volunteer for our events, participate in advocacy campaigns, attend our educational programs, or support us financially. Visit our "Get Involved" page for more information.',
    },
    {
      question: 'Does Sumud organize cultural events?',
      answer: 'Yes! We regularly organize cultural events including film screenings, art exhibitions, music performances, and traditional Palestinian celebrations. These events help share Palestinian culture with the Finnish community and build cross-cultural understanding.',
    },
    {
      question: 'How does Sumud support Palestinians?',
      answer: 'We support Palestinians through various initiatives: advocacy for policy changes, educational programs to raise awareness, cultural events that celebrate Palestinian heritage, partnerships with Palestinian organizations, and solidarity campaigns that amplify Palestinian voices.',
    },
    {
      question: 'Is Sumud affiliated with any political party?',
      answer: 'No, Sumud is an independent non-partisan organization. While we engage in political advocacy for Palestinian rights, we are not affiliated with any political party in Finland or elsewhere. Our focus is on human rights and international law.',
    },
    {
      question: 'Can I volunteer if I\'m not Palestinian or Finnish?',
      answer: 'Absolutely! Sumud welcomes volunteers from all backgrounds who share our commitment to justice and human rights. We believe solidarity transcends national and ethnic boundaries.',
    },
  ],
  backgroundColor: '#F4F3F0',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
};

export const FAQSection = (props: FAQSectionProps) => {
  const {
    title,
    subtitle,
    faqs,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto">
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

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs?.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all"
              >
                <button
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <h3 className="text-lg font-bold pr-8" style={{ color: titleColor }}>
                    {faq.question}
                  </h3>
                  <div 
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isOpen ? accentColor : '#F4F3F0', color: isOpen ? 'white' : accentColor }}
                  >
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {isOpen && (
                  <div 
                    className="px-6 pb-6 pt-0"
                    style={{ color: textColor }}
                  >
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg" style={{ color: textColor }}>
            Still have questions?{' '}
            <Link 
              href="/contact" 
              className="font-bold hover:underline"
              style={{ color: accentColor }}
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

FAQSection.craft = {
  displayName: 'FAQ Section',
  props: defaultProps,
  related: {
    settings: FAQSectionSettings,
  },
};

export function FAQSectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as FAQSectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#F4F3F0'}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t">
        <Label className="mb-3 block">FAQ Items</Label>
        {props.faqs?.map((faq, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div>
              <Label>Question {index + 1}</Label>
              <Input
                value={faq.question}
                onChange={(e) =>
                  setProp((props: FAQSectionProps) => {
                    if (props.faqs) {
                      props.faqs[index].question = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={faq.answer}
                onChange={(e) =>
                  setProp((props: FAQSectionProps) => {
                    if (props.faqs) {
                      props.faqs[index].answer = e.target.value;
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
