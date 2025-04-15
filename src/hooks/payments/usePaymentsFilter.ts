import { useState, useCallback } from "react";
import { Client } from "@/services/clients/types";

export function usePaymentsFilter(sortedClientIds: string[], clients: Client[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Toggle between expanding all and collapsing all
  const toggleAllAccordions = useCallback(() => {
    if (expandedItems.length === sortedClientIds.length) {
      // If all are expanded, collapse all
      setExpandedItems([]);
    } else {
      // Otherwise, expand all
      setExpandedItems([...sortedClientIds]);
    }
  }, [expandedItems.length, sortedClientIds]);

  // Get filtered client IDs based on search term
  const getFilteredClientIds = useCallback(() => {
    if (!searchTerm) return sortedClientIds;

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return sortedClientIds.filter(clientId => {
      const client = clients.find(c => c.id === clientId);
      
      if (!client) return false;
      
      // Match by client name
      if (client.full_name.toLowerCase().includes(lowerSearchTerm)) {
        return true;
      }
      
      return false;
    });
  }, [searchTerm, sortedClientIds, clients]);

  return {
    searchTerm,
    setSearchTerm,
    expandedItems,
    setExpandedItems,
    toggleAllAccordions,
    getFilteredClientIds
  };
}
