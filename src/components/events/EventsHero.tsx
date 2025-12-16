"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, MapPin, Users } from "lucide-react";

export interface EventsHeroProps {
  totalEvents: number;
  isLoading: boolean;
}

/**
 * Hero section for the events page.
 * Displays the page title, description, and quick stats badges.
 */
export function EventsHero({ totalEvents, isLoading }: EventsHeroProps) {
  return (
    <section className="relative overflow-hidden py-20 bg-linear-to-br from-[#1A1D14] via-[#2D3320] to-[#3E442B]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(120,29,50,0.1)_0%,transparent_50%,rgba(85,97,60,0.1)_100%)]" />
      <div className="absolute inset-0 glass-strong gpu-accelerated opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <Calendar className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl">
              Events Calendar
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 font-medium drop-shadow-lg">
            Join us for cultural events, activism campaigns, educational
            workshops, and community gatherings that strengthen our solidarity
            movement.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-base">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full border border-white/30 shadow-xl">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">
                {!isLoading && `${totalEvents} events`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full border border-white/30 shadow-xl">
              <MapPin className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">Global & Virtual</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full border border-white/30 shadow-xl">
              <Users className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">Community Driven</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
