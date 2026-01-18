"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";

interface ShareButtonsProps {
  campaign: {
    title: string;
    slug: string;
    shortDescription: string;
  };
}

export default function ShareButtons({ campaign }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/campaigns/${campaign.slug}`);
  }, [campaign.slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(campaign.title)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(`Check out this campaign: ${campaign.shortDescription}\n\n${shareUrl}`)}`;
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/40 rounded-full px-6 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Share Campaign
      </Button>

      {/* Share Menu */}
      {showShareMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute top-full mt-3 left-0 bg-white/95 backdrop-blur-2xl rounded-2xl border border-gray-200/60 shadow-2xl p-4 min-w-[280px] z-50"
        >
          <div className="space-y-2">
            <button
              onClick={handleShareFacebook}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Share on Facebook
              </span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#1da1f2] flex items-center justify-center">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Share on Twitter
              </span>
            </button>

            <button
              onClick={handleShareEmail}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Share via Email
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {copied ? "Link Copied!" : "Copy Link"}
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
