"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useNode } from "@craftjs/core";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { Separator } from "@/src/components/ui/separator";

interface HeritageHeroProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  joinButtonText?: string;
  joinButtonUrl?: string;
  learnButtonText?: string;
  learnButtonUrl?: string;
  image?: string;
}

const defaultProps: HeritageHeroProps = {
  title: "Stand With",
  subtitle: "Palestine",
  tagline: "Unity • Heritage • Action",
  description: "Join a movement rooted in dignity, culture, and the pursuit of justice. Your voice amplifies our collective call for Palestinian rights and freedom.",
  joinButtonText: "Join the Movement",
  joinButtonUrl: "/join",
  learnButtonText: "Visit Shop",
  learnButtonUrl: "https://shop.sumud.fi",
  image: "/images/olive-branch.jpg",
};

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

export const HeritageHero = (props: HeritageHeroProps) => {
  const {
    title,
    subtitle,
    tagline,
    description,
    joinButtonText,
    joinButtonUrl,
    learnButtonText,
    learnButtonUrl,
    image,
  } = props;

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative min-h-screen bg-linear-to-br from-[#F4F3F0] via-[#FAF9F6] to-[#F0EDE5] overflow-hidden flex items-center ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
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
              <div className="w-16 h-1 bg-linear-to-r from-[#55613C] via-[#781D32] to-[#55613C] rounded-full" />
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              variants={fadeInScale}
            >
              <span className="block text-[#3E442B] mb-2">{title}</span>
              <span className="block text-[#55613C]">{subtitle}</span>
            </motion.h1>

            {/* Elegant tagline */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl font-serif italic text-[#55613C] leading-relaxed"
              variants={fadeInUp}
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              {tagline}
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
              {description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={fadeInUp}
            >
              <Link href={joinButtonUrl || "/join"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#781D32] hover:bg-[#5C1625] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  {joinButtonText}
                  <Heart className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </Link>

              <Link href={learnButtonUrl || "https://shop.sumud.fi"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#3E442B] text-[#3E442B] hover:bg-[#3E442B] hover:text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  {learnButtonText}
                  <ShoppingBag className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            className="relative"
            variants={fadeInRight}
            initial="initial"
            animate="animate"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main image with decorative frame */}
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                {image && (
                  <Image
                    src={image}
                    alt="Palestinian Heritage"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>

              {/* Decorative elements around image */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-4 border-[#781D32] rounded-full opacity-20" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-[#55613C] rounded-full opacity-20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Craft.js Settings Panel
export const HeritageHeroSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    tagline,
    description,
    joinButtonText,
    joinButtonUrl,
    learnButtonText,
    learnButtonUrl,
    image,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    subtitle: node.data?.props?.subtitle,
    tagline: node.data?.props?.tagline,
    description: node.data?.props?.description,
    joinButtonText: node.data?.props?.joinButtonText,
    joinButtonUrl: node.data?.props?.joinButtonUrl,
    learnButtonText: node.data?.props?.learnButtonText,
    learnButtonUrl: node.data?.props?.learnButtonUrl,
    image: node.data?.props?.image,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: HeritageHeroProps) => (props.title = e.target.value))
          }
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) =>
            setProp((props: HeritageHeroProps) => (props.subtitle = e.target.value))
          }
        />
      </div>

      <div>
        <Label>Tagline</Label>
        <Input
          value={tagline}
          onChange={(e) =>
            setProp((props: HeritageHeroProps) => (props.tagline = e.target.value))
          }
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) =>
            setProp((props: HeritageHeroProps) => (props.description = e.target.value))
          }
          rows={4}
        />
      </div>

      <div>
        <Label>Join Button Text</Label>
        <Input
          value={joinButtonText}
          onChange={(e) =>
            setProp(
              (props: HeritageHeroProps) => (props.joinButtonText = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label>Join Button URL</Label>
        <Input
          value={joinButtonUrl}
          onChange={(e) =>
            setProp((props: HeritageHeroProps) => (props.joinButtonUrl = e.target.value))
          }
        />
      </div>

      <div>
        <Label>Learn Button Text</Label>
        <Input
          value={learnButtonText}
          onChange={(e) =>
            setProp(
              (props: HeritageHeroProps) => (props.learnButtonText = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label>Learn Button URL</Label>
        <Input
          value={learnButtonUrl}
          onChange={(e) =>
            setProp(
              (props: HeritageHeroProps) => (props.learnButtonUrl = e.target.value)
            )
          }
        />
      </div>

      <Separator className="my-4" />

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <ImageUpload
          value={image}
          onChange={(url) => setProp((props: HeritageHeroProps) => (props.image = url))}
          folder="page-builder/heritage"
          maxSize={5}
        />
      </div>

      <Separator className="my-4" />

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label>Or Enter Image URL</Label>
        <Input
          placeholder="https://example.com/image.jpg"
          value={image}
          onChange={(e) =>
            setProp((props: HeritageHeroProps) => (props.image = e.target.value))
          }
        />
      </div>
    </div>
  );
};

// Craft.js configuration
HeritageHero.craft = {
  displayName: "Heritage Hero",
  props: defaultProps,
  related: {
    settings: HeritageHeroSettings,
  },
};
