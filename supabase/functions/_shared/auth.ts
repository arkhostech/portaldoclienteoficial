
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import type { Database } from "./database.types.ts";

// Create a Supabase admin client
export const createAdminClient = () => {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
};

// Function to check if a user is an admin
export async function isAdmin(supabaseAdmin: any, userId: string): Promise<boolean> {
  try {
    // Using the profiles table to check if user has admin role
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    return data.role === 'admin';
  } catch (error) {
    console.error("Unexpected error checking admin status:", error);
    return false;
  }
}

// Validate auth token and extract user
export async function validateAuth(supabaseAdmin: any, authHeader: string): Promise<{ 
  valid: boolean; 
  user?: any; 
  error?: string;
}> {
  try {
    const jwt = authHeader.replace("Bearer ", "");
    
    if (!jwt) {
      return { valid: false, error: "No JWT token provided" };
    }
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (authError || !user) {
      return { valid: false, error: "Invalid JWT token" };
    }
    
    return { valid: true, user };
  } catch (error) {
    console.error("Auth validation error:", error);
    return { valid: false, error: "Authentication error" };
  }
}
