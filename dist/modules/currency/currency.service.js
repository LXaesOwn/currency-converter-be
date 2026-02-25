"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyService = exports.CurrencyService = void 0;
const currency_repository_1 = require("./currency.repository");
const api_utils_1 = require("../../utils/api.utils");
const cache_utils_1 = require("../../utils/cache.utils");
class CurrencyService {
    constructor() {
        
        this.supportedCurrenciesCache = {
            data: null,
            timestamp: 0,
        };
        this.CACHE_TTL = 60 * 60 * 1000;  
    }
    async getSupportedCurrencies(userId) {
        try {
            
            if (this.supportedCurrenciesCache.data &&
                Date.now() - this.supportedCurrenciesCache.timestamp < this.CACHE_TTL) {
                console.log('Returning currencies from memory cache');
                return this.supportedCurrenciesCache.data;
            }
           
            const cacheKey = cache_utils_1.UserRequestCache.getKey(userId, '/api/currencies');
            const cached = cache_utils_1.UserRequestCache.get(userId, cacheKey);
            if (cached) {
                console.log('Returning currencies from user cache');
                return cached;
            }
            console.log('Fetching currencies from API');
           
            const currencies = await api_utils_1.apiClient.getSupportedCurrencies();
            
            this.supportedCurrenciesCache.data = currencies;
            this.supportedCurrenciesCache.timestamp = Date.now();
            
            cache_utils_1.UserRequestCache.set(userId, cacheKey, currencies, 300);
            return currencies;
        }
        catch (error) {
            console.error('Error in getSupportedCurrencies:', error);
            if (error instanceof api_utils_1.ExternalApiError) {
                
                return ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY'];
            }
            throw error;
        }
    }
    async getRates(userId, base, targets, userBaseCurrency) {
        try {
            console.log('getRates called with:', { userId, base, targets, userBaseCurrency });
            // Валидируем входные параметры
            if (!targets || targets.length === 0) {
                throw new Error('Targets array is required');
            }
            // Валидируем каждый код валюты
            targets.forEach(code => {
                if (!code || code.length !== 3 || !/^[A-Z]{3}$/.test(code)) {
                    throw new Error(`Invalid currency code: ${code}`);
                }
            });
            // Определяем базовую валюту: из параметра или из настроек пользователя
            const effectiveBase = (base || userBaseCurrency || 'USD').toUpperCase();
            console.log('Effective base currency:', effectiveBase);
            // Генерируем ключ для кэша
            const requestKey = `/api/rates?base=${effectiveBase}&targets=${targets.join(',')}`;
            const cacheKey = cache_utils_1.UserRequestCache.getKey(userId, requestKey);
            // Проверяем in-memory кэш (5 минут)
            const cachedResponse = cache_utils_1.UserRequestCache.get(userId, cacheKey);
            if (cachedResponse) {
                console.log('Returning rates from memory cache');
                return cachedResponse;
            }
            // Проверяем кэш в БД (24 часа)
            console.log('Checking database cache');
            const dbCached = await currency_repository_1.currencyRepository.getRatesFromCache(effectiveBase, targets);
            if (dbCached) {
                console.log('Returning rates from database cache');
                // Сохраняем в in-memory кэш
                cache_utils_1.UserRequestCache.set(userId, cacheKey, dbCached, 300);
                return dbCached;
            }
            // Если ничего нет - идем во внешнее API
            console.log('Fetching rates from external API');
            let rates;
            try {
                rates = await api_utils_1.apiClient.getRates(effectiveBase, targets);
            }
            catch (apiError) {
                console.error('External API error, using mock data:', apiError);
                // Возвращаем тестовые данные для демонстрации
                rates = {};
                targets.forEach(target => {
                    if (target === 'USD')
                        rates[target] = 1.0;
                    else if (target === 'EUR')
                        rates[target] = 0.92;
                    else if (target === 'GBP')
                        rates[target] = 0.78;
                    else if (target === 'JPY')
                        rates[target] = 150.45;
                    else if (target === 'CHF')
                        rates[target] = 0.89;
                    else if (target === 'CAD')
                        rates[target] = 1.35;
                    else if (target === 'AUD')
                        rates[target] = 1.52;
                    else if (target === 'CNY')
                        rates[target] = 7.18;
                    else
                        rates[target] = 1.0;
                });
            }
            // Сохраняем в оба кэша
            try {
                await currency_repository_1.currencyRepository.saveRatesToCache(effectiveBase, targets, rates);
            }
            catch (dbError) {
                console.error('Failed to save to database cache:', dbError);
                // Продолжаем даже если не удалось сохранить в БД
            }
            cache_utils_1.UserRequestCache.set(userId, cacheKey, rates, 300);
            return rates;
        }
        catch (error) {
            console.error('Error in getRates:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to get rates: ${error.message}`);
            }
            throw new Error('Failed to get rates');
        }
    }
}
exports.CurrencyService = CurrencyService;
exports.currencyService = new CurrencyService();
