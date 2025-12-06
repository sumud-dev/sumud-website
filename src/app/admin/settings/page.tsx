"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ProfileTab from "@/src/components/admin/settings/tabs/ProfileTab";
import {
    INITIAL_PROFILE,
    INITIAL_SECURITY,
    INITIAL_APPEARANCE,
    INITIAL_SITE_SETTINGS,
    SETTINGS_TABS
} from "@/src/lib/constants";
import SecurityTab from "@/src/components/admin/settings/tabs/SecurityTab";
import AppearanceTab from "@/src/components/admin/settings/tabs/AppearanceTab";
import SiteSettingsTab from "@/src/components/admin/settings/tabs/SiteSettingsTab";

const SettingsPage = () => {
  const [isSaving, setIsSaving] = React.useState(false);
  const [profile, setProfile] = React.useState(INITIAL_PROFILE);
  const [security, setSecurity] = React.useState(INITIAL_SECURITY);
  const [appearance, setAppearance] = React.useState(INITIAL_APPEARANCE);
  const [siteSettings, setSiteSettings] = React.useState(INITIAL_SITE_SETTINGS);

  const createSaveHandler = (successMessage: string) => async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success(successMessage);
  };

  const handleSaveProfile = createSaveHandler("Profile updated successfully");
  const handleSaveSecurity = createSaveHandler("Security settings updated");
  const handleSaveAppearance = createSaveHandler("Appearance settings saved");
  const handleSaveSiteSettings = createSaveHandler("Site settings updated");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
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

        <TabsContent value="security">
          <SecurityTab
            security={security}
            setSecurity={setSecurity}
            onSave={handleSaveSecurity}
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
