"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import SettingsCard from "@/src/components/admin/settings/SettingsCard";
import SettingToggle from "@/src/components/admin/settings/SettingToggle";
import SettingsSelect from "@/src/components/admin/settings/SettingsSelect";
import SaveButton from "@/src/components/admin/settings/SaveButton";
import {
  INITIAL_SECURITY,
  SESSION_TIMEOUT_OPTIONS,
} from "@/src/lib/constants";

interface SecurityTabProps {
  security: typeof INITIAL_SECURITY;
  setSecurity: React.Dispatch<React.SetStateAction<typeof INITIAL_SECURITY>>;
  onSave: () => void;
  isSaving: boolean;
}

const SecurityTab = ({
  security,
  setSecurity,
  onSave,
  isSaving,
}: SecurityTabProps) => {
  const t = useTranslations("adminSettings.security");

  return (
    <div className="space-y-6">
      {/* Password Card */}
      <SettingsCard
        title={t("passwordTitle")}
        description={t("passwordDescription")}
      >
        <div className="space-y-2">
          <Label htmlFor="current-password">{t("currentPassword")}</Label>
          <Input
            id="current-password"
            type="password"
            placeholder={t("currentPasswordPlaceholder")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder={t("newPasswordPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline">{t("updatePassword")}</Button>
        </div>
      </SettingsCard>

      {/* Two-Factor Card */}
      <SettingsCard
        title={t("twoFactorTitle")}
        description={t("twoFactorDescription")}
      >
        <SettingToggle
          id="two-factor"
          label={t("twoFactorEnable")}
          description={t("twoFactorEnableDescription")}
          checked={security.twoFactorEnabled}
          onCheckedChange={(checked) =>
            setSecurity((prev) => ({ ...prev, twoFactorEnabled: checked }))
          }
        />
      </SettingsCard>

      {/* Session Settings Card */}
      <SettingsCard
        title={t("sessionTitle")}
        description={t("sessionDescription")}
      >
        <SettingsSelect
          id="session-timeout"
          label={t("sessionTimeout")}
          value={security.sessionTimeout}
          onValueChange={(value) =>
            setSecurity((prev) => ({ ...prev, sessionTimeout: value }))
          }
          options={SESSION_TIMEOUT_OPTIONS}
        />

        <Separator />

        <div className="space-y-2">
          <Label>{t("activeSessions")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("activeSessionsInfo")}
          </p>
          <Button variant="outline" className="mt-2">
            {t("signOutOther")}
          </Button>
        </div>

        <SaveButton onClick={onSave} isSaving={isSaving} label={t("saveButton")} />
      </SettingsCard>
    </div>
  );
};

export default SecurityTab;