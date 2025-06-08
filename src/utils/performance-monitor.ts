// **OTIMIZAÇÃO 5: Monitor de performance**
// Para acompanhar o impacto das otimizações implementadas

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  cacheHit?: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100; // Manter só as últimas 100 métricas

  startOperation(operation: string): string {
    const id = `${operation}_${Date.now()}_${Math.random()}`;
    
    this.metrics.push({
      operation: `${operation}:${id}`,
      startTime: performance.now()
    });

    // Limpar métricas antigas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    return id;
  }

  endOperation(operation: string, id: string, cacheHit: boolean = false, error?: string): void {
    const fullOperation = `${operation}:${id}`;
    const metric = this.metrics.find(m => m.operation === fullOperation);
    
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.cacheHit = cacheHit;
      metric.error = error;
    }
  }

  // Estatísticas resumidas
  getStats(operation?: string): {
    totalOperations: number;
    averageDuration: number;
    cacheHitRate: number;
    errorRate: number;
    recentOperations: PerformanceMetric[];
  } {
    let filteredMetrics = this.metrics.filter(m => m.duration !== undefined);
    
    if (operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation.startsWith(operation));
    }

    const totalOperations = filteredMetrics.length;
    const averageDuration = totalOperations > 0 
      ? filteredMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalOperations 
      : 0;
    
    const cacheHits = filteredMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalOperations > 0 ? (cacheHits / totalOperations) * 100 : 0;
    
    const errors = filteredMetrics.filter(m => m.error).length;
    const errorRate = totalOperations > 0 ? (errors / totalOperations) * 100 : 0;

    return {
      totalOperations,
      averageDuration: Math.round(averageDuration * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      recentOperations: filteredMetrics.slice(-10)
    };
  }

  // Log resumo para console (útil para debug)
  logSummary(): void {
    const operations = ['fetchUnreadCounts', 'sendMessage', 'markAsRead', 'loadMessages'];
    
    console.group('📊 Performance Monitor Summary');
    
    operations.forEach(op => {
      const stats = this.getStats(op);
      if (stats.totalOperations > 0) {
        console.log(`${op}:`, {
          ops: stats.totalOperations,
          avgMs: stats.averageDuration,
          cacheHit: `${stats.cacheHitRate}%`,
          errors: `${stats.errorRate}%`
        });
      }
    });
    
    console.groupEnd();
  }

  // Limpar métricas
  clear(): void {
    this.metrics = [];
  }
}

// Instância global
export const perfMonitor = new PerformanceMonitor();

// Wrapper para operações com monitoramento automático
export async function monitoredOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  cacheHit: boolean = false
): Promise<T> {
  const id = perfMonitor.startOperation(operationName);
  
  try {
    const result = await operation();
    perfMonitor.endOperation(operationName, id, cacheHit);
    return result;
  } catch (error) {
    perfMonitor.endOperation(operationName, id, cacheHit, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Auto-log das estatísticas a cada 2 minutos (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  setInterval(() => {
    const stats = perfMonitor.getStats();
    if (stats.totalOperations > 0) {
      perfMonitor.logSummary();
    }
  }, 2 * 60 * 1000);
} 