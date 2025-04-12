
// This is the admin client with service role capabilities
// It should ONLY be used in server functions or for admin-only operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mdywdodbnmxavqleccwf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keXdkb2Ribm14YXZxbGVjY3dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDI3NDU1MiwiZXhwIjoyMDU5ODUwNTUyfQ.v8UfreCF_nNnI73dozNcaeNjIWWfCx5QhiFdMbGjvNA";

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});
