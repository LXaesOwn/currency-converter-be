"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyRepository = exports.CurrencyRepository = void 0;
const database_1 = require("../../config/database");
class CurrencyRepository {
    // Сохраняем курсы в кэш БД на 24 часа
    async saveRatesToCache(base, targets, rates) {
        const cacheKey = this.generateCacheKey(base, targets);
        const now = new Date().toISOString();
        const { error } = await database_1.supabase
            .from('exchange_rates_cache')
            .upsert({
            cache_key: cacheKey,
            base_currency: base,
            rates,
            updated_at: now,
            created_at: now,
        }, {
            onConflict: 'cache_key',
        });
        if (error)
            throw error;
    }
    // Получаем курсы из кэша, если они не старше 24 часов
    async getRatesFromCache(base, targets) {
        const cacheKey = this.generateCacheKey(base, targets);
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        const { data, error } = await database_1.supabase
            .from('exchange_rates_cache')
            .select('rates')
            .eq('cache_key', cacheKey)
            .gte('updated_at', oneDayAgo.toISOString())
            .single();
        if (error || !data) {
            return null;
        }
        return data.rates;
    }
    generateCacheKey(base, targets) {
        // Сортируем targets, чтобы ключ был одинаковым независимо от порядка
        const sortedTargets = [...targets].sort().join('_');
        return `rates_${base}_${sortedTargets}`;
    }
}
exports.CurrencyRepository = CurrencyRepository;
exports.currencyRepository = new CurrencyRepository();
