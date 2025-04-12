
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const resetClientPassword = async (clientId: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke<{
      message: string;
      data: { id: string };
      error?: string;
    }>("reset-client-password", {
      body: { clientId, password },
    });
    
    // Handle edge function errors
    if (error) {
      console.error("Edge function error:", error);
      toast.error(error.message || "Erro ao redefinir senha do cliente");
      return false;
    }
    
    // Handle application errors returned from the edge function
    if (!data || data.error) {
      console.error("Application error:", data?.error || "Unknown error");
      toast.error(data?.error || "Erro ao redefinir senha do cliente");
      return false;
    }
    
    // Success case
    toast.success("Senha do cliente redefinida com sucesso");
    return true;
  } catch (error) {
    console.error("Unexpected error resetting client password:", error);
    toast.error("Erro ao redefinir senha do cliente");
    return false;
  }
};
