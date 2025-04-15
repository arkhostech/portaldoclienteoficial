
import { useState } from "react";
import { Client } from "@/services/clients/types";

export const useClientGroups = (clients: Client[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Group clients by process type
  const groupedClients = clients.reduce((acc: { [key: string]: Client[] }, client) => {
    const processType = client.process_type || "Other";
    if (!acc[processType]) {
      acc[processType] = [];
    }
    acc[processType].push(client);
    return acc;
  }, {});

  // Filter based on search term
  const filteredGroups = Object.entries(groupedClients)
    .map(([type, clients]) => ({
      type,
      clients: clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(group => group.clients.length > 0);

  return {
    searchTerm,
    setSearchTerm,
    filteredGroups,
  };
};
