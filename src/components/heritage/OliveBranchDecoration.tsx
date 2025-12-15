"use client";

import React from "react";
import { motion } from "framer-motion";

interface OliveBranchDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

/**
 * Olive Branch SVG decoration component
 * Represents peace and Palestinian heritage
 */
export const OliveBranchDecoration: React.FC<OliveBranchDecorationProps> = ({
  position,
  className = "",
}) => {
  const positionClasses = {
    "top-left": "top-0 left-0 rotate-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <motion.svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-20"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main branch */}
        <path
          d="M50 250 Q100 200, 150 150 T250 50"
          stroke="#3E442B"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Olive leaves - left side */}
        <ellipse cx="80" cy="220" rx="20" ry="8" fill="#55613C" opacity="0.7" transform="rotate(-30 80 220)" />
        <ellipse cx="70" cy="235" rx="18" ry="7" fill="#3E442B" opacity="0.6" transform="rotate(-40 70 235)" />
        <ellipse cx="95" cy="210" rx="22" ry="9" fill="#55613C" opacity="0.8" transform="rotate(-25 95 210)" />

        <ellipse cx="110" cy="185" rx="20" ry="8" fill="#3E442B" opacity="0.7" transform="rotate(-35 110 185)" />
        <ellipse cx="100" cy="200" rx="19" ry="8" fill="#55613C" opacity="0.6" transform="rotate(-45 100 200)" />
        <ellipse cx="125" cy="175" rx="21" ry="9" fill="#3E442B" opacity="0.8" transform="rotate(-30 125 175)" />

        {/* Olive leaves - middle */}
        <ellipse cx="140" cy="160" rx="20" ry="8" fill="#55613C" opacity="0.7" transform="rotate(-40 140 160)" />
        <ellipse cx="130" cy="170" rx="18" ry="7" fill="#3E442B" opacity="0.6" transform="rotate(-50 130 170)" />
        <ellipse cx="155" cy="150" rx="22" ry="9" fill="#55613C" opacity="0.8" transform="rotate(-35 155 150)" />

        <ellipse cx="170" cy="130" rx="20" ry="8" fill="#3E442B" opacity="0.7" transform="rotate(-45 170 130)" />
        <ellipse cx="160" cy="145" rx="19" ry="8" fill="#55613C" opacity="0.6" transform="rotate(-55 160 145)" />
        <ellipse cx="185" cy="120" rx="21" ry="9" fill="#3E442B" opacity="0.8" transform="rotate(-40 185 120)" />

        {/* Olive leaves - top */}
        <ellipse cx="200" cy="100" rx="20" ry="8" fill="#55613C" opacity="0.7" transform="rotate(-50 200 100)" />
        <ellipse cx="190" cy="110" rx="18" ry="7" fill="#3E442B" opacity="0.6" transform="rotate(-60 190 110)" />
        <ellipse cx="215" cy="90" rx="22" ry="9" fill="#55613C" opacity="0.8" transform="rotate(-45 215 90)" />

        <ellipse cx="230" cy="70" rx="20" ry="8" fill="#3E442B" opacity="0.7" transform="rotate(-55 230 70)" />
        <ellipse cx="220" cy="80" rx="19" ry="8" fill="#55613C" opacity="0.6" transform="rotate(-65 220 80)" />

        {/* Olives (small circles) */}
        <circle cx="105" cy="195" r="5" fill="#55613C" opacity="0.9" />
        <circle cx="120" cy="180" r="4" fill="#3E442B" opacity="0.8" />
        <circle cx="145" cy="155" r="5" fill="#55613C" opacity="0.9" />
        <circle cx="175" cy="125" r="4" fill="#3E442B" opacity="0.8" />
        <circle cx="205" cy="95" r="5" fill="#55613C" opacity="0.9" />
        <circle cx="225" cy="75" r="4" fill="#3E442B" opacity="0.8" />
      </motion.svg>
    </motion.div>
  );
};

export default OliveBranchDecoration;
