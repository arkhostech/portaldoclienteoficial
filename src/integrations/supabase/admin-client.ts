
// This is the admin client with service role capabilities
// It should ONLY be used in server functions or for admin-only operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the same URL as the regular client
const SUPABASE_URL = "https://mdywdodbnmxavqleccwf.supabase.co";

// Updated service role key that matches the project
// IMPORTANT: This key should be kept secure and only used in admin operations
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keXdkb2Ribm14YXZxbGVjY3dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzk4ODA1NCwiZXhwIjoyMDI5NTY0MDU0fQ.9W765ySRrT4eYiojdZmwwKBI_J6n59RT6sXzL_ZbF-s";

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false, // Don't persist session for admin operations
    autoRefreshToken: false // Don't auto refresh token for admin operations
  }
});
