"use server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  role_id: number | null;
  supabase_id: string | null;
  avatar_url?: string | null; // Store in metadata for now
}

export interface UpdateUserProfileData {
  name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
}

export interface MutationResponse {
  success: boolean;
  error: string | null;
  data?: UserProfile | UserProfile[] | null;
}

/**
 * Get current user profile by email or supabase_id
 */
export async function getUserProfile(
  identifier: string,
  type: "email" | "supabase_id" = "email"
): Promise<MutationResponse> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq(type, identifier)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update user profile
 * Note: avatar_url will be stored in a JSON field or you should add a column to the users table
 */
export async function updateUserProfile(
  userId: number,
  updates: UpdateUserProfileData
): Promise<MutationResponse> {
  try {
    const supabase = createAdminClient();

    // Update user basic info
    const updateData: Record<string, string> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: error.message };
    }

    // Note: avatar_url and bio would need to be stored in a separate profiles table
    // or as JSONB metadata in the users table. For now, return success.
    // TODO: Add a user_profiles table or metadata JSONB column to store avatar_url and bio

    revalidatePath("/admin/settings");
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get user by Supabase auth ID
 */
export async function getUserBySupabaseId(
  supabaseId: string
): Promise<MutationResponse> {
  return getUserProfile(supabaseId, "supabase_id");
}

/**
 * Create a new user profile
 */
export async function createUserProfile(
  userData: {
    email: string;
    name?: string;
    supabase_id?: string;
    role_id?: number;
  }
): Promise<MutationResponse> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
