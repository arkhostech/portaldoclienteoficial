// This is the admin client with service role capabilities
// It should ONLY be used in server functions or for admin-only operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the same URL as the regular client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Service role key - hardcoded for client use
// IMPORTANT: In a real production app, this should be kept secure and only used in server environments
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create the admin client with appropriate options
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,  // Don't refresh token automatically
      persistSession: false,    // Don't store session in local storage
      detectSessionInUrl: false // Don't look for the session in the URL
    }
  }
);
