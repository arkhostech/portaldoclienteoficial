
import { useRef } from "react";

/**
 * Custom hook to manage timeouts with automatic cleanup
 */
export const useTimeoutManager = () => {
  // Cleanup for timeouts
  const timeoutRefs = useRef<Array<NodeJS.Timeout>>([]);

  // Cleanup function to clear any pending timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  };

  // Add a timeout with automatic tracking for cleanup
  const addTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      // Remove this timeout from the refs array when it executes
      timeoutRefs.current = timeoutRefs.current.filter(t => t !== timeoutId);
      callback();
    }, delay);
    
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  return {
    addTimeout,
    clearAllTimeouts
  };
};
