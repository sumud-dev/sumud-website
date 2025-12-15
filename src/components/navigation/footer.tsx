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
  Send,
  FileText,
  Users,
  Shield,
  PenTool,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";

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

const footerSections = [
  {
    title: "Navigation",
    links: [
      { name: "Home", href: "/", icon: Heart },
      { name: "Petitions", href: "/petitions", icon: PenTool },
      { name: "Articles", href: "/articles", icon: FileText },
      { name: "Become a member", href: "/membership", icon: Users },
      { name: "About", href: "/about", icon: Shield },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { name: "Become a Member", href: "/membership" },
      { name: "Volunteer", href: "/join?tab=volunteer" },
      { name: "Events", href: "/events" },
      { name: "Partnerships", href: "/partnerships" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Educational Materials", href: "/resources" },
      { name: "Reports", href: "/reports" },
      { name: "Media Kit", href: "/media-kit" },
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

const socialLinks = [
  { name: "Facebook", icon: "📘", href: "#", color: "hover:text-blue-600" },
  { name: "Twitter", icon: "🐦", href: "#", color: "hover:text-blue-400" },
  { name: "Instagram", icon: "📷", href: "#", color: "hover:text-pink-600" },
  { name: "LinkedIn", icon: "💼", href: "#", color: "hover:text-blue-700" },
];

export default function Footer() {
  return (
    <footer className="bg-[#3E442B] text-white">

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Image
                  src="/Logo.svg"
                  alt="Sumud - Finnish Palestine Network"
                  width={180}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>

              <p className="text-white/80 mb-6 leading-relaxed">
                Building bridges of solidarity between Finland and Palestine through
                education, advocacy, and community building. Together, we stand for
                justice and human rights.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#781D32]" />
                  <span className="text-white/80 text-sm">info@sumud.fi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#781D32]" />
                  <span className="text-white/80 text-sm">+358 XX XXX XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-[#781D32]" />
                  <span className="text-white/80 text-sm">Helsinki, Finland</span>
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
              {footerSections.map((section, _index) => (
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
                          {'icon' in link && link.icon && <link.icon className="h-3 w-3" />}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-white/60 text-sm">
                © 2024 Sumud - Finnish Palestine Network. All rights reserved.
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