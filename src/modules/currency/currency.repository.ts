import { supabase } from '../../config/database';
import { CachedRates } from './currency.types';

export class CurrencyRepository {
  // Сохраняем курсы в кэш БД на 24 часа
  async saveRatesToCache(base: string, targets: string[], rates: Record<string, number>): Promise<void> {
    const cacheKey = this.generateCacheKey(base, targets);
    const now = new Date().toISOString();

    const { error } = await supabase
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

    if (error) throw error;
  }

  // Получаем курсы из кэша, если они не старше 24 часов
  async getRatesFromCache(base: string, targets: string[]): Promise<Record<string, number> | null> {
    const cacheKey = this.generateCacheKey(base, targets);
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('exchange_rates_cache')
      .select('rates')
      .eq('cache_key', cacheKey)
      .gte('updated_at', oneDayAgo.toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data.rates as Record<string, number>;
  }

  private generateCacheKey(base: string, targets: string[]): string {
    // Сортируем targets, чтобы ключ был одинаковым независимо от порядка
    const sortedTargets = [...targets].sort().join('_');
    return `rates_${base}_${sortedTargets}`;
  }
}

export const currencyRepository = new CurrencyRepository();