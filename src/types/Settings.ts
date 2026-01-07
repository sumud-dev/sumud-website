import { ReactNode } from "react";

export interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export interface SettingsSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  description?: string;
}

export interface SettingToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
