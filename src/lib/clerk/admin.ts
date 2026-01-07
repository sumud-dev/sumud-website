/**
 * Clerk Admin Operations
 * 
 * Server-side utilities for managing users via Clerk Backend API.
 * Only accessible by super_admin or admin users.
 */

import { clerkClient } from '@clerk/nextjs/server';

/**
 * Create a new user in Clerk with password authentication
 */
export async function createClerkUser(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}) {
  const client = await clerkClient();
  
  const user = await client.users.createUser({
    emailAddress: [data.email],
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    password: data.password,
  });

  return user;
}

/**
 * Update a user in Clerk
 */
export async function updateClerkUser(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
  }
) {
  const client = await clerkClient();
  
  const user = await client.users.updateUser(userId, {
    firstName: data.firstName,
    lastName: data.lastName,
  });

  return user;
}

/**
 * Delete a user from Clerk
 */
export async function deleteClerkUser(userId: string) {
  const client = await clerkClient();
  await client.users.deleteUser(userId);
}

/**
 * Trigger password reset email for a user
 * Note: Clerk doesn't have a direct "send reset password email" API.
 * The user must use the sign-in page with "Forgot password" flow.
 * However, we can update the user's password directly if needed.
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  const client = await clerkClient();
  
  const user = await client.users.updateUser(userId, {
    password: newPassword,
  });

  return user;
}

/**
 * Get a user from Clerk by ID
 */
export async function getClerkUser(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user;
}

/**
 * Get all users from Clerk (paginated)
 */
export async function getClerkUsers(limit = 100, offset = 0) {
  const client = await clerkClient();
  const { data: users, totalCount } = await client.users.getUserList({
    limit,
    offset,
  });
  return { users, totalCount };
}

/**
 * Ban a user in Clerk (locks them out)
 */
export async function banClerkUser(userId: string) {
  const client = await clerkClient();
  const user = await client.users.banUser(userId);
  return user;
}

/**
 * Unban a user in Clerk
 */
export async function unbanClerkUser(userId: string) {
  const client = await clerkClient();
  const user = await client.users.unbanUser(userId);
  return user;
}
