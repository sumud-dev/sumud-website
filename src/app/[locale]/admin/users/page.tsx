"use client";

import * as React from "react";
import { Link } from "@/src/i18n/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { User, UserFilters as UserFiltersType } from "@/src/types/Users";
import {
  UserTable,
  UserFilters,
  UserStats,
  MOCK_USERS,
  INITIAL_FILTERS,
  filterUsers,
  calculateUserStats,
} from "@/src/components/admin/users";

const UsersPage = () => {
  const [filters, setFilters] = React.useState<UserFiltersType>(INITIAL_FILTERS);
  const [users] = React.useState(MOCK_USERS);

  // Filtered users based on current filters
  const filteredUsers = React.useMemo(
    () => filterUsers(users, filters),
    [users, filters]
  );

  // Calculate statistics from all users
  const stats = React.useMemo(() => calculateUserStats(users), [users]);

  // Action handlers
  const handleEdit = React.useCallback((user: User) => {
    toast.info(`Editing user: ${user.name}`);
    // TODO: Navigate to edit page or open modal
  }, []);

  const handleDelete = React.useCallback((user: User) => {
    toast.error(`Delete user: ${user.name}`);
    // TODO: Show confirmation dialog and delete user
  }, []);

  const handleViewProfile = React.useCallback((user: User) => {
    toast.info(`Viewing profile: ${user.name}`);
    // TODO: Navigate to user profile page
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <UserStats
        totalUsers={stats.totalUsers}
        activeUsers={stats.activeUsers}
        pendingUsers={stats.pendingUsers}
        newUsersThisMonth={stats.newUsersThisMonth}
      />

      {/* Users Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <UserFilters filters={filters} onFiltersChange={setFilters} />

          {/* Table */}
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewProfile={handleViewProfile}
          />

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
