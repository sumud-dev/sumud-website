"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/src/i18n/navigation";
import {
  Heart,
  Users,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Target,
  Lightbulb,
  HeartHandshake,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Globe,
  Megaphone,
  Pencil,
  MessageSquare,
  Languages,
  Code,
  Coffee,
  Video,
  Mail,
  Phone,
  MapPin,
  Headphones,
  Presentation,
  FileText,
  UserPlus,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

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

// What volunteering means at Sumud
const missionAlignment = [
  {
    icon: Heart,
    title: "Solidarity in Action",
    description: "Every volunteer hour directly contributes to raising awareness, supporting Palestinian rights, and building bridges between Finnish and Palestinian communities.",
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
    bgColor: "bg-[#781D32]/10",
  },
  {
    icon: Globe,
    title: "Cultural Ambassador",
    description: "As a Sumud volunteer, you become an ambassador of Palestinian culture, sharing authentic stories and educating others about the rich heritage and ongoing struggles.",
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
    bgColor: "bg-[#55613C]/10",
  },
  {
    icon: Users,
    title: "Community Builder",
    description: "Join a tight-knit community of like-minded individuals committed to justice, equality, and meaningful change. Together, we're stronger.",
    color: "from-[#3E442B] to-[#781D32]",
    iconColor: "text-[#3E442B]",
    bgColor: "bg-[#3E442B]/10",
  },
];

// Day in the life scenarios
const dayInLifeScenarios = [
  {
    role: "Social Media Volunteer",
    icon: MessageSquare,
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
    timeline: [
      { time: "Morning (9-10 AM)", activity: "Review overnight mentions and respond to community comments", duration: "30 min" },
      { time: "Mid-morning (10-11 AM)", activity: "Create and schedule 3 posts for the day using pre-approved content", duration: "45 min" },
      { time: "Lunch Break (12-1 PM)", activity: "Engage with partner organizations' content and share relevant posts", duration: "15 min" },
      { time: "Afternoon (3-4 PM)", activity: "Monitor trending topics and suggest timely content to the team", duration: "30 min" },
    ],
    weeklyCommitment: "5-7 hours",
    flexibility: "High - work when you're available",
  },
  {
    role: "Event Coordinator",
    icon: Calendar,
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
    timeline: [
      { time: "Week 1", activity: "Plan event concept with team, secure venue, create timeline", duration: "3 hours" },
      { time: "Week 2", activity: "Coordinate with speakers, design promotional materials, open registration", duration: "4 hours" },
      { time: "Week 3", activity: "Promote event on social media, manage registrations, final preparations", duration: "5 hours" },
      { time: "Event Day", activity: "Set up venue, welcome attendees, manage logistics, coordinate volunteers", duration: "6-8 hours" },
    ],
    weeklyCommitment: "10-15 hours (varies by event cycle)",
    flexibility: "Medium - more intensive near events",
  },
  {
    role: "Content Creator",
    icon: Pencil,
    color: "from-[#3E442B] to-[#781D32]",
    iconColor: "text-[#3E442B]",
    timeline: [
      { time: "Monday", activity: "Brainstorm article ideas, research topics, draft outline", duration: "2 hours" },
      { time: "Wednesday", activity: "Write and edit article, fact-check sources, add visuals", duration: "3 hours" },
      { time: "Friday", activity: "Collaborate with editors, finalize content, schedule publication", duration: "1.5 hours" },
      { time: "Weekend", activity: "Monitor article performance, engage with readers' comments", duration: "30 min" },
    ],
    weeklyCommitment: "3-8 hours",
    flexibility: "High - work at your own pace",
  },
];

// Detailed role breakdowns
const detailedRoles = [
  {
    id: "advocacy",
    title: "Advocacy & Outreach",
    icon: Megaphone,
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
    badgeColor: "bg-[#781D32]/10 text-[#781D32] border-[#781D32]/30",
    responsibilities: [
      "Organize letter-writing campaigns to Finnish government officials",
      "Represent Sumud at community events and cultural festivals",
      "Build relationships with local mosques, churches, and community centers",
      "Coordinate solidarity actions and peaceful demonstrations",
      "Speak at schools, universities, and community groups",
    ],
    skills: {
      required: ["Strong communication", "Public speaking", "Cultural sensitivity"],
      preferred: ["Finnish language", "Event experience", "Advocacy background"],
    },
    training: [
      "Palestinian history and current situation (3-hour workshop)",
      "Effective advocacy techniques (2-hour training)",
      "Public speaking and presentation skills (optional)",
    ],
    impact: "Your advocacy directly influences policy discussions and raises awareness among thousands of Finns each year.",
  },
  {
    id: "content",
    title: "Content Creation",
    icon: Pencil,
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
    badgeColor: "bg-[#55613C]/10 text-[#55613C] border-[#55613C]/30",
    responsibilities: [
      "Write articles, blog posts, and educational materials",
      "Create eye-catching graphics for social media campaigns",
      "Produce short documentary-style videos and interviews",
      "Design infographics explaining complex political situations",
      "Edit and proofread content from other volunteers",
    ],
    skills: {
      required: ["Writing or design skills", "Creativity", "Attention to detail"],
      preferred: ["Adobe Creative Suite", "Video editing", "Photography"],
    },
    training: [
      "Brand guidelines and style guide workshop (1 hour)",
      "Content strategy and messaging training (2 hours)",
      "Tool tutorials (Canva, Adobe, etc.) - self-paced",
    ],
    impact: "Your content reaches 50,000+ people monthly and shapes the narrative around Palestinian solidarity in Finland.",
  },
  {
    id: "translation",
    title: "Translation Services",
    icon: Languages,
    color: "from-[#781D32] to-[#3E442B]",
    iconColor: "text-[#781D32]",
    badgeColor: "bg-[#781D32]/10 text-[#781D32] border-[#781D32]/30",
    responsibilities: [
      "Translate articles and reports (Arabic ↔ Finnish ↔ English)",
      "Provide live interpretation at events and meetings",
      "Subtitle videos and documentary content",
      "Review translations for accuracy and cultural appropriateness",
      "Maintain translation memory and terminology databases",
    ],
    skills: {
      required: ["Fluency in 2+ languages", "Cultural knowledge", "Accuracy"],
      preferred: ["Translation certification", "Subject expertise", "CAT tools"],
    },
    training: [
      "Translation style guide and terminology (1 hour)",
      "Cultural nuances workshop (1.5 hours)",
      "Tool training for translation software (self-paced)",
    ],
    impact: "Your translations break down language barriers and make our message accessible to diverse communities.",
  },
  {
    id: "tech",
    title: "Tech & Development",
    icon: Code,
    color: "from-[#3E442B] to-[#55613C]",
    iconColor: "text-[#3E442B]",
    badgeColor: "bg-[#3E442B]/10 text-[#3E442B] border-[#3E442B]/30",
    responsibilities: [
      "Maintain and improve the Sumud website",
      "Develop features for campaign and petition systems",
      "Manage databases and ensure data security",
      "Provide technical support for online events",
      "Optimize website performance and accessibility",
    ],
    skills: {
      required: ["Web development", "Problem-solving", "Technical skills"],
      preferred: ["React/Next.js", "TypeScript", "Database management"],
    },
    training: [
      "Codebase walkthrough and setup (2 hours)",
      "Development workflow and Git practices (1 hour)",
      "Security and privacy best practices (1 hour)",
    ],
    impact: "Your technical contributions power the digital infrastructure that connects thousands of supporters worldwide.",
  },
];

// Volunteer training and onboarding
const onboardingJourney = [
  {
    phase: "Week 1: Welcome & Orientation",
    icon: UserPlus,
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
    activities: [
      "Welcome email with resources and community intro",
      "1-on-1 meeting with volunteer coordinator (30 min)",
      "Access to volunteer portal and communication channels",
      "Introduction to other volunteers in your role area",
    ],
  },
  {
    phase: "Week 2: Foundation Training",
    icon: BookOpen,
    color: "from-[#55613C] to-[#3E442B]",
    iconColor: "text-[#55613C]",
    activities: [
      "Palestinian history and context workshop (3 hours)",
      "Sumud's mission, values, and strategic goals session",
      "Role-specific training and tool tutorials",
      "Q&A session with experienced volunteers",
    ],
  },
  {
    phase: "Week 3-4: Hands-On Practice",
    icon: Lightbulb,
    color: "from-[#3E442B] to-[#781D32]",
    iconColor: "text-[#3E442B]",
    activities: [
      "Shadow an experienced volunteer in your role",
      "Complete first assignment with mentor feedback",
      "Attend team meeting and share your ideas",
      "Start contributing to active projects",
    ],
  },
  {
    phase: "Month 2+: Independent Contribution",
    icon: Zap,
    color: "from-[#781D32] to-[#55613C]",
    iconColor: "text-[#781D32]",
    activities: [
      "Take ownership of projects and initiatives",
      "Monthly check-ins with coordinator",
      "Ongoing skill development and advanced training",
      "Mentor new volunteers joining your role",
    ],
  },
];

// Volunteer community and support
const communitySupport = [
  {
    icon: MessageCircle,
    title: "Active Communication Channels",
    description: "Slack workspace with dedicated channels for each role, general chat, and social activities. Stay connected anytime.",
    color: "text-[#781D32]",
    bgColor: "bg-[#781D32]/10",
  },
  {
    icon: Coffee,
    title: "Monthly Social Gatherings",
    description: "Virtual and in-person meetups for volunteers to connect, share experiences, and build lasting friendships.",
    color: "text-[#55613C]",
    bgColor: "bg-[#55613C]/10",
  },
  {
    icon: Headphones,
    title: "Mental Health Support",
    description: "Access to peer support groups and resources. We understand advocacy work can be emotionally challenging.",
    color: "text-[#3E442B]",
    bgColor: "bg-[#3E442B]/10",
  },
  {
    icon: Award,
    title: "Recognition Program",
    description: "Volunteer spotlights, appreciation events, and certificates of recognition for your valuable contributions.",
    color: "text-[#781D32]",
    bgColor: "bg-[#781D32]/10",
  },
  {
    icon: TrendingUp,
    title: "Professional Development",
    description: "Free workshops, skill-building sessions, and mentorship opportunities to enhance your personal growth.",
    color: "text-[#55613C]",
    bgColor: "bg-[#55613C]/10",
  },
  {
    icon: Shield,
    title: "Safety & Well-being",
    description: "Clear guidelines, harassment policies, and support systems to ensure a safe volunteering environment.",
    color: "text-[#3E442B]",
    bgColor: "bg-[#3E442B]/10",
  },
];

// Real impact stories
const impactStories = [
  {
    volunteer: "Sara K.",
    role: "Advocacy Volunteer",
    duration: "2 years",
    story: "I started volunteering after attending one of Sumud's events. In my first year, I helped organize a letter-writing campaign that reached 50 Finnish MPs. Seeing the response and knowing I contributed to changing minds about Palestinian rights has been incredibly fulfilling.",
    achievement: "Led campaign that influenced 3 parliamentary discussions",
    image: "/images/volunteers/sara.jpg",
    color: "from-[#781D32] to-[#55613C]",
    badgeColor: "bg-[#781D32]/10 text-[#781D32] border-[#781D32]/30",
  },
  {
    volunteer: "Ahmed M.",
    role: "Content Creator",
    duration: "18 months",
    story: "As a graphic designer, I wanted to use my skills for something meaningful. I've created over 200 social media graphics and 15 educational videos. The engagement we get proves that good design can make complex issues accessible.",
    achievement: "Content viewed by 500,000+ people across platforms",
    image: "/images/volunteers/ahmed.jpg",
    color: "from-[#55613C] to-[#3E442B]",
    badgeColor: "bg-[#55613C]/10 text-[#55613C] border-[#55613C]/30",
  },
  {
    volunteer: "Mika L.",
    role: "Event Coordinator",
    duration: "3 years",
    story: "I've coordinated 25+ events, from intimate gatherings to 500-person conferences. Each event brings together diverse communities and creates spaces for dialogue. The connections formed at these events ripple out into lasting change.",
    achievement: "10,000+ attendees across events organized",
    image: "/images/volunteers/mika.jpg",
    color: "from-[#3E442B] to-[#781D32]",
    badgeColor: "bg-[#3E442B]/10 text-[#3E442B] border-[#3E442B]/30",
  },
];

// FAQs
const faqs = [
  {
    question: "Do I need prior experience with Palestinian solidarity work?",
    answer: "Not at all! We welcome volunteers of all backgrounds and experience levels. We provide comprehensive training to help you understand the context and develop the skills you need. Your enthusiasm and commitment matter more than prior experience.",
  },
  {
    question: "What is the minimum time commitment?",
    answer: "It varies by role, but we typically ask for at least 2-3 hours per week for a minimum of 3 months. This allows you to make a meaningful contribution and build relationships within the team. However, we're flexible and can work with your schedule.",
  },
  {
    question: "Can I volunteer remotely if I don't live in Helsinki?",
    answer: "Yes! Many of our volunteer roles are completely remote-friendly, including social media management, content creation, translation, and tech development. We have volunteers across Finland and even internationally. Event coordination and some advocacy roles may require in-person presence.",
  },
  {
    question: "Will I receive training and support?",
    answer: "Absolutely! Every volunteer goes through a comprehensive onboarding process that includes training on Palestinian history and context, Sumud's mission and operations, and role-specific skills. You'll also be paired with an experienced mentor and have ongoing access to resources and support.",
  },
  {
    question: "What if I can only volunteer for a short period?",
    answer: "We appreciate volunteers who can commit long-term, but we also welcome short-term contributions for specific projects or events. Let us know your availability during the application process, and we'll find the best fit for your situation.",
  },
  {
    question: "Do I need to speak Arabic?",
    answer: "No! While Arabic skills are valuable for certain roles (especially translation), they're not required for most positions. We work primarily in Finnish and English, and provide all necessary context and training.",
  },
  {
    question: "How does Sumud ensure volunteer safety and well-being?",
    answer: "Volunteer safety is our top priority. We have clear code of conduct policies, harassment reporting procedures, and peer support systems. For advocacy work, we provide training on de-escalation and safety protocols. We also offer mental health resources because we understand this work can be emotionally demanding.",
  },
  {
    question: "Can I volunteer if I have a full-time job?",
    answer: "Yes! Most of our volunteers balance volunteering with full-time work, studies, or other commitments. We offer flexible scheduling, weekend opportunities, and asynchronous tasks that you can complete on your own time. Many roles involve just a few hours per week.",
  },
  {
    question: "Will volunteering with Sumud help my career?",
    answer: "Many volunteers report that their experience with Sumud has enhanced their professional skills. You'll gain experience in communications, event management, advocacy, digital marketing, and more. We're happy to provide references and recommendation letters. Some volunteers have used their experience to transition into careers in nonprofits, advocacy, and social justice.",
  },
  {
    question: "How do I know if I'm making a real impact?",
    answer: "We believe in transparency and regularly share impact metrics with our volunteer community. You'll see how your contributions translate into social media reach, event attendance, policy influence, and community engagement. We also celebrate wins together and share feedback from people whose lives we've touched.",
  },
];

export default function VolunteerLearnMorePage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4F3F0] via-white to-[#F4F3F0]" />
        <div className="absolute inset-0 glass-subtle gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center max-w-7xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="mb-6 glass-medium border-glass-glow shadow-glass-md text-[#781D32] font-bold px-4 py-2 text-sm">
              Deep Dive: Volunteering at Sumud
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-[#3E442B] mb-6 leading-tight">
              Everything You Need to Know About{" "}
              <span className="bg-gradient-to-r from-[#781D32] to-[#55613C] bg-clip-text text-transparent">
                Volunteering with Sumud
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-8">
              A comprehensive guide to understanding what it means to volunteer for Palestinian
              solidarity, what your day-to-day looks like, and how you&apos;ll grow alongside our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href="/volunteer">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#781D32] to-[#55613C] hover:from-[#781D32]/90 hover:to-[#55613C]/90 text-white font-bold rounded-full px-8 py-6 text-lg shadow-glass-xl"
                  >
                    Apply to Volunteer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <a href="mailto:volunteer@sumud.fi">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white rounded-full px-8 py-6 text-lg font-bold shadow-glass-lg"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Volunteering Means at Sumud */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              What Volunteering Means at Sumud
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Being a Sumud volunteer is more than contributing time—it&apos;s joining a movement
              for justice, becoming part of a supportive community, and making tangible impact.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {missionAlignment.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className="h-full glass-medium blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/40">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#3E442B] mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Detailed Role Breakdowns */}
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
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Detailed Role Breakdowns
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore each volunteer role in depth: responsibilities, skills, training, and the impact you&apos;ll make.
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {detailedRoles.map((role, index) => (
              <motion.div
                key={role.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="gpu-accelerated"
              >
                <Card className="glass-strong blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/50">
                  <CardContent className="p-8">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-14 h-14 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <role.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-[#3E442B] mb-2">{role.title}</h3>
                          <p className="text-gray-600 leading-relaxed mb-4">{role.impact}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`${role.badgeColor} border font-semibold`}>
                              Click to expand
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {expandedRole === role.id ? (
                        <ChevronUp className={`h-6 w-6 ${role.iconColor} flex-shrink-0 ml-4`} />
                      ) : (
                        <ChevronDown className={`h-6 w-6 ${role.iconColor} flex-shrink-0 ml-4`} />
                      )}
                    </div>

                    {expandedRole === role.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-8 pt-8 border-t border-gray-200"
                      >
                        {/* Responsibilities */}
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-[#3E442B] mb-4 flex items-center gap-2">
                            <Target className={`h-5 w-5 ${role.iconColor}`} />
                            Key Responsibilities
                          </h4>
                          <ul className="space-y-2">
                            {role.responsibilities.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${role.iconColor} flex-shrink-0 mt-0.5`} />
                                <span className="text-gray-700">{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Skills */}
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-[#3E442B] mb-4 flex items-center gap-2">
                            <Award className={`h-5 w-5 ${role.iconColor}`} />
                            Skills
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Required:</p>
                              <div className="flex flex-wrap gap-2">
                                {role.skills.required.map((skill, idx) => (
                                  <Badge key={idx} className={`${role.badgeColor} border`}>
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Preferred:</p>
                              <div className="flex flex-wrap gap-2">
                                {role.skills.preferred.map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="border-gray-300">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Training */}
                        <div>
                          <h4 className="text-lg font-bold text-[#3E442B] mb-4 flex items-center gap-2">
                            <BookOpen className={`h-5 w-5 ${role.iconColor}`} />
                            Training Provided
                          </h4>
                          <ul className="space-y-2">
                            {role.training.map((training, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <Sparkles className={`h-5 w-5 ${role.iconColor} flex-shrink-0 mt-0.5`} />
                                <span className="text-gray-700">{training}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Day in the Life */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              A Day (or Week) in the Life
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Curious what volunteering actually looks like? Here&apos;s a realistic breakdown of different volunteer roles.
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {dayInLifeScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.role}
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -4 }}
                className="gpu-accelerated"
              >
                <Card className="glass-medium blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/40">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${scenario.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <scenario.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#3E442B]">{scenario.role}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {scenario.weeklyCommitment}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {scenario.flexibility}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {scenario.timeline.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="flex-shrink-0 w-32">
                            <Badge className={`bg-gradient-to-r ${scenario.color} text-white border-0 font-semibold`}>
                              {item.time}
                            </Badge>
                          </div>
                          <div className="flex-1 glass-subtle blur-transition rounded-xl p-4 border border-white/40">
                            <p className="text-gray-700 font-medium mb-1">{item.activity}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Training and Onboarding */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4F3F0] via-white to-[#F4F3F0]" />
        <div className="absolute inset-0 glass-subtle gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Your Onboarding Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We set you up for success from day one with comprehensive training and ongoing support.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {onboardingJourney.map((phase, index) => (
              <motion.div
                key={phase.phase}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className="h-full glass-strong blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/50">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 bg-gradient-to-br ${phase.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                      <phase.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3E442B] mb-4">{phase.phase}</h3>
                    <ul className="space-y-3">
                      {phase.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 ${phase.iconColor} flex-shrink-0 mt-0.5`} />
                          <span className="text-gray-600 text-sm leading-relaxed">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community and Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Our Volunteer Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              You&apos;re never alone. Join a supportive, passionate community with resources to help you thrive.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {communitySupport.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className="h-full glass-subtle blur-transition border-glass-glow shadow-md hover:shadow-lg gpu-accelerated rounded-2xl border border-white/40">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="font-bold text-[#3E442B] mb-2 text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Impact Stories */}
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
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Real Stories, Real Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hear directly from volunteers about their experiences and the difference they&apos;ve made.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {impactStories.map((story, index) => (
              <motion.div
                key={story.volunteer}
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="gpu-accelerated"
              >
                <Card className="h-full glass-strong blur-transition border-glass-glow shadow-lg hover:shadow-xl gpu-accelerated rounded-3xl border border-white/50">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${story.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {story.volunteer.split(' ')[0].charAt(0)}{story.volunteer.split(' ')[1]?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#3E442B] text-lg">{story.volunteer}</h4>
                        <p className="text-sm text-gray-600 font-semibold">{story.role}</p>
                        <p className="text-xs text-gray-500">{story.duration}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 italic mb-6 leading-relaxed text-sm">
                      &ldquo;{story.story}&rdquo;
                    </p>

                    <div className={`glass-subtle blur-transition rounded-xl p-4 ${story.badgeColor} border`}>
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-[#781D32] flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-gray-700">{story.achievement}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#3E442B] mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions? We&apos;ve got answers.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-medium blur-transition border-glass-glow rounded-2xl border border-white/40 px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="text-left font-bold text-[#3E442B] hover:text-[#781D32] py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#781D32] via-[#781D32]/95 to-[#55613C]" />
        <div className="absolute inset-0 glass-burgundy gpu-accelerated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glass-xl backdrop-blur-xl"
              whileHover={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1.1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
            >
              <HeartHandshake className="h-10 w-10 text-white" />
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 drop-shadow-2xl">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/95 mb-10 leading-relaxed drop-shadow-lg max-w-2xl mx-auto">
              Join 150+ passionate volunteers making a real difference. Your journey toward meaningful impact starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href="/volunteer">
                  <Button
                    size="lg"
                    className="bg-white text-[#781D32] hover:bg-white/95 font-bold rounded-full px-10 py-7 text-lg shadow-glass-2xl"
                  >
                    <Heart className="mr-2 h-6 w-6" />
                    Apply Now
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <a href="mailto:volunteer@sumud.fi">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#781D32] rounded-full px-10 py-7 text-lg font-bold shadow-glass-xl"
                  >
                    <Mail className="mr-2 h-6 w-6" />
                    Email Us
                  </Button>
                </a>
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-white/90">
              <Phone className="h-4 w-4" />
              <span>Questions? Reach out at volunteer@sumud.fi</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
