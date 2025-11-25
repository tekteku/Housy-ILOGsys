/**
 * Service de cache optimisé pour les performances
 * Améliore la rapidité d'accès aux données
 */

import { LRUCache } from 'lru-cache';

interface CacheOptions {
  maxSize: number;
  ttl: number; // Time to live en millisecondes
}

class OptimizedCacheService {
  private static instance: OptimizedCacheService;
  private dataCache: LRUCache<string, any>;
  private queryCache: LRUCache<string, any>;
  private estimationCache: LRUCache<string, any>;

  private constructor() {
    // Cache pour les données JSON (très long TTL)
    this.dataCache = new LRUCache({
      max: 100,
      ttl: 30 * 60 * 1000, // 30 minutes
    });

    // Cache pour les requêtes IA (TTL moyen)
    this.queryCache = new LRUCache({
      max: 1000,
      ttl: 10 * 60 * 1000, // 10 minutes
    });

    // Cache pour les estimations (TTL court)
    this.estimationCache = new LRUCache({
      max: 500,
      ttl: 5 * 60 * 1000, // 5 minutes
    });
  }

  static getInstance(): OptimizedCacheService {
    if (!OptimizedCacheService.instance) {
      OptimizedCacheService.instance = new OptimizedCacheService();
    }
    return OptimizedCacheService.instance;
  }

  // Cache des données JSON
  cacheData(key: string, data: any): void {
    this.dataCache.set(key, data);
  }

  getData(key: string): any | undefined {
    return this.dataCache.get(key);
  }

  // Cache des requêtes IA
  cacheQuery(query: string, response: any): void {
    const key = this.hashQuery(query);
    this.queryCache.set(key, response);
  }

  getQueryResponse(query: string): any | undefined {
    const key = this.hashQuery(query);
    return this.queryCache.get(key);
  }

  // Cache des estimations
  cacheEstimation(params: string, estimation: any): void {
    this.estimationCache.set(params, estimation);
  }

  getEstimation(params: string): any | undefined {
    return this.estimationCache.get(params);
  }

  // Nettoyage du cache
  clearCache(type: 'data' | 'query' | 'estimation' | 'all' = 'all'): void {
    switch (type) {
      case 'data':
        this.dataCache.clear();
        break;
      case 'query':
        this.queryCache.clear();
        break;
      case 'estimation':
        this.estimationCache.clear();
        break;
      case 'all':
        this.dataCache.clear();
        this.queryCache.clear();
        this.estimationCache.clear();
        break;
    }
  }

  // Hash pour les requêtes
  private hashQuery(query: string): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Statistiques du cache
  getCacheStats(): {
    data: { size: number; calculatedSize: number };
    query: { size: number; calculatedSize: number };
    estimation: { size: number; calculatedSize: number };
  } {
    return {
      data: {
        size: this.dataCache.size,
        calculatedSize: this.dataCache.calculatedSize || 0
      },
      query: {
        size: this.queryCache.size,
        calculatedSize: this.queryCache.calculatedSize || 0
      },
      estimation: {
        size: this.estimationCache.size,
        calculatedSize: this.estimationCache.calculatedSize || 0
      }
    };
  }
}

export const optimizedCache = OptimizedCacheService.getInstance();
