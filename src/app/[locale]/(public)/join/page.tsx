"use client";

import React, { useState } from "react";
import { Link } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Heart,
  Check,
  Loader2,
  Shield,
  ChevronRight,
  HandHeart,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils/utils";

// Animation variants
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

// Donation amounts
const DONATION_AMOUNTS = [15, 25, 50, 100, 250];

export default function JoinPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState<"one_time" | "monthly">(
    "monthly",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDonate = async () => {
    const amount =
      selectedAmount === null ? parseFloat(customAmount) : selectedAmount;

    if (!amount || amount <= 0) {
      return;
    }

    setIsLoading(true);

    // Simulate donation processing
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  // Success state
  if (isSubmitted) {
    return (
        <div className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#781D32] to-[#55613C] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-white" />
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-4">
                Thank You for Your Support!
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                Your contribution makes a real difference in our mission to
                support Palestinian rights and build bridges between
                communities.
              </p>

              <Card className="glass-strong blur-transition border-glass-glow shadow-glass-lg gpu-accelerated rounded-2xl mb-8">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-[#3E442B] mb-4">
                      What happens next?
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center justify-center">
                        <Check className="h-4 w-4 text-[#55613C] mr-2" />
                        Email confirmation sent to your inbox
                      </li>
                      <li className="flex items-center justify-center">
                        <Check className="h-4 w-4 text-[#55613C] mr-2" />
                        Receipt for tax-deduction purposes
                      </li>
                      <li className="flex items-center justify-center">
                        <Check className="h-4 w-4 text-[#55613C] mr-2" />
                        Monthly updates on how your contribution helps
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#781D32] hover:bg-[#781D32]/90 text-white"
                >
                  <Link href="/">Return to Home</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white"
                >
                  <Link href="/membership">Become a Full Member</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4]">
        {/* Hero Section with Liquid Glass - Petitions Style */}
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                <Heart className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                Join the Movement
                <span className="block text-3xl lg:text-4xl font-medium opacity-90 mt-3">
                  Support Palestinian Rights
                </span>
              </h1>

              <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
                Your contribution helps us advocate for justice, organize
                events, and build bridges between communities
              </p>
            </motion.div>
          </div>
        </motion.section>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Donation Card */}
            <motion.div
              className="lg:col-span-2"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Card className="glass-strong blur-transition border-glass-glow shadow-glass-xl gpu-accelerated rounded-2xl">
                <CardContent className="p-8">
                  {/* Donation Type Selection */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#3E442B] mb-6">
                      Choose Your Support Type
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setDonationType("monthly")}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all duration-200 text-left blur-transition gpu-accelerated",
                          donationType === "monthly"
                            ? "glass-strong border-glass-glow shadow-glass-xl ring-2 ring-[#781D32]/30"
                            : "glass-medium border-glass-glow shadow-glass-lg hover:shadow-glass-xl hover:glass-hover-intense",
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#781D32] to-[#55613C] rounded-lg flex items-center justify-center">
                            <Heart className="h-6 w-6 text-white" />
                          </div>
                          {donationType === "monthly" && (
                            <Check className="h-5 w-5 text-[#781D32]" />
                          )}
                        </div>
                        <h3 className="font-bold text-[#3E442B] mb-2">
                          Monthly Support
                        </h3>
                        <p className="text-sm text-gray-600">
                          Recurring contribution that provides steady support
                          for our ongoing work
                        </p>
                        <Badge className="mt-3 bg-[#781D32] text-white text-xs">
                          Most impactful
                        </Badge>
                      </button>

                      <button
                        onClick={() => setDonationType("one_time")}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all duration-200 text-left blur-transition gpu-accelerated",
                          donationType === "one_time"
                            ? "glass-strong border-glass-glow shadow-glass-xl ring-2 ring-[#781D32]/30"
                            : "glass-medium border-glass-glow shadow-glass-lg hover:shadow-glass-xl hover:glass-hover-intense",
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#55613C] to-[#3E442B] rounded-lg flex items-center justify-center">
                            <HandHeart className="h-6 w-6 text-white" />
                          </div>
                          {donationType === "one_time" && (
                            <Check className="h-5 w-5 text-[#781D32]" />
                          )}
                        </div>
                        <h3 className="font-bold text-[#3E442B] mb-2">
                          One-Time Donation
                        </h3>
                        <p className="text-sm text-gray-600">
                          Single contribution to support a specific campaign or
                          initiative
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[#3E442B] mb-4">
                      Select Amount (EUR)
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                      {DONATION_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount("");
                          }}
                          className={cn(
                            "py-4 px-4 rounded-xl border-2 font-semibold transition-all duration-200",
                            selectedAmount === amount
                              ? "border-[#781D32] bg-[#781D32]/5 text-[#781D32] shadow-md"
                              : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                          )}
                        >
                          €{amount}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div>
                      <button
                        onClick={() => setSelectedAmount(null)}
                        className={cn(
                          "w-full py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 mb-3",
                          selectedAmount === null
                            ? "border-[#781D32] bg-[#781D32]/5 text-[#781D32]"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        Custom Amount
                      </button>

                      {selectedAmount === null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                              €
                            </span>
                            <input
                              type="number"
                              placeholder="Enter amount"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#781D32] focus:ring-2 focus:ring-[#781D32]/20 outline-none transition-all duration-200 text-lg font-medium"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Impact Preview */}
                  {(selectedAmount || customAmount) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 bg-[#55613C]/5 rounded-2xl border border-[#55613C]/20"
                    >
                      <h4 className="font-semibold text-[#3E442B] mb-2">
                        Your Impact
                      </h4>
                      <p className="text-sm text-gray-600">
                        {donationType === "monthly"
                          ? `€${selectedAmount || customAmount} per month helps us organize regular events, maintain our advocacy campaigns, and support local chapters across Finland.`
                          : `€${selectedAmount || customAmount} can fund educational materials, support event costs, or contribute to specific advocacy initiatives.`}
                      </p>
                    </motion.div>
                  )}

                  {/* Donate Button */}
                  <Button
                    onClick={handleDonate}
                    disabled={isLoading || (!selectedAmount && !customAmount)}
                    size="lg"
                    className="w-full bg-[#781D32] hover:bg-[#781D32]/90 text-white h-14 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2
                          className={`${isRtl ? "ml-2" : "mr-2"} h-5 w-5 animate-spin`}
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart
                          className={`${isRtl ? "ml-2" : "mr-2"} h-5 w-5`}
                        />
                        {donationType === "monthly"
                          ? "Start Monthly Support"
                          : "Donate Now"}
                      </>
                    )}
                  </Button>

                  {/* Trust Badge */}
                  <div className="mt-6 pt-6 border-t border-gray-200/60">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-[#55613C]" />
                      <span>
                        Secure payment • Tax-deductible • 100% goes to our
                        mission
                      </span>
                    </div>
                  </div>

                  {/* Full Membership CTA */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-[#781D32]/5 to-[#55613C]/5 rounded-xl border border-[#781D32]/20">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Want to get more involved?</strong>
                    </p>
                    <Link
                      href="/membership"
                      className="text-sm text-[#781D32] hover:text-[#781D32]/80 font-medium inline-flex items-center transition-colors"
                    >
                      Become a full member with voting rights and exclusive
                      benefits
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Why Support Card */}
              <motion.div variants={fadeInUp}>
                <Card className="glass-subtle blur-transition border-glass-glow shadow-glass-md hover:glass-medium hover:shadow-glass-lg gpu-accelerated rounded-2xl bg-gradient-to-br from-[#781D32]/5 to-[#55613C]/5">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-[#3E442B] mb-4">
                      Why Support Sumud?
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-[#55613C] mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          Grassroots advocacy for Palestinian human rights
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-[#55613C] mr-2 mt-0.5 flex-shrink-0" />
                        <span>Educational programs and cultural events</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-[#55613C] mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          Building solidarity across Finnish communities
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-[#55613C] mr-2 mt-0.5 flex-shrink-0" />
                        <span>Supporting local chapters nationwide</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Support */}
              <motion.div variants={fadeInUp}>
                <Card className="glass-subtle blur-transition border-glass-glow shadow-glass-md hover:glass-medium hover:shadow-glass-lg gpu-accelerated rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-[#3E442B] mb-3">
                      Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Have questions about donations or membership?
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white"
                    >
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
