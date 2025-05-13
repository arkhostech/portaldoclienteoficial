
import { useState } from "react";
import { supabase, clearUserRoleCache } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdminPath } from "./utils";

export function useAuthActions() {
  const navigate = useNavigate();
  const location = useLocation();

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Login bem-sucedido!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message}`);
      throw error;
    }
  };

  const signOut = async (userId?: string) => {
    try {
      // Clear cached data for the current user
      if (userId) {
        clearUserRoleCache(userId);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect based on current path
      if (isAdminPath(location.pathname)) {
        navigate("/admin-login");
      } else {
        navigate("/");
      }
      
      toast.success("Desconectado com sucesso!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Erro ao desconectar: ${error.message}`);
    }
  };

  return {
    signIn,
    signOut
  };
}
