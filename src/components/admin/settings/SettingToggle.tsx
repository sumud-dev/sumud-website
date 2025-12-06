import { Switch } from "@/src/components/ui/switch";
import { SettingToggleProps } from "@/src/types/Settings";
import { Label } from "@/src/components/ui/label";

const SettingToggle = ({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: SettingToggleProps) => (
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <Label htmlFor={id}>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default SettingToggle;