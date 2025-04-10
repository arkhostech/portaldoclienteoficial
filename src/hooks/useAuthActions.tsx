
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthActions() {
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    console.log("Attempting to sign in:", email);
    setActionLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log("Sign in successful for:", data?.user?.id);
      
      // Get updated user data after login
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        // Check if user is admin
        let isAdmin = false;
        
        // First check metadata
        if (userData.user.user_metadata?.role === 'admin') {
          isAdmin = true;
        } else {
          // Then check profiles table
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single();
            
          isAdmin = data?.role === 'admin';
        }
        
        toast.success("Login bem-sucedido!");
        
        // Redirect based on user role
        if (isAdmin) {
          navigate("/admin"); // Redirect admin to admin dashboard
        } else {
          navigate("/dashboard"); // Redirect client to client dashboard
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, isAdmin = false) => {
    console.log("Attempting to sign up user:", email, "Is Admin:", isAdmin);
    setActionLoading(true);
    
    try {
      // Create the user with metadata including role
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: isAdmin ? "admin" : "client"
          }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Erro ao criar usuário");
      }
      
      // Create a record in the profiles table only if the user was created successfully
      if (data.user && data.user.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              email: email,
              full_name: fullName,
              role: isAdmin ? 'admin' : 'client' 
            }
          ]);
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast.error("Conta criada, mas houve um problema ao configurar o perfil.");
        }
      }
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
      
      // Don't redirect automatically, let the user see the success message
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error(`Erro ao criar conta: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    console.log("Signing out user");
    setActionLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/");
      toast.success("Desconectado com sucesso!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Erro ao desconectar: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    actionLoading
  };
}
