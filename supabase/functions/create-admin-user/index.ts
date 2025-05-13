
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import * as jose from 'https://deno.land/x/jose@v4.11.2/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create admin user credentials
    const email = 'admin@clientehub.com'
    const password = 'AdminHub2025'
    const adminData = {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin ClienteHub' },
    }

    // Create user in auth system
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser(adminData)
    
    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`)
    }

    if (!authUser?.user?.id) {
      throw new Error('User was created but no ID was returned')
    }
    
    // Add user to profiles table with admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email: email,
        full_name: 'Admin ClienteHub',
        role: 'admin',
      })
    
    if (profileError) {
      throw new Error(`Error creating profile: ${profileError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        userId: authUser.user.id,
        email,
        password,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
