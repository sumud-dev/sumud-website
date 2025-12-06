"use client";

import React from "react";
import { TableCell, TableRow } from "@/src/components/ui/table";
import { User } from "@/src/types/Users";
import UserAvatar from "./UserAvatar";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import UserActions from "./UserActions";
import { formatRelativeTime, formatDate } from "./utils";

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewProfile: (user: User) => void;
}

const UserTableRow = ({
  user,
  onEdit,
  onDelete,
  onViewProfile,
}: UserTableRowProps) => (
  <TableRow>
    {/* User Info Cell */}
    <TableCell>
      <div className="flex items-center gap-3">
        <UserAvatar name={user.name} avatar={user.avatar} />
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>
    </TableCell>

    {/* Role Cell */}
    <TableCell>
      <UserRoleBadge role={user.role} />
    </TableCell>

    {/* Status Cell */}
    <TableCell>
      <UserStatusBadge status={user.status} />
    </TableCell>

    {/* Last Login Cell */}
    <TableCell className="text-muted-foreground">
      {user.lastLogin ? formatRelativeTime(user.lastLogin) : "Never"}
    </TableCell>

    {/* Created At Cell */}
    <TableCell className="text-muted-foreground">
      {formatDate(user.createdAt)}
    </TableCell>

    {/* Articles Count Cell */}
    <TableCell className="text-center">
      {user.articlesCount ?? 0}
    </TableCell>

    {/* Actions Cell */}
    <TableCell className="text-right">
      <UserActions
        user={user}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewProfile={onViewProfile}
      />
    </TableCell>
  </TableRow>
);

export default UserTableRow;
