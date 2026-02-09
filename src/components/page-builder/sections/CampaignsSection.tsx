"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useNode } from "@craftjs/core";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useCampaigns, getDescriptionText } from "@/src/lib/hooks/use-campaigns";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";

interface CampaignsSectionProps {
  title?: string;
  subtitle?: string;
  showCount?: number;
}

const defaultProps: CampaignsSectionProps = {
  title: "Active Campaigns",
  subtitle: "Join our initiatives to make a difference",
  showCount: 6,
};

export const CampaignsSection = (props: CampaignsSectionProps) => {
  const { title, subtitle, showCount } = props;
  const t = useTranslations('common');

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { data, isLoading } = useCampaigns({ limit: showCount });
  const campaigns = data?.data || [];

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`py-20 bg-white ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              {subtitle}
            </p>
          )}
          <div className="w-24 h-1 bg-[#781D32] mx-auto rounded-full" />
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(showCount)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/campaigns/${campaign.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                    {campaign.featuredImage && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={campaign.featuredImage}
                          alt={campaign.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-3">
                      {campaign.campaignType && (
                        <Badge variant="outline" className="text-[#781D32]">
                          {campaign.campaignType}
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#781D32] transition-colors">
                        {campaign.title}
                      </h3>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {getDescriptionText(campaign.description)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                        <Target className="h-4 w-4" />
                        {campaign.status || 'Active'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-[#781D32] hover:text-[#5C1625] font-semibold group"
          >
            {t('viewAllCampaigns')}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export const CampaignsSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    showCount,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    showCount: node.data?.props?.showCount,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: CampaignsSectionProps) => (props.title = e.target.value))
          }
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Textarea
          value={subtitle}
          onChange={(e) =>
            setProp((props: CampaignsSectionProps) => (props.subtitle = e.target.value))
          }
          rows={2}
        />
      </div>
      <div>
        <Label>Number of Campaigns to Show</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={showCount}
          onChange={(e) =>
            setProp(
              (props: CampaignsSectionProps) => (props.showCount = parseInt(e.target.value))
            )
          }
        />
      </div>
    </div>
  );
};

CampaignsSection.craft = {
  displayName: "Campaigns Section",
  props: defaultProps,
  related: {
    settings: CampaignsSectionSettings,
  },
};
