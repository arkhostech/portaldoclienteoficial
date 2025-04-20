
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProcessType {
  id: string;
  name: string;
}

export const useProcessTypes = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: processTypes, isLoading } = useQuery({
    queryKey: ['process-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('process_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching process types:", error);
        toast.error("Erro ao carregar tipos de processo");
        return [];
      }
      
      return data as ProcessType[];
    }
  });

  const addProcessType = useMutation({
    mutationFn: async (name: string) => {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('process_types')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-types'] });
      toast.success("Processo adicionado com sucesso");
    },
    onError: (error) => {
      console.error("Error adding process type:", error);
      toast.error("Erro ao adicionar processo");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const updateProcessType = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('process_types')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-types'] });
      toast.success("Processo atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Error updating process type:", error);
      toast.error("Erro ao atualizar processo");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const deleteProcessType = useMutation({
    mutationFn: async (id: string) => {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('process_types')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-types'] });
      toast.success("Processo excluído com sucesso");
    },
    onError: (error) => {
      console.error("Error deleting process type:", error);
      toast.error("Erro ao excluir processo");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  return {
    processTypes: processTypes || [],
    isLoading,
    isSubmitting,
    addProcessType: addProcessType.mutate,
    updateProcessType: updateProcessType.mutate,
    deleteProcessType: deleteProcessType.mutate
  };
};
