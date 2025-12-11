import React from "react";
import { UserStatus } from "@/src/types/Users";
import { STATUS_CONFIG } from "./constants";
import { cn } from "@/src/lib/utils/utils";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default UserStatusBadge;
