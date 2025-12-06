import { User, UserRole, UserStatus } from "@/src/types/Users";
import { SelectOption } from "@/src/types/Settings";

// Role configuration with labels and colors
export const ROLE_CONFIG: Record<UserRole, { label: string; variant: "default" | "secondary" | "outline" }> = {
  super_admin: { label: "Super Admin", variant: "default" },
  admin: { label: "Admin", variant: "default" },
  editor: { label: "Editor", variant: "secondary" },
  author: { label: "Author", variant: "secondary" },
  viewer: { label: "Viewer", variant: "outline" },
};

// Status configuration with labels and colors
export const STATUS_CONFIG: Record<UserStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

// Filter options for dropdowns
export const ROLE_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Roles" },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "author", label: "Author" },
  { value: "viewer", label: "Viewer" },
];

export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

// Mock users data
export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Ahmad Hassan",
    email: "ahmad@sumud.org",
    avatar: "",
    role: "super_admin",
    status: "active",
    lastLogin: "2025-12-06T10:30:00",
    createdAt: "2024-01-15",
    articlesCount: 45,
  },
  {
    id: "2",
    name: "Layla Mansour",
    email: "layla@sumud.org",
    avatar: "",
    role: "admin",
    status: "active",
    lastLogin: "2025-12-05T14:20:00",
    createdAt: "2024-02-20",
    articlesCount: 32,
  },
  {
    id: "3",
    name: "Omar Khalil",
    email: "omar@sumud.org",
    avatar: "",
    role: "editor",
    status: "active",
    lastLogin: "2025-12-04T09:15:00",
    createdAt: "2024-03-10",
    articlesCount: 28,
  },
  {
    id: "4",
    name: "Sara Ibrahim",
    email: "sara@sumud.org",
    avatar: "",
    role: "author",
    status: "pending",
    lastLogin: undefined,
    createdAt: "2025-12-01",
    articlesCount: 0,
  },
  {
    id: "5",
    name: "Yusuf Ahmed",
    email: "yusuf@sumud.org",
    avatar: "",
    role: "author",
    status: "active",
    lastLogin: "2025-12-03T16:45:00",
    createdAt: "2024-06-15",
    articlesCount: 15,
  },
  {
    id: "6",
    name: "Fatima Ali",
    email: "fatima@sumud.org",
    avatar: "",
    role: "viewer",
    status: "inactive",
    lastLogin: "2025-10-20T11:00:00",
    createdAt: "2024-04-22",
    articlesCount: 0,
  },
  {
    id: "7",
    name: "Karim Nasser",
    email: "karim@sumud.org",
    avatar: "",
    role: "editor",
    status: "suspended",
    lastLogin: "2025-11-15T08:30:00",
    createdAt: "2024-05-18",
    articlesCount: 12,
  },
];

// Initial filter state
export const INITIAL_FILTERS = {
  search: "",
  role: "all" as const,
  status: "all" as const,
};
