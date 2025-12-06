import React from "react";
import { Mail } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import SettingsCard from "@/src/components/admin/settings/SettingsCard";
import SettingsSelect from "@/src/components/admin/settings/SettingsSelect";
import SaveButton from "@/src/components/admin/settings/SaveButton";
import {
  INITIAL_SITE_SETTINGS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/src/lib/constants";

interface SiteSettingsTabProps {
  siteSettings: typeof INITIAL_SITE_SETTINGS;
  setSiteSettings: React.Dispatch<
    React.SetStateAction<typeof INITIAL_SITE_SETTINGS>
  >;
  onSave: () => void;
  isSaving: boolean;
}

const SiteSettingsTab = ({
  siteSettings,
  setSiteSettings,
  onSave,
  isSaving,
}: SiteSettingsTabProps) => {
  const updateSiteSettings = (
    key: keyof typeof siteSettings,
    value: string
  ) => {
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsCard
      title="Site Settings"
      description="Configure general site settings and preferences"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="site-name">Site Name</Label>
          <Input
            id="site-name"
            value={siteSettings.siteName}
            onChange={(e) => updateSiteSettings("siteName", e.target.value)}
            placeholder="Enter site name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Contact Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-email"
              type="email"
              value={siteSettings.contactEmail}
              onChange={(e) =>
                updateSiteSettings("contactEmail", e.target.value)
              }
              placeholder="Enter contact email"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site-description">Site Description</Label>
        <Textarea
          id="site-description"
          value={siteSettings.siteDescription}
          onChange={(e) =>
            updateSiteSettings("siteDescription", e.target.value)
          }
          placeholder="Describe your site"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Used for SEO and social media sharing
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsSelect
          id="language"
          label="Default Language"
          value={siteSettings.language}
          onValueChange={(value) => updateSiteSettings("language", value)}
          options={LANGUAGE_OPTIONS}
          className="w-full"
        />
        <SettingsSelect
          id="timezone"
          label="Timezone"
          value={siteSettings.timezone}
          onValueChange={(value) => updateSiteSettings("timezone", value)}
          options={TIMEZONE_OPTIONS}
          className="w-full"
        />
      </div>

      <SaveButton
        onClick={onSave}
        isSaving={isSaving}
        label="Save Site Settings"
      />
    </SettingsCard>
  );
};

export default SiteSettingsTab;
