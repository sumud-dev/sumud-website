import { Button } from "@/src/components/ui/button";
import { Save } from "lucide-react";

const SaveButton = ({
  onClick,
  isSaving,
  label = "Save Changes",
}: {
  onClick: () => void;
  isSaving: boolean;
  label?: string;
}) => (
  <div className="flex justify-end">
    <Button onClick={onClick} disabled={isSaving}>
      <Save className="h-4 w-4 mr-2" />
      {isSaving ? "Saving..." : label}
    </Button>
  </div>
);

export default SaveButton;