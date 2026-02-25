'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNode } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import { CompactRichTextEditor } from '@/src/lib/tipTap-editor/CompactRichTextEditor';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

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
  showContactCTA?: boolean;
  contactCTAQuestionText?: string;
  contactCTALinkText?: string;
  contactCTALink?: string;
  children?: React.ReactNode;
}

const defaultProps: FAQSectionProps = {
  title: 'Frequently Asked Questions',
  subtitle: 'Got Questions? We Have Answers',
  contactCTAQuestionText: 'Still have questions?',
  contactCTALinkText: 'Contact us',
  contactCTALink: '/contact',
  faqs: [
    {
      question: 'What is Sumud - Finnish Palestine Network?',
      answer: '<p>Sumud is a Finnish solidarity organization dedicated to supporting Palestinian rights through <strong>education</strong>, <strong>advocacy</strong>, and <strong>community building</strong>. We work to raise awareness about Palestinian history, culture, and the ongoing struggle for justice and self-determination.</p>',
    },
    {
      question: 'How can I get involved with Sumud?',
      answer: '<p>There are many ways to get involved!</p><ul><li>Become a member</li><li>Volunteer for our events</li><li>Participate in advocacy campaigns</li><li>Attend our educational programs</li><li>Support us financially</li></ul><p>Visit our <a href="/get-involved">Get Involved page</a> for more information.</p>',
    },
    {
      question: 'Does Sumud organize cultural events?',
      answer: '<p>Yes! We regularly organize cultural events including:</p><ul><li>Film screenings</li><li>Art exhibitions</li><li>Music performances</li><li>Traditional Palestinian celebrations</li></ul><p>These events help share Palestinian culture with the Finnish community and build cross-cultural understanding.</p>',
    },
    {
      question: 'How does Sumud support Palestinians?',
      answer: '<p>We support Palestinians through various initiatives:</p><ul><li><strong>Advocacy</strong> for policy changes</li><li><strong>Educational programs</strong> to raise awareness</li><li><strong>Cultural events</strong> that celebrate Palestinian heritage</li><li><strong>Partnerships</strong> with Palestinian organizations</li><li><strong>Solidarity campaigns</strong> that amplify Palestinian voices</li></ul>',
    },
    {
      question: 'Is Sumud affiliated with any political party?',
      answer: '<p><strong>No</strong>, Sumud is an independent non-partisan organization. While we engage in political advocacy for Palestinian rights, we are not affiliated with any political party in Finland or elsewhere. Our focus is on <em>human rights</em> and <em>international law</em>.</p>',
    },
    {
      question: 'Can I volunteer if I\'m not Palestinian or Finnish?',
      answer: '<p><strong>Absolutely!</strong> Sumud welcomes volunteers from all backgrounds who share our commitment to justice and human rights. We believe solidarity transcends national and ethnic boundaries.</p>',
    },
  ],
  backgroundColor: '#F4F3F0',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
  showContactCTA: true,
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
    showContactCTA,
    contactCTAQuestionText,
    contactCTALinkText,
    contactCTALink,
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  const { children } = props;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations();

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
                    <div 
                      className="leading-relaxed prose prose-sm max-w-none [&>p]:my-2 [&>p]:min-h-[1.5em] [&>p:empty]:min-h-[1.5em] [&_p:has(br:only-child)]:min-h-[1.5em]"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        {showContactCTA && (
          <div className="mt-12 text-center">
            <p className="text-lg" style={{ color: textColor }}>
              {contactCTAQuestionText || t('faq.stillHaveQuestions')}{' '}
              <Link 
                href={contactCTALink || '/contact'}
                className="font-bold hover:underline"
                style={{ color: accentColor }}
              >
                {contactCTALinkText || t('faq.contactUs')}
              </Link>
            </p>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

FAQSection.craft = {
  displayName: 'FAQ Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: FAQSectionSettings,
  },
};

export function FAQSectionSettings() {
  const t = useTranslations('adminSettings.pageBuilder');
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as FAQSectionProps,
  }));

  const addFAQ = () => {
    setProp((props: FAQSectionProps) => {
      if (!props.faqs) {
        props.faqs = [];
      }
      props.faqs.push({
        question: `Question ${props.faqs.length + 1}`,
        answer: 'Your answer here',
      });
    });
  };

  const removeFAQ = (index: number) => {
    setProp((props: FAQSectionProps) => {
      if (props.faqs) {
        props.faqs.splice(index, 1);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('settings.title')}</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.subtitle')}</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.backgroundColor')}</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#F4F3F0'}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.titleColor')}</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.accentColor')}</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: FAQSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>{t('faqSection.showContactCTA') || 'Show Contact Link'}</Label>
          <p className="text-xs text-muted-foreground">
            {t('faqSection.showContactCTADescription') || 'Display "Still have questions? Contact us" at the bottom'}
          </p>
        </div>
        <Checkbox
          checked={props.showContactCTA ?? true}
          onCheckedChange={(checked) => setProp((props: FAQSectionProps) => (props.showContactCTA = checked as boolean))}
        />
      </div>

      {props.showContactCTA && (
        <>
          <div>
            <Label>{t('faqSection.contactQuestionText') || 'Contact Question Text'}</Label>
            <Input
              value={props.contactCTAQuestionText || ''}
              onChange={(e) => setProp((props: FAQSectionProps) => (props.contactCTAQuestionText = e.target.value))}
              placeholder={t('faq.stillHaveQuestions') || 'Still have questions?'}
            />
          </div>

          <div>
            <Label>{t('faqSection.contactLinkText') || 'Contact Link Text'}</Label>
            <Input
              value={props.contactCTALinkText || ''}
              onChange={(e) => setProp((props: FAQSectionProps) => (props.contactCTALinkText = e.target.value))}
              placeholder={t('faq.contactUs') || 'Contact us'}
            />
          </div>

          <div>
            <Label>{t('faqSection.contactLink') || 'Contact Link URL'}</Label>
            <Input
              value={props.contactCTALink || ''}
              onChange={(e) => setProp((props: FAQSectionProps) => (props.contactCTALink = e.target.value))}
              placeholder="/contact"
            />
          </div>
        </>
      )}

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <Label>{t('faqSection.items')}</Label>
          <Button onClick={addFAQ} size="sm" variant="outline">
            {t('faqSection.addItem') || 'Add FAQ'}
          </Button>
        </div>
        {props.faqs?.map((faq, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t('faqSection.item')} {index + 1}
              </Label>
              <Button 
                onClick={() => removeFAQ(index)} 
                size="sm" 
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label>{t('faqSection.question')}</Label>
              <Input
                value={faq.question}
                onChange={(e) =>
                  setProp((props: FAQSectionProps) => {
                    if (props.faqs) {
                      props.faqs[index].question = e.target.value;
                    }
                  })
                }
                placeholder={t('faqSection.questionPlaceholder') || 'Enter your question'}
              />
            </div>
            <div>
              <Label>{t('faqSection.answer')}</Label>
              <CompactRichTextEditor
                value={faq.answer}
                onChange={(value) =>
                  setProp((props: FAQSectionProps) => {
                    if (props.faqs) {
                      props.faqs[index].answer = value;
                    }
                  })
                }
                placeholder={t('faqSection.answerPlaceholder') || 'Enter your answer with formatting, links, images, etc.'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
