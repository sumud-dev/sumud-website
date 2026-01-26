"use client";

import React, { useMemo } from "react";
import { Link, usePathname } from "@/src/i18n/navigation";
import { Home, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils/utils";

// Route label mapping for prettier breadcrumb text
const routeLabels: Record<string, string> = {
  "about": "About",
  "articles": "Articles",
  "campaigns": "Campaigns",
  "contact": "Contact",
  "events": "Events",
  "join": "Join Us",
  "partners": "Partners",
  "petitions": "Petitions",
  "privacy-policy": "Privacy Policy",
  "shop": "Shop",
  "team": "Team",
  "checkout": "Checkout",
  "wishlist": "Wishlist",
  "products": "Products",
  "admin": "Admin",
  "profile": "Profile",
  "settings": "Settings",
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHomeIcon?: boolean;
  className?: string;
  variant?: "default" | "glass";
  maxLabelLength?: number;
}

/**
 * Breadcrumb component - Auto-generates breadcrumbs from URL or accepts custom items
 * Follows site-wide spacing: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
 */
export function Breadcrumb({
  items: customItems,
  showHomeIcon = true,
  className,
  variant = "default",
  maxLabelLength = 50,
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb items from pathname if not provided
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    if (customItems) return customItems;

    // Remove locale prefix (e.g., /en, /fi)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, "/");

    // Don't show breadcrumbs on homepage
    if (pathWithoutLocale === "/" || pathWithoutLocale === "") return [];

    const segments = pathWithoutLocale.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Build breadcrumb items
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const path = `/${segments.slice(0, index + 1).join("/")}`;

      // Get label from mapping or format the segment
      const label = routeLabels[segment] || segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      items.push({
        label: label.length > maxLabelLength
          ? `${label.substring(0, maxLabelLength)}...`
          : label,
        href: isLast ? undefined : path,
        isCurrentPage: isLast,
      });
    });

    return items;
  }, [pathname, customItems, maxLabelLength]);

  // Don't render if no items
  if (breadcrumbItems.length === 0) return null;

  const isGlass = variant === "glass";

  return (
    <nav
      className={cn(
        "w-full",
        !isGlass && "bg-[#F4F3F0]/50 border-b border-[#55613C]/10 py-3",
        className
      )}
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className={cn(
          "flex items-center gap-2 text-sm",
          isGlass && "inline-flex px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-lg"
        )}>
          {/* Home Link */}
          <li>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#781D32] transition-colors"
            >
              {showHomeIcon && <Home className="w-4 h-4" />}
              {!showHomeIcon && <span>Home</span>}
            </Link>
          </li>

          {/* Breadcrumb Items */}
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </li>
              <li>
                {item.isCurrentPage || !item.href ? (
                  <span className="font-medium text-[#781D32] truncate max-w-[200px] sm:max-w-none">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-[#781D32] transition-colors truncate max-w-[200px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </div>
    </nav>
  );
}

/**
 * Glass variant breadcrumb - floating style with backdrop blur
 * Used in campaign detail pages
 */
export function GlassBreadcrumb({
  items,
  maxLabelLength = 30,
  className,
}: Omit<BreadcrumbProps, "variant">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("absolute top-6 left-0 right-0 z-20", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={items}
          variant="glass"
          maxLabelLength={maxLabelLength}
          className=""
        />
      </div>
    </motion.div>
  );
}

// Export default as main Breadcrumb for backwards compatibility
export default Breadcrumb;
