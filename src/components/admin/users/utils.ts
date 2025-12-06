import { User, UserFilters } from "@/src/types/Users";

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateString);
};

/**
 * Filter users based on search query and filters
 */
export const filterUsers = (users: User[], filters: UserFilters): User[] => {
  return users.filter((user) => {
    // Search filter
    const searchMatch =
      !filters.search ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());

    // Role filter
    const roleMatch = filters.role === "all" || user.role === filters.role;

    // Status filter
    const statusMatch = filters.status === "all" || user.status === filters.status;

    return searchMatch && roleMatch && statusMatch;
  });
};

/**
 * Calculate user statistics
 */
export const calculateUserStats = (users: User[]) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    pendingUsers: users.filter((u) => u.status === "pending").length,
    newUsersThisMonth: users.filter(
      (u) => new Date(u.createdAt) >= startOfMonth
    ).length,
  };
};
