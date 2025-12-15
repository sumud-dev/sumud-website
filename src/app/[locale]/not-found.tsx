"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Home, Search } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export default function LocaleNotFound() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4] flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-[#781D32] mb-4">404</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#781D32] to-[#55613C] mx-auto rounded-full" />
          </div>

          <h2 className="text-4xl font-bold text-[#3E442B] mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button className="bg-[#781D32] hover:bg-[#781D32]/90 text-white px-8 py-2 w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>

            <Link href="/campaigns">
              <Button
                variant="outline"
                className="border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white px-8 py-2 w-full sm:w-auto"
              >
                <Search className="w-4 h-4 mr-2" />
                Explore Campaigns
              </Button>
            </Link>
          </div>

          <div
            className="backdrop-blur-xl rounded-3xl p-8"
            style={{
              background: "rgba(255, 255, 255, 0.80)",
              border: "0.5px solid rgba(232, 220, 196, 0.4)",
              boxShadow:
                "0 10px 15px -3px rgba(120, 29, 50, 0.08), 0 4px 6px -2px rgba(120, 29, 50, 0.04)",
            }}
          >
            <h3 className="text-xl font-bold text-[#3E442B] mb-4">
              Try These Instead
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/about" className="text-[#781D32] hover:underline font-medium">
                  → Learn About Sumud
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#781D32] hover:underline font-medium">
                  → Get In Touch
                </Link>
              </li>
              <li>
                <Link href="/membership" className="text-[#781D32] hover:underline font-medium">
                  → Become a Member
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </>
  );
}
