"use client";

import { Link, usePathname } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils/utils";
import { Button } from "@/src/components/ui/button";

const navigationKeys = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "articles", href: "/admin/articles", icon: FileText },
  { key: "campaigns", href: "/admin/campaigns", icon: Megaphone },
  { key: "events", href: "/admin/events", icon: Calendar },
  { key: "menus", href: "/admin/content", icon: Menu },
  { key: "pageBuilder", href: "/admin/page-builder", icon: LayoutTemplate },
];

const bottomNavigationKeys = [
  { key: "settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  userEmail?: string;
  userInitial?: string;
  defaultCollapsed?: boolean;
}

export function AdminSidebar({ userEmail, userInitial = "A", defaultCollapsed = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("adminSettings.sidebar");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-64" // Always full width on mobile
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-20 items-center border-b border-sidebar-border",
            isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-6"
          )}>
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/Logo.svg"
                  alt="Sumud Admin"
                  width={120}
                  height={8}
                  className="h-8 w-auto"
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </Link>
            )}
            {isCollapsed && (
              <Link href="/" className="hidden lg:flex items-center justify-center">
                <Image
                  src="/Logo.svg"
                  alt="Sumud Admin"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationKeys.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCollapsed ? "lg:justify-center" : "gap-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? t(item.key) : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(isCollapsed && "lg:hidden")}>
                    {t(item.key)}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom navigation */}
          <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
            {/* Desktop toggle button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "hidden lg:flex w-full mb-2",
                isCollapsed ? "justify-center" : "justify-end"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? t("expand") || "Expand Sidebar" : t("collapse") || "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            
            {bottomNavigationKeys.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCollapsed ? "lg:justify-center" : "gap-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? t(item.key) : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(isCollapsed && "lg:hidden")}>
                    {t(item.key)}
                  </span>
                </Link>
              );
            })}
            <button
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors disabled:opacity-50",
                isCollapsed ? "lg:justify-center" : "gap-3"
              )}
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={isCollapsed ? (isLoggingOut ? t("loggingOut") : t("logout")) : undefined}
            >
              <LogOut className="h-5 w-5" />
              <span className={cn(isCollapsed && "lg:hidden")}>
                {isLoggingOut ? t("loggingOut") : t("logout")}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t("toggleSidebar")}</span>
      </Button>

      {/* User avatar */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center" title={userEmail}>
          <span className="text-sm font-medium text-muted-foreground">{userInitial}</span>
        </div>
      </div>
    </>
  );
}

export function AdminMobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}
