import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/lib/database.types";

/**
 * Create a Supabase admin client that bypasses Row Level Security.
 * This should ONLY be used in server-side code for admin operations.
 * 
 * IMPORTANT: Never expose the service role key to the client!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
