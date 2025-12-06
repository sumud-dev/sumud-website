import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { SettingsSelectProps } from "@/src/types/Settings";

const SettingsSelect = ({
  id,
  label,
  value,
  onValueChange,
  options,
  className = "w-full sm:w-48",
  description,
}: SettingsSelectProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {description && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
  </div>
);

export default SettingsSelect;