
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useChartData = () => {
  const [processTypeData, setProcessTypeData] = useState<{ name: string; value: number; total: number }[]>([]);
  const [processStatusData, setProcessStatusData] = useState<{ name: string; value: number; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Fetch clients for process type distribution
        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .select("process_type");
        
        if (clientsError) throw clientsError;
        
        // Count process types and calculate total
        const processTypeCounts: Record<string, number> = {};
        clients?.forEach(client => {
          const processType = client.process_type || "Não Atribuído";
          processTypeCounts[processType] = (processTypeCounts[processType] || 0) + 1;
        });
        
        const total = Object.values(processTypeCounts).reduce((acc, curr) => acc + curr, 0);
        
        // Format data for chart
        const formattedProcessTypeData = Object.entries(processTypeCounts)
          .map(([name, value]) => ({ name, value, total }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        
        setProcessTypeData(formattedProcessTypeData);
        
        // Fetch clients for status distribution
        const { data: statusClients, error: statusError } = await supabase
          .from("clients")
          .select("status");
        
        if (statusError) throw statusError;
        
        // Count statuses and calculate total
        const statusCounts: Record<string, number> = {};
        statusClients?.forEach(client => {
          const status = client.status || "Em Análise";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const statusTotal = Object.values(statusCounts).reduce((acc, curr) => acc + curr, 0);
        
        // Format data for chart
        const formattedStatusData = Object.entries(statusCounts)
          .map(([name, value]) => ({ name, value, total: statusTotal }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        
        setProcessStatusData(formattedStatusData);
        
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChartData();
  }, []);

  return {
    processTypeData,
    processStatusData,
    isLoading
  };
};
