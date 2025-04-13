
import React from 'react';

export function highlightMatch(text: string, term: string): React.ReactNode {
  if (!term || !text) return text;
  
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  
  if (!lowerText.includes(lowerTerm)) return text;
  
  const parts = [];
  let lastIdx = 0;
  let idx = lowerText.indexOf(lowerTerm, lastIdx);
  
  while (idx !== -1) {
    // Add text before the match
    if (idx > lastIdx) {
      parts.push(text.substring(lastIdx, idx));
    }
    
    // Add the highlighted match
    parts.push(
      <span key={idx} className="bg-yellow-100 font-medium">
        {text.substring(idx, idx + term.length)}
      </span>
    );
    
    lastIdx = idx + term.length;
    idx = lowerText.indexOf(lowerTerm, lastIdx);
  }
  
  // Add remaining text
  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }
  
  return <>{parts}</>;
}
