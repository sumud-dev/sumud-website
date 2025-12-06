import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Camera } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Textarea } from "@/src/components/ui/textarea";
import SettingsCard from "@/src/components/admin/settings/SettingsCard";
import SaveButton from "@/src/components/admin/settings/SaveButton";

const INITIAL_PROFILE = {
  name: "Admin User",
  email: "admin@sumud.org",
  avatar: "",
  role: "Super Admin",
  bio: "Managing the Sumud platform and community.",
};

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
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SettingsCard
      title="Profile Information"
      description="Update your personal information and profile picture"
    >
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Change Photo
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Max size 2MB.
          </p>
        </div>
      </div>

      <Separator />

      {/* Form Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile("email", e.target.value)}
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" value={profile.role} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">
          Contact a super admin to change your role
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => updateProfile("bio", e.target.value)}
          placeholder="Tell us about yourself"
          rows={4}
        />
      </div>

      <SaveButton onClick={onSave} isSaving={isSaving} />
    </SettingsCard>
  );
};

export default ProfileTab;