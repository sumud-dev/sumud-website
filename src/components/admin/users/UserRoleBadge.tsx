import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { UserRole } from "@/src/types/Users";
import { ROLE_CONFIG } from "./constants";

interface UserRoleBadgeProps {
  role: UserRole;
}

const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  const config = ROLE_CONFIG[role];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default UserRoleBadge;
