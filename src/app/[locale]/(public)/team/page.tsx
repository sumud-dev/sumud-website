"use client";

import * as React from "react";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Heart,
  Award,
  Globe,
  Mail,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Separator } from "@/src/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  isLeadership: boolean;
  joinDate: string;
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="h-full glass-medium blur-transition border-glass-glow shadow-glass-lg hover:shadow-glass-xl hover:glass-hover-intense gpu-accelerated rounded-2xl">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="bg-[#781D32] text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#3E442B]">{member.name}</h3>
            <p className="text-[#781D32] font-medium">{member.role}</p>
            <Badge variant="secondary" className="bg-[#55613C]/10 text-[#55613C]">
              {member.department}
            </Badge>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {member.bio}
          </p>

          {/* Social Links */}
          <div className="flex space-x-2">
            {member.email && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-[#781D32]/10"
                      asChild
                    >
                      <a href={`mailto:${member.email}`}>
                        <Mail className="h-4 w-4 text-[#781D32]" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send email</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {member.linkedin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-[#781D32]/10"
                      asChild
                    >
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 text-[#781D32]" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {member.twitter && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-[#781D32]/10"
                      asChild
                    >
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 text-[#781D32]" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Twitter profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {member.github && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-[#781D32]/10"
                      asChild
                    >
                      <a href={member.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 text-[#781D32]" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const t = useTranslations("team");
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 glass-subtle gpu-accelerated" />
        <div className="absolute inset-0 warm-gradient-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="mb-4 bg-[#781D32]/10 text-[#781D32] border-[#781D32]/20">
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {t("hero.subtitle")}
            </p>
          </motion.div>

          {/* Team Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center glass-subtle blur-transition border-glass-glow shadow-glass-md hover:glass-medium hover:shadow-glass-lg gpu-accelerated rounded-xl">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-glass-md`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-[#3E442B] mb-1">
                      {stat.number}
                    </div>
                    <div className="font-medium text-[#781D32] mb-1">
                      {stat.key && t(stat.key) || stat.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.descKey && t(stat.descKey) || stat.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 glass-cream gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#3E442B] mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our leadership team brings diverse expertise and unwavering commitment
              to Palestinian solidarity and community building.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {leadership.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <TeamMemberCard member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-[#55613C]/10" />

      {/* Team Tabs Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50" />
        <div className="absolute inset-0 glass-subtle gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#3E442B] mb-4">{t("section.team")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From core team members to dedicated volunteers, every person contributes
              to our mission of solidarity and justice.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="core" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 glass-medium blur-transition border-glass-glow shadow-glass-md rounded-xl gpu-accelerated">
                <TabsTrigger value="core" className="data-[state=active]:glass-burgundy data-[state=active]:text-white data-[state=active]:shadow-glass-lg rounded-lg">
                  Core Team
                </TabsTrigger>
                <TabsTrigger value="volunteers" className="data-[state=active]:glass-olive data-[state=active]:text-white data-[state=active]:shadow-glass-lg rounded-lg">
                  Volunteers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="core" className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {coreTeam.map((member, index) => (
                    <motion.div
                      key={member.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <TeamMemberCard member={member} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="volunteers" className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {volunteers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <TeamMemberCard member={member} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Join Team CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#781D32] to-[#55613C]" />
        <div className="absolute inset-0 glass-burgundy gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            className="glass-strong blur-transition border-glass-glow shadow-glass-xl rounded-3xl p-12 gpu-accelerated"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {t("section.join")}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t("section.join.desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#781D32] hover:bg-white/90 font-semibold"
                asChild
              >
                <Link href="/join">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Join Our Team
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#781D32]"
                asChild
              >
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}