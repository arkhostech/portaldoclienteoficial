// **OTIMIZAÇÃO 4: Sistema de cache com TTL**
// Para reduzir consultas frequentes ao banco de dados

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidar cache relacionado a uma conversa
  invalidateConversation(conversationId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(conversationId) || key.includes('unread_counts')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Estatísticas para debug
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância global do cache
export const chatCache = new SimpleCache();

// Auto-cleanup a cada 5 minutos
setInterval(() => {
  chatCache.cleanup();
}, 5 * 60 * 1000);

// Chaves de cache padronizadas
export const CACHE_KEYS = {
  UNREAD_COUNTS: (userId: string) => `unread_counts_${userId}`,
  CONVERSATIONS: (userId: string, isAdmin: boolean) => `conversations_${userId}_${isAdmin}`,
  MESSAGES: (conversationId: string, page: number = 0) => `messages_${conversationId}_${page}`,
  MESSAGE_COUNT: (conversationId: string) => `message_count_${conversationId}`
} as const;

// TTL padrões (em milliseconds)
export const CACHE_TTL = {
  UNREAD_COUNTS: 120000, // 2 minutos (otimizado)
  CONVERSATIONS: 120000, // 2 minutos  
  MESSAGES: 180000, // 3 minutos
  MESSAGE_COUNT: 120000 // 2 minutos
} as const; 