import cache from 'memory-cache';

export class CacheUtils {
  static get<T>(key: string): T | null {
    return cache.get(key);
  }

  static set(key: string, value: any, ttlSeconds: number): void {
    cache.put(key, value, ttlSeconds * 1000); 
  }

  static del(key: string): void {
    cache.del(key);
  }

  static clear(): void {
    cache.clear();
  }
}