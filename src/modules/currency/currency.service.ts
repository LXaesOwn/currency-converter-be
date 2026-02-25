import { currencyRepository } from './currency.repository';
import { apiClient, ExternalApiError } from '../../utils/api.utils';
import { UserRequestCache } from '../../utils/cache.utils';
import { ratesQuerySchema } from './currency.types';
import { ZodError } from 'zod';

export class CurrencyService {
  // Список поддерживаемых валют (кэшируется в памяти на 1 час)
  private supportedCurrenciesCache: { data: string[] | null; timestamp: number } = {
    data: null,
    timestamp: 0,
  };
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 час в миллисекундах

  async getSupportedCurrencies(userId: string): Promise<string[]> {
    // Проверяем кэш в памяти (для всех пользователей)
    if (
      this.supportedCurrenciesCache.data &&
      Date.now() - this.supportedCurrenciesCache.timestamp < this.CACHE_TTL
    ) {
      return this.supportedCurrenciesCache.data;
    }

    // Проверяем in-memory кэш для этого пользователя (5 минут)
    const cacheKey = UserRequestCache.getKey(userId, '/api/currencies');
    const cached = UserRequestCache.get(userId, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Получаем из внешнего API
      const currencies = await apiClient.getSupportedCurrencies();
      
      // Сохраняем в общий кэш
      this.supportedCurrenciesCache.data = currencies;
      this.supportedCurrenciesCache.timestamp = Date.now();
      
      // Сохраняем в пользовательский кэш
      UserRequestCache.set(userId, cacheKey, currencies, 300);
      
      return currencies;
    } catch (error) {
      if (error instanceof ExternalApiError) {
        throw new Error('Currency API temporarily unavailable');
      }
      throw error;
    }
  }

  async getRates(
    userId: string,
    base: string,
    targets: string[],
    userBaseCurrency?: string
  ): Promise<Record<string, number>> {
    // Валидируем входные параметры
    try {
      ratesQuerySchema.parse({ base, targets });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error('Invalid currency codes');
      }
    }

    // Определяем базовую валюту: из параметра или из настроек пользователя
    const effectiveBase = base || userBaseCurrency || 'USD';

    // Генерируем ключ для кэша
    const requestKey = `/api/rates?base=${effectiveBase}&targets=${targets.join(',')}`;
    const cacheKey = UserRequestCache.getKey(userId, requestKey);
    
    // Проверяем in-memory кэш (5 минут)
    const cachedResponse = UserRequestCache.get(userId, cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Проверяем кэш в БД (24 часа)
    const dbCached = await currencyRepository.getRatesFromCache(effectiveBase, targets);
    if (dbCached) {
      // Сохраняем в in-memory кэш
      UserRequestCache.set(userId, cacheKey, dbCached, 300);
      return dbCached;
    }

    // Если ничего нет - идем во внешнее API
    try {
      const rates = await apiClient.getRates(effectiveBase, targets);
      
      // Сохраняем в оба кэша
      await currencyRepository.saveRatesToCache(effectiveBase, targets, rates);
      UserRequestCache.set(userId, cacheKey, rates, 300);
      
      return rates;
    } catch (error) {
      if (error instanceof ExternalApiError) {
        throw new Error('Currency rates temporarily unavailable');
      }
      throw error;
    }
  }
}

export const currencyService = new CurrencyService();