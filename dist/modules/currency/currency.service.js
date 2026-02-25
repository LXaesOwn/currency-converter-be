"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyService = exports.CurrencyService = void 0;
const currency_repository_1 = require("./currency.repository");
const api_utils_1 = require("../../utils/api.utils");
const cache_utils_1 = require("../../utils/cache.utils");
const currency_types_1 = require("./currency.types");
const zod_1 = require("zod");
class CurrencyService {
    constructor() {
        // Список поддерживаемых валют (кэшируется в памяти на 1 час)
        this.supportedCurrenciesCache = {
            data: null,
            timestamp: 0,
        };
        this.CACHE_TTL = 60 * 60 * 1000; // 1 час в миллисекундах
    }
    async getSupportedCurrencies(userId) {
        // Проверяем кэш в памяти (для всех пользователей)
        if (this.supportedCurrenciesCache.data &&
            Date.now() - this.supportedCurrenciesCache.timestamp < this.CACHE_TTL) {
            return this.supportedCurrenciesCache.data;
        }
        // Проверяем in-memory кэш для этого пользователя (5 минут)
        const cacheKey = cache_utils_1.UserRequestCache.getKey(userId, '/api/currencies');
        const cached = cache_utils_1.UserRequestCache.get(userId, cacheKey);
        if (cached) {
            return cached;
        }
        try {
            // Получаем из внешнего API
            const currencies = await api_utils_1.apiClient.getSupportedCurrencies();
            // Сохраняем в общий кэш
            this.supportedCurrenciesCache.data = currencies;
            this.supportedCurrenciesCache.timestamp = Date.now();
            // Сохраняем в пользовательский кэш
            cache_utils_1.UserRequestCache.set(userId, cacheKey, currencies, 300);
            return currencies;
        }
        catch (error) {
            if (error instanceof api_utils_1.ExternalApiError) {
                throw new Error('Currency API temporarily unavailable');
            }
            throw error;
        }
    }
    async getRates(userId, base, targets, userBaseCurrency) {
        // Валидируем входные параметры
        try {
            currency_types_1.ratesQuerySchema.parse({ base, targets });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new Error('Invalid currency codes');
            }
        }
        // Определяем базовую валюту: из параметра или из настроек пользователя
        const effectiveBase = base || userBaseCurrency || 'USD';
        // Генерируем ключ для кэша
        const requestKey = `/api/rates?base=${effectiveBase}&targets=${targets.join(',')}`;
        const cacheKey = cache_utils_1.UserRequestCache.getKey(userId, requestKey);
        // Проверяем in-memory кэш (5 минут)
        const cachedResponse = cache_utils_1.UserRequestCache.get(userId, cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Проверяем кэш в БД (24 часа)
        const dbCached = await currency_repository_1.currencyRepository.getRatesFromCache(effectiveBase, targets);
        if (dbCached) {
            // Сохраняем в in-memory кэш
            cache_utils_1.UserRequestCache.set(userId, cacheKey, dbCached, 300);
            return dbCached;
        }
        // Если ничего нет - идем во внешнее API
        try {
            const rates = await api_utils_1.apiClient.getRates(effectiveBase, targets);
            // Сохраняем в оба кэша
            await currency_repository_1.currencyRepository.saveRatesToCache(effectiveBase, targets, rates);
            cache_utils_1.UserRequestCache.set(userId, cacheKey, rates, 300);
            return rates;
        }
        catch (error) {
            if (error instanceof api_utils_1.ExternalApiError) {
                throw new Error('Currency rates temporarily unavailable');
            }
            throw error;
        }
    }
}
exports.CurrencyService = CurrencyService;
exports.currencyService = new CurrencyService();
