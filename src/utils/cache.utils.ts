import cache from 'memory-cache';

// Кэш в памяти для повторяющихся запросов (5 минут)
export class InMemoryCache {
  private static instance: InMemoryCache;
  private cache = cache;

  private constructor() {}

  static getInstance(): InMemoryCache {
    if (!InMemoryCache.instance) {
      InMemoryCache.instance = new InMemoryCache();
    }
    return InMemoryCache.instance;
  }

  // Сохранить с TTL в секундах
  set(key: string, value: any, ttlSeconds: number = 300): void {
    this.cache.put(key, value, ttlSeconds * 1000);
  }

  // Получить по ключу
  get(key: string): any {
    return this.cache.get(key);
  }

  // Удалить
  del(key: string): void {
    this.cache.del(key);
  }

  // Очистить всё
  clear(): void {
    this.cache.clear();
  }
}

// Кэширование повторяющихся запросов от одного пользователя
export class UserRequestCache {
  private static cache = InMemoryCache.getInstance();

  static getKey(userId: string, url: string): string {
    return `user:${userId}:${url}`;
  }

  static set(userId: string, url: string, data: any, ttlSeconds: number = 300): void {
    const key = this.getKey(userId, url);
    this.cache.set(key, data, ttlSeconds);
  }

  static get(userId: string, url: string): any {
    const key = this.getKey(userId, url);
    return this.cache.get(key);
  }
}