"use client";

import React from "react";

/**
 * Traditional Palestinian embroidery (tatreez) pattern
 * Used as subtle background decoration
 */
export const EmbroideryPattern: React.FC = () => {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Define the repeating pattern */}
        <pattern
          id="tatreez-pattern"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          {/* Diamond motif - common in Palestinian embroidery */}
          <path
            d="M40 10 L50 20 L40 30 L30 20 Z"
            fill="none"
            stroke="#781D32"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Cross stitch pattern */}
          <line x1="35" y1="15" x2="45" y2="25" stroke="#3E442B" strokeWidth="1" opacity="0.25" />
          <line x1="45" y1="15" x2="35" y2="25" stroke="#3E442B" strokeWidth="1" opacity="0.25" />

          {/* Small decorative dots */}
          <circle cx="40" cy="20" r="2" fill="#55613C" opacity="0.2" />
          <circle cx="30" cy="10" r="1.5" fill="#781D32" opacity="0.2" />
          <circle cx="50" cy="10" r="1.5" fill="#781D32" opacity="0.2" />
          <circle cx="30" cy="30" r="1.5" fill="#781D32" opacity="0.2" />
          <circle cx="50" cy="30" r="1.5" fill="#781D32" opacity="0.2" />

          {/* Connecting lines */}
          <line x1="20" y1="20" x2="30" y2="20" stroke="#3E442B" strokeWidth="0.5" opacity="0.15" strokeDasharray="2,2" />
          <line x1="50" y1="20" x2="60" y2="20" stroke="#3E442B" strokeWidth="0.5" opacity="0.15" strokeDasharray="2,2" />
          <line x1="40" y1="0" x2="40" y2="10" stroke="#3E442B" strokeWidth="0.5" opacity="0.15" strokeDasharray="2,2" />
          <line x1="40" y1="30" x2="40" y2="40" stroke="#3E442B" strokeWidth="0.5" opacity="0.15" strokeDasharray="2,2" />

          {/* Secondary motif offset */}
          <path
            d="M20 50 L26 56 L20 62 L14 56 Z"
            fill="none"
            stroke="#55613C"
            strokeWidth="0.8"
            opacity="0.2"
          />
          <path
            d="M60 50 L66 56 L60 62 L54 56 Z"
            fill="none"
            stroke="#55613C"
            strokeWidth="0.8"
            opacity="0.2"
          />
        </pattern>
      </defs>

      {/* Apply the pattern to fill the entire SVG */}
      <rect width="100%" height="100%" fill="url(#tatreez-pattern)" />
    </svg>
  );
};

export default EmbroideryPattern;
