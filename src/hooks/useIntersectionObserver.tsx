import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  onIntersect: (element: Element) => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const useIntersectionObserver = ({
  onIntersect,
  threshold = 0.5,
  rootMargin = '0px',
  enabled = true
}: UseIntersectionObserverProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observar elementos já registrados
    elementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onIntersect, threshold, rootMargin, enabled]);

  const observe = (element: Element) => {
    if (!element || !enabled) return;
    
    elementsRef.current.add(element);
    observerRef.current?.observe(element);
  };

  const unobserve = (element: Element) => {
    if (!element) return;
    
    elementsRef.current.delete(element);
    observerRef.current?.unobserve(element);
  };

  const disconnect = () => {
    observerRef.current?.disconnect();
    elementsRef.current.clear();
  };

  return { observe, unobserve, disconnect };
}; 