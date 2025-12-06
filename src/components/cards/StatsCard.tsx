import React from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "text-muted-foreground",
  valueClassName = "",
}: StatsCardProps) => (
  <Card className="border-gray-200 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && <Icon className={`h-8 w-8 ${iconClassName}`} />}
      </div>
    </CardContent>
  </Card>
);

export default StatsCard;
