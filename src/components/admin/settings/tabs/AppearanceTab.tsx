import React from "react";
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
  const updateAppearance = (
    key: keyof typeof appearance,
    value: string | boolean
  ) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsCard
      title="Appearance Settings"
      description="Customize the look and feel of the admin panel"
    >
      <SettingsSelect
        id="theme"
        label="Theme"
        value={appearance.theme}
        onValueChange={(value) => updateAppearance("theme", value)}
        options={THEME_OPTIONS}
        description="Choose your preferred color scheme"
      />

      <Separator />

      <div className="space-y-4">
        <SettingToggle
          id="compact-mode"
          label="Compact Mode"
          description="Use a more compact layout with less spacing"
          checked={appearance.compactMode}
          onCheckedChange={(checked) => updateAppearance("compactMode", checked)}
        />

        <SettingToggle
          id="show-animations"
          label="Show Animations"
          description="Enable smooth transitions and animations"
          checked={appearance.showAnimations}
          onCheckedChange={(checked) =>
            updateAppearance("showAnimations", checked)
          }
        />
      </div>

      <SaveButton onClick={onSave} isSaving={isSaving} label="Save Appearance" />
    </SettingsCard>
  );
};

export default AppearanceTab;