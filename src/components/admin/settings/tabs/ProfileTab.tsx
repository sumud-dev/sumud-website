"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Camera } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { ImageUpload } from "@/src/components/ui/image-upload";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Textarea } from "@/src/components/ui/textarea";
import SettingsCard from "@/src/components/admin/settings/SettingsCard";
import SaveButton from "@/src/components/admin/settings/SaveButton";
import { INITIAL_PROFILE } from "@/src/lib/constants";

interface ProfileTabProps {
  profile: typeof INITIAL_PROFILE;
  setProfile: React.Dispatch<React.SetStateAction<typeof INITIAL_PROFILE>>;
  onSave: () => void;
  isSaving: boolean;
}


const ProfileTab = ({
  profile,
  setProfile,
  onSave,
  isSaving,
}: ProfileTabProps) => {
  const t = useTranslations("adminSettings.profile");
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SettingsCard
      title={t("title")}
      description={t("description")}
    >
      {/* Avatar Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("changePhoto")}</p>
            <p className="text-xs text-muted-foreground">
              {t("photoHint")}
            </p>
          </div>
        </div>
        <ImageUpload
          value={profile.avatar}
          onChange={(url) => updateProfile("avatar", url)}
          disabled={isSaving}
          folder="avatars"
          maxSize={2}
          aspectRatio="1"
        />
      </div>

      <Separator />

      {/* Form Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile("email", e.target.value)}
            placeholder={t("emailPlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">{t("role")}</Label>
        <Input id="role" value={profile.role} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">
          {t("roleHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">{t("bio")}</Label>
        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => updateProfile("bio", e.target.value)}
          placeholder={t("bioPlaceholder")}
          rows={4}
        />
      </div>

      <SaveButton onClick={onSave} isSaving={isSaving} label={t("saveButton")} />
    </SettingsCard>
  );
};

export default ProfileTab;