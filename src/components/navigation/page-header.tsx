"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import Breadcrumb from "./breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  showBackButton?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  actions?: React.ReactNode;
  breadcrumb?: boolean;
  backgroundImage?: string;
  children?: React.ReactNode;
  className?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function PageHeader({
  title,
  description,
  badge,
  showBackButton = false,
  backHref,
  onBackClick,
  actions,
  breadcrumb = true,
  backgroundImage,
  children,
  className = "",
}: PageHeaderProps) {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backHref) {
      window.history.pushState(null, "", backHref);
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`bg-white border-b border-gray-100 ${className}`}>
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Breadcrumb */}
        {breadcrumb && (
          <motion.div
            className="py-4 border-b border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Breadcrumb />
          </motion.div>
        )}

        {/* Main Header Content */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Content */}
            <motion.div
              className="flex-1 min-w-0"
              variants={fadeInLeft}
              initial="initial"
              animate="animate"
            >
              {/* Back Button */}
              {showBackButton && (
                <motion.div
                  className="mb-4"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackClick}
                    className="text-[#55613C] hover:text-[#781D32] -ml-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </motion.div>
              )}

              {/* Badge */}
              {badge && (
                <motion.div
                  className="mb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Badge
                    variant={badge.variant || "default"}
                    className="text-sm"
                  >
                    {badge.text}
                  </Badge>
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                className="text-3xl lg:text-4xl font-bold text-[#3E442B] mb-3 leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {title}
              </motion.h1>

              {/* Description */}
              {description && (
                <motion.p
                  className="text-lg text-gray-600 leading-relaxed max-w-3xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {description}
                </motion.p>
              )}

              {/* Custom Children */}
              {children && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {children}
                </motion.div>
              )}
            </motion.div>

            {/* Right Actions */}
            {actions && (
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  {actions}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Specialized header variants for common page types
export function PetitionPageHeader({
  title,
  description,
  signatures,
  target,
  status,
  actions,
  showBackButton = true,
}: {
  title: string;
  description?: string;
  signatures?: number;
  target?: number;
  status?: "active" | "completed" | "closed";
  actions?: React.ReactNode;
  showBackButton?: boolean;
}) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const statusLabels = {
    active: "Active Campaign",
    completed: "Goal Reached",
    closed: "Campaign Closed",
  };

  return (
    <PageHeader
      title={title}
      description={description}
      badge={
        status
          ? {
              text: statusLabels[status],
              variant: status === "active" ? "default" : "secondary",
            }
          : undefined
      }
      showBackButton={showBackButton}
      actions={actions}
    >
      {(signatures !== undefined || target !== undefined) && (
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          {signatures !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#781D32] text-lg" suppressHydrationWarning>
                {signatures.toLocaleString()}
              </span>
              <span>signatures</span>
            </div>
          )}
          {target !== undefined && (
            <div className="flex items-center space-x-2">
              <span>Target:</span>
              <span className="font-medium" suppressHydrationWarning>{target.toLocaleString()}</span>
            </div>
          )}
          {signatures !== undefined && target !== undefined && (
            <div className="flex items-center space-x-2">
              <span>Progress:</span>
              <span className="font-medium">
                {Math.round((signatures / target) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </PageHeader>
  );
}

export function ArticlePageHeader({
  title,
  description,
  author,
  publishedDate,
  readTime,
  category,
  actions,
  showBackButton = true,
  locale = 'en',
}: {
  title: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  readTime?: string;
  category?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  locale?: string;
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      badge={
        category
          ? {
              text: category,
              variant: "outline",
            }
          : undefined
      }
      showBackButton={showBackButton}
      actions={actions}
    >
      {(author || publishedDate || readTime) && (
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          {author && (
            <div className="flex items-center space-x-1">
              <span>By</span>
              <span className="font-medium text-[#3E442B]">{author}</span>
            </div>
          )}
          {publishedDate && (
            <div suppressHydrationWarning>
              {new Date(publishedDate).toLocaleDateString(locale === 'fi' ? 'fi-FI' : 'en-US', {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
          {readTime && (
            <div className="flex items-center space-x-1">
              <span>{readTime} read</span>
            </div>
          )}
        </div>
      )}
    </PageHeader>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
  showBackButton = false,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      badge={{
        text: "Admin Dashboard",
        variant: "destructive",
      }}
      showBackButton={showBackButton}
      actions={actions}
      className="bg-gray-50 border-gray-200"
    />
  );
}