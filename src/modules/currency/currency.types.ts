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


export const ratesQuerySchema = z.object({
  base: z.string().length(3).optional(),
  targets: z.string().transform((str) => {
    
    return str.split(',').map(s => s.trim().toUpperCase());
  }),
});

export const currencyCodeSchema = z.string().length(3).regex(/^[A-Z]{3}$/);