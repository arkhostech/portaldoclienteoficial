
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import type { Database } from "../_shared/database.types.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { createAdminClient, isAdmin, validateAuth } from "../_shared/auth.ts";
import { sanitizeInput, validateClientFormData } from "../_shared/validation.ts";

// Create admin client
const supabaseAdmin = createAdminClient();

interface ClientWithAuthFormData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  status?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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
    const authResult = await validateAuth(supabaseAdmin, authHeader);
    
    if (!authResult.valid) {
      console.log(`Auth failure: ${authResult.error}`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const user = authResult.user;
    
    // Check if the user is an admin
    const adminStatus = await isAdmin(supabaseAdmin, user.id);
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
    
    // Validate required fields and formats
    const validation = validateClientFormData(clientFormData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.errors?.join(", ") || "Invalid input" }),
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
        role: 'client'
      },
      app_metadata: {
        role: 'client'
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
