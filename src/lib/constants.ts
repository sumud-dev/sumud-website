import { SelectOption } from "@/src/types/Settings";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe
} from "lucide-react";

export const INITIAL_PROFILE = {
  name: "Admin User",
  email: "admin@sumud.org",
  avatar: "",
  role: "Super Admin",
  bio: "Managing the Sumud platform and community.",
};

export const INITIAL_SECURITY = {
  twoFactorEnabled: false,
  sessionTimeout: "30",
};

export const INITIAL_APPEARANCE = {
  theme: "system",
  compactMode: false,
  showAnimations: true,
};

export const INITIAL_SITE_SETTINGS = {
  siteName: "Sumud",
  siteDescription: "A platform for Palestinian heritage and community",
  contactEmail: "contact@sumud.org",
  language: "en",
  timezone: "UTC",
};

export const SESSION_TIMEOUT_OPTIONS: SelectOption[] = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "480", label: "8 hours" },
];

export const THEME_OPTIONS: SelectOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic (العربية)" },
  { value: "fin", label: "(Suomi) Finland" },
];

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "UTC", label: "UTC" }
];

export const SETTINGS_TABS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: Shield },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "site", label: "Site", icon: Globe },
];