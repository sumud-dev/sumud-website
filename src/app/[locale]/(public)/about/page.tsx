"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Shield,
  BookOpen,
  Megaphone,
  Globe,
  FileText,
  HandshakeIcon,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
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

const whatWeDoKeys = [
  {
    key: "education",
    icon: BookOpen,
    color: "bg-[#781D32]",
  },
  {
    key: "advocacy",
    icon: Megaphone,
    color: "bg-[#55613C]",
  },
  {
    key: "cultural",
    icon: Globe,
    color: "bg-[#3E442B]",
  },
  {
    key: "community",
    icon: HandshakeIcon,
    color: "bg-[#781D32]",
  },
];

const valuesKeys = [
  {
    key: "solidarity",
    icon: Heart,
  },
  {
    key: "justice",
    icon: Shield,
  },
  {
    key: "community",
    icon: Users,
  },
];

const engagementKeys = [
  {
    key: "petitions",
    icon: FileText,
  },
  {
    key: "membership",
    icon: Users,
  },
  {
    key: "donate",
    icon: Heart,
  },
  {
    key: "volunteer",
    icon: Megaphone,
  },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
        {/* Hero Section with Liquid Glass */}
        <motion.section
          className="relative py-24 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient Background with Decorative Orbs */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#781D32] via-[#722F37] to-[#55613C]" />

          {/* Decorative Glass Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 right-[10%] w-72 h-72 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 248, 240, 0.15) 0%, rgba(255, 248, 240, 0) 70%)",
                filter: "blur(40px)",
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 left-[15%] w-96 h-96 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(107, 142, 35, 0.2) 0%, rgba(107, 142, 35, 0) 70%)",
                filter: "blur(50px)",
              }}
              animate={{
                y: [0, 30, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Dotted Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center space-y-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              {/* Glass Icon Container */}
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "0.5px solid rgba(255, 255, 255, 0.3)",
                  boxShadow:
                    "0 8px 16px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <Globe className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                {t("hero.title")}
                <span className="block text-3xl lg:text-4xl font-medium opacity-90 mt-3">
                  {t("hero.subtitle")}
                </span>
              </h1>

              <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
                {t("hero.description")}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Mission Statement Section */}
        <motion.section
          className="py-12 relative"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="backdrop-blur-xl rounded-3xl p-12"
              style={{
                background: "rgba(255, 255, 255, 0.90)",
                border: "0.5px solid rgba(232, 220, 196, 0.4)",
                boxShadow:
                  "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
              }}
            >
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-6">
                  {t("mission.title")}
                </h2>
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
                  {t("mission.description")}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* What We Do Section */}
        <motion.section
          className="py-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
                {t("whatWeDo.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("whatWeDo.subtitle")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whatWeDoKeys.map((activity, index) => (
                <motion.div
                  key={activity.key}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="backdrop-blur-xl rounded-3xl p-6 h-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: "rgba(255, 255, 255, 0.80)",
                      border: "0.5px solid rgba(232, 220, 196, 0.4)",
                      boxShadow:
                        "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
                    }}
                  >
                    <div className={`w-12 h-12 ${activity.color} rounded-lg flex items-center justify-center mb-4`}>
                      <activity.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3E442B] mb-3">
                      {t(`whatWeDo.${activity.key}.title`)}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t(`whatWeDo.${activity.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Our Values Section */}
        <motion.section
          className="py-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
                {t("values.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("values.subtitle")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {valuesKeys.map((value, index) => (
                <motion.div
                  key={value.key}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="backdrop-blur-xl rounded-3xl p-8 h-full transition-all duration-300 hover:scale-105 text-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.80)",
                      border: "0.5px solid rgba(232, 220, 196, 0.4)",
                      boxShadow:
                        "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
                    }}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #781D32, #55613C)",
                        }}
                      >
                        <value.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#3E442B] mb-4">
                      {t(`values.${value.key}.title`)}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t(`values.${value.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Ways to Engage Section */}
        <motion.section
          className="py-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
                {t("engage.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("engage.subtitle")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {engagementKeys.map((option, index) => (
                <motion.div
                  key={option.key}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="backdrop-blur-xl rounded-3xl p-8 h-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: "rgba(255, 255, 255, 0.80)",
                      border: "0.5px solid rgba(232, 220, 196, 0.4)",
                      boxShadow:
                        "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#781D32]">
                          <option.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#3E442B] mb-2">
                          {t(`engage.${option.key}.title`)}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                          {t(`engage.${option.key}.description`)}
                        </p>
                        <button className="text-[#781D32] font-semibold hover:text-[#781D32]/80 transition-colors text-sm">
                          {t(`engage.${option.key}.action`)} →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action with Premium Glass */}
        <motion.section
          className="py-20 relative overflow-hidden"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#E8DCC4]/30 to-[#FFF8F0]" />

          {/* Decorative Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#781D32]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B8E23]/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div
              className="backdrop-blur-xl rounded-3xl p-12 text-center transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(212, 175, 55, 0.1) 100%)",
                border: "0.5px solid rgba(212, 175, 55, 0.4)",
                boxShadow:
                  "0 16px 40px rgba(212, 175, 55, 0.15), 0 8px 20px rgba(120, 29, 50, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 0 40px rgba(212, 175, 55, 0.08)",
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
                style={{
                  background: "rgba(120, 29, 50, 0.15)",
                  border: "0.5px solid rgba(120, 29, 50, 0.3)",
                }}
              >
                <Heart className="h-10 w-10 text-[#781D32]" />
              </div>

              <h2 className="text-4xl font-bold text-[#3E442B] mb-4">
                {t("cta.title")}
              </h2>

              <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
                {t("cta.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="backdrop-blur-md rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: "#781D32",
                    color: "white",
                    border: "0.5px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 12px rgba(120, 29, 50, 0.25)",
                  }}
                >
                  {t("cta.memberButton")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  className="backdrop-blur-md rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300"
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "0.5px solid rgba(85, 97, 60, 0.3)",
                    color: "#55613C",
                  }}
                >
                  {t("cta.learnButton")}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
  );
}
