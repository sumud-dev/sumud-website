"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Separator } from "@/src/components/ui/separator";
import SettingsCard from "@/src/components/admin/settings/SettingsCard";
import SettingToggle from "@/src/components/admin/settings/SettingToggle";
import SettingsSelect from "@/src/components/admin/settings/SettingsSelect";
import SaveButton from "@/src/components/admin/settings/SaveButton";
import { THEME_OPTIONS, INITIAL_APPEARANCE } from "@/src/lib/constants";

interface AppearanceTabProps {
  appearance: typeof INITIAL_APPEARANCE;
  setAppearance: React.Dispatch<
    React.SetStateAction<typeof INITIAL_APPEARANCE>
  >;
  onSave: () => void;
  isSaving: boolean;
}

const AppearanceTab = ({
  appearance,
  setAppearance,
  onSave,
  isSaving,
}: AppearanceTabProps) => {
  const t = useTranslations("adminSettings.appearance");

  const updateAppearance = (
    key: keyof typeof appearance,
    value: string | boolean
  ) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsCard
      title={t("title")}
      description={t("description")}
    >
      <SettingsSelect
        id="theme"
        label={t("theme")}
        value={appearance.theme}
        onValueChange={(value) => updateAppearance("theme", value)}
        options={THEME_OPTIONS}
        description={t("themeDescription")}
      />

      <Separator />

      <div className="space-y-4">
        <SettingToggle
          id="compact-mode"
          label={t("compactMode")}
          description={t("compactModeDescription")}
          checked={appearance.compactMode}
          onCheckedChange={(checked) => updateAppearance("compactMode", checked)}
        />

        <SettingToggle
          id="show-animations"
          label={t("showAnimations")}
          description={t("showAnimationsDescription")}
          checked={appearance.showAnimations}
          onCheckedChange={(checked) =>
            updateAppearance("showAnimations", checked)
          }
        />
      </div>

      <SaveButton onClick={onSave} isSaving={isSaving} label={t("saveButton")} />
    </SettingsCard>
  );
};

export default AppearanceTab;