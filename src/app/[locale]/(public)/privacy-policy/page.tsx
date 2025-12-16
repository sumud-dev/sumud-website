"use client";

import React from "react";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Clock, FileText } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

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

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 23, 2025";

  return (
    <>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Title Section */}
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#781D32] to-[#55613C] rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3E442B]">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how Sumud
              collects, uses, and protects your personal information.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </motion.div>

          {/* Quick Overview */}
          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-[#55613C]/20 bg-gradient-to-br from-[#781D32]/5 to-[#55613C]/5">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#3E442B] mb-4">
                  Quick Overview
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#55613C] rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>
                      We collect only the information necessary to provide our
                      services
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#55613C] rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>
                      Your data is never sold or shared with third parties for
                      commercial purposes
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#55613C] rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>
                      You can request access to, correction, or deletion of your
                      data at any time
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#55613C] rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>
                      We use industry-standard security measures to protect your
                      information
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={fadeInUp} className="space-y-8">
            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Personal Information You Provide
                  </h3>
                  <p className="mb-3">
                    When you interact with our services, we may collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Membership Registration:</strong> Name, email
                      address, phone number (optional), address (optional),
                      membership preferences, local chapter selection
                    </li>
                    <li>
                      <strong>Petition Signatures:</strong> Name, email address,
                      age confirmation
                    </li>
                    <li>
                      <strong>Communications:</strong> When you contact us via
                      email, forms, or other channels
                    </li>
                    <li>
                      <strong>Newsletter Subscriptions:</strong> Email address
                      and communication preferences
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP address and general location information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on our website</li>
                    <li>Referring website information</li>
                    <li>Device information (type, operating system)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  2. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Primary Uses
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      Process membership applications and maintain member
                      records
                    </li>
                    <li>
                      Track petition signatures and maintain campaign records
                    </li>
                    <li>
                      Send newsletters and campaign updates (with your consent)
                    </li>
                    <li>
                      Respond to your inquiries and provide customer support
                    </li>
                    <li>Improve our website and services</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Legal Basis for Processing (GDPR)
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Consent:</strong> Newsletter subscriptions,
                      optional data collection
                    </li>
                    <li>
                      <strong>Contract:</strong> Membership services and related
                      communications
                    </li>
                    <li>
                      <strong>Legitimate Interest:</strong> Website analytics,
                      security, fraud prevention
                    </li>
                    <li>
                      <strong>Legal Obligation:</strong> Record-keeping, tax
                      requirements
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  3. Information Sharing and Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <p className="mb-3">
                    We do not sell, trade, or rent your personal information to
                    third parties. We may share your information only in the
                    following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Local Chapters:</strong> If you join a local
                      chapter, we may share your contact information with that
                      chapter&apos;s coordinators
                    </li>
                    <li>
                      <strong>Service Providers:</strong> Trusted third parties
                      who assist with website hosting, email services, and
                      payment processing (under strict confidentiality
                      agreements)
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law,
                      regulation, or court order
                    </li>
                    <li>
                      <strong>Safety and Security:</strong> To protect the
                      rights, property, or safety of Sumud, our members, or
                      others
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Public Information
                  </h3>
                  <p>
                    Petition signatures may include your name in public counts,
                    but email addresses are never made public. You can choose to
                    sign petitions anonymously if preferred.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  4. Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate technical and organizational security
                  measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure database storage with access controls</li>
                  <li>Regular security updates and monitoring</li>
                  <li>
                    Limited access to personal data on a need-to-know basis
                  </li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
                <p className="mt-3">
                  While we strive to protect your personal information, no
                  method of transmission over the internet or electronic storage
                  is 100% secure. We cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  5. Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Under GDPR and Finnish Law, You Have the Right To:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Access:</strong> Request a copy of the personal
                      data we hold about you
                    </li>
                    <li>
                      <strong>Rectification:</strong> Request correction of
                      inaccurate or incomplete data
                    </li>
                    <li>
                      <strong>Erasure:</strong> Request deletion of your
                      personal data (subject to legal requirements)
                    </li>
                    <li>
                      <strong>Restriction:</strong> Request limitation of
                      processing in certain circumstances
                    </li>
                    <li>
                      <strong>Portability:</strong> Receive your data in a
                      structured, machine-readable format
                    </li>
                    <li>
                      <strong>Objection:</strong> Object to processing based on
                      legitimate interests
                    </li>
                    <li>
                      <strong>Withdraw Consent:</strong> Withdraw consent for
                      processing at any time
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    How to Exercise Your Rights
                  </h3>
                  <p>
                    Contact us at <strong>privacy@sumud.fi</strong> or use the
                    contact information below. We will respond to your request
                    within 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  6. Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Member Records:</strong> Retained while membership
                    is active and for 7 years after termination for legal and
                    tax purposes
                  </li>
                  <li>
                    <strong>Petition Signatures:</strong> Retained indefinitely
                    as they represent public expressions of support, unless you
                    request removal
                  </li>
                  <li>
                    <strong>Newsletter Subscriptions:</strong> Until you
                    unsubscribe
                  </li>
                  <li>
                    <strong>Website Analytics:</strong> Aggregated data retained
                    for 2 years
                  </li>
                  <li>
                    <strong>Contact Communications:</strong> Retained for 3
                    years
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  7. International Data Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our primary data processing occurs within the European Union.
                  If we transfer data outside the EU, we ensure appropriate
                  safeguards are in place, such as:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>Adequacy decisions by the European Commission</li>
                  <li>Other appropriate safeguards under GDPR</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  8. Cookies and Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar technologies to improve your
                  experience on our website:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic
                    website functionality
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    visitors use our site
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings
                    and preferences
                  </li>
                </ul>
                <p className="mt-3">
                  You can control cookies through your browser settings.
                  Disabling certain cookies may affect website functionality.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  9. Children&apos;s Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our services are not directed to children under 16. We do not
                  knowingly collect personal information from children under 16.
                  If you believe we have inadvertently collected such
                  information, please contact us immediately so we can delete
                  it.
                </p>
                <p>
                  For petition signatures, we require confirmation that signers
                  are 18 or older.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  10. Changes to This Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  We may update this privacy policy from time to time. We will
                  notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Posting the updated policy on our website</li>
                  <li>
                    Sending an email notification to members (for significant
                    changes)
                  </li>
                  <li>Including a notice in our newsletter</li>
                </ul>
                <p className="mt-3">
                  Continued use of our services after changes become effective
                  constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-[#55613C]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#3E442B]">
                  11. Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Data Controller
                  </h3>
                  <p>
                    <strong>Sumud ry</strong>
                    <br />
                    Helsinki, Finland
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    Privacy Questions and Requests
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-[#781D32]" />
                    <a
                      href="mailto:privacy@sumud.fi"
                      className="text-[#781D32] hover:text-[#781D32]/80 transition-colors"
                    >
                      privacy@sumud.fi
                    </a>
                  </div>
                  <p className="text-sm text-gray-600">
                    Please include &quot;Privacy Request&quot; in the subject
                    line and provide details about your request.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#3E442B] mb-2">
                    General Contact
                  </h3>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#781D32]" />
                    <a
                      href="mailto:info@sumud.fi"
                      className="text-[#781D32] hover:text-[#781D32]/80 transition-colors"
                    >
                      info@sumud.fi
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    If you are not satisfied with our response to your privacy
                    concerns, you have the right to lodge a complaint with the
                    Finnish Data Protection Authority (Tietosuojavaltuutettu).
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Card */}
          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-[#781D32]/20 bg-gradient-to-br from-[#781D32]/5 to-[#55613C]/5">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#781D32] to-[#55613C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#3E442B] mb-2">
                  Questions About Your Privacy?
                </h3>
                <p className="text-gray-600 mb-4">
                  We&apos;re committed to transparency and protecting your
                  rights. Contact us if you have any questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    className="bg-[#781D32] hover:bg-[#781D32]/90 text-white"
                  >
                    <a href="mailto:privacy@sumud.fi">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Privacy Team
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white"
                  >
                    <Link href="/">Return to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
