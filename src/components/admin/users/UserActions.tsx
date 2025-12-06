"use client";

import React from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Shield, Ban } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { User } from "@/src/types/Users";

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewProfile: (user: User) => void;
  onChangeRole?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

const UserActions = ({
  user,
  onEdit,
  onDelete,
  onViewProfile,
  onChangeRole,
  onToggleStatus,
}: UserActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onViewProfile(user)}>
        <Eye className="mr-2 h-4 w-4" />
        View Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(user)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit User
      </DropdownMenuItem>
      {onChangeRole && (
        <DropdownMenuItem onClick={() => onChangeRole(user)}>
          <Shield className="mr-2 h-4 w-4" />
          Change Role
        </DropdownMenuItem>
      )}
      {onToggleStatus && (
        <DropdownMenuItem onClick={() => onToggleStatus(user)}>
          <Ban className="mr-2 h-4 w-4" />
          {user.status === "suspended" ? "Activate" : "Suspend"}
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onDelete(user)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete User
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default UserActions;
