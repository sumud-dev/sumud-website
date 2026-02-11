"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  PenLine,
  Check,
  Loader2,
  Users,
  Target,
  Mail,
  Globe,
  MessageSquare,
  Share2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { fadeInUp, staggerContainer, defaultTransition } from "@/src/lib/utils/animations";

// Mock petition data
const MOCK_PETITIONS: Record<string, any> = {
  "end-gaza-blockade": {
    title: "End the Gaza Blockade Now",
    description: `
      <p>The Gaza Strip has been under a devastating blockade for over 17 years, severely restricting the movement of people and goods. This humanitarian crisis has affected over 2 million Palestinians, limiting access to essential services, medical care, and economic opportunities.</p>
      <p>We call on the international community to take immediate action to end this blockade and ensure the basic human rights and dignity of the Palestinian people in Gaza.</p>
      <p>Your signature can make a difference. Join thousands of people worldwide demanding justice and freedom for Gaza.</p>
    `,
    goal: "Pressure international bodies and governments to take concrete steps toward ending the blockade of Gaza and ensuring humanitarian access.",
    recipient: "United Nations, European Union, and International Community",
    targetSignatures: 50000,
    signatureCount: 32847,
    status: "active",
    category: "Humanitarian",
    featuredImage: "/images/petitions/gaza-blockade.jpg",
  },
  "protect-palestinian-journalists": {
    title: "Protect Palestinian Journalists",
    description: `
      <p>Palestinian journalists face unprecedented dangers while documenting the reality on the ground. Many have been killed, injured, or detained simply for doing their job - reporting the truth.</p>
      <p>Press freedom is a fundamental human right. We demand international protection for Palestinian journalists and accountability for those who target them.</p>
    `,
    goal: "Secure international protection mechanisms for Palestinian journalists and ensure their safety while reporting.",
    recipient: "International Federation of Journalists, UN Human Rights Council",
    targetSignatures: 25000,
    signatureCount: 18923,
    status: "active",
    category: "Press Freedom",
    featuredImage: "/images/petitions/journalists.jpg",
  },
  "save-sheikh-jarrah": {
    title: "Save Sheikh Jarrah Families",
    description: `
      <p>Palestinian families in Sheikh Jarrah, East Jerusalem, face forced displacement from homes they've lived in for generations. This is part of a systematic effort to change the demographic character of Jerusalem.</p>
      <p>These families deserve to live in peace and security in their own homes. Stand with Sheikh Jarrah and demand an end to forced displacements.</p>
    `,
    goal: "Stop the forced evictions of Palestinian families from Sheikh Jarrah and preserve their right to their homes.",
    recipient: "International Court of Justice, United Nations",
    targetSignatures: 100000,
    signatureCount: 67234,
    status: "active",
    category: "Housing Rights",
    featuredImage: "/images/petitions/sheikh-jarrah.jpg",
  },
};

// Mock signatures
const generateMockSignatures = (count: number) => {
  const names = [
    "Sarah Ahmed", "Mohammed Hassan", "Layla Ibrahim", "Omar Khalil", "Fatima Nasser",
    "Yousef Mansour", "Huda Salem", "Tariq Rahman", "Amira Farah", "Karim Suleiman",
    "Noor Haddad", "Rami Qasim", "Dalia Mustafa", "Jamal Zaki", "Samira Habib"
  ];
  const countries = [
    "Palestine", "United States", "United Kingdom", "Canada", "France",
    "Germany", "Spain", "Italy", "Netherlands", "Sweden",
    "Norway", "Australia", "New Zealand", "Brazil", "Mexico"
  ];
  const comments = [
    "Freedom for Palestine! We stand with you in solidarity.",
    "This injustice must end. The world is watching.",
    "May peace and justice prevail for all Palestinians.",
    "Human rights are not negotiable. Stand with Palestine.",
    "Every signature counts. Together we can make a difference.",
    "The Palestinian people deserve freedom and dignity.",
    "Supporting this cause with all my heart.",
    "Justice delayed is justice denied. Act now!",
    "In solidarity with the Palestinian people.",
    "May this petition bring real change.",
    "",
    "",
    ""
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `sig-${i}`,
    name: names[Math.floor(Math.random() * names.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    comment: comments[Math.floor(Math.random() * comments.length)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export default function PetitionDetailPage() {
  const params = useParams();
  const t = useTranslations("petition");
  const slug = params?.slug as string;

  // Get petition data
  const petition = MOCK_PETITIONS[slug] || MOCK_PETITIONS["end-gaza-blockade"];
  const signatures = generateMockSignatures(15);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    comment: "",
    displayPublicly: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAllSignatures, setShowAllSignatures] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // Calculate progress percentage
  const progressPercentage = Math.min(
    (petition.signatureCount / petition.targetSignatures) * 100,
    100
  );

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(progressPercentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.email) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/petition"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Petitions
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#781D32] text-white px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm border-0 flex items-center gap-2">
                <PenLine className="w-4 h-4" />
                {petition.status === "active" ? "Active Petition" : petition.status}
              </Badge>
              <Badge className="bg-[#55613C]/10 text-[#55613C] px-4 py-1.5 text-sm font-medium rounded-full border border-[#55613C]/20">
                {petition.category}
              </Badge>
            </div>

            {/* Petition Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              {petition.title}
            </h1>

            {/* Signature Count Card */}
            <Card className="glass-strong blur-transition border-glass-glow shadow-glass-lg gpu-accelerated rounded-2xl mb-6 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <motion.div
                      className="text-5xl font-bold bg-gradient-to-br from-[#781D32] to-[#55613C] bg-clip-text text-transparent count-up"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      {petition.signatureCount.toLocaleString()}
                    </motion.div>
                    <div className="text-sm text-gray-600 mt-1">
                      signatures of {petition.targetSignatures.toLocaleString()} goal
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#55613C]">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-sm text-gray-600">completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #781D32 0%, #55613C 100%)",
                      width: `${progressWidth}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressWidth}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About This Petition */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong blur-transition border-glass-glow shadow-glass-lg gpu-accelerated rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#781D32]/10">
                      <MessageSquare className="w-6 h-6 text-[#781D32]" />
                    </div>
                    About This Petition
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: petition.description }}
                  />

                  {/* Goal Section */}
                  <div className="p-6 bg-[#55613C]/5 rounded-2xl border border-[#55613C]/20 mb-6">
                    <div className="flex items-start gap-3">
                      <Target className="w-6 h-6 text-[#55613C] shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-[#3E442B] mb-2">Our Goal</h3>
                        <p className="text-gray-700 leading-relaxed">{petition.goal}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Section */}
                  <div className="p-6 bg-[#781D32]/5 rounded-2xl border border-[#781D32]/20">
                    <div className="flex items-start gap-3">
                      <Mail className="w-6 h-6 text-[#781D32] shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-[#3E442B] mb-2">
                          Petition Recipient
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {petition.recipient}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Signatures */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="glass-medium blur-transition border-glass-glow shadow-glass-lg gpu-accelerated rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-[#781D32]" />
                    Recent Signatures
                  </h2>

                  <div className="space-y-4">
                    {signatures
                      .slice(0, showAllSignatures ? 15 : 10)
                      .map((signature, index) => (
                        <motion.div
                          key={signature.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-gray-200/60 hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Avatar */}
                          <div
                            className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{
                              background:
                                "linear-gradient(135deg, #781D32 0%, #55613C 100%)",
                            }}
                          >
                            {signature.name.charAt(0)}
                          </div>

                          {/* Signature Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {signature.name}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Globe className="w-3 h-3" />
                                {signature.country}
                              </div>
                            </div>
                            {signature.comment && (
                              <p className="text-sm text-gray-700 italic leading-relaxed">
                                "{signature.comment}"
                              </p>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(signature.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  {/* Show More Button */}
                  {!showAllSignatures && signatures.length > 10 && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => setShowAllSignatures(true)}
                        variant="outline"
                        className="rounded-full px-6 border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white"
                      >
                        Show More Signatures
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar Form (1/3) */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-8"
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-strong blur-transition border-glass-glow shadow-glass-xl gpu-accelerated rounded-2xl">
                <CardContent className="p-8">
                  {isSuccess ? (
                    /* Success State */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-[#781D32] to-[#55613C] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-[#3E442B] mb-4">
                        Thank You!
                      </h3>

                      <p className="text-gray-600 mb-8 leading-relaxed">
                        Your signature has been added successfully. Together, we are
                        making a difference for Palestine.
                      </p>

                      <Button
                        asChild
                        className="w-full bg-[#781D32] hover:bg-[#781D32]/90 text-white rounded-full h-12"
                      >
                        <Link href="/petition">Sign Another Petition</Link>
                      </Button>
                    </motion.div>
                  ) : (
                    /* Form State */
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-[#3E442B] mb-2">
                          Sign This Petition
                        </h3>
                        <p className="text-sm text-gray-600">
                          Add your voice to this cause
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                          <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-gray-300 focus:border-[#781D32] focus:ring-[#781D32]"
                            placeholder="Enter your name"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-gray-300 focus:border-[#781D32] focus:ring-[#781D32]"
                            placeholder="your@email.com"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Country (Optional)
                          </label>
                          <Input
                            id="country"
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-gray-300 focus:border-[#781D32] focus:ring-[#781D32]"
                            placeholder="Your country"
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <label
                            htmlFor="comment"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Comment (Optional)
                          </label>
                          <Textarea
                            id="comment"
                            name="comment"
                            value={formData.comment}
                            onChange={handleInputChange}
                            maxLength={500}
                            rows={4}
                            className="w-full rounded-xl border-gray-300 focus:border-[#781D32] focus:ring-[#781D32] resize-none"
                            placeholder="Share why you're signing this petition..."
                          />
                          <div className="text-xs text-gray-500 mt-1 text-right">
                            {formData.comment.length}/500
                          </div>
                        </div>

                        {/* Display Publicly Checkbox */}
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="displayPublicly"
                            checked={formData.displayPublicly}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                displayPublicly: checked as boolean,
                              }))
                            }
                            className="mt-0.5"
                          />
                          <label
                            htmlFor="displayPublicly"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Display my name publicly on this petition
                          </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#781D32] hover:bg-[#781D32]/90 text-white h-12 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Signing...
                            </>
                          ) : (
                            <>
                              <PenLine className="mr-2 h-5 w-5" />
                              Sign Petition
                            </>
                          )}
                        </Button>

                        {/* Privacy Notice */}
                        <p className="text-xs text-gray-600 text-center leading-relaxed">
                          By signing, you agree to receive updates about this petition
                          and related causes. Your email will be kept private.
                        </p>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Share Card */}
              {!isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="glass-medium blur-transition border-glass-glow shadow-glass-md gpu-accelerated rounded-2xl mt-6">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-[#3E442B] mb-4">
                        Share This Petition
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-full border-[#781D32]/30 text-[#781D32] hover:bg-[#781D32] hover:text-white"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-full border-[#55613C]/30 text-[#55613C] hover:bg-[#55613C] hover:text-white"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Facebook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
