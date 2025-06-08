import { useEffect, RefObject } from 'react';

interface UseScrollToTopProps {
  containerRef: RefObject<HTMLDivElement>;
  onScrollToTop: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useScrollToTop = ({
  containerRef,
  onScrollToTop,
  threshold = 100,
  enabled = true
}: UseScrollToTopProps) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      if (container.scrollTop <= threshold) {
        onScrollToTop();
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, onScrollToTop, threshold, enabled]);
}; 