'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';

interface ContactSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  showContactInfo?: boolean;
  showForm?: boolean;
  titleColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

const defaultProps: ContactSectionProps = {
  title: 'Get In Touch',
  subtitle: 'Contact Us',
  description: 'Have questions or want to get involved? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
  email: 'info@sumud.fi',
  phone: '+358 40 123 4567',
  address: 'Helsinki, Finland',
  showContactInfo: true,
  showForm: true,
  titleColor: '#3E442B',
  textColor: '#4B5563',
  buttonColor: '#781D32',
  buttonTextColor: '#ffffff',
};

export const ContactSection = (props: ContactSectionProps) => {
  const {
    title,
    subtitle,
    description,
    email,
    phone,
    address,
    showContactInfo,
    showForm,
    titleColor,
    textColor,
    buttonColor,
    buttonTextColor,
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-12 ${showForm ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {/* Left side - Content */}
          <div>
            {subtitle && (
              <p className="text-[#781D32] font-semibold text-sm uppercase tracking-wide mb-2">
                {subtitle}
              </p>
            )}
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: titleColor }}>
              {title}
            </h2>
            
            <p className="text-lg mb-8" style={{ color: textColor }}>
              {description}
            </p>

            {showContactInfo && (
              <div className="space-y-6">
                {email && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#781D32]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-[#781D32]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E442B] mb-1">Email</h3>
                      <a href={`mailto:${email}`} className="text-gray-600 hover:text-[#781D32]">
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#55613C]/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-[#55613C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E442B] mb-1">Phone</h3>
                      <a href={`tel:${phone}`} className="text-gray-600 hover:text-[#55613C]">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#3E442B]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-[#3E442B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E442B] mb-1">Address</h3>
                      <p className="text-gray-600">{address}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Contact Form */}
          {showForm && (
          <div className="bg-gradient-to-br from-[#F4F3F0] to-white p-8 rounded-2xl shadow-lg">
            <form className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-[#3E442B]">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#3E442B]">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-[#3E442B]">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-[#3E442B]">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  rows={5}
                  className="mt-1"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full"
                size="lg"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                }}
              >
                Send Message
              </Button>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings panel
export const ContactSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    description,
    email,
    phone,
    address,
    showContactInfo,
    showForm,
    titleColor,
    textColor,
    buttonColor,
    buttonTextColor,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    description: node.data?.props?.description,
    email: node.data?.props?.email,
    phone: node.data?.props?.phone,
    address: node.data?.props?.address,
    showContactInfo: node.data?.props?.showContactInfo,
    showForm: node.data?.props?.showForm,
    titleColor: node.data?.props?.titleColor,
    textColor: node.data?.props?.textColor,
    buttonColor: node.data?.props?.buttonColor,
    buttonTextColor: node.data?.props?.buttonTextColor,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setProp((props: ContactSectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setProp((props: ContactSectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setProp((props: ContactSectionProps) => (props.description = e.target.value))}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showContactInfo"
          checked={showContactInfo}
          onChange={(e) => setProp((props: ContactSectionProps) => (props.showContactInfo = e.target.checked))}
          className="rounded"
        />
        <Label htmlFor="showContactInfo">Show Contact Information</Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showForm"
          checked={showForm}
          onChange={(e) => setProp((props: ContactSectionProps) => (props.showForm = e.target.checked))}
          className="rounded"
        />
        <Label htmlFor="showForm">Show Contact Form</Label>
      </div>

      {showContactInfo && (
        <>
          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setProp((props: ContactSectionProps) => (props.email = e.target.value))}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setProp((props: ContactSectionProps) => (props.phone = e.target.value))}
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setProp((props: ContactSectionProps) => (props.address = e.target.value))}
            />
          </div>
        </>
      )}

      <div>
        <Label>Title Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={titleColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.titleColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={titleColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.titleColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.textColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.textColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Button Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={buttonColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.buttonColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={buttonColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.buttonColor = e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Button Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={buttonTextColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.buttonTextColor = e.target.value))}
            className="w-20"
          />
          <Input
            type="text"
            value={buttonTextColor}
            onChange={(e) => setProp((props: ContactSectionProps) => (props.buttonTextColor = e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

ContactSection.craft = {
  displayName: 'Contact Section',
  props: defaultProps,
  related: {
    settings: ContactSectionSettings,
  },
};
