"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useNode } from "@craftjs/core";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useEvents } from "@/src/lib/hooks/use-events";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";

interface EventsSectionProps {
  title?: string;
  showCount?: number;
}

const defaultProps: EventsSectionProps = {
  title: "Upcoming Events",
  showCount: 3,
};

export const EventsSection = (props: EventsSectionProps) => {
  const { title, showCount } = props;
  const t = useTranslations('common');

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { data, isLoading } = useEvents({
    status: "published",
    limit: showCount,
  });
  const events = data?.data || [];

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`py-20 bg-gray-50 ${selected ? "ring-2 ring-blue-500" : ""}`}
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
          <div className="w-24 h-1 bg-[#781D32] mx-auto rounded-full" />
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(showCount)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/events/${event.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                    {event.featuredImage && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={event.featuredImage}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-3">
                      {event.categories && (
                        <Badge variant="outline" className="text-[#55613C]">
                          {Array.isArray(event.categories) ? event.categories[0] : event.categories}
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#55613C] transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {event.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
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
            href="/events"
            className="inline-flex items-center gap-2 text-[#55613C] hover:text-[#3E442B] font-semibold group"
          >
            {t('viewAllEvents')}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export const EventsSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    showCount,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    showCount: node.data?.props?.showCount,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: EventsSectionProps) => (props.title = e.target.value))
          }
        />
      </div>
      <div>
        <Label>Number of Events to Show</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={showCount}
          onChange={(e) =>
            setProp(
              (props: EventsSectionProps) => (props.showCount = parseInt(e.target.value))
            )
          }
        />
      </div>
    </div>
  );
};

EventsSection.craft = {
  displayName: "Events Section",
  props: defaultProps,
  related: {
    settings: EventsSectionSettings,
  },
};