"use client";

import React from "react";
import { ExternalLink, CheckCircle, Users, Heart, Calendar } from "lucide-react";

export default function MembershipPage() {
  const flomembersUrl =
    "https://fork.flomembers.com/sumud-suomen-palestiina-verkosto/join";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3E442B] mb-4">
            Become a Member
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join Sumud to support our work for Palestinian rights and solidarity.
          </p>
        </header>

        {/* Benefits Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-[#3E442B] mb-6 text-center">
            Why Join Us?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <Users className="w-6 h-6 text-[#781D32] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Be Part of the Movement
                </h3>
                <p className="text-gray-600 text-sm">
                  Join a community dedicated to Palestinian solidarity and justice.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-[#781D32] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Support Our Campaigns
                </h3>
                <p className="text-gray-600 text-sm">
                  Help us organize events, campaigns, and advocacy efforts.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calendar className="w-6 h-6 text-[#781D32] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Exclusive Events
                </h3>
                <p className="text-gray-600 text-sm">
                  Get access to member-only events and networking opportunities.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-[#781D32] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Make a Difference
                </h3>
                <p className="text-gray-600 text-sm">
                  Your membership directly supports our mission and activities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-gradient-to-br from-[#781D32] to-[#5c1626] text-white shadow-lg rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Complete your registration through our secure membership portal.
          </p>
          <a
            href={flomembersUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-[#781D32] font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
          >
            Open Registration Form <ExternalLink className="w-5 h-5" />
          </a>
          <p className="text-sm mt-6 opacity-75">
            The form will open in a new tab for secure registration.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Questions about membership?{" "}
            <a href="/contact" className="text-[#781D32] hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
