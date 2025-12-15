"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

/**
 * Palestinian Heritage Hero Section
 * Inspired by art gallery design with Palestinian cultural elements
 * Features:
 * - Large, bold typography in earthy tones
 * - Authentic olive branch image on decorative Palestinian embroidery plate
 * - Warm, cultural color palette
 */

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 1, ease: "easeOut" },
};

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const PalestinianHeritageHero: React.FC = () => {
  const t = useTranslations("homepage.hero");
  const tCommon = useTranslations("common");
  
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#F4F3F0] via-[#FAF9F6] to-[#F0EDE5] overflow-hidden flex items-center">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-[#55613C] rounded-full" />
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-[#781D32] rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#3E442B] rounded-full" />
      </div>

      {/* Main content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text Content */}
          <motion.div
            className="space-y-8 lg:space-y-12 text-center lg:text-left"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Small decorative element above heading */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center lg:justify-start"
            >
              <div className="w-16 h-1 bg-gradient-to-r from-[#55613C] via-[#781D32] to-[#55613C] rounded-full" />
            </motion.div>

            {/* Main heading - large and bold */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              variants={fadeInScale}
            >
              <span className="block text-[#3E442B] mb-2">{t("title")}</span>
              <span className="block text-[#55613C]">{t("subtitle")}</span>
            </motion.h1>

            {/* Elegant tagline */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl font-serif italic text-[#55613C] leading-relaxed"
              variants={fadeInUp}
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              {t("description")}
            </motion.p>

            {/* Decorative divider */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center lg:justify-start items-center space-x-4"
            >
              <div className="w-12 h-px bg-[#55613C] opacity-40" />
              <div className="w-2 h-2 bg-[#781D32] rounded-full" />
              <div className="w-12 h-px bg-[#55613C] opacity-40" />
            </motion.div>

            {/* Description paragraph */}
            <motion.p
              className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              variants={fadeInUp}
            >
              {t("tagline")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={fadeInUp}
            >
              <Link href="/join" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#781D32] hover:bg-[#5C1625] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  {t("joinButton")}
                  <Heart className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </Link>

              <Link href="https://shop.sumud.fi" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#3E442B] text-[#3E442B] hover:bg-[#3E442B] hover:text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  {t("learnButton")}
                  <ShoppingBag className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right side - Olive Image */}
          <motion.div
            className="relative"
            variants={fadeInRight}
            initial="initial"
            animate="animate"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main olive image with decorative frame */}
              <div className="relative">
                {/* Decorative frame corners */}
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-[#781D32] rounded-tl-3xl opacity-30 z-10" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-[#55613C] rounded-br-3xl opacity-30 z-10" />

                {/* Image container with shadow */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-4">
                  <motion.div
                    className="relative aspect-square rounded-xl overflow-hidden"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/images/olive-heritage.png"
                      alt="Olive branch with black olives on decorative Palestinian embroidery pattern plate"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </div>

                {/* Floating accent elements */}
                <motion.div
                  className="absolute -top-6 -right-6 w-12 h-12 bg-[#781D32] rounded-full opacity-20"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#55613C] rounded-full opacity-15"
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Caption below image */}
              <motion.div className="mt-6 text-center" variants={fadeInUp}>
                <p className="text-sm text-gray-600 italic">
                  {t("imageCaption")}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator - centered at bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          variants={fadeInUp}
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#55613C] font-semibold">
              {t("scrollPrompt")}
            </span>
            <ArrowRight className="h-5 w-5 text-[#781D32] rotate-90" />
          </div>
        </motion.div>
      </div>

      {/* Subtle corner accents */}
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-[#55613C] opacity-20" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-[#55613C] opacity-20" />
    </section>
  );
};

export default PalestinianHeritageHero;
