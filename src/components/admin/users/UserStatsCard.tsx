import React from "react";
import { LucideIcon } from "lucide-react";
import StatsCard from "@/src/components/cards/StatsCard";

interface UserStatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
}

const UserStatsCard = ({
  title,
  value,
  description,
  icon,
  iconClassName,
}: UserStatsCardProps) => (
  <StatsCard
    title={title}
    value={value}
    description={description}
    icon={icon}
    iconClassName={iconClassName}
  />
);

export default UserStatsCard;
