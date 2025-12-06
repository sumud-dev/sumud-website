"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { User } from "@/src/types/Users";
import UserTableRow from "./UserTableRow";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewProfile: (user: User) => void;
}

const TABLE_HEADERS = [
  { key: "user", label: "User", className: "" },
  { key: "role", label: "Role", className: "" },
  { key: "status", label: "Status", className: "" },
  { key: "lastLogin", label: "Last Login", className: "" },
  { key: "createdAt", label: "Joined", className: "" },
  { key: "articles", label: "Articles", className: "text-center" },
  { key: "actions", label: "", className: "text-right w-[50px]" },
];

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onViewProfile,
}: UserTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        {TABLE_HEADERS.map((header) => (
          <TableHead key={header.key} className={header.className}>
            {header.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {users.length === 0 ? (
        <TableRow>
          <td colSpan={TABLE_HEADERS.length} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <p>No users found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          </td>
        </TableRow>
      ) : (
        users.map((user) => (
          <UserTableRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewProfile={onViewProfile}
          />
        ))
      )}
    </TableBody>
  </Table>
);

export default UserTable;
