"use client";

import React from "react";
import { Link } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";

export default function MembershipPage() {
  const locale = useLocale();

  // Public Flomembers join URL provided by the user
  const flomembersUrl =
    "https://fork.flomembers.com/sumud-suomen-palestiina-verkosto/join";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#3E442B] mb-2">Become a Member</h1>
          <p className="text-lg text-gray-600">
            Join Sumud to support our work. Fill out the form below to become a
            member.
          </p>
        </header>

        {/* Fallback / small note */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              If the form doesn&#39;t load, open it in a new tab:
            </p>
            <Link
              href={flomembersUrl}
              className="inline-block text-[#781D32] font-medium hover:underline"
            >
              Open membership form
            </Link>
          </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Responsive iframe container */}
          <div className="relative" style={{ paddingTop: "75%" }}>
            <iframe
                src={flomembersUrl}
                width="100%"
                height="500"
                title="Member Registration Form"
                className="border-0"
            />
          </div>

          
        </div>
      </div>
    </div>
  );
}
