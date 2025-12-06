import React from "react";
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
}: SecurityTabProps) => (
  <div className="space-y-6">
    {/* Password Card */}
    <SettingsCard
      title="Password"
      description="Change your password to keep your account secure"
    >
      <div className="space-y-2">
        <Label htmlFor="current-password">Current Password</Label>
        <Input
          id="current-password"
          type="password"
          placeholder="Enter current password"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter new password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm new password"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="outline">Update Password</Button>
      </div>
    </SettingsCard>

    {/* Two-Factor Card */}
    <SettingsCard
      title="Two-Factor Authentication"
      description="Add an extra layer of security to your account"
    >
      <SettingToggle
        id="two-factor"
        label="Enable Two-Factor Authentication"
        description="Use an authenticator app for additional security"
        checked={security.twoFactorEnabled}
        onCheckedChange={(checked) =>
          setSecurity((prev) => ({ ...prev, twoFactorEnabled: checked }))
        }
      />
    </SettingsCard>

    {/* Session Settings Card */}
    <SettingsCard
      title="Session Settings"
      description="Manage your session and login preferences"
    >
      <SettingsSelect
        id="session-timeout"
        label="Session Timeout (minutes)"
        value={security.sessionTimeout}
        onValueChange={(value) =>
          setSecurity((prev) => ({ ...prev, sessionTimeout: value }))
        }
        options={SESSION_TIMEOUT_OPTIONS}
      />

      <Separator />

      <div className="space-y-2">
        <Label>Active Sessions</Label>
        <p className="text-sm text-muted-foreground">
          You&apos;re currently logged in on 1 device
        </p>
        <Button variant="outline" className="mt-2">
          Sign Out All Other Sessions
        </Button>
      </div>

      <SaveButton onClick={onSave} isSaving={isSaving} label="Save Settings" />
    </SettingsCard>
  </div>
);

export default SecurityTab;