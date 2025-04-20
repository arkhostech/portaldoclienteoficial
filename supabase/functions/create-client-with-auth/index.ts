
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientFormData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  status: string;
  process_type?: string;
  process_type_id?: string;
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

    // Parse the request body
    const formData: ClientFormData = await req.json();

    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, and password are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Creating user with email:", formData.email);

    // Create the user in auth.users
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      app_metadata: { role: 'client' },
      user_metadata: { full_name: formData.full_name }
    });

    if (signUpError || !userData.user) {
      console.error("Error creating user:", signUpError);
      return new Response(
        JSON.stringify({ error: signUpError?.message || "Failed to create user" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log("User created successfully. Creating client record.");

    // Create an entry in the clients table
    const { data: clientData, error: clientError } = await supabaseAdmin.from("clients").insert([
      {
        id: userData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        status: formData.status || "active",
        process_type_id: formData.process_type_id || null
      },
    ]).select().single();

    if (clientError) {
      console.error("Error creating client record:", clientError);
      // Clean up by removing the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);

      return new Response(
        JSON.stringify({ error: "Failed to create client record: " + clientError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Client created successfully with portal access",
        data: clientData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
