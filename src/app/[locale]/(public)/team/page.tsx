"use client";

import * as React from "react";
import { Link } from "@/src/i18n/navigation";
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

// Team statistics
const teamStats = [
  {
    icon: Users,
    number: "25+",
    label: "Team Members",
    description: "Dedicated volunteers",
    color: "bg-[#781D32]",
  },
  {
    icon: Globe,
    number: "8",
    label: "Countries",
    description: "International reach",
    color: "bg-[#55613C]",
  },
  {
    icon: Award,
    number: "500+",
    label: "Hours Monthly",
    description: "Volunteer contribution",
    color: "bg-[#3E442B]",
  },
  {
    icon: Heart,
    number: "3",
    label: "Years",
    description: "Working together",
    color: "bg-[#781D32]",
  },
];

// Leadership team data
const leadership = [
  {
    id: "1",
    name: "Ahmed Al-Rashid",
    role: "Executive Director",
    department: "Leadership",
    bio: "Leading Sumud's mission with over 10 years of experience in Palestinian solidarity work and community organizing in Finland.",
    avatar: "/images/team/ahmed.jpg",
    email: "ahmed@sumud.fi",
    linkedin: "https://linkedin.com/in/ahmed-alrashid",
    twitter: "https://twitter.com/ahmed_sumud",
    isLeadership: true,
    joinDate: "2022-01",
  },
  {
    id: "2",
    name: "Leila Virtanen",
    role: "Communications Director",
    department: "Leadership",
    bio: "Finnish journalist and activist bridging Finnish and Palestinian communities through strategic communications and media relations.",
    avatar: "/images/team/leila.jpg",
    email: "leila@sumud.fi",
    linkedin: "https://linkedin.com/in/leila-virtanen",
    isLeadership: true,
    joinDate: "2022-02",
  },
  {
    id: "3",
    name: "Yusuf Khoury",
    role: "Community Outreach",
    department: "Leadership",
    bio: "Palestinian-Finnish community leader focused on educational programs and cultural bridge-building initiatives.",
    avatar: "/images/team/yusuf.jpg",
    email: "yusuf@sumud.fi",
    linkedin: "https://linkedin.com/in/yusuf-khoury",
    isLeadership: true,
    joinDate: "2022-03",
  },
];

// Core team data
const coreTeam = [
  {
    id: "4",
    name: "Sofia Andersson",
    role: "Event Coordinator",
    department: "Operations",
    bio: "Organizing educational events and cultural programs across Finland.",
    avatar: "/images/team/sofia.jpg",
    email: "sofia@sumud.fi",
    isLeadership: false,
    joinDate: "2022-06",
  },
  {
    id: "5",
    name: "Omar Najjar",
    role: "Digital Strategist",
    department: "Technology",
    bio: "Managing digital presence and online advocacy campaigns.",
    avatar: "/images/team/omar.jpg",
    email: "omar@sumud.fi",
    github: "https://github.com/omar-najjar",
    isLeadership: false,
    joinDate: "2022-08",
  },
  {
    id: "6",
    name: "Aino Hakkarainen",
    role: "Legal Advisor",
    department: "Legal",
    bio: "Providing legal expertise on human rights and advocacy matters.",
    avatar: "/images/team/aino.jpg",
    email: "aino@sumud.fi",
    linkedin: "https://linkedin.com/in/aino-hakkarainen",
    isLeadership: false,
    joinDate: "2023-01",
  },
  {
    id: "7",
    name: "Khalil Zreik",
    role: "Cultural Programs",
    department: "Programs",
    bio: "Developing cultural exchange and educational programming.",
    avatar: "/images/team/khalil.jpg",
    email: "khalil@sumud.fi",
    isLeadership: false,
    joinDate: "2023-03",
  },
];

// Volunteers data
const volunteers = [
  {
    id: "8",
    name: "Emma Korhonen",
    role: "Social Media Volunteer",
    department: "Communications",
    bio: "Supporting social media campaigns and content creation.",
    avatar: "/images/team/emma.jpg",
    isLeadership: false,
    joinDate: "2023-06",
  },
  {
    id: "9",
    name: "Mahmoud Saleh",
    role: "Translation Volunteer",
    department: "Communications",
    bio: "Providing Arabic-Finnish translation services.",
    avatar: "/images/team/mahmoud.jpg",
    isLeadership: false,
    joinDate: "2023-08",
  },
  {
    id: "10",
    name: "Nina Virtala",
    role: "Event Volunteer",
    department: "Operations",
    bio: "Assisting with event organization and logistics.",
    avatar: "/images/team/nina.jpg",
    isLeadership: false,
    joinDate: "2024-01",
  },
];

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
              Our Team
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              The People Behind Sumud
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Meet the dedicated individuals working tirelessly to build bridges,
              advocate for justice, and strengthen the bonds between Finnish and Palestinian communities.
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
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.description}
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
            <h2 className="text-3xl font-bold text-[#3E442B] mb-4">Our Team</h2>
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
              Join Our Team
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re looking to volunteer your time, share your skills, or take on a leadership role,
              there&apos;s a place for you in our movement for Palestinian solidarity.
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