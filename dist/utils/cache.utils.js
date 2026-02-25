"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRequestCache = exports.InMemoryCache = void 0;
const memory_cache_1 = __importDefault(require("memory-cache"));
// Кэш в памяти для повторяющихся запросов (5 минут)
class InMemoryCache {
    constructor() {
        this.cache = memory_cache_1.default;
    }
    static getInstance() {
        if (!InMemoryCache.instance) {
            InMemoryCache.instance = new InMemoryCache();
        }
        return InMemoryCache.instance;
    }
    // Сохранить с TTL в секундах
    set(key, value, ttlSeconds = 300) {
        this.cache.put(key, value, ttlSeconds * 1000);
    }
    // Получить по ключу
    get(key) {
        return this.cache.get(key);
    }
    // Удалить
    del(key) {
        this.cache.del(key);
    }
    // Очистить всё
    clear() {
        this.cache.clear();
    }
}
exports.InMemoryCache = InMemoryCache;
// Кэширование повторяющихся запросов от одного пользователя
class UserRequestCache {
    static getKey(userId, url) {
        return `user:${userId}:${url}`;
    }
    static set(userId, url, data, ttlSeconds = 300) {
        const key = this.getKey(userId, url);
        this.cache.set(key, data, ttlSeconds);
    }
    static get(userId, url) {
        const key = this.getKey(userId, url);
        return this.cache.get(key);
    }
}
exports.UserRequestCache = UserRequestCache;
UserRequestCache.cache = InMemoryCache.getInstance();
