
import React from "react";

// Function to highlight matched text in a string
export const highlightMatch = (text: string, term: string) => {
  if (!term || term === "") return text;
  
  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded-sm">{part}</mark> : part
  );
};
