
import { useState } from "react";
import { Client } from "@/services/clients/types";

export function usePaymentsFilter(sortedClientIds: string[], clients: Client[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Toggle all accordions
  const toggleAllAccordions = () => {
    if (expandedItems.length === sortedClientIds.length) {
      setExpandedItems([]);
    } else {
      setExpandedItems([...sortedClientIds]);
    }
  };

  // Filter client IDs based on search
  const getFilteredClientIds = () => {
    if (!searchTerm) return sortedClientIds;
    
    return sortedClientIds.filter(clientId => {
      const client = clients.find(c => c.id === clientId);
      if (client?.full_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      return false;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    expandedItems,
    setExpandedItems,
    toggleAllAccordions,
    getFilteredClientIds
  };
}
