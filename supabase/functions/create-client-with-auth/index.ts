
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import type { Database } from "../_shared/database.types.ts";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key (secure in edge function)
const supabaseAdmin = createClient<Database>(
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

interface ClientWithAuthFormData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  status?: string;
}

// Simple rate limiting implementation using in-memory cache
// Note: This provides basic protection but will reset on function restart
const MAX_REQUESTS_PER_MINUTE = 10;
const requestCache = new Map<string, { count: number, timestamp: number }>();

// Function to check if a user is an admin
async function isAdmin(userId: string): Promise<boolean> {
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

// Function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate password strength
function isValidPassword(password: string): boolean {
  // At least 6 characters (minimum requirement)
  return password.length >= 6;
}

// Function to sanitize input data
function sanitizeInput(input: string): string {
  // Basic sanitization - remove potentially harmful characters
  return input.replace(/[<>"'&]/g, '');
}

// Check rate limiting
function checkRateLimit(userId: string): { allowed: boolean, message?: string } {
  const now = Date.now();
  const minute = 60 * 1000; // milliseconds in a minute
  
  // Get current request data for this user
  const userData = requestCache.get(userId);
  
  if (!userData) {
    // First request from this user
    requestCache.set(userId, { count: 1, timestamp: now });
    return { allowed: true };
  }
  
  // If timestamp is older than a minute, reset the counter
  if (now - userData.timestamp > minute) {
    requestCache.set(userId, { count: 1, timestamp: now });
    return { allowed: true };
  }
  
  // If under the limit, increment the counter
  if (userData.count < MAX_REQUESTS_PER_MINUTE) {
    requestCache.set(userId, { 
      count: userData.count + 1, 
      timestamp: userData.timestamp 
    });
    return { allowed: true };
  }
  
  // Rate limit exceeded
  return { 
    allowed: false, 
    message: `Rate limit exceeded. Try again later.` 
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST methods for this function
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Authenticate and authorize the calling user
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    
    if (!jwt) {
      console.log("Auth failure: No JWT token provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (authError || !user) {
      console.log("Auth failure: Invalid JWT token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Check if the user is an admin
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      console.log(`Auth failure: User ${user.id} is not an admin`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // 2. Check rate limiting for this admin user
    const rateLimitCheck = checkRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for admin ${user.id}`);
      return new Response(JSON.stringify({ error: rateLimitCheck.message }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Parse and validate input
    const clientFormData: ClientWithAuthFormData = await req.json();
    
    // Validate required fields
    if (!clientFormData.full_name || !clientFormData.email || !clientFormData.password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Sanitize inputs
    const sanitizedData = {
      ...clientFormData,
      full_name: sanitizeInput(clientFormData.full_name),
      email: sanitizeInput(clientFormData.email),
      phone: clientFormData.phone ? sanitizeInput(clientFormData.phone) : undefined,
      address: clientFormData.address ? sanitizeInput(clientFormData.address) : undefined,
    };
    
    // Validate email format
    if (!isValidEmail(sanitizedData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate password strength
    if (!isValidPassword(clientFormData.password)) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Creating client with auth:", {
      admin_id: user.id,
      client_email: sanitizedData.email.substring(0, 3) + "***", // Log partial email for debugging
    });
    
    // 4. Check if user with this email already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error checking existing users:", listError);
      return new Response(
        JSON.stringify({ error: "Error processing request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userExists = existingUsers.users.some(u => u.email === sanitizedData.email);
    if (userExists) {
      console.log("User already exists with email:", sanitizedData.email.substring(0, 3) + "***");
      return new Response(
        JSON.stringify({ error: "Este email já está cadastrado no sistema de autenticação" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 5. Create user authentication with admin privileges
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedData.email,
      password: clientFormData.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: sanitizedData.full_name,
        role: 'client' // Explicitly set role in metadata
      },
      app_metadata: {
        role: 'client' // Set role in app_metadata as well
      }
    });
    
    if (authCreateError) {
      console.error("Error creating auth user:", authCreateError);
      
      // Return generic error message without exposing specifics
      let errorMessage = "Error creating user account";
      
      // Only provide specific messages for validation errors
      if (authCreateError.message.includes("already registered") || 
          authCreateError.message.includes("email already")) {
        errorMessage = "Este email já está cadastrado no sistema de autenticação";
      } else if (authCreateError.message.includes("Password")) {
        errorMessage = "Senha inválida: mínimo de 6 caracteres";
      } else if (authCreateError.message.includes("email")) {
        errorMessage = "Email inválido";
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!authData.user) {
      console.error("User creation succeeded but no user data returned");
      return new Response(
        JSON.stringify({ error: "Erro ao obter dados do usuário criado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Auth user created successfully:", authData.user.id);
    
    // 6. Create the client record with the user ID
    const { password, ...clientDataWithoutPassword } = sanitizedData;
    
    const clientWithId = {
      ...clientDataWithoutPassword,
      id: authData.user.id
    };
    
    console.log("Creating client record in database");
    
    // Create client record in the clients table
    const { data: newClientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert([clientWithId])
      .select()
      .single();
    
    if (clientError) {
      console.error("Error creating client record:", clientError);
      
      // If the client record creation fails, clean up by deleting the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ error: "Erro ao criar registro do cliente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Client record created successfully");
    
    // Return the created client data
    return new Response(
      JSON.stringify({ 
        data: newClientData,
        message: "Cliente criado com sucesso com acesso ao portal"
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error in create-client-with-auth:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao criar cliente com autenticação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
