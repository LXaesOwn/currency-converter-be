import { apiClient } from '../../utils/api.utils';
import { CacheUtils } from '../../utils/cache.utils';
import { CurrencyRepository } from './currency.repository';
import { CurrencyRateSchema, SUPPORTED_CURRENCIES } from './currency.types';
import { 
  CACHE_IN_MEMORY_TTL, 
  CACHE_DB_TTL_HOURS, 
  CACHE_KEYS 
} from '../../config/env';

export class CurrencyService {
  constructor(private currencyRepository: CurrencyRepository) {}

  async getSupportedCurrencies(): Promise<string[]> {
    const cacheKey = `${CACHE_KEYS.CURRENCIES}:static`;
    
    const cached = CacheUtils.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    CacheUtils.set(cacheKey, SUPPORTED_CURRENCIES, 3600);
    return [...SUPPORTED_CURRENCIES];
  }

  async getRates(
    userId: string, 
    base: string = 'USD', 
    targets: string[] = []
  ): Promise<Record<string, number>> {
    const sortedTargets = [...targets].sort();
    const targetsKey = sortedTargets.join('_');
    
    const inMemoryKey = `${CACHE_KEYS.USER}:${userId}:${CACHE_KEYS.RATES}:${base}:${targetsKey}`;
    const dbCacheKey = `${CACHE_KEYS.RATES}:${base}:${targetsKey}`;
    const inMemoryRates = CacheUtils.get<Record<string, number>>(inMemoryKey);
    if (inMemoryRates) {
      return inMemoryRates;
    }
    const dbRates = await this.currencyRepository.findRatesByKey(dbCacheKey);
    
    if (dbRates) {
      const dbAge = (Date.now() - new Date(dbRates.updated_at).getTime()) / 1000 / 3600;
      if (dbAge < CACHE_DB_TTL_HOURS) {
        CacheUtils.set(inMemoryKey, dbRates.rates, CACHE_IN_MEMORY_TTL);
        return dbRates.rates;
      }
    }
    try {
      const response = await apiClient.get('/latest', {
        params: {
          base,
          symbols: sortedTargets.join(',')
        }
      });

      const validatedRates = CurrencyRateSchema.parse(response.data);

      await this.currencyRepository.upsertRates(
        dbCacheKey,
        base,
        validatedRates.rates
      );

      CacheUtils.set(inMemoryKey, validatedRates.rates, CACHE_IN_MEMORY_TTL);

      return validatedRates.rates;
    } catch (error) {
      throw new Error('Exchange rate API is unavailable. Please try again later.');
    }
  }
}
export const currencyService = new CurrencyService(new CurrencyRepository());