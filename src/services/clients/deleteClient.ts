import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RelatedEntities {
  documents: number;
  conversations: number;
  scheduledPayments: number;
}

export const checkClientRelatedEntities = async (clientId: string): Promise<RelatedEntities> => {
  try {
    // Check documents
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId);

    // Check conversations
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId);

    // Check scheduled payments
    const { count: paymentsCount } = await supabase
      .from('scheduled_payments')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId);

    return {
      documents: documentsCount || 0,
      conversations: conversationsCount || 0,
      scheduledPayments: paymentsCount || 0
    };
  } catch (error) {
    console.error("Error checking related entities:", error);
    return { documents: 0, conversations: 0, scheduledPayments: 0 };
  }
};

export const deleteClientWithCascade = async (clientId: string): Promise<boolean> => {
  try {
    // Delete in order to respect foreign key constraints
    // 1. Delete messages first (they reference conversations)
    // First get conversation IDs
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId);

    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(conv => conv.id);
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);

      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
      }
    }

    // 2. Delete conversations
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('client_id', clientId);

    if (conversationsError) {
      console.error("Error deleting conversations:", conversationsError);
    }

    // 3. Delete scheduled payments
    const { error: paymentsError } = await supabase
      .from('scheduled_payments')
      .delete()
      .eq('client_id', clientId);

    if (paymentsError) {
      console.error("Error deleting scheduled payments:", paymentsError);
    }

    // 4. Delete documents
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .eq('client_id', clientId);

    if (documentsError) {
      console.error("Error deleting documents:", documentsError);
      toast.error("Erro ao excluir documentos do cliente");
      return false;
    }

    // 5. Finally delete the client
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (clientError) {
      console.error("Error deleting client:", clientError);
      toast.error("Erro ao excluir cliente");
      return false;
    }

    toast.success("Cliente e todos os dados associados foram excluídos com sucesso");
    return true;
  } catch (error) {
    console.error("Unexpected error deleting client with cascade:", error);
    toast.error("Erro inesperado ao excluir cliente");
    return false;
  }
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting client:", error);
      
      // If it's a foreign key constraint error, provide more helpful message
      if (error.code === '23503') {
        toast.error("Não é possível excluir o cliente pois ele possui documentos ou outros dados associados");
      } else {
        toast.error("Erro ao excluir cliente");
      }
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
