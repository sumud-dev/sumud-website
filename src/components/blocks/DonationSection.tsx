'use client';

import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Link } from '@/src/i18n/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  Check,
  Loader2,
  Shield,
  ChevronRight,
  HandHeart,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { cn } from '@/src/lib/utils/utils';

interface DonationAmount {
  value: number;
  label?: string;
}

interface DonationSectionProps {
  // Section title
  sectionTitle?: string;
  
  // Donation type options
  monthlyTitle?: string;
  monthlyDescription?: string;
  monthlyBadge?: string;
  oneTimeTitle?: string;
  oneTimeDescription?: string;
  
  // Amount selection
  amountTitle?: string;
  customAmountLabel?: string;
  donationAmounts?: number[];
  currency?: string;
  
  // Impact section
  impactTitle?: string;
  impactMonthlyText?: string;
  impactOneTimeText?: string;
  
  // Buttons
  monthlyButtonText?: string;
  oneTimeButtonText?: string;
  processingText?: string;
  
  // Trust section
  trustText?: string;
  
  // Membership CTA
  membershipQuestion?: string;
  membershipCTA?: string;
  membershipLink?: string;
  
  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

const defaultProps: DonationSectionProps = {
  sectionTitle: 'Choose Your Support Type',
  
  monthlyTitle: 'Monthly Support',
  monthlyDescription: 'Provide sustained support with a monthly contribution that helps us plan ahead.',
  monthlyBadge: 'Recommended',
  oneTimeTitle: 'One-Time Donation',
  oneTimeDescription: 'Make a single contribution to support our ongoing work.',
  
  amountTitle: 'Select Amount',
  customAmountLabel: 'Custom Amount',
  donationAmounts: [15, 25, 50, 100, 250],
  currency: '€',
  
  impactTitle: 'Your Impact',
  impactMonthlyText: 'per month will help sustain our programs and community initiatives.',
  impactOneTimeText: 'will directly support our campaigns and advocacy work.',
  
  monthlyButtonText: 'Support Monthly',
  oneTimeButtonText: 'Donate Now',
  processingText: 'Processing...',
  
  trustText: 'Secure payment processing. Your data is protected.',
  
  membershipQuestion: 'Want full membership benefits?',
  membershipCTA: 'Learn about membership options',
  membershipLink: '/membership',
  
  primaryColor: '#781D32',
  secondaryColor: '#55613C',
  accentColor: '#3E442B',
};

export const DonationSection = (props: DonationSectionProps) => {
  const mergedProps = { ...defaultProps, ...props };
  const {
    sectionTitle,
    monthlyTitle,
    monthlyDescription,
    monthlyBadge,
    oneTimeTitle,
    oneTimeDescription,
    amountTitle,
    customAmountLabel,
    donationAmounts,
    currency,
    impactTitle,
    impactMonthlyText,
    impactOneTimeText,
    monthlyButtonText,
    oneTimeButtonText,
    processingText,
    trustText,
    membershipQuestion,
    membershipCTA,
    membershipLink,
    primaryColor,
    secondaryColor,
    accentColor,
  } = mergedProps;

  const {
    connectors: { connect, drag },
  } = useNode();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState<'one_time' | 'monthly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async () => {
    const amount = selectedAmount === null ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) return;
    
    setIsLoading(true);
    // Simulate donation processing
    setTimeout(() => {
      setIsLoading(false);
      // Handle success state
    }, 2000);
  };

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }}>
      <Card className="glass-strong blur-transition border-glass-glow shadow-glass-xl gpu-accelerated rounded-2xl">
        <CardContent className="p-8">
          {/* Donation Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: accentColor }}>
              {sectionTitle}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setDonationType('monthly')}
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all duration-200 text-left blur-transition gpu-accelerated',
                  donationType === 'monthly'
                    ? 'glass-strong border-glass-glow shadow-glass-xl ring-2'
                    : 'glass-medium border-glass-glow shadow-glass-lg hover:shadow-glass-xl hover:glass-hover-intense'
                )}
                style={donationType === 'monthly' ? { '--tw-ring-color': `${primaryColor}30` } as React.CSSProperties : {}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  {donationType === 'monthly' && (
                    <Check className="h-5 w-5" style={{ color: primaryColor }} />
                  )}
                </div>
                <h3 className="font-bold mb-2" style={{ color: accentColor }}>
                  {monthlyTitle}
                </h3>
                <p className="text-sm text-gray-600">{monthlyDescription}</p>
                <Badge className="mt-3 text-white text-xs" style={{ backgroundColor: primaryColor }}>
                  {monthlyBadge}
                </Badge>
              </button>

              <button
                onClick={() => setDonationType('one_time')}
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all duration-200 text-left blur-transition gpu-accelerated',
                  donationType === 'one_time'
                    ? 'glass-strong border-glass-glow shadow-glass-xl ring-2'
                    : 'glass-medium border-glass-glow shadow-glass-lg hover:shadow-glass-xl hover:glass-hover-intense'
                )}
                style={donationType === 'one_time' ? { '--tw-ring-color': `${primaryColor}30` } as React.CSSProperties : {}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${accentColor})` }}
                  >
                    <HandHeart className="h-6 w-6 text-white" />
                  </div>
                  {donationType === 'one_time' && (
                    <Check className="h-5 w-5" style={{ color: primaryColor }} />
                  )}
                </div>
                <h3 className="font-bold mb-2" style={{ color: accentColor }}>
                  {oneTimeTitle}
                </h3>
                <p className="text-sm text-gray-600">{oneTimeDescription}</p>
              </button>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: accentColor }}>
              {amountTitle}
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {donationAmounts?.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={cn(
                    'py-4 px-4 rounded-xl border-2 font-semibold transition-all duration-200',
                    selectedAmount === amount
                      ? 'shadow-md'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  )}
                  style={selectedAmount === amount ? { 
                    borderColor: primaryColor, 
                    backgroundColor: `${primaryColor}08`,
                    color: primaryColor 
                  } : {}}
                >
                  {currency}{amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <button
                onClick={() => setSelectedAmount(null)}
                className={cn(
                  'w-full py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 mb-3',
                  selectedAmount === null
                    ? ''
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
                style={selectedAmount === null ? { 
                  borderColor: primaryColor, 
                  backgroundColor: `${primaryColor}08`,
                  color: primaryColor 
                } : {}}
              >
                {customAmountLabel}
              </button>

              {selectedAmount === null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {currency}
                    </span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 outline-none transition-all duration-200 text-lg font-medium"
                      style={{ 
                        '--tw-ring-color': `${primaryColor}20`,
                      } as React.CSSProperties}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Impact Preview */}
          {(selectedAmount || customAmount) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-2xl border"
              style={{ backgroundColor: `${secondaryColor}08`, borderColor: `${secondaryColor}20` }}
            >
              <h4 className="font-semibold mb-2" style={{ color: accentColor }}>
                {impactTitle}
              </h4>
              <p className="text-sm text-gray-600">
                {currency}{selectedAmount || customAmount}{' '}
                {donationType === 'monthly' ? impactMonthlyText : impactOneTimeText}
              </p>
            </motion.div>
          )}

          {/* Donate Button */}
          <Button
            onClick={handleDonate}
            disabled={isLoading || (!selectedAmount && !customAmount)}
            size="lg"
            className="w-full text-white h-14 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {processingText}
              </>
            ) : (
              <>
                <Heart className="mr-2 h-5 w-5" />
                {donationType === 'monthly' ? monthlyButtonText : oneTimeButtonText}
              </>
            )}
          </Button>

          {/* Trust Badge */}
          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2" style={{ color: secondaryColor }} />
              <span>{trustText}</span>
            </div>
          </div>

          {/* Membership CTA */}
          <div 
            className="mt-6 p-4 rounded-xl border"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08)`,
              borderColor: `${primaryColor}20`
            }}
          >
            <p className="text-sm text-gray-700 mb-2">
              <strong>{membershipQuestion}</strong>
            </p>
            <Link
              href={membershipLink || '/membership'}
              className="text-sm font-medium inline-flex items-center transition-colors hover:opacity-80"
              style={{ color: primaryColor }}
            >
              {membershipCTA}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Panel
export const DonationSectionSettings = () => {
  const {
    actions: { setProp },
    ...props
  } = useNode((node) => ({
    sectionTitle: node.data?.props?.sectionTitle,
    monthlyTitle: node.data?.props?.monthlyTitle,
    monthlyDescription: node.data?.props?.monthlyDescription,
    monthlyBadge: node.data?.props?.monthlyBadge,
    oneTimeTitle: node.data?.props?.oneTimeTitle,
    oneTimeDescription: node.data?.props?.oneTimeDescription,
    amountTitle: node.data?.props?.amountTitle,
    customAmountLabel: node.data?.props?.customAmountLabel,
    donationAmounts: node.data?.props?.donationAmounts,
    currency: node.data?.props?.currency,
    impactTitle: node.data?.props?.impactTitle,
    impactMonthlyText: node.data?.props?.impactMonthlyText,
    impactOneTimeText: node.data?.props?.impactOneTimeText,
    monthlyButtonText: node.data?.props?.monthlyButtonText,
    oneTimeButtonText: node.data?.props?.oneTimeButtonText,
    processingText: node.data?.props?.processingText,
    trustText: node.data?.props?.trustText,
    membershipQuestion: node.data?.props?.membershipQuestion,
    membershipCTA: node.data?.props?.membershipCTA,
    membershipLink: node.data?.props?.membershipLink,
    primaryColor: node.data?.props?.primaryColor,
    secondaryColor: node.data?.props?.secondaryColor,
    accentColor: node.data?.props?.accentColor,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label className="text-sm font-medium">Section Title</Label>
        <Input
          value={props.sectionTitle || ''}
          onChange={(e) => setProp((p: DonationSectionProps) => (p.sectionTitle = e.target.value))}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Monthly Option</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              value={props.monthlyTitle || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.monthlyTitle = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Input
              value={props.monthlyDescription || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.monthlyDescription = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Badge</Label>
            <Input
              value={props.monthlyBadge || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.monthlyBadge = e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">One-Time Option</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              value={props.oneTimeTitle || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.oneTimeTitle = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Input
              value={props.oneTimeDescription || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.oneTimeDescription = e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Amount Selection</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              value={props.amountTitle || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.amountTitle = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Custom Amount Label</Label>
            <Input
              value={props.customAmountLabel || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.customAmountLabel = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Currency Symbol</Label>
            <Input
              value={props.currency || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.currency = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Amounts (comma separated)</Label>
            <Input
              value={props.donationAmounts?.join(', ') || ''}
              onChange={(e) => {
                const amounts = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                setProp((p: DonationSectionProps) => (p.donationAmounts = amounts));
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Impact Section</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              value={props.impactTitle || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.impactTitle = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Monthly Text</Label>
            <Input
              value={props.impactMonthlyText || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.impactMonthlyText = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">One-Time Text</Label>
            <Input
              value={props.impactOneTimeText || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.impactOneTimeText = e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Buttons</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Monthly Button</Label>
            <Input
              value={props.monthlyButtonText || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.monthlyButtonText = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">One-Time Button</Label>
            <Input
              value={props.oneTimeButtonText || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.oneTimeButtonText = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Processing Text</Label>
            <Input
              value={props.processingText || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.processingText = e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Trust & CTA</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Trust Text</Label>
            <Input
              value={props.trustText || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.trustText = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Membership Question</Label>
            <Input
              value={props.membershipQuestion || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.membershipQuestion = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Membership CTA</Label>
            <Input
              value={props.membershipCTA || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.membershipCTA = e.target.value))}
            />
          </div>
          <div>
            <Label className="text-xs">Membership Link</Label>
            <Input
              value={props.membershipLink || ''}
              onChange={(e) => setProp((p: DonationSectionProps) => (p.membershipLink = e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Colors</h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.primaryColor || '#781D32'}
                onChange={(e) => setProp((p: DonationSectionProps) => (p.primaryColor = e.target.value))}
                className="w-12 h-8"
              />
              <Input
                value={props.primaryColor || ''}
                onChange={(e) => setProp((p: DonationSectionProps) => (p.primaryColor = e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.secondaryColor || '#55613C'}
                onChange={(e) => setProp((p: DonationSectionProps) => (p.secondaryColor = e.target.value))}
                className="w-12 h-8"
              />
              <Input
                value={props.secondaryColor || ''}
                onChange={(e) => setProp((p: DonationSectionProps) => (p.secondaryColor = e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.accentColor || '#3E442B'}
                onChange={(e) => setProp((p: DonationSectionProps) => (p.accentColor = e.target.value))}
                className="w-12 h-8"
              />
              <Input
                value={props.accentColor || ''}
                onChange={(e) => setProp((p: DonationSectionProps) => (p.accentColor = e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DonationSection.craft = {
  displayName: 'Donation Section',
  props: defaultProps,
  related: {
    settings: DonationSectionSettings,
  },
};
