import { useEffect, useRef, RefObject } from 'react';

interface UseScrollPositionProps {
  containerRef: RefObject<HTMLDivElement>;
  isLoading: boolean;
  dependency: any; // A dependência que vai mudar (como messages.length)
}

export const useScrollPosition = ({ 
  containerRef, 
  isLoading, 
  dependency 
}: UseScrollPositionProps) => {
  const savedScrollHeight = useRef<number>(0);
  const savedScrollTop = useRef<number>(0);

  // Salva a posição antes de carregar
  useEffect(() => {
    if (isLoading && containerRef.current) {
      const container = containerRef.current;
      savedScrollHeight.current = container.scrollHeight;
      savedScrollTop.current = container.scrollTop;
    }
  }, [isLoading, containerRef]);

  // Restaura a posição depois de carregar
  useEffect(() => {
    if (!isLoading && containerRef.current && savedScrollHeight.current > 0) {
      const container = containerRef.current;
      const newScrollHeight = container.scrollHeight;
      const scrollHeightDiff = newScrollHeight - savedScrollHeight.current;
      
      // Ajusta o scroll para manter a posição relativa
      container.scrollTop = savedScrollTop.current + scrollHeightDiff;
      
      // Reset dos valores salvos
      savedScrollHeight.current = 0;
      savedScrollTop.current = 0;
    }
  }, [dependency, isLoading, containerRef]);
}; 