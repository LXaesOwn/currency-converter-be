import { z } from 'zod';

export interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  date?: string;
}

export interface CachedRates {
  cache_key: string;
  rates: Record<string, number>;
  base_currency: string;
  updated_at: string;
}

// Схема валидации для запроса rates
export const ratesQuerySchema = z.object({
  base: z.string().length(3).optional(),
  targets: z.string().transform((str) => {
    // Разделяем по запятой и удаляем пробелы
    return str.split(',').map(s => s.trim().toUpperCase());
  }),
});

// Схема для проверки кодов валют
export const currencyCodeSchema = z.string().length(3).regex(/^[A-Z]{3}$/);