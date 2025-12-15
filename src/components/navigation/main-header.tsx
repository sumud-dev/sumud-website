"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Heart,
  Menu,
  User,
  ChevronDown,
  FileText,
  LogOut,
  Shield,
  PenTool,
  Calendar,
  Phone,
  Target,
  Info,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
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
import LanguageSwitcher from "@/src/components/ui/language-switcher";

interface NavigationItem {
  labelKey: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    labelKey: "campaigns",
    href: "/campaigns",
    icon: Target,
  },
  {
    labelKey: "petitions",
    href: "#",
    icon: PenTool,
    badge: "Active",
  },
  {
    labelKey: "articles",
    href: "/articles",
    icon: FileText,
  },
  {
    labelKey: "about",
    href: "/about",
    icon: Heart,
    children: [
      {
        labelKey: "about",
        href: "/about",
        icon: Info,
      },
      {
        labelKey: "becomeAMember",
        href: "/membership",
        icon: Heart,
      },
      {
        labelKey: "events",
        href: "/events",
        icon: Calendar,
      },
      {
        labelKey: "volunteer",
        href: "/volunteer",
        icon: Heart,
      },
      {
        labelKey: "contact",
        href: "/contact",
        icon: Phone,
      },
    ],
  },
];

export default function MainHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("navigation");

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isSignedIn = !isLoading && !!user;

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
              {t(item.labelKey)}
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
                  {t(child.labelKey)}
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
          {t(item.labelKey)}
          {item.badge && (
            <Badge className="ml-2 bg-[#781D32]/10 text-[#781D32] text-xs px-1.5 py-0.5">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  const UserAccountMenu = () => {
    if (!isSignedIn) {
      return null;
    }

    const userEmail = user?.email;
    const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail?.split("@")[0];
    const userAvatar = user?.user_metadata?.avatar_url;
    // Check for admin role in user metadata (can be customized based on your Supabase setup)
    const isAdmin = user?.user_metadata?.role === "admin" || user?.app_metadata?.role === "admin";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#781D32] flex items-center justify-center">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userDisplayName || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{userDisplayName}</div>
            <div className="text-xs text-gray-500">
              {userEmail}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/admin"
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              {t("dashboard")}
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="h-4 w-4" />
                  {t("admin")}
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer text-red-600"
          >
            <LogOut className="h-4 w-4" />
            {t("signout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="/Logo.svg"
                alt="Sumud - Finnish Palestine Network"
                width={180}
                height={80}
                priority
                className="h-12 w-auto"
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

            {/* User Account Menu */}
            <div className="hidden lg:block">
              <UserAccountMenu />
            </div>

            {/* Call to Action */}
            <Link href="/membership" className="hidden lg:block">
              <Button
                size="sm"
                className="bg-[#781D32] hover:bg-[#781D32]/90 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                {t("becomeAMember")}
              </Button>
            </Link>

            {/* Mobile Menu */}
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
                                {t(child.labelKey)}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="border-t border-[#55613C]/20 my-4" />

                  {/* Mobile User Account */}
                  {isSignedIn ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#781D32]/5">
                        <div className="w-10 h-10 rounded-full bg-[#781D32] flex items-center justify-center">
                          {user?.user_metadata?.avatar_url ? (
                            <Image
                              src={user.user_metadata.avatar_url}
                              alt={user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                              width={40}
                              height={40}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <Link href="/admin">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t("dashboard")}
                        </Button>
                      </Link>
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("signout")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/membership">
                        <Button className="w-full bg-[#781D32] hover:bg-[#781D32]/90">
                          {t("becomeAMember")}
                        </Button>
                      </Link>
                    </div>
                  )}

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
          </div>
        </div>
      </div>
    </motion.header>
  );
}
