import { supabase } from '../../config/database';

export interface CachedRates {
  cache_key: string;
  base_currency: string;
  rates: Record<string, number>;
  updated_at: string;
}

export class CurrencyRepository {
  async findRatesByKey(cacheKey: string): Promise<CachedRates | null> {
    const { data, error } = await supabase
      .from('exchange_rates_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async upsertRates(cacheKey: string, base: string, rates: Record<string, number>): Promise<void> {
    const { error } = await supabase
      .from('exchange_rates_cache')
      .upsert({
        cache_key: cacheKey,
        base_currency: base,
        rates: rates,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}