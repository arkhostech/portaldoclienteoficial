import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface ClientData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "documentacao" | "em_andamento" | "concluido";
  process_type_id: string | null;
  process_type_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientStats {
  documentsCount: number;
  conversationsCount: number;
  lastUpdate: string | null;
}

export const useClientData = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats>({
    documentsCount: 0,
    conversationsCount: 0,
    lastUpdate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchClientData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch client data by matching email with the authenticated user
        const { data: clientInfo, error: clientError } = await supabase
          .from("clients")
          .select(`
            *,
            process_types (
              id,
              name
            )
          `)
          .eq("email", user.email)
          .single();

        if (clientError) {
          if (clientError.code === 'PGRST116') {
            setError("Cliente não encontrado. Entre em contato com o suporte.");
          } else {
            setError("Erro ao buscar dados do cliente.");
            console.error("Error fetching client:", clientError);
          }
          setIsLoading(false);
          return;
        }

        const formattedClientData: ClientData = {
          id: clientInfo.id,
          full_name: clientInfo.full_name,
          email: clientInfo.email,
          phone: clientInfo.phone,
          status: clientInfo.status as "documentacao" | "em_andamento" | "concluido",
          process_type_id: clientInfo.process_type_id,
          process_type_name: clientInfo.process_types?.name || null,
          created_at: clientInfo.created_at,
          updated_at: clientInfo.updated_at,
        };

        setClientData(formattedClientData);

        // Fetch additional statistics
        const [documentsResult, conversationsResult] = await Promise.all([
          // Documents count
          supabase
            .from("documents")
            .select("id")
            .eq("client_id", clientInfo.id),
          
          // Conversations count
          supabase
            .from("conversations")
            .select("id")
            .eq("client_id", clientInfo.id),
        ]);

        const stats: ClientStats = {
          documentsCount: documentsResult.data?.length || 0,
          conversationsCount: conversationsResult.data?.length || 0,
          lastUpdate: clientInfo.updated_at,
        };

        setClientStats(stats);

      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Erro inesperado ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  return {
    clientData,
    clientStats,
    isLoading,
    error,
    refetch: () => {
      if (user) {
        setIsLoading(true);
        // Re-trigger the effect by updating a dependency
      }
    }
  };
}; 