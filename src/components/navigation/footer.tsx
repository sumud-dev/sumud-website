"use client";

import React from "react";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Separator } from "@/src/components/ui/separator";
import { getFooterConfig, type FooterConfig, type Locale } from "@/src/actions/navigation.actions";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Default fallback data if config fails to load
const defaultFooterSections = [
  {
    title: "Navigation",
    links: [
      { name: "Home", href: "/" },
      { name: "Petitions", href: "/petitions" },
      { name: "Articles", href: "/articles" },
      { name: "Become a member", href: "/membership" },
      { name: "About", href: "/about" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { name: "Become a Member", href: "/membership" },
      { name: "Events", href: "/events" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "FAQ", href: "/faq" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Code of Conduct", href: "/code-of-conduct" },
      { name: "Transparency", href: "/transparency" },
    ],
  },
];

const defaultSocialLinks = [
  { name: "Facebook", icon: "📘", href: "#", color: "hover:text-blue-600" },
  { name: "Twitter", icon: "🐦", href: "#", color: "hover:text-blue-400" },
  { name: "Instagram", icon: "📷", href: "#", color: "hover:text-pink-600" },
  { name: "LinkedIn", icon: "💼", href: "#", color: "hover:text-blue-700" },
];

// Social icon mapping
const socialIconMap: Record<string, { icon: string; color: string }> = {
  facebook: { icon: "📘", color: "hover:text-blue-600" },
  twitter: { icon: "🐦", color: "hover:text-blue-400" },
  x: { icon: "🐦", color: "hover:text-blue-400" },
  instagram: { icon: "📷", color: "hover:text-pink-600" },
  linkedin: { icon: "💼", color: "hover:text-blue-700" },
  youtube: { icon: "📺", color: "hover:text-red-600" },
};

interface FooterProps {
  locale?: Locale;
}

export default function Footer({ locale = "en" }: FooterProps) {
  const [config, setConfig] = React.useState<FooterConfig | null>(null);

  React.useEffect(() => {
    async function loadConfig() {
      try {
        const result = await getFooterConfig();
        if (result.success) {
          setConfig(result.data);
        }
      } catch (error) {
        console.error("Failed to load footer config:", error);
      }
    }
    loadConfig();
  }, []);

  // Transform config to footer sections format
  const footerSections = React.useMemo(() => {
    if (!config) return defaultFooterSections;
    
    return [
      {
        title: "Navigation",
        links: config.quickLinks.map(link => ({
          name: link.labels[locale] || link.labels.en || link.labelKey,
          href: link.href,
        })),
      },
      {
        title: "Get Involved",
        links: config.getInvolvedLinks.map(link => ({
          name: link.labels[locale] || link.labels.en || link.labelKey,
          href: link.href,
        })),
      },
      {
        title: "Resources",
        links: config.resourceLinks.map(link => ({
          name: link.labels[locale] || link.labels.en || link.labelKey,
          href: link.href,
        })),
      },
      {
        title: "Legal",
        links: config.legalLinks.map(link => ({
          name: link.labels[locale] || link.labels.en || link.labelKey,
          href: link.href,
        })),
      },
    ];
  }, [config, locale]);

  const socialLinks = React.useMemo(() => {
    if (!config) return defaultSocialLinks;
    
    return config.socialLinks.map(link => {
      const platformLower = link.platform.toLowerCase();
      const iconData = socialIconMap[platformLower] || { icon: "🔗", color: "hover:text-gray-400" };
      return {
        name: link.platform,
        icon: iconData.icon,
        href: link.url,
        color: iconData.color,
      };
    });
  }, [config]);

  const description = config?.description[locale] || config?.description.en || 
    "Building bridges of solidarity between Finland and Palestine through education, advocacy, and community building. Together, we stand for justice and human rights.";

  const copyright = config?.copyright[locale] || config?.copyright.en || 
    "© 2024 Sumud - Finnish Palestine Network. All rights reserved.";
  return (
    <footer className="bg-[#3E442B] text-white">

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid lg:grid-cols-12 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Brand Section */}
            <motion.div className="lg:col-span-4" variants={fadeInUp}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white p-2 rounded-lg inline-flex">
                  <Image
                    src="/Logo.svg"
                    alt="Sumud - Finnish Palestine Network"
                    width={180}
                    height={48}
                    className="h-12 w-auto"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
              </div>

              <p className="text-white/80 mb-6 leading-relaxed">
                {description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#781D32]" />
                  <span className="text-white/80 text-sm">{config?.contact.email || "info@sumud.fi"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#781D32]" />
                  <span className="text-white/80 text-sm">{config?.contact.phone || "+358 XX XXX XXXX"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-[#781D32]" />
                  <span className="text-white/80 text-sm">{config?.contact.location || "Helsinki, Finland"}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={`p-2 bg-white/10 rounded-lg transition-all ${social.color} hover:bg-white/20 hover:scale-110 text-lg`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Sections */}
            <div className="lg:col-span-8 grid md:grid-cols-4 gap-8">
              {footerSections.map((section) => (
                <motion.div key={section.title} variants={fadeInUp}>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="flex items-center space-x-2 text-white/70 hover:text-[#781D32] transition-colors text-sm"
                        >
                          <span>{link.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-white/20" />
      <motion.div
        className="py-6"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-white/60 text-sm">
                {copyright}
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  href="/privacy-policy"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Terms
                </Link>
                <Link
                  href="/accessibility"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Accessibility
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-[#781D32]" />
              <span>in Finland for Palestine</span>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}