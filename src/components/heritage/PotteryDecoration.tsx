"use client";

import React from "react";
import { motion } from "framer-motion";

interface PotteryDecorationProps {
  position: "bottom-left" | "bottom-right";
  className?: string;
}

/**
 * Traditional Palestinian pottery and ceramic motif decoration
 */
export const PotteryDecoration: React.FC<PotteryDecorationProps> = ({
  position,
  className = "",
}) => {
  const positionClasses = {
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
    >
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-15"
        animate={{
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main pottery vessel shape */}
        <path
          d="M70 50 L75 45 L125 45 L130 50 L135 70 L140 100 L138 130 L130 150 L100 165 L70 150 L62 130 L60 100 L65 70 Z"
          fill="#3E442B"
          opacity="0.6"
        />

        {/* Inner vessel detail */}
        <path
          d="M80 55 L83 52 L117 52 L120 55 L124 70 L128 100 L126 125 L120 140 L100 152 L80 140 L74 125 L72 100 L76 70 Z"
          fill="#55613C"
          opacity="0.4"
        />

        {/* Vessel opening */}
        <ellipse
          cx="100"
          cy="48"
          rx="25"
          ry="5"
          fill="#F4F3F0"
          opacity="0.3"
        />

        {/* Decorative bands */}
        <path
          d="M68 75 Q100 72, 132 75"
          stroke="#781D32"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M66 85 Q100 82, 134 85"
          stroke="#781D32"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />

        {/* Geometric patterns on pottery */}
        <g opacity="0.4">
          {/* Diamond pattern */}
          <path d="M100 95 L107 105 L100 115 L93 105 Z" fill="none" stroke="#781D32" strokeWidth="1.5" />
          <path d="M115 95 L122 105 L115 115 L108 105 Z" fill="none" stroke="#781D32" strokeWidth="1.5" />
          <path d="M85 95 L92 105 L85 115 L78 105 Z" fill="none" stroke="#781D32" strokeWidth="1.5" />

          {/* Cross patterns */}
          <line x1="95" y1="125" x2="105" y2="135" stroke="#F4F3F0" strokeWidth="1.5" />
          <line x1="105" y1="125" x2="95" y2="135" stroke="#F4F3F0" strokeWidth="1.5" />
        </g>

        {/* Handles */}
        <path
          d="M135 80 Q150 90, 145 110"
          stroke="#3E442B"
          strokeWidth="6"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M65 80 Q50 90, 55 110"
          stroke="#3E442B"
          strokeWidth="6"
          fill="none"
          opacity="0.5"
        />

        {/* Shadow/base */}
        <ellipse
          cx="100"
          cy="165"
          rx="30"
          ry="5"
          fill="#3E442B"
          opacity="0.3"
        />
      </motion.svg>
    </motion.div>
  );
};

export default PotteryDecoration;
