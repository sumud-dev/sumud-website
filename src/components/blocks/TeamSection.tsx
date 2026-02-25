'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { CompactRichTextEditor } from '@/src/lib/tipTap-editor/CompactRichTextEditor';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { Mail, Linkedin, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  shortBio?: string;
  bio: string;
  email?: string;
  linkedin?: string;
  imageUrl?: string;
}

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
};

interface TeamSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  teamMembers?: TeamMember[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  showTooltipCard?: boolean; // Enable beautiful card tooltip (default: true)
  tooltipMaxWidth?: string; // Max width of tooltip card (default: 'max-w-sm')
  tooltipBioMaxHeight?: string; // Max height for bio section with scroll (default: 'max-h-32')
  showReadMoreIndicator?: boolean; // Show "read more" indicator on cards (default: true)
  readMoreIndicatorStyle?: 'icon' | 'icon-text'; // Style of indicator (default: 'icon-text')
  animateReadMoreIndicator?: boolean; // Animate read more indicator with bounce (default: true)
  bounceRepeatDelay?: number; // Delay in seconds between bounce cycles (default: 3)
  children?: React.ReactNode;
}

const defaultProps: TeamSectionProps = {
  title: 'Meet Our Team',
  subtitle: 'Dedicated to Palestinian Solidarity',
  description: 'Our diverse team brings together Finnish and Palestinian voices united in the pursuit of justice, peace, and human dignity.',
  teamMembers: [
    {
      name: 'Fatima Al-Zahra',
      role: 'Executive Director',
      shortBio: '15+ years in human rights advocacy',
      bio: 'Leading Sumud\'s mission with over 15 years of experience in human rights advocacy.',
      email: 'fatima@sumud.fi',
    },
    {
      name: 'Mikko Virtanen',
      role: 'Communications Director',
      shortBio: 'Building bridges through storytelling',
      bio: 'Building bridges between communities through storytelling and strategic communications.',
      email: 'mikko@sumud.fi',
    },
    {
      name: 'Rania Hamdan',
      role: 'Cultural Programs Coordinator',
      shortBio: 'Celebrating Palestinian culture',
      bio: 'Organizing events that celebrate Palestinian culture and foster cross-cultural understanding.',
      email: 'rania@sumud.fi',
    },
    {
      name: 'Jukka Nieminen',
      role: 'Advocacy Coordinator',
      shortBio: 'Advancing Palestinian rights',
      bio: 'Engaging with policymakers and civil society to advance Palestinian rights.',
      email: 'jukka@sumud.fi',
    },
  ],
  backgroundColor: '#ffffff',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
  showTooltipCard: true,
  tooltipMaxWidth: 'max-w-sm',
  tooltipBioMaxHeight: 'max-h-32',
  showReadMoreIndicator: true,
  readMoreIndicatorStyle: 'icon-text',
  animateReadMoreIndicator: true,
  bounceRepeatDelay: 3,
};

export const TeamSection = (props: TeamSectionProps) => {
  const {
    title,
    subtitle,
    description,
    teamMembers,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    showTooltipCard = true,
    tooltipMaxWidth = 'max-w-sm',
    tooltipBioMaxHeight = 'max-h-32',
    showReadMoreIndicator = true,
    readMoreIndicatorStyle = 'icon-text',
    animateReadMoreIndicator = true,
    bounceRepeatDelay = 3,
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
            <div 
              className="text-lg prose prose-lg mx-auto" 
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers?.map((member, index) => (
            <div 
              key={index}
              className="bg-linear-to-br from-[#F4F3F0] to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-100"
            >
              {/* Avatar - Fixed position */}
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shrink-0"
                style={{ 
                  backgroundColor: accentColor,
                  backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!member.imageUrl && member.name.charAt(0)}
              </div>

              {/* Info - Flexible space */}
              <div className="text-center mb-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-1" style={{ color: titleColor }}>
                  {member.name}
                </h3>
                <p className="text-sm font-semibold mb-2" style={{ color: accentColor }}>
                  {member.role}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 flex flex-col">
                      <p 
                        className="text-sm leading-relaxed flex-1 cursor-help" 
                        style={{ color: textColor }}
                      >
                        {member.shortBio ? stripHtml(member.shortBio) : stripHtml(member.bio).substring(0, 70) + (stripHtml(member.bio).length > 70 ? '...' : '')}
                      </p>
                      {showReadMoreIndicator && (
                        <motion.div 
                          className="flex items-center justify-center gap-1 mt-2 shrink-0"
                          animate={animateReadMoreIndicator ? {
                            y: [0, -3, 0, -3, 0],
                          } : {}}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: bounceRepeatDelay,
                            repeatType: "loop",
                            ease: "easeInOut",
                          }}
                        >
                          <Info size={14} style={{ color: accentColor }} />
                          {readMoreIndicatorStyle === 'icon-text' && (
                            <span className="text-xs font-medium" style={{ color: accentColor }}>
                              Read more
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {showTooltipCard ? (
                    <TooltipContent className={`p-0 bg-white border-0 shadow-2xl ${tooltipMaxWidth}`}>
                      <div className="rounded-lg overflow-hidden">
                        {/* Card Header with Image */}
                        <div className="relative h-32 shrink-0" style={{ backgroundColor: accentColor }}>
                          <div 
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                            style={{ 
                              backgroundColor: accentColor,
                              backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            {!member.imageUrl && member.name.charAt(0)}
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="pt-16 pb-6 px-6">
                          <div className="text-center mb-4 shrink-0">
                            <h4 className="text-lg font-bold mb-1" style={{ color: titleColor }}>
                              {member.name}
                            </h4>
                            <p className="text-sm font-semibold" style={{ color: accentColor }}>
                              {member.role}
                            </p>
                          </div>
                          
                          {/* Scrollable Bio Section */}
                          <div 
                            className={`${tooltipBioMaxHeight} overflow-y-auto mb-4 pr-2`}
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#d1d5db #f3f4f6',
                            }}
                          >
                            <p className="text-sm leading-relaxed text-gray-700">
                              {stripHtml(member.bio)}
                            </p>
                          </div>
                          
                          {/* Contact Info */}
                          {(member.email || member.linkedin) && (
                            <div className="flex justify-center gap-3 pt-4 border-t border-gray-100 shrink-0">
                              {member.email && (
                                <a 
                                  href={`mailto:${member.email}`}
                                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  style={{ color: accentColor }}
                                  title={member.email}
                                >
                                  <Mail size={18} />
                                </a>
                              )}
                              {member.linkedin && (
                                <a 
                                  href={member.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  style={{ color: accentColor }}
                                  title="LinkedIn Profile"
                                >
                                  <Linkedin size={18} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  ) : (
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm leading-relaxed">{stripHtml(member.bio)}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>

              {/* Contact Icons - Fixed position at bottom */}
              <div className="flex justify-center gap-3 mt-auto shrink-0">
                {member.email && (
                  <a 
                    href={`mailto:${member.email}`}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                    style={{ color: accentColor }}
                  >
                    <Mail size={16} />
                  </a>
                )}
                {member.linkedin && (
                  <a 
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                    style={{ color: accentColor }}
                  >
                    <Linkedin size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
};

TeamSection.craft = {
  displayName: 'Team Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: TeamSectionSettings,
  },
};

export function TeamSectionSettings() {
  const t = useTranslations('adminSettings.pageBuilder');
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as TeamSectionProps,
  }));

  const addTeamMember = () => {
    setProp((props: TeamSectionProps) => {
      if (!props.teamMembers) props.teamMembers = [];
      props.teamMembers.push({
        name: 'New Member',
        role: 'Role',
        shortBio: '',
        bio: 'Bio',
      });
    });
  };

  const removeTeamMember = (index: number) => {
    setProp((props: TeamSectionProps) => {
      if (props.teamMembers) {
        props.teamMembers.splice(index, 1);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('settings.title')}</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: TeamSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.subtitle')}</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: TeamSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.description')}</Label>
        <CompactRichTextEditor
          value={props.description || ''}
          onChange={(value) => setProp((props: TeamSectionProps) => (props.description = value))}
        />
      </div>

      <div>
        <Label>{t('settings.backgroundColor')}</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: TeamSectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.titleColor')}</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: TeamSectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>{t('settings.accentColor')}</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: TeamSectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t space-y-3">
        <h3 className="text-sm font-semibold">Tooltip Settings</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showTooltipCard"
            checked={props.showTooltipCard !== false}
            onChange={(e) => setProp((props: TeamSectionProps) => (props.showTooltipCard = e.target.checked))}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="showTooltipCard" className="cursor-pointer">
            Use Beautiful Card Tooltip
          </Label>
        </div>
        {props.showTooltipCard !== false && (
          <>
            <div>
              <Label>Tooltip Width</Label>
              <select
                value={props.tooltipMaxWidth || 'max-w-sm'}
                onChange={(e) => setProp((props: TeamSectionProps) => (props.tooltipMaxWidth = e.target.value))}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="max-w-xs">Extra Small (320px)</option>
                <option value="max-w-sm">Small (384px)</option>
                <option value="max-w-md">Medium (448px)</option>
                <option value="max-w-lg">Large (512px)</option>
              </select>
            </div>
            <div>
              <Label>Bio Max Height (Scroll if longer)</Label>
              <select
                value={props.tooltipBioMaxHeight || 'max-h-32'}
                onChange={(e) => setProp((props: TeamSectionProps) => (props.tooltipBioMaxHeight = e.target.value))}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="max-h-24">Small (96px)</option>
                <option value="max-h-32">Medium (128px)</option>
                <option value="max-h-40">Large (160px)</option>
                <option value="max-h-48">Extra Large (192px)</option>
                <option value="max-h-none">No Limit</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="pt-4 border-t space-y-3">
        <h3 className="text-sm font-semibold">Read More Indicator</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showReadMoreIndicator"
            checked={props.showReadMoreIndicator !== false}
            onChange={(e) => setProp((props: TeamSectionProps) => (props.showReadMoreIndicator = e.target.checked))}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="showReadMoreIndicator" className="cursor-pointer">
            Show Read More Hint
          </Label>
        </div>
        {props.showReadMoreIndicator !== false && (
          <>
            <div>
              <Label>Indicator Style</Label>
              <select
                value={props.readMoreIndicatorStyle || 'icon-text'}
                onChange={(e) => setProp((props: TeamSectionProps) => (props.readMoreIndicatorStyle = e.target.value as 'icon' | 'icon-text'))}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="icon">🔍 Icon Only</option>
                <option value="icon-text">🔍📝 Icon + Text</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="animateReadMoreIndicator"
                checked={props.animateReadMoreIndicator !== false}
                onChange={(e) => setProp((props: TeamSectionProps) => (props.animateReadMoreIndicator = e.target.checked))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="animateReadMoreIndicator" className="cursor-pointer">
                ✨ Bounce Animation
              </Label>
            </div>
            {props.animateReadMoreIndicator !== false && (
              <div>
                <Label>Bounce Frequency</Label>
                <select
                  value={props.bounceRepeatDelay || 3}
                  onChange={(e) => setProp((props: TeamSectionProps) => (props.bounceRepeatDelay = Number(e.target.value)))}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="1">⚡ Very Frequent (1s pause)</option>
                  <option value="2">🔄 Frequent (2s pause)</option>
                  <option value="3">⏱️ Moderate (3s pause)</option>
                  <option value="5">⏳ Occasional (5s pause)</option>
                  <option value="8">💤 Rare (8s pause)</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-3">
          <Label>{t('labels.items', { count: props.teamMembers?.length || 0 }) || 'Team Members'}</Label>
          <button
            onClick={addTeamMember}
            className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('actions.addMember') || 'Add Member'}
          </button>
        </div>
        {props.teamMembers?.map((member, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div className="flex justify-between items-center">
              <Label>{t('dynamicLabels.member', { index: index + 1 }) || `Member ${index + 1}`}</Label>
              <button
                onClick={() => removeTeamMember(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                {t('actions.remove') || 'Remove'}
              </button>
            </div>
            <div>
              <Label>{t('teamSection.name')} {index + 1}</Label>
              <Input
                value={member.name}
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].name = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>{t('teamSection.role')}</Label>
              <Input
                value={member.role}
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].role = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>{t('teamSection.shortBio') || 'Short Bio'} <span className="text-xs text-muted-foreground">(max 150 chars)</span></Label>
              <Textarea
                value={member.shortBio || ''}
                maxLength={150}
                rows={2}
                placeholder="Brief description shown on card"
                className="resize-y min-h-15"
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].shortBio = e.target.value;
                    }
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">{(member.shortBio || '').length}/150</p>
            </div>
            <div>
              <Label>{t('teamSection.bio') || 'Full Bio'} <span className="text-xs text-muted-foreground">(shown in tooltip)</span></Label>
              <CompactRichTextEditor
                value={member.bio || ''}
                onChange={(value) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].bio = value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>{t('teamSection.email')}</Label>
              <Input
                value={member.email || ''}
                placeholder={t('placeholders.email') || 'email@example.com'}
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].email = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>{t('labels.linkedinUrl') || 'LinkedIn URL'}</Label>
              <Input
                value={member.linkedin || ''}
                placeholder={t('placeholders.linkedinUrl') || 'https://linkedin.com/in/username'}
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].linkedin = e.target.value;
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
