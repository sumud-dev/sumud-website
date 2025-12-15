"use client";

import React, { useState } from "react";
import { Link } from "@/src/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  Users,
  Calendar,
  FileText,
  Zap,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Sign Petition",
    href: "/petitions",
    icon: PenTool,
    color: "bg-[#781D32] hover:bg-[#781D32]/90",
    badge: "Urgent",
    description: "Make your voice heard on active campaigns",
  },
  {
    label: "Become a Member",
    href: "/membership",
    icon: Users,
    color: "bg-[#55613C] hover:bg-[#55613C]/90",
    description: "Join our movement and get involved",
  },
  {
    label: "Share Story",
    href: "/share",
    icon: Share2,
    color: "bg-[#3E442B] hover:bg-[#3E442B]/90",
    description: "Share your experience or story",
  },
  {
    label: "Find Events",
    href: "/events",
    icon: Calendar,
    color: "bg-blue-600 hover:bg-blue-700",
    badge: "New",
    description: "Discover upcoming community events",
  },
  {
    label: "Read Articles",
    href: "/articles",
    icon: FileText,
    color: "bg-purple-600 hover:bg-purple-700",
    description: "Stay informed with latest updates",
  },
];

export default function QuickActions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 mb-4"
            >
              <div className="flex flex-col space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={action.href}>
                          <Button
                            size="sm"
                            className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-start`}
                          >
                            <action.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{action.label}</span>
                            {action.badge && (
                              <Badge className="bg-white/20 text-white text-xs px-1.5 py-0.5 ml-auto">
                                {action.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-sm">{action.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="lg"
            className={`rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isExpanded
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-gradient-to-r from-[#781D32] to-[#55613C] hover:opacity-90"
            }`}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Zap className="h-6 w-6 text-white" />
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Quick tip */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 2, duration: 0.3 }}
              className="absolute bottom-16 right-0 mb-2 mr-2"
            >
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                Quick Actions
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

// Compact version for mobile or space-constrained areas
export function CompactQuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/petitions">
            <Button
              size="sm"
              className="bg-[#781D32] hover:bg-[#781D32]/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <PenTool className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sign Petition</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sign active petitions</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/join">
            <Button
              size="sm"
              variant="outline"
              className="border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white"
            >
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Join</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Become a member</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}