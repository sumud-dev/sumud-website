export type UserRole = "super_admin" | "admin" | "editor" | "author" | "viewer";
export type UserStatus = "active" | "inactive" | "pending" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  articlesCount?: number;
}

export interface UserFilters {
  search: string;
  role: UserRole | "all";
  status: UserStatus | "all";
}

export interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewProfile: (user: User) => void;
}

export interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewProfile: (user: User) => void;
}

export interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

export interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  newUsersThisMonth: number;
}
