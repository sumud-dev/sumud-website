'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Mail, Linkedin } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  email?: string;
  linkedin?: string;
  imageUrl?: string;
}

interface TeamSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  teamMembers?: TeamMember[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
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
      bio: 'Leading Sumud\'s mission with over 15 years of experience in human rights advocacy.',
      email: 'fatima@sumud.fi',
    },
    {
      name: 'Mikko Virtanen',
      role: 'Communications Director',
      bio: 'Building bridges between communities through storytelling and strategic communications.',
      email: 'mikko@sumud.fi',
    },
    {
      name: 'Rania Hamdan',
      role: 'Cultural Programs Coordinator',
      bio: 'Organizing events that celebrate Palestinian culture and foster cross-cultural understanding.',
      email: 'rania@sumud.fi',
    },
    {
      name: 'Jukka Nieminen',
      role: 'Advocacy Coordinator',
      bio: 'Engaging with policymakers and civil society to advance Palestinian rights.',
      email: 'jukka@sumud.fi',
    },
  ],
  backgroundColor: '#ffffff',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
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
            <p className="text-lg" style={{ color: textColor }}>
              {description}
            </p>
          )}
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers?.map((member, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-[#F4F3F0] to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-[400px]"
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

              {/* Info - Flexible space with fixed height sections */}
              <div className="text-center mb-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-1 line-clamp-2 h-[3.5rem]" style={{ color: titleColor }}>
                  {member.name}
                </h3>
                <p className="text-sm font-semibold mb-2 line-clamp-2 h-[2.5rem]" style={{ color: accentColor }}>
                  {member.role}
                </p>
                <p className="text-sm leading-relaxed line-clamp-4 flex-1" style={{ color: textColor }}>
                  {member.bio}
                </p>
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
        bio: 'Bio',
      });
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
        <Textarea
          value={props.description || ''}
          onChange={(e) => setProp((props: TeamSectionProps) => (props.description = e.target.value))}
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
              <Label>{t('teamSection.bio')}</Label>
              <Textarea
                value={member.bio}
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].bio = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>{t('teamSection.email')}</Label>
              <Input
                value={member.email || ''}
                onChange={(e) =>
                  setProp((props: TeamSectionProps) => {
                    if (props.teamMembers) {
                      props.teamMembers[index].email = e.target.value;
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
