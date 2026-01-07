'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Get user's role from Clerk public metadata
 */
async function getUserRole(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return (user.publicMetadata?.role as string) || null;
  } catch (error) {
    console.error('[getUserRole] Error:', error);
    return null;
  }
}

/**
 * Check if user has admin access (super_admin or admin role)
 */
export async function requireAdmin() {
  const authObj = await auth();
  
  if (!authObj.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const role = await getUserRole(authObj.userId);
  const isAdmin = role === 'super_admin' || role === 'admin';
  
  if (!isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return authObj.userId;
}

/**
 * Check if user is super_admin (highest privilege level)
 * Use this for operations like managing other admins or system settings
 */
export async function requireSuperAdmin() {
  const authObj = await auth();
  
  if (!authObj.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const role = await getUserRole(authObj.userId);
  
  if (role !== 'super_admin') {
    throw new Error('Forbidden: Super admin access required');
  }

  return authObj.userId;
}

/**
 * Check if user has a specific role
 */
export async function requireRole(roleName: string | string[]) {
  const authObj = await auth();
  
  if (!authObj.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const roleNames = Array.isArray(roleName) ? roleName : [roleName];
  const userRole = await getUserRole(authObj.userId);
  const hasRole = userRole ? roleNames.includes(userRole) : false;
  
  if (!hasRole) {
    throw new Error(`Forbidden: Required role(s) ${roleNames.join(' or ')} not found`);
  }

  return authObj.userId;
}

/**
 * Check if user has a specific permission (based on role)
 * Permissions are derived from roles in Clerk metadata
 */
export async function requirePermission(permissionName: string | string[]) {
  const authObj = await auth();
  
  if (!authObj.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const role = await getUserRole(authObj.userId);
  
  // Define role-based permissions
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['*'], // All permissions
    admin: [
      'manage_users', 'assign_roles',
      'create_articles', 'edit_articles', 'delete_articles', 'publish_articles',
      'create_campaigns', 'edit_campaigns', 'delete_campaigns', 'publish_campaigns',
      'create_events', 'edit_events', 'delete_events', 'publish_events',
      'manage_settings',
    ],
    editor: [
      'create_articles', 'edit_articles',
      'create_campaigns', 'edit_campaigns',
      'create_events', 'edit_events',
    ],
  };

  const permissionNames = Array.isArray(permissionName) ? permissionName : [permissionName];
  const userPermissions = role ? (rolePermissions[role] || []) : [];
  
  // Super admin has all permissions
  const hasPermission = userPermissions.includes('*') || 
    permissionNames.some(p => userPermissions.includes(p));
  
  if (!hasPermission) {
    throw new Error(`Forbidden: Required permission(s) ${permissionNames.join(' or ')} not found`);
  }

  return authObj.userId;
}

/**
 * Get authenticated user ID (throws if not authenticated)
 */
export async function requireAuth() {
  const authObj = await auth();
  
  if (!authObj.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return authObj.userId;
}
