"use client";

import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Megaphone,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Languages,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils/utils";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";

const navigationKeys = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "articles", href: "/admin/articles", icon: FileText },
  { key: "campaigns", href: "/admin/campaigns", icon: Megaphone },
  { key: "events", href: "/admin/events", icon: Calendar },
  { key: "categories", href: "/admin/categories", icon: FolderOpen },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "content", href: "/admin/content", icon: Languages },
];

const bottomNavigationKeys = [
  { key: "settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  userEmail?: string;
  userInitial?: string;
}

export function AdminSidebar({ userEmail, userInitial = "A" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("adminSettings.sidebar");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/Logo.svg"
                alt="Sumud Admin"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* Bottom navigation */}
          <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
            {bottomNavigationKeys.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.key)}
                </Link>
              );
            })}
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-5 w-5" />
              {isLoggingOut ? t("loggingOut") : t("logout")}
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
