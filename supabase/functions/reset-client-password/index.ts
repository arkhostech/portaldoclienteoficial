
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  clientId: string;
  password: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the request body
    const { clientId, password } = await req.json() as RequestBody;

    if (!clientId || !password) {
      return new Response(
        JSON.stringify({ 
          error: "Client ID and password are required"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get the client from the database to get their email
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("email")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      console.error("Error getting client:", clientError);
      return new Response(
        JSON.stringify({ 
          error: "Client not found" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    // Update the user's password using the admin client
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      clientId,
      { password: password }
    );

    if (passwordError) {
      console.error("Error updating password:", passwordError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to reset password" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: "Password reset successfully",
        data: { id: clientId }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
