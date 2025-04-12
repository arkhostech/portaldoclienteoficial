
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

    // Parse the request body
    const clientFormData: ClientWithAuthFormData = await req.json();
    
    console.log("Creating client with auth:", {
      email: clientFormData.email,
      full_name: clientFormData.full_name
    });
    
    // Create user authentication with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: clientFormData.email,
      password: clientFormData.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: clientFormData.full_name,
        role: 'client' // Explicitly set role in metadata
      },
      app_metadata: {
        role: 'client' // Set role in app_metadata as well
      }
    });
    
    if (authError) {
      console.error("Error creating auth user:", authError);
      
      // Return specific error messages
      if (authError.message.includes("already registered") || 
          authError.message.includes("email already")) {
        return new Response(
          JSON.stringify({ error: "Este email já está cadastrado no sistema de autenticação" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (authError.message.includes("Password")) {
        return new Response(
          JSON.stringify({ error: "Senha inválida: mínimo de 6 caracteres" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } 
      
      if (authError.message.includes("email")) {
        return new Response(
          JSON.stringify({ error: "Email inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Generic error
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Erro ao obter dados do usuário criado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Auth user created successfully:", authData.user.id);
    
    // Create the client record with the user ID
    const { password, ...clientDataWithoutPassword } = clientFormData;
    
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
        JSON.stringify({ error: `Erro ao criar registro do cliente: ${clientError.message}` }),
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
