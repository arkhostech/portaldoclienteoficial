
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
      return false;
    }
    
    toast.success("Cliente excluído com sucesso");
    return true;
  } catch (error) {
    console.error("Unexpected error deleting client:", error);
    toast.error("Erro ao excluir cliente");
    return false;
  }
};
