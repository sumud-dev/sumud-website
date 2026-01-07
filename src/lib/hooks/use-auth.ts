'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(roleName: string | string[]) {
  const { user, isLoaded } = useUser();

  const { data: hasRole, isLoading } = useQuery({
    queryKey: ['userRole', user?.id, roleName],
    queryFn: async () => {
      if (!user?.id) return false;

      const response = await fetch('/api/auth/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roleName: Array.isArray(roleName) ? roleName : [roleName],
          checkAny: Array.isArray(roleName),
        }),
      });

      if (!response.ok) throw new Error('Failed to check role');
      const result = await response.json();
      return result.hasRole;
    },
    enabled: isLoaded && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    hasRole: hasRole ?? false,
    isLoading: isLoading || !isLoaded,
  };
}

/**
 * Hook to check if user has a specific permission
 */
export function useHasPermission(permissionName: string | string[]) {
  const { user, isLoaded } = useUser();

  const { data: hasPermission, isLoading } = useQuery({
    queryKey: ['userPermission', user?.id, permissionName],
    queryFn: async () => {
      if (!user?.id) return false;

      const response = await fetch('/api/auth/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          permissionName: Array.isArray(permissionName) ? permissionName : [permissionName],
          checkAny: Array.isArray(permissionName),
        }),
      });

      if (!response.ok) throw new Error('Failed to check permission');
      const result = await response.json();
      return result.hasPermission;
    },
    enabled: isLoaded && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    hasPermission: hasPermission ?? false,
    isLoading: isLoading || !isLoaded,
  };
}

/**
 * Hook to get user's roles
 */
export function useUserRoles() {
  const { user, isLoaded } = useUser();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch(`/api/auth/user-roles?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch roles');
      const result = await response.json();
      return result.roles;
    },
    enabled: isLoaded && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    roles: roles ?? [],
    isLoading: isLoading || !isLoaded,
  };
}

/**
 * Hook to get user's permissions
 */
export function useUserPermissions() {
  const { user, isLoaded } = useUser();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch(`/api/auth/user-permissions?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const result = await response.json();
      return result.permissions;
    },
    enabled: isLoaded && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    permissions: permissions ?? [],
    isLoading: isLoading || !isLoaded,
  };
}
