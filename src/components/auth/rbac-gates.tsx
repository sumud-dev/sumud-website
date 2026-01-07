'use client';

import { useHasRole, useHasPermission } from '@/src/lib/hooks/use-auth';
import { ReactNode } from 'react';

interface RoleGateProps {
  children: ReactNode;
  roles: string | string[];
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user role
 */
export function RoleGate({ children, roles, fallback }: RoleGateProps) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const { hasRole, isLoading } = useHasRole(roleArray.length === 1 ? roles : roleArray);

  if (isLoading) {
    return null; // Or a skeleton
  }

  if (!hasRole) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface PermissionGateProps {
  children: ReactNode;
  permissions: string | string[];
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user permission
 */
export function PermissionGate({ children, permissions, fallback }: PermissionGateProps) {
  const permArray = Array.isArray(permissions) ? permissions : [permissions];
  const { hasPermission, isLoading } = useHasPermission(permArray.length === 1 ? permissions : permArray);

  if (isLoading) {
    return null; // Or a skeleton
  }

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * Component that conditionally renders content based on both role and permission
 */
export function ProtectedContent({
  children,
  roles,
  permissions,
  fallback,
  requireAll = false,
}: ProtectedRouteProps) {
  const { hasRole, isLoading: roleLoading } = useHasRole(roles || []);
  const { hasPermission, isLoading: permLoading } = useHasPermission(permissions || []);

  const isLoading = roleLoading || permLoading;

  if (isLoading) {
    return null;
  }

  if (roles && permissions && requireAll) {
    // Both role AND permission required
    if (!hasRole || !hasPermission) {
      return fallback || null;
    }
  } else if (roles && permissions) {
    // Role OR permission required
    if (!hasRole && !hasPermission) {
      return fallback || null;
    }
  } else if (roles) {
    if (!hasRole) {
      return fallback || null;
    }
  } else if (permissions) {
    if (!hasPermission) {
      return fallback || null;
    }
  }

  return <>{children}</>;
}
