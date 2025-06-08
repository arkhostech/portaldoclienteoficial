import { useEffect, RefObject } from 'react';

interface UseScrollToBottomProps {
  containerRef: RefObject<HTMLDivElement>;
  onNearBottom: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useScrollToBottom = ({
  containerRef,
  onNearBottom,
  threshold = 100,
  enabled = true
}: UseScrollToBottomProps) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      if (distanceFromBottom <= threshold) {
        onNearBottom();
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, onNearBottom, threshold, enabled]);
}; 