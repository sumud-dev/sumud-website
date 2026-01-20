"use client";

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
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

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
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("adminSettings.site");
  const [selectedLanguage, setSelectedLanguage] = React.useState(currentLocale);

  const updateSiteSettings = (
    key: keyof typeof siteSettings,
    value: string
  ) => {
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (newLocale: string) => {
    setSelectedLanguage(newLocale);
    updateSiteSettings("language", newLocale);
  };

  const handleSave = () => {
    onSave();
    // Only navigate to new locale after save if language changed
    if (selectedLanguage !== currentLocale) {
      router.replace(pathname, { locale: selectedLanguage as "en" | "fi" });
    }
  };

  return (
    <SettingsCard
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="site-name">{t("siteName")}</Label>
          <Input
            id="site-name"
            value={siteSettings.siteName}
            onChange={(e) => updateSiteSettings("siteName", e.target.value)}
            placeholder={t("siteNamePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">{t("contactEmail")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-email"
              type="email"
              value={siteSettings.contactEmail}
              onChange={(e) =>
                updateSiteSettings("contactEmail", e.target.value)
              }
              placeholder={t("contactEmailPlaceholder")}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site-description">{t("siteDescription")}</Label>
        <Textarea
          id="site-description"
          value={siteSettings.siteDescription}
          onChange={(e) =>
            updateSiteSettings("siteDescription", e.target.value)
          }
          placeholder={t("siteDescriptionPlaceholder")}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {t("siteDescriptionHint")}
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsSelect
          id="language"
          label={t("defaultLanguage")}
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
          options={LANGUAGE_OPTIONS}
          className="w-full"
        />
        <SettingsSelect
          id="timezone"
          label={t("timezone")}
          value={siteSettings.timezone}
          onValueChange={(value) => updateSiteSettings("timezone", value)}
          options={TIMEZONE_OPTIONS}
          className="w-full"
        />
      </div>

      <SaveButton
        onClick={handleSave}
        isSaving={isSaving}
        label={t("saveButton")}
      />
    </SettingsCard>
  );
};

export default SiteSettingsTab;
