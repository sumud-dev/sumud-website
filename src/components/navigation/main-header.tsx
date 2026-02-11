"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname } from "@/src/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Heart,
  Menu,
  FileText,
  PenTool,
  Calendar,
  Phone,
  Target,
  Info,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import LanguageSwitcher from "@/src/components/ui/language-switcher";
import { getHeaderConfig, type Locale } from "@/src/actions/navigation.actions";

interface NavigationItem {
  labelKey: string;
  label: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
  children?: NavigationItem[];
}

// Icon mapping for dynamic navigation items
const iconMap: Record<string, React.ElementType> = {
  campaigns: Target,
  petitions: PenTool,
  articles: FileText,
  about: Heart,
  events: Calendar,
  contact: Phone,
  becomeAMember: Heart,
  info: Info,
};

// Default fallback navigation items
const defaultNavigationItems: NavigationItem[] = [
  { labelKey: "campaigns", label: "Campaigns", href: "/campaigns", icon: Target },
  { labelKey: "petitions", label: "Petitions", href: "/petition", icon: PenTool, badge: "Active" },
  { labelKey: "articles", label: "Articles", href: "/articles", icon: FileText },
  {
    labelKey: "about",
    label: "About",
    href: "/about",
    icon: Heart,
    children: [
      { labelKey: "about", label: "About", href: "/about", icon: Info },
      { labelKey: "becomeAMember", label: "Become a Member", href: "/membership", icon: Heart },
      { labelKey: "events", label: "Events", href: "/events", icon: Calendar },
      { labelKey: "contact", label: "Contact", href: "/contact", icon: Phone },
    ],
  },
];

export default function MainHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(defaultNavigationItems);
  const [logo, setLogo] = useState("/Logo.svg");
  const [siteName, setSiteName] = useState("Sumud");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const locale = useLocale() as Locale;
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Prevent SSR hydration mismatch for Sheet component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load navigation config
  useEffect(() => {
    async function loadConfig() {
      try {
        const result = await getHeaderConfig();
        if (result.success) {
          const config = result.data;
          
          // Set logo and site name from config
          if (config.logo) {
            setLogo(config.logo);
          }
          setSiteName(config.siteName[locale] || config.siteName.en || "Sumud");
          
          const items: NavigationItem[] = config.navigationLinks.map((link) => ({
            labelKey: link.labelKey,
            label: link.labels[locale] || link.labels.en || link.labelKey,
            href: link.href,
            icon: iconMap[link.labelKey],
            children: link.children?.map((child) => ({
              labelKey: child.labelKey,
              label: child.labels[locale] || child.labels.en || child.labelKey,
              href: child.href,
              icon: iconMap[child.labelKey],
            })),
          }));
          setNavigationItems(items);
        }
      } catch (error) {
        console.error("Failed to load header config:", error);
      }
    }
    loadConfig();
  }, [locale]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    closeMobileMenu();
  }, [pathname]);

  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({
    item,
    mobile = false,
  }: {
    item: NavigationItem;
    mobile?: boolean;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isActivePath(item.href);
    // Use label from config, fallback to translation
    const displayLabel = item.label || t(item.labelKey);

    if (hasChildren && !mobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#781D32] ${
                isActive ? "text-[#781D32]" : "text-[#3E442B]"
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {displayLabel}
              {item.badge && (
                <Badge className="ml-2 bg-[#781D32]/10 text-[#781D32] text-xs px-1.5 py-0.5">
                  {item.badge}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.href} asChild>
                <Link
                  href={child.href}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {child.icon && <child.icon className="h-4 w-4" />}
                  {child.label || t(child.labelKey)}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link href={item.href}>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#781D32] ${
            mobile ? "w-full justify-start" : ""
          } ${isActive ? "text-[#781D32]" : "text-[#3E442B]"}`}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {displayLabel}
          {item.badge && (
            <Badge className="ml-2 bg-[#781D32]/10 text-[#781D32] text-xs px-1.5 py-0.5">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-[#55613C]/10"
          : "bg-white/90 backdrop-blur-sm shadow-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src={logo}
                alt={`${siteName} - Finnish Palestine Network`}
                width={180}
                height={80}
                priority
                className="h-20 w-auto"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher variant="compact" />
            </div>

            {/* User Avatar or CTA */}
            {isLoaded && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                      />
                      <AvatarFallback className="bg-[#781D32] text-white">
                        {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signOut({ redirectUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("signout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Call to Action */
              <Link href="/membership" className="hidden lg:block">
                <Button
                  size="sm"
                  className="bg-[#781D32] hover:bg-[#781D32]/90 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {t("becomeAMember")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            {mounted ? (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-[#3E442B] hover:text-[#781D32]"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#781D32] to-[#55613C] rounded-lg flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[#781D32] font-bold">Sumud</span>
                    </SheetTitle>
                  </SheetHeader>

                <div className="flex flex-col space-y-1">
                  {/* Mobile Navigation */}
                  {navigationItems.map((item) => (
                    <div key={item.href}>
                      <NavLink item={item} mobile />
                      {item.children && (
                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#55613C]/20 pl-3">
                          {item.children?.map((child) => (
                            <Link key={child.href} href={child.href}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm text-[#3E442B] hover:text-[#781D32]"
                              >
                                {child.icon && (
                                  <child.icon className="h-3 w-3 mr-2" />
                                )}
                                {child.label || t(child.labelKey)}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="border-t border-[#55613C]/20 my-4" />

                  {/* Mobile Call to Action */}
                  <div className="space-y-2">
                    <Link href="/membership">
                      <Button className="w-full bg-[#781D32] hover:bg-[#781D32]/90">
                        {t("becomeAMember")}
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t border-[#55613C]/20 my-4" />

                  {/* Mobile Language Switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3E442B]">
                      {t("language")}
                    </span>
                    <LanguageSwitcher variant="compact" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-[#3E442B] hover:text-[#781D32]"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
