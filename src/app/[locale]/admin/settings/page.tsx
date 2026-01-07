"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ProfileTab from "@/src/components/admin/settings/tabs/ProfileTab";
import {
    INITIAL_PROFILE,
    INITIAL_APPEARANCE,
    INITIAL_SITE_SETTINGS,
    SETTINGS_TABS
} from "@/src/lib/constants";
import AppearanceTab from "@/src/components/admin/settings/tabs/AppearanceTab";
import SiteSettingsTab from "@/src/components/admin/settings/tabs/SiteSettingsTab";

const SettingsPage = () => {
  const t = useTranslations("adminSettings");
  const [isSaving, setIsSaving] = React.useState(false);
  const [profile, setProfile] = React.useState(INITIAL_PROFILE);
  const [appearance, setAppearance] = React.useState(INITIAL_APPEARANCE);
  const [siteSettings, setSiteSettings] = React.useState(INITIAL_SITE_SETTINGS);

  // Load profile from localStorage on mount
  React.useEffect(() => {
    const savedProfile = localStorage.getItem("sumud_admin_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (error) {
        console.error("Error parsing saved profile:", error);
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("sumud_admin_profile", JSON.stringify(profile));
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const createSaveHandler = (successMessageKey: string) => async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSaveAppearance = createSaveHandler("appearance.successMessage");
  const handleSaveSiteSettings = createSaveHandler("site.successMessage");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("pageDescription")}
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          {SETTINGS_TABS.map(({ value, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(`tabs.${value}`)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            profile={profile}
            setProfile={setProfile}
            onSave={handleSaveProfile}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab
            appearance={appearance}
            setAppearance={setAppearance}
            onSave={handleSaveAppearance}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="site">
          <SiteSettingsTab
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            onSave={handleSaveSiteSettings}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
