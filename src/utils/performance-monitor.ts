// **OTIMIZAÇÃO 5: Monitor de performance**
// Para acompanhar o impacto das otimizações implementadas

interface PerformanceMetrics {
  operationName: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Limitar a 1000 métricas na memória

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Limitar o tamanho do array
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getAverageTime(operationName: string): number {
    const operationMetrics = this.metrics.filter(m => m.operationName === operationName && m.success);
    if (operationMetrics.length === 0) return 0;
    
    const totalTime = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / operationMetrics.length;
  }

  getSuccessRate(operationName: string): number {
    const operationMetrics = this.metrics.filter(m => m.operationName === operationName);
    if (operationMetrics.length === 0) return 100;
    
    const successCount = operationMetrics.filter(m => m.success).length;
    return (successCount / operationMetrics.length) * 100;
  }

  getRecentErrors(operationName?: string, limit: number = 10): PerformanceMetrics[] {
    let errorMetrics = this.metrics.filter(m => !m.success);
    
    if (operationName) {
      errorMetrics = errorMetrics.filter(m => m.operationName === operationName);
    }
    
    return errorMetrics
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getMetricsSummary(): Record<string, { avgTime: number; successRate: number; count: number }> {
    const operations = ['sendMessage', 'loadMessages'];
    const summary: Record<string, { avgTime: number; successRate: number; count: number }> = {};
    
    operations.forEach(op => {
      const operationMetrics = this.metrics.filter(m => m.operationName === op);
      summary[op] = {
        avgTime: this.getAverageTime(op),
        successRate: this.getSuccessRate(op),
        count: operationMetrics.length
      };
    });
    
    return summary;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Log das métricas no console (para debug)
  logSummary(): void {
    const summary = this.getMetricsSummary();
    console.table(summary);
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor();

// Função wrapper para monitorar operações async
export async function monitoredOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    performanceMonitor.addMetric({
      operationName,
      duration,
      timestamp: Date.now(),
      success: true
    });
    
    // Log operações lentas
    if (duration > 1000) {
      console.warn(`⚠️ Operação lenta detectada: ${operationName} levou ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.addMetric({
      operationName,
      duration,
      timestamp: Date.now(),
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
}

// Debug: Expor métricas no console em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).performanceMonitor = performanceMonitor;
} 