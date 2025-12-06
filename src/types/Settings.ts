
export interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface SettingsCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SettingsSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  description?: string;
}