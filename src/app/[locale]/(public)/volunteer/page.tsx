"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/src/i18n/navigation";
import {
  Heart,
  Users,
  Calendar,
  MapPin,
  Clock,
  Award,
  ArrowRight,
  MessageSquare,
  Globe,
  Megaphone,
  Pencil,
  Code,
  Languages,
  HandHeart,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import VolunteerApplicationForm from "@/src/components/forms/volunteer-application-form";

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

// Volunteer impact statistics with Palestinian colors
const impactStats = [
  {
    icon: Users,
    number: "150+",
    label: "Active Volunteers",
    description: "Making a difference",
    color: "bg-[#781D32]", // Burgundy for passion/community
    textColor: "text-[#781D32]",
  },
  {
    icon: Clock,
    number: "2,000+",
    label: "Hours Contributed",
    description: "This year alone",
    color: "bg-[#55613C]", // Olive for growth
    textColor: "text-[#55613C]",
  },
  {
    icon: Calendar,
    number: "50+",
    label: "Events Supported",
    description: "Community activities",
    color: "bg-[#3E442B]", // Dark olive for events
    textColor: "text-[#3E442B]",
  },
  {
    icon: Heart,
    number: "100%",
    label: "Dedication",
    description: "To our mission",
    color: "bg-[#781D32]", // Burgundy for dedication
    textColor: "text-[#781D32]",
  },
];

// Volunteer opportunities with Palestinian color gradients
const opportunities = [
  {
    id: "advocacy",
    title: "Advocacy & Outreach",
    icon: Megaphone,
    description: "Help spread awareness and advocate for Palestinian rights through campaigns and community engagement.",
    timeCommitment: "5-10 hours/week",
    remote: true,
    color: "from-[#781D32] to-[#55613C]", // Burgundy to Olive
    hoverColor: "hover:from-[#781D32]/90 hover:to-[#55613C]/90",
    buttonColor: "bg-gradient-to-r from-[#781D32] to-[#55613C] hover:from-[#781D32]/90 hover:to-[#55613C]/90",
    badgeColor: "bg-[#781D32]/10 text-[#781D32] border-[#781D32]/30",
    iconColor: "text-[#781D32]",
    skills: ["Communication", "Social Media", "Public Speaking"],
    tasks: [
      "Organize local advocacy campaigns",
      "Engage with community leaders",
      "Represent Sumud at public events",
      "Coordinate with partner organizations",
    ],
  },
  {
    id: "content",
    title: "Content Creation",
    icon: Pencil,
    description: "Create compelling content including articles, graphics, and videos to educate and inspire action.",
    timeCommitment: "3-8 hours/week",
    remote: true,
    color: "from-[#55613C] to-[#3E442B]", // Olive to Dark Olive
    hoverColor: "hover:from-[#55613C]/90 hover:to-[#3E442B]/90",
    buttonColor: "bg-gradient-to-r from-[#55613C] to-[#3E442B] hover:from-[#55613C]/90 hover:to-[#3E442B]/90",
    badgeColor: "bg-[#55613C]/10 text-[#55613C] border-[#55613C]/30",
    iconColor: "text-[#55613C]",
    skills: ["Writing", "Design", "Video Editing"],
    tasks: [
      "Write blog posts and articles",
      "Design social media graphics",
      "Create educational videos",
      "Develop infographics",
    ],
  },
  {
    id: "social-media",
    title: "Social Media Management",
    icon: MessageSquare,
    description: "Manage our social media presence, engage with followers, and amplify our message across platforms.",
    timeCommitment: "5-7 hours/week",
    remote: true,
    color: "from-[#781D32] to-[#3E442B]", // Burgundy to Dark
    hoverColor: "hover:from-[#781D32]/90 hover:to-[#3E442B]/90",
    buttonColor: "bg-gradient-to-r from-[#781D32] to-[#3E442B] hover:from-[#781D32]/90 hover:to-[#3E442B]/90",
    badgeColor: "bg-[#781D32]/10 text-[#781D32] border-[#781D32]/30",
    iconColor: "text-[#781D32]",
    skills: ["Social Media", "Community Management", "Analytics"],
    tasks: [
      "Schedule and publish content",
      "Engage with community",
      "Monitor social media trends",
      "Analyze performance metrics",
    ],
  },
  {
    id: "events",
    title: "Event Coordination",
    icon: Calendar,
    description: "Help organize and run educational events, cultural programs, and community gatherings.",
    timeCommitment: "10-15 hours/week",
    remote: false,
    color: "from-[#3E442B] to-[#55613C]", // Dark to Olive
    hoverColor: "hover:from-[#3E442B]/90 hover:to-[#55613C]/90",
    buttonColor: "bg-gradient-to-r from-[#3E442B] to-[#55613C] hover:from-[#3E442B]/90 hover:to-[#55613C]/90",
    badgeColor: "bg-[#3E442B]/10 text-[#3E442B] border-[#3E442B]/30",
    iconColor: "text-[#3E442B]",
    skills: ["Organization", "Communication", "Logistics"],
    tasks: [
      "Plan event logistics",
      "Coordinate with speakers",
      "Manage event registration",
      "Ensure smooth execution",
    ],
  },
  {
    id: "translation",
    title: "Translation Services",
    icon: Languages,
    description: "Bridge language barriers by translating materials between Finnish, Arabic, and English.",
    timeCommitment: "2-5 hours/week",
    remote: true,
    color: "from-[#55613C] to-[#781D32]", // Olive to Burgundy
    hoverColor: "hover:from-[#55613C]/90 hover:to-[#781D32]/90",
    buttonColor: "bg-gradient-to-r from-[#55613C] to-[#781D32] hover:from-[#55613C]/90 hover:to-[#781D32]/90",
    badgeColor: "bg-[#55613C]/10 text-[#55613C] border-[#55613C]/30",
    iconColor: "text-[#55613C]",
    skills: ["Finnish", "Arabic", "English"],
    tasks: [
      "Translate documents and articles",
      "Provide interpretation at events",
      "Review translated materials",
      "Maintain translation quality",
    ],
  },
  {
    id: "tech",
    title: "Tech & Development",
    icon: Code,
    description: "Support our digital infrastructure, website development, and technical projects.",
    timeCommitment: "5-10 hours/week",
    remote: true,
    color: "from-[#3E442B] to-[#781D32]", // Dark to Burgundy
    hoverColor: "hover:from-[#3E442B]/90 hover:to-[#781D32]/90",
    buttonColor: "bg-gradient-to-r from-[#3E442B] to-[#781D32] hover:from-[#3E442B]/90 hover:to-[#781D32]/90",
    badgeColor: "bg-[#3E442B]/10 text-[#3E442B] border-[#3E442B]/30",
    iconColor: "text-[#3E442B]",
    skills: ["Web Development", "Design", "IT Support"],
    tasks: [
      "Website maintenance",
      "Develop new features",
      "Technical support",
      "Database management",
    ],
  },
];

// Volunteer testimonials with Palestinian colors
const testimonials = [
  {
    id: 1,
    name: "Emma Korhonen",
    role: "Social Media Volunteer",
    duration: "1 year",
    image: "/images/team/emma.jpg",
    quote: "Volunteering with Sumud has been incredibly rewarding. I've learned so much about Palestinian culture and history while contributing to meaningful advocacy work.",
    impact: "Increased social media engagement by 200%",
    accentColor: "from-[#781D32] to-[#55613C]",
    badgeColor: "bg-[#781D32]/10 text-[#781D32] border-[#781D32]/30",
    iconColor: "text-[#781D32]",
  },
  {
    id: 2,
    name: "Mahmoud Saleh",
    role: "Translation Volunteer",
    duration: "2 years",
    image: "/images/team/mahmoud.jpg",
    quote: "Being able to use my language skills to help bridge communities is amazing. Every translation helps more people understand the importance of our cause.",
    impact: "Translated 100+ documents and articles",
    accentColor: "from-[#55613C] to-[#3E442B]",
    badgeColor: "bg-[#55613C]/10 text-[#55613C] border-[#55613C]/30",
    iconColor: "text-[#55613C]",
  },
  {
    id: 3,
    name: "Nina Virtala",
    role: "Event Volunteer",
    duration: "6 months",
    image: "/images/team/nina.jpg",
    quote: "The community here is incredible. Every event we organize brings people together and creates real change. I'm proud to be part of this movement.",
    impact: "Helped organize 20+ successful events",
    accentColor: "from-[#3E442B] to-[#781D32]",
    badgeColor: "bg-[#3E442B]/10 text-[#3E442B] border-[#3E442B]/30",
    iconColor: "text-[#3E442B]",
  },
];

// Volunteer benefits with Palestinian colors
const benefits = [
  {
    icon: Award,
    title: "Skill Development",
    description: "Gain valuable experience in advocacy, communications, event management, and more.",
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
  },
  {
    icon: Users,
    title: "Community Network",
    description: "Connect with passionate individuals and build lasting friendships.",
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
  },
  {
    icon: Globe,
    title: "Cultural Exchange",
    description: "Deepen your understanding of Palestinian culture and Finnish-Palestinian relations.",
    color: "from-[#3E442B] to-[#781D32]",
    iconColor: "text-[#3E442B]",
  },
  {
    icon: HandHeart,
    title: "Make Impact",
    description: "See the direct results of your contributions to Palestinian solidarity.",
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
  },
  {
    icon: TrendingUp,
    title: "Leadership Opportunities",
    description: "Grow into leadership roles and shape the future of Sumud.",
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
  },
  {
    icon: Sparkles,
    title: "Exclusive Access",
    description: "Attend special events, workshops, and training sessions for volunteers.",
    color: "from-[#3E442B] to-[#781D32]",
    iconColor: "text-[#3E442B]",
  },
];

// Application process steps with Palestinian colors
const applicationSteps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Fill out our volunteer application form with your interests and availability.",
    icon: Pencil,
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
  },
  {
    step: 2,
    title: "Initial Interview",
    description: "Have a casual conversation with our volunteer coordinator to discuss your goals.",
    icon: MessageSquare,
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
  },
  {
    step: 3,
    title: "Orientation",
    description: "Attend an orientation session to learn about Sumud and volunteer expectations.",
    icon: Users,
    color: "from-[#3E442B] to-[#781D32]",
    iconColor: "text-[#3E442B]",
  },
  {
    step: 4,
    title: "Start Contributing",
    description: "Begin your volunteer journey and make a real difference!",
    icon: Heart,
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
  },
];

export default function VolunteerPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preselectedRole, setPreselectedRole] = useState<string | undefined>();

  const handleApplyClick = (roleId?: string) => {
    setPreselectedRole(roleId);
    setIsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setTimeout(() => {
      setIsDialogOpen(false);
      setPreselectedRole(undefined);
    }, 2000);
  };

  return (
    <>
      {/* Hero Section - Palestinian Colors */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#781D32] via-[#781D32]/95 to-[#55613C]" />
        <div className="absolute inset-0 glass-burgundy gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="mb-4 bg-white/90 text-[#781D32] border-white/50 shadow-glass-md font-semibold">
              Join Our Movement
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
              Volunteer with Sumud
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 leading-relaxed mb-10 font-medium drop-shadow-lg">
              Join 150+ passionate volunteers making a real difference in Palestinian solidarity.
              Whether you have 2 hours a week or 20, there&apos;s a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      size="lg"
                      className="bg-white text-[#781D32] hover:bg-white/95 font-bold rounded-full px-8 py-6 text-lg shadow-glass-xl hover:shadow-glass-2xl"
                      onClick={() => handleApplyClick()}
                    >
                      Apply to Volunteer
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="glass-strong blur-transition border-glass-glow shadow-glass-xl max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#3E442B] flex items-center gap-2">
                      <Heart className="h-6 w-6 text-[#781D32]" />
                      Volunteer Application
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Join 150+ passionate volunteers making a real difference in Palestinian solidarity.
                    </DialogDescription>
                  </DialogHeader>
                  <VolunteerApplicationForm
                    onSuccess={handleFormSuccess}
                    preselectedRole={preselectedRole}
                  />
                </DialogContent>
              </Dialog>
              <Link href="/volunteer/learn-more">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#781D32] rounded-full px-8 py-6 text-lg font-bold shadow-glass-lg hover:shadow-glass-xl"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Statistics - Palestinian Colors */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="absolute inset-0 glass-subtle gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="gpu-accelerated"
              >
                <Card className="text-center glass-subtle blur-transition border-glass-glow shadow-lg hover:glass-medium hover:shadow-xl gpu-accelerated rounded-2xl border hover:border-white/50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:rotate-3`}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`text-4xl font-bold ${stat.textColor} mb-2`}>
                      {stat.number}
                    </div>
                    <div className="font-bold text-[#3E442B] mb-2 text-lg">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Volunteer Opportunities - Palestinian Colors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Volunteer Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find the perfect role that matches your skills, interests, and availability.
              All positions are flexible and can be tailored to your schedule.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className={`h-full glass-medium blur-transition border-glass-glow shadow-lg hover:shadow-xl hover:glass-hover-intense gpu-accelerated rounded-3xl cursor-pointer border transition-all duration-300 ${
                  selectedOpportunity === opportunity.id ? 'ring-2 ring-offset-2 ring-offset-white' : ''
                }`}
                onClick={() => setSelectedOpportunity(opportunity.id)}
                style={{
                  borderColor: selectedOpportunity === opportunity.id ? opportunity.iconColor : 'rgba(255,255,255,0.3)'
                }}
                >
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${opportunity.color} ${opportunity.hoverColor} rounded-2xl flex items-center justify-center mb-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:rotate-6`}>
                      <opportunity.icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-[#3E442B] mb-3">
                      {opportunity.title}
                    </h3>

                    <p className="text-gray-600 mb-5 leading-relaxed">
                      {opportunity.description}
                    </p>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className={`h-5 w-5 ${opportunity.iconColor}`} />
                        <span className="text-gray-700 font-semibold">{opportunity.timeCommitment}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className={`h-5 w-5 ${opportunity.iconColor}`} />
                        <span className="text-gray-700 font-semibold">
                          {opportunity.remote ? "Remote" : "In-person"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {opportunity.skills.map((skill) => (
                        <Badge
                          key={skill}
                          className={`glass-subtle border-glass-glow text-xs font-semibold ${opportunity.badgeColor} px-3 py-1 border`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="sm"
                        className={`w-full ${opportunity.buttonColor} text-white rounded-full font-bold py-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyClick(opportunity.id);
                        }}
                      >
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Volunteer Testimonials - Palestinian Colors */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />
        <div className="absolute inset-0 glass-cream gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Volunteer Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Hear from our dedicated volunteers about their experiences and the impact they&apos;ve made.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className="h-full glass-strong blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/40">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${testimonial.accentColor} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#3E442B] text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-700 font-semibold">{testimonial.role}</p>
                        <p className="text-xs text-gray-600 font-medium">{testimonial.duration}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 italic mb-6 leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    <div className={`glass-subtle blur-transition border-glass-glow rounded-xl p-4 ${testimonial.badgeColor} border`}>
                      <div className="flex items-start gap-3">
                        <Target className={`h-5 w-5 ${testimonial.iconColor} mt-0.5 flex-shrink-0`} />
                        <p className="text-sm text-gray-700 font-bold">
                          {testimonial.impact}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Palestinian Colors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Why Volunteer with Sumud?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Volunteering with us is more than giving your time – it&apos;s about personal growth,
              community building, and making real impact.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className="h-full glass-subtle blur-transition border-glass-glow shadow-md hover:glass-medium hover:shadow-lg gpu-accelerated rounded-2xl border border-white/40 hover:border-white/60 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mb-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110`}>
                      <benefit.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-[#3E442B] mb-3 text-xl">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Application Process - Palestinian Colors */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4F3F0] via-white to-[#F4F3F0]" />
        <div className="absolute inset-0 glass-subtle gpu-accelerated" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              How to Join
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our simple 4-step process to becoming a Sumud volunteer
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {applicationSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                whileHover={{ x: 8, scale: 1.01 }}
                className="gpu-accelerated"
              >
                <Card className="glass-medium blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/40 hover:border-white/60 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <step.icon className={`h-7 w-7 ${step.iconColor}`} />
                          <h3 className="text-2xl font-bold text-[#3E442B]">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {step.description}
                        </p>
                      </div>
                      {index < applicationSteps.length - 1 && (
                        <ArrowRight className="h-7 w-7 text-gray-400 flex-shrink-0 mt-6 hidden lg:block" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action - Fresh, Light & Hopeful Design */}
      <section className="relative py-32 overflow-hidden">
        {/* Base Background - Soft Warm White */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FFFCF8] to-[#FFF8F0]" />

        {/* Subtle Animated Gradient Mesh Overlay */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 4,
              delay: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Decorative Pattern Overlay - Subtle Palestinian Motif */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Floating Badge with Glass Effect */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-2.5 mb-8 rounded-full glass-medium border-glass-glow shadow-glass-lg backdrop-blur-xl gpu-accelerated"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
              <span className="text-sm font-bold text-gray-800">
                Join 150+ Active Volunteers
              </span>
            </motion.div>

            {/* Main Heading - Large, Bold, Inviting */}
            <motion.h2
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-sm">
                Ready to Make
              </span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  a Difference?
                </span>
                {/* Subtle underline decoration */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30" viewBox="0 0 300 12" fill="none">
                  <motion.path
                    d="M2 6C100 2, 200 10, 298 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>
              </span>
            </motion.h2>

            {/* Description with Better Typography */}
            <motion.p
              className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join our community of passionate volunteers and contribute your unique skills
              to the Palestinian solidarity movement.{" "}
              <span className="text-emerald-600 font-bold">Every hour counts!</span>
            </motion.p>

            {/* Glass Card Container for CTAs */}
            <motion.div
              className="glass-strong blur-transition border-glass-glow shadow-glass-2xl rounded-3xl p-10 lg:p-14 max-w-3xl mx-auto gpu-accelerated mb-8"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: `
                  0 20px 40px rgba(0, 0, 0, 0.08),
                  0 8px 16px rgba(0, 0, 0, 0.04),
                  inset 0 2px 0 rgba(255, 255, 255, 0.9)
                `
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              {/* Animated Heart Icon */}
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
                whileHover={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="h-10 w-10 text-white fill-white" />
              </motion.div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {/* Primary CTA - Emerald Green */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="lg"
                    className="relative overflow-hidden font-bold shadow-xl hover:shadow-2xl rounded-full px-10 py-7 text-lg group"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white'
                    }}
                    onClick={() => handleApplyClick()}
                  >
                    {/* Shimmer effect on hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <HandHeart className="mr-2 h-6 w-6 relative z-10" />
                    <span className="relative z-10">Apply Now</span>
                  </Button>
                </motion.div>

                {/* Secondary CTA - Outline Style */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 font-bold rounded-full px-10 py-7 text-lg backdrop-blur-sm"
                    style={{
                      borderColor: '#10B981',
                      color: '#059669',
                      background: 'rgba(16, 185, 129, 0.05)'
                    }}
                    onClick={() => window.location.href = "mailto:volunteer@sumud.fi"}
                  >
                    Contact Volunteer Coordinator
                  </Button>
                </motion.div>
              </div>

              {/* Email Contact with Icon */}
              <motion.div
                className="flex items-center justify-center gap-3 text-sm text-gray-600 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  Have questions? Email us at{" "}
                  <a
                    href="mailto:volunteer@sumud.fi"
                    className="text-emerald-600 font-bold hover:text-emerald-700 underline decoration-2 underline-offset-4 hover:decoration-emerald-600 transition-all"
                  >
                    volunteer@sumud.fi
                  </a>
                </span>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">150+ Volunteers</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">2,000+ Hours</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">Meaningful Impact</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
